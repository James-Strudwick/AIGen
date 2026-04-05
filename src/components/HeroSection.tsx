'use client';

import { Trainer } from '@/types';

interface HeroSectionProps {
  trainer: Trainer;
  onStart: () => void;
}

export default function HeroSection({ trainer, onStart }: HeroSectionProps) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center relative overflow-hidden"
      style={{ backgroundColor: trainer.brand_color_secondary }}
    >
      {/* Gradient overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          background: `radial-gradient(circle at 50% 30%, ${trainer.brand_color_primary}, transparent 70%)`,
        }}
      />

      <div className="relative z-10 max-w-lg mx-auto">
        {/* PT Photo */}
        {trainer.photo_url ? (
          <div
            className="w-28 h-28 rounded-full mx-auto mb-6 border-4 bg-cover bg-center"
            style={{
              borderColor: trainer.brand_color_primary,
              backgroundImage: `url(${trainer.photo_url})`,
            }}
          />
        ) : (
          <div
            className="w-28 h-28 rounded-full mx-auto mb-6 border-4 flex items-center justify-center text-3xl font-bold text-white"
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
            className="h-10 mx-auto mb-4 object-contain"
          />
        )}

        {/* Name */}
        <p
          className="text-sm font-medium tracking-widest uppercase mb-4"
          style={{ color: trainer.brand_color_primary }}
        >
          {trainer.name}
        </p>

        {/* Headline */}
        <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-4">
          Find out exactly how long it&apos;ll take to reach your goal
        </h1>

        {/* Subtext */}
        <p className="text-gray-400 text-lg mb-8">
          Get your free personalised timeline in 60 seconds
        </p>

        {/* CTA */}
        <button
          onClick={onStart}
          className="w-full sm:w-auto px-10 py-4 rounded-xl text-white font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95"
          style={{
            backgroundColor: trainer.brand_color_primary,
            boxShadow: `0 4px 24px ${trainer.brand_color_primary}44`,
          }}
        >
          Get My Timeline
        </button>

        {/* Bio */}
        {trainer.bio && (
          <p className="text-gray-500 text-sm mt-8 max-w-sm mx-auto leading-relaxed">
            {trainer.bio}
          </p>
        )}
      </div>
    </div>
  );
}
