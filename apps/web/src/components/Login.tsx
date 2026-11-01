import { uiText, useUiLanguage } from "../i18n";
import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Link,
    Alert,
    CircularProgress,
    IconButton,
    InputAdornment,
    Checkbox,
    FormControlLabel,
    useTheme,
    alpha,
    Collapse,
    keyframes,
    Fade,
    Zoom
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    ArrowForward as ArrowIcon,
    ErrorOutline as ErrorIcon,
    CheckCircle as CheckCircleIcon,
    LockOutlined as LockIcon,
    AutoAwesome as SparkleIcon
} from '@mui/icons-material';
import api from '../utils/api';
import { startAuthentication } from '@simplewebauthn/browser';
import { RequestPasswordReset } from './AccountRecovery';
import { saveSession } from '../utils/authStorage';
import { OidcSignIn } from './OidcAccess';

// --- Animations ---
const shake = keyframes`
  0% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  50% { transform: translateX(10px); }
  75% { transform: translateX(-5px); }
  100% { transform: translateX(0); }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
`;

const floatReverse = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(20px); }
  100% { transform: translateY(0px); }
`;

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

interface LoginProps {
    onLoginSuccess: (user: any) => void;
    settings?: any;
    onSwitchToSignup?: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, settings, onSwitchToSignup }) => {
  useUiLanguage();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [totpCode, setTotpCode] = useState('');
    const [useRecoveryCode, setUseRecoveryCode] = useState(false);
    const [recoveryCode, setRecoveryCode] = useState('');
    const [requiresTotp, setRequiresTotp] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [shakeAnimation, setShakeAnimation] = useState(false);

    const theme = useTheme();

    useEffect(() => {
        if (error) {
            setShakeAnimation(true);
            const timer = setTimeout(() => setShakeAnimation(false), 500);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (success || loading) return;

        setLoading(true);
        setError(null);

        try {
            const payload = { username: username.trim(), password, ...(useRecoveryCode ? { recoveryCode } : totpCode ? { totpCode } : {}) };
            const response = await api.post('/auth/login', payload);

            setSuccess(true);
            saveSession(response.data.access_token, response.data.user, rememberMe);
            onLoginSuccess(response.data.user);

        } catch (err: any) {
            if (err.response?.data?.message === 'TOTP_REQUIRED') {
                setRequiresTotp(true);
                setError(null);
            } else {
                setError(err.response?.data?.message || 'Check your connection and try again.');
            }
            setLoading(false);
        }
    };

    const handlePasskeyLogin = async () => {
        if (loading || success) return;
        if (!username.trim()) {
            setError('Please enter your username first to use Passkey.');
            return;
        }

        setError(null);
        setLoading(true);
        try {
            const optsRes = await api.post('/auth/passkey/auth-options', { username: username.trim() });
            const asseResp = await startAuthentication({ optionsJSON: optsRes.data });
            
            const verifyRes = await api.post('/auth/passkey/auth-verify', { username: username.trim(), response: asseResp });
            
            setSuccess(true);
            saveSession(verifyRes.data.access_token, verifyRes.data.user, rememberMe);
            onLoginSuccess(verifyRes.data.user);

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Passkey authentication failed');
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100dvh',
                width: '100%',
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                alignItems: 'stretch',
                position: 'relative',
                overflow: 'hidden',
                px: 0,
                py: 0,
                background: theme.palette.mode === 'dark'
                    ? `radial-gradient(circle at 50% 50%, #1e293b 0%, #0f172a 100%)`
                    : `radial-gradient(circle at 50% 50%, #f1f5f9 0%, #e2e8f0 100%)`,
            }}
        >
            <Box sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column', justifyContent: 'space-between', minHeight: '100dvh', p: { md: 5, lg: 8 }, bgcolor: '#0b332c', color: '#ecfdf5', zIndex: 1 }}>
                <Typography sx={{ fontSize: 18, fontWeight: 800, letterSpacing: 2 }}>{uiText("EVERGREEN")}</Typography>
                <Box sx={{ maxWidth: 560, py: 6 }}>
                    <Typography sx={{ color: '#8cceba', fontSize: 12, fontWeight: 700, letterSpacing: 2, mb: 3 }}>{uiText("YOUR BUSINESS WORKSPACE")}</Typography>
                    <Typography component="h2" sx={{ fontSize: { md: 44, lg: 60 }, lineHeight: 1.1, letterSpacing: '-.04em', fontWeight: 700 }}>{uiText("Every thread.")}<br />{uiText("One connected business.")}</Typography>
                    <Typography sx={{ mt: 3, color: '#b7d4ca', fontSize: 17, lineHeight: 1.7, maxWidth: 450 }}>{uiText("Manage materials, production, inventory and accounts from a shared workspace.")}</Typography>
                    <Box sx={{ mt: 5, borderTop: '1px solid #ffffff25' }}>
                        {['Material inward & inventory', 'Production & dispatch', 'Billing & business records'].map((label, index) => <Box key={label} sx={{ display: 'flex', gap: 3, py: 2, borderBottom: '1px solid #ffffff25', alignItems: 'center' }}><Typography sx={{ fontFamily: 'monospace', fontSize: 12, color: '#8cceba' }}>0{index + 1}</Typography><Typography sx={{ fontSize: 14 }}>{uiText(label, 'forms')}</Typography></Box>)}
                    </Box>
                </Box>
                <Typography sx={{ fontSize: 12, color: '#b7d4ca' }}>{uiText("Built for the work behind your business.")}</Typography>
            </Box>
            {/* Animated Background Blobs */}
            <Box sx={{
                position: 'absolute',
                top: '-10%',
                left: '-10%',
                width: '60vw',
                height: '60vw',
                borderRadius: '50%',
                background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.2)} 0%, transparent 70%)`,
                filter: 'blur(60px)',
                animation: `${float} 10s ease-in-out infinite`,
                zIndex: 0,
            }} />
            <Box sx={{
                position: 'absolute',
                bottom: '-10%',
                right: '-10%',
                width: '50vw',
                height: '50vw',
                borderRadius: '50%',
                background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.15)} 0%, transparent 70%)`,
                filter: 'blur(60px)',
                animation: `${floatReverse} 15s ease-in-out infinite`,
                zIndex: 0,
            }} />

            <Zoom in={true} style={{ transitionDelay: '100ms' }}>
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 3, sm: 5, lg: 8 },
                        width: '100%',
                        maxWidth: 'none',
                        minHeight: '100dvh',
                        borderRadius: 0,
                        zIndex: 1,
                        position: 'relative',
                        overflow: 'hidden',
                        bgcolor: 'background.paper',
                        border: 0,
                        borderColor: theme.palette.mode === 'dark'
                            ? alpha('#ffffff', 0.1)
                            : alpha('#ffffff', 0.4),
                        boxShadow: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        '& > *': { width: '100%', maxWidth: 420 },
                        animation: shakeAnimation ? `${shake} 0.5s cubic-bezier(.36,.07,.19,.97) both` : 'none',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    }}
                >
                    <Box sx={{ animation: `${fadeInUp} 0.6s ease-out forwards`, opacity: 0, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                        <Box sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '20px',
                            display: 'grid',
                            placeItems: 'center',
                            mb: 2,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: 'primary.main',
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.16)}`
                        }}>
                            <LockIcon />
                        </Box>


                        <Box sx={{ textAlign: 'center', mb: 3 }}>
                            {settings?.logo ? (
                                <Box
                                    component="img"
                                    src={settings.logo}
                                    alt={uiText("Logo")}
                                    sx={{
                                        height: 80,
                                        width: 'auto',
                                        mb: 2,
                                        objectFit: 'contain'
                                    }}
                                />
                            ) : null}
                            <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', letterSpacing: '-0.5px', mb: 0.5 }}>
                                {settings?.companyName?.toUpperCase() || 'EVER GREEN'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, opacity: 0.8 }}>
                                {uiText("Yarn Management Solution ")}</Typography>
                        </Box>
                    </Box>

                    <Box sx={{ width: '100%', mb: 2, animation: `${fadeInUp} 0.6s ease-out 0.2s forwards`, opacity: 0 }}>
                        <Typography component="h1" variant="h5" sx={{ mb: 0.5, fontWeight: 800, ml: 1 }}>
                            {uiText("Sign In ")}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, ml: 1 }}>
                            {uiText("Welcome back. Let’s pick up where you left off. ")}</Typography>
                        <Collapse in={!!error}>
                            <Alert
                                severity="error"
                                icon={<ErrorIcon fontSize="inherit" />}
                                sx={{
                                    borderRadius: 2,
                                    bgcolor: alpha(theme.palette.error.main, 0.1),
                                    color: theme.palette.error.main,
                                    border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                                    '& .MuiAlert-icon': {
                                        color: theme.palette.error.main
                                    }
                                }}
                            >
                                {uiText(error || '')}
                            </Alert>
                        </Collapse>
                    </Box>

                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                        sx={{
                            width: '100%',
                            animation: `${fadeInUp} 0.6s ease-out 0.4s forwards`,
                            opacity: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2
                        }}
                    >
                        {!requiresTotp ? (
                            <>
                                <TextField
                                    required
                                    fullWidth
                                    id="username"
                                    label={uiText("Username", 'forms')}
                                    name="username"
                                    autoComplete="username"
                                    autoFocus
                                    value={username}
                                    onChange={(e) => {
                                        setUsername(e.target.value);
                                        if (error) setError(null);
                                    }}
                                    variant="outlined"
                                    InputProps={{
                                        sx: {
                                            borderRadius: 2,
                                            bgcolor: alpha(theme.palette.background.paper, 0.4),
                                            transition: 'background-color 0.2s, box-shadow 0.2s',
                                            '&.Mui-focused': {
                                                bgcolor: alpha(theme.palette.background.paper, 0.8),
                                                boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.1)}`
                                            }
                                        }
                                    }}
                                />
                                <TextField
                                    required
                                    fullWidth
                                    name="password"
                                    label={uiText("Password", 'forms')}
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (error) setError(null);
                                    }}
                                    variant="outlined"
                                    InputProps={{
                                        sx: {
                                            borderRadius: 2,
                                            bgcolor: alpha(theme.palette.background.paper, 0.4),
                                            transition: 'background-color 0.2s, box-shadow 0.2s',
                                            '&.Mui-focused': {
                                                bgcolor: alpha(theme.palette.background.paper, 0.8),
                                                boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.1)}`
                                            }
                                        },
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small" aria-label={showPassword ? uiText("Hide password", 'forms') : uiText("Show password", 'forms')}>
                                                    {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </>
                        ) : (
                            <Box>
                            {useRecoveryCode ? <TextField required fullWidth label={uiText('Recovery code', 'forms')} value={recoveryCode} onChange={event => setRecoveryCode(event.target.value)} autoComplete="off" /> : <TextField
                                required
                                fullWidth
                                label={uiText("Authenticator code", 'forms')}
                                value={totpCode}
                                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                  variant="outlined"
                                  autoFocus
                                  slotProps={{ htmlInput: { inputMode: 'numeric', pattern: '[0-9]{6}', maxLength: 6 } }}
                            />}
                            <Button size="small" onClick={() => { setUseRecoveryCode(value => !value); setTotpCode(''); setRecoveryCode(''); }}>{uiText(useRecoveryCode ? 'Use authenticator instead' : 'Use a recovery code')}</Button>
                            </Box>
                        )}

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        color="primary"
                                        size="small"
                                    />
                                }
                                label={<Typography variant="body2" color="text.secondary">{uiText("Remember me", 'forms')}</Typography>}
                            />
                            <Link
                                href="#"
                                variant="body2"
                                color="primary"
                                sx={{
                                    fontWeight: 600,
                                    textDecoration: 'none',
                                    transition: 'color 0.2s',
                                    '&:hover': { color: theme.palette.primary.dark }
                                }}
                            >
                                {uiText("Forgot password? ")}</Link>
                        </Box>

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                              disabled={loading || success || (requiresTotp && (useRecoveryCode ? !recoveryCode.trim() : !/^\d{6}$/.test(totpCode)))}
                            color={success ? "success" : "primary"}
                            sx={{
                                py: 1.5,
                                mt: 2,
                                borderRadius: 2,
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                textTransform: 'none',
                                boxShadow: success
                                    ? `0 8px 20px ${alpha(theme.palette.success.main, 0.4)}`
                                    : `0 8px 16px ${alpha(theme.palette.primary.main, 0.25)}`,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: success
                                        ? `0 12px 24px ${alpha(theme.palette.success.main, 0.5)}`
                                        : `0 12px 20px ${alpha(theme.palette.primary.main, 0.35)}`,
                                },
                                '&:active': {
                                    transform: 'translateY(0)',
                                }
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', height: 24 }}>
                                {loading && !success && <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />}
                                {success ? (
                                    <Fade in timeout={500}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <CheckCircleIcon sx={{ mr: 1 }} />
                                            {uiText("Success! Redirecting... ")}</Box>
                                    </Fade>
                                ) : (
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        {!loading && uiText(requiresTotp ? 'Verify and sign in' : 'Sign in')}
                                        {loading && uiText('Verifying...')}
                                        {!loading && <ArrowIcon sx={{ ml: 1, fontSize: 20 }} />}
                                    </Box>
                                )}
                            </Box>
                        </Button>
                        {!requiresTotp && (
                            <>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    onClick={handlePasskeyLogin}
                                    disabled={loading || success}
                                    sx={{ mt: 1, borderRadius: 2, py: 1.1 }}
                                >
                                    {uiText("Sign in with Passkey ")}</Button>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                                    <SparkleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                    <Typography variant="caption" color="text.secondary">
                                        {uiText("Secure login with biometrics or device passkey ")}</Typography>
                                </Box>
                            </>
                        )}
                    </Box>

                    <Box sx={{ textAlign: 'center', mt: 2 }}><RequestPasswordReset /></Box>
                    <Button onClick={() => setShowHelp(value => !value)}>{uiText('Need help signing in?')}</Button>
                    {showHelp && <Alert severity="info">{uiText('Contact your company administrator to recover access, unlock your account or reset MFA. Never share your password or recovery codes.')}</Alert>}
                    <OidcSignIn />
                    {onSwitchToSignup && (
                        <Box sx={{ mt: 2, textAlign: 'center', animation: `${fadeInUp} 0.6s ease-out 0.4s forwards`, opacity: 0 }}>
                            <Typography variant="body2" color="text.secondary">
                                {uiText("Don't have an account?")}{' '}
                                <Link
                                    component="button"
                                    variant="body2"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onSwitchToSignup();
                                    }}
                                    sx={{ fontWeight: 600, cursor: 'pointer', textDecoration: 'none' }}
                                >
                                    {uiText("Sign up ")}</Link>
                            </Typography>
                        </Box>
                    )}

                </Paper>
            </Zoom>

            {/* Footer Branding - Hidden for now */}
            {/* 
            <Typography
                variant="caption"
                align="center"
                sx={{
                    position: 'absolute',
                    bottom: 24,
                    color: 'text.secondary',
                    opacity: 0,
                    fontWeight: 500,
                    animation: `${fadeInUp} 0.6s ease-out 0.8s forwards`
                }}
            >
                © {new Date().getFullYear()} Ever Green Yarn Mills. All rights reserved.
            </Typography>
            */}
        </Box>
    );
};

export default Login;


