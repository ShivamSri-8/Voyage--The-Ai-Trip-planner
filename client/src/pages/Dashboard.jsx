import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tripAPI } from '../services/api';
import TripCard from '../components/TripCard';
import { toast } from '../components/Toast';

const formatBudget = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount);
};

const Dashboard = () => {
    const { user } = useAuth();
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTrips();
    }, []);

    const fetchTrips = async () => {
        try {
            const response = await tripAPI.getTrips();
            setTrips(response.data.trips);
        } catch (err) {
            toast.error('Failed to load trips.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const totalBudget = trips.reduce((sum, t) => sum + (t.budgetBreakdown?.total || t.budget || 0), 0);
    const totalDays = trips.reduce((sum, t) => sum + t.duration, 0);

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    const greetingEmoji = hour < 12 ? '☀️' : hour < 18 ? '🌤️' : '🌙';

    return (
        <div className="dashboard-page" id="dashboard-page">
            <div className="container anim-fade-in">
                {/* Header */}
                <div className="page-header">
                    <div>
                        <p className="page-greeting">
                            {greeting}, {user?.name?.split(' ')[0]} {greetingEmoji}
                        </p>
                        <h1 className="page-title">Your Trips</h1>
                    </div>
                    <Link to="/create-trip" className="btn btn-primary" id="dashboard-new-trip">
                        ✨ Plan New Trip
                    </Link>
                </div>

                {/* Stats */}
                <div className="stats-row stagger">
                    <div className="stat-card" id="stat-total-trips">
                        <div className="stat-icon sky">🗺️</div>
                        <div>
                            <div className="stat-value">{trips.length}</div>
                            <div className="stat-label">Total Trips</div>
                        </div>
                    </div>
                    <div className="stat-card" id="stat-total-days">
                        <div className="stat-icon emerald">📅</div>
                        <div>
                            <div className="stat-value">{totalDays}</div>
                            <div className="stat-label">Days Planned</div>
                        </div>
                    </div>
                    <div className="stat-card" id="stat-total-budget">
                        <div className="stat-icon violet">💰</div>
                        <div>
                            <div className="stat-value">{formatBudget(totalBudget)}</div>
                            <div className="stat-label">Total Budget</div>
                        </div>
                    </div>
                </div>

                {/* Trips Grid */}
                {loading ? (
                    <div className="trips-grid">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="skeleton" style={{ height: 210, borderRadius: 'var(--r-2xl)' }} />
                        ))}
                    </div>
                ) : trips.length > 0 ? (
                    <>
                        <h2 className="section-label">Recent Trips</h2>
                        <div className="trips-grid stagger">
                            {trips.map((trip) => (
                                <TripCard key={trip._id} trip={trip} />
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="empty-state" id="empty-state">
                        <div className="empty-state-icon">✈️</div>
                        <h2 className="empty-state-title">No trips yet</h2>
                        <p className="empty-state-text">
                            Your adventure begins here. Create your first AI-powered itinerary in seconds and start exploring the world.
                        </p>
                        <Link to="/create-trip" className="btn btn-primary btn-lg">
                            ✨ Plan Your First Trip
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
