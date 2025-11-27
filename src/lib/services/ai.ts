/**
 * AI Summarization Service
 * Supports both OpenAI and Anthropic Claude APIs
 */

export interface SummarizationResult {
  summary: string;
  keyTakeaways: string[];
  category: 'market_trends' | 'founder_advice' | 'industry_analysis' | 'investment_thesis' | 'portfolio_updates';
}

/**
 * Generate AI summary using OpenAI API
 */
export async function summarizeWithOpenAI(text: string): Promise<SummarizationResult> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are an expert VC content analyst. Analyze the given article and provide:
1. A concise 2-3 sentence summary
2. 3-5 key takeaways (bullet points)
3. Category (one of: market_trends, founder_advice, industry_analysis, investment_thesis, portfolio_updates)

Format your response as JSON with keys: "summary", "keyTakeaways" (array), "category"`,
          },
          {
            role: 'user',
            content: `Please analyze this article:\n\n${text.slice(0, 4000)}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to generate summary');
    }

    const content = data.choices[0].message.content;
    const parsed = JSON.parse(content);

    return {
      summary: parsed.summary,
      keyTakeaways: parsed.keyTakeaways || [],
      category: parsed.category || 'industry_analysis',
    };
  } catch (error) {
    console.error('Error summarizing with OpenAI:', error);
    throw error;
  }
}

/**
 * Generate AI summary using Anthropic Claude API
 */
export async function summarizeWithClaude(text: string): Promise<SummarizationResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: `You are an expert VC content analyst. Analyze the given article and provide:
1. A concise 2-3 sentence summary
2. 3-5 key takeaways (bullet points)
3. Category (one of: market_trends, founder_advice, industry_analysis, investment_thesis, portfolio_updates)

Format your response as JSON with keys: "summary", "keyTakeaways" (array), "category"

Article to analyze:
${text.slice(0, 4000)}`,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to generate summary');
    }

    const content = data.content[0].text;
    const parsed = JSON.parse(content);

    return {
      summary: parsed.summary,
      keyTakeaways: parsed.keyTakeaways || [],
      category: parsed.category || 'industry_analysis',
    };
  } catch (error) {
    console.error('Error summarizing with Claude:', error);
    throw error;
  }
}

/**
 * Generate summary using available AI service (OpenAI preferred)
 */
export async function generateSummary(text: string): Promise<SummarizationResult> {
  if (process.env.OPENAI_API_KEY) {
    return summarizeWithOpenAI(text);
  } else if (process.env.ANTHROPIC_API_KEY) {
    return summarizeWithClaude(text);
  } else {
    // Fallback: simple extractive summarization
    return generateFallbackSummary(text);
  }
}

/**
 * Simple fallback summarization when no AI API is available
 */
export function generateFallbackSummary(text: string): SummarizationResult {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  const summary = sentences.slice(0, 3).join(' ').trim();

  // Extract key phrases (simple keyword extraction)
  const words = text.toLowerCase().split(/\s+/);
  const stopWords = new Set([
    'the',
    'a',
    'an',
    'and',
    'or',
    'but',
    'in',
    'on',
    'at',
    'to',
    'for',
    'of',
    'with',
    'by',
    'from',
  ]);
  const keyWords = words
    .filter((w) => w.length > 5 && !stopWords.has(w))
    .slice(0, 5)
    .map((w) => `• ${w.charAt(0).toUpperCase() + w.slice(1)}`);

  return {
    summary: summary || 'Summary not available',
    keyTakeaways: keyWords.length > 0 ? keyWords : ['No key takeaways extracted'],
    category: 'industry_analysis',
  };
}
