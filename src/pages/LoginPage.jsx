import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useNavigate, useSearchParams } from 'react-router-dom';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const redirectTo = searchParams.get('redirect') || '/';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (isSignUp) {
                await createUserWithEmailAndPassword(auth, email, password);
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
            navigate(redirectTo);
        } catch (err) {
            const messages = {
                'auth/invalid-credential': 'Invalid email or password.',
                'auth/email-already-in-use': 'An account with this email already exists.',
                'auth/weak-password': 'Password must be at least 6 characters.',
                'auth/invalid-email': 'Please enter a valid email address.',
            };
            setError(messages[err.code] || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 50%, #ecfdf5 100%)',
            fontFamily: 'var(--font-sans)',
        }}>
            <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '3rem',
                width: '100%',
                maxWidth: '420px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
            }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <span style={{ fontSize: '2rem' }}>🌤️</span>
                    <h1 style={{
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        color: 'var(--color-navy)',
                        marginTop: '0.5rem',
                    }}>
                        ClearSlot.space
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                        {isSignUp ? 'Create your account' : 'Sign in to your club portal'}
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div style={{
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        color: '#dc2626',
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        marginBottom: '1.5rem',
                    }}>
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            color: 'var(--color-navy)',
                            marginBottom: '0.4rem',
                        }}>
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="pilot@example.com"
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0',
                                fontSize: '0.95rem',
                                outline: 'none',
                                boxSizing: 'border-box',
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            color: 'var(--color-navy)',
                            marginBottom: '0.4rem',
                        }}>
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            placeholder="••••••••"
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0',
                                fontSize: '0.95rem',
                                outline: 'none',
                                boxSizing: 'border-box',
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                        style={{
                            width: '100%',
                            padding: '0.85rem',
                            fontSize: '1rem',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1,
                        }}
                    >
                        {loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
                    </button>
                </form>

                {/* Toggle */}
                <p style={{
                    textAlign: 'center',
                    marginTop: '1.5rem',
                    fontSize: '0.85rem',
                    color: '#64748b',
                }}>
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                    <button
                        onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-sky)',
                            fontWeight: 600,
                            cursor: 'pointer',
                            padding: 0,
                        }}
                    >
                        {isSignUp ? 'Sign In' : 'Sign Up'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
