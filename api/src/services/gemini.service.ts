import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import type { Schema } from '@google/generative-ai';
import type { Property } from '../types/property.js';

export interface GeminiChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface GeminiChatResponse {
  message: string;
  propertyIds: string[];
  showLeadCTA: boolean;
  leadPrompt?: string;
}

const responseSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    message: {
      type: SchemaType.STRING,
      description: 'Friendly conversational response to the user',
    },
    propertyIds: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: 'IDs of matching properties from the available listings. Empty array if none match.',
    },
    showLeadCTA: {
      type: SchemaType.BOOLEAN,
      description: 'True when no properties match or user should contact Aaron directly',
    },
    leadPrompt: {
      type: SchemaType.STRING,
      description: 'Short encouraging message to contact Aaron, only set when showLeadCTA is true',
    },
  },
  required: ['message', 'propertyIds', 'showLeadCTA'],
};

function buildSystemPrompt(listings: Property[]): string {
  const summary = listings.map(p => ({
    id: p.id,
    address: p.address,
    city: p.city,
    state: p.state,
    price: p.price,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    sqft: p.sqft,
    propertyType: p.propertyType,
    neighborhood: p.neighborhood,
    status: p.status,
    description: p.description?.slice(0, 200),
  }));

  return `You are a helpful real estate search assistant for Aaron Krier, a REALTOR® licensed in Nebraska and Iowa serving the Greater Omaha and Council Bluffs metro area.

Help users find properties from Aaron's current active listings. Match their request against the listings below and return the IDs of the best matches.

AVAILABLE LISTINGS:
${JSON.stringify(summary, null, 2)}

RULES:
- Only return propertyIds from the list above — never invent IDs
- Match on price, bedrooms, bathrooms, location, city, neighborhood, property type, size, etc.
- Be warm, concise, and helpful — 1-3 sentences in your message
- If properties match, set showLeadCTA to false
- If nothing matches or the user wants something not on the list, set showLeadCTA to true and set leadPrompt to a short message encouraging them to reach out to Aaron directly
- If the user asks something unrelated to real estate, gently redirect them`;
}

export async function chatWithListings(
  messages: GeminiChatMessage[],
  listings: Property[]
): Promise<GeminiChatResponse> {
  const apiKey = process.env['GEMINI_API_KEY'];
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

  const genAI = new GoogleGenerativeAI(apiKey);

  const model = genAI.getGenerativeModel({
    model: 'gemini-3.1-flash-lite-preview',
    systemInstruction: buildSystemPrompt(listings),
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema,
    },
  });

  const result = await model.generateContent({
    contents: messages.map(m => ({
      role: m.role,
      parts: [{ text: m.content }],
    })),
  });

  return JSON.parse(result.response.text()) as GeminiChatResponse;
}
