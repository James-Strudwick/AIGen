/**
 * Tiered referral reward definitions.
 *
 * Each tier is unlocked when `referral_count` reaches the tier number.
 * Rewards are applied via Stripe coupons at the moment the tier is crossed.
 *
 * Tier 5 is capped at the first 50 users globally.
 */

export interface ReferralTier {
  tier: number;
  label: string;
  shortLabel: string;
  description: string;
  couponId: string;
  /** Stripe coupon config — used to create/ensure the coupon exists. */
  coupon: {
    percent_off: number;
    duration: 'once' | 'repeating' | 'forever';
    duration_in_months?: number;
    name: string;
  };
  /** Does this tier also upgrade the user to Pro? */
  upgradesPro?: boolean;
  /** Max users globally who can claim this tier (undefined = unlimited). */
  globalCap?: number;
}

export const REFERRAL_TIERS: ReferralTier[] = [
  {
    tier: 1,
    label: '50% off next month',
    shortLabel: '50% off',
    description: 'Your next month is half price',
    couponId: 'REFERRAL_T1',
    coupon: { percent_off: 50, duration: 'once', name: 'Referral reward — 50% off next month' },
  },
  {
    tier: 2,
    label: '1 month free',
    shortLabel: '1mo free',
    description: 'Your next month is on us',
    couponId: 'REFERRAL_T2',
    coupon: { percent_off: 100, duration: 'once', name: 'Referral reward — 1 month free' },
  },
  {
    tier: 3,
    label: '2 months free',
    shortLabel: '2mo free',
    description: 'Your next 2 months are on us',
    couponId: 'REFERRAL_T3',
    coupon: { percent_off: 100, duration: 'repeating', duration_in_months: 2, name: 'Referral reward — 2 months free' },
  },
  {
    tier: 4,
    label: '1 month Pro free',
    shortLabel: 'Pro month',
    description: 'Free month on Pro (or free month if already Pro)',
    couponId: 'REFERRAL_T4',
    coupon: { percent_off: 100, duration: 'once', name: 'Referral reward — 1 month Pro free' },
    upgradesPro: true,
  },
  {
    tier: 5,
    label: '50% off for life',
    shortLabel: '50% life',
    description: '50% off your subscription forever — first 50 users only',
    couponId: 'REFERRAL_T5',
    coupon: { percent_off: 50, duration: 'forever', name: 'Referral reward — 50% off for life' },
    globalCap: 50,
  },
];

export function getTierForCount(count: number): ReferralTier | null {
  // Return the tier that matches this exact count (1-indexed).
  return REFERRAL_TIERS.find(t => t.tier === count) ?? null;
}

export function getHighestUnlockedTier(count: number): ReferralTier | null {
  const unlocked = REFERRAL_TIERS.filter(t => t.tier <= count);
  return unlocked.length > 0 ? unlocked[unlocked.length - 1] : null;
}
