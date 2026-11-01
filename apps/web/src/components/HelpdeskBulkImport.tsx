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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { read, utils } from "xlsx";
import api from "../utils/api";
import { uiText, useUiLanguage } from "../i18n";
import { formatApiError } from "../utils/messages";
import { tableToCSV } from "../utils/csvGenerator";
export function HelpdeskBulkActions({
  tickets,
  onDone,
}: {
  tickets: { id: string; version: number }[];
  onDone: () => void;
}) {
  useUiLanguage();
  const client = useQueryClient();
  const [open, setOpen] = useState(false),
    [review, setReview] = useState(false),
    [operation, setOperation] = useState("TAG"),
    [value, setValue] = useState(""),
    [reason, setReason] = useState("");
  const [details,setDetails]=useState('');const splitKey=useRef('');
  const agents = useQuery<any[]>({
    queryKey: ["helpdesk-bulk-agents"],
    enabled: open && operation === "ASSIGN",
    queryFn: async () => (await api.get("/helpdesk/agents")).data,
    gcTime: 0,
  });
  const mutation = useMutation({
    mutationFn: () =>
      api.post("/helpdesk/bulk", { tickets, operation, value, reason,...(operation==='SPLIT'?{requestKey:splitKey.current,details}:{}) }),
    onSuccess: async () => {
      setOpen(false);
      setReview(false);
      setValue("");
      setReason("");
      onDone();
      await client.invalidateQueries({ queryKey: ["helpdesk-tickets"] });
    },
  });
  return (
    <>
      <Button
        disabled={!tickets.length || tickets.length > 50}
        onClick={() => {
          setOpen(true);
          setReview(false);
          splitKey.current=crypto.randomUUID();setDetails('');
          mutation.reset();
        }}
      >
        {uiText("Review bulk changes")} ({tickets.length})
      </Button>
      <Dialog
        open={open}
        onClose={() => {
          if (!mutation.isPending) setOpen(false);
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{uiText("Bulk ticket changes")}</DialogTitle>
        <DialogContent>
          <Stack gap={2} sx={{ pt: 1 }}>
            <Alert severity="warning">
              {uiText(
                "Every selected ticket must still match its version. Any conflict rolls back the entire batch. Resolution and closure require individual review.",
              )}
            </Alert>
            <Typography>
              {tickets.map((ticket) => ticket.id).join(", ")}
            </Typography>
            <TextField
              select
              disabled={review || mutation.isPending}
              label={uiText("Operation")}
              value={operation}
              onChange={(event) => {
                setOperation(event.target.value);
                setValue("");
              }}
            >
              {["TAG", "ASSIGN", "STATUS",'MERGE','SPLIT'].map((item) => (
                <MenuItem value={item} key={item}>
                  {uiText(item)}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              disabled={review || mutation.isPending}
              label={uiText(
                operation === "ASSIGN"
                  ? "Administrator"
                  : operation === "TAG"
                    ? "Tag"
                    : operation==='MERGE'?'Primary ticket':operation==='SPLIT'?'Subticket subject prefix':'Target status',
              )}
              value={value}
              select={operation === "STATUS" || operation === "ASSIGN" || operation==='MERGE'}
              onChange={(event) => setValue(event.target.value)}
            >
              {operation==='MERGE'&&tickets.map(ticket=><MenuItem key={ticket.id} value={ticket.id}>{ticket.id}</MenuItem>)}
              {operation === "ASSIGN" && [
                <MenuItem key="none" value="UNASSIGNED">
                  {uiText("Unassigned")}
                </MenuItem>,
                ...(agents.data || []).map((agent) => (
                  <MenuItem key={agent.id} value={String(agent.id)}>
                    {agent.username}
                  </MenuItem>
                )),
              ]}
              {operation === "STATUS" &&
                ["OPEN", "IN_PROGRESS", "PENDING", "ON_HOLD"].map((item) => (
                  <MenuItem value={item} key={item}>
                    {uiText(item)}
                  </MenuItem>
                ))}
            </TextField>
            {operation==='MERGE'&&<Alert severity="warning">{uiText('All selected tickets must have the same requester. The primary survives; histories are preserved and private notes are not copied.')}</Alert>}
            {operation==='SPLIT'&&<TextField disabled={review||mutation.isPending} label={uiText('Subticket description')} multiline minRows={3} value={details} onChange={event=>setDetails(event.target.value)} slotProps={{htmlInput:{minLength:10,maxLength:4000}}}/>}
            <TextField
              disabled={review || mutation.isPending}
              label={uiText("Reason")}
              value={reason}
              multiline
              onChange={(event) => setReason(event.target.value)}
              slotProps={{ htmlInput: { maxLength: 500 } }}
            />
            {review && (
              <Alert severity="info">
                {uiText(
                  "Confirm the operation, value and ticket list above before applying.",
                )}
              </Alert>
            )}
            {mutation.isError && (
              <Alert severity="error">{formatApiError(mutation.error)}</Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            disabled={mutation.isPending}
            onClick={() => {
              if (review) setReview(false);
              else setOpen(false);
            }}
          >
            {uiText(review ? "Back" : "Cancel")}
          </Button>
          <Button
              disabled={mutation.isPending || !value || reason.trim().length < 5 || operation==='SPLIT'&&details.trim().length<10 || operation==='MERGE'&&tickets.length<2}
            onClick={() => (review ? mutation.mutate() : setReview(true))}
          >
            {uiText(review ? "Confirm changes" : "Review")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
export function HelpdeskImport() {
  useUiLanguage();
  const client = useQueryClient();
  const [open, setOpen] = useState(false),
    [rows, setRows] = useState<any[]>([]),
    [fileError, setFileError] = useState("");
  const previewBody = useRef<any[] | null>(null);
  const preview = useMutation({
    mutationFn: () => api.post("/helpdesk/import", { rows, dryRun: true }),
    onSuccess: () => {
      previewBody.current = rows;
    },
  });
  const commit = useMutation({
    mutationFn: () =>
      api.post("/helpdesk/import", {
        rows: previewBody.current,
        dryRun: false,
        previewHash: preview.data?.data.previewHash,
      }),
    onSuccess: async () => {
      setRows([]);
      preview.reset();
      previewBody.current = null;
      await client.invalidateQueries({ queryKey: ["helpdesk-tickets"] });
    },
  });
  return (
    <>
      <Button onClick={() => setOpen(true)}>{uiText("Import tickets")}</Button>
      <Dialog
        open={open}
        onClose={() => {
          if (!commit.isPending && !preview.isPending) setOpen(false);
        }}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>{uiText("Import tickets with preview")}</DialogTitle>
        <DialogContent>
          <Stack gap={2}>
            <Alert severity="info">
              {uiText(
                "Imported tickets are raised under your own authenticated account. Imports cannot impersonate customers, set historical proof or mark issues resolved. Maximum 100 rows.",
              )}
            </Alert>
            <Button
              onClick={() =>
                tableToCSV(
                  ["subject", "description", "category", "priority"],
                  [
                    [
                      "Example issue",
                      "Describe the reproduction steps",
                      "BUG",
                      "NORMAL",
                    ],
                  ],
                  "helpdesk-import-template",
                )
              }
            >
              {uiText("Download CSV template")}
            </Button>
            <Button
              component="label"
              disabled={preview.isPending || commit.isPending}
            >
              {uiText("Choose CSV file")}
              <input
                hidden
                type="file"
                accept=".csv,text/csv"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  setFileError("");
                  preview.reset();
                  commit.reset();
                  previewBody.current = null;
                  try {
                    if (file.size > 1024 * 1024)
                      throw Error(uiText("Import file exceeds 1 MB."));
                    const workbook = read(await file.text(), {
                      type: "string",
                      raw: true,
                    });
                    const entries = utils.sheet_to_json<
                      Record<string, unknown>
                    >(workbook.Sheets[workbook.SheetNames[0]], { defval: "" });
                    if (entries.length < 1 || entries.length > 100)
                      throw Error(uiText("Choose a CSV with 1 to 100 rows."));
                    setRows(
                      entries.map((row) => ({
                        requestKey: crypto.randomUUID(),
                        subject: String(row.subject || ""),
                        description: String(row.description || ""),
                        category: String(row.category || "QUESTION"),
                        priority: String(row.priority || "NORMAL"),
                      })),
                    );
                  } catch (error) {
                    setRows([]);
                    setFileError(
                      error instanceof Error
                        ? error.message
                        : uiText("Could not read CSV file."),
                    );
                  }
                  event.target.value = "";
                }}
              />
            </Button>
            {fileError && <Alert severity="error">{fileError}</Alert>}
            {rows.map((row, index) => (
              <Typography key={row.requestKey}>
                {index + 1}. {row.subject} · {uiText(row.category)} ·{" "}
                {uiText(row.priority)}
              </Typography>
            ))}
            <Button
              disabled={!rows.length || preview.isPending || commit.isPending}
              onClick={() => preview.mutate()}
            >
              {uiText("Run import preview")}
            </Button>
            {(preview.isError || commit.isError) && (
              <Alert severity="error">
                {formatApiError(preview.error || commit.error)}
              </Alert>
            )}
            {preview.data && (
              <Alert severity={preview.data.data.valid ? "info" : "error"}>
                {uiText("New tickets")}: {preview.data.data.createCount} ·{" "}
                {uiText("Previously imported")}: {preview.data.data.replayCount}
                {preview.data.data.errors?.map((error: string) => (
                  <Typography key={error}>{error}</Typography>
                ))}
              </Alert>
            )}
            {commit.isSuccess && (
              <Alert severity="success">
                {uiText("Ticket import completed.")}
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            disabled={preview.isPending || commit.isPending}
            onClick={() => setOpen(false)}
          >
            {uiText("Close")}
          </Button>
          <Button
            disabled={
              !preview.data?.data.valid ||
              commit.isPending ||
              preview.isPending ||
              previewBody.current !== rows
            }
            onClick={() => commit.mutate()}
          >
            {uiText("Confirm reviewed import")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
