// @polsia:user-owned — server-only email helper wrapping the Polsia email proxy.
// Import ONLY from server-side code (route handlers, server libs).
import 'server-only';

const BASE = 'https://polsia.com/api/proxy/email';

function authHeader() {
  return `Bearer ${process.env.POLSIA_API_KEY ?? ''}`;
}

export async function registerContact(email: string, name: string, source = 'signup') {
  await fetch(`${BASE}/contacts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: authHeader() },
    body: JSON.stringify({ email, name, source }),
  });
}

interface SendEmailOpts {
  to: string;
  subject: string;
  body: string;
  html?: string;
}

export async function sendEmail({ to, subject, body, html }: SendEmailOpts) {
  await fetch(`${BASE}/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: authHeader() },
    body: JSON.stringify({ to, subject, body, ...(html ? { html } : {}) }),
  });
}
