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

interface MeQueryResult {
    me: User;
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
    const { loading: meLoading, data: meData, error: meError } = useQuery<MeQueryResult>(ME_QUERY, {
        skip: !token,
        fetchPolicy: 'network-only', // Always fetch fresh data on reload
    });

    // Handle query completion and errors
    useEffect(() => {
        if (meData?.me) {
            // Query succeeded, set user
            setUser(meData.me);
        }
    }, [meData]);

    useEffect(() => {
        if (meError) {
            // Token is invalid, clear it
            localStorage.removeItem('auth-token');
            setToken(null);
            setUser(null);
        }
    }, [meError]);

    // Manage loading state based on token and query state
    useEffect(() => {
        if (!token) {
            // No token, not loading
            setIsLoading(false);
        } else if (!meLoading && (meData || meError)) {
            // Query completed (success or error)
            setIsLoading(false);
        }
    }, [token, meLoading, meData, meError]);

    const login = async (email: string, password: string) => {
        try {
            const { data } = await loginMutation({
                variables: {
                    input: { email, password },
                },
            });

            // Defensive check: ensure data and data.login exist
            if (!data || !data.login) {
                throw new Error('Login mutation returned no data');
            }

            const { token: newToken, user: newUser } = data.login;
            localStorage.setItem('auth-token', newToken);
            setToken(newToken);
            setUser(newUser);
            setIsLoading(false); // Explicitly stop loading

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

            // Defensive check: ensure data and data.signup exist
            if (!data || !data.signup) {
                throw new Error('Signup mutation returned no data');
            }

            const { token: newToken, user: newUser } = data.signup;
            localStorage.setItem('auth-token', newToken);
            setToken(newToken);
            setUser(newUser);
            setIsLoading(false); // Explicitly stop loading

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
