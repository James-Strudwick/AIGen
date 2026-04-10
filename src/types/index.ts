export interface TrainerSpecialty {
  name: string;
  description: string;
}

export type ThemeMode = 'dark' | 'light';

export interface TrainerBranding {
  color_primary: string;
  color_secondary: string;
  color_accent: string;
  color_background: string;
  color_text: string;
  color_text_muted: string;
  color_card: string;
  color_border: string;
  font_heading: string;
  font_body: string;
  theme: ThemeMode;
  hero_image_url: string | null;
  hero_overlay_opacity: number;
}

export interface ServiceAddOn {
  id: string;
  name: string;
  description: string;
  timeline_reduction_percent: number;
  price_per_month: number | null;
}

export interface NutritionService {
  enabled: boolean;
  name: string;
  description: string;
  timeline_reduction_percent: number;
  price_per_month: number | null;
}

export interface OnlineService {
  enabled: boolean;
  name: string;
  description: string;
  effectiveness_vs_inperson: number; // 0.0-1.0, e.g. 0.8 means 80% as effective
  price_per_month: number | null;
}

export interface HybridService {
  enabled: boolean;
  name: string;
  description: string;
  price_per_month: number | null;
}

export interface TrainerServices {
  show_prices: boolean;
  nutrition: NutritionService | null;
  online: OnlineService | null;
  hybrid: HybridService | null;
  add_ons: ServiceAddOn[];
}

export type TrainingMode = 'inperson' | 'online' | 'hybrid';

export interface TrainerCopy {
  hero_headline: string;
  hero_subtext: string;
  cta_button_text: string;
  tone: string;
}

export interface CustomGoal {
  id: string;
  emoji: string;
  label: string;
  subtitle: string;
  needs_target: boolean;
  target_prompt: string;
  target_placeholder: string;
  goal_type: GoalType;
}

export type CustomQuestionType = 'text' | 'select' | 'multiselect';

export interface CustomQuestion {
  id: string;
  question: string;
  type: CustomQuestionType;
  options: string[];
  placeholder: string;
}

export type SubscriptionStatus = 'none' | 'active' | 'past_due' | 'cancelled';
export type Tier = 'starter' | 'pro';

export interface Trainer {
  id: string;
  slug: string;
  user_id: string | null;
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
  branding: TrainerBranding | null;
  services: TrainerServices | null;
  copy: TrainerCopy | null;
  custom_questions: CustomQuestion[] | null;
  custom_goals: CustomGoal[] | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: SubscriptionStatus;
  subscription_ends_at: string | null;
  tier: Tier;
  referral_code: string | null;
  referred_by: string | null;
  referral_count: number;
  has_referral_discount: boolean;
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

export type LeadStatus = 'form_completed' | 'whatsapp_sent' | 'call_booked' | 'converted';

export interface Lead {
  id: string;
  trainer_id: string;
  name: string;
  email: string | null;
  phone: string;
  status: LeadStatus;
  goal_type: GoalType;
  current_weight_kg: number | null;
  goal_weight_kg: number | null;
  age: number | null;
  experience_level: ExperienceLevel | null;
  available_days_per_week: number | null;
  custom_answers: Record<string, string | string[]> | null;
  generated_timeline: TimelineResult | null;
  selected_package_id: string | null;
  whatsapp_clicked_at: string | null;
  booking_clicked_at: string | null;
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
  customAboutFields: Record<string, string>;
  customAnswers: Record<string, string | string[]>;
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
  mode: TrainingMode;
  inPersonDays: number;
  onlineDays: number;
  hasNutrition: boolean;
}

export interface TimelineResult {
  estimatedWeeks: number;
  summary: string;
  milestones: Milestone[];
  packageComparisons: PackageTimeline[];
  narrative: string;
}

export interface TrainerForm {
  id: string;
  trainer_id: string;
  goal_id: string;
  name: string;
  questions: CustomQuestion[] | null;
  services: TrainerServices | null;
  packages: { name: string; sessions_per_week: number; price_per_session: number | null; monthly_price: number | null; is_online: boolean }[] | null;
  copy: { hero_subtext: string | null } | null;
  active: boolean;
  created_at: string;
}
