'use client';

import { Trainer, FormData, TimelineResult, GoalType, TrainerBranding } from '@/types';

interface CTASectionProps {
  trainer: Trainer;
  branding: TrainerBranding;
  formData: FormData;
  result: TimelineResult;
  goalLabel: string;
  leadId: string | null;
  isPreview?: boolean;
}

const goalEmojis: Record<GoalType, string> = {
  weight_loss: '🔥',
  muscle_gain: '💪',
  fitness: '❤️',
  performance: '🏃',
};

/** Plain-text lead summary reused for WhatsApp messages and email bodies. */
function buildLeadMessage(trainer: Trainer, formData: FormData, result: TimelineResult, goalLabel: string): string {
  const bestPkg = result.packageComparisons.find((p) => p.isBestValue);
  const goalEmoji = formData.goalType ? goalEmojis[formData.goalType] : '';

  let message = `Hi ${trainer.name}! ${goalEmoji}\n\n`;
  message += `I just used your FomoForm and I'm interested in working with you.\n\n`;
  message += `Here are my details:\n`;
  message += `- Name: ${formData.name}\n`;
  message += `- Goal: ${goalLabel}\n`;
  if (formData.currentWeight) message += `- Current weight: ${Math.round(formData.currentWeight)}kg\n`;
  if (formData.goalWeight) message += `- Goal weight: ${Math.round(formData.goalWeight)}kg\n`;
  if (formData.age) message += `- Age: ${formData.age}\n`;
  if (formData.experienceLevel) {
    const expLabels = { beginner: 'Beginner', intermediate: 'Some experience', advanced: 'Experienced' };
    message += `- Experience: ${expLabels[formData.experienceLevel]}\n`;
  }
  message += `- Available days: ${formData.availableDays} per week\n`;
  message += `- Estimated timeline: ~${result.estimatedWeeks} weeks\n`;

  if (formData.customAboutFields && Object.keys(formData.customAboutFields).length > 0) {
    for (const [, value] of Object.entries(formData.customAboutFields)) {
      if (value?.trim()) message += `- ${value}\n`;
    }
  }

  if (formData.customAnswers && Object.keys(formData.customAnswers).length > 0) {
    for (const [, value] of Object.entries(formData.customAnswers)) {
      const answerStr = Array.isArray(value) ? value.join(', ') : value;
      if (answerStr) message += `- ${answerStr}\n`;
    }
  }

  if (bestPkg) message += `\nI'm most interested in the ${bestPkg.packageName} package (~${bestPkg.estimatedWeeks} weeks to goal).\n`;
  message += `\nCould we have a chat about getting started?`;
  return message;
}

function trackAction(leadId: string | null, action: string) {
  if (!leadId) return;
  fetch('/api/track-action', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ leadId, action }),
  }).catch(() => {});
}

// Contact-method-specific icons
function WhatsAppIcon() {
  return (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  );
}

interface PrimaryCTA {
  href: string;
  label: string;
  helperText: string;
  icon: React.ReactNode;
  backgroundColor: string;
  shadowColor: string;
  trackName: string;
  textColor?: string;
}

function resolvePrimaryCTA(
  trainer: Trainer,
  formData: FormData,
  result: TimelineResult,
  goalLabel: string,
  branding: TrainerBranding,
): PrimaryCTA | null {
  const body = buildLeadMessage(trainer, formData, result, goalLabel);
  const subject = `${formData.name} — ${goalLabel}`;

  switch (trainer.contact_method) {
    case 'email': {
      const email = trainer.contact_value.trim();
      if (!email) return null;
      return {
        href: `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
        label: `Email ${trainer.name.split(' ')[0]}`,
        helperText: `Tap below to email ${trainer.name.split(' ')[0]} with your details`,
        icon: <EmailIcon />,
        backgroundColor: branding.color_primary,
        shadowColor: branding.color_primary + '44',
        trackName: 'email_clicked',
      };
    }

    case 'calendly':
    case 'link': {
      const url = trainer.contact_value.trim();
      if (!url || !/^https?:\/\//i.test(url)) return null;
      return {
        href: url,
        label: trainer.contact_method === 'calendly' ? 'Book a consultation' : 'Get started',
        helperText: trainer.contact_method === 'calendly'
          ? `Pick a time that works for you`
          : `Tap below to get started with ${trainer.name.split(' ')[0]}`,
        icon: trainer.contact_method === 'calendly' ? <CalendarIcon /> : <LinkIcon />,
        backgroundColor: branding.color_primary,
        shadowColor: branding.color_primary + '44',
        trackName: trainer.contact_method === 'calendly' ? 'booking_clicked' : 'link_clicked',
      };
    }

    case 'whatsapp':
    default: {
      const phone = trainer.contact_value.replace(/[^0-9]/g, '');
      if (!phone) return null;
      return {
        href: `https://wa.me/${phone}?text=${encodeURIComponent(body)}`,
        label: 'Message on WhatsApp',
        helperText: `Tap below to message ${trainer.name.split(' ')[0]} with your details`,
        icon: <WhatsAppIcon />,
        backgroundColor: '#25D366',
        shadowColor: 'rgba(37, 211, 102, 0.3)',
        trackName: 'whatsapp_clicked',
      };
    }
  }
}

export default function CTASection({ trainer, branding, formData, result, goalLabel, leadId, isPreview }: CTASectionProps) {
  const primary = resolvePrimaryCTA(trainer, formData, result, goalLabel, branding);
  const isDemo = trainer.slug === 'demo-pt';
  const disableActions = isPreview || isDemo;

  // Secondary "Book a consultation directly" link only shows when the primary
  // isn't already a booking flow and the coach has a separate booking_link.
  const showSecondaryBooking =
    !!trainer.booking_link &&
    trainer.contact_method !== 'calendly' &&
    trainer.contact_method !== 'link' &&
    !disableActions;

  const handlePrimaryClick = () => {
    if (primary) trackAction(leadId, primary.trackName);
    // Mark results step as completed in analytics
    const sessionId = typeof window !== 'undefined' ? sessionStorage.getItem('fomo_session') : null;
    if (sessionId) {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trainerId: trainer.id, sessionId, step: 'results', action: 'completed' }),
      }).catch(() => {});
    }
  };

  const handleBookingClick = () => {
    trackAction(leadId, 'booking_clicked');
  };

  return (
    <div className="rounded-2xl p-8 text-center" style={{ backgroundColor: branding.color_primary + '10' }}>
      {trainer.photo_url ? (
        <div className="w-20 h-20 rounded-full mx-auto mb-4 border-[3px] bg-cover bg-center"
          style={{ borderColor: branding.color_primary, backgroundImage: `url(${trainer.photo_url})` }} />
      ) : (
        <div className="w-20 h-20 rounded-full mx-auto mb-4 border-[3px] flex items-center justify-center text-2xl font-bold"
          style={{ borderColor: branding.color_primary, backgroundColor: branding.color_primary + '33', color: branding.color_text }}>
          {trainer.name.split(' ').map(n => n[0]).join('')}
        </div>
      )}

      <h3 className="text-xl font-bold mb-2" style={{ color: branding.color_text, fontFamily: 'var(--font-heading)' }}>
        Ready to get started?
      </h3>
      <p className="text-sm mb-6" style={{ color: branding.color_text_muted }}>
        {primary?.helperText ?? `Tap below to contact ${trainer.name}`}
      </p>

      {disableActions ? (
        <div className="w-full py-4 rounded-xl text-white font-semibold text-lg text-center opacity-60 cursor-not-allowed"
          style={{ backgroundColor: primary?.backgroundColor || branding.color_primary }}>
          {isDemo ? `${primary?.label ?? 'Contact coach'} (demo)` : `${primary?.label ?? 'Contact coach'} (disabled in preview)`}
        </div>
      ) : primary ? (
        <a href={primary.href} target="_blank" rel="noopener noreferrer" onClick={handlePrimaryClick}
          className="inline-flex items-center justify-center gap-3 w-full py-4 rounded-xl text-white font-semibold text-lg transition-all duration-300 hover:scale-[1.02] active:scale-95"
          style={{ backgroundColor: primary.backgroundColor, boxShadow: `0 4px 24px ${primary.shadowColor}` }}>
          {primary.icon}
          {primary.label}
        </a>
      ) : (
        <p className="text-sm" style={{ color: branding.color_text_muted }}>
          No contact method set up yet.
        </p>
      )}

      {showSecondaryBooking && (
        <a href={trainer.booking_link} target="_blank" rel="noopener noreferrer" onClick={handleBookingClick}
          className="block mt-4 text-sm underline underline-offset-2 transition-colors"
          style={{ color: branding.color_text_muted }}>
          Or book a consultation directly
        </a>
      )}
    </div>
  );
}
