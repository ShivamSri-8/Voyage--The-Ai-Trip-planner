const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

export const geocodeDestination = async (destination) => {
    return geocodePlace(destination);
};

const extractPlaceName = (text) => {
    if (!text) return null;
    const actionWords = /^(?:visit|explore|head to|go to|check.?in|arrive at|travel to|drive to|walk to|start at|begin at|stop at|lunch at|dinner at|breakfast at)\s+/i;
    const cleaned = text.replace(actionWords, '').split(/[.,;–—]/)[0].trim();
    const words = cleaned.split(/\s+/).slice(0, 6);
    const place = words.join(' ');
    return place.length > 2 ? place : null;
};

export const geocodeItinerary = async (itinerary, destination) => {
    const markers = [];

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

    const BATCH_SIZE = 3;
    for (let i = 0; i < placeQueue.length; i += BATCH_SIZE) {
        if (i > 0) await delay(400);

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
