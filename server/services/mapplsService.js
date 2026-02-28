const axios = require('axios');

let cachedToken = null;
let tokenExpiry = null;

const getAccessToken = async () => {
    try {
        if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
            return cachedToken;
        }

        const params = new URLSearchParams();
        params.append('grant_type', 'client_credentials');
        params.append('client_id', process.env.MAPPLS_CLIENT_ID);
        params.append('client_secret', process.env.MAPPLS_CLIENT_SECRET);

        const response = await axios.post('https://outpost.mapmyindia.com/api/security/oauth/token', params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        cachedToken = response.data.access_token;
        // Expires in seconds, convert to ms and subtract a buffer (e.g., 5 minutes)
        tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 300000;

        return cachedToken;
    } catch (error) {
        console.error('Error fetching Mappls access token:', error.response?.data || error.message);
        throw new Error('Failed to authenticate with Mappls');
    }
};

const searchPlaces = async (query) => {
    try {
        const token = await getAccessToken();

        // Using Autosuggest API as it's most common for search
        const response = await axios.get(`https://atlas.mapmyindia.com/api/places/search/json?query=${encodeURIComponent(query)}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        return response.data.suggestedLocations || [];
    } catch (error) {
        console.error('Error searching Mappls:', error.response?.data || error.message);
        throw new Error('Failed to search places');
    }
};

module.exports = {
    getAccessToken,
    searchPlaces
};
