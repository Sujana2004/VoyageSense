const OPENTRIPMAP_API_KEY = '5ae2e3f221c38a28845f05b6133222c4fc08b55ae0de6290aed55fc4';

export const travelAPIs = {
  // 1. OpenTripMap API - Primary (rich travel data)
  searchOpenTripMap: async (query) => {
    try {
      const response = await fetch(
        `https://api.opentripmap.com/0.1/en/places/autosuggest?name=${encodeURIComponent(query)}&apikey=${OPENTRIPMAP_API_KEY}`
      );
      const data = await response.json();
      return data.features || [];
    } catch (error) {
      console.error('OpenTripMap search error:', error);
      return [];
    }
  },

  getOpenTripMapDetails: async (xid) => {
    try {
      const response = await fetch(
        `https://api.opentripmap.com/0.1/en/places/xid/${xid}?apikey=${OPENTRIPMAP_API_KEY}`
      );
      return await response.json();
    } catch (error) {
      console.error('OpenTripMap details error:', error);
      return null;
    }
  },

  getOpenTripMapByRadius: async (lat, lon, radius = 10000, limit = 20) => {
    try {
      const response = await fetch(
        `https://api.opentripmap.com/0.1/en/places/radius?lat=${lat}&lon=${lon}&radius=${radius}&limit=${limit}&apikey=${OPENTRIPMAP_API_KEY}`
      );
      const data = await response.json();
      return data.features || [];
    } catch (error) {
      console.error('OpenTripMap radius error:', error);
      return [];
    }
  },

  // 2. OpenStreetMap API - Fallback (global coverage)
  searchOpenStreetMap: async (query) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=10`
      );
      return await response.json();
    } catch (error) {
      console.error('OpenStreetMap search error:', error);
      return [];
    }
  },

  // 3. Wikipedia API - For rich descriptions
  getWikipediaInfo: async (placeName) => {
    try {
      const response = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(placeName)}`
      );
      return await response.json();
    } catch (error) {
      console.error('Wikipedia API error:', error);
      return null;
    }
  }
};