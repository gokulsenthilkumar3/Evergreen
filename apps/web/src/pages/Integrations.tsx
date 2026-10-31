import { useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  MenuItem,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import {
  CloudUploadOutlined,
  DownloadOutlined,
  CheckCircleOutline,
  HubOutlined,
  ArrowForward,
  Refresh,
} from "@mui/icons-material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  IMPORT_FIELDS,
  parseImportCsv,
  previewImport,
  type ImportEntity,
  type ImportInput,
  type ImportPreview,
} from "@evergreen/types";
import api from "../utils/api";

function download(data: BlobPart, filename: string, type: string) {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
async function errorMessage(error: unknown) {
  const e = error as {
    response?: { data?: { message?: string | string[] } | Blob };
    message?: string;
  };
  let data = e.response?.data;
  if (data instanceof Blob) {
    try {
      data = JSON.parse(await data.text());
    } catch {
      return "The export could not be completed. Please try again.";
    }
  }
  const message = (data as { message?: string | string[] })?.message;
  return Array.isArray(message)
    ? message.join(" ")
    : message ||
        e.message ||
        "Could not complete the request. Please try again.";
}
const labels: Record<string, string> = {
  sku: "SKU",
  name: "Name",
  phone: "Phone",
  email: "Email",
  gstin: "GSTIN",
  state: "State",
  address: "Address",
  type: "Item type",
  uom: "Unit",
  hsnSac: "HSN / SAC",
  gstRate: "GST rate (%)",
  salePrice: "Sale price",
};
const card = { p: { xs: 2, md: 3 }, borderRadius: 3 };
type Batch = {
  id: number;
  source: string;
  entity: string;
  rowCount: number;
  createdAt: string;
  createdBy: string;
};
type Summary = {
  stats: {
    salesCount: number;
    receiptCount: number;
    totalVouchers: number;
    skippedVoidInvoices?: number;
  };
  filename: string;
};
export default function Integrations() {
  const client = useQueryClient();
  const [tab, setTab] = useState(0),
    [entity, setEntity] = useState<ImportEntity>("customers");
  const [source, setSource] = useState(""),
    [filename, setFilename] = useState("");
  const [input, setInput] = useState<ImportInput | null>(null),
    [preview, setPreview] = useState<ImportPreview | null>(null);
  const [requestKey, setRequestKey] = useState(() => crypto.randomUUID()),
    [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [result, setResult] = useState("");
  const lock = useRef(false);
  const [from, setFrom] = useState(""),
    [to, setTo] = useState("");
  const [sales, setSales] = useState(true),
    [receipts, setReceipts] = useState(true),
    [summary, setSummary] = useState<Summary | null>(null);
  const [connection, setConnection] = useState<{
    connected: boolean;
    message: string;
  } | null>(null);
  const [invoiceId, setInvoiceId] = useState("");
  const [readiness, setReadiness] = useState<{
    invoiceNo: string;
    message: string;
    checks: Array<{ label: string; passed: boolean }>;
  } | null>(null);
  const history = useQuery<Batch[]>({
    queryKey: ["import-history"],
    queryFn: async () => (await api.get("/integrations/imports")).data,
    enabled: tab === 4,
  });
  const invoices = useQuery<
    Array<{ id: number; invoiceNo: string; status: string }>
  >({
    queryKey: ["integration-invoices"],
    queryFn: async () => (await api.get("/commerce/invoices")).data,
    enabled: tab === 2,
  });
  const invalidate = () => {
    setPreview(null);
    setConfirmed(false);
    setResult("");
    setError("");
    setRequestKey(crypto.randomUUID());
  };
  const run = async (work: () => Promise<void>) => {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      await work();
    } catch (e) {
      setError(await errorMessage(e));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  const required =
    entity === "customers" ? ["name"] : ["sku", "name", "type", "uom"];
  const template = () => {
    const fields = IMPORT_FIELDS[entity];
    const sample =
      entity === "customers"
        ? [
            "Example Textiles",
            "9876543210",
            "accounts@example.com",
            "",
            "Tamil Nadu",
            "Example address",
          ]
        : ["YARN-40", "Yarn 40s", "YARN", "KG", "5205", "5", "250"];
    download(
      fields.join(",") + "\r\n" + sample.join(",") + "\r\n",
      "evergreen-" + entity + "-template.csv",
      "text/csv;charset=utf-8",
    );
  };
  const choose = (file?: File) => {
    if (!file) return;
    void run(async () => {
      invalidate();
      setInput(null);
      setFilename("");
      if (file.size > 500_000)
        throw new Error("Choose a UTF-8 CSV smaller than 500 KB.");
      const parsed = parseImportCsv(await file.text());
      const mapping: Record<string, number> = {};
      const normalize = (s: string) =>
        s.toLowerCase().replace(/[^a-z0-9]/g, "");
      IMPORT_FIELDS[entity].forEach((field) => {
        const index = parsed.headers.findIndex(
          (header) => normalize(header) === normalize(field),
        );
        if (index >= 0) mapping[field] = index;
      });
      setInput({ entity, ...parsed, mapping });
      setFilename(file.name);
    });
  };
  const check = () =>
    run(async () => {
      if (!input) return;
      setPreview(null);
      setConfirmed(false);
      previewImport(input);
      setPreview((await api.post("/integrations/imports/preview", input)).data);
    });
  const commit = () =>
    run(async () => {
      if (
        !input ||
        !preview ||
        preview.issues.length ||
        !confirmed ||
        !source.trim() ||
        result
      )
        return;
      const { data } = await api.post("/integrations/imports/commit", {
        ...input,
        source,
        requestKey,
      });
      setResult(
        (data.replayed ? "Already imported" : "Import complete") +
          ": " +
          data.rowCount +
          " " +
          entity +
          " - Batch " +
          data.id,
      );
      setConfirmed(false);
      await Promise.all(
        ["import-history", "commerce-items", "commerce-customers"].map((key) =>
          client.invalidateQueries({ queryKey: [key] }),
        ),
      );
    });
  const params = {
    from: from || undefined,
    to: to || undefined,
    types: [sales ? "Sales" : "", receipts ? "Receipt" : ""]
      .filter(Boolean)
      .join(","),
  };
  const exportInvalid =
    (!sales && !receipts) || Boolean(from && to && from > to);
  const resetExport = () => {
    setSummary(null);
    setError("");
  };
  const exportXml = () =>
    run(async () => {
      if (exportInvalid) return;
      const response = await api.get("/integrations/tally/export", {
        params,
        responseType: "blob",
      });
      const disposition = String(response.headers["content-disposition"] || "");
      const name =
        /filename="([^"]+)"/.exec(disposition)?.[1] || "EverGreen-Tally.xml";
      download(response.data, name, "application/xml");
    });
  return (
    <Stack
      spacing={3}
      sx={{ maxWidth: 1200, mx: "auto", width: "100%", minWidth: 0 }}
    >
      <Paper
        variant="outlined"
        sx={{ ...card, borderTop: "4px solid", borderTopColor: "primary.main" }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <HubOutlined color="primary" sx={{ fontSize: 36 }} />
          <Box>
            <Typography variant="overline" color="primary">
              CONNECTED OPERATIONS
            </Typography>
            <Typography component="h1" variant="h4" fontWeight={800}>
              Integrations
            </Typography>
          </Box>
        </Stack>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Bring in your records. Prepare your accounts. Know exactly what is
          connected.
        </Typography>
        <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mt: 2 }}>
          <Chip
            size="small"
            color="success"
            variant="outlined"
            label="CSV import available"
          />
          <Chip
            size="small"
            color="success"
            variant="outlined"
            label="Tally XML export available"
          />
          <Chip
            size="small"
            variant="outlined"
            label="Live connectors require setup"
          />
        </Stack>
      </Paper>
      <Tabs
        value={tab}
        onChange={(_, value) => {
          setTab(value);
          setError("");
        }}
        variant="scrollable"
        scrollButtons="auto"
        aria-label="Integration workflows"
      >
        {[
          "Import data",
          "TallyPrime",
          "e-Way Bill",
          "Regional connectors",
          "Import history",
        ].map((label) => (
          <Tab key={label} label={label} disabled={busy} />
        ))}
      </Tabs>
      {error && (
        <Alert severity="error" onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {busy && (
        <Stack direction="row" spacing={1} alignItems="center" role="status">
          <CircularProgress size={18} />
          <Typography variant="body2">
            Working... Please keep this page open.
          </Typography>
        </Stack>
      )}
      {tab === 0 && (
        <Paper variant="outlined" sx={card}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" fontWeight={750}>
                A careful start for your existing data
              </Typography>
              <Typography color="text.secondary">
                Add customer and catalogue records without overwriting existing
                records. Up to 500 rows per UTF-8 CSV, 500 KB maximum.
              </Typography>
            </Box>
            <Stepper
              activeStep={result ? 3 : preview ? 2 : input ? 1 : 0}
              alternativeLabel
            >
              {["Choose file", "Map columns", "Review & import"].map(
                (label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ),
              )}
            </Stepper>
            <Alert severity="info">
              Imports add master records only. Opening stock, invoices, payments
              and balances need separate reconciliation.
            </Alert>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                select
                label="Import into"
                value={entity}
                disabled={busy}
                fullWidth
                onChange={(e) => {
                  setEntity(e.target.value as ImportEntity);
                  setInput(null);
                  setFilename("");
                  invalidate();
                }}
              >
                <MenuItem value="customers">Customers</MenuItem>
                <MenuItem value="items">Catalogue items</MenuItem>
              </TextField>
              <Button
                startIcon={<DownloadOutlined />}
                onClick={template}
                sx={{ flexShrink: 0 }}
              >
                Download template
              </Button>
            </Stack>
            <TextField
              label="Source name"
              value={source}
              disabled={busy}
              required
              onChange={(e) => {
                setSource(e.target.value);
                invalidate();
              }}
              helperText="A name you can recognize in history, such as October customer register."
              slotProps={{ htmlInput: { maxLength: 200 } }}
            />
            <Box
              sx={{
                border: "1px dashed",
                borderColor: "divider",
                borderRadius: 2,
                p: 3,
                textAlign: "center",
                bgcolor: "action.hover",
              }}
            >
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadOutlined />}
                disabled={busy}
              >
                Choose CSV file
                <input
                  aria-label="Choose CSV file"
                  type="file"
                  accept=".csv,text/csv"
                  hidden
                  onChange={(e) => {
                    choose(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
              </Button>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {filename || "Use your own file or start with a template."}
              </Typography>
            </Box>
            {input && (
              <>
                <Typography fontWeight={700}>
                  {input.rows.length} records - Match your columns
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                    gap: 2,
                  }}
                >
                  {IMPORT_FIELDS[entity].map((field) => (
                    <TextField
                      key={field}
                      select
                      label={labels[field]}
                      required={required.includes(field)}
                      disabled={busy}
                      value={input.mapping[field] ?? ""}
                      onChange={(e) => {
                        const mapping = { ...input.mapping };
                        if (e.target.value === "") delete mapping[field];
                        else mapping[field] = Number(e.target.value);
                        setInput({ ...input, mapping });
                        invalidate();
                      }}
                    >
                      <MenuItem value="">Do not import</MenuItem>
                      {input.headers.map((header, index) => (
                        <MenuItem
                          key={index}
                          value={index}
                          disabled={Object.entries(input.mapping).some(
                            ([key, col]) => key !== field && col === index,
                          )}
                        >
                          {header}
                        </MenuItem>
                      ))}
                    </TextField>
                  ))}
                </Box>
                <Button
                  variant="outlined"
                  disabled={
                    busy ||
                    required.some((field) => input.mapping[field] === undefined)
                  }
                  onClick={check}
                >
                  Validate and preview
                </Button>
              </>
            )}
            {preview && (
              <>
                <Alert severity={preview.issues.length ? "warning" : "success"}>
                  {preview.records.length} records checked -{" "}
                  {preview.issues.length} issues to resolve
                </Alert>
                <Typography variant="body2" color="text.secondary">
                  Ignored columns: {preview.ignoredHeaders.join(", ") || "None"}
                </Typography>
                {preview.issues.length > 0 && (
                  <Box sx={{ maxHeight: 260, overflow: "auto" }}>
                    {preview.issues.map((issue, i) => (
                      <Typography
                        key={i}
                        color="error"
                        variant="body2"
                        sx={{ py: 0.5 }}
                      >
                        Row {issue.row} - {labels[issue.field] || issue.field}:{" "}
                        {issue.message}
                      </Typography>
                    ))}
                  </Box>
                )}
                <Typography variant="subtitle2">
                  Normalized preview - first 5 records
                </Typography>
                <TableContainer sx={{ maxHeight: 300 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        {Object.keys(preview.records[0] || {}).map((key) => (
                          <TableCell key={key}>{labels[key] || key}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {preview.records.slice(0, 5).map((record, i) => (
                        <TableRow key={i}>
                          {Object.entries(record).map(([key, value]) => (
                            <TableCell
                              key={key}
                              sx={{ overflowWrap: "anywhere", maxWidth: 220 }}
                            >
                              {String(value)}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                {!result && (
                  <>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={confirmed}
                          disabled={busy || !!preview.issues.length}
                          onChange={(e) => setConfirmed(e.target.checked)}
                        />
                      }
                      label="I reviewed the mapping and want to add these records to this company."
                    />
                    <Button
                      variant="contained"
                      disabled={
                        busy ||
                        !confirmed ||
                        !!preview.issues.length ||
                        !source.trim()
                      }
                      onClick={commit}
                      endIcon={<ArrowForward />}
                    >
                      Import {preview.records.length} records
                    </Button>
                  </>
                )}
              </>
            )}
            {result && (
              <Alert
                severity="success"
                action={
                  <Button
                    onClick={() => {
                      setInput(null);
                      setFilename("");
                      setSource("");
                      invalidate();
                    }}
                  >
                    Start another import
                  </Button>
                }
              >
                {result}
              </Alert>
            )}
          </Stack>
        </Paper>
      )}
      {tab === 1 && (
        <Stack spacing={3}>
          <Paper variant="outlined" sx={card}>
            <Stack spacing={2}>
              <Typography variant="h6" fontWeight={750}>
                Export to TallyPrime
              </Typography>
              <Typography color="text.secondary">
                Review the period, create the matching ledgers in Tally and
                import the XML once. Re-importing the same file can create
                duplicate vouchers.
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  type="date"
                  label="From"
                  value={from}
                  disabled={busy}
                  onChange={(e) => {
                    setFrom(e.target.value);
                    resetExport();
                  }}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
                <TextField
                  type="date"
                  label="To (inclusive)"
                  value={to}
                  disabled={busy}
                  onChange={(e) => {
                    setTo(e.target.value);
                    resetExport();
                  }}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Stack>
              <Typography variant="caption" color="text.secondary">
                Leave dates empty for all records. Dates follow the API server's
                business clock.
              </Typography>
              <Stack direction="row" flexWrap="wrap">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={sales}
                      disabled={busy}
                      onChange={(e) => {
                        setSales(e.target.checked);
                        resetExport();
                      }}
                    />
                  }
                  label="Sales invoices"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={receipts}
                      disabled={busy}
                      onChange={(e) => {
                        setReceipts(e.target.checked);
                        resetExport();
                      }}
                    />
                  }
                  label="Receipts & reversals"
                />
              </Stack>
              {exportInvalid && (
                <Alert severity="warning">
                  Choose at least one voucher type and a valid date range.
                </Alert>
              )}
              <Button
                variant="outlined"
                disabled={busy || exportInvalid}
                onClick={() =>
                  run(async () =>
                    setSummary(
                      (await api.get("/integrations/tally/summary", { params }))
                        .data,
                    ),
                  )
                }
              >
                Preview voucher counts
              </Button>
              {summary && (
                <Alert severity="info">
                  {summary.stats.totalVouchers} vouchers -{" "}
                  {summary.stats.salesCount} sales -{" "}
                  {summary.stats.receiptCount} receipts/reversals -{" "}
                  {summary.stats.skippedVoidInvoices || 0} void invoices
                  excluded
                </Alert>
              )}
              <Button
                startIcon={<DownloadOutlined />}
                variant="contained"
                disabled={
                  busy ||
                  exportInvalid ||
                  !summary ||
                  summary.stats.totalVouchers === 0
                }
                onClick={exportXml}
              >
                Download Tally XML
              </Button>
            </Stack>
          </Paper>
          <Paper variant="outlined" sx={card}>
            <Stack spacing={2}>
              <Typography variant="h6">Local connection check</Typography>
              <Typography color="text.secondary">
                Run TallyPrime on the API machine, load the company and enable
                its HTTP server (port 9000 by default). This check reads company
                availability; it does not sync or post vouchers.
              </Typography>
              <Button
                startIcon={<Refresh />}
                disabled={busy}
                onClick={() =>
                  run(async () =>
                    setConnection(
                      (await api.get("/integrations/tally/connection")).data,
                    ),
                  )
                }
              >
                Check Tally connection
              </Button>
              {connection && (
                <Alert severity={connection.connected ? "success" : "warning"}>
                  {connection.message}
                </Alert>
              )}
              <Alert severity="info">
                Automatic synchronization still needs a desktop bridge, ledger
                mapping, durable delivery and Tally acknowledgements. CSV and
                XML exports work without a live connection.
              </Alert>
            </Stack>
          </Paper>
        </Stack>
      )}
      {tab === 2 && (
        <Paper variant="outlined" sx={card}>
          <Stack spacing={2}>
            <Typography variant="h6" fontWeight={750}>
              Prepare for e-Way Bill registration
            </Typography>
            <Alert severity="warning">
              Provider setup required. This workspace does not issue e-Way Bill
              numbers or submit transport documents.
            </Alert>
            <Typography color="text.secondary">
              Start with an invoice checklist, then complete authorized GSP/NIC
              sandbox onboarding. Confirm ship-to and dispatch addresses,
              pincodes, HSN codes and transport-mode-specific details before
              submission.
            </Typography>
            {invoices.isLoading && (
              <Typography role="status">Loading invoices...</Typography>
            )}
            {invoices.isError && (
              <Alert
                severity="error"
                action={
                  <Button onClick={() => invoices.refetch()}>Retry</Button>
                }
              >
                Invoices could not be loaded.
              </Alert>
            )}
            {invoices.data?.length === 0 && (
              <Alert severity="info">
                Create an invoice in Business Desk to check its readiness.
              </Alert>
            )}
            <TextField
              select
              label="Invoice"
              value={invoiceId}
              disabled={busy}
              onChange={(e) => {
                setInvoiceId(e.target.value);
                setReadiness(null);
              }}
            >
              <MenuItem value="">Choose an invoice</MenuItem>
              {invoices.data
                ?.filter((row) => row.status !== "VOID")
                .map((row) => (
                  <MenuItem key={row.id} value={row.id}>
                    {row.invoiceNo}
                  </MenuItem>
                ))}
            </TextField>
            <Button
              variant="outlined"
              disabled={busy || !invoiceId}
              onClick={() =>
                run(async () =>
                  setReadiness(
                    (
                      await api.get(
                        "/integrations/eway-bill/readiness/" + invoiceId,
                      )
                    ).data,
                  ),
                )
              }
            >
              Check invoice preparation
            </Button>
            {readiness && (
              <>
                <Typography fontWeight={700}>{readiness.invoiceNo}</Typography>
                {readiness.checks.map((check) => (
                  <Stack
                    key={check.label}
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    gap={2}
                  >
                    <Typography variant="body2">{check.label}</Typography>
                    <Chip
                      size="small"
                      variant="outlined"
                      color={check.passed ? "success" : "warning"}
                      label={check.passed ? "Present" : "Needs attention"}
                    />
                  </Stack>
                ))}
                <Alert severity="info">{readiness.message}</Alert>
              </>
            )}
            <Button
              component="a"
              href="https://docs.ewaybillgst.gov.in/apidocs/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Official e-Way Bill onboarding & API documentation
            </Button>
          </Stack>
        </Paper>
      )}
      {tab === 3 && (
        <Stack spacing={2}>
          <Alert severity="info">
            Regional integration research - these adapters are planned, not
            connected. Local tax identity, currency, language and authorized
            provider onboarding need validation for each market.
          </Alert>
          {[
            [
              "India",
              "GST / TallyPrime / e-Way Bill",
              "CSV migration and Tally XML export are available. Live sync needs acknowledgement and reconciliation. e-Way Bill needs authorized provider onboarding.",
              "https://docs.ewaybillgst.gov.in/apidocs/",
            ],
            [
              "China",
              "Fully digitalized electronic invoices",
              "Plan a dedicated local invoice adapter, tax identity validation, Chinese text and correction/return workflows.",
              "https://english.www.gov.cn/news/202411/25/content_WS6743b13ac6d0868f4e8ed5e1.html",
            ],
            [
              "Vietnam",
              "Electronic invoice ecosystem",
              "Validate a local provider, Vietnamese invoice fields, signing requirements and correction workflows before implementation.",
              "https://vanban.chinhphu.vn/?docid=213179&lang=vi&pageid=27160",
            ],
            [
              "Singapore",
              "InvoiceNow / Peppol",
              "Plan business registration, a Peppol access-point provider, structured documents and delivery responses.",
              "https://www.imda.gov.sg/how-we-can-help/nationwide-e-invoicing-framework/invoicenow",
            ],
            [
              "Malaysia",
              "MyInvois",
              "Plan taxpayer identity checks, signed document submission, status polling, cancellation and rejection handling.",
              "https://sdk.myinvois.hasil.gov.my/",
            ],
          ].map(([country, title, detail, href]) => (
            <Paper key={country} variant="outlined" sx={card}>
              <Stack
                direction="row"
                alignItems="center"
                gap={1}
                flexWrap="wrap"
              >
                <Typography variant="overline" color="primary">
                  {country}
                </Typography>
                <Chip
                  size="small"
                  label={
                    country === "India"
                      ? "Partially available"
                      : "Research / planned"
                  }
                  variant="outlined"
                />
              </Stack>
              <Typography variant="h6">{title}</Typography>
              <Typography color="text.secondary" sx={{ my: 1 }}>
                {detail}
              </Typography>
              <Button
                component="a"
                href={href}
                target="_blank"
                rel="noopener noreferrer"
              >
                Official reference
              </Button>
            </Paper>
          ))}
          <Divider />
          <Typography variant="h6">API & automation</Typography>
          <Typography color="text.secondary">
            Administrator endpoints support import preview, import commit,
            history, Tally XML and invoice preparation. Scoped integration keys,
            signed webhooks, delivery queues and automatic retries remain
            planned. Keep staff credentials private.
          </Typography>
        </Stack>
      )}
      {tab === 4 && (
        <Paper variant="outlined" sx={card}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">Import history</Typography>
            <Button
              disabled={history.isFetching}
              startIcon={<Refresh />}
              onClick={() => history.refetch()}
            >
              Refresh
            </Button>
          </Stack>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Latest 50 completed batches. A failed import creates no partial
            batch.
          </Typography>
          {history.isLoading && (
            <Typography role="status">Loading import history...</Typography>
          )}
          {history.isError && (
            <Alert
              severity="error"
              action={<Button onClick={() => history.refetch()}>Retry</Button>}
            >
              Import history could not be loaded.
            </Alert>
          )}
          {history.data?.length === 0 && (
            <Box sx={{ textAlign: "center", py: 5 }}>
              <CheckCircleOutline color="disabled" sx={{ fontSize: 40 }} />
              <Typography sx={{ mt: 1 }}>
                Your import history starts here.
              </Typography>
              <Button onClick={() => setTab(0)}>Import your first CSV</Button>
            </Box>
          )}
          {Boolean(history.data?.length) && (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {["Batch", "Source", "Records", "Imported by", "Date"].map(
                      (label) => (
                        <TableCell key={label}>{label}</TableCell>
                      ),
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {history.data?.map((batch) => (
                    <TableRow key={batch.id}>
                      <TableCell>#{batch.id}</TableCell>
                      <TableCell sx={{ overflowWrap: "anywhere" }}>
                        {batch.source}
                      </TableCell>
                      <TableCell>
                        {batch.rowCount} {batch.entity}
                      </TableCell>
                      <TableCell>{batch.createdBy}</TableCell>
                      <TableCell>
                        {new Date(batch.createdAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}
    </Stack>
  );
}
