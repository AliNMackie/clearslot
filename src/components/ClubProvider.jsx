import React, { createContext, useContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { apiClient } from '../services/apiClient';

const ClubContext = createContext(null);

export const useClub = () => {
    const context = useContext(ClubContext);
    if (!context) {
        throw new Error('useClub must be used within a ClubProvider');
    }
    return context;
};

export const ClubProvider = ({ children }) => {
    const { clubSlug } = useParams();
    const [club, setClub] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Default branding fallback (Strathaven-ish)
    const defaultBranding = {
        name: 'ClearSlot Club',
        logo: '✈️',
        theme: {
            primary: '#1e3a8a',
            secondary: '#fbbf24',
            accent: '#10b981',
            background: 'bg-gray-50',
            hero_gradient: 'bg-gradient-to-r from-blue-900 to-slate-800'
        },
        site_id: 'SAFE_SITE'
    };

    useEffect(() => {
        const fetchClub = async () => {
            if (!clubSlug) return;
            setLoading(true);
            try {
                const data = await apiClient.getClub(clubSlug);
                setClub(data);
            } catch (err) {
                console.error("Failed to fetch club branding", err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };
        fetchClub();
    }, [clubSlug]);

    const value = {
        club,
        branding: club || defaultBranding,
        loading,
        error
    };

    return (
        <ClubContext.Provider value={value}>
            {children}
        </ClubContext.Provider>
    );
};

export default ClubProvider;
