import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};

const formatBudget = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount);
};

const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
    'linear-gradient(135deg, #fd7043 0%, #f48fb1 100%)',
    'linear-gradient(135deg, #26c6da 0%, #00acc1 100%)',
];

const getGradient = (name = '') => {
    const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return gradients[hash % gradients.length];
};

const TripCard = ({ trip }) => {
    const navigate = useNavigate();
    const [imgError, setImgError] = useState(false);

    const badgeClass =
        trip.budgetCategory === 'Low' ? 'low' :
            trip.budgetCategory === 'Premium' ? 'premium' : 'medium';

    const cleanDestination = trip.destination.split(',')[0].trim();
    const imgSrc = `https://source.unsplash.com/600x260/?${encodeURIComponent(cleanDestination)},travel,landscape`;
    const fallbackGradient = getGradient(trip.destination);

    return (
        <div
            className="trip-card"
            onClick={() => navigate(`/trip/${trip._id}`)}
            id={`trip-card-${trip._id}`}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate(`/trip/${trip._id}`)}
        >
            <div className="trip-card-image">
                {!imgError ? (
                    <img
                        src={imgSrc}
                        alt={trip.destination}
                        onError={() => setImgError(true)}
                        loading="lazy"
                    />
                ) : (
                    <div className="trip-card-image-fallback" style={{ background: fallbackGradient }} />
                )}
                <div className="trip-card-image-overlay" />
                <span className={`trip-card-badge ${badgeClass}`} style={{ position: 'absolute', top: 12, right: 12 }}>
                    {trip.budgetCategory}
                </span>
                <div className="trip-card-image-destination">
                    {trip.destination}
                </div>
            </div>

            <div className="trip-card-body">
                <div className="trip-card-date-row">
                    <span className="trip-card-date">📌 {formatDate(trip.createdAt)}</span>
                    <span className="trip-card-arrow">→</span>
                </div>

                {trip.tripSummary && (
                    <p className="trip-card-summary">{trip.tripSummary}</p>
                )}

                <div className="trip-card-divider" />

                <div className="trip-card-meta">
                    <div className="trip-card-meta-item">
                        <span>📅</span>
                        {trip.duration} {trip.duration === 1 ? 'day' : 'days'}
                    </div>
                    <div className="trip-card-meta-item">
                        <span>💰</span>
                        {formatBudget(trip.budget)}
                    </div>
                    <div className="trip-card-meta-item">
                        <span>👥</span>
                        {trip.groupType}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TripCard;
