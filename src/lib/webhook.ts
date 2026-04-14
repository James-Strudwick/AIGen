import { FormData, TimelineResult, Trainer } from '@/types';

export interface LeadWebhookPayload {
  event: 'lead.created';
  timestamp: string;
  trainer: {
    id: string;
    name: string;
    slug: string;
  };
  form: {
    id: string;
    goalId: string;
    name: string;
  } | null;
  lead: {
    id: string | null;
    name: string;
    phone: string;
    goal: string;
    goalType: string | null;
    performanceTarget: string;
    age: number | null;
    currentWeightKg: number | null;
    goalWeightKg: number | null;
    experienceLevel: string | null;
    availableDaysPerWeek: number;
    estimatedWeeks: number;
    bestPackage: string | null;
    customAnswers: Record<string, string | string[]>;
    customAboutFields: Record<string, string>;
  };
}

interface BuildPayloadInput {
  trainer: Pick<Trainer, 'id' | 'name' | 'slug'>;
  form: { id: string; goal_id: string; name: string } | null;
  leadId: string | null;
  formData: FormData;
  goalLabel: string;
  timeline: TimelineResult;
}

export function buildLeadWebhookPayload(input: BuildPayloadInput): LeadWebhookPayload {
  const { trainer, form, leadId, formData, goalLabel, timeline } = input;
  const best = timeline.packageComparisons.find(p => p.isBestValue);
  return {
    event: 'lead.created',
    timestamp: new Date().toISOString(),
    trainer: {
      id: trainer.id,
      name: trainer.name,
      slug: trainer.slug,
    },
    form: form ? { id: form.id, goalId: form.goal_id, name: form.name } : null,
    lead: {
      id: leadId,
      name: formData.name,
      phone: formData.phone,
      goal: goalLabel,
      goalType: formData.goalType,
      performanceTarget: formData.performanceTarget ?? '',
      age: formData.age,
      currentWeightKg: formData.currentWeight,
      goalWeightKg: formData.goalWeight,
      experienceLevel: formData.experienceLevel,
      availableDaysPerWeek: formData.availableDays,
      estimatedWeeks: timeline.estimatedWeeks,
      bestPackage: best?.packageName ?? null,
      customAnswers: formData.customAnswers ?? {},
      customAboutFields: formData.customAboutFields ?? {},
    },
  };
}

/**
 * Fire a lead webhook to the coach's configured URL. Fire-and-forget —
 * any failure is logged but never thrown, because the lead must be saved
 * and the prospect's timeline shown regardless of webhook status.
 *
 * 5-second timeout so a slow/dead receiver can't stall the response.
 */
export async function sendLeadWebhook(url: string, payload: LeadWebhookPayload): Promise<void> {
  if (!url || !/^https?:\/\//i.test(url)) return;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'FomoForms-Webhook/1.0',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!res.ok) {
      console.warn(`[webhook] ${url} responded ${res.status}`);
    }
  } catch (err) {
    console.error('[webhook] send failed:', err);
  } finally {
    clearTimeout(timeout);
  }
}
