import { Users, Target, Plane, CloudRain, Megaphone, Smartphone, HeartHandshake, Infinity, PoundSterling, Repeat, Receipt, Wallet, Activity, FlaskConical, Database, Satellite, Building2, Printer, CheckCircle, ShieldCheck } from 'lucide-react';

// Extracted missing icon for cleaner code
const TrendingUpIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
        <polyline points="17 6 23 6 23 12"></polyline>
    </svg>
);

const ClearSlotBMC = () => {
    console.log("ClearSlotBMC rendering...");
    return (
        <div className="p-8 bg-slate-50 min-h-screen font-sans text-slate-800 relative overflow-hidden">
            {/* Subtle Aerospace/Isobar Background Pattern */}
            <div className="absolute inset-0 z-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, #0F172A 1px, transparent 1px), radial-gradient(circle at 80% 80%, #3B82F6 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

            {/* Header Section */}
            <header className="relative z-10 mb-8 border-b border-slate-200 pb-6 flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">ClearSlot</h1>
                    <p className="text-lg text-slate-500 font-medium">Business Model Canvas: Aviation Weather Intelligence via Space Data</p>
                </div>
                <div className="text-right">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Status</div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold border border-emerald-200">
                        <CheckCircle className="w-4 h-4" />
                        <span>Lean Validation</span>
                    </div>
                </div>
            </header>

            {/* Document Flow - Highly Compact for A4 */}
            <div className="relative z-10 grid grid-cols-12 gap-4 auto-rows-min">

                {/* Value Propositions */}
                <div className="col-span-3 row-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col gap-4 relative overflow-hidden group hover:border-blue-400 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Plane className="w-24 h-24 text-blue-600" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <Target className="w-4 h-4" /> Value Propositions
                    </h3>
                    <div className="space-y-4">
                        {/* HIGHLIGHTED VALUE PROP */}
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                            <h4 className="font-bold text-blue-900 mb-1 flex items-center gap-2">
                                <TrendingUpIcon className="w-4 h-4" /> Revenue Recovery (Primary B2B)
                            </h4>
                            <p className="text-sm text-blue-800 leading-snug">
                                Stop flight clubs losing flyable hours to conservative guesswork. Increase aircraft utilisation by 15–20% through &gt;85% accurate predictions of flyable weather windows using precise space-derived data.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 mb-1">Go/No-Go Confidence</h4>
                            <p className="text-xs text-slate-600 leading-snug">
                                <span className="font-semibold text-slate-700">Secondary (Pilots):</span> Simple, actionable 'Flyable Score' (e.g., 72% chance of flight at 14:00) replacing complex charts.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 mb-1">Vertical Visibility</h4>
                            <p className="text-xs text-slate-600 leading-snug">
                                <span className="font-semibold text-slate-700">Tertiary (Balloons/Drones):</span> Atmospheric sounding data to accurately predict cloud base and wind shear at specific low-level altitudes.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Customer Segments */}
                <div className="col-span-3 bg-white rounded-xl shadow-sm border border-slate-200 p-5 relative overflow-hidden group hover:border-indigo-400 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Users className="w-16 h-16 text-indigo-600" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                        <Users className="w-4 h-4" /> Customer Segments
                    </h3>
                    <ul className="space-y-3">
                        <li className="flex gap-2 items-start">
                            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></div>
                            <div>
                                <strong className="text-slate-900 block text-sm">UK Microlight Clubs & Balloon Operators (Beachhead)</strong>
                                <span className="text-xs text-slate-500">Highly sensitive to weather-related revenue losses.</span>
                            </div>
                        </li>
                        <li className="flex gap-2 items-start">
                            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0"></div>
                            <div>
                                <strong className="text-slate-900 block text-sm">Student Pilots</strong>
                                <span className="text-xs text-slate-500">Secondary segment seeking personal confidence and clear go/no-go training tools.</span>
                            </div>
                        </li>
                        <li className="flex gap-2 items-start opacity-70">
                            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0"></div>
                            <div>
                                <strong className="text-slate-900 block text-sm">Future BVLOS Drones</strong>
                                <span className="text-xs text-slate-500">Forward-looking segment. Drone logistics operators needing hyper-local, low-level weather risk data.</span>
                            </div>
                        </li>
                    </ul>
                </div>

                {/* Key Resources & Key Activities */}
                <div className="col-span-3 row-span-2 flex flex-col gap-4">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex-1 group hover:border-amber-400 transition-colors">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                            <Database className="w-4 h-4" /> Key Resources
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <strong className="text-slate-900 text-sm block mb-1">Space Data Assets</strong>
                                <p className="text-xs text-slate-600">Met Office MAVIS / Meteosat Third Generation & Ordnance Survey NGD / Sentinel‑2 land use.</p>
                            </div>
                            <div>
                                <strong className="text-slate-900 text-sm block mb-1">ClearSlot Engine</strong>
                                <p className="text-xs text-slate-600">Proprietary algorithms converting raw Earth observation data into aviation risk scores.</p>
                            </div>
                            <div className="pt-2 mt-2 border-t border-slate-100 flex gap-4">
                                <div className="text-xs text-slate-500">
                                    <span className="block font-bold text-slate-700">Human:</span> Tech/domain lead founder, industry advisor, technical architect.
                                </div>
                                <div className="text-xs text-slate-500">
                                    <span className="block font-bold text-slate-700">Financial:</span> ESA BIC grant funding & founder sweat equity.
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex-1 group hover:border-amber-400 transition-colors">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                            <Activity className="w-4 h-4" /> Key Activities
                        </h3>
                        <ul className="space-y-2 text-sm text-slate-700">
                            <li className="flex gap-2"><div className="w-1 h-full bg-amber-400 rounded-full"></div> <span><strong>R&D:</strong> The 'space connection' — building the ingestion pipeline for Meteosat and Sentinel‑2 data.</span></li>
                            <li className="flex gap-2"><div className="w-1 h-full bg-amber-400 rounded-full"></div> <span><strong>Validation:</strong> Alpha pilot testing at Strathaven Airfield.</span></li>
                            <li className="flex gap-2"><div className="w-1 h-full bg-amber-400 rounded-full"></div> <span><strong>Regulatory Work:</strong> Ensuring AI creates a compliant audit trail for CAA 'Type A' EFB status.</span></li>
                            <li className="flex gap-2"><div className="w-1 h-full bg-amber-400 rounded-full"></div> <span><strong>Commercialisation:</strong> Converting beta users into paid contracts.</span></li>
                        </ul>
                    </div>
                </div>

                {/* Channels & Customer Relationships */}
                <div className="col-span-3 flex flex-col gap-4">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 group hover:border-cyan-400 transition-colors">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                            <Megaphone className="w-4 h-4" /> Channels
                        </h3>
                        <ul className="text-xs text-slate-600 space-y-2">
                            <li><strong className="text-slate-900">Direct Sales:</strong> Founder-led outreach to top 20 UK clubs, leveraging Strathaven as a reference site.</li>
                            <li><strong className="text-slate-900">Strategic Partnership:</strong> Distribution via the British Microlight Aircraft Association (BMAA) as a recommended safety tool.</li>
                            <li><strong className="text-slate-900">App Stores:</strong> Self-service mobile distribution via Apple App Store and Google Play for the 'Pilot Companion' app.</li>
                        </ul>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 group hover:border-cyan-400 transition-colors flex-1">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                            <HeartHandshake className="w-4 h-4" /> Customer Relationships
                        </h3>
                        <ul className="space-y-2">
                            <li className="flex items-center gap-2 text-xs">
                                <div className="bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded font-bold">Embedded Partnership</div>
                                <span className="text-slate-600">Integrated deeply into club roster and rulebooks. Creates extremely high switching costs.</span>
                            </li>
                            <li className="flex items-center gap-2 text-xs">
                                <div className="bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded font-bold">Automated Self-Serve</div>
                                <span className="text-slate-600">Frictionless subscription management for pilots via app stores and Stripe integration.</span>
                            </li>
                            <li className="flex items-center gap-2 text-xs">
                                <div className="bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded font-bold">'Living Lab' Community</div>
                                <span className="text-slate-600">Centred on Strathaven Airfield, fostering early adopters for continuous feedback.</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Key Partners */}
                <div className="col-span-3 bg-white rounded-xl shadow-sm border border-slate-200 p-5 relative overflow-hidden group hover:border-purple-400 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <HeartHandshake className="w-16 h-16 text-purple-600" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                        <HeartHandshake className="w-4 h-4" /> Key Partners
                    </h3>
                    <div className="space-y-3">
                        <div className="flex gap-2">
                            <div className="p-2 bg-purple-50 rounded shrink-0">
                                <Plane className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                                <strong className="text-slate-900 text-sm block">Operational</strong>
                                <span className="text-xs text-slate-500">Strathaven Airfield for TRL 5–7 alpha testing and real-world validation.</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <div className="p-2 bg-purple-50 rounded shrink-0">
                                <FlaskConical className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                                <strong className="text-slate-900 text-sm block">Scientific</strong>
                                <span className="text-xs text-slate-500">STFC / Edinburgh providing EO validation with ESA support.</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <div className="p-2 bg-purple-50 rounded shrink-0">
                                <Building2 className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                                <strong className="text-slate-900 text-sm block">Administrative</strong>
                                <span className="text-xs text-slate-500">Accountancy & tax partner handling grant management and R&D tax credits.</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <div className="p-2 bg-purple-50 rounded shrink-0">
                                <CloudRain className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                                <strong className="text-slate-900 text-sm block">Technology</strong>
                                <span className="text-xs text-slate-500">Google Cloud Platform, Met Office (meteorological data), Ordnance Survey (land use).</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cost Structure & Revenue Streams */}
                <div className="col-span-9 grid grid-cols-2 gap-4">
                    <div className="bg-slate-900 text-white rounded-xl shadow-sm border border-slate-700 p-5 group hover:border-red-400 transition-colors">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                            <Receipt className="w-4 h-4" /> Cost Structure
                        </h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <strong className="text-white text-sm block mb-1">Lean R&D</strong>
                                <p className="text-xs text-slate-400">Founder sweat equity heavily reducing initial salary costs during development.</p>
                            </div>
                            <div>
                                <strong className="text-white text-sm block mb-1">Variable Costs</strong>
                                <p className="text-xs text-slate-400">Primary spend on data licensing APIs and cloud infra (serverless architecture scales linearly).</p>
                            </div>
                            <div>
                                <strong className="text-white text-sm block mb-1">Fixed Costs (~£10k/yr)</strong>
                                <p className="text-xs text-slate-400">ESA BIC office / hot desk, accountancy, insurance, and baseline meteorological data fees.</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-emerald-900 text-white rounded-xl shadow-sm border border-emerald-700 p-5 group hover:border-emerald-400 transition-colors">
                        <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                            <Wallet className="w-4 h-4" /> Revenue Streams
                        </h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-emerald-800/50 p-3 rounded-lg border border-emerald-700 shadow-inner">
                                <strong className="text-white text-sm block mb-1">B2B Subscriptions</strong>
                                <p className="text-xs text-emerald-200">Club OS including scheduling, roster, and risk dashboard.</p>
                                <div className="mt-2 text-lg font-bold text-white">~£150/mo</div>
                            </div>
                            <div className="bg-emerald-800/50 p-3 rounded-lg border border-emerald-700 shadow-inner">
                                <strong className="text-white text-sm block mb-1">B2C Subscriptions</strong>
                                <p className="text-xs text-emerald-200">Pilot Companion App for personal advice and Flyable Scores.</p>
                                <div className="mt-2 text-lg font-bold text-white">~£12/mo</div>
                            </div>
                            <div className="bg-emerald-800/50 p-3 rounded-lg border border-emerald-700 shadow-inner opacity-70">
                                <strong className="text-white text-sm block mb-1">Future API Licensing</strong>
                                <p className="text-xs text-emerald-200">Data API stream for drone logistics providers.</p>
                                <div className="mt-2 text-lg font-bold text-white">Pay per call</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};



export default ClearSlotBMC;
