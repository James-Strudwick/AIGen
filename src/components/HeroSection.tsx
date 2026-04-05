'use client';

import { Trainer } from '@/types';

interface HeroSectionProps {
  trainer: Trainer;
  onStart: () => void;
}

export default function HeroSection({ trainer, onStart }: HeroSectionProps) {
  return (
    <div
      className="min-h-[100dvh] flex flex-col items-center justify-center px-5 text-center relative overflow-hidden"
      style={{ backgroundColor: trainer.brand_color_secondary }}
    >
      {/* Gradient overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          background: `radial-gradient(circle at 50% 30%, ${trainer.brand_color_primary}, transparent 70%)`,
        }}
      />

      <div className="relative z-10 w-full max-w-md mx-auto">
        {/* PT Photo */}
        {trainer.photo_url ? (
          <div
            className="w-24 h-24 rounded-full mx-auto mb-5 border-[3px] bg-cover bg-center"
            style={{
              borderColor: trainer.brand_color_primary,
              backgroundImage: `url(${trainer.photo_url})`,
            }}
          />
        ) : (
          <div
            className="w-24 h-24 rounded-full mx-auto mb-5 border-[3px] flex items-center justify-center text-2xl font-bold text-white"
            style={{
              borderColor: trainer.brand_color_primary,
              backgroundColor: trainer.brand_color_primary + '33',
            }}
          >
            {trainer.name.split(' ').map(n => n[0]).join('')}
          </div>
        )}

        {/* Logo */}
        {trainer.logo_url && (
          <img
            src={trainer.logo_url}
            alt={`${trainer.name} logo`}
            className="h-8 mx-auto mb-3 object-contain"
          />
        )}

        {/* Name */}
        <p
          className="text-xs font-semibold tracking-[0.2em] uppercase mb-4"
          style={{ color: trainer.brand_color_primary }}
        >
          {trainer.name}
        </p>

        {/* Headline */}
        <h1 className="text-[1.7rem] leading-[1.2] sm:text-4xl font-bold text-white mb-3">
          Find out how long it&apos;ll take to reach your goal
        </h1>

        {/* Subtext */}
        <p className="text-gray-400 text-base mb-8">
          Free personalised timeline in 60 seconds
        </p>

        {/* CTA — full width on mobile */}
        <button
          onClick={onStart}
          className="w-full py-4 rounded-2xl text-white font-semibold text-lg transition-all duration-300 active:scale-[0.97]"
          style={{
            backgroundColor: trainer.brand_color_primary,
            boxShadow: `0 4px 24px ${trainer.brand_color_primary}44`,
          }}
        >
          Get My Timeline
        </button>

        {/* Bio */}
        {trainer.bio && (
          <p className="text-gray-500 text-xs mt-8 max-w-xs mx-auto leading-relaxed">
            {trainer.bio}
          </p>
        )}
      </div>
    </div>
  );
}
