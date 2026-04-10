'use client';

import { useState } from 'react';

const COUNTRY_CODES = [
  { code: '+44', country: 'UK', flag: '🇬🇧', digits: 10 },
  { code: '+1', country: 'US', flag: '🇺🇸', digits: 10 },
  { code: '+353', country: 'IE', flag: '🇮🇪', digits: 9 },
  { code: '+61', country: 'AU', flag: '🇦🇺', digits: 9 },
  { code: '+91', country: 'IN', flag: '🇮🇳', digits: 10 },
  { code: '+971', country: 'AE', flag: '🇦🇪', digits: 9 },
  { code: '+33', country: 'FR', flag: '🇫🇷', digits: 9 },
  { code: '+49', country: 'DE', flag: '🇩🇪', digits: 11 },
  { code: '+34', country: 'ES', flag: '🇪🇸', digits: 9 },
  { code: '+39', country: 'IT', flag: '🇮🇹', digits: 10 },
  { code: '+351', country: 'PT', flag: '🇵🇹', digits: 9 },
  { code: '+27', country: 'ZA', flag: '🇿🇦', digits: 9 },
  { code: '+64', country: 'NZ', flag: '🇳🇿', digits: 9 },
];

interface PhoneInputProps {
  value: string;
  onChange: (fullNumber: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

export default function PhoneInput({ value, onChange, className, style }: PhoneInputProps) {
  // Parse existing value to extract country code and number
  const parsed = parsePhone(value);
  const [countryCode, setCountryCode] = useState(parsed.code);
  const [number, setNumber] = useState(parsed.number);
  const [showDropdown, setShowDropdown] = useState(false);

  const country = COUNTRY_CODES.find(c => c.code === countryCode) || COUNTRY_CODES[0];

  const handleNumberChange = (raw: string) => {
    // Strip non-digits
    const digits = raw.replace(/\D/g, '');
    // Remove leading 0 (UK users type 07... but we want 7...)
    const cleaned = digits.startsWith('0') ? digits.slice(1) : digits;
    // Limit to country's digit count
    const limited = cleaned.slice(0, country.digits);
    setNumber(limited);
    onChange(`${countryCode}${limited}`);
  };

  const handleCodeChange = (code: string) => {
    setCountryCode(code);
    setShowDropdown(false);
    const newCountry = COUNTRY_CODES.find(c => c.code === code) || COUNTRY_CODES[0];
    const limited = number.slice(0, newCountry.digits);
    setNumber(limited);
    onChange(`${code}${limited}`);
  };

  const isValid = number.length === country.digits;

  return (
    <div className="relative">
      <div className={'flex items-center gap-0 ' + (className || '')} style={style}>
        {/* Country code selector */}
        <button
          type="button"
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-1 px-3 py-3 rounded-l-xl border border-r-0 text-sm flex-shrink-0 transition-colors"
          style={{
            backgroundColor: style?.backgroundColor || '#f5f5f7',
            borderColor: style?.borderColor || '#e5e5ea',
            color: style?.color || '#1a1a1a',
          }}
        >
          <span>{country.flag}</span>
          <span className="font-medium">{countryCode}</span>
          <svg className="w-3 h-3 opacity-40" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>

        {/* Number input */}
        <input
          type="tel"
          inputMode="numeric"
          value={number}
          onChange={(e) => handleNumberChange(e.target.value)}
          placeholder={`${'0'.repeat(country.digits)}`}
          className="flex-1 px-3 py-3 rounded-r-xl border text-base focus:outline-none min-w-0"
          style={{
            backgroundColor: style?.backgroundColor || '#f5f5f7',
            borderColor: style?.borderColor || '#e5e5ea',
            color: style?.color || '#1a1a1a',
          }}
          autoComplete="tel-national"
        />
      </div>

      {/* Validation hint */}
      {number.length > 0 && !isValid && (
        <p className="text-[11px] mt-1" style={{ color: '#FF3B30' }}>
          {country.country} numbers need {country.digits} digits ({number.length}/{country.digits})
        </p>
      )}

      {/* Dropdown */}
      {showDropdown && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
          <div className="absolute top-full left-0 mt-1 bg-white border border-[#e5e5ea] rounded-xl shadow-lg z-20 w-48 max-h-60 overflow-y-auto">
            {COUNTRY_CODES.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => handleCodeChange(c.code)}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-[#f5f5f7] transition-colors text-left"
                style={{ backgroundColor: c.code === countryCode ? '#f5f5f7' : 'transparent' }}
              >
                <span>{c.flag}</span>
                <span className="font-medium">{c.code}</span>
                <span className="text-[#8e8e93]">{c.country}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function parsePhone(value: string): { code: string; number: string } {
  if (!value) return { code: '+44', number: '' };

  // Try to match a country code
  for (const c of COUNTRY_CODES.sort((a, b) => b.code.length - a.code.length)) {
    if (value.startsWith(c.code)) {
      return { code: c.code, number: value.slice(c.code.length).replace(/\D/g, '') };
    }
  }

  // If starts with +, try to extract
  if (value.startsWith('+')) {
    const digits = value.replace(/\D/g, '');
    if (digits.startsWith('44')) return { code: '+44', number: digits.slice(2) };
    if (digits.startsWith('1')) return { code: '+1', number: digits.slice(1) };
    return { code: '+44', number: digits };
  }

  // Plain digits — assume UK
  const digits = value.replace(/\D/g, '');
  const cleaned = digits.startsWith('0') ? digits.slice(1) : digits;
  return { code: '+44', number: cleaned };
}
