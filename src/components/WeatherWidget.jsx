import React, { useState, useEffect } from 'react';

const WeatherWidget = ({ siteId }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Determine API URL
                const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

                // Fetch Flyability (which implies fetching weather)
                const response = await fetch(`${baseUrl}/flyability/check`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        site_id: siteId,
                        // Use generic/guest pilot profile for public view
                        pilot: {
                            licence_type: "NPPL(A)",
                            ratings: ["Microlight"],
                            total_hours: 100,
                            supervised_solo_hours: 20,
                            logbook: []
                        },
                        aircraft: {
                            max_demonstrated_crosswind_kt: 15,
                            min_runway_length_m: 300
                        }
                    })
                });

                if (response.ok) {
                    const result = await response.json();
                    setData(result);
                }
            } catch (err) {
                console.error("Weather widget failed", err);
            } finally {
                setLoading(false);
            }
        };

        if (siteId) fetchData();
    }, [siteId]);

    if (loading) return <div className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>;
    if (!data) return <div className="bg-red-50 p-4 rounded text-red-800">Weather data unavailable</div>;

    // Derived UI State
    const isGo = data.status === 'GO';
    const isNoGo = data.status === 'NO_GO';
    const statusColor = isGo ? 'bg-green-500' : isNoGo ? 'bg-red-500' : 'bg-yellow-500';
    const textColor = isGo ? 'text-green-800' : isNoGo ? 'text-red-800' : 'text-yellow-800';
    const bgColor = isGo ? 'bg-green-50' : isNoGo ? 'bg-red-50' : 'bg-yellow-50';

    return (
        <div className={`rounded-xl shadow-lg overflow-hidden border ${isNoGo ? 'border-red-200' : 'border-gray-100'} bg-white`}>
            {/* Header / Status */}
            <div className={`${statusColor} text-white p-4 flex justify-between items-center`}>
                <div>
                    <h3 className="font-bold text-lg">Today's Flyability</h3>
                    <p className="text-white/80 text-xs">Based on MAVIS Analysis</p>
                </div>
                <div className="text-3xl font-black tracking-wider">
                    {data.status}
                </div>
            </div>

            {/* Metrics */}
            <div className="p-4 grid grid-cols-3 gap-4 text-center">
                <div>
                    <div className="text-xs text-gray-500 uppercase font-bold">Wind</div>
                    <div className="font-mono text-lg text-gray-800">12<span className="text-xs">kt</span></div>
                </div>
                <div>
                    <div className="text-xs text-gray-500 uppercase font-bold">Cloud</div>
                    <div className="font-mono text-lg text-gray-800">3500<span className="text-xs">ft</span></div>
                </div>
                <div>
                    <div className="text-xs text-gray-500 uppercase font-bold">Vis</div>
                    <div className="font-mono text-lg text-gray-800">10<span className="text-xs">km</span></div>
                </div>
            </div>

            {/* Reason / Advisory */}
            {(data.reasons.length > 0) && (
                <div className={`px-4 pb-4 ${textColor} text-sm font-medium`}>
                    {data.reasons[0]}
                </div>
            )}

            <div className="bg-gray-50 p-2 text-center text-[10px] text-gray-400">
                Mock Data for Demo • {siteId}
            </div>
        </div>
    );
};

export default WeatherWidget;
