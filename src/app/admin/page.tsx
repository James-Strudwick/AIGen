'use client';

import { useState, useEffect, useCallback } from 'react';
import { Trainer, Package, TrainerSpecialty, TrainerBranding, ServiceAddOn } from '@/types';
import { supabase } from '@/lib/supabase';
import { AVAILABLE_FONTS, resolveBranding, resolveServices } from '@/lib/branding';

interface PackageInput {
  name: string;
  sessions_per_week: string;
  price_per_session: string;
  monthly_price: string;
  is_online: boolean;
  sort_order: string;
}

interface SpecialtyInput {
  name: string;
  description: string;
}

const emptyPackage: PackageInput = {
  name: '',
  sessions_per_week: '1',
  price_per_session: '',
  monthly_price: '',
  is_online: false,
  sort_order: '1',
};

export default function AdminPage() {
  const [trainers, setTrainers] = useState<(Trainer & { packages?: Package[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);

  const fetchTrainers = useCallback(async () => {
    const { data } = await supabase.from('trainers').select('*').order('created_at', { ascending: false });
    if (data) {
      const withPackages = await Promise.all(
        data.map(async (t) => {
          const { data: pkgs } = await supabase.from('packages').select('*').eq('trainer_id', t.id).order('sort_order');
          return { ...t, packages: pkgs || [] };
        })
      );
      setTrainers(withPackages as (Trainer & { packages: Package[] })[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchTrainers(); }, [fetchTrainers]);

  return (
    <div className="min-h-screen bg-white text-[#1a1a1a]">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">PT Admin</h1>
            <p className="text-[#8e8e93] text-sm mt-1">Manage trainers and packages</p>
          </div>
          <button onClick={() => setShowNew(!showNew)}
            className="bg-[#1a1a1a] hover:bg-black text-white px-4 py-2 rounded-xl font-medium transition-colors text-sm">
            {showNew ? 'Cancel' : '+ Add Trainer'}
          </button>
        </div>

        {showNew && <TrainerForm onSaved={() => { setShowNew(false); fetchTrainers(); }} onCancel={() => setShowNew(false)} />}

        {loading ? <p className="text-[#8e8e93]">Loading...</p> : trainers.length === 0 ? (
          <div className="text-center py-20 text-[#8e8e93]">
            <p className="text-lg">No trainers yet</p>
            <p className="text-sm mt-1">Click &quot;Add Trainer&quot; to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {trainers.map((trainer) => (
              <div key={trainer.id} className="bg-[#f5f5f7] rounded-2xl p-5">
                {editingId === trainer.id ? (
                  <TrainerForm trainer={trainer} existingPackages={trainer.packages}
                    onSaved={() => { setEditingId(null); fetchTrainers(); }} onCancel={() => setEditingId(null)} />
                ) : (
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                          style={{ backgroundColor: trainer.brand_color_primary }}>
                          {trainer.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h3 className="font-semibold">{trainer.name}</h3>
                          <p className="text-[#8e8e93] text-sm">/{trainer.slug}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <a href={`/${trainer.slug}`} target="_blank"
                          className="text-[#8e8e93] text-xs hover:text-[#1a1a1a] transition-colors px-3 py-1.5 rounded-lg bg-white">Preview</a>
                        <button onClick={() => setEditingId(trainer.id)}
                          className="text-[#8e8e93] text-xs hover:text-[#1a1a1a] transition-colors px-3 py-1.5 rounded-lg bg-white">Edit</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-[#8e8e93] text-[10px] block mb-1">{label}</label>
      <div className="flex gap-1.5 items-center">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)}
          className="w-7 h-7 rounded cursor-pointer bg-transparent border-0 flex-shrink-0" />
        <input value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full bg-[#f5f5f7] border border-[#e5e5ea] rounded-lg px-2 py-1.5 text-[#1a1a1a] text-xs font-mono focus:outline-none focus:border-[#8e8e93]" />
      </div>
    </div>
  );
}

function TrainerForm({ trainer, existingPackages, onSaved, onCancel }: {
  trainer?: Trainer; existingPackages?: Package[]; onSaved: () => void; onCancel: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'branding' | 'copy' | 'services' | 'specialties' | 'packages'>('details');

  const existingBranding = trainer ? resolveBranding(trainer) : null;

  const [form, setForm] = useState({
    slug: trainer?.slug || '',
    name: trainer?.name || '',
    bio: trainer?.bio || '',
    photo_url: trainer?.photo_url || '',
    brand_color_primary: trainer?.brand_color_primary || '#FF6B35',
    brand_color_secondary: trainer?.brand_color_secondary || '#1A1A2E',
    booking_link: trainer?.booking_link || '',
    contact_method: trainer?.contact_method || 'whatsapp',
    contact_value: trainer?.contact_value || '',
    logo_url: trainer?.logo_url || '',
  });

  const [branding, setBranding] = useState({
    color_primary: existingBranding?.color_primary || '#FF6B35',
    color_secondary: existingBranding?.color_secondary || '#1A1A2E',
    color_accent: existingBranding?.color_accent || '#FF6B35',
    color_background: existingBranding?.color_background || '#ffffff',
    color_text: existingBranding?.color_text || '#1a1a1a',
    color_text_muted: existingBranding?.color_text_muted || '#8e8e93',
    color_card: existingBranding?.color_card || '#f5f5f7',
    color_border: existingBranding?.color_border || '#e5e5ea',
    font_heading: existingBranding?.font_heading || 'system-ui',
    font_body: existingBranding?.font_body || 'system-ui',
    theme: existingBranding?.theme || 'light' as const,
    hero_image_url: existingBranding?.hero_image_url || '',
    hero_overlay_opacity: existingBranding?.hero_overlay_opacity ?? 0.6,
  });

  const resolvedServices = trainer ? resolveServices(trainer) : null;

  const [showPrices, setShowPrices] = useState(resolvedServices?.show_prices ?? true);
  const [addOns, setAddOns] = useState<ServiceAddOn[]>(resolvedServices?.add_ons ?? []);

  const [copy, setCopy] = useState({
    hero_headline: trainer?.copy?.hero_headline || '',
    hero_subtext: trainer?.copy?.hero_subtext || '',
    cta_button_text: trainer?.copy?.cta_button_text || '',
    tone: trainer?.copy?.tone || '',
  });

  const [specialties, setSpecialties] = useState<SpecialtyInput[]>(
    trainer?.specialties?.map((s: TrainerSpecialty) => ({ name: s.name, description: s.description })) || []
  );

  const [pkgs, setPkgs] = useState<PackageInput[]>(
    existingPackages?.map((p) => ({
      name: p.name, sessions_per_week: String(p.sessions_per_week),
      price_per_session: p.price_per_session ? String(p.price_per_session) : '',
      monthly_price: p.monthly_price ? String(p.monthly_price) : '',
      is_online: p.is_online, sort_order: String(p.sort_order),
    })) || [{ ...emptyPackage }]
  );

  const updateField = (field: string, value: string) => setForm({ ...form, [field]: value });
  const updateBranding = (field: string, value: string | number) => setBranding({ ...branding, [field]: value });

  const setTheme = (theme: 'dark' | 'light') => {
    if (theme === 'light') {
      setBranding({
        ...branding, theme,
        color_background: '#ffffff', color_text: '#1a1a1a', color_text_muted: '#8e8e93',
        color_card: '#f5f5f7', color_border: '#e5e5ea',
      });
    } else {
      setBranding({
        ...branding, theme,
        color_background: '#0a0a0a', color_text: '#ffffff', color_text_muted: '#9ca3af',
        color_card: 'rgba(255,255,255,0.04)', color_border: 'rgba(255,255,255,0.08)',
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const specialtiesData = specialties.filter((s) => s.name.trim()).map((s) => ({ name: s.name.trim(), description: s.description.trim() }));

      const brandingData: TrainerBranding = {
        ...branding,
        hero_image_url: branding.hero_image_url || null,
      };

      const trainerData = {
        slug: form.slug, name: form.name, bio: form.bio || null,
        photo_url: form.photo_url || null,
        brand_color_primary: branding.color_primary,
        brand_color_secondary: branding.color_secondary,
        booking_link: form.booking_link, contact_method: form.contact_method,
        contact_value: form.contact_value, logo_url: form.logo_url || null,
        specialties: specialtiesData.length > 0 ? specialtiesData : null,
        branding: brandingData,
        services: {
          show_prices: showPrices,
          add_ons: addOns.filter(a => a.name.trim()),
        },
        copy: (copy.hero_headline || copy.hero_subtext || copy.cta_button_text || copy.tone) ? copy : null,
      };

      let trainerId = trainer?.id;

      if (trainer) {
        const { error } = await supabase.from('trainers').update(trainerData).eq('id', trainer.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('trainers').insert(trainerData).select('id').single();
        if (error) throw error;
        trainerId = data.id;
      }

      if (trainerId) {
        await supabase.from('packages').delete().eq('trainer_id', trainerId);
        const packageRows = pkgs.filter((p) => p.name.trim()).map((p) => ({
          trainer_id: trainerId, name: p.name,
          sessions_per_week: parseInt(p.sessions_per_week) || 0,
          price_per_session: p.price_per_session ? parseFloat(p.price_per_session) : null,
          monthly_price: p.monthly_price ? parseFloat(p.monthly_price) : null,
          is_online: p.is_online, sort_order: parseInt(p.sort_order) || 0,
        }));
        if (packageRows.length > 0) {
          const { error } = await supabase.from('packages').insert(packageRows);
          if (error) throw error;
        }
      }

      onSaved();
    } catch (err) {
      console.error('Save error:', err);
      alert('Failed to save. Check console for details.');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full bg-[#f5f5f7] border border-[#e5e5ea] rounded-xl px-3 py-2.5 text-[#1a1a1a] text-sm placeholder-[#8e8e93] focus:outline-none focus:border-[#8e8e93] focus:ring-1 focus:ring-[#8e8e93]/20";

  const tabs = [
    { id: 'details' as const, label: 'Details' },
    { id: 'branding' as const, label: 'Branding' },
    { id: 'copy' as const, label: 'Copy' },
    { id: 'services' as const, label: 'Services' },
    { id: 'specialties' as const, label: 'Specialties' },
    { id: 'packages' as const, label: 'Packages' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-[#e5e5ea] overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-[#e5e5ea] overflow-x-auto">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className="flex-1 py-3 text-xs font-medium transition-colors whitespace-nowrap px-2"
            style={{
              backgroundColor: activeTab === tab.id ? '#f5f5f7' : 'transparent',
              color: activeTab === tab.id ? '#1a1a1a' : '#8e8e93',
              borderBottomWidth: '2px',
              borderBottomColor: activeTab === tab.id ? '#1a1a1a' : 'transparent',
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-5 space-y-5">
        {/* Details tab */}
        {activeTab === 'details' && (
          <div className="space-y-3">
            <div>
              <label className="text-[#8e8e93] text-xs block mb-1">Name *</label>
              <input value={form.name} onChange={(e) => updateField('name', e.target.value)} placeholder="Alex Thompson" className={inputClass} />
            </div>
            <div>
              <label className="text-[#8e8e93] text-xs block mb-1">URL slug *</label>
              <input value={form.slug} onChange={(e) => updateField('slug', e.target.value)} placeholder="alex-thompson" className={inputClass} />
            </div>
            <div>
              <label className="text-[#8e8e93] text-xs block mb-1">Bio</label>
              <textarea value={form.bio} onChange={(e) => updateField('bio', e.target.value)} rows={2} placeholder="Short bio..." className={inputClass} />
            </div>
            <div>
              <label className="text-[#8e8e93] text-xs block mb-1">Booking link *</label>
              <input value={form.booking_link} onChange={(e) => updateField('booking_link', e.target.value)} placeholder="https://calendly.com/..." className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[#8e8e93] text-xs block mb-1">Contact method *</label>
                <select value={form.contact_method} onChange={(e) => updateField('contact_method', e.target.value)} className={inputClass}>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="email">Email</option>
                  <option value="calendly">Calendly</option>
                  <option value="link">Other Link</option>
                </select>
              </div>
              <div>
                <label className="text-[#8e8e93] text-xs block mb-1">Contact value *</label>
                <input value={form.contact_value} onChange={(e) => updateField('contact_value', e.target.value)} placeholder="+447700000000" className={inputClass} />
              </div>
            </div>
          </div>
        )}

        {/* Branding tab */}
        {activeTab === 'branding' && (
          <div className="space-y-5">
            <div>
              <label className="text-[#8e8e93] text-xs block mb-2">Theme</label>
              <div className="grid grid-cols-2 gap-2">
                {(['light', 'dark'] as const).map((t) => (
                  <button key={t} onClick={() => setTheme(t)}
                    className="py-3 rounded-xl text-sm font-medium transition-all border"
                    style={{
                      backgroundColor: branding.theme === t ? (t === 'dark' ? '#1a1a1a' : '#f5f5f7') : 'white',
                      color: branding.theme === t ? (t === 'dark' ? '#ffffff' : '#1a1a1a') : '#8e8e93',
                      borderColor: branding.theme === t ? '#1a1a1a' : '#e5e5ea',
                    }}>
                    {t === 'light' ? '☀️ Light' : '🌙 Dark'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[#8e8e93] text-xs block mb-2">Colours</label>
              <div className="grid grid-cols-2 gap-3">
                <ColorField label="Primary (buttons & accents)" value={branding.color_primary} onChange={(v) => updateBranding('color_primary', v)} />
                <ColorField label="Secondary" value={branding.color_secondary} onChange={(v) => updateBranding('color_secondary', v)} />
                <ColorField label="Background" value={branding.color_background} onChange={(v) => updateBranding('color_background', v)} />
                <ColorField label="Text" value={branding.color_text} onChange={(v) => updateBranding('color_text', v)} />
                <ColorField label="Muted text" value={branding.color_text_muted} onChange={(v) => updateBranding('color_text_muted', v)} />
                <ColorField label="Accent" value={branding.color_accent} onChange={(v) => updateBranding('color_accent', v)} />
              </div>
            </div>

            <div>
              <label className="text-[#8e8e93] text-xs block mb-2">Fonts</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#8e8e93] text-[10px] block mb-1">Heading font</label>
                  <select value={branding.font_heading} onChange={(e) => updateBranding('font_heading', e.target.value)} className={inputClass}>
                    {AVAILABLE_FONTS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[#8e8e93] text-[10px] block mb-1">Body font</label>
                  <select value={branding.font_body} onChange={(e) => updateBranding('font_body', e.target.value)} className={inputClass}>
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
                  <input value={form.photo_url} onChange={(e) => updateField('photo_url', e.target.value)} placeholder="https://..." className={inputClass} />
                </div>
                <div>
                  <label className="text-[#8e8e93] text-[10px] block mb-1">Logo URL</label>
                  <input value={form.logo_url} onChange={(e) => updateField('logo_url', e.target.value)} placeholder="https://..." className={inputClass} />
                </div>
                <div>
                  <label className="text-[#8e8e93] text-[10px] block mb-1">Hero background image URL</label>
                  <input value={branding.hero_image_url || ''} onChange={(e) => updateBranding('hero_image_url', e.target.value)} placeholder="https://..." className={inputClass} />
                </div>
                {branding.hero_image_url && (
                  <div>
                    <label className="text-[#8e8e93] text-[10px] block mb-1">
                      Hero overlay opacity ({Math.round(branding.hero_overlay_opacity * 100)}%)
                    </label>
                    <input type="range" min={0} max={1} step={0.05} value={branding.hero_overlay_opacity}
                      onChange={(e) => updateBranding('hero_overlay_opacity', parseFloat(e.target.value))} className="w-full" />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="text-[#8e8e93] text-xs block mb-2">Preview</label>
              <div className="rounded-xl p-4 border" style={{ backgroundColor: branding.color_background, borderColor: branding.color_border }}>
                <p className="text-lg font-bold mb-1" style={{ color: branding.color_text }}>Heading text</p>
                <p className="text-sm mb-3" style={{ color: branding.color_text_muted }}>Muted body text preview</p>
                <div className="flex gap-2">
                  <div className="px-4 py-2 rounded-lg text-white text-xs font-medium" style={{ backgroundColor: branding.color_primary }}>Primary</div>
                  <div className="px-4 py-2 rounded-lg text-xs font-medium" style={{
                    backgroundColor: branding.color_card, borderWidth: '1px', borderColor: branding.color_border, color: branding.color_text,
                  }}>Card</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Copy tab */}
        {activeTab === 'copy' && (
          <div className="space-y-4">
            <p className="text-[#8e8e93] text-xs">Customise the text on your landing page. Leave blank to use defaults.</p>
            <div>
              <label className="text-[#8e8e93] text-xs block mb-1">Hero headline</label>
              <input value={copy.hero_headline} onChange={(e) => setCopy({ ...copy, hero_headline: e.target.value })}
                placeholder="Find out how long it'll take to reach your goal" className={inputClass} />
            </div>
            <div>
              <label className="text-[#8e8e93] text-xs block mb-1">Hero subtext</label>
              <input value={copy.hero_subtext} onChange={(e) => setCopy({ ...copy, hero_subtext: e.target.value })}
                placeholder="Free personalised timeline in 60 seconds" className={inputClass} />
            </div>
            <div>
              <label className="text-[#8e8e93] text-xs block mb-1">CTA button text</label>
              <input value={copy.cta_button_text} onChange={(e) => setCopy({ ...copy, cta_button_text: e.target.value })}
                placeholder="Get My Timeline" className={inputClass} />
            </div>
            <div>
              <label className="text-[#8e8e93] text-xs block mb-1">Your voice / tone</label>
              <textarea value={copy.tone} onChange={(e) => setCopy({ ...copy, tone: e.target.value })}
                placeholder="e.g. Straight-talking, no BS, but always supportive. I use humour and keep it real."
                rows={3} className={inputClass} />
              <p className="text-[#8e8e93] text-[10px] mt-1">Describe how you speak to clients. The AI will match this tone.</p>
            </div>
          </div>
        )}

        {/* Services tab */}
        {activeTab === 'services' && (
          <div className="space-y-5">
            <p className="text-[#8e8e93] text-xs">Add services that prospects can toggle on to see how they accelerate their timeline. Each add-on shows as an interactive toggle on your results page.</p>

            {/* Show prices toggle */}
            <div className="rounded-xl border border-[#e5e5ea] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Show pricing</p>
                  <p className="text-[#8e8e93] text-xs mt-0.5">Display prices on your timeline results</p>
                </div>
                <button onClick={() => setShowPrices(!showPrices)}
                  className="w-12 h-7 rounded-full p-0.5 transition-all duration-300"
                  style={{ backgroundColor: showPrices ? '#34C759' : '#e5e5ea' }}>
                  <div className="w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-300"
                    style={{ transform: showPrices ? 'translateX(20px)' : 'translateX(0)' }} />
                </button>
              </div>
            </div>

            {/* Add-ons */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="font-medium text-sm">Service add-ons</p>
                <button onClick={() => setAddOns([...addOns, {
                  id: `addon-${Date.now()}`,
                  name: '',
                  description: '',
                  timeline_reduction_percent: 15,
                  price_per_month: null,
                }])}
                  className="text-xs text-[#007AFF] hover:text-[#0056b3] font-medium">+ Add service</button>
              </div>

              <div className="space-y-3">
                {addOns.map((addOn, i) => (
                  <div key={addOn.id} className="bg-[#f5f5f7] rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <input value={addOn.name}
                        onChange={(e) => { const u = [...addOns]; u[i] = { ...u[i], name: e.target.value }; setAddOns(u); }}
                        placeholder="e.g. Nutrition Plan, Online Programming, Hybrid Coaching"
                        className={inputClass} />
                      <button onClick={() => setAddOns(addOns.filter((_, idx) => idx !== i))}
                        className="text-[#FF3B30] text-xs flex-shrink-0 px-2">Remove</button>
                    </div>
                    <textarea value={addOn.description}
                      onChange={(e) => { const u = [...addOns]; u[i] = { ...u[i], description: e.target.value }; setAddOns(u); }}
                      placeholder="Describe what this includes and how it helps clients..."
                      rows={2} className={inputClass} />
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[#8e8e93] text-[10px] block mb-0.5">Timeline impact (%)</label>
                        <div className="flex items-center gap-2">
                          <input type="range" min={5} max={40} step={5}
                            value={addOn.timeline_reduction_percent}
                            onChange={(e) => { const u = [...addOns]; u[i] = { ...u[i], timeline_reduction_percent: parseInt(e.target.value) }; setAddOns(u); }}
                            className="flex-1" />
                          <span className="text-sm font-semibold text-[#1a1a1a] min-w-[3ch] text-right">
                            {addOn.timeline_reduction_percent}%
                          </span>
                        </div>
                        <p className="text-[#8e8e93] text-[9px] mt-0.5">How much faster clients reach their goal with this</p>
                      </div>
                      <div>
                        <label className="text-[#8e8e93] text-[10px] block mb-0.5">Price per month (£)</label>
                        <input type="number" value={addOn.price_per_month || ''}
                          onChange={(e) => { const u = [...addOns]; u[i] = { ...u[i], price_per_month: e.target.value ? parseFloat(e.target.value) : null }; setAddOns(u); }}
                          placeholder="Optional" className={inputClass} />
                      </div>
                    </div>
                  </div>
                ))}

                {addOns.length === 0 && (
                  <button onClick={() => setAddOns([
                    { id: 'nutrition', name: 'Nutrition Plan', description: 'Personalised meal plans, macro targets, and weekly check-ins to accelerate your results', timeline_reduction_percent: 20, price_per_month: null },
                    { id: 'online', name: 'Online Programming', description: 'Structured workout plans for the days you train alone, with form check video reviews', timeline_reduction_percent: 15, price_per_month: null },
                    { id: 'hybrid', name: 'Hybrid Coaching', description: 'Combines in-person sessions with online programming and nutrition support for the fastest results', timeline_reduction_percent: 30, price_per_month: null },
                  ])}
                    className="w-full py-6 rounded-xl border border-dashed border-[#e5e5ea] text-[#8e8e93] text-sm hover:border-[#8e8e93] transition-colors">
                    + Add services — or tap to use recommended templates
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Specialties tab */}
        {activeTab === 'specialties' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[#8e8e93] text-xs">What makes you different?</p>
              <button onClick={() => setSpecialties([...specialties, { name: '', description: '' }])}
                className="text-xs text-[#007AFF] hover:text-[#0056b3] font-medium">+ Add</button>
            </div>
            <div className="space-y-3">
              {specialties.map((spec, i) => (
                <div key={i} className="bg-[#f5f5f7] rounded-xl p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <input value={spec.name} onChange={(e) => { const u = [...specialties]; u[i] = { ...u[i], name: e.target.value }; setSpecialties(u); }}
                      placeholder="e.g. Body Transformation" className={inputClass} />
                    <button onClick={() => setSpecialties(specialties.filter((_, idx) => idx !== i))}
                      className="text-[#FF3B30] text-xs flex-shrink-0 px-2">Remove</button>
                  </div>
                  <textarea value={spec.description}
                    onChange={(e) => { const u = [...specialties]; u[i] = { ...u[i], description: e.target.value }; setSpecialties(u); }}
                    placeholder="Describe what you do and why it helps..." rows={2} className={inputClass} />
                </div>
              ))}
              {specialties.length === 0 && (
                <button onClick={() => setSpecialties([{ name: '', description: '' }])}
                  className="w-full py-8 rounded-xl border border-dashed border-[#e5e5ea] text-[#8e8e93] text-sm hover:border-[#8e8e93] transition-colors">
                  + Add your first specialty
                </button>
              )}
            </div>
          </div>
        )}

        {/* Packages tab */}
        {activeTab === 'packages' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[#8e8e93] text-xs">Your training packages and pricing.</p>
              <button onClick={() => setPkgs([...pkgs, { ...emptyPackage, sort_order: String(pkgs.length + 1) }])}
                className="text-xs text-[#007AFF] hover:text-[#0056b3] font-medium">+ Add</button>
            </div>
            <div className="space-y-3">
              {pkgs.map((pkg, i) => (
                <div key={i} className="bg-[#f5f5f7] rounded-xl p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <input value={pkg.name} onChange={(e) => { const u = [...pkgs]; u[i] = { ...u[i], name: e.target.value }; setPkgs(u); }}
                      placeholder="e.g. 2x Per Week" className={inputClass} />
                    {pkgs.length > 1 && (
                      <button onClick={() => setPkgs(pkgs.filter((_, idx) => idx !== i))}
                        className="text-[#FF3B30] text-xs flex-shrink-0 px-2">Remove</button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[#8e8e93] text-[10px] block mb-0.5">Sessions/wk</label>
                      <input type="number" value={pkg.sessions_per_week}
                        onChange={(e) => { const u = [...pkgs]; u[i] = { ...u[i], sessions_per_week: e.target.value }; setPkgs(u); }} className={inputClass} />
                    </div>
                    <div>
                      <label className="text-[#8e8e93] text-[10px] block mb-0.5">£/session</label>
                      <input type="number" value={pkg.price_per_session}
                        onChange={(e) => { const u = [...pkgs]; u[i] = { ...u[i], price_per_session: e.target.value }; setPkgs(u); }} className={inputClass} />
                    </div>
                    <div>
                      <label className="text-[#8e8e93] text-[10px] block mb-0.5">£/month</label>
                      <input type="number" value={pkg.monthly_price}
                        onChange={(e) => { const u = [...pkgs]; u[i] = { ...u[i], monthly_price: e.target.value }; setPkgs(u); }} className={inputClass} />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-xs text-[#8e8e93]">
                    <input type="checkbox" checked={pkg.is_online}
                      onChange={(e) => { const u = [...pkgs]; u[i] = { ...u[i], is_online: e.target.checked }; setPkgs(u); }}
                      className="rounded" />
                    Online-only package
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Save/Cancel */}
        <div className="flex gap-3 justify-end pt-2">
          <button onClick={onCancel} className="px-5 py-2.5 rounded-xl text-[#8e8e93] text-sm hover:text-[#1a1a1a] transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving || !form.name || !form.slug || !form.booking_link}
            className="bg-[#1a1a1a] hover:bg-black disabled:opacity-40 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
