'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
    id: string;
    email: string;
    name: string;
    points: number;
    referralCode: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in
        const userId = localStorage.getItem('userId');
        if (userId) {
            loadUser(userId);
        } else {
            setIsLoading(false);
        }
    }, []);

    const loadUser = async (userId: string) => {
        try {
            const response = await fetch(`/api/user/${userId}`);
            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
            }
        } catch (error) {
            console.error('Failed to load user:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string) => {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            localStorage.setItem('userId', userData.id);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('userId');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
