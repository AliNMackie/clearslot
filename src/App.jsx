import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import OperatorView from './components/OperatorView';
import CalendarView from './calendar/CalendarView';
import BriefingView from './components/BriefingView';
import MarketingSections from './components/MarketingSections';

// New Club Pages
import PublicClubPage from './pages/club/PublicClubPage';
import MemberPortal from './pages/club/MemberPortal';
import AdminPortal from './pages/club/AdminPortal';

const LandingPage = () => (
    <>
        <Header />
        <main>
            <Hero />
            {/* App Views Prototypes Section */}
            <div style={{ padding: '2rem 0', background: 'var(--color-cloud)' }}>
                <div className="container mb-8 text-center text-navy opacity-30 text-xs uppercase tracking-widest font-bold">
                    App Screen: Operator View
                </div>
                <OperatorView />
                <div className="py-8"></div>
                <CalendarView />
                <div className="container mb-8 mt-12 text-center text-navy opacity-30 text-xs uppercase tracking-widest font-bold">
                    App Screen: Pilot Briefing
                </div>
                <BriefingView />
            </div>
            <MarketingSections />
        </main>
        {/* Footer */}
        <footer style={{
            backgroundColor: 'var(--color-navy)',
            color: 'white',
            padding: '4rem 0 2rem',
            marginTop: '0'
        }}>
            <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
                <p className="text-center text-sm opacity-40">&copy; 2026 ClearSlot.space</p>
            </div>
        </footer>
    </>
);

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '2rem', fontFamily: 'sans-serif', color: '#1B2A3A' }}>
                    <h1>Something went wrong.</h1>
                    <details style={{ whiteSpace: 'pre-wrap', background: '#f8f8f8', padding: '1rem', borderRadius: '8px' }}>
                        {this.state.error && this.state.error.toString()}
                        <br />
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </details>
                </div>
            );
        }

        return this.props.children;
    }
}

function App() {
    return (
        <ErrorBoundary>
            <Router>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/clubs/:clubSlug" element={<PublicClubPage />} />
                    <Route path="/clubs/:clubSlug/app" element={<MemberPortal />} />
                    <Route path="/clubs/:clubSlug/admin" element={<AdminPortal />} />
                </Routes>
            </Router>
        </ErrorBoundary>
    );
}

export default App;
