import type {
  TrazoGeneratedBundle,
  TrazoProjectDraft,
} from "../lib/trazo";

export interface AnthropicProviderStatus {
  provider: "anthropic";
  configured: boolean;
  apiKeyPresent: boolean;
  model: string;
  status: "live" | "missing_api_key";
  note: string;
}

interface AnthropicMessageResponse {
  content?: Array<{
    type?: string;
    text?: string;
  }>;
  error?: {
    message?: string;
  };
}

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

export function getAnthropicScaffoldStatus(): AnthropicProviderStatus {
  const apiKeyPresent = Boolean(process.env.ANTHROPIC_API_KEY);
  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514";

  return {
    provider: "anthropic",
    configured: apiKeyPresent,
    apiKeyPresent,
    model,
    status: apiKeyPresent ? "live" : "missing_api_key",
    note: apiKeyPresent
      ? "Anthropic esta configurado y listo para generar la primera salida real del MVP."
      : "Falta ANTHROPIC_API_KEY para activar la generacion real con Anthropic.",
  };
}

function extractTextContent(response: AnthropicMessageResponse) {
  const text = (response.content || [])
    .filter((block) => block.type === "text" && block.text)
    .map((block) => block.text)
    .join("\n")
    .trim();

  if (!text) {
    throw new Error(
      response.error?.message ||
        "Anthropic no devolvio contenido de texto utilizable.",
    );
  }

  return text;
}

function extractJsonPayload(text: string) {
  const fencedMatch = text.match(/```json\s*([\s\S]*?)\s*```/i);
  const raw = fencedMatch?.[1] || text;
  return JSON.parse(raw) as Partial<TrazoGeneratedBundle>;
}

function validateGeneratedBundle(payload: Partial<TrazoGeneratedBundle>) {
  const benefits = Array.isArray(payload.benefits)
    ? payload.benefits.filter((item): item is string => Boolean(item)).slice(0, 3)
    : [];

  if (
    !payload.heroTitle ||
    !payload.subtitle ||
    benefits.length !== 3 ||
    !payload.suggestedOffer ||
    !payload.seoTitle ||
    !payload.seoDescription
  ) {
    throw new Error(
      "Anthropic devolvio una respuesta incompleta para el bundle inicial de Trazo.",
    );
  }

  return {
    heroTitle: payload.heroTitle,
    subtitle: payload.subtitle,
    benefits,
    suggestedOffer: payload.suggestedOffer,
    seoTitle: payload.seoTitle,
    seoDescription: payload.seoDescription,
  };
}

function buildPrompt(draft: TrazoProjectDraft) {
  return `
Genera una propuesta inicial para una app Shopify de marketing llamada Trazo.

Devuelve solo JSON valido con esta forma exacta:
{
  "heroTitle": "string",
  "subtitle": "string",
  "benefits": ["string", "string", "string"],
  "suggestedOffer": "string",
  "seoTitle": "string",
  "seoDescription": "string"
}

Reglas:
- Escribe en espanol neutro.
- No inventes especificaciones tecnicas no incluidas.
- Manten tono alineado con la marca.
- Haz el SEO natural y usable.
- Los beneficios deben ser concretos, no vagos.

Brief:
${JSON.stringify(draft, null, 2)}
`.trim();
}

export async function generateTrazoMvpBundle(
  draft: TrazoProjectDraft,
): Promise<TrazoGeneratedBundle> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514";

  if (!apiKey) {
    throw new Error(
      "No se encontro ANTHROPIC_API_KEY. Configura la variable de entorno para generar contenido real.",
    );
  }

  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 900,
      system:
        "Eres un estratega de ecommerce y copywriter senior. Debes devolver solo JSON valido y util.",
      messages: [
        {
          role: "user",
          content: buildPrompt(draft),
        },
      ],
    }),
  });

  const json = (await response.json()) as AnthropicMessageResponse;

  if (!response.ok) {
    throw new Error(
      json.error?.message ||
        `Anthropic respondio con estado ${response.status}.`,
    );
  }

  const text = extractTextContent(json);
  const payload = extractJsonPayload(text);
  return validateGeneratedBundle(payload);
}
