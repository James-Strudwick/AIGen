export interface TrainerSpecialty {
  name: string;
  description: string;
}

export interface Trainer {
  id: string;
  slug: string;
  name: string;
  bio: string | null;
  photo_url: string | null;
  brand_color_primary: string;
  brand_color_secondary: string;
  booking_link: string;
  contact_method: 'whatsapp' | 'email' | 'calendly' | 'link';
  contact_value: string;
  logo_url: string | null;
  specialties: TrainerSpecialty[] | null;
  active: boolean;
  created_at: string;
}

export interface Package {
  id: string;
  trainer_id: string;
  name: string;
  sessions_per_week: number;
  price_per_session: number | null;
  monthly_price: number | null;
  description: string | null;
  is_online: boolean;
  sort_order: number;
}

export interface Lead {
  id: string;
  trainer_id: string;
  name: string;
  email: string | null;
  phone: string;
  goal_type: GoalType;
  current_weight_kg: number | null;
  goal_weight_kg: number | null;
  age: number | null;
  experience_level: ExperienceLevel | null;
  available_days_per_week: number | null;
  generated_timeline: TimelineResult | null;
  selected_package_id: string | null;
  created_at: string;
}

export type GoalType = 'weight_loss' | 'muscle_gain' | 'fitness' | 'performance';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export interface FormData {
  goalType: GoalType | null;
  performanceTarget?: string;
  age: number | null;
  currentWeight: number | null;
  goalWeight: number | null;
  weightUnit: 'kg' | 'stone';
  experienceLevel: ExperienceLevel | null;
  availableDays: number;
  name: string;
  phone: string;
}

export interface Milestone {
  label: string;
  weeks: number;
  description: string;
}

export interface PackageTimeline {
  packageId: string;
  packageName: string;
  sessionsPerWeek: number;
  pricePerSession: number | null;
  monthlyPrice: number | null;
  isOnline: boolean;
  estimatedWeeks: number;
  totalCost: number | null;
  isBestValue: boolean;
}

export interface TimelineConfig {
  sessionsPerWeek: number;
  hasNutritionSupport: boolean;
  hasOnlineCoaching: boolean;
}

export interface TimelineResult {
  estimatedWeeks: number;
  summary: string;
  milestones: Milestone[];
  packageComparisons: PackageTimeline[];
  narrative: string;
}
