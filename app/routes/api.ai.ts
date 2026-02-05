/**
 * AI API Proxy Route
 * Handles AI requests server-side to protect the API key and remove dangerouslyAllowBrowser flag
 */

import type { ActionFunctionArgs } from 'react-router';
import OpenAI from 'openai';

// Server-side only - API key is not exposed to client
const GITHUB_TOKEN = process.env.VITE_GITHUB_TOKEN;

/**
 * Action function to handle POST requests to AI API
 */
export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!GITHUB_TOKEN) {
    return new Response(
      JSON.stringify({ error: 'AI service not configured' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await request.json();
    const { messages, tools, toolChoice, model = 'openai/gpt-4o', max_tokens } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Invalid request: messages required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create OpenAI client server-side (no dangerouslyAllowBrowser needed)
    const client = new OpenAI({
      baseURL: 'https://models.github.ai/inference',
      apiKey: GITHUB_TOKEN,
      defaultHeaders: {
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    const requestOptions: any = {
      model,
      messages,
    };

    if (tools) requestOptions.tools = tools;
    if (toolChoice) requestOptions.tool_choice = toolChoice;
    if (max_tokens) requestOptions.max_tokens = max_tokens;

    const response = await client.chat.completions.create(requestOptions);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    console.error('AI API error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'AI request failed',
        message: error?.message || 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Tool result endpoint
 */
export async function loader({ request }: any) {
  return new Response(
    JSON.stringify({ error: 'Use POST method for AI requests' }),
    { status: 405, headers: { 'Content-Type': 'application/json' } }
  );
}
