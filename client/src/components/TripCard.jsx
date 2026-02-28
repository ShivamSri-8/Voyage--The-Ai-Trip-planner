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

const TripCard = ({ trip }) => {
    const navigate = useNavigate();

    const badgeClass =
        trip.budgetCategory === 'Low' ? 'low' :
            trip.budgetCategory === 'Premium' ? 'premium' : 'medium';

    return (
        <div
            className="trip-card"
            onClick={() => navigate(`/trip/${trip._id}`)}
            id={`trip-card-${trip._id}`}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate(`/trip/${trip._id}`)}
        >
            <div className="trip-card-header">
                <div>
                    <div className="trip-card-destination">{trip.destination}</div>
                    <div className="trip-card-date">{formatDate(trip.createdAt)}</div>
                </div>
                <span className={`trip-card-badge ${badgeClass}`}>
                    {trip.budgetCategory}
                </span>
            </div>

            {trip.tripSummary && (
                <p className="trip-card-summary">{trip.tripSummary}</p>
            )}

            <div className="trip-card-meta">
                <div className="trip-card-meta-item">
                    <span className="trip-card-meta-icon">📅</span>
                    {trip.duration} {trip.duration === 1 ? 'day' : 'days'}
                </div>
                <div className="trip-card-meta-item">
                    <span className="trip-card-meta-icon">💰</span>
                    {formatBudget(trip.budget)}
                </div>
                <div className="trip-card-meta-item">
                    <span className="trip-card-meta-icon">👥</span>
                    {trip.groupType}
                </div>
            </div>
        </div>
    );
};

export default TripCard;
