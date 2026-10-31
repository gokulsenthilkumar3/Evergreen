import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Collapse,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  ArrowForward,
  Fingerprint,
  LockOutlined,
  Visibility,
  VisibilityOff,
  CheckCircleOutline,
  Inventory2Outlined,
  HubOutlined,
  ShieldOutlined,
} from "@mui/icons-material";
import { startAuthentication } from "@simplewebauthn/browser";
import api from "../utils/api";
import { saveSession } from "../utils/authStorage";

interface LoginProps {
  onLoginSuccess: (user: unknown) => void;
  settings?: { companyName?: string };
  onSwitchToSignup?: () => void;
}
export default function Login({ onLoginSuccess, settings }: LoginProps) {
  const [username, setUsername] = useState(""),
    [password, setPassword] = useState("");
  const [code, setCode] = useState(""),
    [mfa, setMfa] = useState(false);
  const [visible, setVisible] = useState(false),
    [remember, setRemember] = useState(false);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [help, setHelp] = useState(false),
    [caps, setCaps] = useState(false);
  const lock = useRef(false),
    codeRef = useRef<HTMLInputElement>(null);
  const passkeySupported =
    typeof window.PublicKeyCredential !== "undefined" && window.isSecureContext;
  useEffect(() => {
    if (mfa) codeRef.current?.focus();
  }, [mfa]);
  useEffect(() => {
    document.title = "Sign in | EverGreen";
  }, []);
  const finish = (data: { access_token: string; user: unknown }) => {
    if (!data.access_token || !data.user)
      throw new Error(
        "The server returned an incomplete sign-in response. Please try again.",
      );
    saveSession(data.access_token, data.user, remember);
    onLoginSuccess(data.user);
  };
  const report = (e: unknown) => {
    const err = e as {
      response?: { status?: number; data?: { message?: string | string[] } };
      name?: string;
    };
    const message = err.response?.data?.message;
    if (message === "TOTP_REQUIRED") {
      setMfa(true);
      setCode("");
      return;
    }
    if (err.name === "NotAllowedError" || err.name === "AbortError")
      setError(
        "Passkey sign-in was cancelled. Try again or use your password.",
      );
    else if (err.response?.status === 429)
      setError("Too many attempts. Please wait a minute before trying again.");
    else if (!err.response)
      setError(
        "Could not complete sign-in. Check your connection and try again.",
      );
    else
      setError(
        Array.isArray(message)
          ? message.join(" ")
          : message || "Sign-in failed. Check your details and try again.",
      );
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (lock.current) return;
    if (!username.trim() || !password || (mfa && !/^\d{6}$/.test(code))) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      finish(
        (
          await api.post("/auth/login", {
            username: username.trim(),
            password,
            ...(mfa ? { totpCode: code } : {}),
          })
        ).data,
      );
    } catch (e) {
      report(e);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  const passkey = async () => {
    if (lock.current) return;
    if (!username.trim()) {
      setError("Enter your username to find your passkey.");
      return;
    }
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      const options = (
        await api.post("/auth/passkey/auth-options", {
          username: username.trim(),
        })
      ).data;
      const response = await startAuthentication({ optionsJSON: options });
      finish(
        (
          await api.post("/auth/passkey/auth-verify", {
            username: username.trim(),
            response,
          })
        ).data,
      );
    } catch (e) {
      report(e);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  return (
    <Box
      component="main"
      sx={{
        minHeight: "100dvh",
        width: "100%",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1.05fr 1fr" },
        bgcolor: "background.default",
      }}
    >
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "space-between",
          p: { md: 5, lg: 8 },
          color: "#ecfdf5",
          bgcolor: "#062f2a",
          backgroundImage:
            "radial-gradient(ellipse at 0% 100%, #115e59 0%, transparent 65%)",
          overflow: "hidden",
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 42,
              height: 42,
              border: "1px solid #5eead4",
              borderRadius: 2,
              display: "grid",
              placeItems: "center",
              fontWeight: 900,
            }}
          >
            E
          </Box>
          <Typography fontWeight={800} letterSpacing={2}>
            EVERGREEN
          </Typography>
        </Stack>
        <Box sx={{ py: 8, maxWidth: 550 }}>
          <Chip
            label="YOUR BUSINESS, CONNECTED"
            sx={{
              color: "#99f6e4",
              bgcolor: "#ffffff10",
              mb: 3,
              letterSpacing: 1,
            }}
          />
          <Typography
            component="h2"
            sx={{
              fontSize: { md: 44, lg: 58 },
              lineHeight: 1.08,
              fontWeight: 800,
              letterSpacing: -2,
            }}
          >
            From the factory floor.
            <br />
            To the bigger picture.
          </Typography>
          <Typography
            sx={{ color: "#b8d9d2", fontSize: 18, mt: 3, lineHeight: 1.8 }}
          >
            A shared workspace for your inventory, production, customers and
            accounts.
          </Typography>
          <Stack spacing={2.5} sx={{ mt: 5 }}>
            {[
              [
                <Inventory2Outlined key="stock" />,
                "Follow every movement",
                "Stock, batches and production in one place.",
              ],
              [
                <HubOutlined key="flows" />,
                "Keep your teams connected",
                "Move from orders to invoices with a shared record.",
              ],
              [
                <ShieldOutlined key="access" />,
                "Access with accountability",
                "Individual staff accounts and role-based permissions.",
              ],
            ].map(([icon, title, detail], i) => (
              <Stack key={i} direction="row" spacing={2}>
                <Box sx={{ color: "#5eead4", pt: 0.5 }}>{icon}</Box>
                <Box>
                  <Typography fontWeight={700}>{title}</Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#b8d9d2", mt: 0.5 }}
                  >
                    {detail}
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Stack>
        </Box>
        <Typography variant="caption" sx={{ color: "#b8d9d2" }}>
          EverGreen - Built for the work behind your business
        </Typography>
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 3, sm: 5 },
          py: 6,
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 420 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 5 }}>
            <LockOutlined color="primary" />
            <Typography fontWeight={800}>
              {settings?.companyName || "EverGreen workspace"}
            </Typography>
          </Stack>
          <Typography
            component="h1"
            variant="h3"
            sx={{ fontWeight: 800, letterSpacing: -1.5 }}
          >
            {mfa ? "Verify it's you" : "Welcome back."}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1.5, mb: 3 }}>
            {mfa
              ? "Enter the six-digit code from your authenticator app."
              : "Sign in to continue to your business workspace."}
          </Typography>
          <Paper
            variant="outlined"
            sx={{
              p: 1.5,
              mb: 3,
              borderRadius: 2,
              bgcolor: "background.default",
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <CheckCircleOutline color="primary" fontSize="small" />
              <Typography variant="caption" sx={{ overflowWrap: "anywhere" }}>
                Workspace: {window.location.host}
              </Typography>
            </Stack>
          </Paper>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box component="form" onSubmit={submit} aria-busy={busy}>
            <Stack spacing={2.5}>
              {!mfa ? (
                <>
                  <TextField
                    label="Username"
                    name="username"
                    autoComplete="username"
                    autoFocus
                    required
                    fullWidth
                    disabled={busy}
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setError("");
                    }}
                    slotProps={{ htmlInput: { maxLength: 200 } }}
                  />
                  <TextField
                    label="Password"
                    name="password"
                    autoComplete="current-password"
                    required
                    fullWidth
                    disabled={busy}
                    type={visible ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyUp={(e) => setCaps(e.getModifierState("CapsLock"))}
                    helperText={caps ? "Caps Lock is on" : undefined}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label={
                                visible ? "Hide password" : "Show password"
                              }
                              onClick={() => setVisible(!visible)}
                              edge="end"
                            >
                              <>
                                {visible ? <VisibilityOff /> : <Visibility />}
                              </>
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </>
              ) : (
                <>
                  <Typography variant="body2">
                    Signing in as <strong>{username}</strong>
                  </Typography>
                  <TextField
                    inputRef={codeRef}
                    label="Authenticator code"
                    autoComplete="one-time-code"
                    required
                    value={code}
                    disabled={busy}
                    onChange={(e) =>
                      setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    slotProps={{
                      htmlInput: {
                        inputMode: "numeric",
                        pattern: "[0-9]{6}",
                        maxLength: 6,
                      },
                    }}
                  />
                </>
              )}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={remember}
                    disabled={busy}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                }
                label={
                  <Typography variant="body2">
                    Keep me signed in on this device
                  </Typography>
                }
              />
              <Button
                type="submit"
                size="large"
                variant="contained"
                disabled={
                  busy ||
                  !username.trim() ||
                  !password ||
                  (mfa && code.length !== 6)
                }
                endIcon={
                  busy ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <ArrowForward />
                  )
                }
                sx={{ py: 1.6, borderRadius: 2 }}
              >
                {busy ? "Signing in..." : mfa ? "Verify and sign in" : "Sign in"}
              </Button>
              {mfa ? (
                <Button
                  disabled={busy}
                  onClick={() => {
                    setMfa(false);
                    setCode("");
                    setPassword("");
                    setError("");
                  }}
                >
                  Use a different sign-in
                </Button>
              ) : (
                <>
                  <Divider>
                    <Typography variant="caption" color="text.secondary">
                      OR
                    </Typography>
                  </Divider>
                  <Button
                    variant="outlined"
                    size="large"
                    disabled={busy || !passkeySupported}
                    startIcon={<Fingerprint />}
                    onClick={passkey}
                    sx={{ py: 1.4, borderRadius: 2 }}
                  >
                    Sign in with a passkey
                  </Button>
                  {!passkeySupported && (
                    <Typography variant="caption" color="text.secondary">
                      Passkeys need a supported browser on HTTPS or localhost.
                    </Typography>
                  )}
                </>
              )}
            </Stack>
          </Box>
          <Button
            onClick={() => setHelp(!help)}
            aria-expanded={help}
            sx={{ mt: 3 }}
          >
            Need help signing in?
          </Button>
          <Collapse in={help}>
            <Alert severity="info" sx={{ mt: 1 }}>
              Contact your company administrator to recover access or reset your
              authenticator. Staff accounts are created by your administrator.
            </Alert>
          </Collapse>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 4 }}
          >
            On a shared computer, leave Keep me signed in unchecked and sign
            out when you finish.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
