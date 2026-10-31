import { useRef, useState } from "react";
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
} from "@mui/material";
import { ExpandMore, Refresh, SupportAgent } from "@mui/icons-material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../utils/api";
import { getStoredUser } from "../utils/authStorage";
import StaffAssistant from "../components/StaffAssistant";

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
    "For password or MFA problems, contact your installation administrator. Expired installations need a valid owner-signed activation. A company subscription record alone does not issue a cryptographic licence. Never put passwords, owner keys or recovery codes in tickets.",
  ],
  [
    "Who can see my support ticket?",
    "You can see tickets you submitted. Installation administrators can see and update the queue. Tickets are saved on this installation; they are not emailed or sent to an external support service.",
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
  const queryClient = useQueryClient();
  const [form, setForm] = useState(initialForm);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [notice, setNotice] = useState("");
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [status, setStatus] = useState("OPEN");
  const [resolution, setResolution] = useState("");
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
  try {
    role =
      (JSON.parse(getStoredUser() || "{}") as { role?: string }).role || role;
  } catch {
    /* Server authorizes every operation. */
  }
  const tickets = useQuery<Ticket[]>({
    queryKey: ["helpdesk-tickets"],
    queryFn: async () => (await api.get("/helpdesk/tickets")).data,
    refetchInterval: 30000,
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
        `Ticket ${ticket.id} saved to this installation. An administrator can now review it.`,
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
  const rows = tickets.data || [];
  const visible = rows.filter(
    (ticket) =>
      (filter === "ALL" || ticket.status === filter) &&
      `${ticket.subject} ${ticket.description} ${ticket.id}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
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
              EVERGREEN / SUPPORT
            </Typography>
            <Typography variant="h4" fontWeight={750}>
              Helpdesk
            </Typography>
          </Box>
        </Stack>
        <Typography color="text.secondary" sx={{ mt: 2, maxWidth: 760 }}>
          Find a workflow answer, ask Loom, or send an issue to your
          installation administrator. Track the response here. External support
          delivery and response times are not configured.
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 2 }}>
          {[
            [
              "In queue",
              rows.filter((row) => row.status !== "RESOLVED").length,
            ],
            [
              "Resolved",
              rows.filter((row) => row.status === "RESOLVED").length,
            ],
            ["Visible tickets", rows.length],
          ].map(([label, count]) => (
            <Chip key={label} label={`${label}: ${count}`} variant="outlined" />
          ))}
        </Stack>
      </Paper>
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
                  {role === "ADMIN" ? "Installation queue" : "Your tickets"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Latest 100 tickets. Refreshes every 30 seconds.
                </Typography>
              </Box>
              <Button
                startIcon={<Refresh />}
                onClick={() => void tickets.refetch()}
                disabled={tickets.isFetching}
              >
                Refresh
              </Button>
            </Stack>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              gap={2}
              sx={{ my: 2 }}
            >
              <TextField
                label="Search tickets"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                size="small"
                fullWidth
              />
              <TextField
                select
                label="Status"
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                size="small"
                sx={{ minWidth: 170 }}
              >
                {["ALL", "OPEN", "IN_PROGRESS", "RESOLVED"].map((value) => (
                  <MenuItem value={value} key={value}>
                    {value.replaceAll("_", " ")}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            {tickets.isPending && (
              <Typography role="status">Loading your queue...</Typography>
            )}
            {tickets.isError && (
              <Alert severity="error">
                {failureMessage(tickets.error)}{" "}
                <Button onClick={() => void tickets.refetch()}>Retry</Button>
              </Alert>
            )}
            {!tickets.isPending && !tickets.isError && !visible.length && (
              <Box sx={{ p: 4, textAlign: "center" }}>
                <Typography fontWeight={700}>
                  {rows.length ? "No matching tickets" : "No tickets yet"}
                </Typography>
                <Typography color="text.secondary">
                  {rows.length
                    ? "Try another search or status."
                    : "Use the issue form when you need an administrator to review something."}
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
                      {ticket.subject}
                    </Typography>
                    <Chip
                      size="small"
                      color={
                        ticket.status === "RESOLVED" ? "success" : "default"
                      }
                      label={ticket.status.replaceAll("_", " ")}
                    />
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
                    {ticket.id} / {new Date(ticket.updatedAt).toLocaleString()}{" "}
                    / {ticket.createdBy} / {ticket.priority}
                  </Typography>
                  {ticket.resolution && (
                    <Alert severity="info" sx={{ mt: 1 }}>
                      Resolution: {ticket.resolution}
                    </Alert>
                  )}
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
                        Update status
                      </Button>
                    </Box>
                  )}
                </Paper>
              ))}
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
              Report an issue
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ my: 1 }}>
              Include the page, steps, expected result and actual result. Keep
              credentials and customer personal data out.
            </Typography>
            <Stack gap={2} sx={{ mt: 2 }}>
              <TextField
                label="Subject"
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
                label="Category"
                value={form.category}
                onChange={(event) =>
                  setForm({ ...form, category: event.target.value })
                }
                disabled={create.isPending}
              >
                {Object.entries(categories).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Priority"
                value={form.priority}
                onChange={(event) =>
                  setForm({ ...form, priority: event.target.value })
                }
                disabled={create.isPending}
              >
                {["LOW", "NORMAL", "HIGH"].map((value) => (
                  <MenuItem key={value} value={value}>
                    {value}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="What happened?"
                multiline
                minRows={5}
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
                required
                inputProps={{ minLength: 10, maxLength: 4000 }}
                helperText={`${form.description.length}/4000 characters`}
                disabled={create.isPending}
              />
              {create.isError && (
                <Alert severity="error">
                  {failureMessage(create.error)} Your text is preserved for
                  retry.
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
                  ? "Saving ticket..."
                  : "Save ticket to installation"}
              </Button>
            </Stack>
            {drafts.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2">
                  Previous browser drafts
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  These were never submitted. Select one to review before
                  sending; the original draft is kept.
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
          Quick answers
        </Typography>
        {faqs.map(([question, answer]) => (
          <Accordion key={question} disableGutters>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography fontWeight={650}>{question}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography color="text.secondary">{answer}</Typography>
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
        <DialogTitle>Update ticket</DialogTitle>
        <DialogContent>
          <Stack gap={2} sx={{ pt: 1 }}>
            <TextField
              select
              label="Ticket status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              disabled={update.isPending}
            >
              {["OPEN", "IN_PROGRESS", "RESOLVED"].map((value) => (
                <MenuItem key={value} value={value}>
                  {value.replaceAll("_", " ")}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Resolution or progress note"
              multiline
              minRows={3}
              value={resolution}
              onChange={(event) => setResolution(event.target.value)}
              inputProps={{ maxLength: 2000 }}
              disabled={update.isPending}
              required={status === "RESOLVED"}
            />
            {update.isError && (
              <Alert severity="error">{failureMessage(update.error)}</Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button disabled={update.isPending} onClick={() => setSelected(null)}>
            Cancel
          </Button>
          <Button
            disabled={
              update.isPending || (status === "RESOLVED" && !resolution.trim())
            }
            onClick={() => update.mutate()}
          >
            {update.isPending ? "Saving..." : "Save update"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
