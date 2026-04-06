'use client';

import { useState, useEffect, useCallback } from 'react';
import { createBrowserClient } from '@/lib/auth';
import { AVAILABLE_FONTS, getGoogleFontsUrl } from '@/lib/branding';
import { ServiceAddOn, CustomQuestion } from '@/types';
import PhoneInput from '@/components/PhoneInput';
import { CopyPreview, SpecialtiesPreview, ServicesPreview, PackagesPreview, CustomQuestionsPreview } from '@/components/SettingsPreview';
import Link from 'next/link';

interface PackageInput {
  name: string;
  sessions_per_week: string;
  price_per_session: string;
  monthly_price: string;
  is_online: boolean;
}

type Tab = 'details' | 'branding' | 'copy' | 'questions' | 'specialties' | 'services' | 'packages' | 'billing';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Read initial tab from URL query param
  const [initialTabSet, setInitialTabSet] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('none');
  const [billingLoading, setBillingLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('details');
  const [trainerId, setTrainerId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '', bio: '', slug: '', photo_url: '', logo_url: '',
    booking_link: '', contact_method: 'whatsapp', contact_value: '',
    brand_color_primary: '#1a1a1a', color_text: '', color_text_muted: '',
    font_heading: 'system-ui', font_body: 'system-ui',
    theme: 'light' as 'light' | 'dark', hero_headline: '', hero_subtext: '',
    cta_button_text: '', tone: '',
  });

  const [addOns, setAddOns] = useState<ServiceAddOn[]>([]);
  const [showPrices, setShowPrices] = useState(true);
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);
  const [specialties, setSpecialties] = useState<{ name: string; description: string }[]>([]);
  const [pkgs, setPkgs] = useState<PackageInput[]>([
    { name: '', sessions_per_week: '2', price_per_session: '', monthly_price: '', is_online: false },
  ]);

  useEffect(() => {
    const load = async () => {
      const supabase = createBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { window.location.href = '/login'; return; }

      const res = await fetch('/api/me', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) { window.location.href = '/login'; return; }

      const { trainer, packages: existingPkgs } = await res.json();
      setTrainerId(trainer.id);
      setSubscriptionStatus(trainer.subscription_status || 'none');

      setForm({
        name: trainer.name || '', bio: trainer.bio || '', slug: trainer.slug || '',
        photo_url: trainer.photo_url || '', logo_url: trainer.logo_url || '',
        booking_link: trainer.booking_link || '', contact_method: trainer.contact_method || 'whatsapp',
        contact_value: trainer.contact_value || '',
        brand_color_primary: trainer.branding?.color_primary || trainer.brand_color_primary || '#1a1a1a',
        color_text: trainer.branding?.color_text || '',
        color_text_muted: trainer.branding?.color_text_muted || '',
        font_heading: trainer.branding?.font_heading || 'system-ui',
        font_body: trainer.branding?.font_body || 'system-ui',
        theme: trainer.branding?.theme || 'light',
        hero_headline: trainer.copy?.hero_headline || '', hero_subtext: trainer.copy?.hero_subtext || '',
        cta_button_text: trainer.copy?.cta_button_text || '', tone: trainer.copy?.tone || '',
      });

      if (trainer.services?.add_ons?.length) setAddOns(trainer.services.add_ons);
      if (trainer.services?.show_prices !== undefined) setShowPrices(trainer.services.show_prices);
      if (trainer.specialties?.length) setSpecialties(trainer.specialties);
      if (trainer.custom_questions?.length) setCustomQuestions(trainer.custom_questions);

      if (existingPkgs?.length > 0) {
        setPkgs(existingPkgs.map((p: Record<string, unknown>) => ({
          name: p.name as string,
          sessions_per_week: String(p.sessions_per_week),
          price_per_session: p.price_per_session ? String(p.price_per_session) : '',
          monthly_price: p.monthly_price ? String(p.monthly_price) : '',
          is_online: p.is_online as boolean,
        })));
      }

      setLoading(false);

      // Set initial tab from URL if provided
      if (!initialTabSet) {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab') as Tab | null;
        if (tab && ['details', 'branding', 'copy', 'questions', 'specialties', 'services', 'packages', 'billing'].includes(tab)) {
          setActiveTab(tab);
        }
        setInitialTabSet(true);
      }
    };
    load();
  }, [initialTabSet]);

  const handleSave = useCallback(async () => {
    if (!trainerId) return;
    setSaving(true);
    setSaved(false);

    const brandingData = {
      color_primary: form.brand_color_primary, color_secondary: '#f5f5f7',
      color_accent: form.brand_color_primary,
      color_background: form.theme === 'dark' ? '#0a0a0a' : '#ffffff',
      color_text: form.color_text || (form.theme === 'dark' ? '#ffffff' : '#1a1a1a'),
      color_text_muted: form.color_text_muted || (form.theme === 'dark' ? '#9ca3af' : '#8e8e93'),
      color_card: form.theme === 'dark' ? 'rgba(255,255,255,0.04)' : '#f5f5f7',
      color_border: form.theme === 'dark' ? 'rgba(255,255,255,0.08)' : '#e5e5ea',
      font_heading: form.font_heading, font_body: form.font_body,
      theme: form.theme, hero_image_url: null, hero_overlay_opacity: 0.6,
    };

    const copyData = (form.hero_headline || form.hero_subtext || form.cta_button_text || form.tone) ? {
      hero_headline: form.hero_headline || null, hero_subtext: form.hero_subtext || null,
      cta_button_text: form.cta_button_text || null, tone: form.tone || null,
    } : null;

    const trainerData = {
      name: form.name, bio: form.bio || null, slug: form.slug,
      photo_url: form.photo_url || null, logo_url: form.logo_url || null,
      booking_link: form.booking_link, contact_method: form.contact_method,
      contact_value: form.contact_value, brand_color_primary: form.brand_color_primary,
      brand_color_secondary: form.theme === 'dark' ? '#0a0a0a' : '#f5f5f7',
      branding: brandingData, copy: copyData,
      specialties: specialties.filter(s => s.name.trim()).length > 0
        ? specialties.filter(s => s.name.trim()).map(s => ({ name: s.name.trim(), description: s.description.trim() }))
        : null,
      services: { show_prices: showPrices, add_ons: addOns.filter(a => a.name.trim()) },
      custom_questions: customQuestions.filter(q => q.question.trim()).length > 0
        ? customQuestions.filter(q => q.question.trim())
        : null,
    };

    const packageRows = pkgs.filter(p => p.name.trim()).map(p => ({
      name: p.name, sessions_per_week: parseInt(p.sessions_per_week) || 0,
      price_per_session: p.price_per_session ? parseFloat(p.price_per_session) : null,
      monthly_price: p.monthly_price ? parseFloat(p.monthly_price) : null,
      is_online: p.is_online,
    }));

    const res = await fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trainerId, trainerData, packages: packageRows }),
    });

    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }, [trainerId, form, specialties, addOns, showPrices, pkgs]);

  const inputClass = "w-full bg-[#f5f5f7] border border-[#e5e5ea] rounded-xl px-4 py-3 text-[#1a1a1a] text-base placeholder-[#8e8e93] focus:outline-none focus:border-[#8e8e93]";

  if (loading) {
    return <div className="min-h-[100dvh] bg-white flex items-center justify-center"><p className="text-[#8e8e93]">Loading...</p></div>;
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'details', label: 'Details' },
    { id: 'branding', label: 'Branding' },
    { id: 'copy', label: 'Copy' },
    { id: 'questions', label: 'Questions' },
    { id: 'specialties', label: 'Specialties' },
    { id: 'services', label: 'Services' },
    { id: 'packages', label: 'Packages' },
    { id: 'billing', label: 'Billing' },
  ];

  return (
    <div className="min-h-[100dvh] bg-white">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Settings</h1>
            <p className="text-[#8e8e93] text-sm">{form.name}</p>
          </div>
          <Link href="/dashboard" className="text-[#8e8e93] text-sm px-3 py-1.5 rounded-lg bg-[#f5f5f7] hover:bg-[#e5e5ea] transition-colors">
            Back to dashboard
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-2 mb-6 -mx-4 px-4">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition-all flex-shrink-0"
              style={{
                backgroundColor: activeTab === tab.id ? '#1a1a1a' : '#f5f5f7',
                color: activeTab === tab.id ? '#ffffff' : '#8e8e93',
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Details */}
        {activeTab === 'details' && (
          <div className="space-y-4">
            <div>
              <label className="text-[#8e8e93] text-xs block mb-1">Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="text-[#8e8e93] text-xs block mb-1">URL slug</label>
              <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })} className={inputClass} />
            </div>
            <div>
              <label className="text-[#8e8e93] text-xs block mb-1">Bio</label>
              <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={2} className={inputClass} />
            </div>
            <div>
              <label className="text-[#8e8e93] text-xs block mb-1">WhatsApp number</label>
              <PhoneInput value={form.contact_value} onChange={(v) => setForm({ ...form, contact_value: v })} />
            </div>
            <div>
              <label className="text-[#8e8e93] text-xs block mb-1">Booking link</label>
              <input value={form.booking_link} onChange={(e) => setForm({ ...form, booking_link: e.target.value })} className={inputClass} />
            </div>
          </div>
        )}

        {/* Branding */}
        {activeTab === 'branding' && (
          <div className="space-y-5">
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
              <label className="text-[#8e8e93] text-xs block mb-2">Brand colour</label>
              <div className="flex gap-2 items-center">
                <input type="color" value={form.brand_color_primary} onChange={(e) => setForm({ ...form, brand_color_primary: e.target.value })}
                  className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0" />
                <input value={form.brand_color_primary} onChange={(e) => setForm({ ...form, brand_color_primary: e.target.value })} className={inputClass + ' font-mono'} />
              </div>
              <p className="text-[#8e8e93] text-[10px] mt-1">Used for buttons, accents, and highlights throughout your page</p>
            </div>
            <div>
              <label className="text-[#8e8e93] text-xs block mb-2">Text colours</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#8e8e93] text-[10px] block mb-1">Heading / body text</label>
                  <div className="flex gap-1.5 items-center">
                    <input type="color" value={form.color_text || (form.theme === 'dark' ? '#ffffff' : '#1a1a1a')}
                      onChange={(e) => setForm({ ...form, color_text: e.target.value })}
                      className="w-7 h-7 rounded cursor-pointer bg-transparent border-0 flex-shrink-0" />
                    <input value={form.color_text || (form.theme === 'dark' ? '#ffffff' : '#1a1a1a')}
                      onChange={(e) => setForm({ ...form, color_text: e.target.value })}
                      className="w-full bg-[#f5f5f7] border border-[#e5e5ea] rounded-lg px-2 py-1.5 text-[#1a1a1a] text-xs font-mono focus:outline-none focus:border-[#8e8e93]" />
                  </div>
                </div>
                <div>
                  <label className="text-[#8e8e93] text-[10px] block mb-1">Muted / secondary text</label>
                  <div className="flex gap-1.5 items-center">
                    <input type="color" value={form.color_text_muted || (form.theme === 'dark' ? '#9ca3af' : '#8e8e93')}
                      onChange={(e) => setForm({ ...form, color_text_muted: e.target.value })}
                      className="w-7 h-7 rounded cursor-pointer bg-transparent border-0 flex-shrink-0" />
                    <input value={form.color_text_muted || (form.theme === 'dark' ? '#9ca3af' : '#8e8e93')}
                      onChange={(e) => setForm({ ...form, color_text_muted: e.target.value })}
                      className="w-full bg-[#f5f5f7] border border-[#e5e5ea] rounded-lg px-2 py-1.5 text-[#1a1a1a] text-xs font-mono focus:outline-none focus:border-[#8e8e93]" />
                  </div>
                </div>
              </div>
</div>
            <div>
              <label className="text-[#8e8e93] text-xs block mb-2">Fonts</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#8e8e93] text-[10px] block mb-1">Heading font</label>
                  <select value={form.font_heading} onChange={(e) => setForm({ ...form, font_heading: e.target.value })} className={inputClass}>
                    {AVAILABLE_FONTS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[#8e8e93] text-[10px] block mb-1">Body font</label>
                  <select value={form.font_body} onChange={(e) => setForm({ ...form, font_body: e.target.value })} className={inputClass}>
                    {AVAILABLE_FONTS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div>
              <label className="text-[#8e8e93] text-xs block mb-2">Images</label>
              <div className="space-y-3">
                <div>
                  <label className="text-[#8e8e93] text-[10px] block mb-1">Profile photo URL</label>
                  <input value={form.photo_url} onChange={(e) => setForm({ ...form, photo_url: e.target.value })} placeholder="https://..." className={inputClass} />
                </div>
                <div>
                  <label className="text-[#8e8e93] text-[10px] block mb-1">Logo URL</label>
                  <input value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} placeholder="https://..." className={inputClass} />
                </div>
              </div>
            </div>
            {/* Preview */}
            <BrandingPreview
              theme={form.theme}
              primaryColor={form.brand_color_primary}
              fontHeading={form.font_heading}
              fontBody={form.font_body}
              textColor={form.color_text}
              textMutedColor={form.color_text_muted}
            />
          </div>
        )}

        {/* Copy */}
        {activeTab === 'copy' && (
          <div className="space-y-4">
            <p className="text-[#8e8e93] text-xs">Customise the text on your page. Leave blank for defaults.</p>
            <div>
              <label className="text-[#8e8e93] text-xs block mb-1">Hero headline</label>
              <input value={form.hero_headline} onChange={(e) => setForm({ ...form, hero_headline: e.target.value })}
                placeholder="Find out how long it'll take to reach your goal" className={inputClass} />
            </div>
            <div>
              <label className="text-[#8e8e93] text-xs block mb-1">Hero subtext</label>
              <input value={form.hero_subtext} onChange={(e) => setForm({ ...form, hero_subtext: e.target.value })}
                placeholder="Free personalised timeline in 60 seconds" className={inputClass} />
            </div>
            <div>
              <label className="text-[#8e8e93] text-xs block mb-1">CTA button text</label>
              <input value={form.cta_button_text} onChange={(e) => setForm({ ...form, cta_button_text: e.target.value })}
                placeholder="Get My Timeline" className={inputClass} />
            </div>
            <div>
              <label className="text-[#8e8e93] text-xs block mb-1">Your tone of voice</label>
              <textarea value={form.tone} onChange={(e) => setForm({ ...form, tone: e.target.value })}
                placeholder="e.g. Straight-talking but supportive. I keep it real." rows={3} className={inputClass} />
              <p className="text-[#8e8e93] text-[10px] mt-1">The AI will match this when writing your clients&apos; timelines.</p>
            </div>

            <CopyPreview
              theme={form.theme}
              primaryColor={form.brand_color_primary}
              headline={form.hero_headline}
              subtext={form.hero_subtext}
              ctaText={form.cta_button_text}
              trainerName={form.name}
              fontHeading={form.font_heading}
              fontBody={form.font_body}
            />
          </div>
        )}

        {/* Questions */}
        {activeTab === 'questions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[#8e8e93] text-xs">Add custom questions to your form. Answers feed into the AI narrative and appear on each lead.</p>
              <button onClick={() => setCustomQuestions([...customQuestions, {
                id: `q-${Date.now()}`, question: '', type: 'select', options: ['', ''], placeholder: '',
              }])}
                className="text-xs text-[#007AFF] font-medium flex-shrink-0 ml-3">+ Add</button>
            </div>

            {customQuestions.map((q, i) => (
              <div key={q.id} className="bg-[#f5f5f7] rounded-xl p-4 space-y-3">
                <div className="flex gap-2">
                  <input value={q.question}
                    onChange={(e) => { const u = [...customQuestions]; u[i] = { ...u[i], question: e.target.value }; setCustomQuestions(u); }}
                    placeholder="e.g. What's held you back before?"
                    className={inputClass} />
                  <button onClick={() => setCustomQuestions(customQuestions.filter((_, idx) => idx !== i))}
                    className="text-[#FF3B30] text-xs px-2 flex-shrink-0">Remove</button>
                </div>

                <div>
                  <label className="text-[#8e8e93] text-[10px] block mb-1">Answer type</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {([
                      { value: 'text' as const, label: 'Text' },
                      { value: 'select' as const, label: 'Single choice' },
                      { value: 'multiselect' as const, label: 'Multi choice' },
                    ]).map((t) => (
                      <button key={t.value}
                        onClick={() => { const u = [...customQuestions]; u[i] = { ...u[i], type: t.value }; setCustomQuestions(u); }}
                        className="py-2 rounded-lg text-[11px] font-medium border transition-all"
                        style={{
                          backgroundColor: q.type === t.value ? '#1a1a1a' : 'white',
                          color: q.type === t.value ? '#ffffff' : '#8e8e93',
                          borderColor: q.type === t.value ? '#1a1a1a' : '#e5e5ea',
                        }}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {q.type === 'text' && (
                  <div>
                    <label className="text-[#8e8e93] text-[10px] block mb-1">Placeholder text</label>
                    <input value={q.placeholder}
                      onChange={(e) => { const u = [...customQuestions]; u[i] = { ...u[i], placeholder: e.target.value }; setCustomQuestions(u); }}
                      placeholder="e.g. Tell us more..."
                      className={inputClass} />
                  </div>
                )}

                {(q.type === 'select' || q.type === 'multiselect') && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[#8e8e93] text-[10px]">Options</label>
                      <button onClick={() => {
                        const u = [...customQuestions];
                        u[i] = { ...u[i], options: [...u[i].options, ''] };
                        setCustomQuestions(u);
                      }} className="text-[10px] text-[#007AFF] font-medium">+ Add option</button>
                    </div>
                    <div className="space-y-1.5">
                      {q.options.map((option, oi) => (
                        <div key={oi} className="flex gap-1.5">
                          <input value={option}
                            onChange={(e) => {
                              const u = [...customQuestions];
                              const opts = [...u[i].options];
                              opts[oi] = e.target.value;
                              u[i] = { ...u[i], options: opts };
                              setCustomQuestions(u);
                            }}
                            placeholder={`Option ${oi + 1}`}
                            className={inputClass} />
                          {q.options.length > 2 && (
                            <button onClick={() => {
                              const u = [...customQuestions];
                              u[i] = { ...u[i], options: u[i].options.filter((_, idx) => idx !== oi) };
                              setCustomQuestions(u);
                            }} className="text-[#FF3B30] text-[10px] px-1.5 flex-shrink-0">x</button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {customQuestions.length === 0 && (
              <button onClick={() => setCustomQuestions([
                { id: 'q-barriers', question: "What's held you back before?", type: 'select', options: ['Motivation', 'Time', 'Knowledge', 'Accountability', 'Injury'], placeholder: '' },
                { id: 'q-tried', question: 'Have you worked with a PT before?', type: 'select', options: ['No, this would be my first time', 'Yes, but it didn\'t work out', 'Yes, and it was great'], placeholder: '' },
              ])}
                className="w-full py-6 rounded-xl border border-dashed border-[#e5e5ea] text-[#8e8e93] text-sm hover:border-[#8e8e93] transition-colors">
                + Tap to add recommended questions
              </button>
            )}

            <CustomQuestionsPreview
              theme={form.theme}
              primaryColor={form.brand_color_primary}
              questions={customQuestions}
            />
          </div>
        )}

        {/* Specialties */}
        {activeTab === 'specialties' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[#8e8e93] text-xs">What makes you different? These show on your results page.</p>
              <button onClick={() => setSpecialties([...specialties, { name: '', description: '' }])}
                className="text-xs text-[#007AFF] font-medium">+ Add</button>
            </div>
            {specialties.map((s, i) => (
              <div key={i} className="bg-[#f5f5f7] rounded-xl p-3 space-y-2">
                <div className="flex gap-2">
                  <input value={s.name} onChange={(e) => { const u = [...specialties]; u[i] = { ...u[i], name: e.target.value }; setSpecialties(u); }}
                    placeholder="e.g. Body Transformation" className={inputClass} />
                  <button onClick={() => setSpecialties(specialties.filter((_, idx) => idx !== i))}
                    className="text-[#FF3B30] text-xs px-2">Remove</button>
                </div>
                <textarea value={s.description} onChange={(e) => { const u = [...specialties]; u[i] = { ...u[i], description: e.target.value }; setSpecialties(u); }}
                  placeholder="Description..." rows={2} className={inputClass} />
              </div>
            ))}
            {specialties.length === 0 && (
              <button onClick={() => setSpecialties([{ name: '', description: '' }])}
                className="w-full py-8 rounded-xl border border-dashed border-[#e5e5ea] text-[#8e8e93] text-sm hover:border-[#8e8e93] transition-colors">
                + Add your first specialty
              </button>
            )}

            <SpecialtiesPreview
              theme={form.theme}
              primaryColor={form.brand_color_primary}
              specialties={specialties}
            />
          </div>
        )}

        {/* Services */}
        {activeTab === 'services' && (
          <div className="space-y-4">
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

            <div className="flex items-center justify-between">
              <p className="font-medium text-sm">Add-on services</p>
              <button onClick={() => setAddOns([...addOns, { id: `addon-${Date.now()}`, name: '', description: '', timeline_reduction_percent: 15, price_per_month: null }])}
                className="text-xs text-[#007AFF] font-medium">+ Add</button>
            </div>

            {addOns.map((addOn, i) => (
              <div key={addOn.id} className="bg-[#f5f5f7] rounded-xl p-4 space-y-3">
                <div className="flex gap-2">
                  <input value={addOn.name} onChange={(e) => { const u = [...addOns]; u[i] = { ...u[i], name: e.target.value }; setAddOns(u); }}
                    placeholder="e.g. Nutrition Plan" className={inputClass} />
                  <button onClick={() => setAddOns(addOns.filter((_, idx) => idx !== i))}
                    className="text-[#FF3B30] text-xs px-2">Remove</button>
                </div>
                <textarea value={addOn.description} onChange={(e) => { const u = [...addOns]; u[i] = { ...u[i], description: e.target.value }; setAddOns(u); }}
                  placeholder="What's included..." rows={2} className={inputClass} />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[#8e8e93] text-[10px] block mb-0.5">Timeline impact</label>
                    <div className="flex items-center gap-2">
                      <input type="range" min={5} max={40} step={5} value={addOn.timeline_reduction_percent}
                        onChange={(e) => { const u = [...addOns]; u[i] = { ...u[i], timeline_reduction_percent: parseInt(e.target.value) }; setAddOns(u); }} className="flex-1" />
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

            {addOns.length === 0 && (
              <button onClick={() => setAddOns([
                { id: 'nutrition', name: 'Nutrition Plan', description: 'Personalised meal plans, macro targets, and weekly check-ins', timeline_reduction_percent: 20, price_per_month: null },
                { id: 'online', name: 'Online Programming', description: 'Structured workout plans for days you train alone', timeline_reduction_percent: 15, price_per_month: null },
                { id: 'hybrid', name: 'Hybrid Coaching', description: 'In-person + online + nutrition for the fastest results', timeline_reduction_percent: 30, price_per_month: null },
              ])}
                className="w-full py-4 rounded-xl border border-dashed border-[#e5e5ea] text-[#8e8e93] text-sm hover:border-[#8e8e93] transition-colors">
                + Tap to add recommended services
              </button>
            )}

            <ServicesPreview
              theme={form.theme}
              primaryColor={form.brand_color_primary}
              addOns={addOns}
              showPrices={showPrices}
            />
          </div>
        )}

        {/* Packages */}
        {activeTab === 'packages' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="font-medium text-sm">Training packages</p>
              <button onClick={() => setPkgs([...pkgs, { name: '', sessions_per_week: '3', price_per_session: '', monthly_price: '', is_online: false }])}
                className="text-xs text-[#007AFF] font-medium">+ Add</button>
            </div>
            {pkgs.map((pkg, i) => (
              <div key={i} className="bg-[#f5f5f7] rounded-xl p-4 space-y-3">
                <div className="flex gap-2">
                  <input value={pkg.name} onChange={(e) => { const u = [...pkgs]; u[i] = { ...u[i], name: e.target.value }; setPkgs(u); }}
                    placeholder="e.g. 2x Per Week" className={inputClass} />
                  {pkgs.length > 1 && (
                    <button onClick={() => setPkgs(pkgs.filter((_, idx) => idx !== i))} className="text-[#FF3B30] text-xs px-2">Remove</button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[#8e8e93] text-[10px] block mb-0.5">Sessions/wk</label>
                    <input type="number" value={pkg.sessions_per_week} onChange={(e) => { const u = [...pkgs]; u[i] = { ...u[i], sessions_per_week: e.target.value }; setPkgs(u); }} className={inputClass} />
                  </div>
                  <div>
                    <label className="text-[#8e8e93] text-[10px] block mb-0.5">£/session</label>
                    <input type="number" value={pkg.price_per_session} onChange={(e) => { const u = [...pkgs]; u[i] = { ...u[i], price_per_session: e.target.value }; setPkgs(u); }} className={inputClass} />
                  </div>
                  <div>
                    <label className="text-[#8e8e93] text-[10px] block mb-0.5">£/month</label>
                    <input type="number" value={pkg.monthly_price} onChange={(e) => { const u = [...pkgs]; u[i] = { ...u[i], monthly_price: e.target.value }; setPkgs(u); }} className={inputClass} />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-xs text-[#8e8e93]">
                  <input type="checkbox" checked={pkg.is_online} onChange={(e) => { const u = [...pkgs]; u[i] = { ...u[i], is_online: e.target.checked }; setPkgs(u); }} />
                  Online package
                </label>
              </div>
            ))}

            <PackagesPreview
              theme={form.theme}
              primaryColor={form.brand_color_primary}
              packages={pkgs}
              showPrices={showPrices}
            />
          </div>
        )}

        {/* Billing */}
        {activeTab === 'billing' && (
          <div className="space-y-5">
            {/* Current plan */}
            <div className="rounded-xl border border-[#e5e5ea] p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold text-sm">Current plan</p>
                <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                  style={{
                    backgroundColor: subscriptionStatus === 'active' ? '#34C75915' : '#FF3B3015',
                    color: subscriptionStatus === 'active' ? '#34C759' : '#FF3B30',
                  }}>
                  {subscriptionStatus === 'active' ? 'Active' : subscriptionStatus === 'past_due' ? 'Past due' : subscriptionStatus === 'cancelled' ? 'Cancelled' : 'No subscription'}
                </span>
              </div>

              {subscriptionStatus === 'active' ? (
                <div>
                  <p className="text-2xl font-bold tracking-tight">£9.99<span className="text-sm text-[#8e8e93] font-normal">/month</span></p>
                  <p className="text-[#8e8e93] text-xs mt-1">GoalCalc Pro — unlimited leads, all features</p>
                </div>
              ) : (
                <div>
                  <p className="text-[#8e8e93] text-sm">
                    {subscriptionStatus === 'none'
                      ? 'Subscribe to activate your landing page and start capturing leads.'
                      : 'Your subscription has ended. Resubscribe to reactivate your page.'}
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            {subscriptionStatus === 'active' ? (
              <button onClick={async () => {
                setBillingLoading(true);
                const supabase = (await import('@/lib/auth')).createBrowserClient();
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return;
                const res = await fetch('/api/billing-portal', {
                  method: 'POST',
                  headers: { Authorization: `Bearer ${session.access_token}` },
                });
                const data = await res.json();
                if (data.url) window.location.href = data.url;
                setBillingLoading(false);
              }} disabled={billingLoading}
                className="w-full py-3.5 rounded-xl bg-[#f5f5f7] text-[#1a1a1a] font-semibold text-sm hover:bg-[#e5e5ea] transition-all active:scale-[0.97] disabled:opacity-40">
                {billingLoading ? 'Loading...' : 'Manage subscription'}
              </button>
            ) : (
              <button onClick={async () => {
                setBillingLoading(true);
                const supabase = (await import('@/lib/auth')).createBrowserClient();
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return;
                const res = await fetch('/api/checkout', {
                  method: 'POST',
                  headers: { Authorization: `Bearer ${session.access_token}` },
                });
                const data = await res.json();
                if (data.url) window.location.href = data.url;
                setBillingLoading(false);
              }} disabled={billingLoading}
                className="w-full py-3.5 rounded-xl bg-[#1a1a1a] text-white font-semibold text-sm transition-all active:scale-[0.97] disabled:opacity-40">
                {billingLoading ? 'Loading...' : 'Subscribe — £9.99/month'}
              </button>
            )}

            <p className="text-[#8e8e93] text-[11px] text-center">
              Payments handled securely by Stripe. Cancel anytime.
            </p>
          </div>
        )}

        {/* Save — hide on billing tab */}
        {activeTab !== 'billing' && (
          <div className="mt-8 flex gap-3">
            <button onClick={handleSave} disabled={saving}
              className="flex-1 py-3.5 rounded-xl bg-[#1a1a1a] text-white font-semibold text-sm disabled:opacity-40 transition-all active:scale-[0.97]">
              {saving ? 'Saving...' : saved ? 'Saved!' : 'Save changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function BrandingPreview({ theme, primaryColor, fontHeading, fontBody, textColor, textMutedColor }: {
  theme: 'light' | 'dark';
  primaryColor: string;
  fontHeading: string;
  fontBody: string;
  textColor: string;
  textMutedColor: string;
}) {
  const bg = theme === 'dark' ? '#0a0a0a' : '#ffffff';
  const border = theme === 'dark' ? 'rgba(255,255,255,0.08)' : '#e5e5ea';
  const text = textColor || (theme === 'dark' ? '#ffffff' : '#1a1a1a');
  const muted = textMutedColor || (theme === 'dark' ? '#9ca3af' : '#8e8e93');

  const headingStack = fontHeading === 'system-ui' ? 'system-ui, sans-serif' : `'${fontHeading}', system-ui, sans-serif`;
  const bodyStack = fontBody === 'system-ui' ? 'system-ui, sans-serif' : `'${fontBody}', system-ui, sans-serif`;

  // Build Google Fonts URL for the selected fonts
  const fontsUrl = getGoogleFontsUrl({
    color_primary: primaryColor, color_secondary: '', color_accent: '',
    color_background: bg, color_text: text, color_text_muted: muted,
    color_card: '', color_border: border,
    font_heading: fontHeading, font_body: fontBody,
    theme, hero_image_url: null, hero_overlay_opacity: 0.6,
  });

  return (
    <div>
      <label className="text-[#8e8e93] text-xs block mb-2">Preview</label>
      {fontsUrl && <link rel="stylesheet" href={fontsUrl} />}
      <div className="rounded-xl p-5 border" style={{ backgroundColor: bg, borderColor: border }}>
        <p className="text-xl font-bold mb-1" style={{ color: text, fontFamily: headingStack }}>
          Heading text
        </p>
        <p className="text-sm mb-1" style={{ color: text, fontFamily: headingStack }}>
          Subheading text
        </p>
        <p className="text-sm mb-4" style={{ color: muted, fontFamily: bodyStack }}>
          This is what your body text will look like to prospects visiting your page.
        </p>
        <div className="flex gap-2">
          <div className="px-4 py-2 rounded-xl text-white text-xs font-semibold" style={{ backgroundColor: primaryColor, fontFamily: bodyStack }}>
            Get My Timeline
          </div>
          <div className="px-4 py-2 rounded-xl text-xs font-medium" style={{
            backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.04)' : '#f5f5f7',
            color: text, fontFamily: bodyStack,
          }}>
            Learn more
          </div>
        </div>
      </div>
    </div>
  );
}
