'use client';

import { useState, useEffect, useCallback } from 'react';
import { createBrowserClient } from '@/lib/auth';
import { AVAILABLE_FONTS, getGoogleFontsUrl } from '@/lib/branding';
import { ServiceAddOn, CustomQuestion, CustomGoal, GoalType, Trainer, Package } from '@/types';
import PhoneInput from '@/components/PhoneInput';
import { CopyPreview, SpecialtiesPreview, ServicesPreview, PackagesPreview, CustomQuestionsPreview, GoalsPreview } from '@/components/SettingsPreview';
import SetupChecklist from '@/components/SetupChecklist';
import FormFlowEditor from '@/components/FormFlowEditor';
import Link from 'next/link';

interface PackageInput {
  name: string;
  sessions_per_week: string;
  price_per_session: string;
  monthly_price: string;
  is_online: boolean;
}

type Tab = 'account' | 'details' | 'copy' | 'branding' | 'goals' | 'forms' | 'questions' | 'specialties' | 'services' | 'packages' | 'billing';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Read initial tab from URL query param
  const [initialTabSet, setInitialTabSet] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('none');
  const [billingLoading, setBillingLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('details');
  const [trainerId, setTrainerId] = useState<string | null>(null);
  const [trainerData, setTrainerData] = useState<Trainer | null>(null);
  const [trainerPackages, setTrainerPackages] = useState<Package[]>([]);
  const [showChecklist, setShowChecklist] = useState(false);

  // Account tab state
  const [userEmail, setUserEmail] = useState('');
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailChanging, setEmailChanging] = useState(false);
  const [emailChangeSent, setEmailChangeSent] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordChanging, setPasswordChanging] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Form builder sub-menu
  const [formMenuOpen, setFormMenuOpen] = useState(false);

  const [form, setForm] = useState({
    name: '', bio: '', slug: '', photo_url: '', logo_url: '',
    booking_link: '', contact_method: 'whatsapp', contact_value: '',
    brand_color_primary: '#1a1a1a', color_text: '', color_text_muted: '',
    font_heading: 'system-ui', font_body: 'system-ui',
    theme: 'light' as 'light' | 'dark', hero_headline: '', hero_subtext: '',
    cta_button_text: '', tone: '',
  });

  const [addOns, setAddOns] = useState<ServiceAddOn[]>([]);
  const [nutritionService, setNutritionService] = useState<{ enabled: boolean; name: string; description: string; timeline_reduction_percent: number; price_per_month: number | null }>({
    enabled: false, name: 'Nutrition Plan', description: 'Personalised meal plans, macro targets, and weekly check-ins', timeline_reduction_percent: 20, price_per_month: null,
  });
  const [onlineService, setOnlineService] = useState<{ enabled: boolean; name: string; description: string; effectiveness_vs_inperson: number; price_per_month: number | null }>({
    enabled: false, name: 'Online Programming', description: 'Structured workout plans delivered remotely with form check videos', effectiveness_vs_inperson: 0.75, price_per_month: null,
  });
  const [hybridService, setHybridService] = useState<{ enabled: boolean; name: string; description: string; price_per_month: number | null }>({
    enabled: false, name: 'Hybrid Coaching', description: 'Mix of in-person sessions and online programming', price_per_month: null,
  });
  const [showPrices, setShowPrices] = useState(true);
  const [customGoals, setCustomGoals] = useState<CustomGoal[]>([]);
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
      setUserEmail(session.user.email || '');

      // Admin mode: load a specific trainer by slug
      const urlParams = new URLSearchParams(window.location.search);
      const adminSlug = urlParams.get('admin');
      const meUrl = adminSlug ? `/api/me?slug=${adminSlug}` : '/api/me';
      if (adminSlug) setIsAdminMode(true);

      const res = await fetch(meUrl, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) { window.location.href = '/login'; return; }

      const { trainer, packages: existingPkgs } = await res.json();
      setTrainerId(trainer.id);
      setTrainerData(trainer as Trainer);
      setTrainerPackages((existingPkgs || []) as Package[]);
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
      if (trainer.services?.nutrition) setNutritionService(trainer.services.nutrition);
      if (trainer.services?.online) setOnlineService(trainer.services.online);
      if (trainer.services?.hybrid) setHybridService(trainer.services.hybrid);
      if (trainer.services?.show_prices !== undefined) setShowPrices(trainer.services.show_prices);
      if (trainer.specialties?.length) setSpecialties(trainer.specialties);
      if (trainer.custom_questions?.length) setCustomQuestions(trainer.custom_questions);
      if (trainer.custom_goals?.length) setCustomGoals(trainer.custom_goals);

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
        if (tab && ['account', 'details', 'copy', 'branding', 'goals', 'forms', 'questions', 'specialties', 'services', 'packages', 'billing'].includes(tab)) {
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
      services: {
        show_prices: showPrices,
        nutrition: nutritionService.enabled ? nutritionService : null,
        online: onlineService.enabled ? onlineService : null,
        hybrid: hybridService.enabled ? hybridService : null,
        add_ons: addOns.filter(a => a.name.trim()),
      },
      custom_questions: customQuestions.filter(q => q.question.trim()).length > 0
        ? customQuestions.filter(q => q.question.trim())
        : null,
      custom_goals: customGoals.filter(g => g.label.trim()).length > 0
        ? customGoals.filter(g => g.label.trim())
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

      // Refresh trainer data so checklist updates
      const supabase = (await import('@/lib/auth')).createBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const refreshRes = await fetch('/api/me', { headers: { Authorization: `Bearer ${session.access_token}` } });
        if (refreshRes.ok) {
          const { trainer: refreshed, packages: refreshedPkgs } = await refreshRes.json();
          setTrainerData(refreshed as Trainer);
          setTrainerPackages((refreshedPkgs || []) as Package[]);
        }
      }
    }
  }, [trainerId, form, specialties, addOns, showPrices, pkgs, nutritionService, onlineService, hybridService, customQuestions, customGoals]);

  const handleChangeEmail = async () => {
    const trimmed = newEmail.trim();
    if (!trimmed) return;
    setEmailChanging(true);
    setEmailError('');
    try {
      const supabase = createBrowserClient();
      const { error } = await supabase.auth.updateUser({ email: trimmed });
      if (error) throw error;
      setEmailChangeSent(true);
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : 'Failed to update email');
    } finally {
      setEmailChanging(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || newPassword.length < 6) return;
    setPasswordChanging(true);
    setPasswordError('');
    try {
      const supabase = createBrowserClient();
      // Re-verify the current password before allowing a change
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: currentPassword,
      });
      if (verifyError) throw new Error('Current password is incorrect');

      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) throw updateError;
      setPasswordChanged(true);
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to update password');
    } finally {
      setPasswordChanging(false);
    }
  };

  const handleLogout = async () => {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const inputClass = "w-full bg-[#f5f5f7] border border-[#e5e5ea] rounded-xl px-4 py-3 text-[#1a1a1a] text-base placeholder-[#8e8e93] focus:outline-none focus:border-[#8e8e93]";

  if (loading) {
    return <div className="min-h-[100dvh] bg-white flex items-center justify-center"><p className="text-[#8e8e93]">Loading...</p></div>;
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'details', label: 'Details' },
    { id: 'copy', label: 'Copy' },
    { id: 'branding', label: 'Branding' },
    { id: 'specialties', label: 'Specialties' },
    { id: 'services', label: 'Services' },
    { id: 'packages', label: 'Packages' },
    { id: 'account', label: 'Account' },
    { id: 'billing', label: 'Billing' },
  ];

  const formSubTabs: { id: Tab; label: string; description: string }[] = [
    { id: 'goals', label: 'Goals', description: 'Which goals visitors can pick from' },
    { id: 'forms', label: 'Forms', description: 'Multiple forms per goal (Pro)' },
    { id: 'questions', label: 'Questions', description: 'Custom questions library' },
  ];

  const activeFormSubTab = formSubTabs.find((t) => t.id === activeTab);
  const formTabActive = !!activeFormSubTab;

  return (
    <div className="min-h-[100dvh] bg-white">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Settings</h1>
            <p className="text-[#8e8e93] text-sm">{form.name}</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/preview/${form.slug}`} target="_blank"
              className="text-[#8e8e93] text-xs px-3 py-1.5 rounded-lg bg-[#f5f5f7] hover:bg-[#e5e5ea] transition-colors">
              Preview
            </Link>
            <Link href={isAdminMode ? '/internal' : '/dashboard'} className="text-[#8e8e93] text-xs px-3 py-1.5 rounded-lg bg-[#f5f5f7] hover:bg-[#e5e5ea] transition-colors">
              {isAdminMode ? 'Back to demos' : 'Dashboard'}
            </Link>
          </div>
        </div>

        {/* Setup progress */}
        {trainerData && (() => {
          // Calculate progress inline
          const checks = [
            !!(trainerData.contact_value && trainerData.contact_value.length >= 8),
            !!(trainerData.bio && trainerData.bio.trim().length > 10),
            !!(trainerData.specialties && trainerData.specialties.length > 0),
            !!(trainerData.services?.nutrition?.enabled || trainerData.services?.online?.enabled || trainerData.services?.hybrid?.enabled || (trainerData.services?.add_ons && trainerData.services.add_ons.length > 0)),
            trainerPackages.length > 0,
            trainerData.subscription_status === 'active',
          ];
          const completed = checks.filter(Boolean).length;
          const total = checks.length;
          const allDone = completed === total;
          const progress = (completed / total) * 100;

          if (allDone) return null;

          return (
            <div className="mb-5">
              <button onClick={() => setShowChecklist(!showChecklist)}
                className="w-full bg-[#f5f5f7] rounded-xl p-4 text-left transition-colors hover:bg-[#ebebed]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">Setup progress</p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-[#1a1a1a]">
                      {completed}/{total}
                    </span>
                  </div>
                  <svg className={`w-4 h-4 text-[#8e8e93] transition-transform ${showChecklist ? 'rotate-90' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="h-1.5 bg-[#e5e5ea] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${progress}%`, backgroundColor: '#1a1a1a' }} />
                </div>
              </button>
              {showChecklist && (
                <div className="mt-2">
                  <SetupChecklist trainer={trainerData} packages={trainerPackages} />
                </div>
              )}
            </div>
          );
        })()}

        {/* Tabs */}
        <div className="relative flex items-start gap-1 mb-6 -mx-4 px-4">
          {/* Form builder dropdown — lives outside the scroll container so
              its popover isn't clipped by overflow-x */}
          <div className="relative flex-shrink-0">
            <button onClick={() => setFormMenuOpen((v) => !v)}
              className="text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition-all flex items-center gap-1.5"
              style={{
                backgroundColor: formTabActive ? '#1a1a1a' : '#f5f5f7',
                color: formTabActive ? '#ffffff' : '#8e8e93',
              }}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <span>{activeFormSubTab ? `Form · ${activeFormSubTab.label}` : 'Form builder'}</span>
              <svg className={`w-3 h-3 transition-transform ${formMenuOpen ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            {formMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setFormMenuOpen(false)} />
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#e5e5ea] overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-[#e5e5ea] bg-[#f5f5f7]">
                    <p className="text-[10px] font-bold text-[#8e8e93] uppercase tracking-wider">Form builder</p>
                    <p className="text-[11px] text-[#8e8e93] mt-0.5">What your prospects see and fill out</p>
                  </div>
                  {formSubTabs.map((sub) => {
                    const isActive = activeTab === sub.id;
                    return (
                      <button key={sub.id}
                        onClick={() => { setActiveTab(sub.id); setFormMenuOpen(false); }}
                        className="w-full text-left px-4 py-3 hover:bg-[#f5f5f7] transition-colors flex items-start gap-3 border-b border-[#e5e5ea] last:border-b-0">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#1a1a1a]">{sub.label}</p>
                          <p className="text-[11px] text-[#8e8e93] mt-0.5 leading-snug">{sub.description}</p>
                        </div>
                        {isActive && (
                          <svg className="w-4 h-4 text-[#1a1a1a] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Scrollable main tabs */}
          <div className="flex gap-1 overflow-x-auto pb-2 flex-1 min-w-0">
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
        </div>

        {/* Account */}
        {activeTab === 'account' && (
          <div className="space-y-5">
            {/* Email */}
            <div>
              <label className="text-[#8e8e93] text-xs block mb-1">Email</label>
              {!showChangeEmail ? (
                <div className="flex items-center justify-between gap-3 bg-[#f5f5f7] rounded-xl px-4 py-3">
                  <p className="text-[#1a1a1a] text-sm truncate">{userEmail}</p>
                  <button onClick={() => { setShowChangeEmail(true); setEmailChangeSent(false); setEmailError(''); setNewEmail(''); }}
                    className="text-[#007AFF] text-xs font-medium flex-shrink-0">Change</button>
                </div>
              ) : emailChangeSent ? (
                <div className="rounded-xl bg-[#f5f5f7] px-4 py-3">
                  <p className="text-[#1a1a1a] text-sm font-medium mb-1">Check your inbox</p>
                  <p className="text-[#8e8e93] text-xs leading-relaxed">
                    We&apos;ve sent a confirmation link to <strong className="text-[#1a1a1a]">{newEmail}</strong>. Click it to finish the change. You may also need to confirm from <strong className="text-[#1a1a1a]">{userEmail}</strong>.
                  </p>
                  <button onClick={() => { setShowChangeEmail(false); setNewEmail(''); setEmailChangeSent(false); }}
                    className="mt-3 text-[#8e8e93] text-xs font-medium hover:underline">Done</button>
                </div>
              ) : (
                <div className="space-y-2">
                  <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="new@email.com" autoComplete="email" className={inputClass} />
                  {emailError && <p className="text-[#FF3B30] text-xs bg-[#FF3B30]/5 rounded-lg px-3 py-2">{emailError}</p>}
                  <div className="flex gap-2">
                    <button onClick={handleChangeEmail} disabled={emailChanging || !newEmail.trim()}
                      className="flex-1 py-2.5 rounded-xl bg-[#1a1a1a] text-white font-semibold text-xs disabled:opacity-40 transition-all active:scale-[0.97]">
                      {emailChanging ? 'Sending...' : 'Send confirmation'}
                    </button>
                    <button onClick={() => { setShowChangeEmail(false); setNewEmail(''); setEmailError(''); }}
                      className="px-4 py-2.5 rounded-xl bg-[#f5f5f7] text-[#1a1a1a] font-semibold text-xs hover:bg-[#e5e5ea] transition-all">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="text-[#8e8e93] text-xs block mb-1">Password</label>
              {!showChangePassword ? (
                <div className="flex items-center justify-between gap-3 bg-[#f5f5f7] rounded-xl px-4 py-3">
                  <p className="text-[#1a1a1a] text-sm tracking-widest">••••••••</p>
                  <button onClick={() => { setShowChangePassword(true); setPasswordChanged(false); setPasswordError(''); setCurrentPassword(''); setNewPassword(''); }}
                    className="text-[#007AFF] text-xs font-medium flex-shrink-0">Change</button>
                </div>
              ) : passwordChanged ? (
                <div className="rounded-xl bg-[#f5f5f7] px-4 py-3">
                  <p className="text-[#1a1a1a] text-sm font-medium mb-1">Password updated</p>
                  <p className="text-[#8e8e93] text-xs">Use your new password next time you log in.</p>
                  <button onClick={() => { setShowChangePassword(false); setPasswordChanged(false); }}
                    className="mt-3 text-[#8e8e93] text-xs font-medium hover:underline">Done</button>
                </div>
              ) : (
                <div className="space-y-2">
                  <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Current password" autoComplete="current-password" className={inputClass} />
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password (min 6 characters)" autoComplete="new-password" minLength={6} className={inputClass} />
                  {passwordError && <p className="text-[#FF3B30] text-xs bg-[#FF3B30]/5 rounded-lg px-3 py-2">{passwordError}</p>}
                  <div className="flex gap-2">
                    <button onClick={handleChangePassword} disabled={passwordChanging || !currentPassword || !newPassword || newPassword.length < 6}
                      className="flex-1 py-2.5 rounded-xl bg-[#1a1a1a] text-white font-semibold text-xs disabled:opacity-40 transition-all active:scale-[0.97]">
                      {passwordChanging ? 'Updating...' : 'Update password'}
                    </button>
                    <button onClick={() => { setShowChangePassword(false); setCurrentPassword(''); setNewPassword(''); setPasswordError(''); }}
                      className="px-4 py-2.5 rounded-xl bg-[#f5f5f7] text-[#1a1a1a] font-semibold text-xs hover:bg-[#e5e5ea] transition-all">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Log out */}
            <div>
              <button onClick={handleLogout}
                className="w-full py-3 rounded-xl bg-[#f5f5f7] text-[#1a1a1a] font-semibold text-sm hover:bg-[#e5e5ea] transition-all active:scale-[0.97]">
                Log out
              </button>
            </div>

            {/* Delete account */}
            <div className="pt-6 mt-6 border-t border-[#e5e5ea]">
              <p className="text-[#8e8e93] text-xs mb-3">Danger zone</p>
              <button onClick={async () => {
                if (!confirm('Are you sure you want to delete your account? This will:\n\n• Cancel your subscription\n• Delete all your leads\n• Remove your landing page\n• Delete your account permanently\n\nThis cannot be undone.')) return;
                if (!confirm('Really? This is permanent and cannot be reversed.')) return;

                const supabase = createBrowserClient();
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return;

                const res = await fetch('/api/delete-account', {
                  method: 'POST',
                  headers: { Authorization: `Bearer ${session.access_token}` },
                });

                if (res.ok) {
                  await supabase.auth.signOut();
                  window.location.href = '/';
                } else {
                  alert('Failed to delete account. Please contact support.');
                }
              }}
                className="text-[#FF3B30] text-xs font-medium hover:underline">
                Delete my account and all data
              </button>
            </div>
          </div>
        )}

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

        {/* Goals */}
        {activeTab === 'goals' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[#8e8e93] text-xs">Customise the goal options prospects see. Leave empty to use the defaults.</p>
              <button onClick={() => setCustomGoals([...customGoals, {
                id: `goal-${Date.now()}`, emoji: '🎯', label: '', subtitle: '', needs_target: false,
                target_prompt: '', target_placeholder: '', goal_type: 'fitness' as GoalType,
              }])}
                className="text-xs text-[#007AFF] font-medium flex-shrink-0 ml-3">+ Add</button>
            </div>

            {customGoals.map((g, i) => (
              <div key={g.id} className="bg-[#f5f5f7] rounded-xl p-4 space-y-3">
                <div className="flex gap-2">
                  <input value={g.emoji}
                    onChange={(e) => { const u = [...customGoals]; u[i] = { ...u[i], emoji: e.target.value }; setCustomGoals(u); }}
                    placeholder="🎯"
                    className="w-14 bg-[#f5f5f7] border border-[#e5e5ea] rounded-xl px-2 py-2.5 text-center text-lg focus:outline-none focus:border-[#8e8e93]" />
                  <input value={g.label}
                    onChange={(e) => { const u = [...customGoals]; u[i] = { ...u[i], label: e.target.value }; setCustomGoals(u); }}
                    placeholder="e.g. Run a 5K"
                    className={inputClass} />
                  <button onClick={() => setCustomGoals(customGoals.filter((_, idx) => idx !== i))}
                    className="text-[#FF3B30] text-xs px-2 flex-shrink-0">Remove</button>
                </div>

                <input value={g.subtitle}
                  onChange={(e) => { const u = [...customGoals]; u[i] = { ...u[i], subtitle: e.target.value }; setCustomGoals(u); }}
                  placeholder="Short description, e.g. From couch to finish line"
                  className={inputClass} />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[#8e8e93] text-[10px] block mb-1">Timeline calculation</label>
                    <select value={g.goal_type}
                      onChange={(e) => { const u = [...customGoals]; u[i] = { ...u[i], goal_type: e.target.value as GoalType }; setCustomGoals(u); }}
                      className={inputClass}>
                      <option value="weight_loss">Weight loss</option>
                      <option value="muscle_gain">Muscle gain</option>
                      <option value="fitness">Fitness</option>
                      <option value="performance">Performance</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[#8e8e93] text-[10px] block mb-1">Ask for a target?</label>
                    <div className="flex items-center gap-2 mt-1">
                      <button onClick={() => { const u = [...customGoals]; u[i] = { ...u[i], needs_target: !u[i].needs_target }; setCustomGoals(u); }}
                        className="w-10 h-6 rounded-full p-0.5 transition-all duration-300"
                        style={{ backgroundColor: g.needs_target ? '#34C759' : '#e5e5ea' }}>
                        <div className="w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300"
                          style={{ transform: g.needs_target ? 'translateX(16px)' : 'translateX(0)' }} />
                      </button>
                      <span className="text-[#8e8e93] text-[10px]">{g.needs_target ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>

                {g.needs_target && (
                  <div className="space-y-2 pt-2 border-t border-[#e5e5ea]">
                    <div>
                      <label className="text-[#8e8e93] text-[10px] block mb-0.5">Target question</label>
                      <input value={g.target_prompt}
                        onChange={(e) => { const u = [...customGoals]; u[i] = { ...u[i], target_prompt: e.target.value }; setCustomGoals(u); }}
                        placeholder="e.g. What's your target time?"
                        className={inputClass} />
                    </div>
                    <div>
                      <label className="text-[#8e8e93] text-[10px] block mb-0.5">Placeholder</label>
                      <input value={g.target_placeholder}
                        onChange={(e) => { const u = [...customGoals]; u[i] = { ...u[i], target_placeholder: e.target.value }; setCustomGoals(u); }}
                        placeholder="e.g. Under 30 minutes"
                        className={inputClass} />
                    </div>
                  </div>
                )}
              </div>
            ))}

            {customGoals.length === 0 && (
              <div className="space-y-2">
                <p className="text-[#8e8e93] text-xs text-center py-4">Using default goals (Lose Weight, Build Muscle, Improve Fitness, Performance)</p>
                <button onClick={() => setCustomGoals([
                  { id: 'wl', emoji: '🔥', label: 'Lose Weight', subtitle: 'Burn fat & get lean', needs_target: false, target_prompt: '', target_placeholder: '', goal_type: 'weight_loss' },
                  { id: 'mg', emoji: '💪', label: 'Build Muscle', subtitle: 'Get stronger & bigger', needs_target: false, target_prompt: '', target_placeholder: '', goal_type: 'muscle_gain' },
                  { id: 'fi', emoji: '❤️', label: 'Improve Fitness', subtitle: 'Feel healthier & fitter', needs_target: true, target_prompt: "What does 'fit' look like for you?", target_placeholder: 'e.g. Run 5K without stopping', goal_type: 'fitness' },
                  { id: 'pe', emoji: '🏃', label: 'Performance', subtitle: 'Hit a specific target', needs_target: true, target_prompt: "What's your specific target?", target_placeholder: 'e.g. Sub-25min 5K', goal_type: 'performance' },
                ])}
                  className="w-full py-4 rounded-xl border border-dashed border-[#e5e5ea] text-[#8e8e93] text-sm hover:border-[#8e8e93] transition-colors">
                  + Tap to customise the defaults
                </button>
              </div>
            )}

            <GoalsPreview
              theme={form.theme}
              primaryColor={form.brand_color_primary}
              goals={customGoals}
            />
          </div>
        )}

        {/* Forms */}
        {activeTab === 'forms' && trainerData && (
          <FormFlowEditor trainer={trainerData} goals={customGoals} />
        )}

        {/* Questions */}
        {activeTab === 'questions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[#8e8e93] text-xs">
                Add custom questions to your form.
                {trainerData?.tier !== 'pro' && ' Starter plan: 2 questions max.'}
              </p>
              <button onClick={() => setCustomQuestions([...customQuestions, {
                id: `q-${Date.now()}`, question: '', type: 'select', options: ['', ''], placeholder: '',
              }])}
                disabled={trainerData?.tier !== 'pro' && customQuestions.length >= 2}
                className="text-xs text-[#007AFF] font-medium flex-shrink-0 ml-3 disabled:opacity-30 disabled:cursor-not-allowed">
                {trainerData?.tier !== 'pro' && customQuestions.length >= 2 ? 'Pro: unlimited' : '+ Add'}
              </button>
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
          <div className="space-y-5">
            <p className="text-[#8e8e93] text-xs">Configure what training options prospects can choose from on your timeline.</p>

            {/* Show prices */}
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

            {/* Nutrition */}
            <ServiceToggle
              title="Nutrition support"
              subtitle="Genuine accelerator — stacks on top of any training type"
              enabled={nutritionService.enabled}
              onToggle={() => setNutritionService({ ...nutritionService, enabled: !nutritionService.enabled })}
            >
              <input value={nutritionService.name} onChange={(e) => setNutritionService({ ...nutritionService, name: e.target.value })}
                placeholder="e.g. Nutrition Plan" className={inputClass} />
              <textarea value={nutritionService.description} onChange={(e) => setNutritionService({ ...nutritionService, description: e.target.value })}
                placeholder="What's included..." rows={2} className={inputClass} />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#8e8e93] text-[10px] block mb-0.5">Timeline reduction</label>
                  <div className="flex items-center gap-2">
                    <input type="range" min={5} max={30} step={5} value={nutritionService.timeline_reduction_percent}
                      onChange={(e) => setNutritionService({ ...nutritionService, timeline_reduction_percent: parseInt(e.target.value) })} className="flex-1" />
                    <span className="text-sm font-semibold min-w-[3ch] text-right">{nutritionService.timeline_reduction_percent}%</span>
                  </div>
                </div>
                <div>
                  <label className="text-[#8e8e93] text-[10px] block mb-0.5">£/month</label>
                  <input type="number" value={nutritionService.price_per_month || ''}
                    onChange={(e) => setNutritionService({ ...nutritionService, price_per_month: e.target.value ? parseFloat(e.target.value) : null })}
                    placeholder="Optional" className={inputClass} />
                </div>
              </div>
            </ServiceToggle>

            {/* Online */}
            <ServiceToggle
              title="Online programming"
              subtitle="Alternative to in-person — more flexible but slightly slower results"
              enabled={onlineService.enabled}
              onToggle={() => setOnlineService({ ...onlineService, enabled: !onlineService.enabled })}
            >
              <input value={onlineService.name} onChange={(e) => setOnlineService({ ...onlineService, name: e.target.value })}
                placeholder="e.g. Online Programming" className={inputClass} />
              <textarea value={onlineService.description} onChange={(e) => setOnlineService({ ...onlineService, description: e.target.value })}
                placeholder="What's included..." rows={2} className={inputClass} />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#8e8e93] text-[10px] block mb-0.5">Effectiveness vs in-person</label>
                  <div className="flex items-center gap-2">
                    <input type="range" min={50} max={95} step={5} value={onlineService.effectiveness_vs_inperson * 100}
                      onChange={(e) => setOnlineService({ ...onlineService, effectiveness_vs_inperson: parseInt(e.target.value) / 100 })} className="flex-1" />
                    <span className="text-sm font-semibold min-w-[3ch] text-right">{Math.round(onlineService.effectiveness_vs_inperson * 100)}%</span>
                  </div>
                  <p className="text-[#8e8e93] text-[9px] mt-0.5">e.g. 75% means online takes ~25% longer than in-person</p>
                </div>
                <div>
                  <label className="text-[#8e8e93] text-[10px] block mb-0.5">£/month</label>
                  <input type="number" value={onlineService.price_per_month || ''}
                    onChange={(e) => setOnlineService({ ...onlineService, price_per_month: e.target.value ? parseFloat(e.target.value) : null })}
                    placeholder="Optional" className={inputClass} />
                </div>
              </div>
            </ServiceToggle>

            {/* Hybrid */}
            <ServiceToggle
              title="Hybrid coaching"
              subtitle="Mix of in-person + online — prospect chooses their split"
              enabled={hybridService.enabled}
              onToggle={() => setHybridService({ ...hybridService, enabled: !hybridService.enabled })}
            >
              <input value={hybridService.name} onChange={(e) => setHybridService({ ...hybridService, name: e.target.value })}
                placeholder="e.g. Hybrid Coaching" className={inputClass} />
              <textarea value={hybridService.description} onChange={(e) => setHybridService({ ...hybridService, description: e.target.value })}
                placeholder="What's included..." rows={2} className={inputClass} />
              <div>
                <label className="text-[#8e8e93] text-[10px] block mb-0.5">£/month</label>
                <input type="number" value={hybridService.price_per_month || ''}
                  onChange={(e) => setHybridService({ ...hybridService, price_per_month: e.target.value ? parseFloat(e.target.value) : null })}
                  placeholder="Optional" className={inputClass} />
              </div>
            </ServiceToggle>
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
            {/* Plan comparison */}
            <div className="grid grid-cols-2 gap-3">
              {/* Starter */}
              <div className={`rounded-xl p-4 border ${trainerData?.tier === 'starter' && subscriptionStatus === 'active' ? 'border-[#1a1a1a]' : 'border-[#e5e5ea]'}`}>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-sm">Starter</p>
                  {trainerData?.tier === 'starter' && subscriptionStatus === 'active' && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#1a1a1a] text-white">Current</span>
                  )}
                </div>
                <p className="text-xl font-bold">£9.99<span className="text-xs text-[#8e8e93] font-normal">/mo</span></p>
                <ul className="mt-3 space-y-1.5">
                  {['Unlimited leads', 'AI timelines', 'All branding', 'Dashboard & analytics', '2 custom questions', '"Powered by" badge'].map(f => (
                    <li key={f} className="text-[10px] text-[#8e8e93] flex items-center gap-1.5">
                      <span className="text-[#34C759]">✓</span> {f}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pro */}
              <div className={`rounded-xl p-4 border ${trainerData?.tier === 'pro' && subscriptionStatus === 'active' ? 'border-[#1a1a1a]' : 'border-[#e5e5ea]'}`}>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-sm">Pro</p>
                  {trainerData?.tier === 'pro' && subscriptionStatus === 'active' ? (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#1a1a1a] text-white">Current</span>
                  ) : (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#007AFF] text-white">Upgrade</span>
                  )}
                </div>
                <p className="text-xl font-bold">£19.99<span className="text-xs text-[#8e8e93] font-normal">/mo</span></p>
                <ul className="mt-3 space-y-1.5">
                  {['Everything in Starter', 'No "Powered by" badge', 'Export leads to CSV', 'Unlimited questions', 'Multiple forms'].map(f => (
                    <li key={f} className="text-[10px] text-[#1a1a1a] flex items-center gap-1.5">
                      <span className="text-[#34C759]">✓</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Actions */}
            {subscriptionStatus === 'active' ? (
              <div className="space-y-2">
                {trainerData?.tier === 'starter' && (
                  <button onClick={async () => {
                    setBillingLoading(true);
                    const supabase = (await import('@/lib/auth')).createBrowserClient();
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session) return;
                    const res = await fetch('/api/checkout', {
                      method: 'POST',
                      headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
                      body: JSON.stringify({ tier: 'pro' }),
                    });
                    const data = await res.json();
                    if (data.url) window.location.href = data.url;
                    setBillingLoading(false);
                  }} disabled={billingLoading}
                    className="w-full py-3.5 rounded-xl bg-[#1a1a1a] text-white font-semibold text-sm transition-all active:scale-[0.97] disabled:opacity-40">
                    {billingLoading ? 'Loading...' : 'Upgrade to Pro — £19.99/month'}
                  </button>
                )}
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
              </div>
            ) : (
              <div className="space-y-2">
                <button onClick={async () => {
                  setBillingLoading(true);
                  const supabase = (await import('@/lib/auth')).createBrowserClient();
                  const { data: { session } } = await supabase.auth.getSession();
                  if (!session) return;
                  const res = await fetch('/api/checkout', {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tier: 'starter' }),
                  });
                  const data = await res.json();
                  if (data.url) window.location.href = data.url;
                  setBillingLoading(false);
                }} disabled={billingLoading}
                  className="w-full py-3.5 rounded-xl bg-[#1a1a1a] text-white font-semibold text-sm transition-all active:scale-[0.97] disabled:opacity-40">
                  {billingLoading ? 'Loading...' : 'Subscribe Starter — £9.99/month'}
                </button>
                <button onClick={async () => {
                  setBillingLoading(true);
                  const supabase = (await import('@/lib/auth')).createBrowserClient();
                  const { data: { session } } = await supabase.auth.getSession();
                  if (!session) return;
                  const res = await fetch('/api/checkout', {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tier: 'pro' }),
                  });
                  const data = await res.json();
                  if (data.url) window.location.href = data.url;
                  setBillingLoading(false);
                }} disabled={billingLoading}
                  className="w-full py-3.5 rounded-xl bg-[#f5f5f7] text-[#1a1a1a] font-semibold text-sm hover:bg-[#e5e5ea] transition-all active:scale-[0.97] disabled:opacity-40">
                  {billingLoading ? 'Loading...' : 'Subscribe Pro — £19.99/month'}
                </button>
              </div>
            )}

            <p className="text-[#8e8e93] text-[11px] text-center">
              Payments handled securely by Stripe. Cancel anytime.
            </p>
          </div>
        )}

        {/* Save — hide on billing and account tabs */}
        {activeTab !== 'billing' && activeTab !== 'account' && (
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

function ServiceToggle({ title, subtitle, enabled, onToggle, children }: {
  title: string; subtitle: string; enabled: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[#e5e5ea] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-sm">{title}</p>
          <p className="text-[#8e8e93] text-xs mt-0.5">{subtitle}</p>
        </div>
        <button onClick={onToggle}
          className="w-12 h-7 rounded-full p-0.5 transition-all duration-300"
          style={{ backgroundColor: enabled ? '#34C759' : '#e5e5ea' }}>
          <div className="w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-300"
            style={{ transform: enabled ? 'translateX(20px)' : 'translateX(0)' }} />
        </button>
      </div>
      {enabled && (
        <div className="space-y-3 pt-2 border-t border-[#e5e5ea]">
          {children}
        </div>
      )}
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
