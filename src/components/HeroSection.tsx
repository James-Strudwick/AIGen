'use client';

import { Trainer, TrainerBranding } from '@/types';

interface HeroSectionProps {
  trainer: Trainer;
  branding: TrainerBranding;
  onStart: () => void;
}

export default function HeroSection({ trainer, branding, onStart }: HeroSectionProps) {
  const hasHeroImage = !!branding.hero_image_url;

  return (
    <div
      className="min-h-[100dvh] flex flex-col items-center justify-center px-5 text-center relative overflow-hidden"
      style={{ backgroundColor: branding.color_background }}
    >
      {/* Hero background image */}
      {hasHeroImage && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${branding.hero_image_url})` }}
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: branding.color_background,
              opacity: branding.hero_overlay_opacity,
            }}
          />
        </>
      )}

      {/* Gradient overlay */}
      {!hasHeroImage && (
        <div
          className="absolute inset-0 opacity-10"
          style={{
            background: `radial-gradient(circle at 50% 30%, ${branding.color_primary}, transparent 70%)`,
          }}
        />
      )}

      <div className="relative z-10 w-full max-w-md mx-auto">
        {/* PT Photo */}
        {trainer.photo_url ? (
          <div
            className="w-24 h-24 rounded-full mx-auto mb-5 border-[3px] bg-cover bg-center"
            style={{
              borderColor: branding.color_primary,
              backgroundImage: `url(${trainer.photo_url})`,
            }}
          />
        ) : (
          <div
            className="w-24 h-24 rounded-full mx-auto mb-5 border-[3px] flex items-center justify-center text-2xl font-bold"
            style={{
              borderColor: branding.color_primary,
              backgroundColor: branding.color_primary + '33',
              color: branding.color_text,
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
          style={{ color: branding.color_primary }}
        >
          {trainer.name}
        </p>

        {/* Headline */}
        <h1
          className="text-[1.7rem] leading-[1.2] sm:text-4xl font-bold mb-3"
          style={{ color: branding.color_text, fontFamily: 'var(--font-heading)' }}
        >
          Find out how long it&apos;ll take to reach your goal
        </h1>

        {/* Subtext */}
        <p className="text-base mb-8" style={{ color: branding.color_text_muted }}>
          Free personalised timeline in 60 seconds
        </p>

        {/* CTA */}
        <button
          onClick={onStart}
          className="w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-300 active:scale-[0.97]"
          style={{
            backgroundColor: branding.color_primary,
            color: '#ffffff',
            boxShadow: `0 4px 24px ${branding.color_primary}44`,
          }}
        >
          Get My Timeline
        </button>

        {/* Bio */}
        {trainer.bio && (
          <p className="text-xs mt-8 max-w-xs mx-auto leading-relaxed" style={{ color: branding.color_text_muted }}>
            {trainer.bio}
          </p>
        )}
      </div>
    </div>
  );
}
