import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { calculateBaseWeeks, calculatePackageTimelines, generateBaseMilestones } from '@/lib/calculateTimeline';
import { buildPrompt } from '@/lib/generateNarrative';
import { FormData, Package, TimelineResult, GoalType, ExperienceLevel, TrainerSpecialty, ServiceAddOn, CustomQuestion } from '@/types';
import Anthropic from '@anthropic-ai/sdk';
import { sendNewLeadEmail } from '@/lib/email';

interface RequestBody {
  trainerId: string;
  // Client-supplied trainer metadata is ignored in favour of the DB values —
  // keeping the shape for backwards compatibility with the existing caller.
  trainerName?: string;
  trainerBio?: string | null;
  trainerSpecialties?: TrainerSpecialty[] | null;
  trainerTone?: string;
  serviceAddOns?: ServiceAddOn[];
  customQuestions?: CustomQuestion[];
  formId: string | null;
  formData: FormData;
  packages: Package[];
}

// --- In-memory rate limiter (per server instance) ---
// Good enough for single-region deploys; swap for Upstash/Redis if you start
// running multiple concurrent workers.
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 8; // 8 submissions per IP per minute
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

function getClientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  const real = req.headers.get('x-real-ip');
  if (real) return real;
  return 'unknown';
}

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const bucket = rateBuckets.get(ip);
  if (!bucket || bucket.resetAt <= now) {
    rateBuckets.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true };
  }
  if (bucket.count >= RATE_LIMIT_MAX) {
    return { allowed: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  bucket.count += 1;
  return { allowed: true };
}

// Opportunistically prune old buckets so the Map doesn't grow unbounded.
function pruneBuckets() {
  if (rateBuckets.size < 500) return;
  const now = Date.now();
  for (const [ip, bucket] of rateBuckets) {
    if (bucket.resetAt <= now) rateBuckets.delete(ip);
  }
}

// --- Input clamping to contain prompt-injection / cost blowups ---
const MAX_STR = 500;
const MAX_QUESTIONS = 30;
const MAX_ANSWERS = 40;
const MAX_ADDONS = 20;
const MAX_PACKAGES = 20;

function clampString(s: unknown, max = MAX_STR): string {
  if (typeof s !== 'string') return '';
  return s.slice(0, max);
}

function clampArray<T>(arr: T[] | null | undefined, max: number): T[] {
  if (!Array.isArray(arr)) return [];
  return arr.slice(0, max);
}

function clampAnswers(obj: Record<string, string | string[]> | undefined): Record<string, string | string[]> {
  if (!obj || typeof obj !== 'object') return {};
  const out: Record<string, string | string[]> = {};
  let count = 0;
  for (const [k, v] of Object.entries(obj)) {
    if (count >= MAX_ANSWERS) break;
    const key = clampString(k, 100);
    if (Array.isArray(v)) {
      out[key] = v.slice(0, 20).map((x) => clampString(x));
    } else {
      out[key] = clampString(v);
    }
    count += 1;
  }
  return out;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Rate limit
    const ip = getClientIp(request);
    const rl = checkRateLimit(ip);
    pruneBuckets();
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many submissions. Please wait a moment and try again.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter ?? 60) } },
      );
    }

    // 2. Parse + basic shape validation
    const body: RequestBody = await request.json();
    const { trainerId, formId, formData, packages: clientPackages } = body;

    if (!trainerId || typeof trainerId !== 'string') {
      return NextResponse.json({ error: 'Missing trainerId' }, { status: 400 });
    }
    if (!formData || !formData.goalType || !formData.experienceLevel) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (!formData.name || !formData.phone) {
      return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 });
    }

    // 3. Fetch trainer server-side — source of truth for name/bio/tone/etc.
    const supabase = getServiceClient();
    const { data: trainer, error: trainerErr } = await supabase
      .from('trainers')
      .select('id, name, bio, specialties, copy, services, custom_questions, active, user_id, slug')
      .eq('id', trainerId)
      .maybeSingle();

    if (trainerErr || !trainer) {
      return NextResponse.json({ error: 'Trainer not found' }, { status: 404 });
    }
    if (trainer.active === false) {
      return NextResponse.json({ error: 'This form is no longer accepting submissions' }, { status: 403 });
    }

    // Use DB values for anything that gets fed to the LLM prompt. This blocks
    // a malicious client from injecting arbitrary text via trainerBio/tone etc.
    const trainerName: string = trainer.name;
    const trainerBio: string | null = trainer.bio ?? null;

    // When a per-goal form exists, its overrides take priority over the
    // trainer-level defaults. Fetch it server-side so we trust the DB, not
    // the client payload.
    let trainerSpecialties: TrainerSpecialty[] | null = trainer.specialties ?? null;
    let trainerTone: string = clampString(trainer.copy?.tone || 'friendly', 100);
    let serviceAddOns: ServiceAddOn[] = clampArray(trainer.services?.add_ons ?? [], MAX_ADDONS);
    let customQuestions: CustomQuestion[] = clampArray(trainer.custom_questions ?? [], MAX_QUESTIONS);

    if (formId) {
      const { data: form } = await supabase
        .from('forms')
        .select('specialties, copy, services, questions')
        .eq('id', formId)
        .eq('trainer_id', trainerId)
        .maybeSingle();

      if (form) {
        if (form.specialties) trainerSpecialties = form.specialties;
        if (form.copy?.tone) trainerTone = clampString(form.copy.tone, 100);
        if (form.services?.add_ons) serviceAddOns = clampArray(form.services.add_ons, MAX_ADDONS);
        if (form.questions) customQuestions = clampArray(form.questions, MAX_QUESTIONS);
      }
    }

    // Packages drive the timeline comparison shown to the lead. Cap the count
    // but keep the client-provided list — they're already filtered per-form
    // client-side and nothing from them is fed to the AI prompt.
    const packages: Package[] = clampArray(clientPackages, MAX_PACKAGES);

    // 4. Clamp lead-provided text so it can't bloat the prompt.
    const safeFormData: FormData = {
      ...formData,
      name: clampString(formData.name, 120),
      phone: clampString(formData.phone, 40),
      performanceTarget: clampString(formData.performanceTarget, 200),
      customAnswers: clampAnswers(formData.customAnswers),
      customAboutFields: clampAnswers(formData.customAboutFields) as Record<string, string>,
    };

    // 5. Compute the deterministic timeline
    const calcInput = {
      goalType: safeFormData.goalType as GoalType,
      currentWeightKg: safeFormData.currentWeight,
      goalWeightKg: safeFormData.goalWeight,
      age: safeFormData.age,
      experienceLevel: safeFormData.experienceLevel as ExperienceLevel,
      availableDays: safeFormData.availableDays,
      performanceTarget: safeFormData.performanceTarget,
    };

    const estimatedWeeks = calculateBaseWeeks(calcInput);
    const packageComparisons = calculatePackageTimelines(calcInput, packages);
    const baseMilestones = generateBaseMilestones(safeFormData.goalType as GoalType, estimatedWeeks);

    // 6. Personalised fallback narrative using client name
    let summary = `${safeFormData.name}, based on your profile, reaching your goal will take approximately ${estimatedWeeks} weeks with consistent effort and ${trainerName}'s guidance.`;
    let narrative = `${safeFormData.name}, your journey to ${safeFormData.goalType === 'weight_loss' ? 'a leaner you' : safeFormData.goalType === 'muscle_gain' ? 'a stronger physique' : 'better fitness'} starts now. Training ${safeFormData.availableDays} days per week as a ${safeFormData.experienceLevel}, you can expect steady, sustainable progress over the next ${estimatedWeeks} weeks. ${trainerName} will keep you accountable every step of the way — stay consistent and trust the process.`;
    let milestones = baseMilestones;

    // 7. Optional AI narrative — only runs after validation above
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
        const prompt = buildPrompt({
          trainerName,
          trainerBio,
          trainerSpecialties,
          trainerTone,
          serviceAddOns,
          customAnswers: safeFormData.customAnswers,
          customAboutFields: safeFormData.customAboutFields,
          customQuestions,
          clientName: safeFormData.name,
          goalType: safeFormData.goalType as GoalType,
          currentWeightKg: safeFormData.currentWeight,
          goalWeightKg: safeFormData.goalWeight,
          age: safeFormData.age,
          experienceLevel: safeFormData.experienceLevel as ExperienceLevel,
          availableDays: safeFormData.availableDays,
          estimatedWeeks,
          performanceTarget: safeFormData.performanceTarget,
        });

        const message = await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          messages: [{ role: 'user', content: prompt }],
        });

        const textBlock = message.content.find((b) => b.type === 'text');
        if (textBlock && textBlock.type === 'text') {
          const parsed = JSON.parse(textBlock.text);
          summary = parsed.summary || summary;
          narrative = parsed.narrative || narrative;
          milestones = parsed.milestones || milestones;
        }
      } catch (aiError) {
        console.error('AI generation failed, using fallback:', aiError);
      }
    }

    const timelineResult: TimelineResult = {
      estimatedWeeks,
      summary,
      milestones,
      packageComparisons,
      narrative,
    };

    // 8. Persist lead
    const { data: leadData, error: dbError } = await supabase.from('leads').insert({
      trainer_id: trainerId,
      name: safeFormData.name,
      email: null,
      phone: safeFormData.phone,
      goal_type: safeFormData.goalType,
      current_weight_kg: safeFormData.currentWeight,
      goal_weight_kg: safeFormData.goalWeight,
      age: safeFormData.age,
      experience_level: safeFormData.experienceLevel,
      available_days_per_week: safeFormData.availableDays,
      custom_answers: {
        ...(safeFormData.customAboutFields && Object.keys(safeFormData.customAboutFields).length > 0 ? safeFormData.customAboutFields : {}),
        ...(safeFormData.customAnswers && Object.keys(safeFormData.customAnswers).length > 0 ? safeFormData.customAnswers : {}),
      },
      form_id: formId || null,
      generated_timeline: timelineResult,
    }).select('id').single();

    if (dbError) {
      console.error('Database error:', dbError);
    }

    // 9. Notify the coach by email — fire-and-forget so we don't block the
    // response on email delivery. Internal failures are swallowed inside
    // sendNewLeadEmail.
    if (trainer.user_id) {
      const { data: authUser } = await supabase.auth.admin.getUserById(trainer.user_id);
      const coachEmail = authUser?.user?.email;
      if (coachEmail) {
        const goalLabels: Record<string, string> = {
          weight_loss: 'Lose weight',
          muscle_gain: 'Build muscle',
          fitness: 'Improve fitness',
          performance: safeFormData.performanceTarget || 'Performance goal',
        };
        const goalLabel = goalLabels[safeFormData.goalType as string] || 'reach their goal';
        const { origin } = new URL(request.url);
        void sendNewLeadEmail({
          to: coachEmail,
          trainerName,
          lead: safeFormData,
          goalLabel,
          timeline: timelineResult,
          dashboardUrl: `${origin}/dashboard`,
        });
      }
    }

    return NextResponse.json({
      ...timelineResult,
      leadId: leadData?.id || null,
    });
  } catch (error) {
    console.error('Submit lead error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
