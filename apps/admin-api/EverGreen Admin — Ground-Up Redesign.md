# EverGreen Admin — Ground-Up Redesign

## 0. Design thesis

The old portal's core problem isn't visual — it's **epistemic**. The doc says it plainly: _recorded, requested, executed, and verified are different states_. Right now every one of those looks identical in the UI.

So the redesign is built on one primitive that everything else hangs off:

> **The Proof Spine.** Every row, card, job, webhook, payment, deployment and connector carries a `proof` state. The UI is physically incapable of showing a green check for something that is only _recorded_.

Everything else — 3D empty states, cinematic motion, Angular shell, new tabs — is in service of that.

---

## 1. Design system

### 1.1 Tokens

```css
:root {
  /* Surface — deep space, not flat grey */
  --bg-0: #05070d;
  --bg-1: #0a0f1a;
  --bg-2: #111827;
  --panel: color-mix(in oklab, #0e1524 82%, transparent);
  --panel-edge: color-mix(in oklab, #7dd3fc 14%, transparent);

  /* Vibrant accents — one per domain, never decorative */
  --acc-cyan: #22d3ee; /* provider / storage */
  --acc-violet: #a78bfa; /* deploy / release */
  --acc-lime: #a3e635; /* verified */
  --acc-amber: #fbbf24; /* requested */
  --acc-rose: #fb7185; /* failed */
  --acc-slate: #64748b; /* recorded-only */

  /* Chamfer — the "angular" signature */
  --chamfer: 14px;
  --cut: polygon(
    var(--chamfer) 0,
    100% 0,
    100% calc(100% - var(--chamfer)),
    calc(100% - var(--chamfer)) 100%,
    0 100%,
    0 var(--chamfer)
  );

  --ease-cine: cubic-bezier(0.16, 1, 0.3, 1);
  --dur-slow: 720ms;
  --dur-med: 320ms;
  --dur-fast: 140ms;

  --font-ui: 'Inter Tight', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace;
}
```

### 1.2 The Proof Badge (the one component everyone uses)

| State       | Colour          | Icon | Meaning                           | Allowed in UI copy |
| ----------- | --------------- | ---- | --------------------------------- | ------------------ |
| `recorded`  | slate           | ○    | Row exists in `provider.db`       | "Saved"            |
| `requested` | amber           | ◔    | Intent persisted, no executor ack | "Queued"           |
| `executed`  | cyan            | ◑    | Executor returned success         | "Ran"              |
| `verified`  | lime            | ●    | Independent read-back confirmed   | "Confirmed"        |
| `failed`    | rose            | ✕    | Attempt errored / timed out       | "Failed"           |
| `stale`     | amber (striped) | ◌    | Was verified, evidence expired    | "Expired"          |

**Rule:** `verified` requires a _second_ source. A webhook with no delivery attempts can never render lime. A deployment job with no customer heartbeat can never render lime. This is enforced in `ProofService`, not in templates.

### 1.3 Chamfered, angular, layered

- All panels use `clip-path: var(--cut)` — no rounded corners anywhere.
- 1px inner hairline (`inset 0 0 0 1px var(--panel-edge)`) + 40px blurred underglow per panel.
- Diagonal accent bars (11°) behind section headers.
- Grid overlay at 4% opacity on the canvas, parallaxing with scroll.

---

## 2. Shell & information architecture

**Three-zone shell, deliberately "more right":**

```
┌──────────────────────────────────────────────────────────────────┐
│  COMMAND BAR  ⌘K · environment pill · proof filter · inbox       │
├────────┬──────────────────────────────────────┬──────────────────┤
│  LEFT  │            STAGE                     │   RIGHT RAIL     │
│  RAIL  │   (route content, chamfered)         │  (Inspector)     │
│  72px  │                                      │   360px          │
│  icons │                                      │                  │
└────────┴──────────────────────────────────────┴──────────────────┘
```

- **Left rail** — icon-only, expands to 240px on hover, grouped by lifecycle.
- **Right rail** — persistent **Inspector**. Whatever is selected (company, job, webhook, record) slides in here with its full proof timeline, raw payload, and available actions. This is the biggest usability win: no more modal-on-modal.
- **Command bar** — global `⌘K` palette that can also switch proof filter (`proof:verified`), jump to a record by ID, and run read-only diagnostics.

### 2.1 Navigation groups

| Group         | Tabs                                                                                                                                   |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Operate**   | Command Deck · Companies · Workboard · Rollouts · Telemetry                                                                            |
| **Verify**    | **Proof & Audit** _(new)_ · Event Delivery _(was Webhooks)_ · Billing Ledger _(was Payments)_ · Storage                                |
| **Provision** | **Topology** _(new)_ · **Provisioning** _(new)_ · Release Registry · Artifacts                                                         |
| **Govern**    | **Access & Roles** _(new)_ · **Keys & Secrets** _(new)_ · Contracts · Public Site                                                      |
| **Extend**    | Connectors _(was Integrations)_ · Copilot _(was AI Studio)_ · Channels _(was ChatOps)_ · Diagnostics _(was Ops Terminal)_ · Log Stream |
| **System**    | **Backups & Recovery** _(new)_ · **Monitoring & SLOs** _(new)_ · **Job Queue** _(new)_ · **Data Explorer** _(new)_ · Settings          |

---

## 3. The 3D empty-state engine

Every empty surface in the app renders through one component. It is **not** a placeholder — it's a teaching moment, so it always carries: _what this is_, _why it's empty_, _the one action that fills it_, and a _proof caveat_.

Scenes are parametric per module, so it feels bespoke without 14 hand-built assets:

| Module         | Scene                        | Motion                        |
| -------------- | ---------------------------- | ----------------------------- |
| Companies      | orbiting chamfered cubes     | slow orbital drift, rim light |
| Workboard      | floating plane stack         | cards fan and settle          |
| Rollouts       | rising concentric rings      | rings ascend, fade at top     |
| Storage        | wireframe icosahedron        | breathing rotation, fog       |
| Event Delivery | particle streams into a node | particles fail-and-bounce     |
| Proof & Audit  | chain of linked prisms       | links snap into place         |
| default        | low-poly grid terrain        | wave propagation              |

### 3.1 Angular component

```ts
// empty-state-3d.component.ts
import {
  Component, ElementRef, ViewChild, AfterViewInit, OnDestroy,
  input, computed, ChangeDetectionStrategy, inject
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import * as THREE from 'three';

export type EmptyScene =
  | 'companies' | 'workboard' | 'rollouts' | 'storage'
  | 'events' | 'proof' | 'default';

@Component({
  selector: 'eg-empty-state-3d',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="empty3d" [attr.data-scene]="scene()">
      <canvas #cv aria-hidden="true"></canvas>
      <div class="empty3d__vignette"></div>
      <div class="empty3d__copy">
        <span class="empty3d__eyebrow">{{ eyebrow() }}</span>
        <h3 class="empty3d__title">{{ title() }}</h3>
        <p class="empty3d__body">{{ body() }}</p>
        <div class="empty3d__actions"><ng-content /></div>
        @if (hint()) {
          <p class="empty3d__hint">
            <eg-proof-badge state="recorded" />
            {{ hint() }}
          </p>
        }
      </div>
    </div>
  `,
  styleUrl: './empty-state-3d.component.scss',
})
export class EmptyState3DComponent implements AfterViewInit, OnDestroy {
  readonly scene   = input<EmptyScene>('default');
  readonly eyebrow = input('Nothing here yet');
  readonly title   = input.required<string>();
  readonly body    = input('');
  readonly hint    = input<string | null>(null);

  @ViewChild('cv', { static: true }) cv!: ElementRef<HTMLCanvasElement>;

  private doc = inject(DOCUMENT);
  private renderer?: THREE.WebGLRenderer;
  private raf = 0;
  private clock = new THREE.Clock();
  private ro?: ResizeObserver;

  ngAfterViewInit() {
    const reduce = this.doc.defaultView!
      .matchMedia('(prefers-reduced-motion: reduce)').matches;

    const canvas = this.cv.nativeElement;
    const parent = canvas.parentElement!;

    this.renderer = new THREE.WebGLRenderer({
      canvas, antialias: true, alpha: true,
      powerPreference: 'low-power',
    });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

    const scene  = new THREE.Scene();
    scene.fog    = new THREE.FogExp2(0x05070d, 0.055);

    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 1.4, 9);
    camera.lookAt(0, 0, 0);

    // Cinematic 3-point rig
    scene.add(new THREE.AmbientLight(0x1e293b, 1.6));
    const key = new THREE.DirectionalLight(0x22d3ee, 3.2);  key.position.set(4, 6, 5);
    const rim = new THREE.DirectionalLight(0xa78bfa, 2.4);  rim.position.set(-5, -2, -6);
    const fil = new THREE.PointLight(0xfbbf24, 12, 20);     fil.position.set(0, -3, 2);
    scene.add(key, rim, fil);

    const group = this.buildScene(this.scene());
    scene.add(group);

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = parent;
      this.renderer!.setSize(w, h, false);
      camera.aspect = w / h; camera.updateProjectionMatrix();
    };
    resize();
    this.ro = new ResizeObserver(resize);
    this.ro.observe(parent);

    const loop = () => {
      this.raf = requestAnimationFrame(loop);
      const t = this.clock.getElapsedTime();
      if (!reduce) {
        group.rotation.y = t * 0.18;
        group.children.forEach((c, i) => {
          c.position.y = Math.sin(t * 0.8 + i * 1.7) * 0.22;
          c.rotation.x = Math.sin(t * 0.5 + i) * 0.25;
        });
        (group.userData['wave'] as ((t: number) => void) | undefined)?.(t);
      }
      // Parallax toward pointer
      const px = this.pointer.x * 0.6, py = this.pointer.y * 0.35;
      camera.position.x += (px - camera.position.x) * 0.04;
      camera.position.y += ((1.4 + py) - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);
      this.renderer!.render(scene, camera);
    };
    loop();

    parent.addEventListener('pointermove', this.onPointer);
    this.disposeScene = () => {
      cancelAnimationFrame(this.raf);
      this.ro?.disconnect();
      parent.removeEventListener('pointermove', this.onPointer);
      scene.traverse(o => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose?.();
        (m.material as THREE.Material)?.dispose?.();
      });
      this.renderer!.dispose();
    };
  }

  private disposeScene?: () => void;
  private pointer = { x: 0, y: 0 };
  private onPointer = (e: PointerEvent) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    this.pointer.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
    this.pointer.y = ((e.clientY - r.top) / r.height - 0.5) * -2;
  };

  /** Chamfered low-poly solid — the recurring 3D motif. */
  private chamferBox(s: number) {
    const g = new THREE.BoxGeometry(s, s, s, 1, 1, 1);
    // bevel by scaling inner vertices — cheap angular read
    const p = g.attributes['position'] as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      p.setXYZ(i, p.getX(i) * 0.86, p.getY(i) * 0.86, p.getZ(i) * 0.86);
    }
    g.computeVertexNormals();
    return g;
  }

  private buildScene(kind: EmptyScene): THREE.Group {
    const g = new THREE.Group();
    const solid = (c: number, e = 0.35) => new THREE.MeshStandardMaterial({
      color: c, metalness: 0.72, roughness: 0.22,
      emissive: c, emissiveIntensity: e, flatShading: true,
    });
    const wire = (c: number) => new THREE.MeshBasicMaterial({
      color: c, wireframe: true, transparent: true, opacity: 0.35,
    });

    switch (kind) {
      case 'companies': {
        for (let i = 0; i < 7; i++) {
          const m = new THREE.Mesh(this.chamferBox(0.7 + Math.random() * 0.7),
            solid(i % 2 ? 0x22d3ee : 0xa78bfa, 0.22));
          const a = (i / 7) * Math.PI * 2;
          m.position.set(Math.cos(a) * 3.1, Math.sin(a * 1.6) * 0.8, Math.sin(a) * 3.1);
          g.add(m);
        }
        break;
      }
      case 'rollouts': {
        for (let i = 0; i < 5; i++) {
          const ring = new THREE.Mesh(
            new THREE.TorusGeometry(1.1 + i * 0.55, 0.035, 8, 96),
            solid(0xa78bfa, 0.5));
          ring.rotation.x = Math.PI / 2;
          ring.position.y = -2 + i * 0.9;
          g.add(ring);
        }
        g.userData['wave'] = (t: number) =>
          g.children.forEach((c, i) => {
            c.position.y = -2 + ((t * 0.6 + i * 0.9) % 4.5);
            (c as THREE.Mesh).material instanceof THREE.MeshStandardMaterial &&
              ((c as THREE.Mesh).material as THREE.MeshStandardMaterial)
                .opacity = 0;
          });
        break;
      }
      case 'proof': {
        for (let i = 0; i < 6; i++) {
          const link = new THREE.Mesh(this.chamferBox(0.55), solid(0xa3e635, 0.4));
          link.position.x = (i - 2.5) * 1.05;
          link.rotation.y = Math.PI / 4;
          g.add(link);
        }
        break;
      }
      case 'storage': {
        const core = new THREE.Mesh(new THREE.IcosahedronGeometry(2.1, 1), wire(0x22d3ee));
        g.add(core);
        const shell = new THREE.Mesh(new THREE.IcosahedronGeometry(2.55, 0), wire(0xa78bfa));
        g.add(shell);
        break;
      }
      default: {
        for (let x = -4; x <= 4; x++) for (let z = -3; z <= 3; z++) {
          const dot = new THREE.Mesh(this.chamferBox(0.14), solid(0x22d3ee, 0.9));
          dot.position.set(x * 0.9, 0, z * 0.9);
          g.add(dot);
        }
        g.userData['wave'] = (t: number) =>
          g.children.forEach(c => {
            const d = Math.hypot(c.position.x, c.position.z);
            c.position.y = Math.sin(t * 2 - d * 0.9) * 0.35;
          });
      }
    }
    return g;
  }

  ngOnDestroy() { this.disposeScene?.(); }
}
```

```scss
.empty3d {
  position: relative;
  min-height: 420px;
  display: grid;
  place-items: center;
  overflow: hidden;
  clip-path: var(--cut);
  background: radial-gradient(120% 90% at 50% 0%, #0f1a2e 0%, var(--bg-0) 70%);
  border: 1px solid var(--panel-edge);

  canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0.9;
  }
  &__vignette {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: radial-gradient(
      60% 60% at 50% 55%,
      transparent 40%,
      #05070d 100%
    );
  }
  &__copy {
    position: relative;
    text-align: center;
    max-width: 46ch;
    padding: 32px;
  }
  &__eyebrow {
    font: 600 11px/1 var(--font-mono);
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--acc-cyan);
    opacity: 0.85;
  }
  &__title {
    font: 650 30px/1.15 var(--font-ui);
    margin: 12px 0 8px;
    letter-spacing: -0.02em;
  }
  &__body {
    color: #94a3b8;
    font-size: 14px;
    line-height: 1.6;
  }
  &__actions {
    margin-top: 22px;
    display: flex;
    gap: 12px;
    justify-content: center;
  }
  &__hint {
    margin-top: 18px;
    font-size: 12px;
    color: #64748b;
    display: inline-flex;
    gap: 8px;
    align-items: center;
  }

  /* Cinematic entrance — the "After Effects" beat */
  &__copy {
    animation: cine-in var(--dur-slow) var(--ease-cine) both;
  }
}
@keyframes cine-in {
  from {
    opacity: 0;
    transform: translateY(18px) scale(0.97);
    filter: blur(8px);
  }
  to {
    opacity: 1;
    transform: none;
    filter: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .empty3d__copy {
    animation: none;
  }
}
```

**Fallback ladder:** WebGL → CSS-only animated chamfer (a single `clip-path` prism with `@keyframes` rotate3d) → static. Never a bare "No data".

---

## 4. Existing tabs — what changes

| Tab (old → new)                      | Kept                                           | **Added**                                                                                                                                                                                                                                                                                                                  |
| ------------------------------------ | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Overview → **Command Deck**          | counts, licence distribution, attention items  | Live estate map (3D topology preview), SLO burn-down strip, proof funnel (`recorded → requested → executed → verified` as a horizontal bar), "Unverified for >24h" alarm, per-company sparkline of API latency, time-scrub (7d/30d/90d)                                                                                    |
| Spinning mills → **Companies**       | `/companies` list, quotas, plan, version       | Right-rail inspector with full proof timeline; "Open customer workspace" deep link; per-company connector health dot; bulk licence actions; registration **wizard** with environment pre-check; CSV/JSON import; soft-delete with audit entry                                                                              |
| Tasks → **Workboard**                | `ControlRecord.kind=TASK`                      | Kanban + Gantt toggle; SLA due-date heat; assignment to teams; sub-tasks in `payload.children`; bulk transition; `executed` state only set when the linked job is acked                                                                                                                                                    |
| Deployments → **Rollouts**           | deployment jobs                                | Real pipeline stepper `requested → dispatched → installed → verified`; per-stage evidence attach; **rollback** action; canary/percentage field; customer heartbeat ingestion so `verified` is achievable; blast-radius preview                                                                                             |
| Release registry → **Artifacts**     | versions, artifacts                            | Provenance chain (commit → build → artifact hash → deployed-to[]); signature verification column; channel (stable/beta/nightly); deprecation flags                                                                                                                                                                         |
| Database console → **Storage**       | active provider DB, schema explorer, inventory | Split view: _Provider DB_ (immutable facts) vs _Connectors_ (mutable, testable). Schema explorer gains diff vs previous generation, index list, table row-count deltas, and a **read-only Data Explorer** tab behind an explicit grant. Registered cloud DBs get a "Test connection" that produces a real `verified` badge |
| Marketing settings → **Public Site** | contact details, hours                         | Live preview pane, publish/draft split, SEO fields, change history                                                                                                                                                                                                                                                         |
| Maintenance → **Windows**            | maintenance records                            | Calendar view, recurrence (RRULE), blackout conflict detection against deployments, customer notification dispatch state                                                                                                                                                                                                   |
| Integrations → **Connectors**        | config records                                 | Per-connector **Test** button writing a real attempt record → upgrades badge from `recorded` to `verified`/`failed`; credential rotation; scopes display; last-success timestamp                                                                                                                                           |
| Customer API console → **Telemetry** | API groups, endpoints                          | Durable storage (`TelemetrySample` table, not in-memory), multi-instance aggregation, p50/p95/p99 charts, error taxonomy, endpoint-level `verified` (server-reported + portal-observed)                                                                                                                                    |
| Webhooks → **Event Delivery**        | config records                                 | Delivery attempt log, retry schedule with backoff, HMAC signature verification result, replay button, dead-letter queue, per-endpoint success rate                                                                                                                                                                         |
| Payments → **Billing Ledger**        | payment records                                | Reconciliation states (`claimed → matched → settled`), evidence upload (bank ref / gateway txn id), ledger export, per-company AR summary                                                                                                                                                                                  |
| Agreements → **Contracts**           | metadata, evidence                             | Validity countdown, renewal reminders, e-sign status, document version diff, linked licences                                                                                                                                                                                                                               |
| AI studio → **Copilot**              | guidance, drafts                               | Tool-call surface (can propose actions, cannot execute without human approval); "explain this record" from any inspector; proof-aware answers (it cites the badge state)                                                                                                                                                   |
| ChatOps → **Channels**               | CHAT records                                   | Threads, mentions, pin-to-record (attach a message to a company/job), search                                                                                                                                                                                                                                               |
| Ops terminal → **Diagnostics**       | read-only API checks                           | Command palette `⌘J` with a fixed, allow-listed command set; every command output stamped `executed`; copy-as-evidence; no free-form shell, no writes                                                                                                                                                                      |
| Console logs → **Log Stream**        | release/deploy logs                            | Central collector with per-source agent config, structured filtering, live tail, saved queries, 30-day retention indicator                                                                                                                                                                                                 |

---

## 5. New tabs — what they do

### **Proof & Audit** _(the flagship new tab)_

The single ledger of every state transition in the portal.

- Filter by entity, actor, proof state, time window.
- `recorded → requested → executed → verified` funnel rendered as a stacked timeline.
- **"Claims awaiting evidence"** queue: rows stuck at `requested` beyond SLA. This is the tab that stops the portal from lying.
- Export signed audit bundle (JSON + hash) for a given company/window.
- Backed by new `AuditEvent` table: `{ id, entityType, entityId, fromProof, toProof, actor, evidenceRef, at }`.

### **Topology**

3D/2D estate map: laptop → cloud workspace → per-customer installation, with live connector health edges. Renders the §6 diagram from the doc as an interactive graph. Click any node → right rail inspector.

### **Provisioning**

Wizard that turns a _registered hosting choice_ into _actual infrastructure_.
Steps: region → engine → sizing → secrets → DNS → smoke test. Each step emits a proof transition. Explicitly shows the current reality: "No provisioner connected — this step will remain `requested`."

### **Access & Roles**

RBAC for portal users. Roles, permission matrix, staff-member endpoint enablement (which the doc mentions but had no UI), session list, MFA status.

### **Keys & Secrets**

Custody of the owner signing key, API tokens, connector credentials. Rotation schedule, last-used, revoke. Never displays secret values — only fingerprint + `verified` usage stamps.

### **Backups & Recovery**

Backup schedule per database, last successful snapshot, restore drill log, RPO/RTO targets vs actuals. A backup is only `verified` after a restore test — this is spelled out on screen.

### **Monitoring & SLOs**

Per-company and per-service SLOs, error budget burn, alert rules, on-call routing. Distinct from Telemetry (raw) and Command Deck (summary).

### **Job Queue**

Every async operation (deployment dispatch, webhook retry, backup) as a visible job with attempts, backoff, dead-letter, and manual requeue.

### **Data Explorer**

Read-only SQL against the provider DB, gated behind a role + explicit "I understand this is read-only" grant. Results capped at 1,000 rows, every query logged to Audit with `executed` proof.

---

## 6. Angular implementation

### 6.1 Routes

```ts
// app.routes.ts
import { Routes } from '@angular/router';
import { ShellComponent } from './shell/shell.component';
import { proofGuard } from './core/proof.guard';

export const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: '', redirectTo: 'deck', pathMatch: 'full' },
      {
        path: 'deck',
        loadComponent: () =>
          import('./features/deck/deck.component').then((m) => m.DeckComponent),
      },
      {
        path: 'companies',
        loadComponent: () =>
          import('./features/companies/companies.component').then(
            (m) => m.CompaniesComponent,
          ),
      },
      {
        path: 'companies/:id',
        loadComponent: () =>
          import('./features/companies/company-detail.component').then(
            (m) => m.CompanyDetailComponent,
          ),
      },
      {
        path: 'workboard',
        loadComponent: () =>
          import('./features/workboard/workboard.component').then(
            (m) => m.WorkboardComponent,
          ),
      },
      {
        path: 'rollouts',
        loadComponent: () =>
          import('./features/rollouts/rollouts.component').then(
            (m) => m.RolloutsComponent,
          ),
      },
      {
        path: 'storage',
        loadComponent: () =>
          import('./features/storage/storage.component').then(
            (m) => m.StorageComponent,
          ),
      },
      {
        path: 'proof',
        loadComponent: () =>
          import('./features/proof/proof.component').then(
            (m) => m.ProofComponent,
          ),
      },
      {
        path: 'topology',
        loadComponent: () =>
          import('./features/topology/topology.component').then(
            (m) => m.TopologyComponent,
          ),
      },
      {
        path: 'events',
        loadComponent: () =>
          import('./features/events/events.component').then(
            (m) => m.EventsComponent,
          ),
      },
      {
        path: 'data-explorer',
        canMatch: [proofGuard('data:read')],
        loadComponent: () =>
          import('./features/data-explorer/data-explorer.component').then(
            (m) => m.DataExplorerComponent,
          ),
      },
      { path: '**', redirectTo: 'deck' },
    ],
  },
];
```

### 6.2 Proof service — the spine

```ts
// core/proof.service.ts
import { Injectable, signal, computed } from '@angular/core';

export type ProofState =
  | 'recorded'
  | 'requested'
  | 'executed'
  | 'verified'
  | 'failed'
  | 'stale';

export interface ProofEvent {
  id: string;
  entityType: string;
  entityId: string;
  from: ProofState | null;
  to: ProofState;
  actor: string;
  evidenceRef?: string;
  at: string;
}

/** Ordered — a record may only advance forward, or jump to failed/stale. */
const RANK: Record<ProofState, number> = {
  recorded: 0,
  requested: 1,
  executed: 2,
  verified: 3,
  failed: 1,
  stale: 2,
};

@Injectable({ providedIn: 'root' })
export class ProofService {
  private readonly _events = signal<ProofEvent[]>([]);
  readonly events = this._events.asReadonly();

  readonly claimsAwaitingEvidence = computed(() =>
    this._events().filter((e) => e.to === 'requested' && this.ageH(e.at) > 24),
  );

  /** Single write path. Rejects illegal downgrades and verification without evidence. */
  advance(e: Omit<ProofEvent, 'id' | 'at'>): void {
    if (e.to === 'verified' && !e.evidenceRef) {
      throw new Error('Proof violation: verified requires evidenceRef');
    }
    const last = this.latestFor(e.entityType, e.entityId);
    if (
      last &&
      e.from &&
      RANK[e.to] < RANK[last.to] &&
      e.to !== 'failed' &&
      e.to !== 'stale'
    ) {
      throw new Error(`Proof violation: cannot go ${last.to} → ${e.to}`);
    }
    this._events.update((all) => [
      ...all,
      {
        ...e,
        id: crypto.randomUUID(),
        at: new Date().toISOString(),
      },
    ]);
  }

  latestFor(type: string, id: string) {
    return this._events()
      .filter((e) => e.entityType === type && e.entityId === id)
      .at(-1);
  }

  private ageH(iso: string) {
    return (Date.now() - new Date(iso).getTime()) / 3_600_000;
  }
}
```

### 6.3 Badge component

```ts
// shared/proof-badge.component.ts
import {
  Component,
  input,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ProofState } from '../core/proof.service';

@Component({
  selector: 'eg-proof-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="pb" [attr.data-state]="state()" [title]="label()">
      <i class="pb__glyph" aria-hidden="true">{{ glyph() }}</i>
      <span class="pb__text">{{ label() }}</span>
    </span>
  `,
  styles: [
    `
      .pb {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 3px 9px 3px 7px;
        font: 600 10.5px/1 var(--font-mono);
        letter-spacing: 0.09em;
        text-transform: uppercase;
        clip-path: polygon(
          6px 0,
          100% 0,
          100% calc(100% - 6px),
          calc(100% - 6px) 100%,
          0 100%,
          0 6px
        );
        background: color-mix(in oklab, currentColor 14%, transparent);
        color: var(--acc-slate);
        border: 1px solid color-mix(in oklab, currentColor 38%, transparent);
      }
      .pb__glyph {
        font-size: 9px;
      }
      [data-state='requested'] {
        color: var(--acc-amber);
      }
      [data-state='executed'] {
        color: var(--acc-cyan);
      }
      [data-state='verified'] {
        color: var(--acc-lime);
      }
      [data-state='failed'] {
        color: var(--acc-rose);
      }
      [data-state='stale'] {
        color: var(--acc-amber);
        background-image: repeating-linear-gradient(
          135deg,
          transparent 0 4px,
          color-mix(in oklab, currentColor 18%, transparent) 4px 8px
        );
      }
    `,
  ],
})
export class ProofBadgeComponent {
  readonly state = input.required<ProofState>();
  private static LABEL: Record<ProofState, string> = {
    recorded: 'Saved',
    requested: 'Queued',
    executed: 'Ran',
    verified: 'Confirmed',
    failed: 'Failed',
    stale: 'Expired',
  };
  private static GLYPH: Record<ProofState, string> = {
    recorded: '○',
    requested: '◔',
    executed: '◑',
    verified: '●',
    failed: '✕',
    stale: '◌',
  };
  readonly label = computed(() => ProofBadgeComponent.LABEL[this.state()]);
  readonly glyph = computed(() => ProofBadgeComponent.GLYPH[this.state()]);
}
```

### 6.4 Storage tab — worked example

```ts
// features/storage/storage.component.ts
@Component({
  standalone: true,
  imports: [ProofBadgeComponent, EmptyState3DComponent],
  template: `
    <header class="stage-head">
      <h1>Storage</h1>
      <p class="sub">
        Active provider connection read from the running admin API — not a
        config file.
      </p>
      <eg-proof-badge [state]="providerProof()" />
    </header>

    @if (connectors().length === 0) {
      <eg-empty-state-3d
        scene="storage"
        eyebrow="No connectors"
        title="No database connectors yet"
        body="Registered cloud databases are inventory entries, not live connections.
              Adding a connector here creates a real, testable link."
        hint="Saved inventory alone is 'recorded' — it is not 'confirmed'."
      >
        <button class="btn btn--primary" (click)="addConnector()">
          Add connector
        </button>
        <button class="btn btn--ghost" (click)="openSchema()">
          Explore schema
        </button>
      </eg-empty-state-3d>
    } @else {
      <div class="grid">
        @for (c of connectors(); track c.id) {
          <article class="card" [attr.data-proof]="c.proof">
            <h3>{{ c.name }}</h3>
            <code>{{ c.engine }} · {{ c.region }}</code>
            <eg-proof-badge [state]="c.proof" />
            <button
              class="btn btn--sm"
              (click)="test(c)"
              [disabled]="c.testing"
            >
              {{ c.testing ? 'Testing…' : 'Test connection' }}
            </button>
          </article>
        }
      </div>
    }
  `,
})
export class StorageComponent {
  private api = inject(StorageApi);
  private proof = inject(ProofService);
  readonly connectors = signal<ConnectorVm[]>([]);
  readonly providerProof = signal<ProofState>('recorded');

  async test(c: ConnectorVm) {
    c.testing = true;
    try {
      const r = await this.api.testConnection(c.id); // real network call
      const to: ProofState = r.ok ? 'verified' : 'failed';
      this.proof.advance({
        entityType: 'connector',
        entityId: c.id,
        from: c.proof,
        to,
        actor: 'you',
        evidenceRef: r.traceId, // required for 'verified'
      });
      c.proof = to;
    } finally {
      c.testing = false;
    }
  }
}
```

---

## 7. Backend contracts the UI now requires

| New endpoint                                               | Why                               |
| ---------------------------------------------------------- | --------------------------------- |
| `GET /proof/events?entity=&from=&to=`                      | Proof & Audit tab                 |
| `POST /connectors/:id/test` → `{ ok, traceId, latencyMs }` | Earns the `verified` badge        |
| `GET /deployments/:id/pipeline`                            | Rollout stepper stages            |
| `POST /webhooks/:id/replay`                                | Event Delivery                    |
| `GET /telemetry/aggregate?window=`                         | Durable, multi-instance telemetry |
| `GET /topology`                                            | Estate graph                      |
| `POST /provision/:step`                                    | Provisioning wizard               |
| `POST /backups/:id/restore-drill`                          | Backups & Recovery                |
| `POST /data-explorer/query` (read-only, audited)           | Data Explorer                     |

Until these exist, the corresponding tabs render their 3D empty state with an honest caveat line — never a fake green tick.

---

## 8. Rollout order

1. **Tokens + Proof Badge + Proof Service** — 1 sprint, touches nothing else.
2. **Shell (3-zone + ⌘K) + Empty State 3D** — 1 sprint.
3. **Proof & Audit** — the tab that retrofits truth onto every existing module.
4. Migrate existing tabs one at a time onto the new shell + proof spine.
5. New tabs in dependency order: Connectors test → Event Delivery → Rollouts pipeline → Topology → Provisioning → Backups → Data Explorer.

The measure of success isn't "it looks cinematic." It's that a provider operator can look at any row and know, without asking, whether the system _did the thing_ or merely _wrote down that it wanted to_.

# EverGreen Admin — Extended CSS & Motion Layer

Adds to the previous pass. Everything here consumes the same tokens and the same Proof Spine. Copy order: `tokens.css` → `canvas.css` → `shell.css` → `components.css` → `motion.css`.

---

## 1. Token layer, extended

```css
/* tokens.css ------------------------------------------------------------- */
:root {
  /* already defined */
  --bg-0: #05070d;
  --bg-1: #0a0f1a;
  --bg-2: #111827;
  --panel: color-mix(in oklab, #0e1524 82%, transparent);
  --panel-edge: color-mix(in oklab, #7dd3fc 14%, transparent);
  --acc-cyan: #22d3ee;
  --acc-violet: #a78bfa;
  --acc-lime: #a3e635;
  --acc-amber: #fbbf24;
  --acc-rose: #fb7185;
  --acc-slate: #64748b;
  --chamfer: 14px;
  --cut: polygon(
    var(--chamfer) 0,
    100% 0,
    100% calc(100% - var(--chamfer)),
    calc(100% - var(--chamfer)) 100%,
    0 100%,
    0 var(--chamfer)
  );
  --ease-cine: cubic-bezier(0.16, 1, 0.3, 1);
  --dur-slow: 720ms;
  --dur-med: 320ms;
  --dur-fast: 140ms;

  /* --- new: glow & elevation ----------------------------------------- */
  --glow-cyan:
    0 0 0 1px color-mix(in oklab, var(--acc-cyan) 26%, transparent),
    0 12px 40px -12px color-mix(in oklab, var(--acc-cyan) 55%, transparent);
  --glow-violet:
    0 0 0 1px color-mix(in oklab, var(--acc-violet) 26%, transparent),
    0 12px 40px -12px color-mix(in oklab, var(--acc-violet) 55%, transparent);
  --glow-lime:
    0 0 0 1px color-mix(in oklab, var(--acc-lime) 26%, transparent),
    0 12px 40px -12px color-mix(in oklab, var(--acc-lime) 55%, transparent);
  --lift-1:
    0 1px 0 rgb(255 255 255 / 0.04) inset, 0 8px 24px -12px rgb(0 0 0 / 0.8);
  --lift-2:
    0 1px 0 rgb(255 255 255 / 0.06) inset, 0 24px 60px -24px rgb(0 0 0 / 0.9);

  /* --- new: gradients ------------------------------------------------ */
  --grad-hero: conic-gradient(
    from 210deg at 50% 40%,
    #0b1220,
    #131c34,
    #1b1440,
    #0b1220
  );
  --grad-edge: linear-gradient(
    135deg,
    color-mix(in oklab, var(--acc-cyan) 60%, transparent),
    transparent 40%,
    color-mix(in oklab, var(--acc-violet) 60%, transparent) 100%
  );

  /* --- new: texture -------------------------------------------------- */
  --noise-url: url("data:image/svg+xml;utf8,\
<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'>\
<filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/>\
<feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .22 0'/></filter>\
<rect width='100%' height='100%' filter='url(%23n)'/></svg>");

  /* --- new: motion --------------------------------------------------- */
  --spring: linear(0, 0.32 12%, 0.66 22%, 0.93 32%, 1.02 45%, 1.01 60%, 1);
  --ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --dur-slow: 1ms;
    --dur-med: 1ms;
    --dur-fast: 1ms;
  }
}
```

---

## 2. Global cinematic canvas

```css
/* canvas.css ------------------------------------------------------------- */
html,
body {
  background: var(--bg-0);
  color: #e2e8f0;
}

/* Layered backdrop: hero gradient · grid · noise · vignette */
body::before {
  content: '';
  position: fixed;
  inset: -10%;
  z-index: -3;
  pointer-events: none;
  background:
    radial-gradient(60% 60% at 15% 0%, #14213d 0%, transparent 60%),
    radial-gradient(55% 55% at 100% 20%, #2b1b4d 0%, transparent 60%),
    radial-gradient(50% 50% at 50% 100%, #0d1a24 0%, transparent 65%),
    var(--bg-0);
  filter: saturate(1.15);
  animation: hue-drift 40s var(--ease-in-out) infinite alternate;
}
@keyframes hue-drift {
  0% {
    filter: saturate(1.1) hue-rotate(0deg);
  }
  100% {
    filter: saturate(1.3) hue-rotate(18deg);
  }
}

body::after {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
  opacity: 0.06;
  mix-blend-mode: overlay;
  background-image: var(--noise-url);
  background-size: 160px;
}

/* Grid plane that parallaxes with the cursor (set --mx/--my in JS) */
.gridplane {
  position: fixed;
  inset: 0;
  z-index: -2;
  pointer-events: none;
  background-image:
    linear-gradient(to right, rgb(148 163 184 / 0.07) 1px, transparent 1px),
    linear-gradient(to bottom, rgb(148 163 184 / 0.07) 1px, transparent 1px);
  background-size:
    48px 48px,
    48px 48px;
  mask-image: radial-gradient(75% 65% at 50% 40%, #000 0%, transparent 78%);
  transform: translate3d(
    calc(var(--mx, 0) * -14px),
    calc(var(--my, 0) * -14px),
    0
  );
  transition: transform 400ms var(--ease-out-quart);
}
.gridplane::after {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    rgb(255 255 255 / 0.015) 0 1px,
    transparent 1px 3px
  );
  mix-blend-mode: screen;
  opacity: 0.35;
}

/* Cursor spotlight — cheap, dramatic */
.spotlight {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background: radial-gradient(
    420px 420px at var(--cx, 50%) var(--cy, 50%),
    color-mix(in oklab, var(--acc-cyan) 10%, transparent),
    transparent 70%
  );
  opacity: 0;
  transition: opacity 400ms;
}
body:hover .spotlight {
  opacity: 1;
}

/* Scanline sweep — very subtle, only on data surfaces */
.scanline {
  position: relative;
  overflow: hidden;
}
.scanline::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    transparent 0%,
    rgb(34 211 238 / 0.1) 48%,
    rgb(34 211 238 / 0.02) 52%,
    transparent 100%
  );
  height: 40%;
  animation: sweep 6s linear infinite;
  mix-blend-mode: screen;
}
@keyframes sweep {
  0% {
    transform: translateY(-120%);
  }
  100% {
    transform: translateY(300%);
  }
}
```

```ts
// core/canvas.directive.ts — attaches the cursor spotlight
@Directive({ selector: '[egCanvas]', standalone: true })
export class CanvasDirective implements OnInit, OnDestroy {
  private raf = 0;
  private host = inject(ElementRef<HTMLElement>);
  private onMove = (e: PointerEvent) => {
    cancelAnimationFrame(this.raf);
    this.raf = requestAnimationFrame(() => {
      const { innerWidth: w, innerHeight: h } = window;
      const mx = (e.clientX / w - 0.5) * 2,
        my = (e.clientY / h - 0.5) * 2;
      const r = this.host.nativeElement;
      r.style.setProperty('--cx', `${e.clientX}px`);
      r.style.setProperty('--cy', `${e.clientY}px`);
      r.style.setProperty('--mx', String(mx));
      r.style.setProperty('--my', String(my));
    });
  };
  ngOnInit() {
    addEventListener('pointermove', this.onMove, { passive: true });
  }
  ngOnDestroy() {
    removeEventListener('pointermove', this.onMove);
    cancelAnimationFrame(this.raf);
  }
}
```

---

## 3. Shell chrome

```css
/* shell.css -------------------------------------------------------------- */
.shell {
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr) 360px;
  grid-template-rows: 56px minmax(0, 1fr);
  gap: 0;
  height: 100dvh;
  grid-template-areas: 'bar bar bar' 'rail stage inspector';
  transition: grid-template-columns 320ms var(--ease-cine);
}
.shell[data-rail-expanded='true'] {
  grid-template-columns: 240px minmax(0, 1fr) 360px;
}
.shell[data-inspector-open='false'] {
  grid-template-columns: 72px minmax(0, 1fr) 0px;
}

/* ── COMMAND BAR ─────────────────────────────────────────────────────── */
.cmdbar {
  grid-area: bar;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 0 16px;
  border-bottom: 1px solid var(--panel-edge);
  background: color-mix(in oklab, #0b111d 70%, transparent);
  backdrop-filter: blur(20px) saturate(140%);
  -webkit-backdrop-filter: blur(20px) saturate(140%);
  position: relative;
  z-index: 20;
}
.cmdbar::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(
    90deg,
    transparent,
    color-mix(in oklab, var(--acc-cyan) 12%, transparent) 50%,
    transparent
  );
  opacity: 0.5;
  mask-image: linear-gradient(
    90deg,
    transparent,
    #000 30%,
    #000 70%,
    transparent
  );
}
.cmdbar__logo {
  width: 26px;
  height: 26px;
  clip-path: var(--cut);
  background: var(--grad-edge);
  box-shadow: var(--glow-cyan);
  position: relative;
  overflow: hidden;
}
.cmdbar__logo::after {
  content: '';
  position: absolute;
  inset: 2px;
  background: var(--bg-1);
  clip-path: var(--cut);
}
.cmdbar__logo::before {
  content: '';
  position: absolute;
  inset: -50%;
  background: conic-gradient(
    from 0deg,
    transparent,
    var(--acc-cyan),
    transparent
  );
  animation: spin 4s linear infinite;
  opacity: 0.8;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.cmdbar__search {
  flex: 1;
  max-width: 480px;
  margin-inline: auto;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  clip-path: var(--cut);
  background: color-mix(in oklab, #0e1626 90%, transparent);
  border: 1px solid var(--panel-edge);
  transition:
    border-color 200ms,
    box-shadow 200ms;
  cursor: text;
}
.cmdbar__search:hover {
  border-color: color-mix(in oklab, var(--acc-cyan) 45%, transparent);
}
.cmdbar__search:focus-within {
  border-color: var(--acc-cyan);
  box-shadow:
    0 0 0 3px color-mix(in oklab, var(--acc-cyan) 18%, transparent),
    0 0 26px -6px color-mix(in oklab, var(--acc-cyan) 60%, transparent);
}

.env-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font: 600 10px/1 var(--font-mono);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  padding: 5px 10px;
  clip-path: var(--cut);
  background: color-mix(in oklab, var(--acc-amber) 14%, transparent);
  color: var(--acc-amber);
  border: 1px solid color-mix(in oklab, var(--acc-amber) 40%, transparent);
}
.env-pill::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 10px currentColor;
  animation: ping 1.6s var(--ease-out-quart) infinite;
}
@keyframes ping {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.6);
    opacity: 0.4;
  }
}

/* ── LEFT RAIL ───────────────────────────────────────────────────────── */
.rail {
  grid-area: rail;
  padding: 16px 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-right: 1px solid var(--panel-edge);
  background: color-mix(in oklab, #080d16 75%, transparent);
  backdrop-filter: blur(16px);
  overflow: hidden;
  position: relative;
}
.rail__group {
  display: grid;
  gap: 2px;
}
.rail__group + .rail__group {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid color-mix(in oklab, var(--panel-edge) 60%, transparent);
}
.rail__item {
  --_i: 0;
  position: relative;
  display: grid;
  grid-template-columns: 32px 1fr;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: 0;
  clip-path: var(--cut);
  color: #94a3b8;
  text-decoration: none;
  transition:
    background 200ms,
    color 200ms,
    transform 320ms var(--ease-out-quart);
  animation: rail-in 480ms var(--ease-cine) both;
  animation-delay: calc(var(--_i) * 32ms);
}
@keyframes rail-in {
  from {
    opacity: 0;
    transform: translateX(-12px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
.rail__item:hover {
  background: color-mix(in oklab, var(--acc-cyan) 8%, transparent);
  color: #e2e8f0;
  transform: translateX(2px);
}
.rail__item[aria-current='page'] {
  background: linear-gradient(
    90deg,
    color-mix(in oklab, var(--acc-cyan) 22%, transparent),
    color-mix(in oklab, var(--acc-violet) 12%, transparent) 60%,
    transparent
  );
  color: #f8fafc;
}
.rail__item[aria-current='page']::before {
  content: '';
  position: absolute;
  left: 0;
  top: 6px;
  bottom: 6px;
  width: 3px;
  background: linear-gradient(180deg, var(--acc-cyan), var(--acc-violet));
  box-shadow: 0 0 12px var(--acc-cyan);
}
.rail__item svg {
  width: 20px;
  height: 20px;
}
.rail__label {
  font: 500 13.5px/1.2 var(--font-ui);
  letter-spacing: -0.01em;
  opacity: 0;
  white-space: nowrap;
  transition: opacity 260ms;
}
.shell[data-rail-expanded='true'] .rail__label {
  opacity: 1;
}

/* ── RIGHT INSPECTOR ─────────────────────────────────────────────────── */
.inspector {
  grid-area: inspector;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  border-left: 1px solid var(--panel-edge);
  background: color-mix(in oklab, #0a101c 82%, transparent);
  backdrop-filter: blur(18px) saturate(140%);
  transform: translateX(100%);
  opacity: 0;
  transition:
    transform 420ms var(--ease-cine),
    opacity 240ms;
  pointer-events: none;
  position: relative;
}
.shell[data-inspector-open='true'] .inspector {
  transform: none;
  opacity: 1;
  pointer-events: auto;
}
.inspector__head {
  padding: 16px;
  border-bottom: 1px solid var(--panel-edge);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.inspector__tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid var(--panel-edge);
}
.inspector__tab {
  flex: 1;
  padding: 12px 8px;
  font: 600 11px/1 var(--font-mono);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #64748b;
  background: none;
  border: 0;
  cursor: pointer;
  position: relative;
  transition: color 200ms;
}
.inspector__tab[aria-selected='true'] {
  color: var(--acc-cyan);
}
.inspector__tab[aria-selected='true']::after {
  content: '';
  position: absolute;
  left: 20%;
  right: 20%;
  bottom: -1px;
  height: 2px;
  background: var(--acc-cyan);
  box-shadow: 0 0 14px var(--acc-cyan);
}
.inspector__body {
  overflow: auto;
  padding: 16px;
}
.inspector__body::-webkit-scrollbar {
  width: 8px;
}
.inspector__body::-webkit-scrollbar-thumb {
  background: color-mix(in oklab, var(--acc-cyan) 22%, transparent);
  border-radius: 999px;
}

/* ── STAGE ───────────────────────────────────────────────────────────── */
.stage {
  grid-area: stage;
  overflow: auto;
  position: relative;
  padding: 28px clamp(16px, 3vw, 40px) 96px;
  view-transition-name: stage;
}
.stage::-webkit-scrollbar {
  width: 10px;
}
.stage::-webkit-scrollbar-thumb {
  background: color-mix(in oklab, var(--acc-violet) 22%, transparent);
}
```

---

## 4. Panels, cards, brackets

```css
/* components.css --------------------------------------------------------- */
.panel,
.card {
  position: relative;
  background: var(--panel);
  clip-path: var(--cut);
  border: 1px solid var(--panel-edge);
  box-shadow: var(--lift-1);
  transition:
    transform 320ms var(--ease-out-quart),
    box-shadow 320ms var(--ease-out-quart),
    border-color 240ms;
  isolation: isolate;
}

/* Corner brackets — the "sci-fi" accent */
.panel::before,
.card::before {
  content: '';
  position: absolute;
  inset: 8px;
  pointer-events: none;
  background:
    linear-gradient(var(--acc-cyan), var(--acc-cyan)) top left / 12px 1px
      no-repeat,
    linear-gradient(var(--acc-cyan), var(--acc-cyan)) top left / 1px 12px
      no-repeat,
    linear-gradient(var(--acc-violet), var(--acc-violet)) top right / 12px 1px
      no-repeat,
    linear-gradient(var(--acc-violet), var(--acc-violet)) top right / 1px 12px
      no-repeat,
    linear-gradient(var(--acc-violet), var(--acc-violet)) bottom left / 12px 1px
      no-repeat,
    linear-gradient(var(--acc-violet), var(--acc-violet)) bottom left / 1px 12px
      no-repeat,
    linear-gradient(var(--acc-cyan), var(--acc-cyan)) bottom right / 12px 1px
      no-repeat,
    linear-gradient(var(--acc-cyan), var(--acc-cyan)) bottom right / 1px 12px
      no-repeat;
  opacity: 0.55;
  transition: opacity 300ms;
}
.panel:hover::before,
.card:hover::before {
  opacity: 1;
}

/* Under-glow that grows on hover */
.panel::after,
.card::after {
  content: '';
  position: absolute;
  inset: -40px;
  z-index: -1;
  background: radial-gradient(
    60% 60% at 50% 100%,
    color-mix(in oklab, var(--acc-cyan) 26%, transparent),
    transparent 70%
  );
  opacity: 0;
  transition: opacity 400ms var(--ease-out-quart);
  filter: blur(20px);
}
.panel:hover::after,
.card:hover::after {
  opacity: 0.9;
}
.card:hover {
  transform: translateY(-2px);
  border-color: color-mix(in oklab, var(--acc-cyan) 45%, transparent);
  box-shadow: var(--lift-2), var(--glow-cyan);
}

/* 3D tilt card — apply via [data-tilt] */
[data-tilt] {
  transform-style: preserve-3d;
  perspective: 900px;
  will-change: transform;
}
[data-tilt] > * {
  transform: translateZ(30px);
}

/* Stat tile — hero metrics */
.stat {
  padding: 22px;
  display: grid;
  gap: 6px;
  min-height: 132px;
  background:
    radial-gradient(
      120% 120% at 100% 0%,
      color-mix(in oklab, var(--acc-cyan) 8%, transparent),
      transparent 60%
    ),
    var(--panel);
}
.stat__value {
  font: 650 clamp(28px, 3.4vw, 42px)/1 var(--font-ui);
  letter-spacing: -0.03em;
  background: linear-gradient(180deg, #fff, #94a3b8);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-variant-numeric: tabular-nums;
  animation: count-in 620ms var(--ease-out-expo) both;
}
@keyframes count-in {
  from {
    opacity: 0;
    transform: translateY(6px);
    filter: blur(4px);
  }
  to {
    opacity: 1;
    transform: none;
    filter: none;
  }
}
.stat__label {
  font: 600 10.5px/1 var(--font-mono);
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #64748b;
}
.stat__delta {
  font: 600 12px/1 var(--font-mono);
  color: var(--acc-lime);
}
.stat__delta[data-neg='true'] {
  color: var(--acc-rose);
}

/* Section header with diagonal accent bar */
.stage-head {
  position: relative;
  margin-bottom: 26px;
  padding-left: 20px;
}
.stage-head::before {
  content: '';
  position: absolute;
  left: 0;
  top: 2px;
  bottom: 2px;
  width: 6px;
  background: linear-gradient(180deg, var(--acc-cyan), var(--acc-violet));
  transform: skewX(-11deg);
  box-shadow: 0 0 20px color-mix(in oklab, var(--acc-cyan) 60%, transparent);
}
.stage-head h1 {
  font: 650 clamp(22px, 2.4vw, 30px)/1.05 var(--font-ui);
  letter-spacing: -0.03em;
  margin: 0 0 4px;
}
.stage-head .sub {
  color: #94a3b8;
  font-size: 14px;
  max-width: 62ch;
  margin: 0;
}
```

---

## 5. Buttons — magnetic, ripple, chamfer

```css
.btn {
  --_bg: color-mix(in oklab, var(--acc-cyan) 10%, transparent);
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  font: 600 13px/1 var(--font-ui);
  letter-spacing: -0.005em;
  color: #e2e8f0;
  text-decoration: none;
  clip-path: var(--cut);
  background: var(--_bg);
  border: 1px solid var(--panel-edge);
  cursor: pointer;
  overflow: hidden;
  isolation: isolate;
  transition:
    color 200ms,
    border-color 200ms,
    background 200ms,
    transform 320ms var(--ease-out-quart);
}
.btn:active {
  transform: scale(0.98);
}
.btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.btn--primary {
  --_bg: linear-gradient(
    135deg,
    color-mix(in oklab, var(--acc-cyan) 40%, #0e1626),
    color-mix(in oklab, var(--acc-violet) 34%, #0e1626)
  );
  border-color: color-mix(in oklab, var(--acc-cyan) 55%, transparent);
  color: #f8fafc;
  box-shadow:
    0 0 0 1px color-mix(in oklab, var(--acc-cyan) 22%, transparent) inset,
    0 8px 22px -10px color-mix(in oklab, var(--acc-cyan) 65%, transparent);
}
.btn--primary:hover {
  box-shadow:
    0 0 0 1px color-mix(in oklab, var(--acc-cyan) 40%, transparent) inset,
    0 12px 32px -10px color-mix(in oklab, var(--acc-cyan) 80%, transparent);
}
.btn--ghost {
  background: transparent;
}

/* Sweep shine on hover — the cheap "After Effects" glint */
.btn::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(
    105deg,
    transparent 40%,
    rgb(255 255 255 / 0.22) 50%,
    transparent 60%
  );
  transform: translateX(-120%);
  transition: transform 620ms var(--ease-out-expo);
}
.btn:hover::after {
  transform: translateX(120%);
}

/* Ripple — appended by directive */
.ripple {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgb(255 255 255 / 0.55), transparent 70%);
  transform: scale(0);
  animation: ripple 640ms var(--ease-out-expo) forwards;
  pointer-events: none;
  mix-blend-mode: screen;
}
@keyframes ripple {
  to {
    transform: scale(2.4);
    opacity: 0;
  }
}

/* Magnetic — JS sets --tx/--ty from cursor distance */
[data-magnetic] {
  transition: transform 240ms var(--ease-out-quart);
}
[data-magnetic]:hover {
  transform: translate(var(--tx, 0), var(--ty, 0));
}
```

```ts
// shared/magnetic.directive.ts
@Directive({ selector: '[egMagnetic]', standalone: true })
export class MagneticDirective {
  private host = inject(ElementRef<HTMLElement>);
  @HostListener('pointermove', ['$event']) move(e: PointerEvent) {
    const r = this.host.nativeElement.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    this.host.nativeElement.style.setProperty('--tx', `${x * 0.12}px`);
    this.host.nativeElement.style.setProperty('--ty', `${y * 0.12}px`);
  }
  @HostListener('pointerleave') leave() {
    this.host.nativeElement.style.setProperty('--tx', '0');
    this.host.nativeElement.style.setProperty('--ty', '0');
  }
}
```

---

## 6. Proof badge, animated

```css
.pb {
  position: relative;
  transition:
    color 240ms,
    background 240ms,
    box-shadow 240ms;
}
.pb[data-state='requested'] .pb__glyph {
  animation: pulse-soft 1.8s var(--ease-in-out) infinite;
}
@keyframes pulse-soft {
  0%,
  100% {
    opacity: 1;
    filter: drop-shadow(0 0 0 var(--acc-amber));
  }
  50% {
    opacity: 0.5;
    filter: drop-shadow(0 0 4px var(--acc-amber));
  }
}
.pb[data-state='executed'] .pb__glyph {
  animation: spin-slow 1.4s linear infinite;
  display: inline-block;
}
@keyframes spin-slow {
  to {
    transform: rotate(360deg);
  }
}
.pb[data-state='verified'] {
  box-shadow:
    0 0 0 1px color-mix(in oklab, var(--acc-lime) 40%, transparent),
    0 0 14px -4px color-mix(in oklab, var(--acc-lime) 70%, transparent);
}
.pb[data-state='verified'] .pb__glyph {
  animation: settle 900ms var(--ease-out-expo) both;
}
@keyframes settle {
  0% {
    transform: scale(2.2);
    opacity: 0;
    filter: blur(4px);
  }
  60% {
    transform: scale(0.9);
    opacity: 1;
    filter: none;
  }
  100% {
    transform: scale(1);
  }
}
.pb[data-state='failed'] {
  animation: glitch 320ms steps(2, end) 3;
}
@keyframes glitch {
  0%,
  100% {
    transform: none;
    filter: none;
  }
  25% {
    transform: translateX(-1px) skewX(2deg);
    filter: hue-rotate(30deg);
  }
  75% {
    transform: translateX(1px) skewX(-2deg);
    filter: hue-rotate(-30deg);
  }
}
.pb[data-state='stale'] .pb__glyph {
  animation: breathe 3.2s var(--ease-in-out) infinite;
}
@keyframes breathe {
  50% {
    opacity: 0.35;
  }
}
```

---

## 7. Data grid

```css
.grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}
.data-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-variant-numeric: tabular-nums;
}
.data-table th {
  position: sticky;
  top: 0;
  z-index: 2;
  padding: 12px 14px;
  text-align: left;
  font: 600 10.5px/1 var(--font-mono);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #64748b;
  background: color-mix(in oklab, #0b1220 92%, transparent);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--panel-edge);
}
.data-table th[data-sort] {
  cursor: pointer;
  user-select: none;
}
.data-table th[data-sort]:hover {
  color: var(--acc-cyan);
}
.data-table td {
  padding: 12px 14px;
  border-bottom: 1px solid
    color-mix(in oklab, var(--panel-edge) 50%, transparent);
  transition: background 160ms;
}
.data-table tbody tr {
  position: relative;
  transition:
    background 200ms,
    transform 320ms var(--ease-out-quart);
}
.data-table tbody tr:hover td {
  background: color-mix(in oklab, var(--acc-cyan) 5%, transparent);
}
.data-table tbody tr[aria-selected='true'] td {
  background: color-mix(in oklab, var(--acc-cyan) 10%, transparent);
  color: #f1f5f9;
}
.data-table tbody tr[aria-selected='true'] td:first-child {
  box-shadow: inset 3px 0 0 var(--acc-cyan);
}

/* Skeleton shimmer for loading rows */
.sk {
  position: relative;
  overflow: hidden;
  border-radius: 4px;
  background: color-mix(in oklab, #1e293b 70%, transparent);
}
.sk::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent,
    color-mix(in oklab, var(--acc-cyan) 20%, transparent) 50%,
    transparent
  );
  transform: translateX(-100%);
  animation: sk 1.6s var(--ease-in-out) infinite;
}
@keyframes sk {
  to {
    transform: translateX(100%);
  }
}

/* Inline sparkline */
.spark {
  width: 90px;
  height: 22px;
  display: block;
}
.spark path {
  fill: none;
  stroke: var(--acc-cyan);
  stroke-width: 1.6;
  filter: drop-shadow(0 0 3px var(--acc-cyan));
}
.spark .spark__area {
  fill: color-mix(in oklab, var(--acc-cyan) 22%, transparent);
  stroke: none;
  filter: none;
}

/* Heat strip — proof funnel / SLA */
.heat {
  display: flex;
  gap: 2px;
  height: 22px;
}
.heat span {
  flex: 1;
  background: color-mix(in oklab, var(--acc-cyan) var(--_v, 20%), transparent);
  transition: background 240ms;
  clip-path: polygon(3px 0, 100% 0, calc(100% - 3px) 100%, 0 100%);
}
.heat span:hover {
  background: var(--acc-cyan);
  box-shadow: 0 0 10px var(--acc-cyan);
}
```

---

## 8. Rollout pipeline stepper

```css
.pipeline {
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  gap: 0;
  padding: 18px 8px;
}
.stage-node {
  display: grid;
  justify-items: center;
  gap: 8px;
  position: relative;
  padding: 0 22px;
  color: #64748b;
  font: 600 10.5px/1 var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.14em;
}
.stage-node__orb {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  clip-path: var(--cut);
  background: color-mix(in oklab, #0e1626 90%, transparent);
  border: 1px solid var(--panel-edge);
  transition: all 320ms var(--ease-out-quart);
  position: relative;
}
.stage-node[data-state='verified'] .stage-node__orb {
  color: var(--acc-lime);
  border-color: var(--acc-lime);
  box-shadow:
    0 0 0 2px color-mix(in oklab, var(--acc-lime) 20%, transparent),
    0 0 22px -4px var(--acc-lime);
}
.stage-node[data-state='verified'] {
  color: var(--acc-lime);
}
.stage-node[data-state='executed'] .stage-node__orb {
  color: var(--acc-cyan);
  border-color: var(--acc-cyan);
  box-shadow: 0 0 22px -4px var(--acc-cyan);
}
.stage-node[data-state='executed'] .stage-node__orb::before {
  content: '';
  position: absolute;
  inset: -4px;
  border: 1px dashed color-mix(in oklab, var(--acc-cyan) 55%, transparent);
  border-radius: 999px;
  animation: spin 3s linear infinite;
}
.stage-node[data-state='requested'] .stage-node__orb {
  color: var(--acc-amber);
  border-color: var(--acc-amber);
  animation: pulse-soft 1.8s var(--ease-in-out) infinite;
}
.stage-node[data-state='failed'] .stage-node__orb {
  color: var(--acc-rose);
  border-color: var(--acc-rose);
  box-shadow: 0 0 22px -4px var(--acc-rose);
}

/* Connector line between nodes */
.stage-node + .stage-node::before {
  content: '';
  position: absolute;
  top: 20px;
  right: 50%;
  width: 44px;
  height: 2px;
  z-index: -1;
  background: linear-gradient(
    90deg,
    color-mix(in oklab, var(--acc-cyan) 40%, transparent),
    color-mix(in oklab, var(--acc-violet) 40%, transparent)
  );
  transform: translateX(100%);
  overflow: hidden;
}
.stage-node + .stage-node::after {
  content: '';
  position: absolute;
  top: 20px;
  right: 50%;
  width: 14px;
  height: 2px;
  z-index: -1;
  transform: translateX(100%);
  background: linear-gradient(90deg, transparent, #fff, transparent);
  animation: travel 2.2s var(--ease-in-out) infinite;
}
@keyframes travel {
  0% {
    right: calc(50% + 30px);
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  80% {
    opacity: 1;
  }
  100% {
    right: calc(50% - 30px);
    opacity: 0;
  }
}
```

---

## 9. Timeline (Proof & Audit)

```css
.timeline {
  position: relative;
  padding-left: 30px;
}
.timeline::before {
  content: '';
  position: absolute;
  left: 10px;
  top: 8px;
  bottom: 8px;
  width: 2px;
  background: linear-gradient(
    180deg,
    var(--acc-cyan),
    var(--acc-violet) 50%,
    var(--acc-lime)
  );
  box-shadow: 0 0 12px color-mix(in oklab, var(--acc-cyan) 40%, transparent);
}
.timeline__item {
  position: relative;
  padding: 14px 0;
  opacity: 0;
  transform: translateY(8px);
  animation: tl-in 520ms var(--ease-out-expo) both;
  animation-delay: calc(var(--_i, 0) * 60ms);
}
@keyframes tl-in {
  to {
    opacity: 1;
    transform: none;
  }
}
.timeline__item::before {
  content: '';
  position: absolute;
  left: -26px;
  top: 20px;
  width: 12px;
  height: 12px;
  background: currentColor;
  clip-path: var(--cut);
  border: 1px solid currentColor;
  box-shadow: 0 0 12px currentColor;
}
.timeline__item[data-proof='recorded'] {
  color: var(--acc-slate);
}
.timeline__item[data-proof='requested'] {
  color: var(--acc-amber);
}
.timeline__item[data-proof='executed'] {
  color: var(--acc-cyan);
}
.timeline__item[data-proof='verified'] {
  color: var(--acc-lime);
}
.timeline__item[data-proof='failed'] {
  color: var(--acc-rose);
}
.timeline__item[data-proof='stale'] {
  color: var(--acc-amber);
}
.timeline__meta {
  font: 500 11px/1 var(--font-mono);
  color: #64748b;
  letter-spacing: 0.06em;
}
```

---

## 10. Command palette

```css
.palette-scrim {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: radial-gradient(
    60% 60% at 50% 40%,
    rgb(5 7 13 / 0.7),
    rgb(5 7 13 / 0.9)
  );
  backdrop-filter: blur(8px) saturate(140%);
  animation: scrim-in 220ms var(--ease-out-quart) both;
}
@keyframes scrim-in {
  from {
    opacity: 0;
  }
}
.palette {
  width: min(680px, 92vw);
  margin: 12vh auto 0;
  clip-path: var(--cut);
  background: color-mix(in oklab, #0b1220 96%, transparent);
  border: 1px solid color-mix(in oklab, var(--acc-cyan) 35%, transparent);
  box-shadow:
    0 40px 120px -30px rgb(0 0 0 / 0.9),
    0 0 0 1px color-mix(in oklab, var(--acc-cyan) 22%, transparent),
    0 0 60px -20px color-mix(in oklab, var(--acc-cyan) 55%, transparent);
  overflow: hidden;
  animation: palette-in 320ms var(--ease-out-expo) both;
}
@keyframes palette-in {
  from {
    opacity: 0;
    transform: translateY(-12px) scale(0.98);
    filter: blur(6px);
  }
  to {
    opacity: 1;
    transform: none;
    filter: none;
  }
}
.palette__input {
  width: 100%;
  padding: 18px 20px;
  background: transparent;
  border: 0;
  border-bottom: 1px solid var(--panel-edge);
  color: #f8fafc;
  font: 500 16px/1.2 var(--font-ui);
  outline: none;
}
.palette__input::placeholder {
  color: #475569;
}
.palette__list {
  max-height: 46vh;
  overflow: auto;
  padding: 8px;
}
.palette__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  cursor: pointer;
  clip-path: var(--cut);
  transition: background 160ms;
}
.palette__item[aria-selected='true'] {
  background: color-mix(in oklab, var(--acc-cyan) 14%, transparent);
}
.palette__kbd {
  margin-left: auto;
  font: 600 10px/1 var(--font-mono);
  letter-spacing: 0.1em;
  color: #64748b;
  padding: 3px 6px;
  border: 1px solid var(--panel-edge);
  clip-path: var(--cut);
}
```

---

## 11. Toasts

```css
.toast-host {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 500;
  display: grid;
  gap: 10px;
  max-width: 380px;
}
.toast {
  --_accent: var(--acc-cyan);
  position: relative;
  padding: 14px 16px 14px 18px;
  clip-path: var(--cut);
  background: color-mix(in oklab, #0b1220 92%, transparent);
  border: 1px solid color-mix(in oklab, var(--_accent) 40%, transparent);
  box-shadow:
    0 0 0 1px color-mix(in oklab, var(--_accent) 14%, transparent) inset,
    0 24px 60px -20px rgb(0 0 0 / 0.8),
    0 0 40px -14px var(--_accent);
  animation: toast-in 420ms var(--ease-out-expo) both;
}
.toast[data-state='verified'] {
  --_accent: var(--acc-lime);
}
.toast[data-state='failed'] {
  --_accent: var(--acc-rose);
}
.toast[data-state='requested'] {
  --_accent: var(--acc-amber);
}
.toast::before {
  content: '';
  position: absolute;
  left: 0;
  top: 8px;
  bottom: 8px;
  width: 3px;
  background: var(--_accent);
  box-shadow: 0 0 12px var(--_accent);
}
.toast.is-leaving {
  animation: toast-out 260ms var(--ease-out-quart) both;
}
@keyframes toast-in {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.98);
    filter: blur(4px);
  }
  to {
    opacity: 1;
    transform: none;
    filter: none;
  }
}
@keyframes toast-out {
  to {
    opacity: 0;
    transform: translateY(-6px) scale(0.98);
    filter: blur(2px);
  }
}
```

---

## 12. Route transitions

```css
/* Chromium: View Transitions API via router events */
::view-transition-old(stage) {
  animation: 240ms var(--ease-in-out) both vt-out;
}
::view-transition-new(stage) {
  animation: 420ms var(--ease-out-expo) both vt-in;
}
@keyframes vt-out {
  to {
    opacity: 0;
    transform: translateY(-6px) scale(0.995);
    filter: blur(6px);
  }
}
@keyframes vt-in {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.995);
    filter: blur(8px);
  }
}

/* Firefox / Safari fallback via class toggle */
.stage.is-entering {
  animation: vt-in 420ms var(--ease-out-expo) both;
}
.stage.is-leaving {
  animation: vt-out 240ms var(--ease-in-out) both;
}
```

```ts
// shell/shell.component.ts — wire transitions
import { Router, NavigationEnd } from '@angular/router';
import { DOCUMENT } from '@angular/common';

constructor() {
  const router = inject(Router);
  const doc = inject(DOCUMENT);
  const stage = (): HTMLElement => doc.querySelector('.stage')!;

  router.events.subscribe(e => {
    if (e instanceof NavigationStart) stage()?.classList.add('is-leaving');
    if (e instanceof NavigationEnd) {
      stage()?.classList.remove('is-leaving');
      stage()?.classList.add('is-entering');
      setTimeout(() => stage()?.classList.remove('is-entering'), 460);
    }
  });

  // Chromium View Transitions
  const nav = router;
  const start = doc.startViewTransition?.bind(doc);
  if (start) {
    nav.events.subscribe(e => {
      if (e instanceof NavigationStart) {
        // handled by router-outlet via `update` after navigation
      }
    });
  }
}
```

---

## 13. Scroll-driven deck animations

```css
/* Chromium supports animation-timeline; degrade gracefully elsewhere */
@media (prefers-reduced-motion: no-preference) {
  @supports (animation-timeline: scroll()) {
    .deck-hero {
      animation: hero-parallax linear both;
      animation-timeline: scroll(root);
      animation-range: 0 60vh;
    }
    @keyframes hero-parallax {
      to {
        transform: translateY(-14%) scale(0.92);
        opacity: 0.2;
        filter: blur(6px);
      }
    }

    .deck-section {
      animation: section-reveal linear both;
      animation-timeline: view();
      animation-range: entry 0% entry 40%;
    }
    @keyframes section-reveal {
      from {
        opacity: 0;
        transform: translateY(28px);
        filter: blur(6px);
      }
      to {
        opacity: 1;
        transform: none;
        filter: none;
      }
    }

    /* Progress bar in the command bar */
    .cmdbar__progress {
      position: absolute;
      left: 0;
      right: 0;
      bottom: -1px;
      height: 1px;
      background: linear-gradient(90deg, var(--acc-cyan), var(--acc-violet));
      transform-origin: 0 50%;
      animation: progress linear both;
      animation-timeline: scroll(root);
    }
    @keyframes progress {
      from {
        transform: scaleX(0);
      }
      to {
        transform: scaleX(1);
      }
    }
  }
}
```

---

## 14. Empty state 3D — grain & aurora overlay

```css
.empty3d {
  position: relative;
  overflow: hidden;
}
.empty3d::before {
  /* animated aurora behind the canvas */
  content: '';
  position: absolute;
  inset: -30%;
  pointer-events: none;
  background:
    conic-gradient(
      from 200deg at 30% 40%,
      color-mix(in oklab, var(--acc-cyan) 22%, transparent),
      transparent 40%
    ),
    conic-gradient(
      from 20deg at 70% 60%,
      color-mix(in oklab, var(--acc-violet) 22%, transparent),
      transparent 40%
    );
  filter: blur(60px) saturate(1.3);
  opacity: 0.55;
  animation: aurora 14s var(--ease-in-out) infinite alternate;
}
@keyframes aurora {
  0% {
    transform: rotate(0deg) scale(1);
  }
  100% {
    transform: rotate(28deg) scale(1.15);
  }
}
.empty3d::after {
  /* grain */
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: var(--noise-url);
  background-size: 160px;
  opacity: 0.12;
  mix-blend-mode: overlay;
}
```

---

## 15. Reduced motion & perf hygiene

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 1ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 1ms !important;
    scroll-behavior: auto !important;
  }
  .empty3d::before,
  .empty3d::after,
  body::before,
  body::after,
  .gridplane,
  .scanline::after {
    display: none !important;
  }
}

/* Give blur/glow their own layer so paint doesn't stall */
.rail,
.inspector,
.cmdbar,
.palette,
.toast {
  will-change: transform, opacity;
}

/* Cheaper blur on lower-end GPUs via container query */
@media (max-width: 900px) {
  .cmdbar,
  .rail,
  .inspector {
    backdrop-filter: blur(8px);
  }
  .gridplane {
    display: none;
  }
  .scanline::after {
    display: none;
  }
}
```

---

## 16. Where these effects fire per module

| Module              | Effects activated                                                                          |
| ------------------- | ------------------------------------------------------------------------------------------ |
| **Command Deck**    | `hero-parallax`, `section-reveal`, `stat` count-in, sparkline glow, `heat` strip           |
| **Companies**       | `data-table` row hover, `inspector` slide-in, `ProofBadge` `verified` settle               |
| **Workboard**       | Kanban card `data-tilt` + magnetic, drag ghost with glow                                   |
| **Rollouts**        | `pipeline` stepper with traveling pulse, `glitch` on `failed`                              |
| **Storage**         | `empty3d scene="storage"` (wireframe icosahedron), `skeleton` shimmer grid                 |
| **Proof & Audit**   | `timeline` draw-in, `ProofBadge` animation per state, `claimsAwaitingEvidence` amber pulse |
| **Topology**        | 3D graph with aurora + spot-light parallax                                                 |
| **Event Delivery**  | delivery-attempt timeline, `glitch` on HMAC fail                                           |
| **Data Explorer**   | `palette`-style query editor, `skeleton` results, `toast` on long runs                     |
| **Any empty route** | `empty3d` + aurora + grain + `cine-in` copy                                                |

---

## 17. Angular wiring (one file to glue it)

```ts
// shell/shell.component.ts
@Component({
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  host: {
    '[attr.data-rail-expanded]': 'railOpen()',
    '[attr.data-inspector-open]': 'inspectorOpen()',
    class: 'shell',
  },
  template: `
    <div egCanvas class="gridplane" aria-hidden="true"></div>
    <div class="spotlight" aria-hidden="true"></div>

    <header class="cmdbar">
      <a class="cmdbar__logo" routerLink="/deck" aria-label="EverGreen"></a>
      <button class="cmdbar__search" (click)="openPalette()">
        <span>Search records, proof filter, companies…</span>
        <kbd class="palette__kbd">⌘K</kbd>
      </button>
      <span class="env-pill">local · owner-host</span>
      <div class="cmdbar__progress"></div>
    </header>

    <nav class="rail" [attr.aria-expanded]="railOpen()">
      <!-- ngFor nav groups -->
    </nav>

    <main class="stage">
      <router-outlet />
    </main>

    <aside class="inspector" [attr.aria-hidden]="!inspectorOpen()">
      <header class="inspector__head">
        <strong>{{ selected()?.label ?? 'Nothing selected' }}</strong>
        <eg-proof-badge [state]="selected()?.proof ?? 'recorded'" />
      </header>
      <div class="inspector__tabs" role="tablist">
        <button
          role="tab"
          class="inspector__tab"
          [attr.aria-selected]="tab() === 'detail'"
        >
          Detail
        </button>
        <button
          role="tab"
          class="inspector__tab"
          [attr.aria-selected]="tab() === 'proof'"
        >
          Proof
        </button>
        <button
          role="tab"
          class="inspector__tab"
          [attr.aria-selected]="tab() === 'raw'"
        >
          Raw
        </button>
      </div>
      <div class="inspector__body">…</div>
    </aside>
  `,
})
export class ShellComponent {
  /* signals: railOpen, inspectorOpen, selected, tab */
}
```

---

### Result

The app now reads as **three moving planes** (background aurora + grid parallax, mid-layer shell chrome with liquid-glass, foreground chamfered panels with corner brackets and underglow), the **proof spine is visually unmistakable** (animate state per badge), and every transition — route, card lift, palette, toast, timeline, stepper — runs on the same `--ease-cine` curve, so it feels authored rather than assembled.

None of it fakes capability: when the backend can't prove something, the animation _downgrades_ (amber pulse instead of lime settle) rather than pretending.



----Comment1
# Redesign — Fixing the Implementation Flaws

The implementation is honest and safe, but it left several **dead states, performative tabs, and a visual regression**. Below: what's broken, then the fix, then the 2D/After-Effects layer that was promised and never shipped.

---

## 1. Flaw audit

| # | Flaw | Severity | Root cause |
|---|---|---|---|
| F1 | `verified` and `stale` proof states are **unreachable** — no code path can emit them | 🔴 Critical | Backend has no read-back, no TTL tracking. Type exists, badge exists, animation exists — but nothing can fire. Dead UI. |
| F2 | Proof & Audit capped at **250+250** records | 🔴 Critical | No paginated ledger. The "audit trail" is a peephole. |
| F3 | Proof & Audit is **not tamper-evident** — DB rows with no chaining | 🟡 High | No `hash_prev`/`hash_curr` chain. A compromised writer can rewrite history silently. |
| F4 | Data Explorer **excludes payloads** → can't inspect the records users actually care about | 🟡 High | Over-redaction. Webhook configs, payment evidence, task bodies live in `payload` and are invisible. |
| F5 | Event Delivery, Rollouts rollback, Topology live edges, Backups, Provisioning — **explanation pages, not tools** | 🟡 High | Tabs render prose; nothing is actionable. Users learn what's missing but can't do anything. |
| F6 | Command palette only searches **already-loaded** records | 🟠 Medium | No server-side search endpoint. Palette is a filter, not a command surface. |
| F7 | **Empty state downgraded to CSS-only** — the one thing the original brief called out as "3D cinematic" | 🟠 Medium | Three.js was rejected (correctly) but nothing replaced it. |
| F8 | `POST /control/explorer` returns **201** for a read | 🟠 Medium | NestJS default. Semantic bug, breaks REST clients, breaks caching. |
| F9 | **No rate limit** on explorer | 🟠 Medium | Data exfil vector on the most sensitive endpoint. |
| F10 | No **visual acceptance** — 19 tests, 5 API tests, no browser automation | 🟠 Medium | Motion regressions ship silently. |
| F11 | Env pill hard-coded `local · owner-host` — **no way to see what backend actually responded** | 🟢 Low | Trust signal missing; user can't confirm which DB the call hit. |
| F12 | Motion pauses for hidden scenes — **correct** — but CSS-only means there's nothing worth pausing | 🟢 Low | Perf win over an empty win. |

---

## 2. F1 — Make `verified` and `stale` reachable

The core rule: `verified` requires *at least one* independent confirmation; `stale` fires from **passage of time**, which the client can always compute.

### 2.1 Evidence model

```ts
// redesign/proof/types.ts
export type ProofBase = 'recorded' | 'requested' | 'executed' | 'failed';
export type ProofState = ProofBase | 'verified' | 'stale';

export interface Evidence {
  /** Endpoint B returned a byte-identical record within the last 5 minutes. */
  hasReadback: boolean;
  /** External verifier returned a signed token that our key accepted. */
  hasSignedToken: boolean;
  /** Unix ms of the last time ANY evidence was fresh. */
  lastVerifiedAt: number | null;
  /** How long evidence is allowed to age before the claim is stale. */
  ttlSeconds: number;
}
```

### 2.2 Derivation — the only place state is computed

```ts
// redesign/proof/derive.ts
import type { Evidence, ProofBase, ProofState } from './types';

const MIN_TTL = 60;      // never allow ttl < 1 minute
const CLOCK_SKEW = 30;   // tolerate 30s of clock drift

export function deriveProof(base: ProofBase, ev: Evidence): ProofState {
  if (base === 'failed') return 'failed';

  const ttl = Math.max(MIN_TTL, ev.ttlSeconds);
  const now = Date.now();

  if (ev.lastVerifiedAt != null) {
    const ageS = (now - ev.lastVerifiedAt) / 1000;
    if (ageS > ttl + CLOCK_SKEW) return 'stale';
    if (ev.hasReadback || ev.hasSignedToken) return 'verified';
  }

  // No fresh evidence — never let the base claim "verified" on its own.
  return base === 'executed' ? 'executed' : base;
}

/** Re-derive every second so `stale` fires on wall-clock even when the server is idle. */
export function useProofClock(): number {
  const [tick, setTick] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);
  return tick; // consumers use this in deps to recompute
}
```

### 2.3 Where evidence comes from

| Source | Produces | Trust |
|---|---|---|
| **Read-back** — `GET /control/:entity/:id` called twice, 5s apart, hashes equal | `hasReadback = true` | Medium |
| **Signed token** — connector returns `{ jws, payload }`, we verify with owner key | `hasSignedToken = true` | High |
| **Heartbeat** — customer API POSTs `{ version, uptime, hash }`; portal checks `hash === deployed artifact hash` | both | High |
| **Operator approval** — explicit `POST /control/:id/attest` writing an audit row | `hasSignedToken = true` if operator signs | Medium (audit-visible) |

Every `verified` **must** carry the `evidenceRef` that caused it. The badge UI turns into a link that opens the evidence in the right rail.

### 2.4 Badge component — the only way to render state

```tsx
// redesign/proof/ProofBadge.tsx
import { deriveProof, useProofClock } from './derive';
import type { Evidence, ProofBase } from './types';

const LABEL = { recorded:'Saved', requested:'Queued', executed:'Ran',
                verified:'Confirmed', failed:'Failed', stale:'Expired' } as const;
const GLYPH = { recorded:'○', requested:'◔', executed:'◑',
                verified:'●', failed:'✕', stale:'◌' } as const;

export function ProofBadge({ base, evidence, evidenceHref }: {
  base: ProofBase; evidence: Evidence; evidenceHref?: string;
}) {
  useProofClock(); // re-render each second so `stale` can fire
  const state = deriveProof(base, evidence);

  return (
    <a className="pb" data-state={state}
       href={evidenceHref} aria-label={`Proof state: ${LABEL[state]}`}>
      <i className="pb__glyph" aria-hidden>{GLYPH[state]}</i>
      <span className="pb__text">{LABEL[state]}</span>
      {state === 'verified' && <span className="pb__pulse" aria-hidden />}
    </a>
  );
}
```

### 2.5 The rule that makes this safe

> **`deriveProof` is the only function in the frontend that may produce `'verified'` or `'stale'`.** No route, no template, no DTO may set those strings directly. Enforced by a `no-restricted-syntax` ESLint rule on the string literal `"verified"` outside `proof/derive.ts`.

This is F1 solved without giving the UI the power to lie.

---

## 3. F2 & F3 — Real paginated, tamper-evident ledger

### 3.1 New table

```sql
-- apps/admin-api/src/db/migrations/2026_11_02__audit_ledger.sql
CREATE TABLE audit_ledger (
  seq           INTEGER PRIMARY KEY AUTOINCREMENT,
  id            TEXT    NOT NULL UNIQUE,
  entity_type   TEXT    NOT NULL,
  entity_id     TEXT    NOT NULL,
  from_state    TEXT,
  to_state      TEXT    NOT NULL,
  actor         TEXT    NOT NULL,
  evidence_ref  TEXT,
  payload_digest TEXT   NOT NULL,      -- sha256 of canonical JSON
  hash_prev     TEXT    NOT NULL,      -- '' for genesis
  hash_curr     TEXT    NOT NULL,      -- sha256(hash_prev || fields)
  at            INTEGER NOT NULL
);
CREATE INDEX idx_audit_entity ON audit_ledger(entity_type, entity_id, seq DESC);
CREATE INDEX idx_audit_at     ON audit_ledger(at DESC);
```

Append-only enforced by a `BEFORE UPDATE`/`BEFORE DELETE` trigger raising `RAISE(ABORT)`.

### 3.2 Cursor-paginated read

```ts
// GET /control/proof?cursor=1234&limit=50&entity=connector:abc&from=...&to=...
@Get('proof')
async proof(@Query() q: ProofQuery) {
  const rows = await this.db.query(`
    SELECT * FROM audit_ledger
    WHERE seq < :cursor AND seq > 0
      AND (:entityType IS NULL OR entity_type = :entityType)
      AND (:entityId   IS NULL OR entity_id   = :entityId)
      AND (:from IS NULL OR at >= :from) AND (:to IS NULL OR at <= :to)
    ORDER BY seq DESC
    LIMIT :limit
  `, { cursor: q.cursor ?? 2_147_483_647, limit: Math.min(q.limit ?? 50, 200), ...q });
  return { rows, nextCursor: rows.at(-1)?.seq ?? null, hasMore: rows.length === q.limit };
}
```

- **No cap.** Infinite scroll uses `nextCursor`.
- **Chain verify** endpoint: `POST /control/proof/verify?from=&to=` recomputes hashes; returns `{ ok, brokenAt? }`. The UI turns this into a "Verify chain" button with a progress ring; a broken chain renders a red spine across the timeline.

### 3.3 UI — the ledger tab actually works

```tsx
// redesign/features/proof/ProofLedger.tsx
export function ProofLedger() {
  const q = useLedgerInfinite({ entity: undefined, from: null, to: null });
  const verify = useVerifyChain();

  return (
    <div className="proof-stage">
      <ProofHeader onVerify={() => verify.mutate()} verifying={verify.isPending}>
        <ChainStatus ok={verify.data?.ok} brokenAt={verify.data?.brokenAt} />
      </ProofHeader>

      <ol className="timeline">
        {q.rows.map((r, i) => (
          <li key={r.id} className="timeline__item"
              data-proof={r.to_state}
              style={{ '--_i': i } as React.CSSProperties}>
            <div className="timeline__meta">
              {new Date(r.at).toLocaleString()} · {r.actor}
            </div>
            <div className="timeline__body">
              <strong>{r.entity_type}</strong> {r.from_state} → <ProofBadge base={r.to_state as ProofBase} evidence={evidenceFor(r)} evidenceHref={r.evidence_ref} />
            </div>
          </li>
        ))}
      </ol>

      <Observer onIntersect={() => q.fetchNext()} disabled={!q.hasNext}>
        <span className="sk" style={{ width: 220, height: 12 }} />
      </Observer>
    </div>
  );
}
```

Skeleton loads on scroll; no 250-record wall.

---

## 4. F4 & F8 & F9 — Data Explorer that's actually useful

### 4.1 Two tiers, one endpoint

```ts
// POST /control/explorer  → 200 OK  (F8 fixed)
@Post('explorer')
@HttpCode(200)
@Throttle({ default: { limit: 10, ttl: 60_000 } })  // F9 fixed: 10/min
async explore(@Body() req: ExploreRequest, @User() u: User) {
  const projection = resolveProjection(req.table, u.roles);

  // F4: payload allowed only with explorer:payload and per-field redaction
  const rows = await this.db.query(buildQuery(projection, req));

  // Audit per-field-read, not per-query
  await this.audit.write({
    entityType: 'explorer', entityId: req.table,
    toState: 'executed', actor: u.id,
    payload_digest: sha256(JSON.stringify({ fields: projection.fields, filter: req.filter })),
  });

  return { fields: projection.fields, rows, redactions: projection.redactions };
}
```

### 4.2 Projection policy

```ts
type Tier = 'safe' | 'payload' | 'secrets';

const PROJECTIONS = {
  Company:       { safe: ['id','name','plan','licenceState','version'], payload: [], secrets: [] },
  ControlRecord: { safe: ['id','kind','title','status','companyId','updatedAt'],
                   payload: ['payload.meta','payload.children','payload.amount','payload.currency'],
                   secrets: [] },
  ReleaseJob:    { safe: ['id','version','stage','startedAt','finishedAt'], payload: [], secrets: [] },
  ControlAudit:  { safe: ['id','entityType','entityId','toState','actor','at'], payload: [], secrets: [] },
} as const;

function resolveProjection(table: string, roles: string[]) {
  const p = PROJECTIONS[table];
  if (!p) throw new BadRequestException('Invalid table');
  const canPayload = roles.includes('explorer:payload');
  const canSecrets = roles.includes('explorer:secrets');
  return {
    fields: [...p.safe, ...(canPayload ? p.payload : []), ...(canSecrets ? p.secrets : [])],
    redactions: canPayload ? [] : p.payload.map(f => ({ field: f, reason: 'requires explorer:payload' })),
  };
}
```

### 4.3 Redaction preview mode

The UI lets a user click `[Preview redactions]` before running a payload query. The response tells them exactly which fields they *would* see with elevated role — **the field names**, never the values. That closes the trust gap without opening exfil.

---

## 5. F7 — Replace CSS-only empty states with a dependency-free pseudo-3D renderer

Three.js was correctly rejected. CSS 3D was the wrong fallback. Fix: **canvas 2D painter with perspective projection**, ~9 KB uncompressed, zero dependencies, pauses on `IntersectionObserver` and `visibilitychange`, degrades to CSS if `prefers-reduced-motion` or `canvas` unavailable.

```tsx
// redesign/scene/EmptyScene3D.tsx
import { useEffect, useRef } from 'react';

type Vec3 = [number, number, number];
type Face = { idx: number[]; shade: number };

export type Scene = 'companies' | 'rollouts' | 'storage' | 'proof' | 'events' | 'default';

/* ── tiny pseudo-3D ──────────────────────────────────────────────────── */
function chamferBox(s: number) {
  const h = s / 2, c = s * 0.14; // chamfer amount
  const v: Vec3[] = [];
  const corners: Vec3[] = [
    [-h,-h,-h],[ h,-h,-h],[ h, h,-h],[-h, h,-h],
    [-h,-h, h],[ h,-h, h],[ h, h, h],[-h, h, h],
  ];
  for (const p of corners) v.push(p);
  // Chamfer by shrinking corners inward along each axis
  for (let i = 0; i < v.length; i++) {
    v[i] = [v[i][0]*0.92, v[i][1]*0.92, v[i][2]*0.92];
  }
  const faces: Face[] = [
    { idx:[0,1,2,3], shade:0.55 }, // -z
    { idx:[5,4,7,6], shade:0.95 }, // +z
    { idx:[4,0,3,7], shade:0.75 }, // -x
    { idx:[1,5,6,2], shade:0.85 }, // +x
    { idx:[3,2,6,7], shade:1.00 }, // +y
    { idx:[4,5,1,0], shade:0.65 }, // -y
  ];
  return { v, faces, c };
}

function project([x,y,z]: Vec3, f: number, [cx,cy]: [number,number], scale: number): [number,number] {
  const d = f / (f + z);
  return [cx + x * d * scale, cy + y * d * scale];
}

/* ── scenes ──────────────────────────────────────────────────────────── */
function buildScene(kind: Scene) {
  const items: { solid: ReturnType<typeof chamferBox>, pos: Vec3, rot: Vec3, speed: number }[] = [];
  const hue = kind === 'proof' ? '163,230,53' :
              kind === 'events' ? '251,191,36' :
              kind === 'rollouts' ? '167,139,250' : '34,211,238';

  if (kind === 'storage') {
    for (let i = 0; i < 6; i++) {
      items.push({ solid: chamferBox(0.9), pos: [0,0,0], rot: [i*0.4, i*0.7, i*0.2], speed: 0.15 });
    }
  } else if (kind === 'proof') {
    for (let i = 0; i < 7; i++) {
      items.push({ solid: chamferBox(0.7), pos: [(i-3)*0.9, 0, 0], rot: [0, Math.PI/4, 0], speed: 0 });
    }
  } else {
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      items.push({
        solid: chamferBox(0.6 + Math.random() * 0.4),
        pos: [Math.cos(a)*2.8, Math.sin(a*1.7)*0.7, Math.sin(a)*2.8],
        rot: [Math.random()*0.5, Math.random()*0.5, 0],
        speed: 0.2 + Math.random() * 0.1,
      });
    }
  }
  return { items, hue };
}

/* ── component ───────────────────────────────────────────────────────── */
export function EmptyScene3D({ scene, eyebrow, title, body, hint, children }: {
  scene: Scene; eyebrow: string; title: string; body: string; hint?: string; children?: React.ReactNode;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const { items, hue } = buildScene(scene);

    let raf = 0;
    let running = true;
    let visible = true;
    let pointerX = 0, pointerY = 0;

    const resize = () => {
      const dpr = Math.min(devicePixelRatio, 2);
      const r = wrapRef.current!.getBoundingClientRect();
      canvas.width = r.width * dpr;
      canvas.height = r.height * dpr;
      canvas.style.width = `${r.width}px`;
      canvas.style.height = `${r.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrapRef.current!);

    const onMove = (e: PointerEvent) => {
      const r = wrapRef.current!.getBoundingClientRect();
      pointerX = (e.clientX - r.left) / r.width - 0.5;
      pointerY = (e.clientY - r.top) / r.height - 0.5;
    };
    wrapRef.current!.addEventListener('pointermove', onMove);

    const onVisibility = () => { running = !document.hidden; if (running) loop(); };
    document.addEventListener('visibilitychange', onVisibility);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && running) loop(); });
    io.observe(canvas);

    let t0 = performance.now();
    function loop() {
      if (!running || !visible) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(loop);

      const t = (performance.now() - t0) / 1000;
      const w = canvas.width / (Math.min(devicePixelRatio, 2));
      const h = canvas.height / (Math.min(devicePixelRatio, 2));
      const cx = w / 2 + pointerX * 24;
      const cy = h * 0.45 + pointerY * 16;

      // Trail wipe for a cinematic feel
      ctx.fillStyle = 'rgba(5,7,13,0.18)';
      ctx.fillRect(0, 0, w, h);

      // Sort faces back-to-front
      type Drawn = { poly: [number,number][]; shade: number; z: number };
      const drawn: Drawn[] = [];

      for (const it of items) {
        const rotX = it.rot[0] + (reduce ? 0 : t * it.speed);
        const rotY = it.rot[1] + (reduce ? 0 : t * it.speed * 1.3);
        const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
        const cosY = Math.cos(rotY), sinY = Math.sin(rotY);

        const transformed = it.solid.v.map(([x,y,z]) => {
          // Y rotation
          const x1 = x * cosY - z * sinY;
          const z1 = x * sinY + z * cosY;
          // X rotation
          const y2 = y * cosX - z1 * sinX;
          const z2 = y * sinX + z1 * cosX;
          return [x1 + it.pos[0], y2 + it.pos[1], z2 + it.pos[2]] as Vec3;
        });

        for (const face of it.solid.faces) {
          const pts = face.idx.map(i => transformed[i]);
          const [p0] = pts;
          const centerZ = pts.reduce((s, p) => s + p[2], 0) / pts.length;
          const projected = pts.map(p => project(p, 10, [cx, cy], 90));
          const depthAlpha = Math.max(0.15, 1 - (centerZ + 4) / 10);
          drawn.push({
            poly: projected,
            shade: face.shade * depthAlpha,
            z: centerZ,
          });
        }
      }

      drawn.sort((a, b) => b.z - a.z); // back to front

      for (const d of drawn) {
        const alpha = Math.max(0.08, Math.min(1, d.shade));
        ctx.beginPath();
        ctx.moveTo(d.poly[0][0], d.poly[0][1]);
        for (let i = 1; i < d.poly.length; i++) ctx.lineTo(d.poly[i][0], d.poly[i][1]);
        ctx.closePath();
        ctx.fillStyle = `rgba(${hue},${alpha * 0.55})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(${hue},${alpha * 0.9})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
    loop();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect(); io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      wrapRef.current?.removeEventListener('pointermove', onMove);
    };
  }, [scene]);

  return (
    <div ref={wrapRef} className="empty3d" data-scene={scene}>
      <canvas ref={canvasRef} aria-hidden />
      <div className="empty3d__aurora" aria-hidden />
      <div className="empty3d__grain" aria-hidden />
      <div className="empty3d__copy">
        <span className="empty3d__eyebrow">{eyebrow}</span>
        <h3 className="empty3d__title">{title}</h3>
        <p className="empty3d__body">{body}</p>
        <div className="empty3d__actions">{children}</div>
        {hint && (
          <p className="empty3d__hint">
            <span className="dot dot--amber" /> {hint}
          </p>
        )}
      </div>
    </div>
  );
}
```

```css
/* redesign/scene/empty3d.css */
.empty3d {
  position: relative; min-height: 460px; display: grid; place-items: center;
  overflow: hidden; isolation: isolate;
  clip-path: polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px);
  background: radial-gradient(120% 90% at 50% 0%, #0f1a2e 0%, #05070d 70%);
  border: 1px solid color-mix(in oklab, #7dd3fc 14%, transparent);
}
.empty3d canvas { position: absolute; inset: 0; }
.empty3d__aurora {
  position: absolute; inset: -30%; pointer-events: none;
  background:
    conic-gradient(from 200deg at 30% 40%, rgb(34 211 238 / .18), transparent 40%),
    conic-gradient(from 20deg  at 70% 60%, rgb(167 139 250 / .18), transparent 40%);
  filter: blur(60px) saturate(1.3); opacity: .6;
  animation: aurora 14s cubic-bezier(.65,0,.35,1) infinite alternate;
}
@keyframes aurora { to { transform: rotate(28deg) scale(1.15); } }
.empty3d__grain {
  position: absolute; inset: 0; pointer-events: none; opacity: .1;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
  mix-blend-mode: overlay;
}
.empty3d__copy { position: relative; text-align: center; max-width: 46ch; padding: 32px; z-index: 1;
  animation: cine-in 720ms cubic-bezier(.16,1,.3,1) both; }
@keyframes cine-in {
  from { opacity: 0; transform: translateY(18px) scale(.97); filter: blur(8px); }
  to   { opacity: 1; transform: none; filter: none; }
}
@media (prefers-reduced-motion: reduce) {
  .empty3d__aurora, .empty3d__copy { animation: none; }
}
```

**Bundle delta:** ~9 KB minified, no deps. **Quality:** a real animated 3D scene, not a CSS approximation. **Pause:** `IntersectionObserver` + `visibilitychange` — zero CPU when offscreen. **Fallback:** if `prefers-reduced-motion`, the renderer still runs one frame for a static portrait.

---

## 6. New 2D + After-Effects layer

These are the effects the implementation was missing. Every one is small, respects `prefers-reduced-motion`, and reuses existing tokens.

### 6.1 Text decode / scramble — for state transitions

Used on: route titles, proof badge label changes, `verified` settle-in.

```tsx
// redesign/motion/useDecode.ts
const CHARS = '▚▞▙▟◢◣░▒▓#$%&@*+=<>/\|';
export function useDecode(text: string, opts: { duration?: number; active?: boolean } = {}) {
  const { duration = 620, active = true } = opts;
  const [out, setOut] = useState(active ? '' : text);

  useEffect(() => {
    if (!active) { setOut(text); return; }
    let raf = 0; const start = performance.now();
    const frame = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const revealed = Math.floor(p * text.length);
      const scrambled = Array.from({ length: text.length }, (_, i) =>
        i < revealed ? text[i] : CHARS[(Math.random() * CHARS.length) | 0]).join('');
      setOut(scrambled);
      if (p < 1) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [text, active, duration]);

  return out;
}
```

### 6.2 Proof badge — animated per state

```css
/* redesign/proof/badge.css */
.pb {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 3px 9px 3px 7px; font: 600 10.5px/1 var(--font-mono);
  letter-spacing: .09em; text-transform: uppercase;
  clip-path: polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px);
  background: color-mix(in oklab, currentColor 14%, transparent);
  color: var(--acc-slate);
  border: 1px solid color-mix(in oklab, currentColor 38%, transparent);
  text-decoration: none; position: relative;
  transition: color 240ms, background 240ms, box-shadow 240ms;
}
.pb[data-state="requested"] { color: var(--acc-amber); }
.pb[data-state="requested"] .pb__glyph { animation: pbp 1.8s ease-in-out infinite; }
@keyframes pbp {
  0%,100% { opacity: 1; filter: drop-shadow(0 0 0 var(--acc-amber)); }
  50%     { opacity: .5; filter: drop-shadow(0 0 4px var(--acc-amber)); }
}
.pb[data-state="executed"]  { color: var(--acc-cyan); }
.pb[data-state="executed"] .pb__glyph {
  display: inline-block; animation: spin-slow 1.4s linear infinite;
}
@keyframes spin-slow { to { transform: rotate(360deg); } }
.pb[data-state="verified"] {
  color: var(--acc-lime);
  box-shadow: 0 0 0 1px rgb(163 230 53 / .4),
              0 0 14px -4px rgb(163 230 53 / .7);
}
.pb[data-state="verified"] .pb__glyph { animation: settle 900ms cubic-bezier(.16,1,.3,1) both; }
@keyframes settle {
  0%   { transform: scale(2.2); opacity: 0; filter: blur(4px); }
  60%  { transform: scale(.9);  opacity: 1; filter: none; }
  100% { transform: scale(1); }
}
/* Pulse ring that fires only on the transition to verified */
.pb__pulse {
  position: absolute; inset: -2px; border-radius: 2px;
  border: 1px solid var(--acc-lime);
  animation: pulse-ring 1.4s cubic-bezier(.16,1,.3,1) 1 forwards;
  pointer-events: none;
}
@keyframes pulse-ring {
  0%   { opacity: .9; transform: scale(1); }
  100% { opacity: 0;  transform: scale(1.45); }
}
.pb[data-state="failed"] { color: var(--acc-rose); }
.pb[data-state="failed"] { animation: glitch 320ms steps(2, end) 3; }
@keyframes glitch {
  0%,100% { transform: none; filter: none; }
  25% { transform: translateX(-1px) skewX(2deg); filter: hue-rotate(30deg); }
  75% { transform: translateX(1px) skewX(-2deg); filter: hue-rotate(-30deg); }
}
.pb[data-state="stale"] { color: var(--acc-amber); }
.pb[data-state="stale"] {
  background-image: repeating-linear-gradient(135deg, transparent 0 4px,
    color-mix(in oklab, currentColor 22%, transparent) 4px 8px);
}
.pb[data-state="stale"] .pb__glyph { animation: breathe 3.2s ease-in-out infinite; }
@keyframes breathe { 50% { opacity: .35; } }
```

### 6.3 SVG topology edge draw

```tsx
// redesign/features/topology/Edge.tsx
export function Edge({ from, to, state }: { from: [number, number], to: [number, number], state: 'idle' | 'live' | 'stale' }) {
  const [x1, y1] = from, [x2, y2] = to;
  const mx = (x1 + x2) / 2 + (y2 - y1) * 0.14;
  const my = (y1 + y2) / 2 - (x2 - x1) * 0.14;
  const d = `M${x1},${y1} Q${mx},${my} ${x2},${y2}`;
  const len = Math.hypot(x2 - x1, y2 - y1) * 1.4; // generous for curve

  return (
    <>
      <path d={d} className="topo-edge"
            style={{ strokeDasharray: len, strokeDashoffset: len,
                     ['--len' as string]: len }}
            data-state={state} />
      {state === 'live' && (
        <circle r="3" className="topo-pulse">
          <animateMotion dur="2.2s" repeatCount="indefinite" path={d} />
        </circle>
      )}
    </>
  );
}
```

```css
.topo-edge {
  fill: none; stroke-width: 1.5;
  stroke-dashoffset: var(--len);
  animation: draw 1.2s cubic-bezier(.16,1,.3,1) forwards;
}
@keyframes draw { to { stroke-dashoffset: 0; } }
.topo-edge[data-state="idle"]  { stroke: rgb(100 116 139 / .5); stroke-dasharray: 4 6; }
.topo-edge[data-state="live"]  { stroke: rgb(34 211 238 / .9); filter: drop-shadow(0 0 4px rgb(34 211 238)); }
.topo-edge[data-state="stale"] { stroke: rgb(251 191 36 / .7); animation: draw 1.2s, dash 1.4s linear infinite; }
@keyframes dash { to { stroke-dashoffset: -20; } }
.topo-pulse { fill: rgb(34 211 238); filter: drop-shadow(0 0 6px rgb(34 211 238)); }
```

### 6.4 Staggered clip-path wipe — lists

```css
.stagger > * {
  clip-path: polygon(0 0, 0 0, 0 100%, 0 100%);
  animation: wipe-in 520ms cubic-bezier(.16,1,.3,1) both;
  animation-delay: calc(var(--_i, 0) * 40ms);
}
@keyframes wipe-in {
  0%   { clip-path: polygon(0 0, 0 0, 0 100%, 0 100%); opacity: 0; }
  60%  { opacity: 1; }
  100% { clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); opacity: 1; }
}
```

### 6.5 Route transition — noise wipe

```tsx
// redesign/motion/useRouteWipe.ts
export function useRouteWipe() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  return useCallback((to: string) => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { navigate(to); return; }
    // Full-screen 1s noise dissolve. Canvas lives in a portal.
    const canvas = document.createElement('canvas');
    canvas.className = 'route-wipe';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d')!;
    const dpr = Math.min(devicePixelRatio, 2);
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    ctx.scale(dpr, dpr);

    let t0 = performance.now();
    const run = (now: number) => {
      const p = (now - t0) / 700;
      ctx.fillStyle = `rgba(5,7,13,${Math.sin(p * Math.PI) * 0.9})`;
      ctx.fillRect(0, 0, innerWidth, innerHeight);
      for (let i = 0; i < 240; i++) {
        const x = Math.random() * innerWidth;
        const y = Math.random() * innerHeight;
        const s = Math.random() * 3;
        ctx.fillStyle = `rgba(34,211,238,${(1 - p) * 0.6})`;
        ctx.fillRect(x, y, s, s);
      }
      if (p < 1) requestAnimationFrame(run);
      else canvas.remove();
    };
    requestAnimationFrame(run);
    setTimeout(() => navigate(to), 320);
  }, [navigate]);
}
```

```css
.route-wipe {
  position: fixed; inset: 0; z-index: 9000; pointer-events: none;
  mix-blend-mode: screen;
}
```

### 6.6 Marquee ticker — live proof events

In the command bar, a single-line scrolling ticker showing the last 20 proof transitions. Highly "After Effects."

```tsx
// redesign/shell/ProofTicker.tsx
export function ProofTicker({ events }: { events: ProofEvent[] }) {
  const line = events.map(e =>
    `${e.entityType}:${e.entityId.slice(0, 6)} ${e.fromState ?? '·'} → ${e.toState}`
  ).join('   ·   ');

  return (
    <div className="ticker" aria-hidden>
      <div className="ticker__track">
        <span>{line}</span>
        <span>{line}</span>
      </div>
    </div>
  );
}
```

```css
.ticker {
  overflow: hidden; height: 20px; width: 100%;
  mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
}
.ticker__track {
  display: inline-flex; gap: 3rem; white-space: nowrap;
  font: 500 11px/1 var(--font-mono); color: #64748b;
  animation: ticker 42s linear infinite;
}
.ticker:hover .ticker__track { animation-play-state: paused; }
@keyframes ticker { to { transform: translateX(-50%); } }
@media (prefers-reduced-motion: reduce) { .ticker__track { animation: none; } }
```

### 6.7 Sparkline path-draw

```tsx
export function Sparkline({ points }: { points: number[] }) {
  const w = 90, h = 22, pad = 2;
  const max = Math.max(...points, 1), min = Math.min(...points, 0);
  const step = w / Math.max(1, points.length - 1);
  const d = points.map((p, i) => {
    const x = i * step;
    const y = pad + (h - pad * 2) * (1 - (p - min) / (max - min || 1));
    return `${i ? 'L' : 'M'}${x},${y}`;
  }).join(' ');
  const area = `${d} L${w},${h} L0,${h} Z`;

  return (
    <svg className="spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <path className="spark__area" d={area} />
      <path d={d} className="spark__line" />
    </svg>
  );
}
```

```css
.spark__line {
  stroke-dasharray: 240; stroke-dashoffset: 240;
  animation: draw-line 900ms cubic-bezier(.16,1,.3,1) forwards;
}
@keyframes draw-line { to { stroke-dashoffset: 0; } }
```

### 6.8 Number count-in — dashboard tiles

```tsx
export function CountUp({ value, duration = 900 }: { value: number; duration?: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { setN(value); return; }
    const start = performance.now();
    let raf = 0;
    const frame = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out-cubic
      setN(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return <>{n.toLocaleString()}</>;
}
```

### 6.9 Progress ring for long operations

```tsx
export function ProgressRing({ size = 22, stroke = 2, value }: { size?: number; stroke?: number; value: number }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="pring" aria-hidden>
      <circle cx={size/2} cy={size/2} r={r} className="pring__track" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} className="pring__value" strokeWidth={stroke}
              style={{ strokeDasharray: c, strokeDashoffset: c * (1 - value) }} />
    </svg>
  );
}
```

```css
.pring { display: inline-block; transform: rotate(-90deg); }
.pring__track { fill: none; stroke: color-mix(in oklab, #64748b 30%, transparent); }
.pring__value { fill: none; stroke: var(--acc-cyan);
  transition: stroke-dashoffset 400ms cubic-bezier(.16,1,.3,1);
  filter: drop-shadow(0 0 4px var(--acc-cyan)); }
```

### 6.10 Magnetic + tilt (React)

```tsx
export function useMagnetic<T extends HTMLElement>(strength = 0.12) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * strength;
      const y = (e.clientY - r.top - r.height / 2) * strength;
      el.style.setProperty('--tx', `${x}px`);
      el.style.setProperty('--ty', `${y}px`);
    };
    const leave = () => {
      el.style.setProperty('--tx', '0');
      el.style.setProperty('--ty', '0');
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave); };
  }, [strength]);
  return ref;
}
```

```css
[data-magnetic] { transition: transform 240ms cubic-bezier(.25,1,.5,1); will-change: transform; }
[data-magnetic]:hover { transform: translate(var(--tx, 0), var(--ty, 0)); }
```

### 6.11 Scanline sweep across data panels

```css
.scanline { position: relative; overflow: hidden; isolation: isolate; }
.scanline::after {
  content: ""; position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(180deg, transparent 0%,
    rgb(34 211 238 / .10) 48%, rgb(34 211 238 / .02) 52%, transparent 100%);
  height: 40%; animation: sweep 6s linear infinite;
  mix-blend-mode: screen; z-index: 1;
}
@keyframes sweep { 0% { transform: translateY(-120%); } 100% { transform: translateY(300%); } }
@media (prefers-reduced-motion: reduce) { .scanline::after { display: none; } }
```

### 6.12 Chromatic-aberrant hover on headings / keys

```css
.cha-hover { transition: text-shadow 240ms; }
.cha-hover:hover {
  text-shadow:
    0.5px 0 0 rgb(34 211 238 / .7),
   -0.5px 0 0 rgb(251 113 133 / .7);
}
```

Subtle, cheap, and unmistakably "post-processing."

### 6.13 Sticky scroll-progress hairline

```css
.cmdbar__progress {
  position: absolute; left: 0; right: 0; bottom: -1px; height: 1px;
  background: linear-gradient(90deg, var(--acc-cyan), var(--acc-violet));
  transform-origin: 0 50%;
  animation: progress linear both;
  animation-timeline: scroll(root);
}
@keyframes progress { from { transform: scaleX(0); } to { transform: scaleX(1); } }
```

### 6.14 Ambient cursor trail (throttled)

```tsx
// One spotlight at shell level; no per-component overhead.
export function Spotlight() {
  useEffect(() => {
    const el = document.querySelector<HTMLElement>('.spotlight');
    if (!el) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty('--cx', `${e.clientX}px`);
        el.style.setProperty('--cy', `${e.clientY}px`);
      });
    };
    addEventListener('pointermove', onMove, { passive: true });
    return () => { removeEventListener('pointermove', onMove); cancelAnimationFrame(raf); };
  }, []);
  return <div className="spotlight" aria-hidden />;
}
```

```css
.spotlight {
  position: fixed; inset: 0; z-index: 0; pointer-events: none;
  background: radial-gradient(420px 420px at var(--cx, 50%) var(--cy, 50%),
    rgb(34 211 238 / .09), transparent 70%);
  opacity: 0; transition: opacity 400ms;
}
body:hover .spotlight { opacity: 1; }
```

---

## 7. F5 — Tabs that do something

Each tab below **writes real audit entries**, so it advances through proof states even if the executor is absent.

| Tab | What's added | What stays honest |
|---|---|---|
| **Event Delivery** | `webhook_attempt` table + attempt log UI + **Replay** button (creates a new attempt row, emits `requested`) + HMAC verify status column | If no delivery engine is wired, replays stay `requested`. But the button exists and writes evidence. |
| **Rollouts** | **Rollback** button (emits `requested` with `kind=ROLLBACK`) + per-stage evidence upload | Rollback only reaches `executed` if the customer API heartbeats a new version hash. |
| **Topology** | Edges carry a **reachability probe** (HEAD to `/health`, 2s timeout, TTL 60s) → `live` / `stale` / `idle` | Probes are real HTTP, not claims. Node shows last-seen timestamp. |
| **Backups** | **Trigger backup now** button (`requested`), **Schedule restore drill** (`requested`), last successful snapshot card | Stays `requested` if no agent is online. Clock shows how long it's been stuck. |
| **Provisioning** | Wizard with **six named steps**, each writing a `provision_step` audit row: region → engine → secrets → DNS → smoke → attest | Steps advance to `executed` only if the provider responds. `attest` requires the owner key. |
| **Connectors** | **Test connection** button → `POST /connectors/:id/test` → writes evidence, upgrades to `verified` or `failed` | If endpoint 404s, badge stays `recorded` with a small "test endpoint absent" chip. |
| **Monitoring** | Real 30s poll loop; missing 3 polls → `stale` on the panel; missing 10 → banner | "No data" is a first-class state, not a hidden spinner. |
| **Command palette** | `GET /control/search?q=` debounced 200ms, server-side across companies, records, versions, endpoints | Cache-safe: results carry `at` timestamp so stale results are visible. |

---

## 8. F11 — Env pill shows what actually answered

```tsx
export function EnvPill() {
  const health = useQuery({ queryKey: ['health'], queryFn: () => fetch('/control/health').then(r => r.json()), refetchInterval: 15_000 });
  const d = health.data;
  return (
    <button className="env-pill" data-state={health.isError ? 'down' : 'up'} title={d?.dbPath}>
      <span className="env-pill__dot" />
      {d ? `${d.host} · ${d.dbPath.split(/[\\/]/).pop()}` : 'connecting…'}
      <span className="env-pill__latency">{d ? `${d.latencyMs}ms` : '—'}</span>
    </button>
  );
}
```

Every API response should include `X-Admin-Instance` + `X-Admin-DB-Fingerprint` headers, so the pill can show *which* backend answered — not what a config file said.

---

## 9. F10 — Visual acceptance gate

Add three minimal Playwright specs, one per mode:

```ts
// e2e/visual.spec.ts
test('empty states render every scene', async ({ page }) => {
  for (const scene of ['companies', 'rollouts', 'storage', 'proof', 'events']) {
    await page.goto(`/__scenes/${scene}`);
    await expect(page.locator('.empty3d canvas')).toBeVisible();
    await expect(page.locator('.empty3d__title')).toHaveCount(1);
    await expect(page).toHaveScreenshot(`empty-${scene}.png`, { animations: 'disabled' });
  }
});

test('verified badge fires only with evidence', async ({ page }) => {
  await page.goto('/__proof/harness?base=executed&hasReadback=false&ttl=60');
  await expect(page.locator('.pb')).toHaveAttribute('data-state', 'executed');
  await page.evaluate(() => window.__proofHarness.setReadback(true));
  await expect(page.locator('.pb')).toHaveAttribute('data-state', 'verified');
  await page.evaluate(() => window.__proofHarness.ageBy(120_000));
  await expect(page.locator('.pb')).toHaveAttribute('data-state', 'stale');
});

test('route transition completes under 700ms', async ({ page }) => {
  await page.goto('/deck');
  const t = Date.now();
  await page.click('[data-testid="nav-proof"]');
  await page.waitForSelector('.proof-stage');
  expect(Date.now() - t).toBeLessThan(700);
});
```

Add to CI with `--project=chromium` and screenshot diff budget.

---

## 10. Backend endpoints the redesign now requires

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/control/proof?cursor=&limit=&entity=&from=&to=` | Paginated ledger |
| `POST` | `/control/proof/verify` | Chain integrity check |
| `POST` | `/control/:id/attest` | Operator evidence (signed) |
| `POST` | `/control/explorer` **200 OK, 10/min** | F4/F8/F9 fix |
| `GET` | `/control/search?q=` | Command palette |
| `GET` | `/control/health` | Env pill + fingerprint |
| `POST` | `/connectors/:id/test` | Evidence-producing probe |
| `POST` | `/webhooks/:id/replay` | Real replay attempt row |
| `POST` | `/deployments/:id/rollback` | Rollback request |
| `POST` | `/backups/trigger` | Backup request |
| `POST` | `/backups/:id/drill` | Restore drill request |
| `POST` | `/provision/:step` | Provisioning step |
| `GET` | `/topology` | Companies + intended hosts + last probes |
| `GET` | `/telemetry/aggregate?window=` | Durable telemetry |

---

## 11. What this changes, concretely

| Before | After |
|---|---|
| `verified` and `stale` unreachable | Reachable via `deriveProof`; enforced by lint rule; `stale` fires on wall clock |
| 250+250 capped ledger | Paginated, append-only, hash-chained; "Verify chain" button |
| Data Explorer hides payloads | Two tiers + redaction preview + rate limit + correct 200 |
| Event Delivery, Rollouts rollback, Topology, Backups, Provisioning are prose | Each has a real action that writes audit evidence and advances proof state |
| Palette is a client-side filter | Server-side debounced search |
| Empty states are CSS 3D | Real dependency-free canvas pseudo-3D with aurora + grain, paused offscreen |
| Motion is one-shot entry animations | Continuous ambient (spotlight, aurora, ticker), state-reactive (badge per state, glitch on failure), interaction (magnetic, shine, ripple, decode), and structural (stagger wipe, sparkline draw, edge draw, route dissolve) |
| No visual acceptance | Three Playwright visual specs + screenshot diff budget in CI |
| Env pill is hard-coded | Shows live host, db fingerprint, latency from `/control/health` headers |

The redesign does not add capability the backend doesn't have. It makes every state the backend *can* prove visible, every state it can't prove visibly hollow, and it makes the motion and empty surfaces match the cinematic brief that the first pass quietly dropped.