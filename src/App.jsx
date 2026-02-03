import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import OperatorView from './components/OperatorView';
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
                padding: '5rem 0 2rem',
                marginTop: '0'
            }}>
                <div className="container">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-16">
                        <div className="col-span-1 md:col-span-1">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 bg-sky text-white flex items-center justify-center font-serif italic text-lg transform rotate-3">C</div>
                                <span className="font-serif italic text-xl">ClearSlot.space</span>
                            </div>
                            <p className="text-sm opacity-60">Planning tools for small aircraft and balloon operators.</p>
                        </div>

                        <div className="col-span-1">
                            <h4 className="font-bold mb-4">Product</h4>
                            <ul className="space-y-2 text-sm opacity-70">
                                <li><a href="#">Features</a></li>
                                <li><a href="#">Pricing</a></li>
                                <li><a href="#">Data Sources</a></li>
                            </ul>
                        </div>
                        <div className="col-span-1">
                            <h4 className="font-bold mb-4">Resources</h4>
                            <ul className="space-y-2 text-sm opacity-70">
                                <li><a href="#">Blog</a></li>
                                <li><a href="#">Support</a></li>
                                <li><a href="#">Status</a></li>
                            </ul>
                        </div>
                        <div className="col-span-1">
                            <h4 className="font-bold mb-4">Company</h4>
                            <ul className="space-y-2 text-sm opacity-70">
                                <li><a href="#">About</a></li>
                                <li><a href="#">Contact</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-white/5 pt-8 flex justify-between text-xs opacity-40">
                        <p>&copy; 2026 ClearSlot.space</p>
                        <div className="flex gap-4">
                            <a href="#">Privacy</a>
                            <a href="#">Terms</a>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
}

export default App;
