// @polsia:user-owned

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// ─── Hero stats ─────────────────────────────────────────────────────────────

const CLUSTER_STATS = [
  { value: '₹40,000 Cr', label: 'Annual trade in Tiruppur cluster' },
  { value: '50%', label: "Of India's knitwear exports" },
  { value: '8–15%', label: 'Broker margin eliminated by direct B2B' },
  { value: '5,000+', label: 'Mills, dyers & knitting units' },
];

export function HeroStats() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {CLUSTER_STATS.map((stat) => (
        <div
          key={stat.value}
          className="rounded-lg border border-border bg-card/60 px-4 py-3 text-center backdrop-blur-sm"
        >
          <div className="font-display text-h4 text-primary">{stat.value}</div>
          <div className="mt-0.5 text-small text-muted-foreground">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Platform Layers (Tabs) ──────────────────────────────────────────────────

const LAYERS = [
  {
    id: 'erp',
    label: 'Mill ERP',
    eyebrow: 'For spinning, dyeing & knitting units',
    headline: 'Replace Excel and WhatsApp with real operations intelligence.',
    body: 'Track orders, production schedules, and inventory in real time — in Tamil — on any phone. Know exactly where each lot stands, when a dyeing batch clears, and which knitting run is overdue. One view replaces a dozen WhatsApp groups.',
    bullets: [
      'Mobile-first Tamil interface designed for mill floor workers',
      'Real-time order tracking across spinning → dyeing → knitting',
      'Production scheduling with bottleneck alerts',
      'Yarn and fabric inventory with lot-level traceability',
      'GST-ready dispatch notes and delivery challans',
    ],
    accent: 'bg-brand-50 border-brand-200',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="h-10 w-10" aria-hidden={true}>
        <rect
          x="6"
          y="8"
          width="36"
          height="32"
          rx="3"
          className="fill-brand-100 stroke-brand-400"
          strokeWidth="2"
        />
        <rect x="12" y="16" width="10" height="2" rx="1" className="fill-brand-500" />
        <rect x="12" y="21" width="16" height="2" rx="1" className="fill-brand-400" />
        <rect x="12" y="26" width="12" height="2" rx="1" className="fill-brand-300" />
        <circle cx="34" cy="30" r="6" className="fill-brand-500" />
        <path
          d="M31 30l2 2 4-4"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: 'vyapari',
    label: 'Vyapari Billing',
    eyebrow: 'For wholesale traders & merchants',
    headline: 'GST invoices in seconds. Buyer credit under control.',
    body: 'Wholesale traders in Tiruppur spend their mornings on billing — tedious, error-prone, and disconnected from stock reality. The Vyapari layer turns invoice creation into a two-tap operation, keeps running buyer ledgers, and surfaces credit exposure before it becomes a bad debt.',
    bullets: [
      'GST invoice generation in under 30 seconds',
      'Buyer ledger with outstanding balance at a glance',
      'Stock management tied directly to invoicing',
      'Credit limit alerts and overdue payment nudges',
      'Print-ready invoice formats familiar to Tiruppur trade',
    ],
    accent: 'bg-brand-50 border-brand-200',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="h-10 w-10" aria-hidden={true}>
        <rect
          x="10"
          y="6"
          width="28"
          height="36"
          rx="3"
          className="fill-brand-100 stroke-brand-400"
          strokeWidth="2"
        />
        <rect x="16" y="14" width="16" height="2" rx="1" className="fill-brand-500" />
        <rect x="16" y="19" width="10" height="2" rx="1" className="fill-brand-400" />
        <rect x="16" y="24" width="13" height="2" rx="1" className="fill-brand-400" />
        <rect x="16" y="30" width="16" height="2" rx="1" className="fill-brand-600" />
        <path
          d="M30 33v3M33 34.5H28"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="stroke-brand-600"
        />
      </svg>
    ),
  },
  {
    id: 'contract',
    label: 'Contract Mfg',
    eyebrow: 'For D2C & fashion brands',
    headline: 'Small-batch manufacturing, end-to-end managed.',
    body: "Instagram-born and D2C brands need 200–500 piece runs from verified Indian factories — but sourcing, sampling, and quality checks consume months. Noolstitch's curated marketplace matches brands with the right Tiruppur factory and manages every milestone so founders can focus on brand, not production ops.",
    bullets: [
      'Curated verified factories with category specialisations',
      'Transparent sampling timelines and approval workflows',
      'Milestone-based payments — pay as production progresses',
      'Noolstitch QC team on-ground for inspection',
      '200-piece minimum runs; bulk pricing as volume scales',
    ],
    accent: 'bg-brand-50 border-brand-200',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="h-10 w-10" aria-hidden={true}>
        <circle
          cx="24"
          cy="24"
          r="16"
          className="fill-brand-100 stroke-brand-400"
          strokeWidth="2"
        />
        <path
          d="M16 24c0-4.4 3.6-8 8-8s8 3.6 8 8"
          className="stroke-brand-500"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="24" cy="30" r="4" className="fill-brand-500" />
        <path
          d="M20 38l4-4 4 4"
          className="stroke-brand-600"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: 'wholesale',
    label: 'B2B Wholesale',
    eyebrow: 'For manufacturers & bulk buyers',
    headline: 'Direct deals. No broker. Full margin.',
    body: 'Manufacturers lose 8–15% on every wholesale transaction to a chain of brokers who add no value. The Noolstitch B2B marketplace connects Tiruppur factories directly with bulk buyers in Delhi, Mumbai, Bengaluru, and export markets — with verified business profiles, escrow-backed transactions, and logistics coordination.',
    bullets: [
      'Verified buyer and seller profiles with trade history',
      'Direct messaging and sample request workflows',
      'Escrow-backed payment for large orders',
      'Logistics coordination integrated into order flow',
      '3–5% platform fee vs 8–15% traditional broker margin',
    ],
    accent: 'bg-brand-50 border-brand-200',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="h-10 w-10" aria-hidden={true}>
        <path
          d="M8 36V20l16-12 16 12v16H8z"
          className="fill-brand-100 stroke-brand-400"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <rect x="20" y="26" width="8" height="10" rx="1" className="fill-brand-300" />
        <rect x="14" y="22" width="6" height="6" rx="1" className="fill-brand-500" />
        <rect x="28" y="22" width="6" height="6" rx="1" className="fill-brand-500" />
      </svg>
    ),
  },
] as const;

export function PlatformTabs() {
  return (
    <Tabs defaultValue="erp" className="w-full">
      <TabsList className="mb-8 grid w-full grid-cols-2 sm:grid-cols-4">
        {LAYERS.map((layer) => (
          <TabsTrigger key={layer.id} value={layer.id} className="text-xs sm:text-sm">
            {layer.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {LAYERS.map((layer) => (
        <TabsContent key={layer.id} value={layer.id}>
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-4">
                <div className="shrink-0 rounded-xl border border-border bg-muted p-2">
                  {layer.icon}
                </div>
                <div>
                  <p className="text-eyebrow">{layer.eyebrow}</p>
                  <h3 className="mt-1 font-display text-h3 leading-snug text-foreground">
                    {layer.headline}
                  </h3>
                </div>
              </div>
              <p className="text-body text-muted-foreground">{layer.body}</p>
              <a href="#waitlist">
                <Button variant="default" size="lg" className="mt-2 w-fit">
                  Join the waitlist
                </Button>
              </a>
            </div>

            <div className="flex flex-col gap-2">
              {layer.bullets.map((bullet, i) => (
                <div
                  key={bullet}
                  className="flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-3 transition-colors duration-150 hover:bg-muted/60"
                >
                  <span
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-caption font-semibold text-primary"
                    aria-hidden={true}
                  >
                    {i + 1}
                  </span>
                  <span className="text-small text-foreground">{bullet}</span>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}

// ─── Revenue model cards ─────────────────────────────────────────────────────

const REVENUE_STREAMS = [
  {
    label: 'SaaS Subscriptions',
    amount: '₹500–3,000',
    period: '/month per unit',
    desc: "Mill ERP and Vyapari billing tiers — priced for the cluster's scale, from single proprietorships to multi-unit factories.",
    badge: 'Recurring',
  },
  {
    label: 'Contract Manufacturing',
    amount: '8–12%',
    period: 'platform fee per order',
    desc: 'Noolstitch earns a fee on each contract manufacturing order managed end-to-end — sampling, QC, and milestone payments included.',
    badge: 'Transaction',
  },
  {
    label: 'B2B Wholesale',
    amount: '3–5%',
    period: 'commission per deal',
    desc: "A small commission on direct wholesale deals — far below the 8–15% broker margin that disappears from manufacturers' margins today.",
    badge: 'Transaction',
  },
] as const;

export function PricingCards() {
  return (
    <div className="grid gap-6 sm:grid-cols-3">
      {REVENUE_STREAMS.map((stream) => (
        <Card
          key={stream.label}
          className="flex flex-col justify-between border-border transition-shadow duration-200 hover:shadow-md"
        >
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-small font-semibold text-muted-foreground">
                {stream.label}
              </CardTitle>
              <Badge variant="secondary" className="shrink-0 text-caption">
                {stream.badge}
              </Badge>
            </div>
            <div className="mt-2">
              <span className="font-display text-h3 text-primary">{stream.amount}</span>
              <span className="ml-1 text-small text-muted-foreground">{stream.period}</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-small text-muted-foreground">{stream.desc}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Why Noolstitch wins: competitive moat ───────────────────────────────────

const MOATS = [
  {
    title: 'Deep Tamil localisation',
    desc: 'Every workflow — from production scheduling to invoice creation — is in Tamil, tuned to how the Tiruppur trade actually works, not adapted from a generic SaaS template.',
  },
  {
    title: 'Textile-specific workflows',
    desc: 'We model spinning lots, dyeing batches, knitting runs, and fabric grades as first-class entities. Cluster-agnostic tools bolt these on as custom fields.',
  },
  {
    title: 'Generational founding team',
    desc: "Roots in Tiruppur's trading community give Noolstitch on-the-ground distribution and trust that outsider platforms — Fashinza, ZYOD, Groyyo — cannot replicate.",
  },
  {
    title: 'Compounding network',
    desc: "Every layer feeds the next: a mill's output flows through the trader marketplace, the same factory accepts a D2C brand order, and every participant becomes stickier over time.",
  },
] as const;

export function MoatGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {MOATS.map((moat, i) => (
        <div
          key={moat.title}
          className="group rounded-xl border border-border bg-card p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="mb-3 flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-caption font-bold text-primary">
              {i + 1}
            </span>
            <h3 className="font-display text-h4 text-foreground">{moat.title}</h3>
          </div>
          <p className="text-small leading-relaxed text-muted-foreground">{moat.desc}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Marketplace section ─────────────────────────────────────────────────────

const MARKETPLACE_PARTICIPANTS = [
  { role: 'Spinning Mills', count: '600+', icon: '🧵', desc: 'Yarn producers feeding the cluster' },
  { role: 'Dyeing Factories', count: '400+', icon: '🎨', desc: 'Colour and finishing units' },
  {
    role: 'Knitting Units',
    count: '1,200+',
    icon: '⚙️',
    desc: 'Circular and flat-bed knitting shops',
  },
  { role: 'Wholesale Traders', count: '3,000+', icon: '🏪', desc: 'Tiruppur bazaar merchants' },
  { role: 'D2C Brands', count: 'Growing', icon: '📦', desc: 'Instagram & e-commerce brands' },
  { role: 'Export Buyers', count: 'Global', icon: '🌏', desc: 'Buyers across 50+ countries' },
] as const;

export function MarketplaceGrid() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {MARKETPLACE_PARTICIPANTS.map((p) => (
        <div
          key={p.role}
          className="rounded-xl border border-border bg-muted/40 p-4 transition-colors duration-150 hover:bg-card"
        >
          <div className="mb-2 text-2xl" aria-hidden>
            {p.icon}
          </div>
          <div className="font-display text-h4 text-primary">{p.count}</div>
          <div className="text-small font-medium text-foreground">{p.role}</div>
          <div className="mt-1 text-caption text-muted-foreground">{p.desc}</div>
        </div>
      ))}
    </div>
  );
}

// ─── CTA band ────────────────────────────────────────────────────────────────

export function CtaBand() {
  return (
    <div className="rounded-2xl border border-border bg-card p-8 sm:p-12">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-eyebrow">Early access</p>
        <h2 className="mt-3 font-display text-h2 text-foreground">
          Be the first in Tiruppur to run on Noolstitch.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-body text-muted-foreground">
          We are onboarding founding members from the cluster now — mills, traders, and brands who
          want to shape the platform. Founding members get lifetime preferred pricing and direct
          access to the product team.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <a href="#waitlist">
            <Button size="lg" className="w-full sm:w-auto">
              Join the waitlist
            </Button>
          </a>
          <a href="mailto:noolstitch@polsia.app">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Talk to the team
            </Button>
          </a>
        </div>
        <p className="mt-4 text-caption text-muted-foreground">
          noolstitch@polsia.app · Tiruppur, Tamil Nadu
        </p>
      </div>
    </div>
  );
}

// ─── Decorative weave SVG ────────────────────────────────────────────────────

export function WeaveSvg({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden={true}
    >
      {/* Warp threads — vertical */}
      {Array.from({ length: 20 }, (_, i) => {
        const x = 10 + i * 20;
        return (
          <line
            key={`warp-x${x}`}
            x1={x}
            y1="0"
            x2={x}
            y2="400"
            stroke="currentColor"
            strokeWidth="1.5"
            opacity={0.15 + (i % 3) * 0.08}
          />
        );
      })}
      {/* Weft threads — horizontal */}
      {Array.from({ length: 20 }, (_, i) => {
        const y = 10 + i * 20;
        return (
          <line
            key={`weft-y${y}`}
            x1="0"
            y1={y}
            x2="400"
            y2={y}
            stroke="currentColor"
            strokeWidth="1.5"
            opacity={0.15 + (i % 3) * 0.08}
          />
        );
      })}
      {/* Accent knots at intersections (sparse) */}
      {[40, 100, 160, 220, 280, 340].flatMap((x) =>
        [60, 140, 200, 260, 320, 380].map((y) => (
          <circle key={`knot-${x}-${y}`} cx={x} cy={y} r="3" fill="currentColor" opacity="0.35" />
        )),
      )}
      {/* Diagonal accent lines — suggests shuttle movement */}
      <path
        d="M0 200 Q200 100 400 200"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.2"
        fill="none"
      />
      <path
        d="M0 240 Q200 140 400 240"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.15"
        fill="none"
      />
    </svg>
  );
}

// ─── Separator utility ───────────────────────────────────────────────────────

export { Separator };
