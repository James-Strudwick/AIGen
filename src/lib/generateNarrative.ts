import { GoalType, ExperienceLevel, TrainerSpecialty, ServiceAddOn, CustomQuestion } from '@/types';

export interface NarrativeInput {
  trainerName: string;
  trainerBio: string | null;
  trainerSpecialties: TrainerSpecialty[] | null;
  trainerTone: string;
  serviceAddOns: ServiceAddOn[];
  customAnswers?: Record<string, string | string[]>;
  customQuestions?: CustomQuestion[];
  customAboutFields?: Record<string, string>;
  clientName: string;
  goalType: GoalType;
  currentWeightKg: number | null;
  goalWeightKg: number | null;
  age: number | null;
  experienceLevel: ExperienceLevel;
  availableDays: number;
  estimatedWeeks: number;
  performanceTarget?: string;
}

const goalTypeLabels: Record<GoalType, string> = {
  weight_loss: 'lose weight',
  muscle_gain: 'build muscle',
  fitness: 'improve general fitness',
  performance: 'achieve a performance goal',
};

const defaultToneGuide: Record<GoalType, string> = {
  weight_loss: 'empathetic, encouraging, and supportive. Acknowledge that weight loss is a journey.',
  muscle_gain: 'energetic, motivating, and confident. Emphasise the gains ahead.',
  fitness: 'warm, positive, and holistic. Focus on how much better they will feel.',
  performance: 'data-driven, technical, and focused. Use specific language about progression.',
};

export function buildPrompt(input: NarrativeInput): string {
  const weightContext = input.goalType === 'weight_loss' || input.goalType === 'muscle_gain'
    ? `Current weight: ${input.currentWeightKg}kg. Goal weight: ${input.goalWeightKg}kg.`
    : '';

  const performanceContext = input.performanceTarget
    ? `Their specific target: ${input.performanceTarget}.`
    : '';

  // Build PT context
  const specialtiesContext = input.trainerSpecialties?.length
    ? `\n${input.trainerName}'s specialties:\n${input.trainerSpecialties.map((s) => `- ${s.name}: ${s.description}`).join('\n')}`
    : '';

  const bioContext = input.trainerBio
    ? `\nAbout ${input.trainerName}: ${input.trainerBio}`
    : '';

  const servicesContext = input.serviceAddOns.length > 0
    ? `${input.trainerName} also offers: ${input.serviceAddOns.map(a => `${a.name} (${a.description})`).join('; ')}`
    : '';

  // Build custom Q&A context
  let customQAContext = '';
  const extraInfo: string[] = [];

  // Custom about fields (injuries, medical conditions, etc.)
  if (input.customAboutFields) {
    for (const [, value] of Object.entries(input.customAboutFields)) {
      if (value?.trim()) extraInfo.push(`- ${value}`);
    }
  }

  // Custom question answers
  if (input.customAnswers && input.customQuestions) {
    for (const q of input.customQuestions) {
      const answer = input.customAnswers[q.id];
      if (answer) {
        const answerStr = Array.isArray(answer) ? answer.join(', ') : answer;
        extraInfo.push(`- ${q.question}: ${answerStr}`);
      }
    }
  }

  if (extraInfo.length > 0) {
    customQAContext = `\nAdditional information from ${input.clientName}:\n${extraInfo.join('\n')}`;
  }

  // Use PT's custom tone if set, otherwise default by goal type
  const tone = input.trainerTone
    ? `${input.trainerTone}. Also be ${defaultToneGuide[input.goalType]}`
    : `Be ${defaultToneGuide[input.goalType]}`;

  return `You are writing a personalised fitness timeline for ${input.clientName}, a prospective client of ${input.trainerName}, a personal trainer based in the UK.
${bioContext}
${specialtiesContext}
${servicesContext ? `\nServices: ${servicesContext}.` : ''}

Client details:
- Name: ${input.clientName}
- Goal: ${goalTypeLabels[input.goalType]}
- Age: ${input.age ?? 'not specified'}
${weightContext ? `- ${weightContext}` : ''}- Experience level: ${input.experienceLevel}
- Available training days per week: ${input.availableDays}
- Estimated timeline: approximately ${input.estimatedWeeks} weeks
${performanceContext}
${customQAContext}

Tone: ${tone}

IMPORTANT INSTRUCTIONS:
- Address ${input.clientName} by name in the summary and narrative
- Reference ${input.trainerName}'s specific specialties where relevant to this client's goal
- If ${input.trainerName} offers additional services (nutrition, online coaching, etc.), mention how they specifically accelerate this client's goal
- If additional information was provided (barriers, previous experience, etc.), weave it naturally into the narrative and milestones — show that the plan accounts for their specific situation
- Make the milestones feel like they were written specifically for ${input.clientName}, not generic templates
- Use UK English spelling (programme, personalised, etc.)

Generate a JSON response with exactly this structure:
{
  "summary": "A 1-2 sentence personalised summary addressing ${input.clientName} by name. Reference their specific goal and how ${input.trainerName}'s expertise is relevant.",
  "narrative": "A 3-4 sentence motivational paragraph. Address ${input.clientName} by name. Be specific about their situation — reference their weight/goal/experience. Mention ${input.trainerName}'s relevant specialty. End with a personal call to action.",
  "milestones": [
    {
      "label": "Phase name",
      "weeks": <week number>,
      "description": "2-3 sentences specific to ${input.clientName}'s situation. Reference their experience level, goal, and what ${input.trainerName} will do for them in this phase."
    }
  ]
}

Create exactly 4 milestones spread across the ${input.estimatedWeeks}-week timeline. The final milestone should be at week ${input.estimatedWeeks}.

IMPORTANT: Return ONLY valid JSON, no markdown formatting, no code blocks.`;
}
