import SupportMarkdown from './SupportMarkdown';
import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../utils/api";
import { uiText, uiDateLocale, formatUiNumber, useUiLanguage } from "../i18n";
import { formatApiError } from "../utils/messages";
type Resource = {
  id: string;
  kind: string;
  key: string;
  title: string;
  visibility: string;
  status: string;
  version: number;
  data: Record<string, any>;
};
const labels: Record<string, string> = {
  KB: "Knowledge articles",
  QUEUE: "Queues and routing",
  SLA: "SLA policies",
  CALENDAR: "Business calendars",
  CATEGORY: "Categories and custom fields",
  MACRO: "Canned responses",
  VIEW: "Saved views",
  PREFERENCE: "Notification preferences",
  RULE: "Intake routing rules",
  TEMPLATE: "Email templates",
  RETENTION: "Retention review",
};
const defaults: Record<string, Record<string, any>> = {
  KB: { body: "", category: "GENERAL", language: "en" },
  QUEUE: { members: [], capacity: 20, routing: "MANUAL" },
  SLA: {
    priority: "NORMAL",
    queue: "*",
    responseMinutes: 120,
    resolutionMinutes: 1440,
    pausePending: true,
    calendarKey: "",
  },
  CALENDAR: {
    timezone: "Asia/Kolkata",
    weekdays: [1, 2, 3, 4, 5],
    startMinute: 540,
    endMinute: 1020,
    holidays: [],
  },
  CATEGORY: { parent: "", fields: [] },
  MACRO: { body: "", language: "en" },
  VIEW: { q: "", status: "ALL", queue: "", priority: "ALL", assignment: "ALL" },
  PREFERENCE: { portalUpdates: true, emailUpdates: false, language: "en" },
  RULE: { category: "*", priority: "*", queue: "TRIAGE", enabled: true },
  TEMPLATE: { body: "", language: "en" },
  RETENTION: { closedDays: 365,autoCloseResolvedDays:0 },
};
const inputLabels: Record<string, string> = {
  body: "Content",
  category: "Category",
  language: "Language",
  capacity: "Maximum active tickets per agent",
  routing: "Assignment method",
  priority: "Priority",
  queue: "Queue",
  responseMinutes: "First response target in business minutes",
  resolutionMinutes: "Resolution target in business minutes",
  pausePending: "Pause resolution timer while pending",
  calendarKey: "Calendar key (empty for 24/7)",
  timezone: "Time zone",
  parent: "Parent category key",
  q: "Search text",
  status: "Status",
  assignment: "Assignment filter",
  portalUpdates: "Portal notifications",
  emailUpdates: "Email update preference",
  enabled: "Enable routing rule",
  closedDays: "Closed ticket retention days",
  autoCloseResolvedDays:'Automatically close unconfirmed resolved tickets after days (0 disables)',
};
const choices: Record<string, string[]> = {
  language: ["en", "ta"],
  routing: ["MANUAL", "ROUND_ROBIN", "LEAST_LOADED"],
  priority: ["*", "ALL", "LOW", "NORMAL", "HIGH", "URGENT"],
  status: [
    "ALL",
    "OPEN",
    "IN_PROGRESS",
    "PENDING",
    "ON_HOLD",
    "RESOLVED",
    "CLOSED",
    "REOPENED",
  ],
  assignment: ["ALL", "MINE", "UNASSIGNED"],
};
export default function HelpdeskOperationsPanel({
  username,
  role,
  onView,
  onTicket,
}: {
  username: string;
  role: string;
  onView: (data: Record<string, any>) => void;
  onTicket: (id: string) => void;
}) {
  useUiLanguage();
  const client = useQueryClient();
  const admin = role === "ADMIN";
  const [tab, setTab] = useState(
      admin && /\/helpdesk\/(queues|reporting)$/.test(window.location.pathname)
        ? "REPORT"
        : admin && window.location.pathname === "/helpdesk/sla"
          ? "CONFIG"
          : "KB",
    ),
    [kind, setKind] = useState(
      admin && window.location.pathname === "/helpdesk/sla" ? "SLA" : "KB",
    ),
    [search, setSearch] = useState(""),
    [editing, setEditing] = useState<Resource | null | undefined>(undefined);
  const [form, setForm] = useState({
    key: "",
    title: "",
    visibility: "PUBLIC",
    status: "DRAFT",
    data: { ...defaults.KB },
    reason: "",
  });
  const [history, setHistory] = useState<string | null>(null);
  const collection = useQuery<Resource[]>({
    queryKey: ["helpdesk-resources", kind, username, role, search],
    enabled: tab === "KB" || tab === "CONFIG",
    queryFn: async () =>
      (await api.get(`/helpdesk/resources/${kind}`, { params: { q: search } }))
        .data,
  });
  const views = useQuery<Resource[]>({
    queryKey: ["helpdesk-views", username, role],
    queryFn: async () => (await api.get("/helpdesk/resources/VIEW")).data,
  });
  const prefs = useQuery<Resource[]>({
    queryKey: ["helpdesk-preferences", username],
    enabled: tab === "PREFERENCE",
    queryFn: async () => (await api.get("/helpdesk/resources/PREFERENCE")).data,
  });
  const alerts = useQuery<Resource[]>({
    queryKey: ["helpdesk-notifications", username],
    enabled: tab === "NOTIFICATION",
    refetchInterval: 30000,
    queryFn: async () =>
      (await api.get("/helpdesk/resources/NOTIFICATION")).data,
  });
  const queueHealth = useQuery<any[]>({
    queryKey: ["helpdesk-queue-health", username],
    enabled: tab === "REPORT" && admin,
    queryFn: async () => (await api.get("/helpdesk/queues")).data,
  });
  const report = useQuery<any>({
    queryKey: ["helpdesk-report", username],
    enabled: tab === "REPORT" && admin,
    queryFn: async () => (await api.get("/helpdesk/reporting")).data,
  });
  const retention = useQuery<any>({
    queryKey: ["helpdesk-retention", username],
    enabled: tab === "REPORT" && admin,
    queryFn: async () => (await api.get("/helpdesk/retention-preview")).data,
  });
  const capabilities = useQuery<any>({
    queryKey: ["helpdesk-capabilities", username],
    enabled: admin && tab === "CONFIG",
    queryFn: async () => (await api.get("/helpdesk/capabilities")).data,
  });
  const agents = useQuery<{ id: number; username: string }[]>({
    queryKey: ["helpdesk-agents", username],
    enabled: admin,
    queryFn: async () => (await api.get("/helpdesk/agents")).data,
  });
  const revisions = useQuery<any[]>({
    queryKey: ["helpdesk-revisions", history],
    enabled: !!history,
    queryFn: async () =>
      (await api.get(`/helpdesk/resources/${history}/revisions`)).data,
  });
  const save = useMutation({
    mutationFn: () =>
      api.post("/helpdesk/resources", {
        kind,
        ...form,
        version: editing?.version || 0,
      }),
    onSuccess: async () => {
      setEditing(undefined);
      await client.invalidateQueries({
        predicate: (q) => String(q.queryKey[0]).startsWith("helpdesk-"),
      });
    },
  });
  const helpful = useMutation({
    mutationFn: ({ id, value }: { id: string; value: boolean }) =>
      api.post(`/helpdesk/kb/${id}/feedback`, { helpful: value }),
  });
  const read = useMutation({
    mutationFn: (id: string) => api.post(`/helpdesk/notifications/${id}/read`),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: ["helpdesk-notifications"] }),
  });
  const open = (nextKind: string, row: Resource | null) => {
    setKind(nextKind);
    setEditing(row);
    setForm({
      key: row?.key || (nextKind === "PREFERENCE" ? "DEFAULT" : ""),
      title:
        row?.title ||
        (nextKind === "PREFERENCE" ? "My support preferences" : ""),
      visibility:
        row?.visibility ||
        (["PREFERENCE", "VIEW"].includes(nextKind)
          ? "PRIVATE"
          : ["KB", "MACRO", "CATEGORY", "QUEUE"].includes(nextKind)
            ? "PUBLIC"
            : "TEAM"),
      status: row?.status || (nextKind === "KB" ? "DRAFT" : "ACTIVE"),
      data: {...structuredClone(defaults[nextKind]),...(row?.data||{})},
      reason: "",
    });
    save.reset();
  };
  const error = save.error || helpful.error || read.error;
  const field = (key: string, value: any) =>
    setForm((previous) => ({
      ...previous,
      data: { ...previous.data, [key]: value },
    }));
  return (
    <Paper variant="outlined" sx={{ p: 3, my: 3, borderRadius: 3 }}>
      <Typography variant="h6">{uiText("Support workspace")}</Typography>
      <Tabs
        value={tab}
        variant="scrollable"
        scrollButtons="auto"
        onChange={(_, value) => {
          setTab(value);
          setSearch("");
          if (value === "KB") setKind("KB");
          if (value === "CONFIG") setKind("QUEUE");
        }}
      >
        <Tab value="KB" label={uiText("Knowledge articles")} />
        <Tab value="VIEW" label={uiText("Saved views")} />
        <Tab value="NOTIFICATION" label={uiText("Notifications")} />
        <Tab value="PREFERENCE" label={uiText("Notification preferences")} />
        {admin && <Tab value="CONFIG" label={uiText("Configuration")} />}{" "}
        {admin && <Tab value="REPORT" label={uiText("Reports")} />}
      </Tabs>
      {error && <Alert severity="error">{formatApiError(error)}</Alert>}
      {(tab === "KB" || tab === "CONFIG") && (
        <Stack spacing={2} sx={{ mt: 2 }}>
          {tab === "CONFIG" && capabilities.data && (
            <Alert severity="info">
              {uiText("Attachment antivirus")}:{" "}
              {uiText(capabilities.data.antivirus?.state || "QUARANTINED")} ·{" "}
              {uiText("Signed event sources configured")}:{" "}
              {capabilities.data.signedEventIntake?.filter(
                (source: any) => source.configured,
              ).length || 0}{" "}
              / 6 ·{" "}
              {uiText(
                "Provider transport and owner execution require separate setup.",
              )}
            </Alert>
          )}
          {tab === "CONFIG" && (
            <TextField
              select
              label={uiText("Configuration type")}
              value={kind}
              onChange={(event) => {
                setKind(event.target.value);
                setSearch("");
              }}
            >
              {Object.entries(labels)
                .filter(([key]) => !["KB", "VIEW", "PREFERENCE"].includes(key))
                .map(([key, label]) => (
                  <MenuItem key={key} value={key}>
                    {uiText(label)}
                  </MenuItem>
                ))}
            </TextField>
          )}
          <Stack direction="row" gap={1}>
            <TextField
              fullWidth
              size="small"
              label={uiText("Search support content")}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            {admin && (
              <Button onClick={() => open(kind, null)}>
                {uiText("Create")}
              </Button>
            )}
          </Stack>
          {collection.isError && (
            <Alert severity="error">{formatApiError(collection.error)}</Alert>
          )}
          {collection.isPending && (
            <Typography>{uiText("Loading...")}</Typography>
          )}
          {collection.data?.length === 0 && (
            <Typography>
              {uiText("No support content matches this view.")}
            </Typography>
          )}
          {collection.data?.map((row) => (
            <Box
              key={row.id}
              sx={{ border: 1, borderColor: "divider", borderRadius: 2, p: 2 }}
            >
              <Stack direction="row" gap={1} flexWrap="wrap">
                <Typography fontWeight={700}>{row.title}</Typography>
                <Chip size="small" label={uiText(row.status)} />
                <Chip size="small" label={uiText(row.visibility)} />
              </Stack>
              {row.kind === "KB" && (
                <SupportMarkdown text={row.data.body} />
              )}
              <Typography variant="caption">
                {row.key} · {uiText("Revision")} {formatUiNumber(row.version)}
              </Typography>
              {row.kind === "KB" && row.status === "PUBLISHED" && (
                <Stack direction="row" gap={1}>
                  <Button
                    disabled={helpful.isPending}
                    onClick={() => helpful.mutate({ id: row.id, value: true })}
                  >
                    {uiText("Helpful")}
                  </Button>
                  <Button
                    disabled={helpful.isPending}
                    onClick={() => helpful.mutate({ id: row.id, value: false })}
                  >
                    {uiText("Not helpful")}
                  </Button>
                </Stack>
              )}
              {admin && (
                <Stack direction="row" gap={1}>
                  <Button onClick={() => open(row.kind, row)}>
                    {uiText("Edit")}
                  </Button>
                  <Button onClick={() => setHistory(row.id)}>
                    {uiText("Revision history")}
                  </Button>
                </Stack>
              )}
            </Box>
          ))}
          {helpful.isSuccess && (
            <Alert severity="success">
              {uiText("Article feedback saved.")}
            </Alert>
          )}
        </Stack>
      )}
      {tab === "VIEW" && (
        <Stack spacing={2} sx={{ mt: 2 }}>
          <Button onClick={() => open("VIEW", null)}>
            {uiText("Create saved view")}
          </Button>
          {views.isError && (
            <Alert severity="error">{formatApiError(views.error)}</Alert>
          )}
          {views.data
            ?.filter((row) => row.status === "ACTIVE")
            .map((row) => (
              <Stack key={row.id} direction="row" gap={1}>
                <Button onClick={() => onView(row.data)}>{row.title}</Button>
                <Chip label={uiText(row.visibility)} />
                {(row.visibility === "PRIVATE" || admin) && (
                  <Button onClick={() => open("VIEW", row)}>
                    {uiText("Edit")}
                  </Button>
                )}
              </Stack>
            ))}
        </Stack>
      )}
      {tab === "PREFERENCE" && (
        <Stack spacing={2} sx={{ mt: 2 }}>
          <Alert severity="info">
            {uiText(
              "Portal notifications are available. Email preferences are recorded; automatic support email delivery is not enabled.",
            )}
          </Alert>
          <Button onClick={() => open("PREFERENCE", prefs.data?.[0] || null)}>
            {uiText("Edit notification preferences")}
          </Button>
        </Stack>
      )}
      {tab === "NOTIFICATION" && (
        <Stack spacing={1} sx={{ mt: 2 }}>
          {alerts.isError && (
            <Alert severity="error">{formatApiError(alerts.error)}</Alert>
          )}
          {alerts.data
            ?.filter((row) => row.status === "ACTIVE")
            .map((row) => (
              <Box key={row.id}>
                <Typography>{row.title}</Typography>
                <Button onClick={() => onTicket(row.data.ticketId)}>
                  {uiText("Open ticket")}
                </Button>
                <Button
                  disabled={read.isPending}
                  onClick={() => read.mutate(row.id)}
                >
                  {uiText("Mark read")}
                </Button>
              </Box>
            ))}
          {alerts.data?.every((row) => row.status !== "ACTIVE") && (
            <Typography>
              {uiText("No unread support notifications.")}
            </Typography>
          )}
        </Stack>
      )}
      {tab === "REPORT" && admin && (
        <Stack gap={2} sx={{ mt: 2 }}>
          <Button
            onClick={() => {
              void report.refetch();
              void queueHealth.refetch();
              void retention.refetch();
            }}
          >
            {uiText("Refresh reports")}
          </Button>
          {report.isError && (
            <Alert severity="error">{formatApiError(report.error)}</Alert>
          )}
          {report.data && (
            <>
              <Alert severity="info">
                {uiText(
                  "Recorded response times measure portal actions, not customer receipt. Missing samples are shown as unavailable. Reports cover up to the latest 5,000 tickets.",
                )}
              </Alert>
              <Stack direction="row" gap={1} flexWrap="wrap">
                <Chip
                  label={`${uiText("Tickets")}: ${formatUiNumber(report.data.sampleSize)}`}
                />
                <Chip
                  label={`${uiText("Backlog")}: ${formatUiNumber(report.data.backlog)}`}
                />
                <Chip
                  label={`${uiText("Reopened")}: ${formatUiNumber(report.data.reopened)}`}
                />
                <Chip
                  label={`${uiText("Requester confirmations")}: ${formatUiNumber(report.data.requesterConfirmed)}`}
                />
                <Chip
                  label={`${uiText("CSAT average")}: ${report.data.csat.average == null ? uiText("Unavailable") : formatUiNumber(report.data.csat.average)} (${formatUiNumber(report.data.csat.responses)})`}
                />
              </Stack>
              {report.data.limited && (
                <Alert severity="warning">
                  {uiText(
                    "Report limit reached. Counts describe the displayed sample.",
                  )}
                </Alert>
              )}
              {(["statuses", "categories", "priorities"] as const).map(
                (group) => (
                  <Box key={group}>
                    <Typography fontWeight={700}>
                      {uiText(
                        group === "statuses"
                          ? "Status distribution"
                          : group === "categories"
                            ? "Category distribution"
                            : "Priority distribution",
                      )}
                    </Typography>
                    <Stack direction="row" gap={1} flexWrap="wrap">
                      {Object.entries(
                        report.data[group] as Record<string, number>,
                      ).map(([key, count]) => (
                        <Chip
                          key={key}
                          label={`${uiText(key)}: ${formatUiNumber(count)}`}
                        />
                      ))}
                    </Stack>
                  </Box>
                ),
              )}
              {(
                [
                  "recordedResponseMinutes",
                  "recordedResolutionMinutes",
                ] as const
              ).map((key) => (
                <Typography key={key}>
                  {uiText(
                    key === "recordedResponseMinutes"
                      ? "Recorded first response (minutes)"
                      : "Recorded resolution (minutes)",
                  )}
                  : p50{" "}
                  {report.data[key].p50 == null
                    ? "—"
                    : formatUiNumber(report.data[key].p50)}{" "}
                  · p90{" "}
                  {report.data[key].p90 == null
                    ? "—"
                    : formatUiNumber(report.data[key].p90)}{" "}
                  · p99{" "}
                  {report.data[key].p99 == null
                    ? "—"
                    : formatUiNumber(report.data[key].p99)}{" "}
                  · {uiText("Samples")}{" "}
                  {formatUiNumber(report.data[key].samples)}
                </Typography>
              ))}
              <Typography>
                {uiText("SLA policies applied")}:{" "}
                {formatUiNumber(report.data.sla.configured)} ·{" "}
                {uiText("Response breaches")}:{" "}
                {formatUiNumber(report.data.sla.responseBreaches)} ·{" "}
                {uiText("Resolution breaches")}:{" "}
                {formatUiNumber(report.data.sla.resolutionBreaches)}
              </Typography>
              <Typography variant="subtitle1">
                {uiText("Ticket volume by UTC day")}
              </Typography>
              <Box sx={{ maxHeight: 180, overflow: "auto" }}>
                {Object.entries(
                  report.data.volumeByUtcDay as Record<string, number>,
                )
                  .sort(([a], [b]) => b.localeCompare(a))
                  .map(([day, count]) => (
                    <Stack
                      key={day}
                      direction="row"
                      gap={2}
                      alignItems="center"
                    >
                      <Typography variant="caption" sx={{ minWidth: 90 }}>
                        {day}
                      </Typography>
                      <Box
                        role="img"
                        aria-label={`${day}: ${formatUiNumber(count)}`}
                        sx={{
                          height: 8,
                          width: `${Math.min(100, (count / Math.max(1, ...(Object.values(report.data.volumeByUtcDay) as number[]))) * 100)}%`,
                          bgcolor: "primary.main",
                        }}
                      />
                      <Typography variant="caption">
                        {formatUiNumber(count)}
                      </Typography>
                    </Stack>
                  ))}
              </Box>
            </>
          )}
          <Divider />
          <Typography variant="h6">{uiText("Queue health")}</Typography>
          {queueHealth.data?.map((queue) => (
            <Typography key={queue.key}>
              {queue.title} · {uiText("Open")}: {formatUiNumber(queue.open)} ·{" "}
              {uiText("Total")}: {formatUiNumber(queue.total)} ·{" "}
              {uiText("Oldest open")}:{" "}
              {queue.oldestOpenAt
                ? new Date(queue.oldestOpenAt).toLocaleString(uiDateLocale())
                : "—"}
            </Typography>
          ))}
          {retention.data?.configured && (
            <Alert severity="warning">
              {uiText(
                "Retention candidates require owner review. No automatic deletion is performed.",
              )}
              : {formatUiNumber(retention.data.candidates)}
            </Alert>
          )}
        </Stack>
      )}
      <Dialog
        open={editing !== undefined}
        onClose={() => {
          if (!save.isPending) setEditing(undefined);
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {uiText(labels[kind] || "Support configuration")}
        </DialogTitle>
        <DialogContent>
          <Stack
            component="form"
            id="support-resource-form"
            gap={2}
            sx={{ pt: 1 }}
            onSubmit={(event) => {
              event.preventDefault();
              save.mutate();
            }}
          >
            <TextField
              required
              disabled={!!editing || save.isPending || kind === "PREFERENCE"}
              label={uiText("Configuration key")}
              value={form.key}
              onChange={(event) =>
                setForm({ ...form, key: event.target.value })
              }
              slotProps={{
                htmlInput: { pattern: "[a-zA-Z0-9_-]{1,60}", maxLength: 60 },
              }}
            />
            <TextField
              required
              label={uiText("Title")}
              value={form.title}
              disabled={save.isPending}
              onChange={(event) =>
                setForm({ ...form, title: event.target.value })
              }
              slotProps={{ htmlInput: { minLength: 3, maxLength: 160 } }}
            />
            <TextField
              select
              label={uiText("Visibility")}
              value={form.visibility}
              disabled={
                save.isPending || !!editing || kind === "PREFERENCE" || !admin
              }
              onChange={(event) =>
                setForm({ ...form, visibility: event.target.value })
              }
            >
              {(kind === "PREFERENCE"
                ? ["PRIVATE"]
                : kind === "VIEW"
                  ? admin
                    ? ["PRIVATE", "TEAM"]
                    : ["PRIVATE"]
                  : ["KB", "MACRO", "CATEGORY", "QUEUE"].includes(kind)
                    ? ["PUBLIC", "TEAM"]
                    : ["TEAM"]
              ).map((value) => (
                <MenuItem value={value} key={value}>
                  {uiText(value)}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label={uiText("Publication status")}
              value={form.status}
              disabled={save.isPending}
              onChange={(event) =>
                setForm({ ...form, status: event.target.value })
              }
            >
              {(kind === "KB"
                ? ["DRAFT", "PUBLISHED", "ARCHIVED"]
                : ["ACTIVE", "ARCHIVED"]
              ).map((value) => (
                <MenuItem key={value} value={value}>
                  {uiText(value)}
                </MenuItem>
              ))}
            </TextField>
            {Object.entries(form.data)
              .filter(
                ([key]) =>
                  ![
                    "members",
                    "fields",
                    "weekdays",
                    "holidays",
                    "startMinute",
                    "endMinute",
                    "preserveAudit",
                    "mode",
                  ].includes(key),
              )
              .map(([key, value]) =>
                typeof value === "boolean" ? (
                  <FormControlLabel
                    key={key}
                    control={
                      <Checkbox
                        checked={value}
                        disabled={save.isPending}
                        onChange={(event) => field(key, event.target.checked)}
                      />
                    }
                    label={uiText(inputLabels[key] || key)}
                  />
                ) : (
                  <TextField
                    key={key}
                    label={uiText(inputLabels[key] || key)}
                    value={value ?? ""}
                    select={!!choices[key]}
                    type={typeof value === "number" ? "number" : "text"}
                    multiline={key === "body"}
                    minRows={key === "body" ? 6 : undefined}
                    disabled={save.isPending}
                    onChange={(event) =>
                      field(
                        key,
                        typeof value === "number"
                          ? Number(event.target.value)
                          : event.target.value,
                      )
                    }
                  >
                    {choices[key]?.filter(choice=>key!=='priority'?true:kind==='RULE'?choice!=='ALL':kind==='VIEW'?choice!=='*':!['ALL','*'].includes(choice)).map((choice) => (
                      <MenuItem key={choice} value={choice}>
                        {uiText(choice)}
                      </MenuItem>
                    ))}
                  </TextField>
                ),
              )}
            {kind === "QUEUE" && (
              <TextField
                select
                label={uiText("Queue members")}
                SelectProps={{ multiple: true }}
                value={form.data.members || []}
                onChange={(event) => field("members", event.target.value)}
              >
                {agents.data?.map((agent) => (
                  <MenuItem key={agent.id} value={agent.id}>
                    {agent.username}
                  </MenuItem>
                ))}
              </TextField>
            )}
            {kind === "CALENDAR" && (
              <>
                <Typography>{uiText("Working days")}</Typography>
                <Stack direction="row" flexWrap="wrap">
                  {[
                    "Sunday",
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                  ].map((day, index) => (
                    <FormControlLabel
                      key={day}
                      control={
                        <Checkbox
                          checked={(form.data.weekdays || []).includes(index)}
                          onChange={(event) =>
                            field(
                              "weekdays",
                              event.target.checked
                                ? [...form.data.weekdays, index]
                                : form.data.weekdays.filter(
                                    (v: number) => v !== index,
                                  ),
                            )
                          }
                        />
                      }
                      label={uiText(day)}
                    />
                  ))}
                </Stack>
                {["startMinute", "endMinute"].map((key) => (
                  <TextField
                    key={key}
                    label={uiText(
                      key === "startMinute"
                        ? "Business day start"
                        : "Business day end",
                    )}
                    type="time"
                    value={`${String(Math.floor(form.data[key] / 60)).padStart(2, "0")}:${String(form.data[key] % 60).padStart(2, "0")}`}
                    onChange={(event) => {
                      const [h, m] = event.target.value.split(":").map(Number);
                      field(key, h * 60 + m);
                    }}
                  />
                ))}
                <TextField
                  label={uiText("Holiday dates, one YYYY-MM-DD per line")}
                  multiline
                  value={(form.data.holidays || []).join("\n")}
                  onChange={(event) =>
                    field(
                      "holidays",
                      event.target.value.split("\n").filter(Boolean),
                    )
                  }
                />
              </>
            )}
            {kind === "CATEGORY" && (
              <>
                <Typography>{uiText("Custom fields")}</Typography>
                {(form.data.fields || []).map((item: any, index: number) => (
                  <Stack key={index} gap={1}>
                    <TextField
                      label={uiText("Field key")}
                      value={item.key}
                      onChange={(event) =>
                        field(
                          "fields",
                          form.data.fields.map((f: any, i: number) =>
                            i === index ? { ...f, key: event.target.value } : f,
                          ),
                        )
                      }
                    />
                    <TextField
                      label={uiText("Field label")}
                      value={item.label}
                      onChange={(event) =>
                        field(
                          "fields",
                          form.data.fields.map((f: any, i: number) =>
                            i === index
                              ? { ...f, label: event.target.value }
                              : f,
                          ),
                        )
                      }
                    />
                    <TextField
                      select
                      label={uiText("Field type")}
                      value={item.type}
                      onChange={(event) =>
                        field(
                          "fields",
                          form.data.fields.map((f: any, i: number) =>
                            i === index
                              ? { ...f, type: event.target.value }
                              : f,
                          ),
                        )
                      }
                    >
                      {["TEXT", "NUMBER", "BOOLEAN"].map((type) => (
                        <MenuItem key={type} value={type}>
                          {uiText(type)}
                        </MenuItem>
                      ))}
                    </TextField>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={item.required}
                          onChange={(event) =>
                            field(
                              "fields",
                              form.data.fields.map((f: any, i: number) =>
                                i === index
                                  ? { ...f, required: event.target.checked }
                                  : f,
                              ),
                            )
                          }
                        />
                      }
                      label={uiText("Required")}
                    />
                    <Button
                      onClick={() =>
                        field(
                          "fields",
                          form.data.fields.filter(
                            (_: any, i: number) => i !== index,
                          ),
                        )
                      }
                    >
                      {uiText("Remove field")}
                    </Button>
                  </Stack>
                ))}
                <Button
                  disabled={(form.data.fields || []).length >= 20}
                  onClick={() =>
                    field("fields", [
                      ...form.data.fields,
                      { key: "", label: "", type: "TEXT", required: false },
                    ])
                  }
                >
                  {uiText("Add field")}
                </Button>
              </>
            )}
            {(kind === "MACRO" || kind === "TEMPLATE") && (
              <Alert severity="info">
                {uiText(
                  "Available variables: {{requester.name}}, {{ticket.id}}, {{ticket.subject}}. Inserting a response never sends it automatically.",
                )}
              </Alert>
            )}
            {kind === "SLA" && (
              <Alert severity="info">
                {uiText(
                  "Policies are snapshotted on new tickets. Changing this policy does not rewrite historical targets. Delivery evidence remains separate.",
                )}
              </Alert>
            )}
            <TextField
              required
              label={uiText("Reason for this revision")}
              value={form.reason}
              multiline
              disabled={save.isPending}
              onChange={(event) =>
                setForm({ ...form, reason: event.target.value })
              }
              slotProps={{ htmlInput: { minLength: 5, maxLength: 500 } }}
            />
            {save.isError && (
              <Alert severity="error">{formatApiError(save.error)}</Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            disabled={save.isPending}
            onClick={() => setEditing(undefined)}
          >
            {uiText("Cancel")}
          </Button>
          <Button
            type="submit"
            form="support-resource-form"
            disabled={save.isPending || form.reason.trim().length < 5}
          >
            {uiText("Save revision")}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={!!history}
        onClose={() => setHistory(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{uiText("Revision history")}</DialogTitle>
        <DialogContent>
          <Stack gap={2}>
            {revisions.isError && (
              <Alert severity="error">{formatApiError(revisions.error)}</Alert>
            )}
            {revisions.data?.map((row) => (
              <Box key={row.id}>
                <Typography fontWeight={700}>
                  {uiText("Revision")} {formatUiNumber(row.version)} ·{" "}
                  {row.actorUsername}
                </Typography>
                <Typography>
                  {new Date(row.createdAt).toLocaleString(uiDateLocale())}
                </Typography>
                <Typography>{row.reason}</Typography>
              </Box>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistory(null)}>{uiText("Close")}</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
