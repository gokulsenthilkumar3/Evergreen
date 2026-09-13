// @polsia:user-owned — GET /api/admin/waitlist: list all signups (secret-guarded).
import 'server-only';
import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { WaitlistSignupList } from '@/lib/contracts/waitlist';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

function checkSecret(provided: string): boolean {
  const stored = process.env.ADMIN_SECRET;
  if (!stored || stored.length < 16) return false;
  try {
    const a = Buffer.from(provided, 'utf8');
    const b = Buffer.from(stored, 'utf8');
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const key = url.searchParams.get('key') ?? '';

  if (!checkSecret(key)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const rows = await prisma.waitlistSignup.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const payload = WaitlistSignupList.parse({
    items: rows.map((r) => ({
      id: r.id,
      name: r.name,
      role: r.role,
      whatsapp: r.whatsapp,
      email: r.email,
      locale: r.locale,
      createdAt: r.createdAt.toISOString(),
    })),
  });

  return NextResponse.json(payload);
}
