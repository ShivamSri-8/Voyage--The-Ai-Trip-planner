const mapplsService = require('../services/mapplsService');

// @desc    Get access token for Mappls API
// @route   GET /api/mappls/token
// @access  Public (or protected if needed)
exports.getToken = async (req, res) => {
    try {
        const token = await mapplsService.getAccessToken();
        res.status(200).json({ success: true, token });
    } catch (error) {
        console.error('Error in getToken controller:', error.message);
        res.status(500).json({ success: false, message: 'Failed to get Mappls token' });
    }
};

// @desc    Search for places using Mappls Autosuggest
// @route   GET /api/mappls/search
// @access  Public
exports.searchPlaces = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ success: false, message: 'Query parameter is required' });
        }

        const results = await mapplsService.searchPlaces(query);
        res.status(200).json({ success: true, results });
    } catch (error) {
        console.error('Error in searchPlaces controller:', error.message);
        res.status(500).json({ success: false, message: 'Failed to search places' });
    }
};
