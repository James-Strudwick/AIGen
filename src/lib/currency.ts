/**
 * Supported display currencies for coaches. This affects prices the coach
 * shows their own prospects (packages, services, add-ons) — not our own
 * subscription pricing, which stays in GBP.
 */
export interface CurrencyDef {
  code: string;
  symbol: string;
  label: string;
}

export const CURRENCIES: CurrencyDef[] = [
  { code: 'GBP', symbol: '£', label: 'British Pound (£)' },
  { code: 'USD', symbol: '$', label: 'US Dollar ($)' },
  { code: 'EUR', symbol: '€', label: 'Euro (€)' },
  { code: 'CAD', symbol: 'CA$', label: 'Canadian Dollar (CA$)' },
  { code: 'AUD', symbol: 'A$', label: 'Australian Dollar (A$)' },
  { code: 'NZD', symbol: 'NZ$', label: 'New Zealand Dollar (NZ$)' },
  { code: 'ZAR', symbol: 'R', label: 'South African Rand (R)' },
  { code: 'SGD', symbol: 'S$', label: 'Singapore Dollar (S$)' },
];

const DEFAULT = CURRENCIES[0];

export function getCurrency(code: string | null | undefined): CurrencyDef {
  if (!code) return DEFAULT;
  return CURRENCIES.find(c => c.code === code) ?? DEFAULT;
}

export function currencySymbol(code: string | null | undefined): string {
  return getCurrency(code).symbol;
}

/**
 * Approximate GBP→X rates used for displaying our own subscription pricing
 * in the coach's chosen currency. Stripe still charges in GBP; these are only
 * hints so coaches outside the UK can see roughly what they'll pay.
 * Refresh occasionally — small drift is fine since values are shown as "~".
 */
const GBP_TO_RATES: Record<string, number> = {
  GBP: 1,
  USD: 1.27,
  EUR: 1.17,
  CAD: 1.72,
  AUD: 1.95,
  NZD: 2.10,
  ZAR: 23,
  SGD: 1.70,
};

/**
 * Format an approximate price converted from GBP into the given currency.
 * Returns null for GBP (no conversion needed) or unknown codes.
 */
export function approxFromGbp(gbpAmount: number, toCode: string | null | undefined): string | null {
  if (!toCode || toCode === 'GBP') return null;
  const rate = GBP_TO_RATES[toCode];
  if (!rate) return null;
  const converted = gbpAmount * rate;
  const rounded = converted >= 100 ? Math.round(converted / 10) * 10 : Math.round(converted);
  return `${currencySymbol(toCode)}${rounded}`;
}
