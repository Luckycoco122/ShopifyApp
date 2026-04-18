export type GenerationGoal =
  | "product_copy"
  | "seo"
  | "marketing_email"
  | "offer"
  | "branding";

export type TonePreset =
  | "direct"
  | "warm"
  | "premium"
  | "playful"
  | "expert";

export interface TrazoProjectDraft {
  productName: string;
  category: string;
  productDescription: string;
  idealCustomer: string;
  customerPainPoints: string;
  awarenessLevel: string;
  brandName: string;
  brandTone: TonePreset;
  brandNotes: string;
  primaryChannel: string;
  generationGoals: GenerationGoal[];
}

export interface TrazoGeneratedBundle {
  heroTitle: string;
  subtitle: string;
  benefits: string[];
  suggestedOffer: string;
  seoTitle: string;
  seoDescription: string;
}

export const generationGoalLabels: Record<GenerationGoal, string> = {
  product_copy: "Copy de producto",
  seo: "SEO basico",
  marketing_email: "Email marketing",
  offer: "Oferta",
  branding: "Branding inicial",
};

export const generationGoalOrder: GenerationGoal[] = [
  "product_copy",
  "seo",
  "marketing_email",
  "offer",
  "branding",
];

export const generationGoalDescriptions: Record<GenerationGoal, string> = {
  product_copy: "Titular, beneficios, descripcion y CTA para la pagina.",
  seo: "Title tag, meta description, keywords y FAQ breve.",
  marketing_email: "Asunto, preview text y estructura de email de campana.",
  offer: "Idea de oferta, hooks y angulos de lanzamiento.",
  branding: "Tagline, tono inicial y direccion verbal basica.",
};

export const tonePresetOptions: Array<{
  value: TonePreset;
  label: string;
  description: string;
}> = [
  {
    value: "direct",
    label: "Directo",
    description: "Claro, breve y orientado a conversion.",
  },
  {
    value: "warm",
    label: "Cercano",
    description: "Humano, simple y con tono amistoso.",
  },
  {
    value: "premium",
    label: "Premium",
    description: "Mas editorial, sofisticado y aspiracional.",
  },
  {
    value: "playful",
    label: "Jugueton",
    description: "Con energia, ritmo y un punto creativo.",
  },
  {
    value: "expert",
    label: "Experto",
    description: "Seguro, didactico y basado en claridad.",
  },
];

export const awarenessLevels = [
  "No conoce bien el problema",
  "Sabe que tiene el problema",
  "Compara soluciones",
  "Ya esta listo para comprar",
];

export const primaryChannels = [
  "Pagina de producto",
  "Email",
  "Landing",
  "Instagram Ads",
  "Pack lanzamiento",
];

export const defaultProjectDraft: TrazoProjectDraft = {
  productName: "",
  category: "",
  productDescription: "",
  idealCustomer: "",
  customerPainPoints: "",
  awarenessLevel: awarenessLevels[1],
  brandName: "",
  brandTone: "warm",
  brandNotes: "",
  primaryChannel: primaryChannels[0],
  generationGoals: ["product_copy", "seo"],
};

export function isGenerationGoal(value: string): value is GenerationGoal {
  return generationGoalOrder.includes(value as GenerationGoal);
}

export function isTonePreset(value: string): value is TonePreset {
  return tonePresetOptions.some((option) => option.value === value);
}

export function buildTrazoProjectDraft(formData: FormData): TrazoProjectDraft {
  const generationGoals = formData
    .getAll("generationGoals")
    .map((value) => String(value))
    .filter(isGenerationGoal);

  const brandToneValue = String(formData.get("brandTone") || "");

  return {
    productName: String(formData.get("productName") || ""),
    category: String(formData.get("category") || ""),
    productDescription: String(formData.get("productDescription") || ""),
    idealCustomer: String(formData.get("idealCustomer") || ""),
    customerPainPoints: String(formData.get("customerPainPoints") || ""),
    awarenessLevel: String(formData.get("awarenessLevel") || awarenessLevels[0]),
    brandName: String(formData.get("brandName") || ""),
    brandTone: isTonePreset(brandToneValue) ? brandToneValue : "warm",
    brandNotes: String(formData.get("brandNotes") || ""),
    primaryChannel: String(formData.get("primaryChannel") || primaryChannels[0]),
    generationGoals:
      generationGoals.length > 0 ? generationGoals : ["product_copy"],
  };
}

export const dashboardStats = [
  { label: "Briefs listos", value: "12", detail: "Base demo para orientar el MVP" },
  { label: "Tiempo medio", value: "4 min", detail: "Objetivo para completar el wizard" },
  { label: "Activos top", value: "SEO + copy", detail: "Los dos modulos mas pedidos al inicio" },
];

export const moduleHighlights = [
  {
    title: "Copy para producto",
    body: "Convierte especificaciones en beneficios, estructura y CTA listos para ecommerce.",
  },
  {
    title: "SEO basico",
    body: "Prepara meta title, meta description y FAQ breve sin perder tono de marca.",
  },
  {
    title: "Email marketing",
    body: "Crea emails de lanzamiento, oferta o recuperacion con una idea central clara.",
  },
  {
    title: "Ofertas y branding",
    body: "Explora hooks, angulos y una primera voz verbal para arrancar con foco.",
  },
];

export const sampleProjects = [
  {
    name: "Serum nocturno Calm Tide",
    status: "Brief listo",
    focus: "Copy + SEO",
  },
  {
    name: "Kit de cafe Nomad Brew",
    status: "En revision",
    focus: "Email + oferta",
  },
  {
    name: "Mat de yoga Luma",
    status: "Pendiente de generar",
    focus: "Branding inicial",
  },
];
