import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tripAPI } from '../services/api';
import { geocodeItinerary } from '../services/geocoding';
import { toast } from '../components/Toast';
import MapView from '../components/MapView';
import ItineraryPanel from '../components/ItineraryPanel';

const TripMapView = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [trip, setTrip] = useState(null);
    const [markers, setMarkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [geocoding, setGeocoding] = useState(false);
    const [geocodeProgress, setGeocodeProgress] = useState('');
    const [activeDay, setActiveDay] = useState(1);
    const [highlightedMarker, setHighlightedMarker] = useState(null);
    const [panelOpen, setPanelOpen] = useState(true);

    useEffect(() => {
        fetchTrip();
    }, [id]);

    const fetchTrip = async () => {
        try {
            const response = await tripAPI.getTripById(id);
            const tripData = response.data.trip;
            setTrip(tripData);
            setLoading(false);

            setGeocoding(true);
            setGeocodeProgress('Locating places on map...');

            const geoMarkers = await geocodeItinerary(tripData.itinerary, tripData.destination);
            setMarkers(geoMarkers);
            setGeocoding(false);
            setGeocodeProgress('');

            if (geoMarkers.length > 0) {
                toast.success(`📍 Found ${geoMarkers.length} locations on the map!`);
            }
        } catch {
            toast.error('Failed to load trip.');
            navigate('/dashboard');
        }
    };

    const handleDayChange = (day) => {
        setActiveDay(day);
        setHighlightedMarker(null);
    };

    const handlePlaceClick = (marker) => {
        setHighlightedMarker(marker);
        setTimeout(() => setHighlightedMarker(null), 3000);
    };

    const handleMarkerClick = (marker) => {
        if (!marker.isDestination) {
            setActiveDay(marker.day);
        }
    };

    if (loading) {
        return (
            <div className="trip-map-loading">
                <div className="generating-orb" />
                <h2>Loading trip map...</h2>
            </div>
        );
    }

    return (
        <div className="trip-map-page" id="trip-map-page">
            <div className="trip-map-container">
                <MapView
                    markers={markers}
                    activeDay={activeDay}
                    highlightedMarker={highlightedMarker}
                    onMarkerClick={handleMarkerClick}
                />
            </div>

            <div className="trip-map-topbar">
                <button className="trip-map-back" onClick={() => navigate(`/trip/${id}`)}>
                    ← Back to Details
                </button>
                <div className="trip-map-dest">{trip?.destination}</div>
                {geocoding && (
                    <div className="trip-map-geocoding">
                        <span className="spinner spinner-sm" />
                        <span>{geocodeProgress}</span>
                    </div>
                )}
                {!panelOpen && (
                    <button className="trip-map-toggle-panel" onClick={() => setPanelOpen(true)}>
                        Show Itinerary ☰
                    </button>
                )}
            </div>

            {panelOpen && (
                <ItineraryPanel
                    trip={trip}
                    markers={markers}
                    activeDay={activeDay}
                    onDayChange={handleDayChange}
                    onPlaceClick={handlePlaceClick}
                    onClose={() => setPanelOpen(false)}
                />
            )}
        </div>
    );
};

export default TripMapView;
