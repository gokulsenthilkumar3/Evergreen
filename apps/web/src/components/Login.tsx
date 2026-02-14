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
    CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import api from '../utils/api';
import LoginAvatar from './LoginAvatar';

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
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, settings }) => {
    const [username, setUsername] = useState('admin');
    const [password, setPassword] = useState('admin123');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [shakeAnimation, setShakeAnimation] = useState(false);

    // Avatar Interaction States
    const [isTyping, setIsTyping] = useState(false);

    // Typing timeout ref
    const typingTimeoutRef = React.useRef<any>(null);

    const theme = useTheme();

    const handleTyping = () => {
        setIsTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 300);
    };

    useEffect(() => {
        if (error) {
            setShakeAnimation(true);
            const timer = setTimeout(() => setShakeAnimation(false), 500);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (success) return;

        setLoading(true);
        setError(null);

        const startTime = Date.now();

        try {
            const response = await api.post('/auth/login', { username, password });

            const elapsed = Date.now() - startTime;
            if (elapsed < 800) await new Promise(r => setTimeout(r, 800 - elapsed));

            setSuccess(true);
            localStorage.setItem('token', response.data.access_token);

            setTimeout(() => {
                onLoginSuccess(response.data.user);
            }, 1200);

        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid credentials');
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                width: '100vw',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                background: theme.palette.mode === 'dark'
                    ? `radial-gradient(circle at 50% 50%, #1e293b 0%, #0f172a 100%)`
                    : `radial-gradient(circle at 50% 50%, #f1f5f9 0%, #e2e8f0 100%)`,
            }}
        >
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
                        p: { xs: 4, sm: 6 },
                        width: '100%',
                        maxWidth: 450,
                        borderRadius: 4,
                        zIndex: 1,
                        position: 'relative',
                        backdropFilter: 'blur(20px)',
                        bgcolor: theme.palette.mode === 'dark'
                            ? alpha(theme.palette.background.paper, 0.6)
                            : alpha('#ffffff', 0.65),
                        border: '1px solid',
                        borderColor: theme.palette.mode === 'dark'
                            ? alpha('#ffffff', 0.1)
                            : alpha('#ffffff', 0.4),
                        boxShadow: `0 8px 32px 0 ${alpha(theme.palette.common.black, 0.1)}`,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        animation: shakeAnimation ? `${shake} 0.5s cubic-bezier(.36,.07,.19,.97) both` : 'none',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: `0 12px 40px 0 ${alpha(theme.palette.common.black, 0.15)}`,
                        }
                    }}
                >
                    <Box sx={{ animation: `${fadeInUp} 0.6s ease-out forwards`, opacity: 0, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                        {/* Interactive Avatar - Hidden for now */}
                        {/* 
                        <Box sx={{ mt: -4, mb: 2 }}>
                            <LoginAvatar
                                isPasswordFocused={showPassword}
                                isTyping={isTyping}
                            />
                        </Box>
                        */}

                        <Box sx={{ textAlign: 'center', mb: 3 }}>
                            {settings?.logo ? (
                                <Box
                                    component="img"
                                    src={settings.logo}
                                    alt="Logo"
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
                                Yarn Management Solution
                            </Typography>
                        </Box>
                    </Box>

                    <Box sx={{ width: '100%', mb: 2, animation: `${fadeInUp} 0.6s ease-out 0.2s forwards`, opacity: 0 }}>
                        <Typography component="h1" variant="h5" sx={{ mb: 2, fontWeight: 700, ml: 1 }}>
                            Sign In
                        </Typography>
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
                                {error}
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
                        <TextField
                            required
                            fullWidth
                            id="username"
                            label="Username"
                            name="username"
                            autoComplete="username"
                            autoFocus
                            value={username}
                            onChange={(e) => {
                                setUsername(e.target.value);
                                if (error) setError(null);
                                handleTyping();
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
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (error) setError(null);
                                handleTyping();
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
                                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                                            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />

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
                                label={<Typography variant="body2" color="text.secondary">Remember me</Typography>}
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
                                Forgot password?
                            </Link>
                        </Box>

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loading || success}
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
                                            Success! Redirecting...
                                        </Box>
                                    </Fade>
                                ) : (
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        {!loading && 'Sign In To Dashboard'}
                                        {loading && 'Verifying...'}
                                        {!loading && <ArrowIcon sx={{ ml: 1, fontSize: 20 }} />}
                                    </Box>
                                )}
                            </Box>
                        </Button>
                    </Box>

                    <Box sx={{ mt: 4, textAlign: 'center', animation: `${fadeInUp} 0.6s ease-out 0.6s forwards`, opacity: 0 }}>
                        <Typography variant="body2" color="text.secondary">
                            Don't have an account? <Link href="#" sx={{ fontWeight: 600, textDecoration: 'none', color: 'primary.main' }}>Contact Admin</Link>
                        </Typography>
                    </Box>
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
