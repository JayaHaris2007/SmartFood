import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useTheme } from '../context/ThemeContext';

// Fix for default marker icon issues with bundlers
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to handle map clicks
const LocationMarker = ({ onLocationSelect, selectedLocation, isEditable }) => {
    const map = useMapEvents({
        click(e) {
            if (isEditable && onLocationSelect) {
                onLocationSelect({
                    lat: e.latlng.lat,
                    lng: e.latlng.lng
                });
            }
        },
    });

    return selectedLocation ? (
        <Marker position={[selectedLocation.lat, selectedLocation.lng]}>
            <Popup>Selected Location</Popup>
        </Marker>
    ) : null;
};

const RecenterMap = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(center);
    }, [center, map]);
    return null;
};

import RoutingControl from './RoutingControl';

const MapComponent = ({ center, zoom = 13, markers = [], isEditable = false, onLocationSelect, selectedLocation, routeTo, onError, allowScrollZoom = false }) => {
    const { isDarkMode } = useTheme();
    // ... (lines 52-148 remain unchanged, but ReplaceContent needs to be exact match, so I will start replacement from MapComponent definition line)

    // Default to London if no center provided initially
    const defaultCenter = [51.505, -0.09];

    // State to track the map center
    const [mapCenter, setMapCenter] = useState(
        center ? (Array.isArray(center) ? center : [center.lat, center.lng]) : defaultCenter
    );
    const [userPosition, setUserPosition] = useState(null);
    const [internalRouteTo, setInternalRouteTo] = useState(null);

    // Use either prop or internal state for routing
    const activeDestination = routeTo || internalRouteTo;

    useEffect(() => {
        let watchId;
        // If no center was explicitly provided via props, try to get user's location
        if (!center) {
            if ("geolocation" in navigator) {
                watchId = navigator.geolocation.watchPosition(
                    (position) => {
                        const newPos = [position.coords.latitude, position.coords.longitude];
                        setUserPosition(newPos);
                        setMapCenter(newPos);
                    },
                    (error) => {
                        console.error("Error getting location:", error);
                        // Fallback remains the default
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 5000,
                        maximumAge: 0
                    }
                );
            }
        } else {
            // If center prop changes, update state
            setMapCenter(Array.isArray(center) ? center : [center.lat, center.lng]);
        }

        return () => {
            if (watchId) navigator.geolocation.clearWatch(watchId);
        };
    }, [center]);

    // Custom Icons
    const restaurantIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `<div class="w-10 h-10 bg-primary/90 rounded-full flex items-center justify-center border-2 border-white shadow-lg shadow-black/20 transform hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/></svg>
               </div>
               <div class="pointer-events-none absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-black/20 blur-sm rounded-full"></div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
    });

    const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: `<div class="relative w-8 h-8">
                <div class="absolute inset-0 bg-blue-500 rounded-full opacity-20 animate-ping"></div>
                <div class="absolute inset-1 bg-blue-500 rounded-full border-2 border-white shadow-md flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
                </div>
               </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
    });

    return (
        <div className="h-full w-full bg-gray-100 dark:bg-slate-900 rounded-2xl overflow-hidden shadow-inner relative">
            <style>{`
                .leaflet-container {
                    font-family: inherit;
                    background: transparent;
                }
                .leaflet-popup-content-wrapper {
                    border-radius: 16px;
                    padding: 0;
                    overflow: hidden;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
                    background: ${isDarkMode ? '#1e293b' : 'white'} !important;
                    color: ${isDarkMode ? 'white' : '#111827'} !important;
                }
                .leaflet-popup-content {
                    margin: 0;
                    line-height: 1.5;
                }
                .leaflet-popup-tip {
                    background: ${isDarkMode ? '#1e293b' : 'white'} !important;
                }
                .custom-map-marker {
                    background: transparent;
                    border: none;
                }
                /* Hide standard zoom controls if we want custom ones, but keeping them for now */
            `}</style>
            <MapContainer center={mapCenter} zoom={zoom} scrollWheelZoom={allowScrollZoom} zoomControl={false} className="h-full w-full z-0">
                <RecenterMap center={mapCenter} />
                {/* Premium Tiles: CartoDB Voyager */}
                <TileLayer
                    attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url={isDarkMode
                        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    }
                />

                {/* User Location Marker */}
                {userPosition && (
                    <Marker position={userPosition} icon={userIcon}>
                        <Popup className="premium-popup">
                            <div className="p-3 text-center">
                                <span className="font-bold text-sm">You are here</span>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {/* Restaurant Markers */}
                {markers.map((marker, index) => {
                    // Handle both array and object format for existing markers
                    const position = Array.isArray(marker.position)
                        ? marker.position
                        : [marker.position.lat, marker.position.lng];

                    return (
                        <Marker key={index} position={position} icon={restaurantIcon}>
                            <Popup>
                                <div className="p-4 min-w-[200px]">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="text-primary"><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" /></svg>
                                        </div>
                                        <h3 className="font-bold text-lg leading-tight">{marker.popup}</h3>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={() => {
                                                if (!userPosition) {
                                                    if (onError) onError("Please enable location services to see directions from your location.");
                                                    else console.warn("Please enable location services to see directions from your location.");
                                                    return;
                                                }
                                                setInternalRouteTo(position);
                                            }}
                                            className="w-full bg-primary hover:bg-red-600 text-white py-2 rounded-lg text-sm font-bold transition-colors shadow-md shadow-primary/20"
                                        >
                                            Get Directions
                                        </button>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}

                {/* Routing Control */}
                {userPosition && activeDestination && (
                    <RoutingControl
                        start={userPosition}
                        end={Array.isArray(activeDestination) ? activeDestination : [activeDestination.lat, activeDestination.lng]}
                    />
                )}

                {/* Handle clicks and show selected location */}
                <LocationMarker
                    onLocationSelect={onLocationSelect}
                    selectedLocation={selectedLocation}
                    isEditable={isEditable}
                />
            </MapContainer>
        </div>
    );
};

export default MapComponent;
