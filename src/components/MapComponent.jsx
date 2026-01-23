import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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

const MapComponent = ({ center, zoom = 13, markers = [], isEditable = false, onLocationSelect, selectedLocation, routeTo, onError }) => {
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

    // Custom Icon for User Location (Blue Dot)
    const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: '<div style="background-color: #3b82f6; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3);"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });

    return (
        <div className="h-full w-full bg-slate-900">
            <MapContainer center={mapCenter} zoom={zoom} scrollWheelZoom={true} className="h-full w-full">
                <RecenterMap center={mapCenter} />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {/* User Location Marker */}
                {userPosition && (
                    <Marker position={userPosition} icon={userIcon}>
                        <Popup>You are here</Popup>
                    </Marker>
                )}

                {/* Existing markers */}
                {markers.map((marker, index) => {
                    // Handle both array and object format for existing markers
                    const position = Array.isArray(marker.position)
                        ? marker.position
                        : [marker.position.lat, marker.position.lng];

                    return (
                        <Marker key={index} position={position}>
                            <Tooltip direction="top" offset={[0, -40]} opacity={1} permanent className="font-bold text-sm bg-white/90 text-black px-2 py-1 rounded shadow-md border-none">
                                {marker.popup}
                            </Tooltip>
                            <Popup>
                                <div className="p-1">
                                    <h3 className="font-bold text-sm mb-1">{marker.popup}</h3>
                                    <div className="flex flex-col gap-2 mt-2">
                                        <button
                                            onClick={() => {
                                                if (!userPosition) {
                                                    if (onError) onError("Please enable location services to see directions from your location.");
                                                    else console.warn("Please enable location services to see directions from your location.");
                                                    return;
                                                }
                                                setInternalRouteTo(position);
                                            }}
                                            className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-xs font-medium transition-colors"
                                        >
                                            Show Route
                                        </button>
                                        <a
                                            href={`https://www.openstreetmap.org/directions?to=${position[0]},${position[1]}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-slate-500 hover:text-slate-700 text-xs flex items-center gap-1"
                                        >
                                            Open in OSM ↗
                                        </a>
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
