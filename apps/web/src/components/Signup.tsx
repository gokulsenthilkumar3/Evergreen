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
    InputAdornment,
    IconButton,
    useTheme,
    alpha,
    keyframes,
    Fade
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    PersonAdd as PersonAddIcon,
    ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import api from '../utils/api';

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

interface SignupProps {
    onSignupSuccess: () => void;
    onSwitchToLogin: () => void;
}

const Signup: React.FC<SignupProps> = ({ onSignupSuccess, onSwitchToLogin }) => {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const theme = useTheme();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            await api.post('/auth/signup', {
                name,
                username,
                email,
                password
            });
            onSignupSuccess();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to register. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 3,
                bgcolor: theme.palette.mode === 'dark' ? 'background.default' : '#f8fafc',
                backgroundImage: theme.palette.mode === 'dark' 
                    ? 'radial-gradient(at 0% 0%, rgba(16, 185, 129, 0.15) 0, transparent 50%), radial-gradient(at 100% 100%, rgba(139, 92, 246, 0.15) 0, transparent 50%)'
                    : 'radial-gradient(at 0% 0%, rgba(16, 185, 129, 0.08) 0, transparent 50%), radial-gradient(at 100% 100%, rgba(139, 92, 246, 0.08) 0, transparent 50%)',
            }}
        >
            <Fade in={true} timeout={800}>
                <Paper
                    elevation={0}
                    sx={{
                        width: '100%',
                        maxWidth: 420,
                        p: { xs: 3, sm: 5 },
                        borderRadius: '24px',
                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid',
                        borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                        boxShadow: theme.palette.mode === 'dark' 
                            ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                            : '0 20px 40px -15px rgba(0,0,0,0.05)',
                        animation: `${fadeInUp} 0.6s ease-out`,
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <IconButton onClick={onSwitchToLogin} sx={{ mr: 1, color: 'text.secondary' }}>
                            <ArrowBackIcon />
                        </IconButton>
                        <Typography variant="h4" fontWeight={800} color="text.primary">
                            Create Account
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <TextField
                            label="Full Name"
                            variant="outlined"
                            fullWidth
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            InputProps={{
                                sx: { borderRadius: '12px', bgcolor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'transparent' }
                            }}
                        />
                        <TextField
                            label="Username"
                            variant="outlined"
                            fullWidth
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            InputProps={{
                                sx: { borderRadius: '12px', bgcolor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'transparent' }
                            }}
                        />
                        <TextField
                            label="Email Address"
                            type="email"
                            variant="outlined"
                            fullWidth
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            InputProps={{
                                sx: { borderRadius: '12px', bgcolor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'transparent' }
                            }}
                        />
                        <TextField
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            variant="outlined"
                            fullWidth
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                                sx: { borderRadius: '12px', bgcolor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'transparent' }
                            }}
                        />
                        <TextField
                            label="Confirm Password"
                            type={showConfirmPassword ? 'text' : 'password'}
                            variant="outlined"
                            fullWidth
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" size="small">
                                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                                sx: { borderRadius: '12px', bgcolor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'transparent' }
                            }}
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            disabled={loading}
                            endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PersonAddIcon />}
                            sx={{
                                py: 1.5,
                                mt: 1,
                                borderRadius: '12px',
                                textTransform: 'none',
                                fontSize: '1rem',
                                fontWeight: 700,
                                boxShadow: theme.palette.mode === 'dark' 
                                    ? `0 8px 16px ${alpha(theme.palette.primary.main, 0.4)}`
                                    : `0 8px 16px ${alpha(theme.palette.primary.main, 0.2)}`,
                                '&:hover': {
                                    boxShadow: `0 12px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                                    transform: 'translateY(-2px)'
                                },
                                transition: 'all 0.2s'
                            }}
                        >
                            {loading ? 'Creating Account...' : 'Sign Up'}
                        </Button>
                        
                        <Box sx={{ textAlign: 'center', mt: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                Already have an account?{' '}
                                <Link
                                    component="button"
                                    variant="body2"
                                    onClick={(e) => { e.preventDefault(); onSwitchToLogin(); }}
                                    sx={{ fontWeight: 600, cursor: 'pointer', textDecoration: 'none' }}
                                >
                                    Log in
                                </Link>
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            </Fade>
        </Box>
    );
};

export default Signup;
