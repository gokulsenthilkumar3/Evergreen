import SupportMarkdown from './SupportMarkdown';
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../utils/api";
import { uiText, uiDateLocale, useUiLanguage } from "../i18n";
import { formatApiError } from "../utils/messages";
import HelpdeskTicketTools, { saveSupportBlob } from "./HelpdeskTicketTools";
import HelpdeskAiAdvisory from './HelpdeskAiAdvisory';
import SupportAttachmentPreview from './SupportAttachmentPreview';
type TicketEvent = {
  id: string;
  version: number;
  kind: string;
  visibility: string;
  actorUsername: string;
  createdAt: string;
  text?: string;
  queue?: string;
  priority?: string;
  assigneeId?: number | null;
  attachmentId?: string;
  filename?: string;
  scanStatus?: string;
  replyEventId?: string;
  aiAssisted?:boolean;
};
type Detail = {
  id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  queue: string;
  assigneeId: number | null;
  version: number;
  proof: string;
  canConfirm: boolean;
  confirmedAt: string | null;
  events: TicketEvent[];
  integrity: { valid: boolean; complete: boolean; events: number };
  createdBy?: string;
  sla?: any;
  requesterId?: number;
};
const proofLabels: Record<string, string> = {
  recorded: "Recorded",
  requested: "Resolution awaiting confirmation",
  verified: "Requester confirmed fixed",
  failed: "Requester reported still broken",
  stale: "Closed without confirmation for 14 days",
};
export default function HelpdeskTicketInspector({
  id,
  username,
  role,
  onClose,
}: {
  id: string;
  username: string;
  role: string;
  onClose: () => void;
}) {
  useUiLanguage();
  const client = useQueryClient();
  const query = useQuery<Detail>({
    queryKey: ["helpdesk-ticket", id, username, role],
    queryFn: async () =>
      (await api.get(`/helpdesk/tickets/${encodeURIComponent(id)}`)).data,
    refetchOnWindowFocus: false,
    gcTime: 0,
  });
  const agents = useQuery<
    { id: number; username: string; name: string | null }[]
  >({
    queryKey: ["helpdesk-agents", username],
    enabled: role === "ADMIN",
    queryFn: async () => (await api.get("/helpdesk/agents")).data,
  });
  const presence = useQuery<any>({
    queryKey: ["helpdesk-presence", id, username, role],
    enabled: role === "ADMIN",
    refetchInterval: 15000,
    queryFn: async () =>
      (await api.get(`/helpdesk/tickets/${id}/presence`)).data,
    gcTime: 0,
  });
  useEffect(() => {
    if (role !== "ADMIN") return;
    const beat = () => {
      if (document.visibilityState === "visible")
        void api.post(`/helpdesk/tickets/${id}/presence`).catch(() => {});
    };
    beat();
    const timer = window.setInterval(beat, 30000);
    return () => window.clearInterval(timer);
  }, [id, role]);
  const [reply, setReply] = useState(""),
    [visibility, setVisibility] = useState("PUBLIC");
  const [feedback, setFeedback] = useState("");
  const [aiDraftId,setAiDraftId]=useState<string|null>(null);
  const [auxError, setAuxError] = useState("");
  const macros = useQuery<any[]>({
    queryKey: ["helpdesk-macros", username, role],
    queryFn: async () => (await api.get("/helpdesk/resources/MACRO")).data,
  });
  const [assignee, setAssignee] = useState(""),
    [queue, setQueue] = useState("TRIAGE"),
    [priority, setPriority] = useState("NORMAL"),
    [reason, setReason] = useState("");
  const [triageStarted, setTriageStarted] = useState(false);
  const draftVersion = useRef<
      Record<"reply" | "feedback" | "triage", number | null>
    >({ reply: null, feedback: null, triage: null }),
    request = useRef<{ json: string; key: string } | null>(null);
  const version = (kind: "reply" | "feedback" | "triage") =>
    draftVersion.current[kind] ?? query.data!.version;
  const begin = (kind: "reply" | "feedback" | "triage") => {
    if (draftVersion.current[kind] === null && query.data)
      draftVersion.current[kind] = query.data.version;
  };
  const changed = async (kind: "reply" | "feedback" | "triage") => {
    draftVersion.current[kind] = null;
    await Promise.all([
      query.refetch(),
      client.invalidateQueries({ queryKey: ["helpdesk-tickets"] }),
    ]);
  };
  const send = useMutation({
    mutationFn: async () => {
      const data = {
          text: reply.trim(),
          visibility,
          version: version("reply"),
          ...(aiDraftId?{aiDraftId}:{}),
        },
        json = JSON.stringify(data);
      if (!request.current || request.current.json !== json)
        request.current = { json, key: crypto.randomUUID() };
      return api.post(`/helpdesk/tickets/${encodeURIComponent(id)}/messages`, {
        ...data,
        requestKey: request.current.key,
      });
    },
    onSuccess: async () => {
      setReply("");
      setAiDraftId(null);
      request.current = null;
      await changed("reply");
    },
  });
  const confirm = useMutation({
    mutationFn: (outcome: string) =>
      api.post(`/helpdesk/tickets/${encodeURIComponent(id)}/confirm-fixed`, {
        outcome,
        reason: feedback.trim(),
        version: version("feedback"),
      }),
    onSuccess: async () => {
      setFeedback("");
      await changed("feedback");
    },
  });
  const assign = useMutation({
    mutationFn: () =>
      api.post(`/helpdesk/tickets/${encodeURIComponent(id)}/assign`, {
        assigneeId: assignee ? Number(assignee) : null,
        queue,
        priority,
        reason: reason.trim(),
        version: version("triage"),
      }),
    onSuccess: async () => {
      setReason("");
      setTriageStarted(false);
      await changed("triage");
    },
  });
  const busy = send.isPending || confirm.isPending || assign.isPending;
  const error = send.error || confirm.error || assign.error;
  const ticket = query.data;
  return (
    <Dialog
      open
      onClose={() => {
        if (!busy) onClose();
      }}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>{ticket?.subject || uiText("Ticket details")}</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          {query.isPending && (
            <Typography role="status">
              {uiText("Loading ticket history...")}
            </Typography>
          )}
          {query.isError && (
            <Alert severity="error">{formatApiError(query.error)}</Alert>
          )}
          {error && <Alert severity="error">{formatApiError(error)}</Alert>}
          {ticket && (
            <>
              <Stack direction="row" gap={1} flexWrap="wrap">
                <Chip label={uiText(ticket.status)} />
                <Chip
                  color={
                    ticket.proof === "verified"
                      ? "success"
                      : ticket.proof === "failed"
                        ? "error"
                        : "warning"
                  }
                  label={uiText(proofLabels[ticket.proof] || "Recorded")}
                />
                <Chip variant="outlined" label={uiText(ticket.queue)} />
              </Stack>
              <SupportMarkdown text={ticket.description} />
              {!!presence.data?.viewers?.length && (
                <Alert severity="info">
                  {uiText("Other administrators viewing this ticket")}:{" "}
                  {presence.data.viewers
                    .map((viewer: any) => viewer.username)
                    .join(", ")}
                </Alert>
              )}
              <HelpdeskTicketTools
                ticket={ticket}
                role={role}
                username={username}
                onChanged={async () => {
                  await changed("reply");
                }}
              />
              {auxError && <Alert severity="error">{auxError}</Alert>}
              {ticket.sla && (
                <Alert severity="info">
                  {uiText("SLA target and recorded claim")}:{" "}
                  {ticket.sla.policyTitle} · {uiText("Response target minutes")}
                  : {ticket.sla.responseTargetMinutes} ·{" "}
                  {uiText("Resolution target minutes")}:{" "}
                  {ticket.sla.resolutionTargetMinutes} ·{" "}
                  {uiText(
                    ticket.sla.deliveryProof === "PORTAL_ACKNOWLEDGED" &&
                      ticket.integrity.valid
                      ? "Requester acknowledged portal receipt"
                      : "Delivery receipt unavailable",
                  )}
                  {(ticket.sla.responseBreach ||
                    ticket.sla.resolutionBreach) && (
                    <Typography>
                      {uiText("A recorded SLA target has been breached.")}
                    </Typography>
                  )}
                </Alert>
              )}
              <Alert severity={ticket.integrity.valid ? "info" : "warning"}>
                {uiText(
                  ticket.integrity.valid
                    ? "Local ticket integrity check passed. This is not an external signature or proof of email delivery."
                    : "Ticket history is incomplete or failed its integrity check. No independent verification is claimed.",
                )}
              </Alert>
              {ticket.integrity.valid && !ticket.integrity.complete && (
                <Alert severity="warning">
                  {uiText(
                    "This ticket predates the audit workflow. Earlier changes have no reconstructed proof.",
                  )}
                </Alert>
              )}
              <Typography variant="h6">
                {uiText("Conversation and audit history")}
              </Typography>
              {!ticket.events.length && (
                <Typography>{uiText("No audited events yet.")}</Typography>
              )}
              {ticket.events.map((event) => (
                <Box
                  key={event.id}
                  sx={{
                    p: 2,
                    border: 1,
                    borderColor:
                      event.visibility === "INTERNAL"
                        ? "warning.main"
                        : "divider",
                    borderRadius: 2,
                    bgcolor:
                      event.visibility === "INTERNAL"
                        ? "action.hover"
                        : undefined,
                  }}
                >
                  <Stack direction="row" gap={1} flexWrap="wrap">
                    <Typography fontWeight={700}>
                      {event.actorUsername}
                    </Typography>
                    <Chip size="small" label={uiText(event.kind)} />
                    {event.visibility === "INTERNAL" && (
                      <Chip
                        size="small"
                        color="warning"
                        label={uiText("Private administrator note")}
                      />
                    )}
                  </Stack>
                  <Typography variant="caption">
                    {new Date(event.createdAt).toLocaleString(uiDateLocale())}
                  </Typography>
                  {event.text && (
                    <SupportMarkdown text={event.text} />
                  )}
                  {event.aiAssisted&&<Chip size="small" color="warning" label={uiText('AI-assisted reply, reviewed by its author')}/>}
                  {event.attachmentId && (
                    <>
                      <Typography>
                      {event.filename} · {uiText('Initial scan')}: {" "}
                        {uiText(event.scanStatus || "QUARANTINED")}
                      </Typography>
                      <Button
                        onClick={async () => {
                          setAuxError("");
                          try {
                            const response = await api.get(
                              `/helpdesk/tickets/${id}/attachments/${event.attachmentId}`,
                              { responseType: "blob" },
                            );
                            saveSupportBlob(
                              response.data,
                              event.filename || "attachment.bin",
                            );
                          } catch (failure) {
                            setAuxError(formatApiError(failure));
                          }
                        }}
                      >
                        {uiText("Download with antivirus check")}
                      </Button>
                      <SupportAttachmentPreview ticketId={id} attachmentId={event.attachmentId} filename={event.filename || 'attachment.png'} />
                    </>
                  )}
                  {event.kind === "PUBLIC_REPLY" &&
                    event.actorUsername !== username &&
                    ticket.createdBy === username &&
                    !ticket.events.some(
                      (receipt) =>
                        receipt.kind === "REPLY_ACKNOWLEDGED" &&
                        receipt.replyEventId === event.id,
                    ) && (
                      <Button
                        disabled={busy}
                        onClick={async () => {
                          try {
                            await api.post(
                              `/helpdesk/tickets/${id}/acknowledge`,
                              { version: ticket.version, eventId: event.id },
                            );
                            await changed("feedback");
                          } catch (failure) {
                            setAuxError(formatApiError(failure));
                          }
                        }}
                      >
                        {uiText("Acknowledge this reply")}
                      </Button>
                    )}
                  {event.kind === "ASSIGNED" && (
                    <Typography variant="body2">
                      {uiText(event.queue || "TRIAGE")} ·{" "}
                      {uiText(event.priority || "NORMAL")} ·{" "}
                      {event.assigneeId
                        ? agents.data?.find(
                            (agent) => agent.id === event.assigneeId,
                          )?.username || uiText("Assigned administrator")
                        : uiText("Unassigned")}
                    </Typography>
                  )}
                </Box>
              ))}
              <Divider />
              <Box
                component="form"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (!busy) send.mutate();
                }}
              >
                <Stack gap={2}>
                  <Typography variant="subtitle1">
                    {uiText("Add to conversation")}
                  </Typography>
                  {role==='ADMIN'&&<HelpdeskAiAdvisory ticket={ticket} username={username} onChanged={async()=>{await changed('reply');}} onInsert={(text,id)=>{begin('reply');setReply(text);setAiDraftId(id);}}/>}
                  {aiDraftId&&<Alert severity="warning">{uiText('This reply draft contains AI assistance. Review every statement before posting.')}</Alert>}
                  {macros.data
                    ?.filter(
                      (row) => row.kind === "MACRO" && row.status === "ACTIVE",
                    )
                    .map((macro) => (
                      <Button
                        key={macro.id}
                        disabled={busy}
                        onClick={() => {
                          begin("reply");
                          const values: Record<string, string> = {
                            "requester.name": ticket.createdBy || username,
                            "ticket.id": ticket.id,
                            "ticket.subject": ticket.subject,
                          };
                          const rendered = String(macro.data.body).replace(
                            /\{\{\s*(requester\.name|ticket\.id|ticket\.subject)\s*\}\}/g,
                            (_, key) => values[key],
                          );
                          setReply(
                            (previous) =>
                              previous + (previous ? "\n" : "") + rendered,
                          );
                        }}
                      >
                        {uiText("Insert response")}: {macro.title}
                      </Button>
                    ))}
                  {role === "ADMIN" && (
                    <TextField
                      select
                      label={uiText("Reply visibility", "forms")}
                      value={visibility}
                      disabled={busy}
                      onChange={(event) => {
                        begin("reply");
                        setVisibility(event.target.value);
                      }}
                    >
                      <MenuItem value="PUBLIC">
                        {uiText("Public reply")}
                      </MenuItem>
                      <MenuItem value="INTERNAL">
                        {uiText("Private administrator note")}
                      </MenuItem>
                    </TextField>
                  )}
                  <TextField
                    label={uiText("Reply text", "forms")}
                    multiline
                    minRows={3}
                    value={reply}
                    disabled={busy || ticket.status === "CLOSED"}
                    onChange={(event) => {
                      begin("reply");
                      setReply(event.target.value);
                    }}
                    slotProps={{ htmlInput: { maxLength: 4000 } }}
                  />
                  <Typography variant="caption">
                    {uiText(
                      "Replies are saved in this portal. Email dispatch requires a separate administrator action and receipt. Inbox delivery is never inferred. Do not include passwords or recovery codes.",
                    )}
                  </Typography>
                  <Button
                    type="submit"
                    disabled={
                      busy || ticket.status === "CLOSED" || !reply.trim() || reply.length>4000
                    }
                  >
                    {uiText(
                      visibility === "INTERNAL"
                        ? "Save private note"
                        : "Post public reply",
                    )}
                  </Button>
                </Stack>
              </Box>
              {ticket.canConfirm && (
                <Box
                  sx={{
                    p: 2,
                    border: 1,
                    borderColor: "warning.main",
                    borderRadius: 2,
                  }}
                >
                  <Stack gap={2}>
                    <Typography fontWeight={700}>
                      {uiText("Check the proposed fix before confirming.")}
                    </Typography>
                    <TextField
                      label={uiText("Outcome details", "forms")}
                      multiline
                      value={feedback}
                      disabled={busy}
                      onChange={(event) => {
                        begin("feedback");
                        setFeedback(event.target.value);
                      }}
                      slotProps={{ htmlInput: { maxLength: 1000 } }}
                    />
                    <Stack direction="row" gap={1}>
                      <Button
                        disabled={
                          busy ||
                          !!ticket.confirmedAt ||
                          feedback.trim().length < 5
                        }
                        onClick={() => confirm.mutate("FIXED")}
                      >
                        {uiText("This is fixed")}
                      </Button>
                      <Button
                        color="warning"
                        disabled={busy || feedback.trim().length < 5}
                        onClick={() => confirm.mutate("BROKEN")}
                      >
                        {uiText("Still broken — reopen")}
                      </Button>
                    </Stack>
                  </Stack>
                </Box>
              )}
              {role === "ADMIN" && (
                <Box
                  component="form"
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (!busy) assign.mutate();
                  }}
                >
                  <Stack gap={2}>
                    <Typography variant="h6">
                      {uiText("Assignment and triage")}
                    </Typography>
                    <Alert severity="info">
                      {uiText(
                        "Only active installation administrators can be assigned. Assignment does not grant permissions or notify an external provider.",
                      )}
                    </Alert>
                    <Button
                      disabled={busy || agents.isPending || agents.isError}
                      onClick={() => {
                        begin("triage");
                        setAssignee(
                          ticket.assigneeId ? String(ticket.assigneeId) : "",
                        );
                        setQueue(ticket.queue);
                        setPriority(ticket.priority);
                        setTriageStarted(true);
                      }}
                    >
                      {uiText("Edit assignment")}
                    </Button>
                    {agents.isError && (
                      <Alert severity="error">
                        {uiText("Could not load eligible administrators.")}
                      </Alert>
                    )}
                    {triageStarted && (
                      <>
                        <TextField
                          select
                          label={uiText("Assignee", "forms")}
                          value={assignee}
                          disabled={busy}
                          onChange={(event) => setAssignee(event.target.value)}
                        >
                          <MenuItem value="">{uiText("Unassigned")}</MenuItem>
                          {agents.data?.map((agent) => (
                            <MenuItem key={agent.id} value={String(agent.id)}>
                              {agent.name || agent.username} ({agent.username})
                            </MenuItem>
                          ))}
                        </TextField>
                        <TextField
                          select
                          label={uiText("Queue", "forms")}
                          value={queue}
                          disabled={busy}
                          onChange={(event) => setQueue(event.target.value)}
                        >
                          {["TRIAGE", "TECHNICAL", "ACCESS", "BILLING"].map(
                            (value) => (
                              <MenuItem key={value} value={value}>
                                {uiText(value)}
                              </MenuItem>
                            ),
                          )}
                        </TextField>
                        <TextField
                          select
                          label={uiText("Priority", "forms")}
                          value={priority}
                          disabled={busy}
                          onChange={(event) => setPriority(event.target.value)}
                        >
                          {["LOW", "NORMAL", "HIGH", "URGENT"].map((value) => (
                            <MenuItem key={value} value={value}>
                              {uiText(value)}
                            </MenuItem>
                          ))}
                        </TextField>
                        <TextField
                          label={uiText("Assignment reason", "forms")}
                          value={reason}
                          disabled={busy}
                          onChange={(event) => setReason(event.target.value)}
                          slotProps={{ htmlInput: { maxLength: 500 } }}
                        />
                        <Button
                          type="submit"
                          disabled={busy || reason.trim().length < 5}
                        >
                          {uiText("Save assignment")}
                        </Button>
                      </>
                    )}
                  </Stack>
                </Box>
              )}
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          disabled={busy || query.isFetching}
          onClick={async () => {
            const result = await query.refetch();
            if (result.isSuccess) {
              draftVersion.current = {
                reply: null,
                feedback: null,
                triage: null,
              };
              send.reset();
              confirm.reset();
              assign.reset();
              setTriageStarted(false);
            }
          }}
        >
          {uiText("Refresh ticket")}
        </Button>
        <Button disabled={busy} onClick={onClose}>
          {uiText("Close")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
