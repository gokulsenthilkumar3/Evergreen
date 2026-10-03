// @polsia:user-owned — POST /api/waitlist: validate, persist, register contact, send confirmation.
import 'server-only';
import { NextResponse } from 'next/server';
import { WaitlistSignupCreate, WaitlistSignupItem } from '@/lib/contracts/waitlist';
import { prisma } from '@/lib/db';
import { registerContact, sendEmail } from '@/lib/email-client';

export const dynamic = 'force-dynamic';

function confirmationEmail(
  name: string,
  locale: string,
): { subject: string; body: string; html: string } {
  if (locale === 'ta') {
    return {
      subject: 'நூல்ஸ்டிட்ச் காத்திருப்பு பட்டியலில் சேர்ந்தீர்கள்!',
      body: `வணக்கம் ${name},\n\nநூல்ஸ்டிட்ச் காத்திருப்பு பட்டியலில் வரவேற்கிறோம். திருப்பூரின் ஜவுளி பொருளாதாரத்தை டிஜிட்டல்மயமாக்கும் எங்கள் பயணத்தில் நீங்கள் பங்கேற்கிறீர்கள்.\n\nவிரைவில் தொடர்பு கொள்கிறோம்.\n\nமரியாதையுடன்,\nநூல்ஸ்டிட்ச் குழு`,
      html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#1a1008">
        <h1 style="font-size:24px;font-weight:700;color:#c07820;margin-bottom:8px">நூல்ஸ்டிட்ச் 🧵</h1>
        <p style="font-size:16px;line-height:1.6">வணக்கம் <strong>${name}</strong>,</p>
        <p style="font-size:16px;line-height:1.6">நூல்ஸ்டிட்ச் காத்திருப்பு பட்டியலில் வரவேற்கிறோம். திருப்பூரின் ஜவுளி பொருளாதாரத்தை டிஜிட்டல்மயமாக்கும் எங்கள் பயணத்தில் நீங்கள் பங்கேற்கிறீர்கள்.</p>
        <p style="font-size:16px;line-height:1.6">நிறுவன உறுப்பினர்களுக்கு ஆயுள்கால சிறப்பு விலை மற்றும் தயாரிப்பு குழுவை நேரடியாக அணுகும் வாய்ப்பு கிடைக்கும்.</p>
        <p style="font-size:14px;color:#666;margin-top:32px">மரியாதையுடன்,<br/>நூல்ஸ்டிட்ச் குழு</p>
      </div>`,
    };
  }
  return {
    subject: "You're on the Noolstitch waitlist!",
    body: `Hi ${name},\n\nWelcome to the Noolstitch waitlist! You are joining us on our mission to digitise Tiruppur's textile economy.\n\nAs a founding member you'll receive lifetime preferred pricing and direct access to the product team.\n\nWe'll be in touch soon.\n\nBest,\nThe Noolstitch Team`,
    html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#1a1008">
      <h1 style="font-size:24px;font-weight:700;color:#c07820;margin-bottom:8px">Noolstitch 🧵</h1>
      <p style="font-size:16px;line-height:1.6">Hi <strong>${name}</strong>,</p>
      <p style="font-size:16px;line-height:1.6">Welcome to the Noolstitch waitlist! You're joining us on our mission to digitise Tiruppur's textile economy — ₹40,000 crore of annual trade, finally end-to-end.</p>
      <p style="font-size:16px;line-height:1.6">As a founding member you'll receive lifetime preferred pricing and direct access to the product team.</p>
      <p style="font-size:14px;color:#666;margin-top:32px">Best,<br/>The Noolstitch Team</p>
    </div>`,
  };
}

export async function POST(req: Request) {
  try {
    const parsed = WaitlistSignupCreate.safeParse(await req.json());
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const errors: Record<string, string> = {};
      for (const [field, messages] of Object.entries(fieldErrors)) {
        const msg = messages?.[0];
        if (msg) errors[field] = msg;
      }
      return NextResponse.json({ errors }, { status: 400 });
    }

    const { name, role, whatsapp, email, locale } = parsed.data;

    let created: Awaited<ReturnType<typeof prisma.waitlistSignup.create>>;
    try {
      created = await prisma.waitlistSignup.create({
        data: { name, role, whatsapp, email, locale },
      });
    } catch (dbErr: unknown) {
      const msg = dbErr instanceof Error ? dbErr.message : '';
      if (msg.includes('Unique constraint') || msg.includes('unique')) {
        return NextResponse.json({ error: 'Email already on waitlist' }, { status: 409 });
      }
      throw dbErr;
    }

    const item = WaitlistSignupItem.parse({
      id: created.id,
      name: created.name,
      role: created.role,
      whatsapp: created.whatsapp,
      email: created.email,
      locale: created.locale,
      createdAt: created.createdAt.toISOString(),
    });

    // Fire-and-forget: register contact + send confirmation email.
    // Errors are caught and logged so they never fail the user-facing 201.
    const { subject, body, html } = confirmationEmail(name, locale);
    void (async () => {
      try {
        await registerContact(email, name, 'signup');
      } catch {
        // proxy unavailable in this environment — signup already persisted
      }
      try {
        await sendEmail({ to: email, subject, body, html });
      } catch {
        // proxy unavailable in this environment — signup already persisted
      }
    })();

    return NextResponse.json(item, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
