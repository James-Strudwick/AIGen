import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { calculateBaseWeeks, calculatePackageTimelines, generateBaseMilestones } from '@/lib/calculateTimeline';
import { buildPrompt } from '@/lib/generateNarrative';
import { FormData, Package, TimelineResult, GoalType, ExperienceLevel, TrainerSpecialty, ServiceAddOn, CustomQuestion } from '@/types';
import Anthropic from '@anthropic-ai/sdk';

interface RequestBody {
  trainerId: string;
  trainerName: string;
  trainerBio: string | null;
  trainerSpecialties: TrainerSpecialty[] | null;
  trainerTone: string;
  serviceAddOns: ServiceAddOn[];
  customQuestions: CustomQuestion[];
  formData: FormData;
  packages: Package[];
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const {
      trainerId, trainerName, trainerBio, trainerSpecialties,
      trainerTone, serviceAddOns, customQuestions,
      formData, packages,
    } = body;

    if (!trainerId || !formData.goalType || !formData.experienceLevel) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const calcInput = {
      goalType: formData.goalType as GoalType,
      currentWeightKg: formData.currentWeight,
      goalWeightKg: formData.goalWeight,
      age: formData.age,
      experienceLevel: formData.experienceLevel as ExperienceLevel,
      availableDays: formData.availableDays,
      performanceTarget: formData.performanceTarget,
    };

    const estimatedWeeks = calculateBaseWeeks(calcInput);
    const packageComparisons = calculatePackageTimelines(calcInput, packages);
    const baseMilestones = generateBaseMilestones(formData.goalType as GoalType, estimatedWeeks);

    // Personalised fallback narrative using client name
    let summary = `${formData.name}, based on your profile, reaching your goal will take approximately ${estimatedWeeks} weeks with consistent effort and ${trainerName}'s guidance.`;
    let narrative = `${formData.name}, your journey to ${formData.goalType === 'weight_loss' ? 'a leaner you' : formData.goalType === 'muscle_gain' ? 'a stronger physique' : 'better fitness'} starts now. Training ${formData.availableDays} days per week as a ${formData.experienceLevel}, you can expect steady, sustainable progress over the next ${estimatedWeeks} weeks. ${trainerName} will keep you accountable every step of the way — stay consistent and trust the process.`;
    let milestones = baseMilestones;

    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
        const prompt = buildPrompt({
          trainerName,
          trainerBio,
          trainerSpecialties,
          trainerTone,
          serviceAddOns,
          customAnswers: formData.customAnswers,
          customQuestions,
          clientName: formData.name,
          goalType: formData.goalType as GoalType,
          currentWeightKg: formData.currentWeight,
          goalWeightKg: formData.goalWeight,
          age: formData.age,
          experienceLevel: formData.experienceLevel as ExperienceLevel,
          availableDays: formData.availableDays,
          estimatedWeeks,
          performanceTarget: formData.performanceTarget,
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

    const supabase = getServiceClient();
    const { data: leadData, error: dbError } = await supabase.from('leads').insert({
      trainer_id: trainerId,
      name: formData.name,
      email: null,
      phone: formData.phone,
      goal_type: formData.goalType,
      current_weight_kg: formData.currentWeight,
      goal_weight_kg: formData.goalWeight,
      age: formData.age,
      experience_level: formData.experienceLevel,
      available_days_per_week: formData.availableDays,
      custom_answers: formData.customAnswers && Object.keys(formData.customAnswers).length > 0 ? formData.customAnswers : null,
      generated_timeline: timelineResult,
    }).select('id').single();

    if (dbError) {
      console.error('Database error:', dbError);
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
