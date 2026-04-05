import { GoalType, ExperienceLevel, Milestone, PackageTimeline } from '@/types';

interface NarrativeInput {
  trainerName: string;
  goalType: GoalType;
  currentWeightKg: number | null;
  goalWeightKg: number | null;
  age: number | null;
  experienceLevel: ExperienceLevel;
  availableDays: number;
  estimatedWeeks: number;
  performanceTarget?: string;
}

interface NarrativeResult {
  summary: string;
  narrative: string;
  milestones: Milestone[];
}

const goalTypeLabels: Record<GoalType, string> = {
  weight_loss: 'lose weight',
  muscle_gain: 'build muscle',
  fitness: 'improve general fitness',
  performance: 'achieve a performance goal',
};

const toneGuide: Record<GoalType, string> = {
  weight_loss: 'empathetic, encouraging, and supportive. Acknowledge that weight loss is a journey.',
  muscle_gain: 'energetic, motivating, and confident. Emphasise the gains ahead.',
  fitness: 'warm, positive, and holistic. Focus on how much better they will feel.',
  performance: 'data-driven, technical, and focused. Use specific language about progression.',
};

export async function generateNarrative(input: NarrativeInput): Promise<NarrativeResult> {
  const weightContext = input.goalType === 'weight_loss' || input.goalType === 'muscle_gain'
    ? `Current weight: ${input.currentWeightKg}kg. Goal weight: ${input.goalWeightKg}kg.`
    : '';

  const performanceContext = input.performanceTarget
    ? `Their specific target: ${input.performanceTarget}.`
    : '';

  const prompt = `You are writing a personalised fitness timeline for a prospective client of ${input.trainerName}, a personal trainer.

Client details:
- Goal: ${goalTypeLabels[input.goalType]}
- Age: ${input.age ?? 'not specified'}
- ${weightContext}
- Experience level: ${input.experienceLevel}
- Available training days per week: ${input.availableDays}
- Estimated timeline: approximately ${input.estimatedWeeks} weeks
${performanceContext}

Tone: Be ${toneGuide[input.goalType]}

Generate a JSON response with exactly this structure:
{
  "summary": "A 1-2 sentence personalised summary of their journey ahead. Address them directly with 'you'. Reference their specific goal.",
  "narrative": "A 3-4 sentence motivational paragraph about their journey. Be specific to their situation. Mention the timeframe. End with encouragement about working with ${input.trainerName}.",
  "milestones": [
    {
      "label": "Phase name",
      "weeks": <week number this milestone is reached>,
      "description": "2-3 sentences describing what happens in this phase. Be specific to their goal type and experience level."
    }
  ]
}

Create exactly 4 milestones spread across the ${input.estimatedWeeks}-week timeline. The final milestone should be at week ${input.estimatedWeeks}.

IMPORTANT: Return ONLY valid JSON, no markdown formatting, no code blocks.`;

  const response = await fetch('/api/generate-timeline', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate narrative');
  }

  const data = await response.json();
  return data as NarrativeResult;
}

export function buildPrompt(input: NarrativeInput): string {
  const weightContext = input.goalType === 'weight_loss' || input.goalType === 'muscle_gain'
    ? `Current weight: ${input.currentWeightKg}kg. Goal weight: ${input.goalWeightKg}kg.`
    : '';

  const performanceContext = input.performanceTarget
    ? `Their specific target: ${input.performanceTarget}.`
    : '';

  return `You are writing a personalised fitness timeline for a prospective client of ${input.trainerName}, a personal trainer.

Client details:
- Goal: ${goalTypeLabels[input.goalType]}
- Age: ${input.age ?? 'not specified'}
- ${weightContext}
- Experience level: ${input.experienceLevel}
- Available training days per week: ${input.availableDays}
- Estimated timeline: approximately ${input.estimatedWeeks} weeks
${performanceContext}

Tone: Be ${toneGuide[input.goalType]}

Generate a JSON response with exactly this structure:
{
  "summary": "A 1-2 sentence personalised summary of their journey ahead. Address them directly with 'you'. Reference their specific goal.",
  "narrative": "A 3-4 sentence motivational paragraph about their journey. Be specific to their situation. Mention the timeframe. End with encouragement about working with ${input.trainerName}.",
  "milestones": [
    {
      "label": "Phase name",
      "weeks": <week number this milestone is reached>,
      "description": "2-3 sentences describing what happens in this phase. Be specific to their goal type and experience level."
    }
  ]
}

Create exactly 4 milestones spread across the ${input.estimatedWeeks}-week timeline. The final milestone should be at week ${input.estimatedWeeks}.

IMPORTANT: Return ONLY valid JSON, no markdown formatting, no code blocks.`;
}
