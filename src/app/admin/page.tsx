'use client';

import { useState, useEffect, useCallback } from 'react';
import { Trainer, Package, TrainerSpecialty, TrainerBranding } from '@/types';
import { supabase } from '@/lib/supabase';
import { AVAILABLE_FONTS, resolveBranding } from '@/lib/branding';

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
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">PT Admin</h1>
            <p className="text-gray-400 text-sm mt-1">Manage trainers and packages</p>
          </div>
          <button onClick={() => setShowNew(!showNew)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl font-medium transition-colors text-sm">
            {showNew ? 'Cancel' : '+ Add Trainer'}
          </button>
        </div>

        {showNew && <TrainerForm onSaved={() => { setShowNew(false); fetchTrainers(); }} onCancel={() => setShowNew(false)} />}

        {loading ? <p className="text-gray-500">Loading...</p> : trainers.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg">No trainers yet</p>
            <p className="text-sm mt-1">Click &quot;Add Trainer&quot; to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {trainers.map((trainer) => (
              <div key={trainer.id} className="bg-white/5 rounded-2xl p-5 border border-white/10">
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
                          <p className="text-gray-500 text-sm">/{trainer.slug}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <a href={`/${trainer.slug}`} target="_blank"
                          className="text-gray-400 text-xs hover:text-white transition-colors px-3 py-1.5 rounded-lg bg-white/5">Preview</a>
                        <button onClick={() => setEditingId(trainer.id)}
                          className="text-gray-400 text-xs hover:text-white transition-colors px-3 py-1.5 rounded-lg bg-white/5">Edit</button>
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
      <label className="text-gray-400 text-[10px] block mb-1">{label}</label>
      <div className="flex gap-1.5 items-center">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)}
          className="w-7 h-7 rounded cursor-pointer bg-transparent border-0 flex-shrink-0" />
        <input value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs font-mono focus:outline-none focus:border-white/30" />
      </div>
    </div>
  );
}

function TrainerForm({ trainer, existingPackages, onSaved, onCancel }: {
  trainer?: Trainer; existingPackages?: Package[]; onSaved: () => void; onCancel: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'branding' | 'specialties' | 'packages'>('details');

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
    color_background: existingBranding?.color_background || '#1A1A2E',
    color_text: existingBranding?.color_text || '#ffffff',
    color_text_muted: existingBranding?.color_text_muted || '#9ca3af',
    color_card: existingBranding?.color_card || 'rgba(255,255,255,0.03)',
    color_border: existingBranding?.color_border || 'rgba(255,255,255,0.08)',
    font_heading: existingBranding?.font_heading || 'system-ui',
    font_body: existingBranding?.font_body || 'system-ui',
    theme: existingBranding?.theme || 'dark' as const,
    hero_image_url: existingBranding?.hero_image_url || '',
    hero_overlay_opacity: existingBranding?.hero_overlay_opacity ?? 0.6,
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

  // When theme changes, update colours to match
  const setTheme = (theme: 'dark' | 'light') => {
    if (theme === 'light') {
      setBranding({
        ...branding, theme,
        color_background: '#ffffff', color_text: '#111111', color_text_muted: '#6b7280',
        color_card: 'rgba(0,0,0,0.03)', color_border: 'rgba(0,0,0,0.08)',
      });
    } else {
      setBranding({
        ...branding, theme,
        color_background: branding.color_secondary, color_text: '#ffffff', color_text_muted: '#9ca3af',
        color_card: 'rgba(255,255,255,0.03)', color_border: 'rgba(255,255,255,0.08)',
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

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-white/30";

  const tabs = [
    { id: 'details' as const, label: 'Details' },
    { id: 'branding' as const, label: 'Branding' },
    { id: 'specialties' as const, label: 'Specialties' },
    { id: 'packages' as const, label: 'Packages' },
  ];

  return (
    <div className="bg-white/[0.02] rounded-xl border border-white/5 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-white/5">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className="flex-1 py-3 text-xs font-medium transition-colors"
            style={{
              backgroundColor: activeTab === tab.id ? 'rgba(255,255,255,0.05)' : 'transparent',
              color: activeTab === tab.id ? '#ffffff' : '#6b7280',
              borderBottomWidth: '2px',
              borderBottomColor: activeTab === tab.id ? '#FF6B35' : 'transparent',
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
              <label className="text-gray-400 text-xs block mb-1">Name *</label>
              <input value={form.name} onChange={(e) => updateField('name', e.target.value)} placeholder="Alex Thompson" className={inputClass} />
            </div>
            <div>
              <label className="text-gray-400 text-xs block mb-1">URL slug *</label>
              <input value={form.slug} onChange={(e) => updateField('slug', e.target.value)} placeholder="alex-thompson" className={inputClass} />
            </div>
            <div>
              <label className="text-gray-400 text-xs block mb-1">Bio</label>
              <textarea value={form.bio} onChange={(e) => updateField('bio', e.target.value)} rows={2} placeholder="Short bio..." className={inputClass} />
            </div>
            <div>
              <label className="text-gray-400 text-xs block mb-1">Booking link *</label>
              <input value={form.booking_link} onChange={(e) => updateField('booking_link', e.target.value)} placeholder="https://calendly.com/..." className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-gray-400 text-xs block mb-1">Contact method *</label>
                <select value={form.contact_method} onChange={(e) => updateField('contact_method', e.target.value)} className={inputClass}>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="email">Email</option>
                  <option value="calendly">Calendly</option>
                  <option value="link">Other Link</option>
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-xs block mb-1">Contact value *</label>
                <input value={form.contact_value} onChange={(e) => updateField('contact_value', e.target.value)} placeholder="+447700000000" className={inputClass} />
              </div>
            </div>
          </div>
        )}

        {/* Branding tab */}
        {activeTab === 'branding' && (
          <div className="space-y-5">
            {/* Theme toggle */}
            <div>
              <label className="text-gray-400 text-xs block mb-2">Theme</label>
              <div className="grid grid-cols-2 gap-2">
                {(['dark', 'light'] as const).map((t) => (
                  <button key={t} onClick={() => setTheme(t)}
                    className="py-3 rounded-xl text-sm font-medium transition-all border"
                    style={{
                      backgroundColor: branding.theme === t ? (t === 'dark' ? '#1a1a2e' : '#ffffff') : 'rgba(255,255,255,0.05)',
                      color: branding.theme === t ? (t === 'dark' ? '#ffffff' : '#111111') : '#6b7280',
                      borderColor: branding.theme === t ? '#FF6B35' : 'rgba(255,255,255,0.1)',
                    }}>
                    {t === 'dark' ? '🌙 Dark' : '☀️ Light'}
                  </button>
                ))}
              </div>
            </div>

            {/* Colours */}
            <div>
              <label className="text-gray-400 text-xs block mb-2">Colours</label>
              <div className="grid grid-cols-2 gap-3">
                <ColorField label="Primary (buttons & accents)" value={branding.color_primary}
                  onChange={(v) => updateBranding('color_primary', v)} />
                <ColorField label="Secondary" value={branding.color_secondary}
                  onChange={(v) => updateBranding('color_secondary', v)} />
                <ColorField label="Background" value={branding.color_background}
                  onChange={(v) => updateBranding('color_background', v)} />
                <ColorField label="Text" value={branding.color_text}
                  onChange={(v) => updateBranding('color_text', v)} />
                <ColorField label="Muted text" value={branding.color_text_muted}
                  onChange={(v) => updateBranding('color_text_muted', v)} />
                <ColorField label="Accent" value={branding.color_accent}
                  onChange={(v) => updateBranding('color_accent', v)} />
              </div>
            </div>

            {/* Fonts */}
            <div>
              <label className="text-gray-400 text-xs block mb-2">Fonts</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-500 text-[10px] block mb-1">Heading font</label>
                  <select value={branding.font_heading} onChange={(e) => updateBranding('font_heading', e.target.value)} className={inputClass}>
                    {AVAILABLE_FONTS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-gray-500 text-[10px] block mb-1">Body font</label>
                  <select value={branding.font_body} onChange={(e) => updateBranding('font_body', e.target.value)} className={inputClass}>
                    {AVAILABLE_FONTS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Images */}
            <div>
              <label className="text-gray-400 text-xs block mb-2">Images</label>
              <div className="space-y-3">
                <div>
                  <label className="text-gray-500 text-[10px] block mb-1">Profile photo URL</label>
                  <input value={form.photo_url} onChange={(e) => updateField('photo_url', e.target.value)} placeholder="https://..." className={inputClass} />
                </div>
                <div>
                  <label className="text-gray-500 text-[10px] block mb-1">Logo URL</label>
                  <input value={form.logo_url} onChange={(e) => updateField('logo_url', e.target.value)} placeholder="https://..." className={inputClass} />
                </div>
                <div>
                  <label className="text-gray-500 text-[10px] block mb-1">Hero background image URL</label>
                  <input value={branding.hero_image_url || ''} onChange={(e) => updateBranding('hero_image_url', e.target.value)} placeholder="https://..." className={inputClass} />
                </div>
                {branding.hero_image_url && (
                  <div>
                    <label className="text-gray-500 text-[10px] block mb-1">
                      Hero overlay opacity ({Math.round(branding.hero_overlay_opacity * 100)}%)
                    </label>
                    <input type="range" min={0} max={1} step={0.05} value={branding.hero_overlay_opacity}
                      onChange={(e) => updateBranding('hero_overlay_opacity', parseFloat(e.target.value))}
                      className="w-full" />
                  </div>
                )}
              </div>
            </div>

            {/* Preview swatch */}
            <div>
              <label className="text-gray-400 text-xs block mb-2">Preview</label>
              <div className="rounded-xl p-4 border" style={{
                backgroundColor: branding.color_background,
                borderColor: branding.color_border,
              }}>
                <p className="text-lg font-bold mb-1" style={{ color: branding.color_text }}>
                  Heading text
                </p>
                <p className="text-sm mb-3" style={{ color: branding.color_text_muted }}>
                  Muted body text preview
                </p>
                <div className="flex gap-2">
                  <div className="px-4 py-2 rounded-lg text-white text-xs font-medium" style={{ backgroundColor: branding.color_primary }}>
                    Primary
                  </div>
                  <div className="px-4 py-2 rounded-lg text-xs font-medium" style={{
                    backgroundColor: branding.color_card,
                    borderWidth: '1px',
                    borderColor: branding.color_border,
                    color: branding.color_text,
                  }}>
                    Card
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Specialties tab */}
        {activeTab === 'specialties' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-500 text-xs">What makes you different? These show on your landing page.</p>
              <button onClick={() => setSpecialties([...specialties, { name: '', description: '' }])}
                className="text-xs text-orange-400 hover:text-orange-300">+ Add</button>
            </div>
            <div className="space-y-3">
              {specialties.map((spec, i) => (
                <div key={i} className="bg-white/[0.02] rounded-xl p-3 border border-white/5 space-y-2">
                  <div className="flex items-center gap-2">
                    <input value={spec.name} onChange={(e) => { const u = [...specialties]; u[i] = { ...u[i], name: e.target.value }; setSpecialties(u); }}
                      placeholder="e.g. Body Transformation" className={inputClass} />
                    <button onClick={() => setSpecialties(specialties.filter((_, idx) => idx !== i))}
                      className="text-red-500/60 hover:text-red-400 text-xs flex-shrink-0 px-2">Remove</button>
                  </div>
                  <textarea value={spec.description}
                    onChange={(e) => { const u = [...specialties]; u[i] = { ...u[i], description: e.target.value }; setSpecialties(u); }}
                    placeholder="Describe what you do and why it helps..." rows={2} className={inputClass} />
                </div>
              ))}
              {specialties.length === 0 && (
                <button onClick={() => setSpecialties([{ name: '', description: '' }])}
                  className="w-full py-8 rounded-xl border border-dashed border-white/10 text-gray-500 text-sm hover:border-white/20 transition-colors">
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
              <p className="text-gray-500 text-xs">Your training packages and pricing.</p>
              <button onClick={() => setPkgs([...pkgs, { ...emptyPackage, sort_order: String(pkgs.length + 1) }])}
                className="text-xs text-orange-400 hover:text-orange-300">+ Add</button>
            </div>
            <div className="space-y-3">
              {pkgs.map((pkg, i) => (
                <div key={i} className="bg-white/[0.02] rounded-xl p-3 border border-white/5 space-y-2">
                  <div className="flex items-center gap-2">
                    <input value={pkg.name} onChange={(e) => { const u = [...pkgs]; u[i] = { ...u[i], name: e.target.value }; setPkgs(u); }}
                      placeholder="e.g. 2x Per Week" className={inputClass} />
                    {pkgs.length > 1 && (
                      <button onClick={() => setPkgs(pkgs.filter((_, idx) => idx !== i))}
                        className="text-red-500/60 hover:text-red-400 text-xs flex-shrink-0 px-2">Remove</button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-gray-500 text-[10px] block mb-0.5">Sessions/wk</label>
                      <input type="number" value={pkg.sessions_per_week}
                        onChange={(e) => { const u = [...pkgs]; u[i] = { ...u[i], sessions_per_week: e.target.value }; setPkgs(u); }} className={inputClass} />
                    </div>
                    <div>
                      <label className="text-gray-500 text-[10px] block mb-0.5">£/session</label>
                      <input type="number" value={pkg.price_per_session}
                        onChange={(e) => { const u = [...pkgs]; u[i] = { ...u[i], price_per_session: e.target.value }; setPkgs(u); }} className={inputClass} />
                    </div>
                    <div>
                      <label className="text-gray-500 text-[10px] block mb-0.5">£/month</label>
                      <input type="number" value={pkg.monthly_price}
                        onChange={(e) => { const u = [...pkgs]; u[i] = { ...u[i], monthly_price: e.target.value }; setPkgs(u); }} className={inputClass} />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-xs text-gray-500">
                    <input type="checkbox" checked={pkg.is_online}
                      onChange={(e) => { const u = [...pkgs]; u[i] = { ...u[i], is_online: e.target.checked }; setPkgs(u); }} />
                    Online-only package
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Save/Cancel */}
        <div className="flex gap-3 justify-end pt-2">
          <button onClick={onCancel} className="px-5 py-2.5 rounded-xl text-gray-400 text-sm hover:text-white transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving || !form.name || !form.slug || !form.booking_link}
            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
