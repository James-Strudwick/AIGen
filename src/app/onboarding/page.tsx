'use client';

import { useState, useEffect, useCallback } from 'react';
import { createBrowserClient } from '@/lib/auth';
import { AVAILABLE_FONTS } from '@/lib/branding';
import { ServiceAddOn } from '@/types';
import PhoneInput from '@/components/PhoneInput';

type Step = 'basics' | 'branding' | 'services' | 'packages' | 'preview';
const steps: { id: Step; label: string }[] = [
  { id: 'basics', label: 'About you' },
  { id: 'branding', label: 'Branding' },
  { id: 'services', label: 'Services' },
  { id: 'packages', label: 'Packages' },
  { id: 'preview', label: 'Go live' },
];

interface PackageInput {
  name: string;
  sessions_per_week: string;
  price_per_session: string;
  monthly_price: string;
  is_online: boolean;
}

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState<Step>('basics');
  const [isExistingTrainer, setIsExistingTrainer] = useState(false);
  const [saving, setSaving] = useState(false);
  const [trainerId, setTrainerId] = useState<string | null>(null);
  const [slug, setSlug] = useState('');

  // Form state
  const [form, setForm] = useState({
    name: '',
    bio: '',
    slug: '',
    photo_url: '',
    logo_url: '',
    booking_link: '',
    contact_method: 'whatsapp',
    contact_value: '',
    brand_color_primary: '#1a1a1a',
    font_heading: 'system-ui',
    font_body: 'system-ui',
    theme: 'light' as 'light' | 'dark',
    hero_headline: '',
    tone: '',
  });

  const [addOns, setAddOns] = useState<ServiceAddOn[]>([]);
  const [showPrices, setShowPrices] = useState(true);

  const [pkgs, setPkgs] = useState<PackageInput[]>([
    { name: '', sessions_per_week: '2', price_per_session: '', monthly_price: '', is_online: false },
  ]);

  // Load trainer data on mount
  useEffect(() => {
    const loadTrainer = async () => {
      const supabase = createBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = '/login';
        return;
      }

      // Use API with service role to bypass RLS
      const res = await fetch('/api/me', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = '/login';
        }
        return;
      }

      const { trainer, packages: existingPkgs } = await res.json();

      if (trainer) {
        // If already active, redirect to settings instead
        if (trainer.active) {
          window.location.href = '/settings';
          return;
        }
        setTrainerId(trainer.id);
        setSlug(trainer.slug);
        setForm(prev => ({
          ...prev,
          name: trainer.name || prev.name,
          bio: trainer.bio || '',
          slug: trainer.slug || '',
          booking_link: trainer.booking_link || '',
          contact_method: trainer.contact_method || 'whatsapp',
          contact_value: trainer.contact_value || '',
          brand_color_primary: trainer.brand_color_primary || '#1a1a1a',
          ...(trainer.branding ? {
            font_heading: trainer.branding.font_heading || 'system-ui',
            font_body: trainer.branding.font_body || 'system-ui',
            theme: trainer.branding.theme || 'light',
            photo_url: trainer.photo_url || '',
            logo_url: trainer.logo_url || '',
            hero_headline: trainer.copy?.hero_headline || '',
            tone: trainer.copy?.tone || '',
          } : {}),
        }));

        if (trainer.services?.add_ons?.length) {
          setAddOns(trainer.services.add_ons);
        }
        if (trainer.services?.show_prices !== undefined) {
          setShowPrices(trainer.services.show_prices);
        }
        if (existingPkgs?.length > 0) {
          setPkgs(existingPkgs.map((p: Record<string, unknown>) => ({
            name: p.name as string,
            sessions_per_week: String(p.sessions_per_week),
            price_per_session: p.price_per_session ? String(p.price_per_session) : '',
            monthly_price: p.monthly_price ? String(p.monthly_price) : '',
            is_online: p.is_online as boolean,
          })));
        }
      }
    };
    loadTrainer();
  }, []);

  const buildTrainerData = useCallback(() => {
    const brandingData = {
      color_primary: form.brand_color_primary,
      color_secondary: '#f5f5f7',
      color_accent: form.brand_color_primary,
      color_background: form.theme === 'dark' ? '#0a0a0a' : '#ffffff',
      color_text: form.theme === 'dark' ? '#ffffff' : '#1a1a1a',
      color_text_muted: form.theme === 'dark' ? '#9ca3af' : '#8e8e93',
      color_card: form.theme === 'dark' ? 'rgba(255,255,255,0.04)' : '#f5f5f7',
      color_border: form.theme === 'dark' ? 'rgba(255,255,255,0.08)' : '#e5e5ea',
      font_heading: form.font_heading,
      font_body: form.font_body,
      theme: form.theme,
      hero_image_url: null,
      hero_overlay_opacity: 0.6,
    };

    const copyData = (form.hero_headline || form.tone) ? {
      hero_headline: form.hero_headline || null,
      hero_subtext: null,
      cta_button_text: null,
      tone: form.tone || null,
    } : null;

    return {
      name: form.name,
      bio: form.bio || null,
      slug: form.slug || slug,
      photo_url: form.photo_url || null,
      logo_url: form.logo_url || null,
      booking_link: form.booking_link,
      contact_method: form.contact_method,
      contact_value: form.contact_value,
      brand_color_primary: form.brand_color_primary,
      brand_color_secondary: form.theme === 'dark' ? '#0a0a0a' : '#f5f5f7',
      branding: brandingData,
      copy: copyData,
      services: {
        show_prices: showPrices,
        add_ons: addOns.filter(a => a.name.trim()),
      },
    };
  }, [form, slug, addOns, showPrices]);

  const saveProgress = useCallback(async () => {
    if (!trainerId) return;
    setSaving(true);

    await fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trainerId, trainerData: buildTrainerData() }),
    });

    setSaving(false);
  }, [trainerId, buildTrainerData]);

  const goLive = async () => {
    if (!trainerId) return;
    setSaving(true);

    const packageRows = pkgs.filter(p => p.name.trim()).map((p) => ({
      name: p.name,
      sessions_per_week: parseInt(p.sessions_per_week) || 0,
      price_per_session: p.price_per_session ? parseFloat(p.price_per_session) : null,
      monthly_price: p.monthly_price ? parseFloat(p.monthly_price) : null,
      is_online: p.is_online,
    }));

    const res = await fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        trainerId,
        trainerData: buildTrainerData(),
        packages: packageRows,
        goLive: true,
      }),
    });

    if (res.ok) {
      window.location.href = '/dashboard';
    } else {
      alert('Something went wrong. Please try again.');
    }
    setSaving(false);
  };

  const nextStep = async () => {
    await saveProgress();
    const idx = steps.findIndex(s => s.id === currentStep);
    if (idx < steps.length - 1) setCurrentStep(steps[idx + 1].id);
  };

  const prevStep = () => {
    const idx = steps.findIndex(s => s.id === currentStep);
    if (idx > 0) setCurrentStep(steps[idx - 1].id);
  };

  const inputClass = "w-full bg-[#f5f5f7] border border-[#e5e5ea] rounded-xl px-4 py-3 text-[#1a1a1a] text-base placeholder-[#8e8e93] focus:outline-none focus:border-[#8e8e93]";
  const currentIdx = steps.findIndex(s => s.id === currentStep);

  return (
    <div className="min-h-[100dvh] bg-white">
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Progress */}
        <div className="flex items-center gap-1.5 mb-2">
          {steps.map((s, i) => (
            <div key={s.id} className="h-1 flex-1 rounded-full transition-all duration-300"
              style={{ backgroundColor: i <= currentIdx ? '#1a1a1a' : '#e5e5ea' }} />
          ))}
        </div>
        <p className="text-[#8e8e93] text-xs mb-8">
          Step {currentIdx + 1} of {steps.length} — {steps[currentIdx].label}
        </p>

        {/* Step: Basics */}
        {currentStep === 'basics' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight">Let&apos;s get you set up</h2>
            <div>
              <label className="text-[#8e8e93] text-xs block mb-1">Your name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Alex Thompson" className={inputClass} />
            </div>
            <div>
              <label className="text-[#8e8e93] text-xs block mb-1">Your URL</label>
              <div className="flex items-center gap-0">
                <span className="text-[#8e8e93] text-sm bg-[#f5f5f7] border border-[#e5e5ea] border-r-0 rounded-l-xl px-3 py-3">fomoforms.com/</span>
                <input value={form.slug || slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                  placeholder="alex-thompson" className={inputClass + ' rounded-l-none'} />
              </div>
            </div>
            <div>
              <label className="text-[#8e8e93] text-xs block mb-1">Short bio</label>
              <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Certified PT with 8 years experience..." rows={2} className={inputClass} />
            </div>
            <div>
              <label className="text-[#8e8e93] text-xs block mb-1">WhatsApp number</label>
              <PhoneInput value={form.contact_value} onChange={(v) => setForm({ ...form, contact_value: v })} />
            </div>
            <div>
              <label className="text-[#8e8e93] text-xs block mb-1">Booking link (Calendly, etc.)</label>
              <input value={form.booking_link} onChange={(e) => setForm({ ...form, booking_link: e.target.value })}
                placeholder="https://calendly.com/you" className={inputClass} />
            </div>
          </div>
        )}

        {/* Step: Branding */}
        {currentStep === 'branding' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight">Make it yours</h2>
            <p className="text-[#8e8e93] text-sm">Choose your brand colour, font, and theme.</p>

            <div>
              <label className="text-[#8e8e93] text-xs block mb-1">Brand colour</label>
              <div className="flex gap-2 items-center">
                <input type="color" value={form.brand_color_primary}
                  onChange={(e) => setForm({ ...form, brand_color_primary: e.target.value })}
                  className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0" />
                <input value={form.brand_color_primary}
                  onChange={(e) => setForm({ ...form, brand_color_primary: e.target.value })}
                  className={inputClass + ' font-mono'} />
              </div>
            </div>

            <div>
              <label className="text-[#8e8e93] text-xs block mb-1">Theme</label>
              <div className="grid grid-cols-2 gap-2">
                {(['light', 'dark'] as const).map((t) => (
                  <button key={t} onClick={() => setForm({ ...form, theme: t })}
                    className="py-3 rounded-xl text-sm font-medium border transition-all"
                    style={{
                      backgroundColor: form.theme === t ? (t === 'dark' ? '#1a1a1a' : '#f5f5f7') : 'white',
                      color: form.theme === t ? (t === 'dark' ? '#fff' : '#1a1a1a') : '#8e8e93',
                      borderColor: form.theme === t ? '#1a1a1a' : '#e5e5ea',
                    }}>
                    {t === 'light' ? '☀️ Light' : '🌙 Dark'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[#8e8e93] text-xs block mb-1">Heading font</label>
              <select value={form.font_heading} onChange={(e) => setForm({ ...form, font_heading: e.target.value })} className={inputClass}>
                {AVAILABLE_FONTS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[#8e8e93] text-xs block mb-1">Photo URL</label>
              <input value={form.photo_url} onChange={(e) => setForm({ ...form, photo_url: e.target.value })}
                placeholder="https://..." className={inputClass} />
            </div>

            <div>
              <label className="text-[#8e8e93] text-xs block mb-1">Custom headline (optional)</label>
              <input value={form.hero_headline} onChange={(e) => setForm({ ...form, hero_headline: e.target.value })}
                placeholder="Find out how long it'll take to reach your goal" className={inputClass} />
            </div>

            <div>
              <label className="text-[#8e8e93] text-xs block mb-1">Your tone of voice (optional)</label>
              <textarea value={form.tone} onChange={(e) => setForm({ ...form, tone: e.target.value })}
                placeholder="e.g. Straight-talking but supportive. I keep it real." rows={2} className={inputClass} />
              <p className="text-[#8e8e93] text-[10px] mt-1">The AI will match this when writing your clients&apos; timelines.</p>
            </div>
          </div>
        )}

        {/* Step: Services */}
        {currentStep === 'services' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight">What do you offer?</h2>
            <p className="text-[#8e8e93] text-sm">
              Add services that prospects can toggle on to see how they speed up their timeline.
            </p>

            <div className="flex items-center justify-between rounded-xl border border-[#e5e5ea] p-4">
              <div>
                <p className="font-medium text-sm">Show pricing</p>
                <p className="text-[#8e8e93] text-xs">Display prices to prospects</p>
              </div>
              <button onClick={() => setShowPrices(!showPrices)}
                className="w-12 h-7 rounded-full p-0.5 transition-all duration-300"
                style={{ backgroundColor: showPrices ? '#34C759' : '#e5e5ea' }}>
                <div className="w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-300"
                  style={{ transform: showPrices ? 'translateX(20px)' : 'translateX(0)' }} />
              </button>
            </div>

            {addOns.map((addOn, i) => (
              <div key={addOn.id} className="bg-[#f5f5f7] rounded-xl p-4 space-y-3">
                <div className="flex gap-2">
                  <input value={addOn.name}
                    onChange={(e) => { const u = [...addOns]; u[i] = { ...u[i], name: e.target.value }; setAddOns(u); }}
                    placeholder="e.g. Nutrition Plan" className={inputClass} />
                  <button onClick={() => setAddOns(addOns.filter((_, idx) => idx !== i))}
                    className="text-[#FF3B30] text-xs px-2">Remove</button>
                </div>
                <textarea value={addOn.description}
                  onChange={(e) => { const u = [...addOns]; u[i] = { ...u[i], description: e.target.value }; setAddOns(u); }}
                  placeholder="What's included..." rows={2} className={inputClass} />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[#8e8e93] text-[10px] block mb-0.5">Timeline impact</label>
                    <div className="flex items-center gap-2">
                      <input type="range" min={5} max={40} step={5} value={addOn.timeline_reduction_percent}
                        onChange={(e) => { const u = [...addOns]; u[i] = { ...u[i], timeline_reduction_percent: parseInt(e.target.value) }; setAddOns(u); }}
                        className="flex-1" />
                      <span className="text-sm font-semibold min-w-[3ch] text-right">{addOn.timeline_reduction_percent}%</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[#8e8e93] text-[10px] block mb-0.5">£/month</label>
                    <input type="number" value={addOn.price_per_month || ''}
                      onChange={(e) => { const u = [...addOns]; u[i] = { ...u[i], price_per_month: e.target.value ? parseFloat(e.target.value) : null }; setAddOns(u); }}
                      placeholder="Optional" className={inputClass} />
                  </div>
                </div>
              </div>
            ))}

            <button onClick={() => addOns.length === 0 ? setAddOns([
              { id: 'nutrition', name: 'Nutrition Plan', description: 'Personalised meal plans, macro targets, and weekly check-ins', timeline_reduction_percent: 20, price_per_month: null },
              { id: 'online', name: 'Online Programming', description: 'Structured workout plans for days you train alone, with form check videos', timeline_reduction_percent: 15, price_per_month: null },
              { id: 'hybrid', name: 'Hybrid Coaching', description: 'In-person sessions + online programming + nutrition for the fastest results', timeline_reduction_percent: 30, price_per_month: null },
            ]) : setAddOns([...addOns, { id: `addon-${Date.now()}`, name: '', description: '', timeline_reduction_percent: 15, price_per_month: null }])}
              className="w-full py-4 rounded-xl border border-dashed border-[#e5e5ea] text-[#8e8e93] text-sm hover:border-[#8e8e93] transition-colors">
              {addOns.length === 0 ? '+ Tap to add recommended services' : '+ Add another service'}
            </button>
          </div>
        )}

        {/* Step: Packages */}
        {currentStep === 'packages' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight">Your training packages</h2>
            <p className="text-[#8e8e93] text-sm">
              Add the different session packages you offer. These show on the timeline so prospects can see how more sessions = faster results.
            </p>

            {pkgs.map((pkg, i) => (
              <div key={i} className="bg-[#f5f5f7] rounded-xl p-4 space-y-3">
                <div className="flex gap-2">
                  <input value={pkg.name}
                    onChange={(e) => { const u = [...pkgs]; u[i] = { ...u[i], name: e.target.value }; setPkgs(u); }}
                    placeholder="e.g. 2x Per Week" className={inputClass} />
                  {pkgs.length > 1 && (
                    <button onClick={() => setPkgs(pkgs.filter((_, idx) => idx !== i))}
                      className="text-[#FF3B30] text-xs px-2">Remove</button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[#8e8e93] text-[10px] block mb-0.5">Sessions/wk</label>
                    <input type="number" value={pkg.sessions_per_week}
                      onChange={(e) => { const u = [...pkgs]; u[i] = { ...u[i], sessions_per_week: e.target.value }; setPkgs(u); }}
                      className={inputClass} />
                  </div>
                  <div>
                    <label className="text-[#8e8e93] text-[10px] block mb-0.5">£/session</label>
                    <input type="number" value={pkg.price_per_session}
                      onChange={(e) => { const u = [...pkgs]; u[i] = { ...u[i], price_per_session: e.target.value }; setPkgs(u); }}
                      className={inputClass} />
                  </div>
                  <div>
                    <label className="text-[#8e8e93] text-[10px] block mb-0.5">£/month</label>
                    <input type="number" value={pkg.monthly_price}
                      onChange={(e) => { const u = [...pkgs]; u[i] = { ...u[i], monthly_price: e.target.value }; setPkgs(u); }}
                      className={inputClass} />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-xs text-[#8e8e93]">
                  <input type="checkbox" checked={pkg.is_online}
                    onChange={(e) => { const u = [...pkgs]; u[i] = { ...u[i], is_online: e.target.checked }; setPkgs(u); }} />
                  Online package
                </label>
              </div>
            ))}

            <button onClick={() => setPkgs([...pkgs, { name: '', sessions_per_week: '3', price_per_session: '', monthly_price: '', is_online: false }])}
              className="w-full py-3 rounded-xl border border-dashed border-[#e5e5ea] text-[#8e8e93] text-sm hover:border-[#8e8e93] transition-colors">
              + Add package
            </button>
          </div>
        )}

        {/* Step: Preview / Go Live */}
        {currentStep === 'preview' && (
          <div className="space-y-6 text-center">
            <h2 className="text-xl font-bold tracking-tight">You&apos;re ready!</h2>
            <p className="text-[#8e8e93] text-sm">
              Your page will be live at:
            </p>
            <p className="text-lg font-semibold" style={{ color: form.brand_color_primary }}>
              fomoforms.com/{form.slug || slug}
            </p>

            <a href={`/${form.slug || slug}`} target="_blank"
              className="inline-block text-[#007AFF] text-sm font-medium underline underline-offset-2">
              Preview your page
            </a>

            <button onClick={goLive} disabled={saving || !form.contact_value}
              className="w-full py-4 rounded-xl bg-[#1a1a1a] text-white font-semibold disabled:opacity-40 transition-all active:scale-[0.97]">
              {saving ? 'Going live...' : 'Go live'}
            </button>

            {!form.contact_value && (
              <p className="text-[#FF3B30] text-xs">Add a WhatsApp number in step 1 to go live</p>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          {currentIdx > 0 && (
            <button onClick={prevStep}
              className="flex-1 py-3 rounded-xl text-[#8e8e93] text-sm font-medium border border-[#e5e5ea] transition-all active:scale-[0.97]">
              Back
            </button>
          )}
          {currentStep !== 'preview' && (
            <button onClick={nextStep} disabled={saving}
              className="flex-1 py-3 rounded-xl bg-[#1a1a1a] text-white text-sm font-semibold disabled:opacity-40 transition-all active:scale-[0.97]">
              {saving ? 'Saving...' : 'Continue'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
