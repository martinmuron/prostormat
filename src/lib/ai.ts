import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  content: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

/**
 * Send a message to Claude Sonnet 4 and get a response
 */
export async function sendToClaude(
  messages: ChatMessage[],
  options?: {
    maxTokens?: number;
    temperature?: number;
    systemPrompt?: string;
  }
): Promise<AIResponse> {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022', // Using latest Sonnet model
      max_tokens: options?.maxTokens || 1000,
      temperature: options?.temperature || 0.7,
      system: options?.systemPrompt || 'You are a helpful AI assistant for a venue booking platform in Prague.',
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    return {
      content: content.text,
      usage: {
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
      },
    };
  } catch (error) {
    console.error('Error calling Claude API:', error);
    throw new Error('Failed to get AI response');
  }
}

/**
 * Generate venue description suggestions based on venue data
 */
export async function generateVenueDescription(venueData: {
  name: string;
  address: string;
  capacity?: number;
  venueType?: string;
  amenities?: string[];
}): Promise<string> {
  const prompt = `Generate an engaging description for this venue in Czech:
  
Name: ${venueData.name}
Address: ${venueData.address}
Capacity: ${venueData.capacity || 'Not specified'}
Type: ${venueData.venueType || 'General venue'}
Amenities: ${venueData.amenities?.join(', ') || 'None specified'}

Create a compelling 2-3 sentence description that would attract event organizers. Write in Czech language.`;

  const response = await sendToClaude([
    { role: 'user', content: prompt }
  ], {
    systemPrompt: 'You are an expert copywriter for a venue booking platform in Prague. Generate compelling venue descriptions in Czech that highlight the unique features and appeal to event organizers.',
    maxTokens: 300,
    temperature: 0.8,
  });

  return response.content;
}

/**
 * Generate event request suggestions based on user input
 */
export async function generateEventSuggestions(eventDetails: {
  title: string;
  description?: string;
  eventType: string;
  guestCount?: number;
  budget?: string;
}): Promise<string[]> {
  const prompt = `Based on this event request, suggest 3-5 specific venue requirements or features that would be ideal:

Event: ${eventDetails.title}
Description: ${eventDetails.description || 'No description provided'}
Type: ${eventDetails.eventType}
Guest Count: ${eventDetails.guestCount || 'Not specified'}
Budget: ${eventDetails.budget || 'Not specified'}

Provide specific, actionable suggestions in Czech for what kind of venue features would work best.`;

  const response = await sendToClaude([
    { role: 'user', content: prompt }
  ], {
    systemPrompt: 'You are an event planning expert in Prague. Provide practical venue suggestions based on event requirements. Respond in Czech language.',
    maxTokens: 400,
    temperature: 0.7,
  });

  // Split response into suggestions (assuming they're formatted as a list)
  return response.content
    .split('\n')
    .filter(line => line.trim().length > 0)
    .map(line => line.replace(/^[-•*]\s*/, '').trim())
    .filter(line => line.length > 0)
    .slice(0, 5); // Limit to 5 suggestions
}

/**
 * Generate smart search suggestions for venues
 */
export async function generateSearchSuggestions(query: string): Promise<string[]> {
  const prompt = `Given this search query for venue booking in Prague: "${query}"

Generate 3-4 related search suggestions that might help users find better venues. Consider:
- Different ways to phrase the same request
- Related venue types or features
- Popular combinations for this type of search

Respond with suggestions in Czech, one per line.`;

  const response = await sendToClaude([
    { role: 'user', content: prompt }
  ], {
    systemPrompt: 'You are a search optimization expert for a Prague venue booking platform. Generate helpful search suggestions in Czech.',
    maxTokens: 200,
    temperature: 0.6,
  });

  return response.content
    .split('\n')
    .filter(line => line.trim().length > 0)
    .map(line => line.trim())
    .slice(0, 4);
}

export default {
  sendToClaude,
  generateVenueDescription,
  generateEventSuggestions,
  generateSearchSuggestions,
};