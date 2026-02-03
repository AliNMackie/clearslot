import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import OperatorView from './components/OperatorView';
import CalendarView from './components/CalendarView';
import BriefingView from './components/BriefingView';
import MarketingSections from './components/MarketingSections';

function App() {
    return (
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
                    <div className="py-8"></div> {/* Added a separator */}
                    <CalendarView /> {/* Rendered CalendarView below OperatorView */}

                    <div className="container mb-8 mt-12 text-center text-navy opacity-30 text-xs uppercase tracking-widest font-bold">
                        App Screen: Pilot Briefing
                    </div>
                    <BriefingView />
                </div>

                {/* Marketing Info */}
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
                    {/* Top Section */}
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '3rem',
                        justifyContent: 'space-between',
                        marginBottom: '4rem'
                    }}>
                        {/* Brand Column */}
                        <div style={{ flex: '2 1 300px' }}>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 bg-sky text-white flex items-center justify-center font-serif italic text-lg transform rotate-3">C</div>
                                <span className="font-serif italic text-xl">ClearSlot.space</span>
                            </div>
                            <p className="text-sm opacity-60 max-w-xs">
                                Planning tools for small aircraft and balloon operators.
                                <br />Built for the Strathaven community.
                            </p>
                        </div>

                        {/* Links Columns Container */}
                        <div style={{ flex: '3 1 400px', display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
                            <div style={{ minWidth: '120px' }}>
                                <h4 className="font-bold mb-4 text-white">Product</h4>
                                <ul className="space-y-2 text-sm opacity-70" style={{ listStyle: 'none', padding: 0 }}>
                                    <li className="mb-2"><a href="#" className="hover:text-sky transition-colors">Features</a></li>
                                    <li className="mb-2"><a href="#" className="hover:text-sky transition-colors">Pricing</a></li>
                                    <li className="mb-2"><a href="#" className="hover:text-sky transition-colors">Data Sources</a></li>
                                </ul>
                            </div>
                            <div style={{ minWidth: '120px' }}>
                                <h4 className="font-bold mb-4 text-white">Resources</h4>
                                <ul className="space-y-2 text-sm opacity-70" style={{ listStyle: 'none', padding: 0 }}>
                                    <li className="mb-2"><a href="#" className="hover:text-sky transition-colors">Blog</a></li>
                                    <li className="mb-2"><a href="#" className="hover:text-sky transition-colors">Support</a></li>
                                    <li className="mb-2"><a href="#" className="hover:text-sky transition-colors">Status</a></li>
                                </ul>
                            </div>
                            <div style={{ minWidth: '120px' }}>
                                <h4 className="font-bold mb-4 text-white">Company</h4>
                                <ul className="space-y-2 text-sm opacity-70" style={{ listStyle: 'none', padding: 0 }}>
                                    <li className="mb-2"><a href="#" className="hover:text-sky transition-colors">About</a></li>
                                    <li className="mb-2"><a href="#" className="hover:text-sky transition-colors">Contact</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Section */}
                    <div style={{
                        borderTop: '1px solid rgba(255,255,255,0.1)',
                        paddingTop: '2rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.75rem',
                        opacity: 0.4
                    }}>
                        <p>&copy; 2026 ClearSlot.space</p>
                        <div style={{ display: 'flex', gap: '1.5rem' }}>
                            <a href="#" className="hover:text-white">Privacy</a>
                            <a href="#" className="hover:text-white">Terms</a>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
}

export default App;
