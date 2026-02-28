const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
    name: { type: String, required: true },
    pricePerNight: { type: Number, required: true },
    category: { type: String, enum: ['Budget', '3-star', '4-star', '5-star', 'Luxury'], required: true },
    locationArea: { type: String, required: true },
    reason: { type: String, required: true },
}, { _id: false });

const dayPlanSchema = new mongoose.Schema({
    day: { type: Number, required: true },
    title: { type: String },
    morning: { type: String, required: true },
    afternoon: { type: String, required: true },
    evening: { type: String, required: true },
}, { _id: false });

const budgetBreakdownSchema = new mongoose.Schema({
    stay: { type: Number, required: true },
    food: { type: Number, required: true },
    transport: { type: Number, required: true },
    activities: { type: Number, required: true },
    total: { type: Number, required: true },
}, { _id: false });

const tripSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    destination: {
        type: String,
        required: true,
        trim: true,
    },
    duration: {
        type: Number,
        required: true,
        min: 1,
    },
    budget: {
        type: Number,
        required: true,
        min: 1,
    },
    budgetCategory: {
        type: String,
        enum: ['Low', 'Medium', 'Premium'],
        required: true,
    },
    groupType: {
        type: String,
        enum: ['Solo', 'Friends', 'Family', 'Couple'],
        required: true,
    },
    interests: [{
        type: String,
        enum: ['Adventure', 'Cultural', 'Nature', 'Nightlife', 'Spiritual', 'Relaxation'],
    }],
    tripSummary: {
        type: String,
        required: true,
    },
    budgetBreakdown: {
        type: budgetBreakdownSchema,
        required: true,
    },
    itinerary: {
        type: [dayPlanSchema],
        required: true,
    },
    hotels: {
        type: [hotelSchema],
        required: true,
    },
    travelTips: [{
        type: String,
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Trip', tripSchema);
