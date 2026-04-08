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

function buildWhatsAppMessage(trainer: Trainer, formData: FormData, result: TimelineResult, goalLabel: string): string {
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

  // Include custom answers if any
  // Custom about fields
  if (formData.customAboutFields && Object.keys(formData.customAboutFields).length > 0) {
    for (const [, value] of Object.entries(formData.customAboutFields)) {
      if (value?.trim()) message += `- ${value}\n`;
    }
  }

  // Custom question answers
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
  }).catch(() => {}); // Fire and forget
}

export default function CTASection({ trainer, branding, formData, result, goalLabel, leadId, isPreview }: CTASectionProps) {
  const phone = trainer.contact_value.replace(/[^0-9]/g, '');
  const message = buildWhatsAppMessage(trainer, formData, result, goalLabel);
  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  const isDemo = trainer.slug === 'demo-pt';
  const disableActions = isPreview || isDemo;
  const handleWhatsAppClick = () => {
    trackAction(leadId, 'whatsapp_clicked');
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
        Tap below to message {trainer.name} with your details
      </p>

      {disableActions ? (
        <div className="w-full py-4 rounded-xl text-white font-semibold text-lg text-center opacity-60 cursor-not-allowed"
          style={{ backgroundColor: '#25D366' }}>
          {isDemo ? 'Message on WhatsApp (demo)' : 'WhatsApp button (disabled in preview)'}
        </div>
      ) : (
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" onClick={handleWhatsAppClick}
          className="inline-flex items-center justify-center gap-3 w-full py-4 rounded-xl text-white font-semibold text-lg transition-all duration-300 hover:scale-[1.02] active:scale-95"
          style={{ backgroundColor: '#25D366', boxShadow: '0 4px 24px rgba(37, 211, 102, 0.3)' }}>
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Message on WhatsApp
        </a>
      )}

      {trainer.booking_link && !disableActions && (
        <a href={trainer.booking_link} target="_blank" rel="noopener noreferrer" onClick={handleBookingClick}
          className="block mt-4 text-sm underline underline-offset-2 transition-colors"
          style={{ color: branding.color_text_muted }}>
          Or book a consultation directly
        </a>
      )}
    </div>
  );
}
