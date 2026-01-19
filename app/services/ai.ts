import OpenAI from 'openai';
import type { ChatCompletionMessageParam, ChatCompletionTool } from 'openai/resources/chat/completions';

// GitHub Models configuration
const client = new OpenAI({
  baseURL: 'https://models.github.ai/inference',
  apiKey: import.meta.env.VITE_GITHUB_TOKEN,
  dangerouslyAllowBrowser: true,
  defaultHeaders: {
    'X-GitHub-Api-Version': '2022-11-28',
  },
});

// Internal Genre Map - TMDB Genre IDs
export const GENRES: Record<string, number> = {
  action: 28,
  adventure: 12,
  animation: 16,
  comedy: 35,
  crime: 80,
  documentary: 99,
  drama: 18,
  family: 10751,
  fantasy: 14,
  history: 36,
  horror: 27,
  music: 10402,
  mystery: 9648,
  romance: 10749,
  sci_fi: 878,
  scifi: 878,
  science_fiction: 878,
  tv_movie: 10770,
  thriller: 53,
  war: 10752,
  western: 37,
};

// System prompt for ScanMovie AI - Smart Discovery Mode
export const SYSTEM_PROMPT = `You are ScanMovie AI, a sophisticated movie curator with deep knowledge of cinema.

YOU HAVE TWO TOOLS:
1. **explore_cinema** - Use for genres, moods, vibes, decades, or discovery requests
2. **search_movies** - Use ONLY for specific movie titles or actor names

CRITICAL RULES:

🎬 RULE 1: GENRE REQUESTS → explore_cinema
If user asks for a genre (Action, Horror, Comedy, Thriller, Sci-Fi, etc.):
- DO NOT search for the word "Action" or "Horror" - that returns garbage!
- Instead, call explore_cinema with the correct genre_id:
  • Action → genre_id: "28"
  • Horror → genre_id: "27"
  • Comedy → genre_id: "35"
  • Thriller → genre_id: "53"
  • Sci-Fi → genre_id: "878"
  • Romance → genre_id: "10749"
  • Drama → genre_id: "18"
  • Animation → genre_id: "16"
  • Adventure → genre_id: "12"
  • Fantasy → genre_id: "14"
  • Mystery → genre_id: "9648"
  • Crime → genre_id: "80"
  • Documentary → genre_id: "99"
  • War → genre_id: "10752"
  • Western → genre_id: "37"

🎬 RULE 2: DECADE/YEAR REQUESTS
If user mentions a decade (80s, 90s, 2000s):
- Pick a representative year: 80s → "1985", 90s → "1995", 2000s → "2005"
- Combine with genre if mentioned: "80s action" → genre_id: "28", year: "1985"

🎬 RULE 3: MOOD/VIBE INFERENCE
- "Scary" / "Creepy" → Horror (27)
- "Funny" / "Hilarious" → Comedy (35)
- "Romantic" / "Love" → Romance (10749)
- "Exciting" / "Adrenaline" → Action (28)
- "Mind-bending" / "Thought-provoking" → Sci-Fi (878) or Thriller (53)
- "Feel-good" / "Uplifting" → Comedy (35) or Family (10751)

🎬 RULE 4: QUALITY SORTING
- If user asks for "best", "top", "critically acclaimed" → sort_by: "vote_average.desc"
- Default is "popularity.desc" for trending hits

🎬 RULE 5: VAGUE REQUESTS
If user says "What should I watch?" or "Recommend something":
- Randomly pick a genre ID and call explore_cinema
- Be enthusiastic: "Let me surprise you with some amazing [genre] films! 🎬"

🎬 RULE 6: SPECIFIC TITLES → search_movies
ONLY use search_movies when user asks for:
- A specific movie name: "Find Batman" → search_movies("Batman")
- An actor: "Movies with Tom Hanks" → search_movies("Tom Hanks")

FORMATTING:
- Keep responses short (1-2 sentences)
- Use emojis
- Be enthusiastic about your recommendations!`;

// Tool definitions - Smart Discovery + Fallback Search
const tools: ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'explore_cinema',
      description: 'Filter and discover movies by genre, year, or vibe. Use this when the user mentions a category (Action, Horror, Comedy, Thriller, Sci-Fi), a mood (scary, funny, romantic), or a time period (80s, 90s). This is the PRIMARY tool for recommendations.',
      parameters: {
        type: 'object',
        properties: {
          genre_id: {
            type: 'string',
            description: 'The TMDB Genre ID. Infer from user request: Action=28, Horror=27, Comedy=35, Thriller=53, Sci-Fi=878, Romance=10749, Drama=18, Animation=16, Adventure=12, Fantasy=14, Mystery=9648, Crime=80, Documentary=99, War=10752, Western=37',
          },
          year: {
            type: 'string',
            description: 'Release year if user specifies a decade or year. For decades: 80s→1985, 90s→1995, 2000s→2005',
          },
          sort_by: {
            type: 'string',
            description: 'How to sort results. Use "popularity.desc" (default) for trending, or "vote_average.desc" if user asks for best/top/critically acclaimed movies',
          },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_movies',
      description: 'Search for specific movie titles or actor names. ONLY use this for specific searches like "Find Batman" or "Movies with Tom Hanks". Do NOT use for genres - use explore_cinema instead.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The specific movie title or actor name to search for',
          },
        },
        required: ['query'],
      },
    },
  },
];

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface AIResponse {
  content: string | null;
  toolCalls?: ToolCall[];
}

export async function getAIResponse(messages: AIMessage[]): Promise<AIResponse> {
  try {
    // Prepend system message
    const fullMessages: ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.map(m => ({ role: m.role, content: m.content })),
    ];

    const response = await client.chat.completions.create({
      model: 'openai/gpt-4o',
      messages: fullMessages,
      tools,
      tool_choice: 'auto',
    });

    const message = response.choices[0]?.message;

    if (message?.tool_calls && message.tool_calls.length > 0) {
      // Extract function tool calls
      const functionCalls: ToolCall[] = [];
      
      for (const tc of message.tool_calls) {
        if (tc.type === 'function') {
          // Access function properties safely using any to bypass strict typing
          const toolCall = tc as { id: string; type: 'function'; function: { name: string; arguments: string } };
          functionCalls.push({
            id: toolCall.id,
            type: 'function',
            function: {
              name: toolCall.function.name,
              arguments: toolCall.function.arguments,
            },
          });
        }
      }

      if (functionCalls.length > 0) {
        return {
          content: message.content,
          toolCalls: functionCalls,
        };
      }
    }

    return {
      content: message?.content || "I'm having trouble thinking right now. Try again!",
    };
  } catch (error) {
    console.error('AI API Error:', error);
    throw new Error('Failed to get AI response. Please check your GitHub token.');
  }
}

// Optional: Send tool results back to AI for follow-up
export async function sendToolResult(
  messages: AIMessage[],
  toolCallId: string,
  toolName: string,
  result: string
): Promise<AIResponse> {
  try {
    const fullMessages: ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.map(m => ({ role: m.role, content: m.content })),
      {
        role: 'assistant',
        content: null,
        tool_calls: [
          {
            id: toolCallId,
            type: 'function',
            function: { name: toolName, arguments: '{}' },
          },
        ],
      },
      {
        role: 'tool',
        tool_call_id: toolCallId,
        content: result,
      },
    ];

    const response = await client.chat.completions.create({
      model: 'openai/gpt-4o',
      messages: fullMessages,
    });

    return {
      content: response.choices[0]?.message?.content || '',
    };
  } catch (error) {
    console.error('AI Tool Result Error:', error);
    return { content: '' };
  }
}
