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
