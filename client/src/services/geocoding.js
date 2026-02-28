/**
 * Nominatim Geocoding Service
 * Free geocoding via OpenStreetMap — no API key needed
 * Rate limit: 1 request per second (we use 300ms delay between batches)
 */

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Search for destinations (Autosuggest)
 * @param {string} query 
 * @returns {Promise<Array>}
 */
export const searchDestinations = async (query) => {
    try {
        const url = `${NOMINATIM_URL}?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&accept-language=en`;
        const res = await fetch(url, {
            headers: { 'User-Agent': 'VoyageTripPlanner/1.0' },
        });
        if (!res.ok) return [];
        const data = await res.json();
        return data.map(item => ({
            placeName: item.display_name,
            placeAddress: item.display_name,
            lat: item.lat,
            lon: item.lon
        }));
    } catch {
        return [];
    }
};

/**
 * Geocode a single place name to lat/lng
 * @param {string} placeName - e.g. "Gateway of India"
 * @param {string} destination - e.g. "Mumbai" (used as context)
 * @returns {Promise<{lat: number, lon: number, displayName: string} | null>}
 */
export const geocodePlace = async (placeName, destination = '') => {
    try {
        const query = destination ? `${placeName}, ${destination}` : placeName;
        const url = `${NOMINATIM_URL}?format=json&q=${encodeURIComponent(query)}&limit=1&accept-language=en`;

        const res = await fetch(url, {
            headers: { 'User-Agent': 'VoyageTripPlanner/1.0' },
        });

        if (!res.ok) return null;

        const data = await res.json();
        if (data && data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lon: parseFloat(data[0].lon),
                displayName: data[0].display_name,
            };
        }
        return null;
    } catch {
        return null;
    }
};

/**
 * Geocode the main destination
 * @param {string} destination
 * @returns {Promise<{lat: number, lon: number, displayName: string} | null>}
 */
export const geocodeDestination = async (destination) => {
    return geocodePlace(destination);
};

/**
 * Extract place names from itinerary text (morning/afternoon/evening descriptions)
 * Looks for capitalized proper nouns and known landmark patterns
 */
const extractPlaceName = (text) => {
    if (!text) return null;
    // Try to extract the first mentioned place/location before any dash or comma
    // Common patterns: "Visit Gateway of India", "Explore Fort Kochi", "Check into Hotel XYZ"
    const actionWords = /^(?:visit|explore|head to|go to|check.?in|arrive at|travel to|drive to|walk to|start at|begin at|stop at|lunch at|dinner at|breakfast at)\s+/i;
    const cleaned = text.replace(actionWords, '').split(/[.,;–—]/)[0].trim();

    // Take the first meaningful phrase (up to ~5 words) that looks like a place name
    const words = cleaned.split(/\s+/).slice(0, 6);
    const place = words.join(' ');

    return place.length > 2 ? place : null;
};

/**
 * Geocode all places from a trip's itinerary
 * Uses batched parallel requests (3 at a time) for much faster loading
 * while respecting Nominatim's rate limits
 * @param {Array} itinerary - Array of day objects with morning/afternoon/evening
 * @param {string} destination - Main destination for context
 * @returns {Promise<Array<{day: number, period: string, name: string, lat: number, lon: number, text: string}>>}
 */
export const geocodeItinerary = async (itinerary, destination) => {
    const markers = [];

    // First geocode the main destination
    const destCoords = await geocodeDestination(destination);
    if (destCoords) {
        markers.push({
            day: 0,
            period: 'destination',
            name: destination,
            lat: destCoords.lat,
            lon: destCoords.lon,
            text: `Main destination: ${destination}`,
            isDestination: true,
        });
    }

    // Collect all places to geocode
    const placeQueue = [];
    for (const day of itinerary) {
        const periods = [
            { key: 'morning', label: '🌅 Morning', text: day.morning },
            { key: 'afternoon', label: '☀️ Afternoon', text: day.afternoon },
            { key: 'evening', label: '🌙 Evening', text: day.evening },
        ];

        for (const period of periods) {
            if (!period.text) continue;
            const placeName = extractPlaceName(period.text);
            if (!placeName) continue;
            placeQueue.push({ day, period, placeName });
        }
    }

    // Process in batches of 3 (parallel within batch, delay between batches)
    const BATCH_SIZE = 3;
    for (let i = 0; i < placeQueue.length; i += BATCH_SIZE) {
        if (i > 0) await delay(400); // rate-limit delay between batches

        const batch = placeQueue.slice(i, i + BATCH_SIZE);
        const results = await Promise.allSettled(
            batch.map(({ placeName }) => geocodePlace(placeName, destination))
        );

        results.forEach((result, idx) => {
            if (result.status === 'fulfilled' && result.value) {
                const { day, period, placeName } = batch[idx];
                markers.push({
                    day: day.day,
                    period: period.key,
                    periodLabel: period.label,
                    name: placeName,
                    lat: result.value.lat,
                    lon: result.value.lon,
                    text: period.text,
                    title: day.title || `Day ${day.day}`,
                });
            }
        });
    }

    return markers;
};
