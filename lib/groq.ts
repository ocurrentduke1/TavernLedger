import { createClient } from "@/lib/supabase";

// Groq configuration
const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY || process.env.GROQ_API_KEY;

if (!GROQ_API_KEY) {
  console.warn("⚠️ GROQ_API_KEY no está configurada");
}

// Rate limits per user per month
export const GROQ_LIMITS = {
  requests_per_month: 30,
  tokens_per_month: 50_000,
  requests_per_day: 3,
  max_backstory_length: 150,
} as const;

type UsageCheckResult = {
  allowed: boolean;
  reason?: string;
  remaining?: number;
  usage?: {
    requests_count: number;
    tokens_used: number;
  };
};

/**
 * Check if user can generate a backstory
 */
export async function canGenerateBackstory(
  userId: string
): Promise<UsageCheckResult> {
  try {
    const supabase = createClient();
    const thisMonth = new Date().toISOString().slice(0, 7);

    const { data: usage, error } = await supabase
      .from("groq_usage")
      .select("requests_count, tokens_used, last_request_at")
      .eq("user_id", userId)
      .eq("month", thisMonth)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error checking usage:", error);
      throw error;
    }

    const currentRequests = usage?.requests_count ?? 0;
    const currentTokens = usage?.tokens_used ?? 0;
    const lastRequest = usage?.last_request_at ? new Date(usage.last_request_at) : null;

    // Check monthly requests
    if (currentRequests >= GROQ_LIMITS.requests_per_month) {
      return {
        allowed: false,
        reason: `Ya alcanzaste tu límite mensual de ${GROQ_LIMITS.requests_per_month} trasfondos. Vuelve el próximo mes.`,
        remaining: 0,
        usage: { requests_count: currentRequests, tokens_used: currentTokens },
      };
    }

    // Check monthly tokens
    if (currentTokens >= GROQ_LIMITS.tokens_per_month) {
      return {
        allowed: false,
        reason: "Tokens mensuales agotados. Vuelve el próximo mes.",
        remaining: 0,
        usage: { requests_count: currentRequests, tokens_used: currentTokens },
      };
    }

    // Check daily requests
    const today = new Date().toDateString();
    const requestsToday = lastRequest && lastRequest.toDateString() === today ? 1 : 0;

    if (requestsToday >= GROQ_LIMITS.requests_per_day) {
      return {
        allowed: false,
        reason: `Ya generaste ${GROQ_LIMITS.requests_per_day} trasfondos hoy. Vuelve mañana.`,
        remaining: GROQ_LIMITS.requests_per_month - currentRequests,
        usage: { requests_count: currentRequests, tokens_used: currentTokens },
      };
    }

    return {
      allowed: true,
      remaining: GROQ_LIMITS.requests_per_month - currentRequests,
      usage: { requests_count: currentRequests, tokens_used: currentTokens },
    };
  } catch (err) {
    console.error("Error in canGenerateBackstory:", err);
    // On error, don't allow (safe default)
    return {
      allowed: false,
      reason: "Error al verificar límites. Intenta más tarde.",
    };
  }
}

type GroqResponse = {
  backstory: string;
  tokensUsed: number;
};

/**
 * Generate backstory using Groq
 */
export async function generateBackstoryWithGroq(
  userId: string,
  characterName: string,
  characterClass: string | null,
  characterRace: string | null,
  characterLevel: number
): Promise<GroqResponse> {
  // Validate API key
  if (!GROQ_API_KEY) {
    throw new Error("API no configurada. Contacta al administrador.");
  }

  // Check limits
  const can = await canGenerateBackstory(userId);
  if (!can.allowed) {
    throw new Error(can.reason || "No puedes generar más trasfondos ahora.");
  }

  try {
    // Build prompt
    const charInfo = [characterClass, characterRace].filter(Boolean).join(" ");
    const prompt = `Genera un trasfondo breve (máximo 100 palabras) para un personaje D&D:
Nombre: ${characterName}
${charInfo ? `Clase/Raza: ${charInfo}` : ""}
Nivel: ${characterLevel}

Trasfondo creativo y conciso en español.`;

    // Call Groq API
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages: [{ role: "user", content: prompt }],
        max_tokens: GROQ_LIMITS.max_backstory_length,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      if (response.status === 429) {
        throw new Error("API rate limited. Intenta en unos minutos.");
      }
      throw new Error(error.error?.message || "Error generando trasfondo");
    }

    const data: any = await response.json();
    const backstory = data.choices?.[0]?.message?.content;
    const tokensUsed =
      (data.usage?.prompt_tokens ?? 0) + (data.usage?.completion_tokens ?? 0);

    if (!backstory) {
      throw new Error("No se generó contenido. Intenta de nuevo.");
    }

    // Log usage to Supabase
    // TODO: Fix SQL ambiguity error in log_groq_usage function
    // await logGroqUsage(userId, tokensUsed);

    return { backstory, tokensUsed };
  } catch (err: any) {
    console.error("Error generating backstory:", err);
    throw new Error(
      err.message || "Error generando trasfondo. Intenta de nuevo."
    );
  }
}

/**
 * Log Groq usage to database
 */
async function logGroqUsage(userId: string, tokensUsed: number): Promise<void> {
  try {
    const supabase = createClient();

    const { error } = await supabase.rpc("log_groq_usage", {
      user_id_input: userId,
      tokens_input: tokensUsed,
    });

    if (error) {
      console.error("Error logging usage:", error);
      // Don't throw - logging shouldn't block the operation
    }
  } catch (err) {
    console.error("Error in logGroqUsage:", err);
  }
}

/**
 * Get user's current usage for this month
 */
export async function getCurrentUsage(userId: string) {
  try {
    const supabase = createClient();
    const thisMonth = new Date().toISOString().slice(0, 7);

    const { data: usage } = await supabase
      .from("groq_usage")
      .select("requests_count, tokens_used")
      .eq("user_id", userId)
      .eq("month", thisMonth)
      .single();

    return {
      requests: usage?.requests_count ?? 0,
      tokens: usage?.tokens_used ?? 0,
      requestsRemaining: Math.max(0, GROQ_LIMITS.requests_per_month - (usage?.requests_count ?? 0)),
      tokensRemaining: Math.max(0, GROQ_LIMITS.tokens_per_month - (usage?.tokens_used ?? 0)),
    };
  } catch (err) {
    console.error("Error getting usage:", err);
    return { requests: 0, tokens: 0, requestsRemaining: 0, tokensRemaining: 0 };
  }
}
