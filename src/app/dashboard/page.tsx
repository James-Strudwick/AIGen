'use client';

import { useState, useEffect, useCallback } from 'react';
import { createBrowserClient } from '@/lib/auth';
import { Lead, GoalType, LeadStatus, Trainer, Package } from '@/types';
import Link from 'next/link';
import SetupChecklist from '@/components/SetupChecklist';

const goalLabels: Record<GoalType, string> = {
  weight_loss: '🔥 Weight Loss',
  muscle_gain: '💪 Muscle Gain',
  fitness: '❤️ Fitness',
  performance: '🏃 Performance',
};

const statusLabels: Record<LeadStatus, { label: string; color: string; bg: string }> = {
  form_completed: { label: 'Form completed', color: '#8e8e93', bg: '#f5f5f7' },
  whatsapp_sent: { label: 'WhatsApp sent', color: '#34C759', bg: '#34C75910' },
  call_booked: { label: 'Call booked', color: '#007AFF', bg: '#007AFF10' },
  converted: { label: 'Converted', color: '#FF9500', bg: '#FF950010' },
};

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [trainerPackages, setTrainerPackages] = useState<Package[]>([]);
  const [trainerName, setTrainerName] = useState('');
  const [trainerSlug, setTrainerSlug] = useState('');
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('none');
  const [filter, setFilter] = useState<'all' | GoalType | LeadStatus>('all');
  const [copied, setCopied] = useState(false);
  const [refCopied, setRefCopied] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  const fetchData = useCallback(async () => {
    const supabase = createBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      window.location.href = '/login';
      return;
    }

    const res = await fetch('/api/me', {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });

    if (!res.ok) {
      if (res.status === 401) window.location.href = '/login';
      if (res.status === 404) window.location.href = '/onboarding';
      return;
    }

    const { trainer: trainerData, packages: pkgData, leads: leadsData } = await res.json();

    setTrainer(trainerData as Trainer);
    setTrainerPackages((pkgData || []) as Package[]);
    setTrainerName(trainerData.name);
    setTrainerSlug(trainerData.slug);
    setSubscriptionStatus(trainerData.subscription_status || 'none');
    setLeads((leadsData || []) as Lead[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubscribe = async () => {
    setCheckingOut(true);
    const supabase = createBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    setCheckingOut(false);
  };

  const handleManageBilling = async () => {
    const supabase = createBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const res = await fetch('/api/billing-portal', {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  const handleLogout = async () => {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const markConverted = async (leadId: string) => {
    await fetch('/api/track-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId, action: 'converted' }),
    });
    fetchData();
  };

  const deleteLead = async (leadId: string) => {
    if (!confirm('Delete this lead? This cannot be undone.')) return;
    await fetch('/api/track-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId, action: 'delete' }),
    });
    fetchData();
  };

  // Filter leads
  const filteredLeads = leads.filter(l => {
    if (filter === 'all') return true;
    if (['weight_loss', 'muscle_gain', 'fitness', 'performance'].includes(filter)) return l.goal_type === filter;
    return l.status === filter;
  });

  // Stats
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thisWeek = leads.filter(l => new Date(l.created_at) > weekAgo);
  const whatsappSent = leads.filter(l => l.status === 'whatsapp_sent' || l.status === 'call_booked' || l.status === 'converted');
  const converted = leads.filter(l => l.status === 'converted');

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-white flex items-center justify-center">
        <p className="text-[#8e8e93]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-white">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-[#8e8e93] text-sm">{trainerName}</p>
          </div>
          <div className="flex gap-2">
            <Link href={subscriptionStatus === 'active' ? `/${trainerSlug}` : `/preview/${trainerSlug}`} target="_blank"
              className="text-[#8e8e93] text-xs px-3 py-1.5 rounded-lg bg-[#f5f5f7] hover:bg-[#e5e5ea] transition-colors">
              {subscriptionStatus === 'active' ? 'View page' : 'Preview page'}
            </Link>
            <Link href="/settings"
              className="text-[#8e8e93] text-xs px-3 py-1.5 rounded-lg bg-[#f5f5f7] hover:bg-[#e5e5ea] transition-colors">
              Settings
            </Link>
            {subscriptionStatus === 'active' && (
              <button onClick={handleManageBilling}
                className="text-[#8e8e93] text-xs px-3 py-1.5 rounded-lg bg-[#f5f5f7] hover:bg-[#e5e5ea] transition-colors">
                Billing
              </button>
            )}
            <button onClick={handleLogout}
              className="text-[#8e8e93] text-xs px-3 py-1.5 rounded-lg bg-[#f5f5f7] hover:bg-[#e5e5ea] transition-colors">
              Log out
            </button>
          </div>
        </div>

        {/* Setup checklist */}
        {trainer && (
          <SetupChecklist trainer={trainer} packages={trainerPackages} />
        )}

        {/* Subscription banner — only show if checklist is gone (all setup done) but not subscribed */}
        {trainer && !trainer.active && subscriptionStatus !== 'active' && trainer.contact_value && trainer.booking_link && trainerPackages.length > 0 && (
          <div className="rounded-xl border border-[#e5e5ea] p-5 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm">
                  {subscriptionStatus === 'none' ? 'Subscribe to go live' : subscriptionStatus === 'past_due' ? 'Payment overdue' : 'Subscription cancelled'}
                </p>
                <p className="text-[#8e8e93] text-xs mt-0.5">
                  {subscriptionStatus === 'none'
                    ? 'Your page is hidden until you subscribe — £9.99/month'
                    : subscriptionStatus === 'past_due'
                    ? 'Please update your payment method to keep your page live'
                    : 'Your page is no longer live — resubscribe to reactivate'}
                </p>
              </div>
              <button onClick={handleSubscribe} disabled={checkingOut}
                className="bg-[#1a1a1a] text-white text-xs font-semibold px-4 py-2 rounded-xl flex-shrink-0 ml-4 disabled:opacity-40">
                {checkingOut ? 'Loading...' : subscriptionStatus === 'none' ? 'Subscribe' : 'Resubscribe'}
              </button>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <StatCard label="Total leads" value={leads.length} />
          <StatCard label="This week" value={thisWeek.length} />
          <StatCard label="Messaged" value={whatsappSent.length} />
          <StatCard label="Converted" value={converted.length} />
        </div>

        {/* Share link */}
        <div className="bg-[#f5f5f7] rounded-xl p-4 mb-6 flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] text-[#8e8e93] uppercase tracking-wider font-semibold mb-0.5">Your link</p>
            <p className="text-sm font-medium truncate">{typeof window !== 'undefined' ? `${window.location.origin}/${trainerSlug}` : `/${trainerSlug}`}</p>
          </div>
          <button onClick={() => {
            const url = `${window.location.origin}/${trainerSlug}`;
            navigator.clipboard.writeText(url).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            });
          }}
            className="text-xs font-medium px-3 py-1.5 rounded-lg bg-white flex-shrink-0 ml-3"
            style={{ color: copied ? '#34C759' : '#007AFF' }}>
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        {/* Referral section */}
        {trainer?.referral_code && (
          <div className="bg-[#f5f5f7] rounded-xl p-4 mb-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-[10px] text-[#8e8e93] uppercase tracking-wider font-semibold mb-0.5">Refer & save</p>
                <p className="text-sm font-medium">
                  {trainer.has_referral_discount
                    ? '🎉 You\'ve earned 50% off for life!'
                    : `Refer 5 people, get 50% off for life`}
                </p>
              </div>
              {!trainer.has_referral_discount && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white"
                  style={{ color: (trainer.referral_count || 0) >= 5 ? '#34C759' : '#1a1a1a' }}>
                  {trainer.referral_count || 0}/5
                </span>
              )}
            </div>

            {/* Progress dots */}
            {!trainer.has_referral_discount && (
              <div className="flex gap-1.5 mb-3">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-1.5 flex-1 rounded-full transition-all"
                    style={{ backgroundColor: i < (trainer.referral_count || 0) ? '#1a1a1a' : '#e5e5ea' }} />
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white rounded-lg px-3 py-2 text-xs font-mono truncate text-[#1a1a1a]">
                fomoforms.com/signup?ref={trainer.referral_code}
              </div>
              <button onClick={() => {
                navigator.clipboard.writeText(`https://fomoforms.com/signup?ref=${trainer.referral_code}`).then(() => {
                  setRefCopied(true);
                  setTimeout(() => setRefCopied(false), 2000);
                });
              }}
                className="text-xs font-medium px-3 py-2 rounded-lg bg-white flex-shrink-0"
                style={{ color: refCopied ? '#34C759' : '#007AFF' }}>
                {refCopied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 -mx-4 px-4">
          {[
            { id: 'all', label: 'All' },
            { id: 'form_completed', label: 'Form only' },
            { id: 'whatsapp_sent', label: 'Messaged' },
            { id: 'call_booked', label: 'Booked' },
            { id: 'converted', label: 'Converted' },
            { id: 'weight_loss', label: '🔥 Weight Loss' },
            { id: 'muscle_gain', label: '💪 Muscle' },
            { id: 'fitness', label: '❤️ Fitness' },
            { id: 'performance', label: '🏃 Perf.' },
          ].map((f) => (
            <button key={f.id} onClick={() => setFilter(f.id as typeof filter)}
              className="text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition-all flex-shrink-0"
              style={{
                backgroundColor: filter === f.id ? '#1a1a1a' : '#f5f5f7',
                color: filter === f.id ? '#ffffff' : '#8e8e93',
              }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Leads list */}
        {filteredLeads.length === 0 ? (
          <div className="text-center py-16 text-[#8e8e93]">
            <p className="text-lg mb-1">No leads yet</p>
            <p className="text-sm">Share your link to start capturing leads</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredLeads.map((lead) => {
              const status = statusLabels[lead.status] || statusLabels.form_completed;
              const timeAgo = getTimeAgo(lead.created_at);

              return (
                <div key={lead.id} className="bg-[#f5f5f7] rounded-xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-sm">{lead.name}</p>
                      <p className="text-[#8e8e93] text-xs">{lead.phone}</p>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: status.bg, color: status.color }}>
                      {status.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-[#8e8e93] mb-3">
                    <span>{goalLabels[lead.goal_type] || lead.goal_type}</span>
                    <span>·</span>
                    <span>{lead.experience_level}</span>
                    <span>·</span>
                    <span>{lead.available_days_per_week}x/wk</span>
                    <span>·</span>
                    <span>{timeAgo}</span>
                  </div>

                  {lead.generated_timeline && (
                    <p className="text-xs text-[#8e8e93] mb-2 line-clamp-2">
                      {(lead.generated_timeline as { summary?: string }).summary}
                    </p>
                  )}

                  {lead.custom_answers && Object.keys(lead.custom_answers).length > 0 && (
                    <div className="flex gap-1.5 flex-wrap mb-3">
                      {Object.values(lead.custom_answers).map((val, idx) => {
                        const str = Array.isArray(val) ? val.join(', ') : val;
                        return str ? (
                          <span key={idx} className="text-[10px] bg-[#e5e5ea] text-[#1a1a1a] px-2 py-0.5 rounded-full">{str}</span>
                        ) : null;
                      })}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {lead.status !== 'converted' && (
                        <button onClick={() => markConverted(lead.id)}
                          className="text-[10px] font-medium px-3 py-1.5 rounded-lg bg-white text-[#FF9500] border border-[#e5e5ea]">
                          Mark converted
                        </button>
                      )}
                      <a href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer"
                        className="text-[10px] font-medium px-3 py-1.5 rounded-lg bg-white text-[#34C759] border border-[#e5e5ea]">
                        WhatsApp
                      </a>
                    </div>
                    <button onClick={() => deleteLead(lead.id)}
                      className="p-1.5 rounded-lg hover:bg-[#e5e5ea] transition-colors text-[#8e8e93] hover:text-[#FF3B30]">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-[#f5f5f7] rounded-xl p-3 text-center">
      <p className="text-xl font-bold tracking-tight">{value}</p>
      <p className="text-[10px] text-[#8e8e93]">{label}</p>
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;

  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}
