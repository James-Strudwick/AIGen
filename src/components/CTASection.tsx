'use client';

import { Trainer } from '@/types';

interface CTASectionProps {
  trainer: Trainer;
}

function getContactLabel(method: string): string {
  switch (method) {
    case 'whatsapp': return 'WhatsApp';
    case 'email': return 'Email';
    case 'calendly': return 'Calendly';
    default: return 'Contact';
  }
}

function getContactUrl(trainer: Trainer): string {
  switch (trainer.contact_method) {
    case 'whatsapp':
      return `https://wa.me/${trainer.contact_value.replace(/[^0-9+]/g, '')}`;
    case 'email':
      return `mailto:${trainer.contact_value}`;
    default:
      return trainer.contact_value;
  }
}

export default function CTASection({ trainer }: CTASectionProps) {
  return (
    <div
      className="rounded-2xl p-8 text-center"
      style={{ backgroundColor: trainer.brand_color_primary + '10' }}
    >
      {/* PT Photo */}
      {trainer.photo_url ? (
        <div
          className="w-20 h-20 rounded-full mx-auto mb-4 border-3 bg-cover bg-center"
          style={{
            borderColor: trainer.brand_color_primary,
            backgroundImage: `url(${trainer.photo_url})`,
          }}
        />
      ) : (
        <div
          className="w-20 h-20 rounded-full mx-auto mb-4 border-3 flex items-center justify-center text-2xl font-bold text-white"
          style={{
            borderColor: trainer.brand_color_primary,
            backgroundColor: trainer.brand_color_primary + '33',
          }}
        >
          {trainer.name.split(' ').map(n => n[0]).join('')}
        </div>
      )}

      <h3 className="text-xl font-bold text-white mb-2">
        Ready to start your journey with {trainer.name}?
      </h3>
      <p className="text-gray-400 text-sm mb-6">
        Book your first session and start transforming today
      </p>

      <a
        href={trainer.booking_link}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block w-full py-4 rounded-xl text-white font-semibold text-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-95"
        style={{
          backgroundColor: trainer.brand_color_primary,
          boxShadow: `0 4px 24px ${trainer.brand_color_primary}44`,
        }}
      >
        Book Now
      </a>

      <a
        href={getContactUrl(trainer)}
        target="_blank"
        rel="noopener noreferrer"
        className="block mt-3 text-gray-400 text-sm hover:text-gray-300 transition-colors"
      >
        Have questions? Message {trainer.name} on {getContactLabel(trainer.contact_method)}
      </a>
    </div>
  );
}
