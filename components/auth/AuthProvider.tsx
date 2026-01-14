'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession, signOut } from "next-auth/react";

interface User {
    id: string;
    email: string;
    name: string;
    points: number;
    referralCode: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password?: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const { data: session } = useSession();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadUser = async (userId: string) => {
        try {
            const response = await fetch(`/api/user/${userId}`);
            if (response.ok) {
                const userData: User = await response.json();
                setUser(userData);
            } else {
                localStorage.removeItem('userId');
            }
        } catch (error) {
            console.error("Failed to load user:", error);
            localStorage.removeItem('userId');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Check if user is logged in
        const userId = localStorage.getItem('userId');
        if (userId) {
            loadUser(userId);
        } else if (session?.user?.email) {
            // If NextAuth session exists but no local userId, sync it
            syncOAuthUser(session.user.email);
        } else {
            setIsLoading(false);
        }
    }, [session]); // Depend on session

    const syncOAuthUser = async (email: string) => {
        try {
            await login(email);
        } catch (e) {
            console.error("OAuth Sync Error", e);
        }
    };

    const login = async (email: string, password?: string) => {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            localStorage.setItem('userId', userData.id);
        } else {
            const error = await response.json();
            throw new Error(error.error || 'Đăng nhập thất bại');
        }
    };

    const logout = async () => {
        setUser(null);
        localStorage.removeItem('userId');
        await signOut({ callbackUrl: '/' });
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
