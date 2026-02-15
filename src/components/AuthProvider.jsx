import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { config } from '../config/env';

const AuthContext = createContext(null);

/**
 * Hook to access auth state anywhere in the app.
 * Returns { user, loading, logout, profile }
 * profile: { role, club_slugs } from Firestore user doc
 */
export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};

/**
 * Wraps the app and provides Firebase auth state + user profile to all children.
 * On login, fetches the user profile from /api/v1/users/me to get role + club_slugs.
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Test Mode Bypass: Force logged out state immediately
        if (import.meta.env.VITE_TEST_MODE === 'true') {
            setUser(null);
            setProfile(null);
            setLoading(false);
            return;
        }

        if (!auth) {
            console.warn("Auth not initialized. AuthProvider disabling.");
            setLoading(false);
            return;
        }

        const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);
            if (firebaseUser) {
                try {
                    const token = await firebaseUser.getIdToken();
                    const resp = await fetch(`${config.apiBaseUrl}/users/me`, {
                        headers: { 'Authorization': `Bearer ${token}` },
                    });
                    if (resp.ok) {
                        setProfile(await resp.json());
                    } else {
                        setProfile({ role: 'pilot', club_slugs: [] });
                    }
                } catch {
                    setProfile({ role: 'pilot', club_slugs: [] });
                }
            } else {
                setProfile(null);
            }
            setLoading(false);
        });
        return unsub;
    }, []);

    const logout = async () => {
        if (auth) {
            await signOut(auth);
        }
        setUser(null);
        setProfile(null);
    };

    const isAdmin = (clubSlug) =>
        profile && ['admin', 'instructor'].includes(profile.role) &&
        (profile.club_slugs || []).includes(clubSlug);

    const isMember = (clubSlug) =>
        profile && (profile.club_slugs || []).includes(clubSlug);

    return (
        <AuthContext.Provider value={{ user, loading, logout, profile, isAdmin, isMember }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
