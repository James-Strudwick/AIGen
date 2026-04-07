import { GoalType, ExperienceLevel, Package, PackageTimeline, Milestone, TimelineConfig, TrainerServices } from '@/types';

export interface CalcInput {
  goalType: GoalType;
  currentWeightKg: number | null;
  goalWeightKg: number | null;
  age: number | null;
  experienceLevel: ExperienceLevel;
  availableDays: number;
  performanceTarget?: string;
}

function getWeightLossWeeks(input: CalcInput): number {
  const current = input.currentWeightKg ?? 80;
  const goal = input.goalWeightKg ?? 70;
  const tolose = Math.max(0, current - goal);

  // Base rate: 0.25-0.5kg/week, adjusted by factors
  let weeklyRate = 0.35;

  // Higher starting weight = faster initial loss
  if (current > 100) weeklyRate += 0.1;
  else if (current > 90) weeklyRate += 0.05;

  // Experience affects adherence and efficiency
  if (input.experienceLevel === 'intermediate') weeklyRate += 0.05;
  if (input.experienceLevel === 'advanced') weeklyRate += 0.1;

  // Training frequency boost (diminishing returns)
  const freqMultiplier = 1 + (Math.min(input.availableDays, 6) - 1) * 0.12;
  weeklyRate *= freqMultiplier;

  // Cap at safe maximum
  weeklyRate = Math.min(weeklyRate, 1.0);

  const weeks = Math.ceil(tolose / weeklyRate);
  return Math.max(weeks, 4); // Minimum 4 weeks
}

function getMuscleGainWeeks(input: CalcInput): number {
  const current = input.currentWeightKg ?? 70;
  const goal = input.goalWeightKg ?? 75;
  const toGain = Math.max(0, goal - current);

  // Monthly body weight gain rates (not pure lean muscle — includes water, glycogen, etc.)
  // These are realistic for someone following a structured programme
  let monthlyGainKg: number;
  switch (input.experienceLevel) {
    case 'beginner': monthlyGainKg = 1.5; break;   // Newbie gains — fast initial progress
    case 'intermediate': monthlyGainKg = 0.75; break; // Steady progress
    case 'advanced': monthlyGainKg = 0.4; break;     // Hard-earned gains
  }

  // More sessions = better muscle group coverage
  const freqMultiplier = 1 + (Math.min(input.availableDays, 6) - 2) * 0.12;
  monthlyGainKg *= Math.max(freqMultiplier, 0.7);

  const months = toGain / monthlyGainKg;
  const weeks = Math.ceil(months * 4.33);
  return Math.max(weeks, 8); // Minimum 8 weeks
}

function getFitnessWeeks(input: CalcInput): number {
  // Milestone-based: general fitness transformation
  let baseWeeks = 16;

  if (input.experienceLevel === 'intermediate') baseWeeks = 12;
  if (input.experienceLevel === 'advanced') baseWeeks = 8;

  const freqMultiplier = 1 / (1 + (Math.min(input.availableDays, 6) - 2) * 0.12);
  return Math.ceil(baseWeeks * freqMultiplier);
}

function getPerformanceWeeks(input: CalcInput): number {
  // Similar to fitness but slightly longer
  let baseWeeks = 20;

  if (input.experienceLevel === 'intermediate') baseWeeks = 14;
  if (input.experienceLevel === 'advanced') baseWeeks = 10;

  const freqMultiplier = 1 / (1 + (Math.min(input.availableDays, 6) - 2) * 0.1);
  return Math.ceil(baseWeeks * freqMultiplier);
}

export function calculateBaseWeeks(input: CalcInput): number {
  switch (input.goalType) {
    case 'weight_loss': return getWeightLossWeeks(input);
    case 'muscle_gain': return getMuscleGainWeeks(input);
    case 'fitness': return getFitnessWeeks(input);
    case 'performance': return getPerformanceWeeks(input);
  }
}

export function calculatePackageTimelines(
  input: CalcInput,
  packages: Package[]
): PackageTimeline[] {
  const baseWeeks = calculateBaseWeeks(input);

  const timelines: PackageTimeline[] = packages
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((pkg) => {
      let estimatedWeeks: number;

      if (pkg.sessions_per_week === 0) {
        // No sessions specified — fallback estimate based on 2x/week
        const fallbackInput = { ...input, availableDays: 2 };
        estimatedWeeks = Math.ceil(calculateBaseWeeks(fallbackInput) * 1.15);
      } else {
        const pkgInput = { ...input, availableDays: pkg.sessions_per_week };
        estimatedWeeks = calculateBaseWeeks(pkgInput);
      }

      const months = estimatedWeeks / 4.33;
      const totalCost = pkg.monthly_price ? Math.round(pkg.monthly_price * months) : null;

      return {
        packageId: pkg.id,
        packageName: pkg.name,
        sessionsPerWeek: pkg.sessions_per_week,
        pricePerSession: pkg.price_per_session,
        monthlyPrice: pkg.monthly_price,
        isOnline: pkg.is_online,
        estimatedWeeks,
        totalCost,
        isBestValue: false,
      };
    });

  // Determine best value: lowest total cost among non-online packages with a price
  const pricedTimelines = timelines.filter((t) => t.totalCost !== null && !t.isOnline);
  if (pricedTimelines.length > 0) {
    const bestValue = pricedTimelines.reduce((best, t) =>
      t.totalCost! < best.totalCost! ? t : best
    );
    const match = timelines.find((t) => t.packageId === bestValue.packageId);
    if (match) match.isBestValue = true;
  }

  return timelines;
}

export function generateBaseMilestones(
  goalType: GoalType,
  totalWeeks: number
): Milestone[] {
  const milestones: Milestone[] = [];
  const phases = Math.min(4, Math.max(2, Math.floor(totalWeeks / 4)));

  const goalLabels: Record<GoalType, string[][]> = {
    weight_loss: [
      ['Building Foundations', 'Your body adapts to the new routine. Initial water weight drops and habits form.'],
      ['Visible Changes', 'Clothes start fitting differently. Energy levels increase noticeably.'],
      ['Accelerating Progress', 'Consistent fat loss week over week. Strength improves alongside.'],
      ['Goal Reached', 'You\'ve built sustainable habits and reached your target weight.'],
    ],
    muscle_gain: [
      ['Neural Adaptation', 'Your nervous system adapts to lifting. Strength increases rapidly even before visible muscle growth.'],
      ['First Gains Visible', 'Shirts fit tighter in the right places. Muscles start to show definition.'],
      ['Progressive Overload', 'Weights go up consistently. Muscle growth becomes clearly visible.'],
      ['Transformation Complete', 'You\'ve built the physique you set out to achieve.'],
    ],
    fitness: [
      ['Building Base Fitness', 'Cardiovascular capacity improves. Recovery between sessions gets faster.'],
      ['Noticeable Endurance', 'Daily activities feel easier. You can push harder in sessions.'],
      ['Peak Performance', 'Fitness levels are significantly above where you started.'],
      ['Goal Achieved', 'You\'ve reached a strong, sustainable fitness level.'],
    ],
    performance: [
      ['Foundation Phase', 'Building the base conditioning needed for your specific goal.'],
      ['Skill Development', 'Technique improves alongside fitness. Progress becomes measurable.'],
      ['Peak Training', 'Pushing towards your target with focused, goal-specific training.'],
      ['Target Reached', 'You\'ve achieved your performance goal.'],
    ],
  };

  const labels = goalLabels[goalType];

  for (let i = 0; i < phases; i++) {
    const weekPoint = i === phases - 1
      ? totalWeeks
      : Math.round(((i + 1) / phases) * totalWeeks);

    milestones.push({
      label: labels[Math.min(i, labels.length - 1)][0],
      weeks: weekPoint,
      description: labels[Math.min(i, labels.length - 1)][1],
    });
  }

  return milestones;
}

/**
 * Calculate weeks based on training mode.
 *
 * - In-person: best results, use inPersonDays directly
 * - Online: same days but reduced effectiveness (e.g. 80% of in-person)
 * - Hybrid: blend of in-person (full effectiveness) + online (reduced)
 * - Nutrition: genuine accelerator that stacks on any mode
 */
export function calculateWithToggles(
  baseInput: CalcInput,
  config: TimelineConfig,
  services: TrainerServices
): number {
  let effectiveDays: number;

  switch (config.mode) {
    case 'inperson':
      effectiveDays = config.inPersonDays;
      break;

    case 'online': {
      // Online days are less effective than in-person
      const effectiveness = services.online?.effectiveness_vs_inperson ?? 0.75;
      effectiveDays = Math.max(config.onlineDays * effectiveness, 1);
      break;
    }

    case 'hybrid': {
      // In-person days at full effectiveness + online days at reduced
      const effectiveness = services.online?.effectiveness_vs_inperson ?? 0.75;
      const onlineEffective = config.onlineDays * effectiveness;
      effectiveDays = config.inPersonDays + onlineEffective;
      break;
    }
  }

  const input = { ...baseInput, availableDays: Math.round(effectiveDays) || 1 };
  let weeks = calculateBaseWeeks(input);

  // Nutrition is a genuine accelerator — stacks on any mode
  if (config.hasNutrition && services.nutrition?.enabled) {
    const reduction = (services.nutrition.timeline_reduction_percent || 20) / 100;
    weeks = Math.ceil(weeks * (1 - reduction));
  }

  return Math.max(weeks, 4);
}
