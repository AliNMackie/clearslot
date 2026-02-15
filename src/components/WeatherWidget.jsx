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
                            total_hours: 100,
                            hours_on_type: 50,
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

    if (loading) return (
        <div className="rounded-xl shadow-lg overflow-hidden border border-gray-100 bg-white h-full">
            <div className="h-24 bg-gray-200 animate-pulse"></div>
            <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4"></div>
                <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
            </div>
        </div>
    );

    if (!data) return <div className="bg-red-50 p-4 rounded text-red-800 text-sm">Weather data unavailable</div>;

    // Extract real weather values from API response
    const weather = data.weather || {};
    // Fallbacks to 0 if data missing
    const windKt = Math.round(weather.wind_speed_kt || 0);
    const cloudFt = Math.round(weather.cloud_base_ft || 0);
    const visKm = Math.round((weather.visibility_m || 0) / 1000);

    // Derived UI State
    const isGo = data.status === 'GO';
    const isNoGo = data.status === 'NO_GO';
    const statusColor = isGo ? 'bg-green-500' : isNoGo ? 'bg-red-500' : 'bg-yellow-500';
    const textColor = isGo ? 'text-green-800' : isNoGo ? 'text-red-800' : 'text-yellow-800';

    return (
        <div className={`rounded-xl shadow-lg overflow-hidden border ${isNoGo ? 'border-red-200' : 'border-gray-100'} bg-white h-full flex flex-col`}>
            {/* Header / Status - Compact on mobile */}
            <div className={`${statusColor} text-white p-3 md:p-4 flex justify-between items-center transition-colors duration-300`}>
                <div>
                    <h3 className="font-bold text-base md:text-lg leading-tight">Flyability</h3>
                    <p className="text-white/80 text-[10px] md:text-xs">Live Analysis</p>
                </div>
                <div className="text-2xl md:text-3xl font-black tracking-wider">
                    {data.status.replace("_", " ")}
                </div>
            </div>

            {/* Metrics */}
            <div className="p-3 md:p-4 grid grid-cols-3 gap-2 md:gap-4 text-center border-b border-gray-100">
                <div className="flex flex-col justify-center">
                    <div className="text-[10px] md:text-xs text-gray-500 uppercase font-bold tracking-wider">Wind</div>
                    <div className="font-mono text-base md:text-lg text-gray-800 font-bold">{windKt}<span className="text-[10px] md:text-xs font-normal text-gray-400 ml-0.5">kt</span></div>
                </div>
                <div className="border-l border-gray-100 pl-2">
                    <div className="text-[10px] md:text-xs text-gray-500 uppercase font-bold tracking-wider">Cld</div>
                    <div className="font-mono text-base md:text-lg text-gray-800 font-bold">{cloudFt}<span className="text-[10px] md:text-xs font-normal text-gray-400 ml-0.5">ft</span></div>
                </div>
                <div className="border-l border-gray-100 pl-2">
                    <div className="text-[10px] md:text-xs text-gray-500 uppercase font-bold tracking-wider">Vis</div>
                    <div className="font-mono text-base md:text-lg text-gray-800 font-bold">{visKm}<span className="text-[10px] md:text-xs font-normal text-gray-400 ml-0.5">km</span></div>
                </div>
            </div>

            {/* Reason / Advisory - Scrollable if long */}
            <div className="flex-grow p-3 md:p-4 flex items-center">
                {(data.reasons.length > 0) ? (
                    <div className={`${textColor} text-xs md:text-sm font-medium leading-tight`}>
                        {data.reasons[0]}
                    </div>
                ) : (
                    <div className="text-green-600 text-xs md:text-sm font-medium flex items-center gap-1">
                        <span>✓</span> Good conditions reported.
                    </div>
                )}
            </div>

            <div className="bg-gray-50 p-2 text-center text-[9px] md:text-[10px] text-gray-400 uppercase tracking-widest">
                PIC Authority • {siteId}
            </div>
        </div>
    );
};

export default WeatherWidget;
