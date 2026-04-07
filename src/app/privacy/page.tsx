import Link from 'next/link';

export const metadata = { title: 'Privacy Policy — FomoForms' };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-5 py-12">
        <Link href="/" className="text-[#8e8e93] text-sm hover:text-[#1a1a1a] transition-colors">← Back</Link>

        <h1 className="text-3xl font-bold tracking-tight mt-6 mb-2">Privacy Policy</h1>
        <p className="text-[#8e8e93] text-sm mb-8">Last updated: April 2026</p>

        <div className="prose prose-sm max-w-none text-[#1a1a1a] space-y-6">
          <section>
            <h2 className="text-lg font-semibold mb-2">Who we are</h2>
            <p className="text-sm text-[#1a1a1a] leading-relaxed">
              FomoForms (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) is an AI-powered lead generation platform for coaches and service professionals. Our website is fomoforms.com.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">What data we collect</h2>
            <p className="text-sm text-[#1a1a1a] leading-relaxed mb-3">We collect different data depending on how you use FomoForms:</p>

            <h3 className="text-sm font-semibold mt-4 mb-1">If you are a coach (account holder)</h3>
            <ul className="text-sm text-[#1a1a1a] space-y-1 list-disc pl-5">
              <li>Name, email address, and password (for your account)</li>
              <li>Business information (bio, specialties, services, packages, pricing)</li>
              <li>WhatsApp number and booking link</li>
              <li>Branding preferences (colours, fonts, images)</li>
              <li>Payment information (processed by Stripe — we do not store card details)</li>
            </ul>

            <h3 className="text-sm font-semibold mt-4 mb-1">If you are a prospect (filling out a coach&apos;s form)</h3>
            <ul className="text-sm text-[#1a1a1a] space-y-1 list-disc pl-5">
              <li>Name and phone number</li>
              <li>Fitness/health goal information (goal type, weight, age, experience level, availability)</li>
              <li>Answers to any custom questions set by the coach</li>
              <li>Generated timeline data</li>
            </ul>

            <h3 className="text-sm font-semibold mt-4 mb-1">Automatically collected</h3>
            <ul className="text-sm text-[#1a1a1a] space-y-1 list-disc pl-5">
              <li>Form step analytics (which steps you viewed/completed, anonymised by session)</li>
              <li>Authentication cookies (required for login functionality)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">How we use your data</h2>
            <ul className="text-sm text-[#1a1a1a] space-y-1 list-disc pl-5">
              <li>To provide the FomoForms service (generating timelines, capturing leads, managing accounts)</li>
              <li>To generate personalised AI narratives using Anthropic&apos;s Claude API</li>
              <li>To process payments via Stripe</li>
              <li>To send form data to the coach whose page you filled out</li>
              <li>To provide coaches with anonymised analytics about their form performance</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Who we share data with</h2>
            <ul className="text-sm text-[#1a1a1a] space-y-1 list-disc pl-5">
              <li><strong>The coach</strong> — prospect data (name, phone, goals, answers) is shared with the coach whose form was filled out. This is the core purpose of the service.</li>
              <li><strong>Supabase</strong> — our database provider, hosted in the EU</li>
              <li><strong>Anthropic</strong> — processes form data to generate personalised timeline narratives via the Claude API</li>
              <li><strong>Stripe</strong> — processes payments for coach subscriptions</li>
              <li><strong>Vercel</strong> — hosts the application</li>
            </ul>
            <p className="text-sm text-[#1a1a1a] leading-relaxed mt-2">We do not sell your data to third parties.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Data retention</h2>
            <ul className="text-sm text-[#1a1a1a] space-y-1 list-disc pl-5">
              <li>Coach accounts: retained until you delete your account</li>
              <li>Lead/prospect data: retained until the coach deletes it or deletes their account</li>
              <li>Analytics data: retained for 30 days, or until the coach resets it</li>
              <li>Payment records: retained as required by Stripe and UK tax law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Your rights (GDPR)</h2>
            <p className="text-sm text-[#1a1a1a] leading-relaxed mb-2">Under UK GDPR, you have the right to:</p>
            <ul className="text-sm text-[#1a1a1a] space-y-1 list-disc pl-5">
              <li><strong>Access</strong> — request a copy of your data</li>
              <li><strong>Rectification</strong> — correct inaccurate data</li>
              <li><strong>Erasure</strong> — request deletion of your data (&ldquo;right to be forgotten&rdquo;)</li>
              <li><strong>Portability</strong> — receive your data in a portable format</li>
              <li><strong>Object</strong> — object to processing of your data</li>
            </ul>
            <p className="text-sm text-[#1a1a1a] leading-relaxed mt-2">
              Coaches can delete their account and all associated data from Settings → Billing → Delete account.
              Prospects can request deletion by contacting us or the coach directly.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Cookies</h2>
            <p className="text-sm text-[#1a1a1a] leading-relaxed">
              We use essential cookies only — authentication session cookies (Supabase Auth) and a session identifier for form analytics (stored in sessionStorage, not a cookie, and cleared when you close the browser). We do not use advertising or tracking cookies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Data processors</h2>
            <p className="text-sm text-[#1a1a1a] leading-relaxed">
              For coaches using FomoForms: you are the data controller for your prospects&apos; data. FomoForms acts as a data processor on your behalf. We process prospect data only as necessary to provide the service you have configured.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Contact</h2>
            <p className="text-sm text-[#1a1a1a] leading-relaxed">
              For any privacy-related questions or data requests, contact us at{' '}
              <a href="mailto:hello@fomoforms.com" className="text-[#007AFF]">hello@fomoforms.com</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
