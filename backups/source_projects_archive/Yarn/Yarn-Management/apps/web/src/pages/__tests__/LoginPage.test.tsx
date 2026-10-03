import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import LoginPage from '../LoginPage';

// Mock AuthContext
vi.mock('../../context/AuthContext', () => ({
    useAuth: () => ({
        login: vi.fn(),
        isAuthenticated: false,
    }),
    AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('LoginPage', () => {
    it('should render login form', () => {
        render(
            <BrowserRouter>
                <LoginPage />
            </BrowserRouter>
        );

        // Check for email input
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();

        // Check for password input
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();

        // Check for login button
        expect(screen.getByRole('button', { name: /^sign in$/i })).toBeInTheDocument();
    });

});
