'use client';

import { useState, useEffect, useCallback } from 'react';
import { Trainer, Package, TrainerSpecialty } from '@/types';
import { supabase } from '@/lib/supabase';

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
          <button
            onClick={() => setShowNew(!showNew)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl font-medium transition-colors text-sm"
          >
            {showNew ? 'Cancel' : '+ Add Trainer'}
          </button>
        </div>

        {showNew && (
          <TrainerForm
            onSaved={() => { setShowNew(false); fetchTrainers(); }}
            onCancel={() => setShowNew(false)}
          />
        )}

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : trainers.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg">No trainers yet</p>
            <p className="text-sm mt-1">Click &quot;Add Trainer&quot; to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {trainers.map((trainer) => (
              <div key={trainer.id} className="bg-white/5 rounded-2xl p-5 border border-white/10">
                {editingId === trainer.id ? (
                  <TrainerForm
                    trainer={trainer}
                    existingPackages={trainer.packages}
                    onSaved={() => { setEditingId(null); fetchTrainers(); }}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                          style={{ backgroundColor: trainer.brand_color_primary }}
                        >
                          {trainer.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h3 className="font-semibold">{trainer.name}</h3>
                          <p className="text-gray-500 text-sm">/{trainer.slug}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <a
                          href={`/${trainer.slug}`}
                          target="_blank"
                          className="text-gray-400 text-xs hover:text-white transition-colors px-3 py-1.5 rounded-lg bg-white/5"
                        >
                          Preview
                        </a>
                        <button
                          onClick={() => setEditingId(trainer.id)}
                          className="text-gray-400 text-xs hover:text-white transition-colors px-3 py-1.5 rounded-lg bg-white/5"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                    {trainer.packages && trainer.packages.length > 0 && (
                      <div className="mt-3 flex gap-2 flex-wrap">
                        {trainer.packages.map((pkg) => (
                          <span key={pkg.id} className="text-xs bg-white/5 px-2.5 py-1 rounded-full text-gray-400">
                            {pkg.name}
                          </span>
                        ))}
                      </div>
                    )}
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

function TrainerForm({
  trainer,
  existingPackages,
  onSaved,
  onCancel,
}: {
  trainer?: Trainer;
  existingPackages?: Package[];
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [saving, setSaving] = useState(false);
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

  const [specialties, setSpecialties] = useState<SpecialtyInput[]>(
    trainer?.specialties?.map((s: TrainerSpecialty) => ({ name: s.name, description: s.description })) || []
  );

  const [pkgs, setPkgs] = useState<PackageInput[]>(
    existingPackages?.map((p) => ({
      name: p.name,
      sessions_per_week: String(p.sessions_per_week),
      price_per_session: p.price_per_session ? String(p.price_per_session) : '',
      monthly_price: p.monthly_price ? String(p.monthly_price) : '',
      is_online: p.is_online,
      sort_order: String(p.sort_order),
    })) || [{ ...emptyPackage }]
  );

  const addPackage = () => setPkgs([...pkgs, { ...emptyPackage, sort_order: String(pkgs.length + 1) }]);
  const removePackage = (i: number) => setPkgs(pkgs.filter((_, idx) => idx !== i));
  const addSpecialty = () => setSpecialties([...specialties, { name: '', description: '' }]);
  const removeSpecialty = (i: number) => setSpecialties(specialties.filter((_, idx) => idx !== i));

  const updateField = (field: string, value: string) => setForm({ ...form, [field]: value });

  const updatePackage = (i: number, field: string, value: string | boolean) => {
    const updated = [...pkgs];
    updated[i] = { ...updated[i], [field]: value };
    setPkgs(updated);
  };

  const updateSpecialty = (i: number, field: 'name' | 'description', value: string) => {
    const updated = [...specialties];
    updated[i] = { ...updated[i], [field]: value };
    setSpecialties(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const specialtiesData = specialties
        .filter((s) => s.name.trim())
        .map((s) => ({ name: s.name.trim(), description: s.description.trim() }));

      let trainerId = trainer?.id;

      const trainerData = {
        slug: form.slug,
        name: form.name,
        bio: form.bio || null,
        photo_url: form.photo_url || null,
        brand_color_primary: form.brand_color_primary,
        brand_color_secondary: form.brand_color_secondary,
        booking_link: form.booking_link,
        contact_method: form.contact_method,
        contact_value: form.contact_value,
        logo_url: form.logo_url || null,
        specialties: specialtiesData.length > 0 ? specialtiesData : null,
      };

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
        const packageRows = pkgs
          .filter((p) => p.name.trim())
          .map((p) => ({
            trainer_id: trainerId,
            name: p.name,
            sessions_per_week: parseInt(p.sessions_per_week) || 0,
            price_per_session: p.price_per_session ? parseFloat(p.price_per_session) : null,
            monthly_price: p.monthly_price ? parseFloat(p.monthly_price) : null,
            is_online: p.is_online,
            sort_order: parseInt(p.sort_order) || 0,
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

  return (
    <div className="space-y-6 bg-white/[0.02] rounded-xl p-5 border border-white/5">
      <h3 className="font-semibold text-lg">{trainer ? 'Edit Trainer' : 'New Trainer'}</h3>

      {/* Basic info */}
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
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-gray-400 text-xs block mb-1">Primary colour</label>
            <div className="flex gap-2 items-center">
              <input type="color" value={form.brand_color_primary} onChange={(e) => updateField('brand_color_primary', e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-0" />
              <input value={form.brand_color_primary} onChange={(e) => updateField('brand_color_primary', e.target.value)} className={inputClass} />
            </div>
          </div>
          <div>
            <label className="text-gray-400 text-xs block mb-1">Secondary colour</label>
            <div className="flex gap-2 items-center">
              <input type="color" value={form.brand_color_secondary} onChange={(e) => updateField('brand_color_secondary', e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-0" />
              <input value={form.brand_color_secondary} onChange={(e) => updateField('brand_color_secondary', e.target.value)} className={inputClass} />
            </div>
          </div>
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
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-gray-400 text-xs block mb-1">Photo URL</label>
            <input value={form.photo_url} onChange={(e) => updateField('photo_url', e.target.value)} placeholder="https://..." className={inputClass} />
          </div>
          <div>
            <label className="text-gray-400 text-xs block mb-1">Logo URL</label>
            <input value={form.logo_url} onChange={(e) => updateField('logo_url', e.target.value)} placeholder="https://..." className={inputClass} />
          </div>
        </div>
      </div>

      {/* Specialties — simple title + description */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="font-medium text-sm">Your specialties</h4>
            <p className="text-gray-500 text-[11px] mt-0.5">What makes you different? These show on your landing page.</p>
          </div>
          <button onClick={addSpecialty} className="text-xs text-orange-400 hover:text-orange-300">+ Add</button>
        </div>
        <div className="space-y-3">
          {specialties.map((spec, i) => (
            <div key={i} className="bg-white/[0.02] rounded-xl p-3 border border-white/5 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  value={spec.name}
                  onChange={(e) => updateSpecialty(i, 'name', e.target.value)}
                  placeholder="e.g. Body Transformation"
                  className={inputClass}
                />
                <button onClick={() => removeSpecialty(i)} className="text-red-500/60 hover:text-red-400 text-xs flex-shrink-0 px-2">
                  Remove
                </button>
              </div>
              <textarea
                value={spec.description}
                onChange={(e) => updateSpecialty(i, 'description', e.target.value)}
                placeholder="Describe what you do and why it helps clients get faster results..."
                rows={2}
                className={inputClass}
              />
            </div>
          ))}
          {specialties.length === 0 && (
            <button
              onClick={addSpecialty}
              className="w-full py-8 rounded-xl border border-dashed border-white/10 text-gray-500 text-sm hover:border-white/20 hover:text-gray-400 transition-colors"
            >
              + Add your first specialty
            </button>
          )}
        </div>
      </div>

      {/* Packages */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-sm">Packages</h4>
          <button onClick={addPackage} className="text-xs text-orange-400 hover:text-orange-300">+ Add</button>
        </div>
        <div className="space-y-3">
          {pkgs.map((pkg, i) => (
            <div key={i} className="bg-white/[0.02] rounded-xl p-3 border border-white/5 space-y-2">
              <div className="flex items-center gap-2">
                <input value={pkg.name} onChange={(e) => updatePackage(i, 'name', e.target.value)} placeholder="e.g. 2x Per Week" className={inputClass} />
                {pkgs.length > 1 && (
                  <button onClick={() => removePackage(i)} className="text-red-500/60 hover:text-red-400 text-xs flex-shrink-0 px-2">Remove</button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-gray-500 text-[10px] block mb-0.5">Sessions/wk</label>
                  <input type="number" value={pkg.sessions_per_week} onChange={(e) => updatePackage(i, 'sessions_per_week', e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="text-gray-500 text-[10px] block mb-0.5">£/session</label>
                  <input type="number" value={pkg.price_per_session} onChange={(e) => updatePackage(i, 'price_per_session', e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="text-gray-500 text-[10px] block mb-0.5">£/month</label>
                  <input type="number" value={pkg.monthly_price} onChange={(e) => updatePackage(i, 'monthly_price', e.target.value)} className={inputClass} />
                </div>
              </div>
              <label className="flex items-center gap-2 text-xs text-gray-500">
                <input type="checkbox" checked={pkg.is_online} onChange={(e) => updatePackage(i, 'is_online', e.target.checked)} />
                This is an online-only package
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-2">
        <button onClick={onCancel} className="px-5 py-2.5 rounded-xl text-gray-400 text-sm hover:text-white transition-colors">Cancel</button>
        <button onClick={handleSave} disabled={saving || !form.name || !form.slug || !form.booking_link} className="bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors">
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}
