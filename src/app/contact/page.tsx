import Link from 'next/link';

export const metadata = { title: 'Contact — FomoForms' };

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-5">
      <div className="max-w-sm text-center">
        <Link href="/" className="text-[#8e8e93] text-sm hover:text-[#1a1a1a] transition-colors">← Back</Link>

        <h1 className="text-2xl font-bold tracking-tight mt-6 mb-2">Get in touch</h1>
        <p className="text-[#8e8e93] text-sm mb-8">
          Questions, feedback, or partnership enquiries — we&apos;d love to hear from you.
        </p>

        <a href="mailto:hello@fomoforms.com"
          className="inline-block w-full py-3.5 rounded-xl bg-[#1a1a1a] text-white font-semibold text-sm text-center transition-all active:scale-[0.97]">
          hello@fomoforms.com
        </a>

        <div className="mt-8 space-y-3 text-left">
          <div className="bg-[#f5f5f7] rounded-xl p-4">
            <p className="text-xs font-semibold mb-0.5">Support</p>
            <p className="text-xs text-[#8e8e93]">Issues with your account, billing, or technical problems</p>
          </div>
          <div className="bg-[#f5f5f7] rounded-xl p-4">
            <p className="text-xs font-semibold mb-0.5">Partnerships</p>
            <p className="text-xs text-[#8e8e93]">Affiliate deals, integrations, or bulk pricing</p>
          </div>
          <div className="bg-[#f5f5f7] rounded-xl p-4">
            <p className="text-xs font-semibold mb-0.5">Data requests</p>
            <p className="text-xs text-[#8e8e93]">GDPR data access, deletion, or portability requests</p>
          </div>
        </div>
      </div>
    </div>
  );
}
