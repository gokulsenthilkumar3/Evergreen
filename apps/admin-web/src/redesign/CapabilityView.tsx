import EmptyScene from "./EmptyScene";
import OperationTools from "./OperationTools";
const capabilities: Record<
  string,
  { title: string; body: string; hint: string; next: string }
> = {
  PROVISIONING: {
    title: "Provisioning",
    body: "A cloud provisioner is not connected. Registering a company saves its intended hosting choice; it does not create infrastructure.",
    hint: "No cloud account or deployment plan has been executed.",
    next: "Choose your cloud account, region, DNS and cost limit, then configure an approved runner.",
  },
  ACCESS: {
    title: "Access & roles",
    body: "This installation currently uses the owner provider session. Individual operator RBAC and passkey management are not implemented.",
    hint: "No additional accounts or permissions have been created.",
    next: "Define operator roles and an identity provider before enabling delegated access.",
  },
  KEYS: {
    title: "Keys & secrets",
    body: "Owner signing material and runtime credentials are protected outside the repository. This page never retrieves or displays their values.",
    hint: "Secret rotation and usage attestation are not connected.",
    next: "Configure a secret-manager connector and scoped workload identities for cloud services.",
  },
  BACKUPS: {
    title: "Backups & recovery",
    body: "Controlled release tools create database snapshots, but a backup scheduler and restore-drill collector are not connected to this portal.",
    hint: "A stored snapshot is not proof of a successful restoration.",
    next: "Configure independent encrypted retention, then record a measured restore drill.",
  },
  SLOS: {
    title: "Monitoring & SLOs",
    body: "Durable telemetry history, error budgets and alert routing are not connected. Live process counters are available under Telemetry for configured customers.",
    hint: "No uptime percentage or compliance claim is inferred from registry data.",
    next: "Connect customer telemetry and a durable collector before defining service targets.",
  },
};
export default function CapabilityView({ id, apiBase }: { id: string; apiBase:string }) {
  const c = capabilities[id];
  if (!c) return null;
  return (
    <section>{['BACKUPS','PROVISIONING'].includes(id)&&<OperationTools apiBase={apiBase} kind={id==='BACKUPS'?'backup':'provision'}/>}
      <div className="page-toolbar">
        <div>
          <p className="workspace-eyebrow">SETUP / CONNECTION REQUIRED</p>
          <h1 className="page-title">{c.title}</h1>
        </div>
      </div>
      <EmptyScene
        title={`${c.title} needs a connection`}
        body={c.body}
        hint={c.hint}
      />
      <article className="glass-panel ops-chart">
        <span className="workspace-eyebrow">NEXT SETUP STEP</span>
        <h2>Make the connection explicit.</h2>
        <p>{c.next}</p>
      </article>
    </section>
  );
}
