import { useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import api from "../utils/api";
import { uiText, useUiLanguage } from "../i18n";
import { formatApiError } from "../utils/messages";
import HelpdeskEmailDispatch from "./HelpdeskEmailDispatch";
import HelpdeskWorkActions from "./HelpdeskWorkActions";
export const saveSupportBlob = (blob: Blob, name: string) => {
  const url = URL.createObjectURL(blob),
    link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
export default function HelpdeskTicketTools({
  ticket,
  role,
  username,
  onChanged,
}: {
  ticket: any;
  role: string;
  username: string;
  onChanged: () => Promise<void>;
}) {
  useUiLanguage();
  const admin = role === "ADMIN";
  const [mode, setMode] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const [tags, setTags] = useState(""),
    [due, setDue] = useState(""),
    [watchers, setWatchers] = useState<number[]>([]),
    [custom, setCustom] = useState<Record<string, any>>({});
  const [reason, setReason] = useState(""),
    [subject, setSubject] = useState(""),
    [description, setDescription] = useState(""),
    [targetSearch, setTargetSearch] = useState(""),
    [target, setTarget] = useState<any>(null),
    [rating, setRating] = useState(5);
  const version = useRef(ticket.version),
    splitKey = useRef("");
  const agents = useQuery<any[]>({
    queryKey: ["helpdesk-agents", username],
    enabled: admin && mode === "METADATA",
    queryFn: async () => (await api.get("/helpdesk/agents")).data,
  });
  const categories = useQuery<any[]>({
    queryKey: ["helpdesk-ticket-categories", username, role],
    enabled: admin && mode === "METADATA",
    queryFn: async () => (await api.get("/helpdesk/resources/CATEGORY")).data,
  });
  const targets = useQuery<any>({
    queryKey: ["helpdesk-merge-targets", targetSearch, username],
    enabled: admin && mode === "MERGE" && targetSearch.length >= 3,
    queryFn: async () =>
      (
        await api.get("/helpdesk/queue", {
          params: { q: targetSearch, limit: 20 },
        })
      ).data,
  });
  const fields =
    categories.data?.find((category) => category.key === ticket.category)?.data
      .fields || [];
  const mutate = useMutation({
    mutationFn: async () => {
      const base = { version: version.current };
      if (mode === "METADATA")
        return api.post(`/helpdesk/tickets/${ticket.id}/metadata`, {
          ...base,
          tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          dueAt: due ? new Date(due).toISOString() : null,
          watchers,
          customFields: custom,
          reason,
        });
      if (mode === "SPLIT")
        return api.post(`/helpdesk/tickets/${ticket.id}/split`, {
          ...base,
          requestKey: splitKey.current,
          subject,
          description,
          reason,
        });
      if (mode === "MERGE")
        return api.post(`/helpdesk/tickets/${ticket.id}/merge`, {
          ...base,
          targetId: target.id,
          targetVersion: target.version,
          reason,
        });
      return api.post(`/helpdesk/tickets/${ticket.id}/csat`, {
        ...base,
        rating,
        comment: reason,
      });
    },
    onSuccess: async () => {
      setMode("");
      await onChanged();
    },
  });
  const open = (action: string) => {
    setMode(action);
    setError("");
    mutate.reset();
    setReason("");
    version.current = ticket.version;
    splitKey.current = crypto.randomUUID();
    setSubject("");
    setDescription("");
    setTarget(null);
    setTargetSearch("");
    setTags(JSON.parse(ticket.tagsJson || "[]").join(", "));
    setCustom(JSON.parse(ticket.customFieldsJson || "{}"));
    setWatchers(JSON.parse(ticket.watchersJson || "[]"));
    setDue(
      ticket.dueAt
        ? new Date(
            new Date(ticket.dueAt).getTime() -
              new Date(ticket.dueAt).getTimezoneOffset() * 60000,
          )
            .toISOString()
            .slice(0, 16)
        : "",
    );
  };
  const exportTicket = async () => {
    setBusy(true);
    setError("");
    try {
      const response = await api.get(`/helpdesk/tickets/${ticket.id}/export`, {
        responseType: "blob",
      });
      saveSupportBlob(response.data, "helpdesk-ticket.json");
    } catch (failure) {
      setError(formatApiError(failure));
    } finally {
      setBusy(false);
    }
  };
  const upload = async (file: File) => {
    setBusy(true);
    setError("");
    try {
      if (file.size > 512 * 1024)
        throw Error(uiText("Attachments are limited to 512 KB."));
      const bytes = new Uint8Array(await file.arrayBuffer());
      let binary = "";
      for (let offset = 0; offset < bytes.length; offset += 32768)
        binary += String.fromCharCode(
          ...bytes.subarray(offset, offset + 32768),
        );
      await api.post(`/helpdesk/tickets/${ticket.id}/attachments`, {
        version: ticket.version,
        filename: file.name,
        mime: file.type || "application/octet-stream",
        base64: btoa(binary),
        visibility: "PUBLIC",
      });
      await onChanged();
    } catch (failure) {
      setError(formatApiError(failure));
    } finally {
      setBusy(false);
    }
  };
  return (
    <Box sx={{ my: 2 }}>
      <Stack direction="row" flexWrap="wrap" gap={1}>
        <Button disabled={busy} onClick={() => void exportTicket()}>
          {uiText("Export redacted JSON")}
        </Button>
        <Button
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(
                `${window.location.origin}/helpdesk/tickets/${encodeURIComponent(ticket.id)}`,
              );
            } catch {
              setError(uiText("Could not copy ticket link."));
            }
          }}
        >
          {uiText("Copy ticket link")}
        </Button>
        <Button
          onClick={() => {
            const frame = document.createElement("iframe");
            frame.style.position = "fixed";
            frame.style.width = "0";
            frame.style.height = "0";
            document.body.appendChild(frame);
            const escape = (value: string) =>
              value.replace(
                /[&<>"']/g,
                (c) =>
                  ({
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#39;",
                  })[c]!,
              );
            const content = [
              ticket.subject,
              ticket.id,
              uiText(ticket.status),
              ticket.description,
              ...ticket.events.map(
                (e: any) =>
                  `${e.actorUsername} · ${uiText(e.kind)}\n${e.text || ""}`,
              ),
            ]
              .map((value: string) => `<p>${escape(value)}</p>`)
              .join("");
            frame.contentDocument?.open();
            frame.contentDocument?.write(
              `<html><head><title>Support ticket</title><style>body{font:14px sans-serif;padding:24px}p{white-space:pre-wrap;overflow-wrap:anywhere}</style></head><body>${content}</body></html>`,
            );
            frame.contentDocument?.close();
            setTimeout(() => {
              frame.contentWindow?.print();
              setTimeout(() => frame.remove(), 1000);
            }, 100);
          }}
        >
          {uiText("Print ticket")}
        </Button>
        {!ticket.mergedIntoId && ticket.status !== "CLOSED" && (
          <Button component="label" disabled={busy}>
            {uiText("Attach file")}
            <input
              type="file"
              hidden
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void upload(file);
                event.target.value = "";
              }}
            />
          </Button>
        )}
        {admin && !ticket.mergedIntoId && (
          <>
            <Button onClick={() => open("METADATA")}>
              {uiText("Edit ticket fields")}
            </Button>
            <Button onClick={() => open("SPLIT")}>
              {uiText("Create subticket")}
            </Button>
            <Button onClick={() => open("MERGE")}>
              {uiText("Merge duplicate")}
            </Button>
          </>
        )}
        {ticket.status === "CLOSED" &&
          ticket.createdBy === username &&
          !ticket.events.some((e: any) => e.kind === "CSAT") && (
            <Button onClick={() => open("CSAT")}>
              {uiText("Rate support")}
            </Button>
          )}
      </Stack>
      {admin && (
        <HelpdeskEmailDispatch
          ticket={ticket}
          username={username}
          onChanged={onChanged}
        />
      )}
      <HelpdeskWorkActions
        ticket={ticket}
        username={username}
        role={role}
        onChanged={onChanged}
      />
      <Typography variant="caption">
        {uiText(
          "Attachments require a fresh clean local antivirus scan before download. Bounded PNG previews are available. JSON export is unsigned and uses best-effort personal-data redaction.",
        )}
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {ticket.mergedIntoId && (
        <Alert severity="warning">
          {uiText("This ticket is merged into")}: {ticket.mergedIntoId}
        </Alert>
      )}
      {ticket.parentId && (
        <Typography>
          {uiText("Parent ticket")}: {ticket.parentId}
        </Typography>
      )}
      <Dialog
        open={!!mode}
        onClose={() => {
          if (!mutate.isPending) setMode("");
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {uiText(
            mode === "METADATA"
              ? "Ticket fields"
              : mode === "SPLIT"
                ? "Create subticket"
                : mode === "MERGE"
                  ? "Confirm duplicate merge"
                  : "Rate support",
          )}
        </DialogTitle>
        <DialogContent>
          <Stack
            component="form"
            id="ticket-tools"
            gap={2}
            sx={{ pt: 1 }}
            onSubmit={(event) => {
              event.preventDefault();
              mutate.mutate();
            }}
          >
            {mode === "METADATA" && (
              <>
                <TextField
                  label={uiText("Tags, separated by commas")}
                  value={tags}
                  onChange={(event) => setTags(event.target.value)}
                />
                <TextField
                  type="datetime-local"
                  label={uiText("Due date")}
                  value={due}
                  onChange={(event) => setDue(event.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
                <TextField
                  select
                  label={uiText("Administrator watchers")}
                  SelectProps={{ multiple: true }}
                  value={watchers}
                  onChange={(event) =>
                    setWatchers(event.target.value as unknown as number[])
                  }
                >
                  {agents.data?.map((agent) => (
                    <MenuItem key={agent.id} value={agent.id}>
                      {agent.username}
                    </MenuItem>
                  ))}
                </TextField>
                {fields.map((field: any) => (
                  <TextField
                    key={field.key}
                    required={field.required}
                    label={field.label}
                    type={field.type === "NUMBER" ? "number" : "text"}
                    select={field.type === "BOOLEAN"}
                    value={custom[field.key] ?? ""}
                    onChange={(event) =>
                      setCustom({
                        ...custom,
                        [field.key]:
                          field.type === "NUMBER"
                            ? Number(event.target.value)
                            : field.type === "BOOLEAN"
                              ? event.target.value === "true"
                              : event.target.value,
                      })
                    }
                  >
                    {field.type === "BOOLEAN" &&
                      [true, false].map((value) => (
                        <MenuItem key={String(value)} value={String(value)}>
                          {uiText(value ? "Yes" : "No")}
                        </MenuItem>
                      ))}
                  </TextField>
                ))}
              </>
            )}
            {mode === "SPLIT" && (
              <>
                <TextField
                  required
                  label={uiText("Subticket subject")}
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  slotProps={{ htmlInput: { minLength: 3, maxLength: 160 } }}
                />
                <TextField
                  required
                  label={uiText("Subticket description")}
                  multiline
                  minRows={3}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  slotProps={{ htmlInput: { minLength: 10, maxLength: 4000 } }}
                />
              </>
            )}
            {mode === "MERGE" && (
              <>
                <Alert severity="warning">
                  {uiText(
                    "Only tickets from the same identified requester can merge. Both histories remain intact; private notes are never copied. The selected primary ticket survives.",
                  )}
                </Alert>
                <TextField
                  label={uiText("Search primary ticket")}
                  value={targetSearch}
                  onChange={(event) => {
                    setTargetSearch(event.target.value);
                    setTarget(null);
                  }}
                />
                {targets.data?.items
                  ?.filter(
                    (row: any) => row.id !== ticket.id && !row.mergedIntoId,
                  )
                  .map((row: any) => (
                    <Button
                      key={row.id}
                      variant={target?.id === row.id ? "contained" : "outlined"}
                      onClick={() => setTarget(row)}
                    >
                      {row.subject} ({row.id})
                    </Button>
                  ))}
                {target && (
                  <Typography>
                    {uiText("Primary ticket")}: {target.subject}
                  </Typography>
                )}
              </>
            )}
            {mode === "CSAT" && (
              <TextField
                select
                label={uiText("Satisfaction rating")}
                value={rating}
                onChange={(event) => setRating(Number(event.target.value))}
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <MenuItem key={value} value={value}>
                    {value} / 5
                  </MenuItem>
                ))}
              </TextField>
            )}
            <TextField
              required={mode !== "CSAT"}
              label={uiText(mode === "CSAT" ? "Feedback comment" : "Reason")}
              multiline
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              slotProps={{ htmlInput: { maxLength: 500 } }}
            />
            {mutate.isError && (
              <Alert severity="error">{formatApiError(mutate.error)}</Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button disabled={mutate.isPending} onClick={() => setMode("")}>
            {uiText("Cancel")}
          </Button>
          <Button
            type="submit"
            form="ticket-tools"
            disabled={
              mutate.isPending ||
              (mode !== "CSAT" && reason.trim().length < 5) ||
              (mode === "MERGE" && !target)
            }
          >
            {uiText(mode === "MERGE" ? "Confirm merge" : "Save")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
