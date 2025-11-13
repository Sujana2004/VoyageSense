import { chatAPI } from './api';

export const TripChatService = {
  async chatAboutTrip(tripDetails, userMessage = '') {
    try {
      const systemPrompt = this.generateTripPrompt(tripDetails);
      
      // Use the trip's conversationId if it exists, otherwise create new
      const conversationId = tripDetails.conversationId || `trip-${tripDetails.id}`;
      
      const response = await chatAPI.sendMessage(
        userMessage || 'Tell me about this trip and suggest some recommendations.',
        conversationId
      );
      
      return response.data;
    } catch (error) {
      console.error('Error chatting about trip:', error);
      throw error;
    }
  },

  generateTripPrompt(tripDetails) {
    return `You are a travel expert. Analyze this trip plan and provide helpful insights, recommendations, and tips.

TRIP DETAILS:
- From: ${tripDetails.sourceCity}
- To: ${tripDetails.destinationCity}
- Passengers: ${tripDetails.passengers}
- Budget: ₹${tripDetails.budget}
- Comfort Level: ${tripDetails.comfortLevel}
- Distance: ${tripDetails.distanceEstimate} km
- Recommended Transport: ${tripDetails.recommendedMode}

Please provide:
1. Best travel routes and alternatives
2. Weather considerations
3. Local attractions and must-visit places
4. Budget optimization tips
5. Cultural insights and travel etiquette
6. Packing recommendations
7. Safety tips
8. Any seasonal considerations

Be concise but informative.`;
  },

  getTopicPrompts(tripDetails) {
    return {
      itinerary: `Create a detailed itinerary for this trip: ${tripDetails.sourceCity} to ${tripDetails.destinationCity}. Include daily activities, timing, and transportation.`,
      budget: `Help optimize this ₹${tripDetails.budget} budget for ${tripDetails.passengers} passengers traveling from ${tripDetails.sourceCity} to ${tripDetails.destinationCity}.`,
      places: `Recommend the best places to visit in ${tripDetails.destinationCity} and along the route from ${tripDetails.sourceCity}.`,
      weather: `What weather should I expect traveling from ${tripDetails.sourceCity} to ${tripDetails.destinationCity}? Any seasonal considerations?`,
      transport: `Compare transport options for ${tripDetails.sourceCity} to ${tripDetails.destinationCity}. Discuss ${tripDetails.recommendedMode} and alternatives.`
    };
  }
};