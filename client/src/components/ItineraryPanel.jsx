import { useState } from 'react';
import { DAY_COLORS } from './MapView';

const formatBudget = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

/**
 * ItineraryPanel — glassmorphism overlay on the right side of the map
 * Shows trip summary, day tabs, and expandable place cards
 */
const ItineraryPanel = ({ trip, markers, activeDay, onDayChange, onPlaceClick, onClose }) => {
    const [expandedPeriod, setExpandedPeriod] = useState(null);

    if (!trip) return null;

    const days = trip.itinerary || [];
    const currentDay = days.find((d) => d.day === activeDay) || days[0];
    const dayMarkers = markers.filter((m) => m.day === activeDay && !m.isDestination);

    const periods = currentDay
        ? [
            { key: 'morning', icon: '🌅', label: 'Morning', text: currentDay.morning },
            { key: 'afternoon', icon: '☀️', label: 'Afternoon', text: currentDay.afternoon },
            { key: 'evening', icon: '🌙', label: 'Evening', text: currentDay.evening },
        ]
        : [];

    const toggleExpand = (key) => {
        setExpandedPeriod(expandedPeriod === key ? null : key);
    };

    const handlePlaceClick = (period) => {
        const marker = dayMarkers.find((m) => m.period === period.key);
        if (marker) onPlaceClick?.(marker);
    };

    return (
        <div className="itinerary-panel" id="itinerary-panel">
            {/* Close button */}
            <button className="itinerary-panel-close" onClick={onClose} title="Close panel">
                ✕
            </button>

            {/* Trip Header */}
            <div className="itinerary-panel-header">
                <h2 className="itinerary-panel-dest">{trip.destination}</h2>
                <div className="itinerary-panel-meta">
                    <span>📅 {trip.duration} days</span>
                    <span>💰 {formatBudget(trip.budget)}</span>
                    <span>👥 {trip.groupType}</span>
                </div>
                {trip.tripSummary && (
                    <p className="itinerary-panel-summary">{trip.tripSummary}</p>
                )}
            </div>

            {/* Day Tabs */}
            <div className="itinerary-day-tabs">
                {days.map((day) => (
                    <button
                        key={day.day}
                        className={`itinerary-day-tab ${activeDay === day.day ? 'active' : ''}`}
                        onClick={() => onDayChange(day.day)}
                        style={{
                            '--day-color': DAY_COLORS[day.day] || DAY_COLORS[1],
                        }}
                    >
                        D{day.day}
                    </button>
                ))}
            </div>

            {/* Day Title */}
            {currentDay && (
                <div className="itinerary-day-title">
                    <span
                        className="itinerary-day-badge"
                        style={{ background: DAY_COLORS[activeDay] || DAY_COLORS[1] }}
                    >
                        Day {activeDay}
                    </span>
                    <span>{currentDay.title || `Day ${activeDay}`}</span>
                </div>
            )}

            {/* Period Cards */}
            <div className="itinerary-cards">
                {periods.map((period) => {
                    const isExpanded = expandedPeriod === period.key;
                    const hasMarker = dayMarkers.some((m) => m.period === period.key);

                    return (
                        <div
                            key={period.key}
                            className={`itinerary-card ${isExpanded ? 'expanded' : ''} ${hasMarker ? 'has-pin' : ''}`}
                            onClick={() => toggleExpand(period.key)}
                        >
                            <div className="itinerary-card-header">
                                <div className="itinerary-card-icon">{period.icon}</div>
                                <div className="itinerary-card-label">{period.label}</div>
                                {hasMarker && (
                                    <button
                                        className="itinerary-card-locate"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handlePlaceClick(period);
                                        }}
                                        title="Show on map"
                                    >
                                        📍
                                    </button>
                                )}
                                <div className={`itinerary-card-chevron ${isExpanded ? 'open' : ''}`}>›</div>
                            </div>
                            <div className="itinerary-card-body">
                                <p>{period.text || 'No details available'}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Hotels Quick View */}
            {trip.hotels?.length > 0 && (
                <div className="itinerary-hotels">
                    <h4 className="itinerary-hotels-title">🏨 Hotels</h4>
                    {trip.hotels.slice(0, 3).map((hotel, i) => (
                        <div className="itinerary-hotel-card" key={i}>
                            <div className="itinerary-hotel-name">{hotel.name}</div>
                            <div className="itinerary-hotel-meta">
                                <span>{hotel.category}</span>
                                <span>{formatBudget(hotel.pricePerNight)}/night</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Travel Tips */}
            {trip.travelTips?.length > 0 && (
                <div className="itinerary-tips">
                    <h4 className="itinerary-tips-title">💡 Quick Tips</h4>
                    <ul>
                        {trip.travelTips.slice(0, 3).map((tip, i) => (
                            <li key={i}>{tip}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ItineraryPanel;
