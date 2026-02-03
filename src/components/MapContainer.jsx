import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Polyline } from '@react-google-maps/api';
import { config } from '../config/env';

// Strathaven Airfield coordinates
const CENTER = {
    lat: 55.6766,
    lng: -4.0714
};

const CONTAINER_STYLE = {
    width: '100%',
    height: '400px',
    borderRadius: '24px' // Matching the app's rounded aesthetic
};

// Custom map styles to clean up labels if needed, or stick to standard satellite
const MAP_OPTIONS = {
    mapTypeId: 'hybrid', // Satellite + Labels
    disableDefaultUI: true, // Clean look
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false, // User can toggle via custom buttons if we add them later
    scaleControl: true,
    rotateControl: false,
    fullscreenControl: true,
    tilt: 45 // Enable 45-degree imagery where available
};

// Example flight path (Circuit pattern placeholder)
const CIRCUIT_PATH = [
    { lat: 55.6766, lng: -4.0714 },
    { lat: 55.6800, lng: -4.0750 },
    { lat: 55.6820, lng: -4.0600 },
    { lat: 55.6780, lng: -4.0550 },
    { lat: 55.6766, lng: -4.0714 }
];

const MapContainer = ({ activeOverlay }) => {
    // 1. Check if Key exists in config
    const hasApiKey = !!config.GOOGLE_MAPS_API_KEY;

    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: config.GOOGLE_MAPS_API_KEY || '',
        enabled: hasApiKey // Prevent loader from running if no key
    });

    const [map, setMap] = useState(null);

    const onLoad = useCallback(function callback(map) {
        setMap(map);
    }, []);

    const onUnmount = useCallback(function callback(map) {
        setMap(null);
    }, []);

    // 2. Graceful Fallback if Key is missing (Common in early dev/demo)
    if (!hasApiKey) {
        return (
            <div className="w-full h-[400px] bg-slate-100 rounded-3xl flex flex-col items-center justify-center border border-white/20 text-navy p-6 text-center">
                <div className="bg-white p-3 rounded-full shadow-sm mb-3">
                    <span className="text-2xl">🗺️</span>
                </div>
                <h3 className="font-serif text-lg font-bold mb-1">Map Unavailable</h3>
                <p className="text-sm opacity-60 max-w-xs">
                    Google Maps API Key is missing.<br />
                    Add <code>VITE_GOOGLE_MAPS_API_KEY</code> to your environment to enable satellite view.
                </p>
            </div>
        );
    }

    // 3. Handle Load Errors (e.g. Invalid Key, Billing Billing)
    if (loadError) {
        return (
            <div className="w-full h-[400px] bg-red-50 rounded-3xl flex items-center justify-center text-red-500 border border-red-100">
                Map Failed to Load (Check Console)
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="w-full h-[400px] bg-slate-50 rounded-3xl flex items-center justify-center animate-pulse">
                <span className="text-navy opacity-50 font-medium">Loading Satellite Data...</span>
            </div>
        );
    }

    return (
        <div className="relative w-full rounded-3xl overflow-hidden shadow-lg border border-white/20">
            <GoogleMap
                mapContainerStyle={CONTAINER_STYLE}
                center={CENTER}
                zoom={14}
                onLoad={onLoad}
                onUnmount={onUnmount}
                options={MAP_OPTIONS}
            >
                {/* Airfield Marker */}
                <Marker
                    position={CENTER}
                    title="Strathaven Airfield"
                // icon={{ url: '/path/to/custom/pin.png' }} // Future custom pin
                />

                {/* Circuit / Flight Path Overlay */}
                {activeOverlay === 'circuit' && (
                    <Polyline
                        path={CIRCUIT_PATH}
                        options={{
                            strokeColor: '#FF6B6B',
                            strokeOpacity: 0.8,
                            strokeWeight: 2,
                            geodesic: true,
                        }}
                    />
                )}

                {/* Future: MAVIS Weather Overlay layers would go here */}

            </GoogleMap>

            {/* Helper Badge */}
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm text-xs font-medium text-navy z-10">
                Satellite • Strathaven
            </div>

        </div>
    );
};

export default React.memo(MapContainer);
