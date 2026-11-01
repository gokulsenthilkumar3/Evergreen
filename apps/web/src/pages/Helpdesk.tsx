import {
  uiText,
  useUiLanguage,
  uiLocale,
  uiTemplate,
  uiScopedTemplate,
} from "../i18n";
import { useEffect, useRef, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  Checkbox,
} from "@mui/material";
import { ExpandMore, Refresh, SupportAgent } from "@mui/icons-material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../utils/api";
import { getStoredUser } from "../utils/authStorage";
import StaffAssistant from "../components/StaffAssistant";
import HelpdeskTicketInspector from "../components/HelpdeskTicketInspector";
import HelpdeskOperationsPanel from "../components/HelpdeskOperationsPanel";
import {
  HelpdeskBulkActions,
  HelpdeskImport,
} from "../components/HelpdeskBulkImport";
import { tableToCSV } from "../utils/csvGenerator";

type Ticket = {
  id: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  createdBy: string;
  resolution?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  proof?:string;
};
const initialForm = {
  subject: "",
  description: "",
  category: "QUESTION",
  priority: "NORMAL",
};
const categories = {
  BUG: "Bug report",
  QUESTION: "Workflow question",
  ACCESS: "Access and activation",
  INTEGRATION: "Integrations",
  BILLING: "Billing question",
  DATA: "Data issue",
};
const faqs = [
  [
    "How do I create an invoice?",
    "Open Business Desk, choose Invoices, select a saved customer and catalogue items, then review the quantities, prices, taxes and issuer details before saving. Download the PDF from the saved invoice.",
  ],
  [
    "How do I import customers or products?",
    "An administrator can open Migration & integrations, download the CSV template, map columns and inspect every preview issue before confirming. Check import history after submission.",
  ],
  [
    "Does Tally export post automatically?",
    "No. Select dates and voucher types in Migration & integrations, preview the summary and download XML. Review and import it into the correct Tally company. The connection check is read-only.",
  ],
  [
    "How do I recover access or renew activation?",
    "Use Forgot password on the sign-in page. Accounts with MFA still require an authenticator or unused recovery code. If neither is available, contact your installation administrator. Expired installations need a valid owner-signed activation. Never put passwords, owner keys or recovery codes in tickets.",
  ],
  [
    "Who can see my support ticket?",
    "You can see your tickets and public replies. Installation administrators can see the queue and private administrator notes. Tickets and replies are saved on this installation; they are not emailed or sent to an external support service.",
  ],
  [
    "Can the AI assistant modify my records?",
    "No. Loom provides guidance using only the conversation you choose to send to Groq. It has no tools to query balances, change records, issue licences or execute commands. Verify its advice before acting.",
  ],
];
const failureMessage = (failure: unknown) => {
  const message = (failure as { response?: { data?: { message?: unknown } } })
    ?.response?.data?.message;
  return typeof message === "string"
    ? message
    : Array.isArray(message)
      ? message.join(". ")
      : "The request could not be completed. Check the connection and retry.";
};
export default function Helpdesk() {
  useUiLanguage();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(initialForm);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [queueFilter, setQueueFilter] = useState(""),
    [priorityFilter, setPriorityFilter] = useState("ALL"),
    [assignmentFilter, setAssignmentFilter] = useState("ALL");
  const [notice, setNotice] = useState("");
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [status, setStatus] = useState("OPEN");
  const [resolution, setResolution] = useState("");
  const linkedTicket = () => {
    const match = window.location.pathname.match(
      /^\/helpdesk\/tickets\/([^/]+)$/,
    );
    try {
      return match ? decodeURIComponent(match[1]) : null;
    } catch {
      return null;
    }
  };
  const [inspectedId, setInspectedId] = useState<string | null>(linkedTicket);
  useEffect(() => {
    const pop = () => setInspectedId(linkedTicket());
    window.addEventListener("popstate", pop);
    return () => window.removeEventListener("popstate", pop);
  }, []);
  const [cursor, setCursor] = useState<string | null>(null),
    [previousCursors, setPreviousCursors] = useState<(string | null)[]>([]);
  const [selectedTickets, setSelectedTickets] = useState<
    Record<string, number>
  >({});
  const resetPage = () => {
    setCursor(null);
    setPreviousCursors([]);
  };
  const request = useRef<{ json: string; key: string } | null>(null);
  const submitting = useRef(false);
  const [drafts] = useState<
    { id: string; subject: string; description: string }[]
  >(() => {
    try {
      const value = JSON.parse(
        localStorage.getItem("evergreen_helpdesk_tickets") || "[]",
      );
      return Array.isArray(value)
        ? value.filter(
            (item) =>
              typeof item.subject === "string" &&
              typeof item.description === "string",
          )
        : [];
    } catch {
      return [];
    }
  });
  let role = "VIEWER";
  let username = "";
  try {
    username =
      (JSON.parse(getStoredUser() || "{}") as { username?: string }).username ||
      "";
    role =
      (JSON.parse(getStoredUser() || "{}") as { role?: string }).role || role;
  } catch {
    /* Server authorizes every operation. */
  }
  const tickets = useQuery<
    Ticket[] | { items: Ticket[]; nextCursor: string | null; total: number }
  >({
    queryKey: [
      "helpdesk-tickets",
      username,
      role,
      search,
      filter,
      cursor,
      queueFilter,
      priorityFilter,
      assignmentFilter,
    ],
    queryFn: async ({ signal }) =>
      (
        await api.get("/helpdesk/queue", {
          signal,
          params: {
            q: search,
            status: filter,
            cursor: cursor || undefined,
            limit: 25,
            queue: queueFilter || undefined,
            priority: priorityFilter,
            assignment: assignmentFilter,
          },
        })
      ).data,
    refetchInterval: 30000,
  });
  const queueOptions = useQuery<any[]>({
    queryKey: ["helpdesk-queue-options", username, role],
    queryFn: async () => (await api.get("/helpdesk/resources/QUEUE")).data,
  });
  const categoryOptions = useQuery<any[]>({
    queryKey: ["helpdesk-category-options", username, role],
    queryFn: async () => (await api.get("/helpdesk/resources/CATEGORY")).data,
  });
  const create = useMutation({
    mutationFn: async () => {
      const body = {
        ...form,
        subject: form.subject.trim(),
        description: form.description.trim(),
      };
      const json = JSON.stringify(body);
      if (!request.current || request.current.json !== json)
        request.current = { json, key: crypto.randomUUID() };
      return (
        await api.post("/helpdesk/tickets", {
          ...body,
          requestKey: request.current.key,
        })
      ).data as Ticket;
    },
    onSuccess: (ticket) => {
      setNotice(
        uiTemplate`Ticket ${ticket.id} saved to this installation. An administrator can now review it.`,
      );
      setForm(initialForm);
      request.current = null;
      void queryClient.invalidateQueries({ queryKey: ["helpdesk-tickets"] });
    },
  });
  const update = useMutation({
    mutationFn: async () =>
      api.patch(`/helpdesk/tickets/${selected!.id}`, {
        status,
        resolution,
        version: selected!.version,
      }),
    onSuccess: () => {
      setSelected(null);
      void queryClient.invalidateQueries({ queryKey: ["helpdesk-tickets"] });
    },
  });
  const rows = Array.isArray(tickets.data)
    ? tickets.data
    : tickets.data?.items || [];
  const total = Array.isArray(tickets.data)
    ? tickets.data.length
    : tickets.data?.total || 0;
  const nextCursor = Array.isArray(tickets.data)
    ? null
    : tickets.data?.nextCursor;
  const visible = rows.filter((ticket) => true);
  return (
    <Box sx={{ width: "100%" }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 4 },
          mb: 3,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 4,
          background:
            "linear-gradient(125deg, rgba(32,122,88,.13), rgba(69,134,172,.06))",
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <SupportAgent color="primary" sx={{ fontSize: 38 }} />
          <Box>
            <Typography variant="overline" color="primary">
              {uiText("EVERGREEN / SUPPORT ")}
            </Typography>
            <Typography variant="h4" fontWeight={750}>
              {uiText("Helpdesk ")}
            </Typography>
          </Box>
        </Stack>
        <Typography color="text.secondary" sx={{ mt: 2, maxWidth: 760 }}>
          {uiText(
            "Find a workflow answer, ask Loom, or send an issue to your installation administrator. Track the response here. External support delivery and response times are not configured. ",
          )}
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 2 }}>
          {[
            [
              "In queue",
              rows.filter((row) => !["RESOLVED", "CLOSED"].includes(row.status))
                .length,
            ],
            [
              "Resolved",
              rows.filter((row) => row.status === "RESOLVED").length,
            ],
            ["Visible tickets", rows.length],
          ].map(([label, count]) => (
            <Chip
              key={label}
              label={uiTemplate`${label}: ${count}`}
              variant="outlined"
            />
          ))}
        </Stack>
      </Paper>
      <HelpdeskOperationsPanel
        username={username}
        role={role}
        onTicket={setInspectedId}
        onView={(view) => {
          setSearch(view.q || "");
          setFilter(view.status || "ALL");
          setQueueFilter(view.queue || "");
          setPriorityFilter(view.priority || "ALL");
          setAssignmentFilter(view.assignment || "ALL");
          resetPage();
        }}
      />
      {notice && (
        <Alert severity="success" onClose={() => setNotice("")} sx={{ mb: 2 }}>
          {notice}
        </Alert>
      )}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              gap={2}
              justifyContent="space-between"
            >
              <Box>
                <Typography variant="h6" fontWeight={750}>
                  {role === "ADMIN"
                    ? uiText("Installation queue")
                    : uiText("Your tickets")}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {uiText(
                    "Search covers all visible tickets. Pages contain up to 25 tickets and refresh every 30 seconds.",
                  )}{" "}
                  {uiText("Matching tickets")}: {total}
                </Typography>
              </Box>
              <Button
                startIcon={<Refresh />}
                onClick={() => void tickets.refetch()}
                disabled={tickets.isFetching}
              >
                {uiText("Refresh ")}
              </Button>
            </Stack>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              gap={2}
              sx={{ my: 2 }}
            >
              <TextField
                label={uiText("Search tickets", "forms")}
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  resetPage();
                }}
                size="small"
                fullWidth
              />
              <TextField
                select
                label={uiText("Status", "forms")}
                value={filter}
                onChange={(event) => {
                  setFilter(event.target.value);
                  resetPage();
                }}
                size="small"
                sx={{ minWidth: 170 }}
              >
                {[
                  "ALL",
                  "OPEN",
                  "IN_PROGRESS",
                  "PENDING",
                  "ON_HOLD",
                  "RESOLVED",
                  "CLOSED",
                  "REOPENED",
                ].map((value) => (
                  <MenuItem value={value} key={value}>
                    {uiText(value)}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mb: 2 }}>
              <TextField
                select
                size="small"
                label={uiText("Queue filter")}
                value={queueFilter}
                onChange={(event) => {
                  setQueueFilter(event.target.value);
                  resetPage();
                }}
                sx={{ minWidth: 150 }}
              >
                <MenuItem value="">{uiText("All queues")}</MenuItem>
                {[
                  ...new Map([
                    ...["TRIAGE", "TECHNICAL", "ACCESS", "BILLING"].map(
                      (key) => [key, uiText(key)] as [string, string],
                    ),
                    ...(queueOptions.data || [])
                      .filter(
                        (row) =>
                          row.kind === "QUEUE" && row.status === "ACTIVE",
                      )
                      .map((row) => [row.key, row.title] as [string, string]),
                  ]).entries(),
                ].map(([key, label]) => (
                  <MenuItem key={key} value={key}>
                    {label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                size="small"
                label={uiText("Priority filter")}
                value={priorityFilter}
                onChange={(event) => {
                  setPriorityFilter(event.target.value);
                  resetPage();
                }}
                sx={{ minWidth: 130 }}
              >
                {["ALL", "LOW", "NORMAL", "HIGH", "URGENT"].map((value) => (
                  <MenuItem key={value} value={value}>
                    {uiText(value)}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                size="small"
                label={uiText("Assignment filter")}
                value={assignmentFilter}
                onChange={(event) => {
                  setAssignmentFilter(event.target.value);
                  resetPage();
                }}
                sx={{ minWidth: 160 }}
              >
                {["ALL", "MINE", "UNASSIGNED"].map((value) => (
                  <MenuItem key={value} value={value}>
                    {uiText(value)}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mb: 2 }}>
              <Button
                disabled={!rows.length}
                onClick={() =>
                  tableToCSV(
                    [
                      "id",
                      "subject",
                      "category",
                      "priority",
                      "status",
                      "requester",
                      "createdAt",
                    ],
                    rows.map((row) => [
                      row.id,
                      row.subject,
                      row.category,
                      row.priority,
                      row.status,
                      row.createdBy,
                      row.createdAt,
                    ]),
                    "helpdesk-current-page",
                  )
                }
              >
                {uiText("Export this page as CSV")}
              </Button>
              {role === "ADMIN" && (
                <>
                  <HelpdeskImport />
                  <HelpdeskBulkActions
                    tickets={Object.entries(selectedTickets).map(
                      ([id, version]) => ({ id, version }),
                    )}
                    onDone={() => setSelectedTickets({})}
                  />
                </>
              )}
            </Stack>
            {tickets.isPending && (
              <Typography role="status">
                {uiText("Loading your queue...")}
              </Typography>
            )}
            {tickets.isError && (
              <Alert severity="error">
                {failureMessage(tickets.error)}{" "}
                <Button onClick={() => void tickets.refetch()}>
                  {uiText("Retry")}
                </Button>
              </Alert>
            )}
            {!tickets.isPending && !tickets.isError && !visible.length && (
              <Box sx={{ p: 4, textAlign: "center" }}>
                <Typography fontWeight={700}>
                  {rows.length
                    ? uiText("No matching tickets")
                    : uiText("No tickets yet")}
                </Typography>
                <Typography color="text.secondary">
                  {rows.length
                    ? uiText("Try another search or status.")
                    : uiText(
                        "Use the issue form when you need an administrator to review something.",
                      )}
                </Typography>
              </Box>
            )}
            <Stack gap={1.5}>
              {visible.map((ticket) => (
                <Paper
                  key={ticket.id}
                  variant="outlined"
                  sx={{ p: 2, borderRadius: 2 }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    gap={1}
                  >
                    <Typography
                      fontWeight={750}
                      sx={{ overflowWrap: "anywhere" }}
                    >
                      {role === "ADMIN" && (
                        <Checkbox
                          inputProps={{
                            "aria-label": `${uiText("Select ticket")} ${ticket.subject}`,
                          }}
                          checked={ticket.id in selectedTickets}
                          disabled={
                            !(ticket.id in selectedTickets) &&
                            Object.keys(selectedTickets).length >= 50
                          }
                          onChange={(event) =>
                            setSelectedTickets((previous) => {
                              const next = { ...previous };
                              if (event.target.checked)
                                next[ticket.id] = ticket.version;
                              else delete next[ticket.id];
                              return next;
                            })
                          }
                        />
                      )}
                      {ticket.subject}
                    </Typography>
                    <Chip
                      size="small"
                      color={
                        ["RESOLVED", "CLOSED"].includes(ticket.status)
                          ? "warning"
                          : "default"
                      }
                      label={uiText(ticket.status)}
                    />
                    {ticket.proof&&<Chip size="small" variant="outlined" color={ticket.proof==='verified'?'success':ticket.proof==='failed'?'error':'warning'} label={uiText(({recorded:'Recorded',requested:'Resolution awaiting confirmation',verified:'Requester confirmed fixed',failed:'Requester reported still broken',stale:'Closed without confirmation for 14 days'} as Record<string,string>)[ticket.proof]||'Recorded')}/>}
                  </Stack>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      my: 1,
                      whiteSpace: "pre-wrap",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {ticket.description}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {ticket.id} /{" "}
                    {new Date(ticket.updatedAt).toLocaleString(uiLocale())} /{" "}
                    {ticket.createdBy} / {uiText(ticket.priority)}
                  </Typography>
                  {ticket.resolution && (
                    <Alert severity="info" sx={{ mt: 1 }}>
                      {uiText("Proposed resolution:")} {ticket.resolution}
                    </Alert>
                  )}
                  <Button
                    size="small"
                    onClick={() => setInspectedId(ticket.id)}
                  >
                    {uiText("Open conversation and proof")}
                  </Button>
                  {role === "ADMIN" && (
                    <Box sx={{ mt: 1 }}>
                      <Button
                        size="small"
                        onClick={() => {
                          setSelected(ticket);
                          setStatus(ticket.status);
                          setResolution(ticket.resolution || "");
                          update.reset();
                        }}
                      >
                        {uiText("Update status ")}
                      </Button>
                    </Box>
                  )}
                </Paper>
              ))}
            </Stack>
            <Stack
              direction="row"
              justifyContent="space-between"
              sx={{ mt: 2 }}
            >
              <Button
                disabled={!previousCursors.length || tickets.isFetching}
                onClick={() => {
                  setCursor(previousCursors[previousCursors.length - 1]);
                  setPreviousCursors((previous) => previous.slice(0, -1));
                }}
              >
                {uiText("Previous page")}
              </Button>
              <Button
                disabled={!nextCursor || tickets.isFetching}
                onClick={() => {
                  setPreviousCursors((previous) => [...previous, cursor]);
                  setCursor(nextCursor || null);
                }}
              >
                {uiText("Next page")}
              </Button>
            </Stack>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper
            component="form"
            variant="outlined"
            sx={{ p: 3, borderRadius: 3 }}
            onSubmit={async (event) => {
              event.preventDefault();
              if (submitting.current) return;
              submitting.current = true;
              try {
                await create.mutateAsync();
              } catch {
                /* Mutation error remains visible. */
              } finally {
                submitting.current = false;
              }
            }}
          >
            <Typography variant="h6" fontWeight={750}>
              {uiText("Report an issue ")}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ my: 1 }}>
              {uiText(
                "Include the page, steps, expected result and actual result. Keep credentials and customer personal data out. ",
              )}
            </Typography>
            <Stack gap={2} sx={{ mt: 2 }}>
              <TextField
                label={uiText("Subject", "forms")}
                value={form.subject}
                onChange={(event) =>
                  setForm({ ...form, subject: event.target.value })
                }
                required
                inputProps={{ minLength: 3, maxLength: 160 }}
                disabled={create.isPending}
              />
              <TextField
                select
                label={uiText("Category", "forms")}
                value={form.category}
                onChange={(event) =>
                  setForm({ ...form, category: event.target.value })
                }
                disabled={create.isPending}
              >
                {[
                  ...Object.entries(categories),
                  ...(categoryOptions.data || [])
                    .filter(
                      (row) =>
                        row.kind === "CATEGORY" &&
                        row.status === "ACTIVE" &&
                        !Object.hasOwn(categories, row.key),
                    )
                    .map((row) => [row.key, row.title] as [string, string]),
                ].map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {uiText(label, "forms")}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label={uiText("Priority", "forms")}
                value={form.priority}
                onChange={(event) =>
                  setForm({ ...form, priority: event.target.value })
                }
                disabled={create.isPending}
              >
                {["LOW", "NORMAL", "HIGH", "URGENT"].map((value) => (
                  <MenuItem key={value} value={value}>
                    {uiText(value)}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label={uiText("What happened?", "forms")}
                multiline
                minRows={5}
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
                required
                inputProps={{ minLength: 10, maxLength: 4000 }}
                helperText={uiScopedTemplate(
                  "forms",
                )`${form.description.length}/4000 characters`}
                disabled={create.isPending}
              />
              {create.isError && (
                <Alert severity="error">
                  {failureMessage(create.error)}{" "}
                  {uiText(" Your text is preserved for retry. ")}
                </Alert>
              )}
              <Button
                type="submit"
                variant="contained"
                disabled={
                  create.isPending ||
                  form.subject.trim().length < 3 ||
                  form.description.trim().length < 10
                }
              >
                {create.isPending
                  ? uiText("Saving ticket...")
                  : uiText("Save ticket to installation")}
              </Button>
            </Stack>
            {drafts.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2">
                  {uiText("Previous browser drafts ")}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {uiText(
                    "These were never submitted. Select one to review before sending; the original draft is kept. ",
                  )}
                </Typography>
                {drafts.map((draft, index) => (
                  <Button
                    key={`${draft.id}-${index}`}
                    size="small"
                    disabled={create.isPending}
                    onClick={() =>
                      setForm({
                        ...initialForm,
                        subject: draft.subject.slice(0, 160),
                        description: draft.description.slice(0, 4000),
                      })
                    }
                  >
                    {draft.subject}
                  </Button>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" fontWeight={750} sx={{ mb: 2 }}>
          {uiText("Quick answers ")}
        </Typography>
        {faqs.map(([question, answer]) => (
          <Accordion key={question} disableGutters>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography fontWeight={650}>{uiText(question)}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography color="text.secondary">{uiText(answer)}</Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
      <Box sx={{ mt: 4 }}>
        <StaffAssistant />
      </Box>
      <Dialog
        open={!!selected}
        onClose={() => {
          if (!update.isPending) setSelected(null);
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{uiText("Update ticket")}</DialogTitle>
        <DialogContent>
          <Stack gap={2} sx={{ pt: 1 }}>
            <TextField
              select
              label={uiText("Ticket status", "forms")}
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              disabled={update.isPending}
            >
              {[
                "OPEN",
                "IN_PROGRESS",
                "PENDING",
                "ON_HOLD",
                "RESOLVED",
                "CLOSED",
                "REOPENED",
              ].map((value) => (
                <MenuItem key={value} value={value}>
                  {uiText(value)}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label={uiText("Resolution or progress note", "forms")}
              multiline
              minRows={3}
              value={resolution}
              onChange={(event) => setResolution(event.target.value)}
              inputProps={{ maxLength: 2000 }}
              disabled={update.isPending}
              required
            />
            {update.isError && (
              <Alert severity="error">{failureMessage(update.error)}</Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button disabled={update.isPending} onClick={() => setSelected(null)}>
            {uiText("Cancel ")}
          </Button>
          <Button
            disabled={update.isPending || !resolution.trim()}
            onClick={() => update.mutate()}
          >
            {update.isPending ? uiText("Saving...") : uiText("Save update")}
          </Button>
        </DialogActions>
      </Dialog>
      {inspectedId && (
        <HelpdeskTicketInspector
          key={inspectedId}
          id={inspectedId}
          username={username}
          role={role}
          onClose={() => {
            setInspectedId(null);
            if (window.location.pathname.startsWith("/helpdesk/tickets/"))
              window.history.replaceState(null, "", "/helpdesk");
          }}
        />
      )}
    </Box>
  );
}
