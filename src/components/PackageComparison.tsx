'use client';

import { PackageTimeline } from '@/types';

interface PackageComparisonProps {
  packages: PackageTimeline[];
  trainerName: string;
  primaryColor: string;
  onSelect?: (packageId: string) => void;
}

export default function PackageComparison({ packages, trainerName, primaryColor, onSelect }: PackageComparisonProps) {
  return (
    <div>
      <h3 className="text-xl font-bold text-white mb-2 text-center">
        Your timeline with {trainerName}
      </h3>
      <p className="text-gray-400 text-sm text-center mb-6">
        See how different plans affect your progress
      </p>

      <div className="space-y-3">
        {packages.map((pkg, i) => (
          <div
            key={pkg.packageId}
            onClick={() => onSelect?.(pkg.packageId)}
            className="relative rounded-2xl p-5 transition-all duration-200 hover:scale-[1.01] cursor-pointer animate-in fade-in slide-in-from-bottom-2"
            style={{
              animationDelay: `${i * 100}ms`,
              animationFillMode: 'both',
              backgroundColor: pkg.isBestValue ? primaryColor + '15' : 'rgba(255,255,255,0.03)',
              borderWidth: '1.5px',
              borderColor: pkg.isBestValue ? primaryColor : 'rgba(255,255,255,0.08)',
            }}
          >
            {/* Best value badge */}
            {pkg.isBestValue && (
              <span
                className="absolute -top-2.5 right-4 text-xs font-bold px-3 py-0.5 rounded-full text-white"
                style={{ backgroundColor: primaryColor }}
              >
                BEST VALUE
              </span>
            )}

            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-white font-semibold text-lg">{pkg.packageName}</h4>
                <p className="text-gray-500 text-sm">
                  {pkg.isOnline ? 'Online coaching' : `${pkg.sessionsPerWeek}x per week`}
                </p>
              </div>

              <div className="text-right">
                {pkg.monthlyPrice && (
                  <p className="text-white font-bold text-lg">
                    £{pkg.monthlyPrice}<span className="text-gray-500 text-xs font-normal">/mo</span>
                  </p>
                )}
                {pkg.pricePerSession && (
                  <p className="text-gray-500 text-xs">
                    £{pkg.pricePerSession}/session
                  </p>
                )}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" style={{ color: primaryColor }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span className="text-white font-semibold">
                  ~{pkg.estimatedWeeks} weeks
                </span>
              </div>

              {pkg.totalCost && (
                <span className="text-gray-400 text-sm">
                  Est. total: £{pkg.totalCost.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
