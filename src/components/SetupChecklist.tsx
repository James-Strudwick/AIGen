'use client';

import Link from 'next/link';
import { Trainer, Package } from '@/types';

interface SetupChecklistProps {
  trainer: Trainer;
  packages: Package[];
}

interface CheckItem {
  id: string;
  label: string;
  tab: string;
  done: boolean;
}

export default function SetupChecklist({ trainer, packages }: SetupChecklistProps) {
  const checks: CheckItem[] = [
    {
      id: 'contact',
      label: 'Add your WhatsApp number',
      tab: 'details',
      done: !!(trainer.contact_value && trainer.contact_value.length >= 8),
    },
    {
      id: 'bio',
      label: 'Write a bio about yourself',
      tab: 'details',
      done: !!(trainer.bio && trainer.bio.trim().length > 10),
    },
    {
      id: 'specialties',
      label: 'Add your specialties',
      tab: 'specialties',
      done: !!(trainer.specialties && trainer.specialties.length > 0),
    },
    {
      id: 'services',
      label: 'Add your services',
      tab: 'services',
      done: !!(trainer.services?.add_ons && trainer.services.add_ons.length > 0),
    },
    {
      id: 'packages',
      label: 'Add at least one package',
      tab: 'packages',
      done: packages.length > 0,
    },
    {
      id: 'subscription',
      label: 'Subscribe to go live',
      tab: 'billing',
      done: trainer.subscription_status === 'active',
    },
  ];

  const completed = checks.filter((c) => c.done).length;
  const total = checks.length;
  const allDone = completed === total;

  if (allDone) return null;

  const progress = (completed / total) * 100;

  return (
    <div className="rounded-2xl border border-[#e5e5ea] p-5 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-semibold text-sm">Get your page live</p>
          <p className="text-[#8e8e93] text-xs mt-0.5">
            {completed} of {total} complete
          </p>
        </div>
        <span className="text-xs font-bold" style={{ color: progress === 100 ? '#34C759' : '#1a1a1a' }}>
          {Math.round(progress)}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-[#e5e5ea] rounded-full mb-4 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${progress}%`,
            backgroundColor: progress === 100 ? '#34C759' : '#1a1a1a',
          }}
        />
      </div>

      {/* Checklist items */}
      <div className="space-y-1">
        {checks.map((check) => (
          <Link
            key={check.id}
            href={check.id === 'subscription' ? '/settings?tab=billing' : `/settings?tab=${check.tab}`}
            className="flex items-center gap-3 py-2 px-2 -mx-2 rounded-lg hover:bg-[#f5f5f7] transition-colors group"
          >
            {/* Checkbox */}
            <div
              className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
              style={{
                borderColor: check.done ? '#34C759' : '#e5e5ea',
                backgroundColor: check.done ? '#34C759' : 'transparent',
              }}
            >
              {check.done && (
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>

            {/* Label */}
            <span
              className="text-sm flex-1 transition-colors"
              style={{
                color: check.done ? '#8e8e93' : '#1a1a1a',
                textDecoration: check.done ? 'line-through' : 'none',
              }}
            >
              {check.label}
            </span>

            {/* Arrow */}
            {!check.done && (
              <svg className="w-4 h-4 text-[#8e8e93] opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
