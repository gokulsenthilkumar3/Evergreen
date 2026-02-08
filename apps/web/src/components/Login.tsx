import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Link,
    Avatar,
    Alert,
    CircularProgress
} from '@mui/material';
import { LockOutlined as LockIcon } from '@mui/icons-material';
import api from '../utils/api';

interface LoginProps {
    onLoginSuccess: (user: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('author');
    const [password, setPassword] = useState('author123');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await api.post('/auth/login', { username, password });
            localStorage.setItem('token', response.data.access_token);
            onLoginSuccess(response.data.user);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to login. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #0a1929 0%, #005005 100%)',
            }}
        >
            <Paper
                elevation={6}
                sx={{
                    p: 5,
                    width: '100%',
                    maxWidth: 400,
                    borderRadius: 4,
                    bgcolor: 'background.paper',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
            >
                <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 56, height: 56 }}>
                    <LockIcon fontSize="large" />
                </Avatar>
                <Typography component="h1" variant="h5" sx={{ mt: 2, mb: 4, fontWeight: 'bold' }}>
                    Sign In
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
                        {error}
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Username"
                        name="username"
                        autoComplete="username"
                        autoFocus
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        variant="filled"
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        variant="filled"
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={loading}
                        sx={{ mt: 4, mb: 2, py: 1.5, fontSize: '1rem', fontWeight: 'bold' }}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
                    </Button>
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <Link href="#" variant="body2" color="primary.light">
                            Forgot password?
                        </Link>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};

export default Login;
