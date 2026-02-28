import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tripAPI } from '../services/api';
import { searchDestinations } from '../services/geocoding';
import { toast } from '../components/Toast';

const budgetCategories = [
    { value: 'Low', label: '💸 Budget', desc: '₹1K–3K/night' },
    { value: 'Medium', label: '🏨 Mid-Range', desc: '₹3K–7K/night' },
    { value: 'Premium', label: '✨ Premium', desc: '₹7K+/night' },
];

const groupTypes = [
    { value: 'Solo', icon: '🧑' },
    { value: 'Couple', icon: '💑' },
    { value: 'Friends', icon: '👯' },
    { value: 'Family', icon: '👨‍👩‍👧‍👦' },
];

const interestOptions = [
    { value: 'Adventure', icon: '🏔️' },
    { value: 'Cultural', icon: '🏛️' },
    { value: 'Nature', icon: '🌿' },
    { value: 'Nightlife', icon: '🌃' },
    { value: 'Spiritual', icon: '🕉️' },
    { value: 'Relaxation', icon: '🧘' },
];

const generatingSteps = [
    'Analyzing your preferences...',
    'Researching destinations...',
    'Building your itinerary...',
    'Finding best hotels...',
    'Calculating budget...',
    'Adding travel tips...',
];

const CreateTrip = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        destination: '',
        duration: 3,
        budget: 20000,
        budgetCategory: 'Medium',
        groupType: 'Solo',
        interests: [],
    });

    const [errors, setErrors] = useState({});
    const [generating, setGenerating] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const debounceRef = useRef(null);
    const suggestionsRef = useRef(null);

    const [mapCoords, setMapCoords] = useState(null);
    const [mapLoading, setMapLoading] = useState(false);
    const mapDebounceRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (!generating) return;
        const interval = setInterval(() => {
            setCurrentStep((prev) => (prev < generatingSteps.length - 1 ? prev + 1 : prev));
        }, 2500);
        return () => clearInterval(interval);
    }, [generating]);

    useEffect(() => {
        const dest = form.destination.trim();
        if (dest.length < 2) {
            setMapCoords(null);
            return;
        }

        if (mapDebounceRef.current) clearTimeout(mapDebounceRef.current);

        mapDebounceRef.current = setTimeout(async () => {
            setMapLoading(true);
            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(dest)}&limit=1`,
                    { headers: { 'Accept-Language': 'en', 'User-Agent': 'VoyageTripPlanner/1.0' } }
                );
                const data = await res.json();
                if (data && data.length > 0) {
                    setMapCoords({
                        lat: parseFloat(data[0].lat),
                        lon: parseFloat(data[0].lon),
                        name: data[0].display_name,
                    });
                } else {
                    setMapCoords(null);
                }
            } catch {
                setMapCoords(null);
            } finally {
                setMapLoading(false);
            }
        }, 800);

        return () => {
            if (mapDebounceRef.current) clearTimeout(mapDebounceRef.current);
        };
    }, [form.destination]);

    const handleDestinationChange = async (e) => {
        const value = e.target.value;
        setForm((prev) => ({ ...prev, destination: value }));

        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (value.trim().length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            try {
                const results = await searchDestinations(value);
                if (results.length > 0) {
                    setSuggestions(results);
                    setShowSuggestions(true);
                } else {
                    setSuggestions([]);
                    setShowSuggestions(false);
                }
            } catch {
                setSuggestions([]);
            }
        }, 400);
    };

    const selectSuggestion = (s) => {
        const displayName = s.placeName.split(',').slice(0, 2).join(',').trim();
        setForm((prev) => ({ ...prev, destination: displayName }));
        setShowSuggestions(false);
        setSuggestions([]);
    };

    const toggleInterest = (interest) => {
        setForm((prev) => ({
            ...prev,
            interests: prev.interests.includes(interest)
                ? prev.interests.filter((i) => i !== interest)
                : [...prev.interests, interest],
        }));
    };

    const validate = () => {
        const errs = {};
        if (!form.destination.trim()) errs.destination = 'Destination is required';
        if (!form.duration || form.duration < 1) errs.duration = 'Min. 1 day';
        if (form.duration > 15) errs.duration = 'Max. 15 days';
        if (!form.budget || form.budget <= 0) errs.budget = 'Enter a valid budget';
        if (form.interests.length === 0) errs.interests = 'Select at least one interest';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setGenerating(true);
        setCurrentStep(0);

        try {
            const response = await tripAPI.generateTrip({
                destination: form.destination.trim(),
                duration: Number(form.duration),
                budget: Number(form.budget),
                budgetCategory: form.budgetCategory,
                groupType: form.groupType,
                interests: form.interests,
            });
            toast.success('Trip generated successfully! 🎉');
            navigate(`/trip/${response.data.trip._id}`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to generate trip. Please try again.');
            setGenerating(false);
        }
    };

    const showMap = mapCoords !== null;

    const getMapUrl = () => {
        if (!mapCoords) return '';
        const { lat, lon } = mapCoords;
        const bbox = `${lon - 0.15},${lat - 0.1},${lon + 0.15},${lat + 0.1}`;
        return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`;
    };

    if (generating) {
        return (
            <div className="create-trip-page">
                <div className="container">
                    <div className="generating-container" id="generating-screen">
                        <div className="generating-orb" />
                        <h2 className="generating-title">Crafting Your Perfect Trip</h2>
                        <p className="generating-subtitle">
                            Our AI is building a personalized itinerary for <strong>{form.destination}</strong>
                        </p>
                        <div className="generating-steps">
                            {generatingSteps.map((step, i) => (
                                <div
                                    key={i}
                                    className={`generating-step ${i < currentStep ? 'done' : ''} ${i === currentStep ? 'active' : ''}`}
                                >
                                    <span className="generating-step-dot" />
                                    {step}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="create-trip-page" id="create-trip-page">
            <div className="container anim-fade-in">
                <div className="create-trip-header">
                    <h1 className="create-trip-title">
                        Plan your <span className="gradient-text">trip</span>
                    </h1>
                    <p className="create-trip-subtitle">
                        Tell us your preferences and our AI will craft the perfect itinerary.
                    </p>
                </div>

                <div className={`create-trip-layout ${showMap ? 'with-map' : ''}`}>
                    <form className="create-trip-form" onSubmit={handleSubmit} id="trip-form">
                        <div className="card-glass" style={{ marginBottom: 24 }}>
                            <div className="form-section-title">
                                <span className="form-section-icon">📍</span>
                                Where to?
                            </div>
                            <div className="form-group" style={{ position: 'relative' }} ref={suggestionsRef}>
                                <label className="form-label" htmlFor="destination">Destination</label>
                                <input
                                    id="destination"
                                    name="destination"
                                    type="text"
                                    className={`form-input ${errors.destination ? 'error' : ''}`}
                                    placeholder="e.g., Goa, Manali, Kerala, Paris..."
                                    value={form.destination}
                                    onChange={handleDestinationChange}
                                    autoComplete="off"
                                    autoFocus
                                />
                                {errors.destination && <div className="form-error">{errors.destination}</div>}
                                {showSuggestions && suggestions.length > 0 && (
                                    <div style={{
                                        position: 'absolute', top: '100%', left: 0, right: 0,
                                        background: 'var(--bg-2)', border: '1px solid var(--border)',
                                        borderRadius: 'var(--radius)', marginTop: 4, zIndex: 100,
                                        overflow: 'hidden', boxShadow: 'var(--shadow-lg)',
                                    }}>
                                        {suggestions.map((s, i) => (
                                            <div
                                                key={i}
                                                onClick={() => selectSuggestion(s)}
                                                style={{
                                                    padding: '10px 14px', cursor: 'pointer',
                                                    borderBottom: i < suggestions.length - 1 ? '1px solid var(--border)' : 'none',
                                                    fontSize: '13px', color: 'var(--text-2)',
                                                    transition: 'background 150ms',
                                                }}
                                                onMouseEnter={(e) => { e.target.style.background = 'rgba(255,255,255,0.06)'; }}
                                                onMouseLeave={(e) => { e.target.style.background = 'transparent'; }}
                                            >
                                                📍 {s.placeName || s.placeAddress || 'Unknown'}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="card-glass" style={{ marginBottom: 24 }}>
                            <div className="form-section-title">
                                <span className="form-section-icon">⚙️</span>
                                Trip Details
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="duration">Duration (days)</label>
                                    <input
                                        id="duration" name="duration" type="number"
                                        className={`form-input ${errors.duration ? 'error' : ''}`}
                                        value={form.duration}
                                        onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))}
                                        min="1" max="15"
                                    />
                                    {errors.duration && <div className="form-error">{errors.duration}</div>}
                                </div>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="budget">Total Budget (₹ INR)</label>
                                    <input
                                        id="budget" name="budget" type="number"
                                        className={`form-input ${errors.budget ? 'error' : ''}`}
                                        value={form.budget}
                                        onChange={(e) => setForm((p) => ({ ...p, budget: e.target.value }))}
                                        min="1000" step="1000"
                                    />
                                    {errors.budget && <div className="form-error">{errors.budget}</div>}
                                    <div className="form-hint">
                                        ₹{Number(form.budget || 0).toLocaleString('en-IN')} total for {form.duration || 0} days
                                    </div>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Budget Category</label>
                                <div className="chip-group">
                                    {budgetCategories.map((cat) => (
                                        <div
                                            key={cat.value}
                                            className={`chip ${form.budgetCategory === cat.value ? 'selected' : ''}`}
                                            onClick={() => setForm((p) => ({ ...p, budgetCategory: cat.value }))}
                                            id={`budget-${cat.value.toLowerCase()}`}
                                        >
                                            {cat.label}
                                            <span style={{ fontSize: '11px', opacity: 0.5, marginLeft: 4 }}>{cat.desc}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="card-glass" style={{ marginBottom: 24 }}>
                            <div className="form-section-title">
                                <span className="form-section-icon">👥</span>
                                Who's traveling?
                            </div>
                            <div className="chip-group">
                                {groupTypes.map((g) => (
                                    <div
                                        key={g.value}
                                        className={`chip ${form.groupType === g.value ? 'selected' : ''}`}
                                        onClick={() => setForm((p) => ({ ...p, groupType: g.value }))}
                                        id={`group-${g.value.toLowerCase()}`}
                                    >
                                        <span className="chip-icon">{g.icon}</span>
                                        {g.value}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="card-glass" style={{ marginBottom: 36 }}>
                            <div className="form-section-title">
                                <span className="form-section-icon">❤️</span>
                                Your Interests
                            </div>
                            <div className="chip-group">
                                {interestOptions.map((interest) => (
                                    <div
                                        key={interest.value}
                                        className={`chip ${form.interests.includes(interest.value) ? 'selected' : ''}`}
                                        onClick={() => toggleInterest(interest.value)}
                                        id={`interest-${interest.value.toLowerCase()}`}
                                    >
                                        <span className="chip-icon">{interest.icon}</span>
                                        {interest.value}
                                    </div>
                                ))}
                            </div>
                            {errors.interests && <div className="form-error" style={{ marginTop: 10 }}>{errors.interests}</div>}
                        </div>

                        <div style={{ textAlign: 'center' }}>
                            <button
                                type="submit"
                                className="btn btn-primary btn-lg"
                                id="generate-trip-btn"
                                style={{ minWidth: 260 }}
                            >
                                Generate itinerary →
                            </button>
                            <p style={{ marginTop: 10, fontSize: '12px', color: 'var(--text-4)' }}>
                                AI-powered · Takes 15–30 seconds · All prices in ₹ INR
                            </p>
                        </div>
                    </form>

                    {showMap && (
                        <div className="create-trip-map" id="destination-map">
                            <div className="map-panel">
                                <div className="map-panel-header">
                                    <div className="map-panel-icon">🗺️</div>
                                    <div>
                                        <div className="map-panel-title">{form.destination}</div>
                                        <div className="map-panel-subtitle">
                                            {mapCoords.lat.toFixed(4)}°N, {mapCoords.lon.toFixed(4)}°E
                                        </div>
                                    </div>
                                </div>
                                <div className="map-iframe-wrapper">
                                    {mapLoading ? (
                                        <div className="map-loading">
                                            <span className="spinner"></span>
                                            <span>Locating destination...</span>
                                        </div>
                                    ) : (
                                        <iframe
                                            key={`${mapCoords.lat}-${mapCoords.lon}`}
                                            src={getMapUrl()}
                                            width="100%"
                                            height="100%"
                                            style={{ border: 0, borderRadius: 0 }}
                                            loading="lazy"
                                            title={`Map of ${form.destination}`}
                                            allowFullScreen
                                        />
                                    )}
                                </div>
                                <div className="map-panel-footer">
                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${mapCoords.lat},${mapCoords.lon}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="map-open-link"
                                    >
                                        Open in Google Maps ↗
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateTrip;
