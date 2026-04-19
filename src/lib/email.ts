import { Resend } from 'resend';
import { FormData, TimelineResult } from '@/types';

let resendClient: Resend | null = null;
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resendClient) resendClient = new Resend(process.env.RESEND_API_KEY);
  return resendClient;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string
  ));
}

interface SendNewLeadEmailInput {
  to: string;
  trainerName: string;
  lead: FormData;
  goalLabel: string;
  timeline: TimelineResult;
  dashboardUrl: string;
}

/**
 * Fire-and-forget email notification to the coach when a new lead lands.
 * Logs on failure but never throws — the submit-lead flow must not break
 * just because email sending hiccups.
 */
export async function sendNewLeadEmail(input: SendNewLeadEmailInput): Promise<void> {
  const resend = getResend();
  if (!resend) {
    console.warn('[email] RESEND_API_KEY not configured — skipping new-lead notification');
    return;
  }

  const from = process.env.EMAIL_FROM || 'FomoForms <leads@fomoforms.com>';
  const { to, trainerName, lead, goalLabel, timeline, dashboardUrl } = input;

  const subject = `New lead: ${lead.name} wants to ${goalLabel.toLowerCase()}`;

  const customAnswersList = Object.entries(lead.customAnswers || {})
    .filter(([, v]) => v && (Array.isArray(v) ? v.length > 0 : v.toString().trim()))
    .map(([k, v]) => `<li><strong>${escapeHtml(k)}:</strong> ${escapeHtml(Array.isArray(v) ? v.join(', ') : String(v))}</li>`)
    .join('');

  const aboutFieldsList = Object.entries(lead.customAboutFields || {})
    .filter(([, v]) => v && v.toString().trim())
    .map(([k, v]) => `<li><strong>${escapeHtml(k)}:</strong> ${escapeHtml(String(v))}</li>`)
    .join('');

  const html = `<!doctype html>
<html>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background:#f5f5f7; margin:0; padding:24px; color:#1a1a1a;">
    <div style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:16px; overflow:hidden; border:1px solid #e5e5ea;">
      <div style="padding:24px 24px 0;">
        <p style="font-size:11px; color:#8e8e93; text-transform:uppercase; letter-spacing:0.1em; margin:0 0 4px;">New lead</p>
        <h1 style="font-size:22px; margin:0 0 4px; color:#1a1a1a;">${escapeHtml(lead.name)}</h1>
        <p style="font-size:14px; color:#8e8e93; margin:0 0 16px;">Wants to ${escapeHtml(goalLabel)}</p>
      </div>
      <div style="padding:16px 24px; background:#f5f5f7;">
        <table style="width:100%; font-size:13px; color:#1a1a1a;">
          <tr><td style="padding:4px 0; color:#8e8e93;">Phone</td><td style="padding:4px 0; text-align:right;"><a href="tel:${escapeHtml(lead.phone)}" style="color:#1a1a1a; text-decoration:none;">${escapeHtml(lead.phone)}</a></td></tr>
          ${lead.age ? `<tr><td style="padding:4px 0; color:#8e8e93;">Age</td><td style="padding:4px 0; text-align:right;">${lead.age}</td></tr>` : ''}
          ${lead.experienceLevel ? `<tr><td style="padding:4px 0; color:#8e8e93;">Experience</td><td style="padding:4px 0; text-align:right;">${escapeHtml(lead.experienceLevel)}</td></tr>` : ''}
          ${lead.currentWeight ? `<tr><td style="padding:4px 0; color:#8e8e93;">Current weight</td><td style="padding:4px 0; text-align:right;">${Math.round(lead.currentWeight)} kg</td></tr>` : ''}
          ${lead.goalWeight ? `<tr><td style="padding:4px 0; color:#8e8e93;">Goal weight</td><td style="padding:4px 0; text-align:right;">${Math.round(lead.goalWeight)} kg</td></tr>` : ''}
          <tr><td style="padding:4px 0; color:#8e8e93;">Days per week</td><td style="padding:4px 0; text-align:right;">${lead.availableDays}</td></tr>
          <tr><td style="padding:4px 0; color:#8e8e93;">Estimated timeline</td><td style="padding:4px 0; text-align:right; font-weight:600;">~${timeline.estimatedWeeks} weeks</td></tr>
        </table>
      </div>
      ${(aboutFieldsList || customAnswersList) ? `
        <div style="padding:16px 24px; border-top:1px solid #e5e5ea;">
          <p style="font-size:11px; color:#8e8e93; text-transform:uppercase; letter-spacing:0.1em; margin:0 0 8px;">Their answers</p>
          <ul style="margin:0; padding-left:20px; font-size:13px; line-height:1.6; color:#1a1a1a;">
            ${aboutFieldsList}${customAnswersList}
          </ul>
        </div>
      ` : ''}
      <div style="padding:24px; border-top:1px solid #e5e5ea; text-align:center;">
        <a href="${dashboardUrl}" style="display:inline-block; background:#1a1a1a; color:#ffffff; padding:12px 24px; border-radius:12px; font-size:14px; font-weight:600; text-decoration:none;">View in dashboard</a>
        <p style="font-size:11px; color:#8e8e93; margin:16px 0 0;">Reply to this lead within 5 minutes for the highest conversion rate.</p>
      </div>
    </div>
    <p style="text-align:center; font-size:11px; color:#8e8e93; margin:16px 0 0;">Sent to ${escapeHtml(trainerName)} by FomoForms</p>
  </body>
</html>`;

  const text = [
    `New lead: ${lead.name}`,
    `Goal: ${goalLabel}`,
    `Phone: ${lead.phone}`,
    lead.age ? `Age: ${lead.age}` : '',
    lead.experienceLevel ? `Experience: ${lead.experienceLevel}` : '',
    `Days/week: ${lead.availableDays}`,
    `Estimated timeline: ~${timeline.estimatedWeeks} weeks`,
    '',
    `View in dashboard: ${dashboardUrl}`,
  ].filter(Boolean).join('\n');

  try {
    await resend.emails.send({ from, to, subject, html, text });
  } catch (err) {
    console.error('[email] Failed to send new-lead notification:', err);
  }
}

interface SendLowSpotsEmailInput {
  to: string;
  trainerName: string;
  challengeName: string;
  spotsRemaining: number;
  spotsTotal: number;
  dashboardUrl: string;
}

/** Notify the coach when a challenge drops to 5 or fewer spots remaining. */
export async function sendLowSpotsEmail(input: SendLowSpotsEmailInput): Promise<void> {
  const resend = getResend();
  if (!resend) return;
  const from = process.env.EMAIL_FROM || 'FomoForms <leads@fomoforms.com>';
  const { to, trainerName, challengeName, spotsRemaining, spotsTotal, dashboardUrl } = input;
  const subject = `⚡ ${challengeName} is nearly full — ${spotsRemaining} spots left`;

  const html = `<!doctype html>
<html>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background:#f5f5f7; margin:0; padding:24px; color:#1a1a1a;">
    <div style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:16px; overflow:hidden; border:1px solid #e5e5ea;">
      <div style="padding:24px;">
        <p style="font-size:11px; color:#8e8e93; text-transform:uppercase; letter-spacing:0.1em; margin:0 0 4px;">Heads up</p>
        <h1 style="font-size:20px; margin:0 0 12px;">${escapeHtml(challengeName)} is filling up</h1>
        <p style="font-size:14px; color:#1a1a1a; margin:0 0 16px; line-height:1.5;">
          You have <strong>${spotsRemaining} of ${spotsTotal}</strong> spots left. Worth double-checking this matches reality — update the total in Settings &rarr; Packages if not.
        </p>
        <div style="padding:16px; background:#f5f5f7; border-radius:12px; margin-bottom:16px;">
          <p style="font-size:12px; color:#8e8e93; margin:0 0 4px;">Your next lead might close it out. Prep your follow-up messaging to drop a &ldquo;last X spots&rdquo; line in your next Instagram post.</p>
        </div>
        <div style="text-align:center;">
          <a href="${dashboardUrl}?tab=packages" style="display:inline-block; background:#1a1a1a; color:#ffffff; padding:12px 24px; border-radius:12px; font-size:14px; font-weight:600; text-decoration:none;">Manage this challenge</a>
        </div>
      </div>
    </div>
    <p style="text-align:center; font-size:11px; color:#8e8e93; margin:16px 0 0;">Sent to ${escapeHtml(trainerName)} by FomoForms</p>
  </body>
</html>`;

  const text = `${challengeName} is filling up — ${spotsRemaining} of ${spotsTotal} spots left. Update the total at ${dashboardUrl}?tab=packages if this doesn't match reality.`;

  try {
    await resend.emails.send({ from, to, subject, html, text });
  } catch (err) {
    console.error('[email] Failed to send low-spots notification:', err);
  }
}
