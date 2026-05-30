import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tripAPI } from '../services/api';
import { toast } from '../components/Toast';

const formatBudget = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

const TripDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => { fetchTrip(); }, [id]);

    const fetchTrip = async () => {
        try {
            const response = await tripAPI.getTripById(id);
            setTrip(response.data.trip);
        } catch {
            toast.error('Failed to load trip details.');
            navigate('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this trip? This cannot be undone.')) return;
        setDeleting(true);
        try {
            await tripAPI.deleteTrip(id);
            toast.success('Trip deleted successfully.');
            navigate('/dashboard');
        } catch {
            toast.error('Failed to delete trip.');
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="trip-detail-page">
                <div className="container" style={{ paddingTop: 120 }}>
                    <div className="skeleton" style={{ height: 56, width: '55%', margin: '0 auto 16px', borderRadius: 12 }} />
                    <div className="skeleton" style={{ height: 18, width: '35%', margin: '0 auto 48px', borderRadius: 8 }} />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 18, marginBottom: 48 }}>
                        {[1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton" style={{ height: 110, borderRadius: 20 }} />)}
                    </div>
                    {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 170, marginBottom: 18, borderRadius: 24 }} />)}
                </div>
            </div>
        );
    }

    if (!trip) return null;

    const budgetItems = [
        { icon: '🏨', label: 'Stay', amount: trip.budgetBreakdown?.stay },
        { icon: '🍽️', label: 'Food', amount: trip.budgetBreakdown?.food },
        { icon: '🚗', label: 'Transport', amount: trip.budgetBreakdown?.transport },
        { icon: '🎯', label: 'Activities', amount: trip.budgetBreakdown?.activities },
        { icon: '💎', label: 'Total', amount: trip.budgetBreakdown?.total, isTotal: true },
    ];

    return (
        <div className="trip-detail-page" id="trip-detail-page">
            <div className="container anim-fade-in">
                <button className="back-button" onClick={() => navigate('/dashboard')} id="back-to-dashboard">
                    ← Back to Dashboard
                </button>

                <div className="trip-detail-hero">
                    <h1 className="trip-detail-destination">
                        <span className="gradient-text">{trip.destination}</span>
                    </h1>
                    <div className="trip-detail-meta">
                        <div className="trip-detail-meta-item"><span>📅</span> {trip.duration} {trip.duration === 1 ? 'day' : 'days'}</div>
                        <div className="trip-detail-meta-item"><span>💰</span> {formatBudget(trip.budget)}</div>
                        <div className="trip-detail-meta-item"><span>👥</span> {trip.groupType}</div>
                        <div className="trip-detail-meta-item"><span>🏷️</span> {trip.budgetCategory}</div>
                        <div className="trip-detail-meta-item"><span>📌</span> {formatDate(trip.createdAt)}</div>
                    </div>
                    {trip.tripSummary && <p className="trip-detail-summary">{trip.tripSummary}</p>}
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate(`/trip/${id}/map`)}
                        style={{ marginTop: 16 }}
                        id="view-on-map-btn"
                    >
                        🗺️ View on Map
                    </button>
                </div>

                <div className="budget-grid stagger" id="budget-breakdown">
                    {budgetItems.map((item, i) => (
                        <div className={`budget-item ${item.isTotal ? 'total' : ''}`} key={i}>
                            <div className="budget-item-icon">{item.icon}</div>
                            <div className="budget-item-amount">{item.amount ? formatBudget(item.amount) : '—'}</div>
                            <div className="budget-item-label">{item.label}</div>
                        </div>
                    ))}
                </div>

                {trip.itinerary?.length > 0 && (
                    <div className="itinerary-section" id="itinerary-section">
                        <h2 className="section-heading"><span>🗓️</span> Day-by-Day Itinerary</h2>
                        <div className="stagger">
                            {trip.itinerary.map((day, i) => (
                                <div className="day-card" key={i} id={`day-${day.day}`}>
                                    <div className="day-card-header">
                                        <div className="day-number">D{day.day}</div>
                                        <div className="day-title">{day.title || `Day ${day.day}`}</div>
                                    </div>
                                    <div className="day-card-body">
                                        <div className="time-slot">
                                            <div className="time-slot-icon morning">🌅</div>
                                            <div><div className="time-slot-label">Morning</div><div className="time-slot-text">{day.morning}</div></div>
                                        </div>
                                        <div className="time-slot">
                                            <div className="time-slot-icon afternoon">☀️</div>
                                            <div><div className="time-slot-label">Afternoon</div><div className="time-slot-text">{day.afternoon}</div></div>
                                        </div>
                                        <div className="time-slot">
                                            <div className="time-slot-icon evening">🌙</div>
                                            <div><div className="time-slot-label">Evening</div><div className="time-slot-text">{day.evening}</div></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {trip.hotels?.length > 0 && (
                    <div style={{ marginBottom: 48 }} id="hotels-section">
                        <h2 className="section-heading"><span>🏨</span> Recommended Hotels</h2>
                        <div className="hotels-grid stagger">
                            {trip.hotels.map((hotel, i) => (
                                <div className="hotel-card" key={i} id={`hotel-${i}`}>
                                    <div className="hotel-name">{hotel.name}</div>
                                    <span className="hotel-category">{hotel.category}</span>
                                    <div className="hotel-price">{formatBudget(hotel.pricePerNight)}</div>
                                    <div className="hotel-price-label">per night</div>
                                    <div className="hotel-location"><span>📍</span> {hotel.locationArea}</div>
                                    {hotel.reason && <div className="hotel-reason">&quot;{hotel.reason}&quot;</div>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {trip.travelTips?.length > 0 && (
                    <div style={{ marginBottom: 48 }} id="tips-section">
                        <h2 className="section-heading"><span>💡</span> Travel Tips</h2>
                        <div className="card-glass">
                            <ul className="tips-list">
                                {trip.travelTips.map((tip, i) => (
                                    <li className="tip-item" key={i}>
                                        <div className="tip-icon">✓</div>
                                        <div className="tip-text">{tip}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {trip.interests?.length > 0 && (
                    <div style={{ marginBottom: 48 }}>
                        <h2 className="section-heading"><span>🏷️</span> Trip Interests</h2>
                        <div className="chip-group">
                            {trip.interests.map((interest, i) => (
                                <div className="chip selected" key={i} style={{ cursor: 'default' }}>{interest}</div>
                            ))}
                        </div>
                    </div>
                )}

                <div style={{ textAlign: 'center', padding: '32px 0 48px', borderTop: '1px solid var(--border)', marginTop: 24 }}>
                    <button className="btn btn-danger" onClick={handleDelete} disabled={deleting} id="delete-trip-btn">
                        {deleting ? (<><span className="spinner spinner-sm" /> Deleting...</>) : 'Delete this trip'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TripDetail;
