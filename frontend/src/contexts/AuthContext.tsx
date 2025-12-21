import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { LOGIN_MUTATION, SIGNUP_MUTATION, ME_QUERY } from '../graphql/auth/auth.graphql';
import { apolloClient } from '../lib/apollo-client';

interface User {
    id: string;
    email: string;
    name?: string;
    createdAt: Date;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, name?: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('auth-token'));
    const [isLoading, setIsLoading] = useState(true);

    const [loginMutation] = useMutation(LOGIN_MUTATION);
    const [signupMutation] = useMutation(SIGNUP_MUTATION);

    // Query for current user if token exists
    const { refetch: refetchMe } = useQuery(ME_QUERY, {
        skip: !token,
        onCompleted: (data: any) => {
            setUser(data.me);
            setIsLoading(false);
        },
        onError: () => {
            // Token is invalid, clear it
            localStorage.removeItem('auth-token');
            setToken(null);
            setUser(null);
            setIsLoading(false);
        },
    });

    useEffect(() => {
        if (token) {
            refetchMe();
        } else {
            setIsLoading(false);
        }
    }, [token, refetchMe]);

    const login = async (email: string, password: string) => {
        try {
            const { data } = await loginMutation({
                variables: {
                    input: { email, password },
                },
            });

            const { token: newToken, user: newUser } = data.login;
            localStorage.setItem('auth-token', newToken);
            setToken(newToken);
            setUser(newUser);

            // Reset Apollo cache to clear any previous user's data
            await apolloClient.resetStore();
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const signup = async (email: string, password: string, name?: string) => {
        try {
            const { data } = await signupMutation({
                variables: {
                    input: { email, password, name },
                },
            });

            const { token: newToken, user: newUser } = data.signup;
            localStorage.setItem('auth-token', newToken);
            setToken(newToken);
            setUser(newUser);

            // Reset Apollo cache
            await apolloClient.resetStore();
        } catch (error) {
            console.error('Signup error:', error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('auth-token');
        setToken(null);
        setUser(null);

        // Clear Apollo cache
        apolloClient.clearStore();
    };

    const value: AuthContextType = {
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        signup,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
