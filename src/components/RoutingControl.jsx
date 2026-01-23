import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

const RoutingControl = ({ start, end }) => {
    const map = useMap();

    useEffect(() => {
        if (!map || !start || !end) return;

        const routingControl = L.Routing.control({
            waypoints: [
                L.latLng(start[0], start[1]),
                L.latLng(end[0], end[1])
            ],
            routeWhileDragging: false,
            showAlternatives: true,
            fitSelectedRoutes: true,
            lineOptions: {
                styles: [{ color: '#3b82f6', weight: 4 }]
            },
            show: true, // Show instructions
            addWaypoints: false,
            draggableWaypoints: false,
            // Custom markers can be configured here if needed, but default is usually okay
            createMarker: function () { return null; } // Don't create default markers, use ours
        }).addTo(map);

        return () => {
            // Cleanup
            try {
                map.removeControl(routingControl);
            } catch (e) {
                console.warn("Error removing routing control:", e);
            }
        };
    }, [map, start, end]);

    return null;
};

export default RoutingControl;
