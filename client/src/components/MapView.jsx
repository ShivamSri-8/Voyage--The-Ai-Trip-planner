import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ── Day accent colors ──
const DAY_COLORS = [
    '#6c63ff', // destination pin (purple)
    '#f87171', // day 1 - red
    '#fb923c', // day 2 - orange
    '#fbbf24', // day 3 - yellow
    '#34d399', // day 4 - green
    '#22d3ee', // day 5 - cyan
    '#818cf8', // day 6 - indigo
    '#f472b6', // day 7 - pink
    '#a78bfa', // day 8 - violet
    '#2dd4bf', // day 9 - teal
    '#facc15', // day 10 - gold
    '#fb7185', // day 11
    '#38bdf8', // day 12
    '#a3e635', // day 13
    '#e879f9', // day 14
    '#f59e0b', // day 15
];

// ── Custom colored div icon ──
const createDayIcon = (dayIndex, label) => {
    const color = DAY_COLORS[dayIndex] || DAY_COLORS[0];
    return L.divIcon({
        className: 'custom-map-pin',
        html: `
            <div style="
                width: 32px; height: 32px;
                background: ${color};
                border: 3px solid white;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                display: flex; align-items: center; justify-content: center;
                box-shadow: 0 3px 12px rgba(0,0,0,0.4);
                position: relative;
            ">
                <span style="
                    transform: rotate(45deg);
                    color: white;
                    font-size: 11px;
                    font-weight: 700;
                    font-family: 'DM Sans', system-ui, sans-serif;
                    text-shadow: 0 1px 2px rgba(0,0,0,0.3);
                ">${label}</span>
            </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
    });
};

// ── Star icon for main destination ──
const createDestinationIcon = () => {
    return L.divIcon({
        className: 'custom-map-pin',
        html: `
            <div style="
                width: 40px; height: 40px;
                background: linear-gradient(135deg, #6c63ff, #4fd1c5);
                border: 3px solid white;
                border-radius: 50%;
                display: flex; align-items: center; justify-content: center;
                box-shadow: 0 4px 16px rgba(108,99,255,0.5);
                animation: pulse-pin 2s infinite;
            ">
                <span style="font-size: 18px; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.2));">📍</span>
            </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -20],
    });
};

// ── Component to auto-fly to markers ──
const FitBounds = ({ markers, activeDay, highlightedMarker }) => {
    const map = useMap();
    const prevBoundsRef = useRef(null);

    useEffect(() => {
        if (!markers || markers.length === 0) return;

        let filtered = markers;
        if (activeDay > 0) {
            filtered = markers.filter((m) => m.day === activeDay);
            if (filtered.length === 0) filtered = markers;
        }

        if (highlightedMarker) {
            map.flyTo([highlightedMarker.lat, highlightedMarker.lon], 14, { duration: 1 });
            return;
        }

        if (filtered.length === 1) {
            map.flyTo([filtered[0].lat, filtered[0].lon], 13, { duration: 1.2 });
        } else {
            const bounds = L.latLngBounds(filtered.map((m) => [m.lat, m.lon]));
            const boundsStr = bounds.toBBoxString();
            if (prevBoundsRef.current !== boundsStr) {
                map.flyToBounds(bounds, { padding: [60, 60], duration: 1.2, maxZoom: 14 });
                prevBoundsRef.current = boundsStr;
            }
        }
    }, [markers, activeDay, highlightedMarker, map]);

    return null;
};

/**
 * MapView Component
 * Full-screen Leaflet map with colored day pins
 */
const MapView = ({ markers = [], activeDay = 0, highlightedMarker = null, onMarkerClick }) => {
    const visibleMarkers =
        activeDay > 0
            ? markers.filter((m) => m.day === activeDay || m.isDestination)
            : markers;

    return (
        <MapContainer
            center={[20.5937, 78.9629]} // Default: center of India
            zoom={5}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />

            {visibleMarkers.map((marker, i) => (
                <Marker
                    key={`${marker.day}-${marker.period}-${i}`}
                    position={[marker.lat, marker.lon]}
                    icon={
                        marker.isDestination
                            ? createDestinationIcon()
                            : createDayIcon(marker.day, `D${marker.day}`)
                    }
                    eventHandlers={{
                        click: () => onMarkerClick?.(marker),
                    }}
                >
                    <Popup>
                        <div className="map-popup-content">
                            {marker.isDestination ? (
                                <>
                                    <strong className="map-popup-title">📍 {marker.name}</strong>
                                    <p className="map-popup-text">Main destination</p>
                                </>
                            ) : (
                                <>
                                    <div className="map-popup-day" style={{ background: DAY_COLORS[marker.day] }}>
                                        Day {marker.day}
                                    </div>
                                    <strong className="map-popup-title">{marker.name}</strong>
                                    <p className="map-popup-period">{marker.periodLabel}</p>
                                    <p className="map-popup-text">{marker.text}</p>
                                </>
                            )}
                        </div>
                    </Popup>
                </Marker>
            ))}

            <FitBounds markers={visibleMarkers} activeDay={activeDay} highlightedMarker={highlightedMarker} />
        </MapContainer>
    );
};

export { DAY_COLORS };
export default MapView;
