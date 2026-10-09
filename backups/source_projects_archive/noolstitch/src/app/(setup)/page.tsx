// @polsia:user-owned — starter home served at /. Replace it in place, or delete
// this route group before adding another page that resolves to /.

import type { Metadata } from 'next';
import {
  CtaBand,
  HeroStats,
  MarketplaceGrid,
  MoatGrid,
  PlatformTabs,
  PricingCards,
  WeaveSvg,
} from '@/components/custom/noolstitch-landing';
import { WaitlistSection } from '@/components/custom/waitlist-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { siteDescription, siteName } from '@/lib/site';

// Keep this a Server Component so it can export metadata.
export const metadata: Metadata = {
  title: { absolute: siteName },
  description: siteDescription,
  // Do not export an explicit openGraph object here; that suppresses the
  // file-based opengraph-image.tsx for the home route.
  alternates: { canonical: '/' },
};

export default function HomePage() {
  return (
    <main className="w-full">
      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section id="hero" className="relative overflow-hidden border-b border-border">
        {/* Weave texture — decorative, positional */}
        <WeaveSvg className="pointer-events-none absolute right-0 top-0 h-full w-1/2 text-primary opacity-40 dark:opacity-20" />

        <div className="container-page relative py-section-lg">
          <div className="max-w-2xl">
            <Badge variant="secondary" className="mb-6 gap-1.5 text-caption">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
              Tiruppur · Tamil Nadu · India
            </Badge>

            <h1 className="font-display text-display leading-none tracking-tight text-foreground">
              The operating system for <span className="text-primary">Tiruppur&apos;s</span> textile
              economy.
            </h1>

            <p className="mt-6 max-w-xl text-body-lg text-muted-foreground">
              One platform connecting mills, traders, D2C brands, and bulk buyers across
              India&apos;s knitwear capital — ₹40,000 crore of annual trade, finally digitised
              end-to-end.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a href="#waitlist">
                <Button size="lg" className="w-full sm:w-auto">
                  Join the waitlist
                </Button>
              </a>
              <a href="#platform">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  See the platform
                </Button>
              </a>
            </div>
          </div>

          <div className="mt-12">
            <HeroStats />
          </div>
        </div>
      </section>

      {/* ── Ticker strip ───────────────────────────────────────────────────── */}
      <div className="overflow-hidden border-b border-border bg-muted/40 py-2.5">
        <div className="container-page flex flex-wrap items-center gap-x-6 gap-y-1">
          {[
            'Mill ERP',
            'Vyapari Billing',
            'Contract Manufacturing',
            'B2B Wholesale',
            'Tamil Interface',
            'GST Ready',
            'Real-Time Tracking',
            'Direct Trade',
          ].map((tag) => (
            <span key={tag} className="text-eyebrow whitespace-nowrap">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* ── Platform layers ─────────────────────────────────────────────────── */}
      <section id="platform" className="section border-b border-border">
        <div className="container-page">
          <div className="mb-10 max-w-xl">
            <p className="text-eyebrow">Four interconnected layers</p>
            <h2 className="mt-2 font-display text-h2 text-foreground">
              Built for every participant in the chain.
            </h2>
            <p className="mt-3 text-body text-muted-foreground">
              Each layer is useful standalone — and exponentially more powerful when every
              participant in the cluster is connected. The network compounds with every new unit.
            </p>
          </div>

          <PlatformTabs />
        </div>
      </section>

      {/* ── Marketplace ─────────────────────────────────────────────────────── */}
      <section id="marketplace" className="section border-b border-border bg-muted/30">
        <div className="container-page">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-eyebrow">The cluster, connected</p>
              <h2 className="mt-2 font-display text-h2 text-foreground">
                Every participant in one ecosystem.
              </h2>
              <p className="mt-4 text-body text-muted-foreground">
                Tiruppur is a dense, interdependent cluster — yarn flows from spinners to knitters
                to dyers to traders to exporters. Noolstitch maps this value chain digitally so
                every player can discover, transact, and track within a single trusted network.
              </p>
              <p className="mt-3 text-body text-muted-foreground">
                D2C brands sourcing 300-piece runs and export buyers ordering full containers use
                the same verified factory network — with Noolstitch managing the quality and
                paperwork between them.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <Badge variant="outline">Verified factory profiles</Badge>
                <Badge variant="outline">In-platform messaging</Badge>
                <Badge variant="outline">Escrow payments</Badge>
                <Badge variant="outline">Logistics integration</Badge>
              </div>
            </div>

            <MarketplaceGrid />
          </div>
        </div>
      </section>

      {/* ── Why Noolstitch wins ─────────────────────────────────────────────── */}
      <section className="section border-b border-border">
        <div className="container-page">
          <div className="mb-10 max-w-xl">
            <p className="text-eyebrow">Competitive moat</p>
            <h2 className="mt-2 font-display text-h2 text-foreground">
              Why cluster-agnostic tools can&apos;t copy this.
            </h2>
            <p className="mt-3 text-body text-muted-foreground">
              Fashinza, ZYOD, and Groyyo serve pan-India sourcing. Noolstitch is built exclusively
              for Tiruppur — every workflow, every term, every process reflects a decade of
              on-the-ground knowledge that no outsider can replicate quickly.
            </p>
          </div>
          <MoatGrid />
        </div>
      </section>

      {/* ── Revenue / Pricing ───────────────────────────────────────────────── */}
      <section id="pricing" className="section border-b border-border bg-muted/30">
        <div className="container-page">
          <div className="mb-10 max-w-xl">
            <p className="text-eyebrow">Simple, fair pricing</p>
            <h2 className="mt-2 font-display text-h2 text-foreground">
              Three revenue streams. One coherent model.
            </h2>
            <p className="mt-3 text-body text-muted-foreground">
              SaaS subscriptions give Noolstitch a recurring base; transaction fees on contract
              manufacturing and wholesale deals create upside that grows with the cluster&apos;s
              volume — without extracting rent from every participant.
            </p>
          </div>
          <PricingCards />
          <p className="mt-6 text-small text-muted-foreground">
            Founding member pricing locked in for life. No price increases for early adopters.
          </p>
        </div>
      </section>

      {/* ── Origin story ─────────────────────────────────────────────────────── */}
      <section className="section border-b border-border">
        <div className="container-page">
          <div className="grid gap-12 lg:grid-cols-[1fr_2fr] lg:items-start">
            <div className="sticky top-20">
              <p className="text-eyebrow">About Noolstitch</p>
              <h2 className="mt-2 font-display text-h2 text-foreground">
                Built from within the cluster.
              </h2>
            </div>
            <div className="flex flex-col gap-6 text-body text-muted-foreground">
              <p>
                <span className="font-semibold text-foreground">Noolstitch</span> is named after the
                Tamil words <em>nool</em> (நூல் — thread) and <em>stitch</em> — the two fundamental
                acts of textile making. The name reflects the platform&apos;s purpose: weaving
                together every thread of Tiruppur&apos;s supply chain into one coherent fabric.
              </p>
              <Separator />
              <p>
                Tiruppur produces roughly half of India&apos;s knitwear exports. But its 5,000+
                mills, dye houses, knitting shops, and trading firms run on WhatsApp threads, Excel
                sheets, and handwritten ledgers. Orders fall through the cracks. Credit goes
                untracked. Brokers extract margin at every layer.
              </p>
              <Separator />
              <p>
                The founding team has generational roots in Tiruppur&apos;s trading community. We
                didn&apos;t discover this problem from a consultant&apos;s report — we lived it.
                That on-the-ground knowledge shapes every design decision: the Tamil interface, the
                lot-based inventory model, the GST invoice format the trade actually uses.
              </p>
              <Separator />
              <p>
                We are now onboarding founding members — mills, traders, and brands who want to help
                shape the platform before launch. Founding members get lifetime preferred pricing
                and direct access to the product team.
              </p>
              <div>
                <a href="#waitlist">
                  <Button size="lg">Join the waitlist →</Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Waitlist ─────────────────────────────────────────────────────────── */}
      <section id="waitlist" className="section border-b border-border bg-muted/20">
        <div className="container-page">
          <WaitlistSection />
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section className="section">
        <div className="container-page">
          <CtaBand />
        </div>
      </section>
    </main>
  );
}
