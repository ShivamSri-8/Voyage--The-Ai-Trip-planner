const Groq = require('groq-sdk');
const Trip = require('../models/Trip');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const buildPrompt = ({ destination, duration, budget, budgetCategory, groupType, interests }) => {
    return `You are an expert AI travel planner for India and international destinations. Generate a detailed travel itinerary in STRICT JSON format. All monetary values MUST be in Indian Rupees (INR, symbol: ₹). Do NOT use USD, EUR, or any other currency.

User Preferences:
- Destination: ${destination}
- Duration: ${duration} days
- Total Budget: ₹${budget.toLocaleString('en-IN')}
- Budget Category: ${budgetCategory}
- Group Type: ${groupType}
- Interests: ${interests.join(', ')}

Respond ONLY with valid JSON (no markdown, no explanation, no comments). Use this exact structure:

{
  "tripSummary": "A brief 2-3 sentence overview of the trip",
  "budgetBreakdown": {
    "stay": <number in INR>,
    "food": <number in INR>,
    "transport": <number in INR>,
    "activities": <number in INR>,
    "total": <number in INR>
  },
  "itinerary": [
    {
      "day": 1,
      "title": "Theme for the day",
      "morning": "Detailed morning plan with location, activity, and estimated cost in ₹",
      "afternoon": "Detailed afternoon plan with location, activity, and estimated cost in ₹",
      "evening": "Detailed evening plan with location, activity, and estimated cost in ₹"
    }
  ],
  "hotels": [
    {
      "name": "Hotel Name",
      "pricePerNight": <number in INR>,
      "category": "Budget|3-star|4-star|5-star|Luxury",
      "locationArea": "Area/Neighborhood name",
      "reason": "Why this hotel is recommended"
    }
  ],
  "travelTips": [
    "Tip 1",
    "Tip 2",
    "Tip 3",
    "Tip 4",
    "Tip 5"
  ]
}

Important Rules:
1. Generate exactly ${duration} days of itinerary.
2. Generate 3-5 hotel recommendations appropriate for ${budgetCategory} budget.
3. Budget breakdown total must not exceed ₹${budget.toLocaleString('en-IN')}.
4. ALL prices MUST be in Indian Rupees (₹).
5. Hotel categories for Low budget: Budget (₹1,000-₹3,000/night), Medium: 3-star (₹3,000-₹7,000/night), Premium: 4-5 star/Luxury (₹7,000+/night).
6. Make activities relevant to the interests: ${interests.join(', ')}.
7. Consider the group type (${groupType}) when suggesting activities.`;
};

const getMockItinerary = (destination, duration) => {
    return {
        tripSummary: `A beautiful exploration of ${destination} curated for your interests. Since your network is blocking the AI service, we have generated this high-quality template for you to test the map and features.`,
        budgetBreakdown: { stay: 5000, food: 3000, transport: 2000, activities: 4000, total: 14000 },
        itinerary: Array.from({ length: duration }, (_, i) => ({
            day: i + 1,
            title: `Discovering ${destination} - Part ${i + 1}`,
            morning: `Visit the central landmarks and famous temples in ${destination}.`,
            afternoon: `Explore the local markets and cultural centers of ${destination}.`,
            evening: `Enjoy a peaceful evening walk and dinner at a top-rated local restaurant.`
        })),
        hotels: [
            { name: "Grand Heritage Hotel", pricePerNight: 3500, category: "4-star", locationArea: "City Center", reason: "Centrally located with great reviews." },
            { name: "Riverside Resort", pricePerNight: 5500, category: "Luxury", locationArea: "Riverside", reason: "Perfect for a relaxing stay." }
        ],
        travelTips: ["Carry a power bank", "Use local transport", "Try the street food", "Respect local customs"]
    };
};

// @desc    Generate a new trip
// @route   POST /api/generate-trip
exports.generateTrip = async (req, res) => {
    const { destination, duration, budget, budgetCategory, groupType, interests } = req.body;

    try {
        if (!destination) return res.status(400).json({ success: false, message: 'Destination is required.' });

        const prompt = buildPrompt({ destination, duration, budget, budgetCategory, groupType, interests });

        let responseText = null;
        try {
            const chatCompletion = await groq.chat.completions.create({
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert AI travel planner. You MUST respond ONLY with valid JSON. No markdown, no explanation, no comments — just raw JSON.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                model: 'llama-3.3-70b-versatile',
                temperature: 0.7,
                max_tokens: 4096,
                response_format: { type: 'json_object' },
            });

            responseText = chatCompletion.choices[0]?.message?.content;

            if (!responseText) {
                throw new Error('Empty response from Groq');
            }
        } catch (apiError) {
            console.error('❌ Groq API Failed:', apiError.message);
            console.warn('⚠️ Falling back to template itinerary.');
            const mockData = getMockItinerary(destination, duration);

            const trip = await Trip.create({
                userId: req.user._id,
                destination: destination.trim(),
                duration, budget, budgetCategory, groupType, interests,
                ...mockData
            });

            return res.status(201).json({
                success: true,
                trip,
                isDemo: true,
                message: 'AI service temporarily unavailable. Using demo itinerary.'
            });
        }

        let cleaned = responseText.trim();
        if (cleaned.startsWith('```')) {
            cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
        }
        const tripData = JSON.parse(cleaned);

        const trip = await Trip.create({
            userId: req.user._id,
            destination: destination.trim(),
            duration, budget, budgetCategory, groupType, interests,
            tripSummary: tripData.tripSummary,
            budgetBreakdown: tripData.budgetBreakdown,
            itinerary: tripData.itinerary,
            hotels: tripData.hotels,
            travelTips: tripData.travelTips || [],
        });

        res.status(201).json({ success: true, trip });

    } catch (error) {
        console.error('GENERATE TRIP ERROR:', error.message);
        const mockData = getMockItinerary(destination, duration);
        const trip = await Trip.create({
            userId: req.user._id, destination: destination.trim(),
            duration, budget, budgetCategory, groupType, interests, ...mockData
        });
        res.status(201).json({ success: true, trip, isDemo: true });
    }
};

// @desc    Get all trips for logged-in user
exports.getTrips = async (req, res) => {
    try {
        const trips = await Trip.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .select('destination duration budget budgetCategory groupType createdAt tripSummary budgetBreakdown');

        res.status(200).json({ success: true, count: trips.length, trips });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch trips.' });
    }
};

// @desc    Get single trip by ID
exports.getTripById = async (req, res) => {
    try {
        const trip = await Trip.findOne({ _id: req.params.id, userId: req.user._id });
        if (!trip) return res.status(404).json({ success: false, message: 'Trip not found.' });
        res.status(200).json({ success: true, trip });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch trip.' });
    }
};

// @desc    Delete a trip
exports.deleteTrip = async (req, res) => {
    try {
        const trip = await Trip.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!trip) return res.status(404).json({ success: false, message: 'Trip not found.' });
        res.status(200).json({ success: true, message: 'Trip deleted successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete trip.' });
    }
};
