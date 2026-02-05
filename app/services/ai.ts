import type { ChatCompletionTool } from 'openai/resources/chat/completions';
import { sanitizeAIPrompt } from './validation';

// Note: OpenAI client now used server-side only (in api.ai.ts route)
// This removes the need for dangerouslyAllowBrowser flag

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

// Genre IDs for reference in prompts
const GENRE_ID_MAP = `
Action=28, Adventure=12, Animation=16, Comedy=35, Crime=80, Documentary=99, 
Drama=18, Family=10751, Fantasy=14, History=36, Horror=27, Music=10402, 
Mystery=9648, Romance=10749, Sci-Fi=878, Thriller=53, War=10752, Western=37
`;

// System prompt for ScanMovie AI - Enhanced Discovery Mode
export const SYSTEM_PROMPT = `You are ScanMovie AI, an enthusiastic and knowledgeable movie curator with deep expertise in cinema history, genres, and hidden gems.

=== YOUR TOOLS ===
1. **explore_cinema** - Primary tool for discovery. Use for genres, moods, vibes, decades, or "surprise me" requests
2. **search_movies** - Secondary tool. ONLY for specific movie titles or actor/director names

=== GENRE IDS (CRITICAL - MEMORIZE THESE) ===
${GENRE_ID_MAP}

=== RULES FOR SMART RECOMMENDATIONS ===

🎬 **MULTI-GENRE REQUESTS** (THIS IS NEW!)
When user asks for genre combos like "action comedy" or "romantic thriller":
- Combine genre IDs with comma: "28,35" for Action+Comedy, "10749,53" for Romance+Thriller
- Examples: 
  • "Action Comedy" → genre_ids: "28,35"
  • "Sci-Fi Horror" → genre_ids: "878,27"
  • "Romantic Drama" → genre_ids: "10749,18"
  • "Adventure Fantasy" → genre_ids: "12,14"

🎲 **VARIETY & RANDOMIZATION** (CRITICAL FOR GOOD UX!)
- NEVER return the same recommendations twice in a conversation
- For vague requests ("surprise me", "something good", "what should I watch"):
  • Use random_page: pick a number between 1-5 randomly
  • Vary the sort_by: alternate between "popularity.desc", "vote_average.desc", "revenue.desc", "primary_release_date.desc"
  • Pick a random genre if none specified
- For repeat genre requests, ALWAYS use a different page number than before

🎯 **SPECIFICITY FILTERS** (USE THESE!)
- For "best" or "top" movies → use vote_average_gte: "7.5" or higher
- For "hidden gems" → use vote_average_gte: "7.0" AND vote_count_lte: "1000"
- For "blockbusters" → use vote_count_gte: "5000"
- For "recent" movies → use year_gte with current year minus 2
- For "classic" movies → use year_lte: "1990"

📅 **DECADE HANDLING**
- 80s → year_gte: "1980", year_lte: "1989"
- 90s → year_gte: "1990", year_lte: "1999"
- 2000s → year_gte: "2000", year_lte: "2009"
- 2010s → year_gte: "2010", year_lte: "2019"
- Recent/New → year_gte: "2022"

🎭 **MOOD INFERENCE** (Be creative!)
- "Scary/Creepy/Spooky" → Horror (27)
- "Funny/Hilarious/Light" → Comedy (35)
- "Romantic/Love/Date night" → Romance (10749)
- "Exciting/Adrenaline/Action-packed" → Action (28)
- "Mind-bending/Trippy/Thought-provoking" → Sci-Fi (878) + Thriller (53)
- "Feel-good/Uplifting/Heartwarming" → Comedy (35) or Family (10751)
- "Dark/Gritty/Intense" → Crime (80) + Thriller (53)
- "Epic/Grand/Sweeping" → Adventure (12) + Fantasy (14)
- "Tearjerker/Emotional" → Drama (18) + Romance (10749)

🔍 **SPECIFIC SEARCHES (search_movies only)**
ONLY use search_movies for:
- Exact movie titles: "Find Inception" → search_movies("Inception")
- Actor names: "Tom Hanks movies" → search_movies("Tom Hanks")  
- Director names: "Christopher Nolan films" → search_movies("Christopher Nolan")

=== RESPONSE STYLE ===
- Keep responses SHORT (1-2 fun sentences)
- Use relevant emojis 🎬🍿🎭🔥💀😂❤️
- Be enthusiastic and personable
- Add a fun fact or hook about WHY these movies are great
- Avoid generic phrases like "Here are some movies"

=== EXAMPLES OF GOOD RESPONSES ===
- "Buckle up for some mind-bending sci-fi! 🚀 These'll make you question reality!"
- "Ready to laugh till it hurts? 😂 These comedies are pure gold!"
- "Dark, gritty, and intense - perfect for thriller lovers! 🔪"
- "80s action at its finest! Big muscles, bigger explosions! 💪🔥"`;

// Tool definitions - Enhanced with more filter options
const tools: ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'explore_cinema',
      description: 'Discover movies by genre(s), mood, decade, or quality filters. This is the PRIMARY tool for recommendations. Supports multi-genre combos and randomization for variety.',
      parameters: {
        type: 'object',
        properties: {
          genre_ids: {
            type: 'string',
            description: 'TMDB Genre ID(s). For single genre: "28". For multiple: "28,35" (Action+Comedy). IDs: Action=28, Adventure=12, Animation=16, Comedy=35, Crime=80, Documentary=99, Drama=18, Family=10751, Fantasy=14, History=36, Horror=27, Music=10402, Mystery=9648, Romance=10749, Sci-Fi=878, Thriller=53, War=10752, Western=37',
          },
          year_gte: {
            type: 'string',
            description: 'Minimum release year (inclusive). Use for "movies after 2020" or decade starts.',
          },
          year_lte: {
            type: 'string',
            description: 'Maximum release year (inclusive). Use for "movies before 1990" or decade ends.',
          },
          vote_average_gte: {
            type: 'string',
            description: 'Minimum rating (0-10). Use "7.5" for highly rated, "8.0" for top tier.',
          },
          vote_count_gte: {
            type: 'string', 
            description: 'Minimum vote count. Use "5000" for popular/blockbusters.',
          },
          vote_count_lte: {
            type: 'string',
            description: 'Maximum vote count. Use "1000" for hidden gems.',
          },
          sort_by: {
            type: 'string',
            enum: ['popularity.desc', 'vote_average.desc', 'revenue.desc', 'primary_release_date.desc', 'vote_count.desc'],
            description: 'Sort order. Use popularity.desc (trending), vote_average.desc (best rated), revenue.desc (highest grossing), primary_release_date.desc (newest), vote_count.desc (most reviewed)',
          },
          page: {
            type: 'string',
            description: 'Page number (1-10). VARY THIS for different results! Use random pages (1-5) for variety when user asks again or wants surprises.',
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
      description: 'Search for specific movie titles or actor/director names. ONLY use for specific searches like "Find Batman" or "Tom Hanks movies". Do NOT use for genres.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The specific movie title, actor name, or director name to search for.',
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

/**
 * Get AI response through server-side proxy
 * Removes need for dangerouslyAllowBrowser flag
 */
export async function getAIResponse(messages: AIMessage[]): Promise<AIResponse> {
  try {
    // Sanitize user messages to prevent prompt injection
    const sanitizedMessages = messages.map(m => ({
      role: m.role,
      content: m.role === 'user' ? sanitizeAIPrompt(m.content) : m.content,
    }));

    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: sanitizedMessages,
        tools,
        toolChoice: 'auto',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'AI request failed');
    }

    const data = await response.json();
    const message = data.choices[0]?.message;

    if (message?.tool_calls && message.tool_calls.length > 0) {
      // Extract function tool calls
      const functionCalls: ToolCall[] = [];
      
      for (const tc of message.tool_calls) {
        if (tc.type === 'function') {
          functionCalls.push({
            id: tc.id,
            type: 'function',
            function: {
              name: tc.function.name,
              arguments: tc.function.arguments,
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
    throw new Error('Failed to get AI response. Please check your configuration.');
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
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
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
        ],
      }),
    });

    if (!response.ok) {
      throw new Error('AI request failed');
    }

    const data = await response.json();
    return {
      content: data.choices[0]?.message?.content || '',
    };
  } catch (error) {
    console.error('AI Tool Result Error:', error);
    return { content: '' };
  }
}

// ============================================================
// AI MOVIE INSIGHTS - "More Like This" Feature
// ============================================================

interface MovieBasicInfo {
  id: number;
  title: string;
  overview: string;
  genres?: { id: number; name: string }[];
  release_date?: string;
  vote_average?: number;
}

/**
 * Generate AI explanation of why similar movies are connected to the main movie
 */
export async function explainMovieConnections(
  mainMovie: MovieBasicInfo,
  similarMovies: MovieBasicInfo[]
): Promise<string> {
  if (!similarMovies.length) return '';
  
  const prompt = `You are a film expert. Given a movie and its similar recommendations, explain in 2-3 SHORT, fun sentences why these movies are connected.

MAIN MOVIE: "${mainMovie.title}" (${mainMovie.release_date?.split('-')[0] || 'Unknown'})
${mainMovie.overview ? `Plot: ${mainMovie.overview.slice(0, 200)}...` : ''}

SIMILAR MOVIES: ${similarMovies.slice(0, 4).map(m => m.title).join(', ')}

Be specific about themes, tone, directors, or genre elements they share. Use 1-2 emojis. Keep it SHORT and insightful!`;

  try {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        model: 'openai/gpt-4o-mini',
        max_tokens: 150,
      }),
    });
    
    if (!response.ok) return '';
    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('explainMovieConnections error:', error);
    return '';
  }
}

/**
 * Generate personalized "Why You'll Love This" based on user's watch history
 */
export async function whyYoullLoveThis(
  movie: MovieBasicInfo,
  watchedMovies: { title: string; genres?: number[] }[]
): Promise<string> {
  if (!watchedMovies.length) {
    return "Looks like a great pick! 🎬";
  }
  
  const recentWatched = watchedMovies.slice(0, 5).map(m => m.title).join(', ');
  
  const prompt = `You're a movie recommendation AI. Based on the user's recently viewed movies, explain in ONE enthusiastic sentence why they'd enjoy this movie.

USER RECENTLY VIEWED: ${recentWatched}
RECOMMENDED MOVIE: "${movie.title}"
${movie.overview ? `About: ${movie.overview.slice(0, 150)}...` : ''}

Keep it SHORT (1 sentence), personal, and use 1-2 emojis!`;

  try {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        model: 'openai/gpt-4o-mini',
        max_tokens: 80,
      }),
    });
    
    if (!response.ok) return "Great pick! 🎬";
    const data = await response.json();
    return data.choices[0]?.message?.content || "Great pick! 🎬";
  } catch (error) {
    console.error('whyYoullLoveThis error:', error);
    return "Great pick! 🎬";
  }
}

/**
 * Generate a shareable watch party description
 */
export async function generateWatchPartyDescription(
  movies: MovieBasicInfo[],
  partyName?: string
): Promise<string> {
  if (!movies.length) return '';
  
  const movieList = movies.map(m => `"${m.title}" (${m.release_date?.split('-')[0] || ''})`).join(', ');
  
  const prompt = `Create a fun, short (2 sentences max) description for a movie watch party with these films: ${movieList}. 
${partyName ? `Party theme: ${partyName}` : ''}
Make it exciting and use 2-3 emojis! Keep it social media friendly.`;

  try {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        model: 'openai/gpt-4o-mini',
        max_tokens: 100,
      }),
    });
    
    if (!response.ok) return `Movie night featuring ${movies.length} amazing films! 🎬🍿`;
    const data = await response.json();
    return data.choices[0]?.message?.content || `Movie night featuring ${movies.length} amazing films! 🎬🍿`;
  } catch (error) {
    console.error('generateWatchPartyDescription error:', error);
    return `Movie night featuring ${movies.length} amazing films! 🎬🍿`;
  }
}
