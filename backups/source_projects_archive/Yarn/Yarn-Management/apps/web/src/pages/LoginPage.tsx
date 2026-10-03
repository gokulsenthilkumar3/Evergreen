import { useState } from 'react';

import { Box, Button, Container, TextField, Typography } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { http } from '../lib/http';
import { useAuth } from '../context/AuthContext';

import { startAuthentication } from '@simplewebauthn/browser';
import FingerprintIcon from '@mui/icons-material/Fingerprint';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation() as any;
  const from = location?.state?.from?.pathname ?? '/dashboard';
  const { login } = useAuth();

  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('admin123456!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function getLocation(): Promise<{ lat: number; lng: number } | undefined> {
    if (!navigator.geolocation) return undefined;
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve(undefined),
        { timeout: 3000, enableHighAccuracy: true }
      );
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const coords = await getLocation();
      const payload: any = { email, password };
      if (coords) payload.location = coords;

      const res = await http.post('/auth/login', payload);
      const token = res.data?.accessToken as string;
      if (!token) throw new Error('No access token returned');
      login(token);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  const handlePasskeyLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: options } = await http.post('/auth/webauthn/login/start');
      const authResp = await startAuthentication(options);
      const { data } = await http.post('/auth/webauthn/login/finish', authResp);

      const token = data?.accessToken as string;
      if (!token) throw new Error('No access token returned');
      login(token);
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error(err);
      setError('Passkey authentication failed. Please try again or use password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 10 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Yarn Management
        </Typography>
        <Box component="form" onSubmit={onSubmit} sx={{ display: 'grid', gap: 2 }}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error ? (
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          ) : null}
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>

          <Button
            variant="outlined"
            startIcon={<FingerprintIcon />}
            onClick={handlePasskeyLogin}
            disabled={loading}
          >
            Sign in with Passkey
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
