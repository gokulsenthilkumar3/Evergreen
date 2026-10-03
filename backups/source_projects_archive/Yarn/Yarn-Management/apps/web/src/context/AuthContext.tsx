import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAccessToken, setAccessToken as setToken, clearAccessToken as clearToken } from '../lib/auth';

interface User {
    id: string;
    email: string;
    name?: string;
    role?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (token: string) => void;
    logout: () => void;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const token = getAccessToken();
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUser({
                    id: payload.userId || payload.sub,
                    email: payload.email,
                    name: payload.name || payload.email?.split('@')[0] || 'User',
                    role: payload.role || 'USER'
                });
            } catch (e) {
                console.error('Invalid token', e);
                clearToken();
            }
        }
    }, []);

    const login = (token: string) => {
        setToken(token);
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setUser({
                id: payload.userId || payload.sub,
                email: payload.email,
                name: payload.name || payload.email?.split('@')[0] || 'User',
                role: payload.role || 'USER'
            });
            // Fetch fresh profile immediately
            refreshProfile();
        } catch (e) {
            console.error('Invalid token on login', e);
        }
    };

    const logout = async () => {
        try {
            const { http } = await import('../lib/http');
            await http.post('/auth/logout');
        } catch (e) {
            console.error('Failed to logout on server', e);
        } finally {
            clearToken();
            setUser(null);
            window.location.href = '/login';
        }
    };

    const refreshProfile = async () => {
        try {
            const { http } = await import('../lib/http');
            const { data } = await http.get('/users/me');
            if (data.user) {
                setUser(prev => ({
                    ...prev!,
                    ...data.user
                }));
            }
        } catch (e) {
            console.error('Failed to refresh profile', e);
        }
    };

    useEffect(() => {
        if (!user) return;

        let idleTimer: ReturnType<typeof setTimeout>;
        const timeout = 8 * 60 * 1000; // 8 minutes

        const resetTimer = () => {
            clearTimeout(idleTimer);
            idleTimer = setTimeout(() => {
                console.log('Idle timeout reached, revoking session...');
                logout();
            }, timeout);
        };

        const activityEvents = [
            'mousedown',
            'mousemove',
            'keydown',
            'scroll',
            'touchstart',
            'click'
        ];

        activityEvents.forEach(event => {
            window.addEventListener(event, resetTimer);
        });

        resetTimer();

        return () => {
            clearTimeout(idleTimer);
            activityEvents.forEach(event => {
                window.removeEventListener(event, resetTimer);
            });
        };
    }, [user]);

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            login,
            logout,
            refreshProfile
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
