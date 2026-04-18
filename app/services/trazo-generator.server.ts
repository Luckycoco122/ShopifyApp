import {
  generationGoalLabels,
  type GenerationGoal,
  type TrazoGeneratedBundle,
  type TrazoProjectDraft,
} from "../lib/trazo";
import {
  generateTrazoMvpBundle,
  getAnthropicScaffoldStatus,
  type AnthropicProviderStatus,
} from "./anthropic.server";

export interface TrazoProjectPreview {
  project: {
    id: string;
    name: string;
    status: "brief_ready";
    primaryGoal: string;
    createdAt: string;
  };
  preview: {
    headline: string;
    summary: string;
    deliverables: string[];
    nextAction: string;
    promptFocus: string[];
  };
  generatedBundle: TrazoGeneratedBundle | null;
  generationError: string | null;
  integration: AnthropicProviderStatus;
}

function buildDeliverable(goal: GenerationGoal, draft: TrazoProjectDraft) {
  switch (goal) {
    case "product_copy":
      return `Pagina de producto para ${draft.productName} con titular, beneficios, descripcion y CTA.`;
    case "seo":
      return `Pack SEO inicial para ${draft.productName}: meta title, description, keywords y FAQ.`;
    case "marketing_email":
      return `Email de lanzamiento para ${draft.primaryChannel.toLowerCase()} con asunto, preview y cuerpo.`;
    case "offer":
      return `Hipotesis de oferta para ${draft.productName} con hooks y angulos de conversion.`;
    case "branding":
      return `Direccion verbal inicial para ${draft.brandName || draft.productName} con tagline y tono sugerido.`;
  }
}

export async function createProjectPreview(
  draft: TrazoProjectDraft,
): Promise<TrazoProjectPreview> {
  const createdAt = new Date().toISOString();
  const integration = getAnthropicScaffoldStatus();
  const primaryGoal = generationGoalLabels[draft.generationGoals[0] || "product_copy"];
  let generatedBundle: TrazoGeneratedBundle | null = null;
  let generationError: string | null = null;

  try {
    generatedBundle = await generateTrazoMvpBundle(draft);
  } catch (error) {
    generationError =
      error instanceof Error
        ? error.message
        : "No se pudo generar el bundle inicial con Anthropic.";
  }

  return {
    project: {
      id: `trazo-${Date.now().toString(36)}`,
      name: draft.productName,
      status: "brief_ready",
      primaryGoal,
      createdAt,
    },
    preview: {
      headline: `Brief listo para ${draft.productName}`,
      summary: `${draft.brandName || "La marca"} ya tiene el contexto minimo para generar ${draft.generationGoals.length} entregables alineados con ${draft.idealCustomer}.`,
      deliverables: draft.generationGoals.map((goal) =>
        buildDeliverable(goal, draft),
      ),
      nextAction:
        "Conectar Anthropic y persistir el proyecto sera el siguiente paso para habilitar generacion real.",
      promptFocus: [
        `Cliente ideal: ${draft.idealCustomer}`,
        `Pains: ${draft.customerPainPoints || "Pendiente de detallar mejor."}`,
        `Tono: ${draft.brandTone}`,
        `Canal prioritario: ${draft.primaryChannel}`,
      ],
    },
    generatedBundle,
    generationError,
    integration,
  };
}
