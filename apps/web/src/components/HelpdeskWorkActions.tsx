import { useRef, useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import api from "../utils/api";
import { uiText } from "../i18n";
import { formatApiError } from "../utils/messages";
export default function HelpdeskWorkActions({
  ticket,
  username,
  role,
  onChanged,
}: {
  ticket: any;
  username: string;
  role: string;
  onChanged: () => Promise<void>;
}) {
  const [mode, setMode] = useState(""),
    [minutes, setMinutes] = useState(30),
    [recordType, setRecordType] = useState("TICKET"),
    [search, setSearch] = useState(""),
    [recordId, setRecordId] = useState(""),
    [eventId, setEventId] = useState(""),
    [text, setText] = useState(""),
    [reason, setReason] = useState("");
  const version = useRef(ticket.version);
  const own = ticket.events.filter(
    (event: any) =>
      ["PUBLIC_REPLY", "INTERNAL_NOTE"].includes(event.kind) &&
      event.actorUsername === username,
  );
  const candidates = useQuery<any[]>({
    queryKey: ["helpdesk-links", username, recordType, search],
    enabled: mode === "LINK" && search.length >= 2,
    queryFn: async () =>
      (
        await api.get("/helpdesk/link-candidates", {
          params: { type: recordType, q: search },
        })
      ).data,
    gcTime: 0,
  });
  const mutation = useMutation({
    mutationFn: async () => {
      const response =
        mode === "REVISE"
          ? await api.post(
              `/helpdesk/tickets/${ticket.id}/messages/${eventId}/revisions`,
              { version: version.current, text, reason },
            )
          : await api.post(`/helpdesk/tickets/${ticket.id}/work`, {
              version: version.current,
              operation: mode,
              reason,
              ...(mode === "TIME"
                ? { minutes }
                : mode === "LINK"
                  ? { recordType, recordId }
                  : {}),
            });
      return response.data;
    },
    onSuccess: async () => {
      setMode("");
      await onChanged();
    },
  });
  const open = (action: string) => {
    setMode(action);
    setReason("");
    setText("");
    setEventId("");
    setRecordId("");
    setSearch("");
    version.current = ticket.version;
    mutation.reset();
  };
  const title =
    mode === "TIME"
      ? "Log work time"
      : mode === "LINK"
        ? "Link related record"
        : mode === "REVISE"
          ? "Append reply correction"
          : "Request owner attention";
  return (
    <>
      <Stack direction="row" gap={1} flexWrap="wrap">
        {role === "ADMIN" && (
          <>
            {["TIME", "LINK", "OWNER_ATTENTION"].map((value, index) => (
              <Button key={value} onClick={() => open(value)}>
                {uiText(
                  [
                    "Log work time",
                    "Link related record",
                    "Request owner attention",
                  ][index],
                )}
              </Button>
            ))}
          </>
        )}
        {!!own.length && (
          <Button onClick={() => open("REVISE")}>
            {uiText("Append reply correction")}
          </Button>
        )}
      </Stack>
      <Dialog
        open={!!mode}
        onClose={() => {
          if (!mutation.isPending) setMode("");
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{uiText(title)}</DialogTitle>
        <DialogContent>
          <Stack
            component="form"
            id="support-work-action"
            gap={2}
            sx={{ pt: 1 }}
            onSubmit={(event) => {
              event.preventDefault();
              mutation.mutate();
            }}
          >
            {mode === "OWNER_ATTENTION" && (
              <Alert severity="warning">
                {uiText(
                  "This records a request only. Owner-key signatures, out-of-band delivery and deployment execution are not configured. No approval or verification is implied.",
                )}
              </Alert>
            )}
            {mode === "TIME" && (
              <TextField
                required
                type="number"
                label={uiText("Work minutes")}
                value={minutes}
                onChange={(event) => setMinutes(Number(event.target.value))}
                slotProps={{ htmlInput: { min: 1, max: 1440 } }}
              />
            )}
            {mode === "REVISE" && (
              <>
                <Alert severity="info">
                  {uiText(
                    "The original message remains visible in audit history. A correction is a new attributed event and does not recall an email already sent.",
                  )}
                </Alert>
                <TextField
                  select
                  label={uiText("Your original message")}
                  value={eventId}
                  onChange={(event) => {
                    setEventId(event.target.value);
                    setText(
                      own.find((item: any) => item.id === event.target.value)
                        ?.text || "",
                    );
                  }}
                >
                  {own.map((event: any) => (
                    <MenuItem value={event.id} key={event.id}>
                      {event.text?.slice(0, 100)}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  required
                  label={uiText("Corrected text")}
                  multiline
                  minRows={3}
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  slotProps={{ htmlInput: { maxLength: 4000 } }}
                />
              </>
            )}
            {mode === "LINK" && (
              <>
                <TextField
                  select
                  label={uiText("Related record type")}
                  value={recordType}
                  onChange={(event) => {
                    setRecordType(event.target.value);
                    setRecordId("");
                    setSearch("");
                  }}
                >
                  {["TICKET", "KB", "INVOICE", "WORKFLOW"].map((value) => (
                    <MenuItem value={value} key={value}>
                      {uiText(value)}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label={uiText("Search related records")}
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setRecordId("");
                  }}
                />
                {candidates.isError && (
                  <Alert severity="error">
                    {formatApiError(candidates.error)}
                  </Alert>
                )}
                {candidates.data
                  ?.filter(
                    (row) => recordType !== "TICKET" || row.id !== ticket.id,
                  )
                  .map((row) => (
                    <Button
                      key={row.id}
                      variant={recordId === row.id ? "contained" : "outlined"}
                      onClick={() => setRecordId(row.id)}
                    >
                      {row.label}
                    </Button>
                  ))}
              </>
            )}
            <TextField
              required
              label={uiText("Reason")}
              multiline
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              slotProps={{ htmlInput: { minLength: 5, maxLength: 500 } }}
            />
            {mutation.isError && (
              <Alert severity="error">{formatApiError(mutation.error)}</Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button disabled={mutation.isPending} onClick={() => setMode("")}>
            {uiText("Cancel")}
          </Button>
          <Button
            type="submit"
            form="support-work-action"
            disabled={
              mutation.isPending ||
              reason.trim().length < 5 ||
              (mode === "LINK" && !recordId) ||
              (mode === "REVISE" && (!eventId || !text.trim()))
            }
          >
            {uiText("Save")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
