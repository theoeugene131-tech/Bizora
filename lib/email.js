import { BRAND } from "./brand";

const FROM = process.env.EMAIL_FROM ?? `${BRAND.name} <onboarding@resend.dev>`;

export async function sendEmail({ to, subject, html }) {
  if (!process.env.RESEND_API_KEY || !to) return { skipped: true };
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM, to: [to], subject, html }),
  });
  return res.json();
}

const businessUrl = (slug) =>
  `${process.env.SITE_URL ?? "http://localhost:3000"}/business/${slug}`;

export function sendSubmissionReceived(b) {
  return sendEmail({
    to: b.submitter_email,
    subject: `We received your ${BRAND.name} listing ${BRAND.emoji}`,
    html: `<p>Hi there,</p><p>Thanks for adding <strong>${b.name}</strong> to ${BRAND.name}. Our team is reviewing it — you'll get an email as soon as it goes live (usually within 24 hours).</p>`,
  });
}

export function sendApproved(b) {
  return sendEmail({
    to: b.submitter_email || b.email,
    subject: `🎉 ${b.name} is now live on ${BRAND.name}!`,
    html: `<p>Congratulations!</p><p><strong>${b.name}</strong> is now live here: <a href="${businessUrl(b.slug)}">${businessUrl(b.slug)}</a></p><p>Want more customers? Reply to this email to upgrade to ★ Featured.</p>`,
  });
}

export function sendRejected(b) {
  return sendEmail({
    to: b.submitter_email || b.email,
    subject: `Update on your ${BRAND.name} submission`,
    html: `<p>Hi,</p><p>Unfortunately <strong>${b.name}</strong> didn't pass review this time. Reply to this email and we'll help you fix the listing.</p>`,
  });
}

export function sendFeaturedActivated(b) {
  return sendEmail({
    to: b.submitter_email || b.email,
    subject: `★ ${b.name} is now Featured on ${BRAND.name}`,
    html: `<p>Payment confirmed — your business now appears at the top of search results for 30 days. Watch those enquiries grow! 📈</p>`,
  });
}
