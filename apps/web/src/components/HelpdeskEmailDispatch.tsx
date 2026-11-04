import { useRef, useState } from "react";
import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import api from "../utils/api";
import { uiText, useUiLanguage } from "../i18n";
import { formatApiError } from "../utils/messages";
export default function HelpdeskEmailDispatch({
  ticket,
  username,
  onChanged,
}: {
  ticket: any;
  username: string;
  onChanged: () => Promise<void>;
}) {
  useUiLanguage();
  const [open, setOpen] = useState(false),
    [eventId, setEventId] = useState(""),
    [sender, setSender] = useState("primary"),
    [confirmed, setConfirmed] = useState(false);
  const version = useRef(ticket.version);
  const preview = useQuery<any>({
    queryKey: ["helpdesk-email-preview", ticket.id, username],
    enabled: open,
    queryFn: async () =>
      (await api.get(`/helpdesk/tickets/${ticket.id}/email-preview`)).data,
    gcTime: 0,
  });
  const send = useMutation({
    mutationFn: () =>
      api.post(`/helpdesk/tickets/${ticket.id}/email-dispatch`, {
        version: version.current,
        eventId,
        sender,
        confirmRecipient: preview.data.recipient,
        previewHash:preview.data.replies.find((reply:any)=>reply.id===eventId)?.previewHash,
      }),
    onSuccess: async () => {
      await onChanged();
      await preview.refetch();
    },
  });
  const selected = preview.data?.replies?.find(
    (reply: any) => reply.id === eventId,
  );
  const prior = preview.data?.receipts?.find(
    (receipt: any) => receipt.eventId === eventId,
  );
  return (
    <>
      <Button
        onClick={() => {
          version.current = ticket.version;
          setEventId("");
          setConfirmed(false);
          send.reset();
          setOpen(true);
        }}
      >
        {uiText("Email a saved reply")}
      </Button>
      <Dialog
        open={open}
        onClose={() => {
          if (!send.isPending) setOpen(false);
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{uiText("Review support email")}</DialogTitle>
        <DialogContent>
          <Stack gap={2} sx={{ pt: 1 }}>
            <Alert severity="warning">
              {uiText(
                "This sends a real email. SMTP acceptance is not inbox delivery. Each saved reply can be attempted once; ambiguous results require manual review.",
              )}
            </Alert>
            {preview.isError && (
              <Alert severity="error">{formatApiError(preview.error)}</Alert>
            )}
            {preview.data && (
              <>
                <Typography>
                  {uiText("Recipient")}:{" "}
                  {preview.data.recipient || uiText("Unavailable")}
                </Typography>
                {!preview.data.eligible && (
                  <Alert severity="warning">
                    {uiText(
                      "The requester needs an active account and verified email before support email can be sent.",
                    )}
                  </Alert>
                )}
                <TextField
                  select
                  label={uiText("SMTP sender")}
                  value={sender}
                  disabled={send.isPending}
                  onChange={(event) => {
                    setSender(event.target.value);
                    setConfirmed(false);
                  }}
                >
                  {preview.data.senders?.map((account: any) => (
                    <MenuItem
                      key={account.name}
                      value={account.name}
                      disabled={!account.configured}
                    >
                      {account.sender} ·{" "}
                      {uiText(
                        account.configured ? "Configured" : "Not configured",
                      )}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  label={uiText("Saved public reply")}
                  value={eventId}
                  disabled={send.isPending}
                  onChange={(event) => {
                    setEventId(event.target.value);
                    setConfirmed(false);
                  }}
                >
                  {preview.data.replies?.map((reply: any) => (
                    <MenuItem key={reply.id} value={reply.id}>
                      {reply.actor}: {reply.text.slice(0, 80)}
                    </MenuItem>
                  ))}
                </TextField>
                {selected && (
                  <Typography
                    sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}
                  >
                    {selected.text}
                  </Typography>
                )}
                {prior && (
                  <Alert severity="info">
                    {uiText("Existing dispatch attempt")}:{" "}
                    {uiText(prior.status)} {prior.messageId || ""}
                  </Alert>
                )}
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={confirmed}
                      disabled={send.isPending}
                      onChange={(event) => setConfirmed(event.target.checked)}
                    />
                  }
                  label={uiText(
                    "I reviewed the recipient, sender and saved reply.",
                  )}
                />
              </>
            )}
            {send.isError && (
              <Alert severity="error">{formatApiError(send.error)}</Alert>
            )}
            {send.isSuccess && (
              <Alert
                severity={
                  send.data.data.status === "ACCEPTED" ? "info" : "warning"
                }
              >
                {uiText(
                  send.data.data.status === "ACCEPTED"
                    ? "The SMTP server accepted the reply. Inbox delivery remains unverified."
                    : "The dispatch result is ambiguous. Check the sender mailbox before taking further action.",
                )}
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button disabled={send.isPending} onClick={() => setOpen(false)}>
            {uiText("Close")}
          </Button>
          <Button
            disabled={
              send.isPending ||
              send.isSuccess ||
              !preview.data?.eligible ||
              !eventId ||
              !!prior ||
              !confirmed ||
              !preview.data?.senders?.some(
                (account: any) => account.name === sender && account.configured,
              )
            }
            onClick={() => send.mutate()}
          >
            {uiText("Send reviewed email")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
