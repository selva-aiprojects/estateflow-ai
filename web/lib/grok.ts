const GROK_API_KEY = process.env.GROK_API_KEY;
const GROK_BASE_URL = process.env.GROK_BASE_URL ?? "https://api.x.ai/v1";
const GROK_MODEL = process.env.GROK_MODEL ?? "grok-4.5";

export interface GrokMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface GrokOptions {
  maxTokens?: number;
  temperature?: number;
}

/**
 * Calls the xAI (Grok) chat-completions API. Returns the assistant reply text,
 * or null when the API key is missing or the call fails — callers fall back to
 * rule-based replies so the app keeps working without a key.
 */
export async function grokComplete(messages: GrokMessage[], opts: GrokOptions = {}): Promise<string | null> {
  if (!GROK_API_KEY) return null;
  try {
    const res = await fetch(`${GROK_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROK_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROK_MODEL,
        messages,
        max_tokens: opts.maxTokens ?? 500,
        temperature: opts.temperature ?? 0.4,
      }),
      signal: AbortSignal.timeout(25_000),
    });
    if (!res.ok) return null;
    const data: { choices?: { message?: { content?: unknown } }[] } = await res.json();
    const content = data.choices?.[0]?.message?.content;
    return typeof content === "string" && content.trim() ? content.trim() : null;
  } catch {
    return null;
  }
}
