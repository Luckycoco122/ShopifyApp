import { useEffect, useState } from "react";
import type { ActionFunctionArgs } from "react-router";
import { useFetcher } from "react-router";

import {
  awarenessLevels,
  buildTrazoProjectDraft,
  defaultProjectDraft,
  generationGoalDescriptions,
  generationGoalLabels,
  generationGoalOrder,
  primaryChannels,
  tonePresetOptions,
  type GenerationGoal,
  type TrazoProjectDraft,
} from "../lib/trazo";
import { createProjectPreview } from "../services/trazo-generator.server";
import { authenticate } from "../shopify.server";

const steps = [
  {
    id: "product",
    label: "Producto",
    description: "Que vendes y por que merece atencion.",
  },
  {
    id: "customer",
    label: "Cliente ideal",
    description: "A quien hablas y que friccion quieres resolver.",
  },
  {
    id: "brand",
    label: "Marca / tono",
    description: "Como debe sonar Trazo cuando escriba por ti.",
  },
  {
    id: "generate",
    label: "Que generar",
    description: "Selecciona las piezas del primer sprint.",
  },
] as const;

function getStepValid(stepIndex: number, draft: TrazoProjectDraft) {
  switch (stepIndex) {
    case 0:
      return Boolean(draft.productName && draft.productDescription);
    case 1:
      return Boolean(draft.idealCustomer);
    case 2:
      return Boolean(draft.brandName && draft.brandTone);
    case 3:
      return draft.generationGoals.length > 0;
    default:
      return false;
  }
}

function showShopifyToast(message: string) {
  if (typeof window === "undefined") {
    return;
  }

  const shopify = (
    window as Window & {
      shopify?: {
        toast?: {
          show?: (content: string) => void;
        };
      };
    }
  ).shopify;

  shopify?.toast?.show?.(message);
}

export const action = async ({ request }: ActionFunctionArgs) => {
  await authenticate.admin(request);

  const formData = await request.formData();
  return createProjectPreview(buildTrazoProjectDraft(formData));
};

export default function NewProjectRoute() {
  const fetcher = useFetcher<typeof action>();
  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState<TrazoProjectDraft>({
    ...defaultProjectDraft,
    generationGoals: [...defaultProjectDraft.generationGoals],
  });

  useEffect(() => {
    if (fetcher.data?.project?.id) {
      showShopifyToast("Brief inicial preparado");
    }
  }, [fetcher.data?.project?.id]);

  const isSubmitting = fetcher.state !== "idle";
  const isLastStep = stepIndex === steps.length - 1;
  const canContinue = getStepValid(stepIndex, draft);

  const updateField = <K extends keyof TrazoProjectDraft>(
    key: K,
    value: TrazoProjectDraft[K],
  ) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const toggleGoal = (goal: GenerationGoal) => {
    setDraft((current) => {
      const exists = current.generationGoals.includes(goal);
      return {
        ...current,
        generationGoals: exists
          ? current.generationGoals.filter((item) => item !== goal)
          : [...current.generationGoals, goal],
      };
    });
  };

  const submitDraft = () => {
    const formData = new FormData();

    formData.set("productName", draft.productName);
    formData.set("category", draft.category);
    formData.set("productDescription", draft.productDescription);
    formData.set("idealCustomer", draft.idealCustomer);
    formData.set("customerPainPoints", draft.customerPainPoints);
    formData.set("awarenessLevel", draft.awarenessLevel);
    formData.set("brandName", draft.brandName);
    formData.set("brandTone", draft.brandTone);
    formData.set("brandNotes", draft.brandNotes);
    formData.set("primaryChannel", draft.primaryChannel);
    draft.generationGoals.forEach((goal) =>
      formData.append("generationGoals", goal),
    );

    fetcher.submit(formData, { method: "post" });
  };

  return (
    <s-page heading="Nuevo proyecto">
      <div className="trazo-shell">
        <div className="trazo-grid">
          <section className="trazo-hero">
            <div className="trazo-kicker">Wizard inicial</div>
            <div className="trazo-grid trazo-grid--2">
              <div className="trazo-grid">
                <h1 className="trazo-hero__title">
                  Captura el contexto minimo para que Trazo escriba con criterio.
                </h1>
                <p className="trazo-hero__body">
                  Este flujo convierte lo esencial de tu producto, cliente y marca
                  en un brief accionable. La generacion real vendra despues; hoy
                  dejamos lista la estructura.
                </p>
              </div>

              <div className="trazo-card">
                <div className="trazo-kicker">Pasos</div>
                <div className="trazo-step-list">
                  {steps.map((step, index) => (
                    <span
                      key={step.id}
                      className={`trazo-step-pill${
                        index === stepIndex ? " is-active" : ""
                      }`}
                    >
                      {index + 1}. {step.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <div className="trazo-layout">
            <section className="trazo-step-panel">
              <div className="trazo-kicker">{steps[stepIndex].label}</div>
              <h2 className="trazo-section-title">{steps[stepIndex].description}</h2>
              <div className="trazo-divider" />

              {stepIndex === 0 && (
                <div className="trazo-form-grid">
                  <label className="trazo-field">
                    <span className="trazo-label">Nombre del producto</span>
                    <input
                      className="trazo-input"
                      value={draft.productName}
                      onChange={(event) =>
                        updateField("productName", event.target.value)
                      }
                      placeholder="Ej. Serum nocturno Calm Tide"
                    />
                  </label>

                  <label className="trazo-field">
                    <span className="trazo-label">Categoria</span>
                    <input
                      className="trazo-input"
                      value={draft.category}
                      onChange={(event) =>
                        updateField("category", event.target.value)
                      }
                      placeholder="Cosmetica, hogar, food, accesorios..."
                    />
                  </label>

                  <label className="trazo-field">
                    <span className="trazo-label">Descripcion corta</span>
                    <textarea
                      className="trazo-textarea"
                      value={draft.productDescription}
                      onChange={(event) =>
                        updateField("productDescription", event.target.value)
                      }
                      placeholder="Que hace el producto, que lo diferencia y por que alguien deberia comprarlo."
                    />
                  </label>
                </div>
              )}

              {stepIndex === 1 && (
                <div className="trazo-form-grid">
                  <label className="trazo-field">
                    <span className="trazo-label">Cliente ideal</span>
                    <textarea
                      className="trazo-textarea"
                      value={draft.idealCustomer}
                      onChange={(event) =>
                        updateField("idealCustomer", event.target.value)
                      }
                      placeholder="Quien es, que estilo de vida tiene, que busca y como compra."
                    />
                  </label>

                  <label className="trazo-field">
                    <span className="trazo-label">Pains o fricciones</span>
                    <textarea
                      className="trazo-textarea"
                      value={draft.customerPainPoints}
                      onChange={(event) =>
                        updateField("customerPainPoints", event.target.value)
                      }
                      placeholder="Que problema quiere resolver o que frustracion vive hoy."
                    />
                  </label>

                  <label className="trazo-field">
                    <span className="trazo-label">Nivel de awareness</span>
                    <select
                      className="trazo-select"
                      value={draft.awarenessLevel}
                      onChange={(event) =>
                        updateField("awarenessLevel", event.target.value)
                      }
                    >
                      {awarenessLevels.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              )}

              {stepIndex === 2 && (
                <div className="trazo-form-grid">
                  <label className="trazo-field">
                    <span className="trazo-label">Nombre de marca</span>
                    <input
                      className="trazo-input"
                      value={draft.brandName}
                      onChange={(event) =>
                        updateField("brandName", event.target.value)
                      }
                      placeholder="Ej. Trazo Studio"
                    />
                  </label>

                  <div className="trazo-field">
                    <span className="trazo-label">Preset de tono</span>
                    <div className="trazo-choice-grid">
                      {tonePresetOptions.map((tone) => (
                        <label
                          className={`trazo-choice${
                            draft.brandTone === tone.value ? " is-selected" : ""
                          }`}
                          key={tone.value}
                        >
                          <div className="trazo-inline-input">
                            <input
                              checked={draft.brandTone === tone.value}
                              name="brandTone"
                              onChange={() =>
                                updateField("brandTone", tone.value)
                              }
                              type="radio"
                            />
                            <div>
                              <strong>{tone.label}</strong>
                              <div className="trazo-micro">
                                {tone.description}
                              </div>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <label className="trazo-field">
                    <span className="trazo-label">Notas de voz</span>
                    <textarea
                      className="trazo-textarea"
                      value={draft.brandNotes}
                      onChange={(event) =>
                        updateField("brandNotes", event.target.value)
                      }
                      placeholder="Palabras que quieres usar, palabras a evitar, sensacion deseada y referentes."
                    />
                  </label>
                </div>
              )}

              {stepIndex === 3 && (
                <div className="trazo-form-grid">
                  <label className="trazo-field">
                    <span className="trazo-label">Canal prioritario</span>
                    <select
                      className="trazo-select"
                      value={draft.primaryChannel}
                      onChange={(event) =>
                        updateField("primaryChannel", event.target.value)
                      }
                    >
                      {primaryChannels.map((channel) => (
                        <option key={channel} value={channel}>
                          {channel}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="trazo-field">
                    <span className="trazo-label">Activos a generar</span>
                    <div className="trazo-form-grid">
                      {generationGoalOrder.map((goal) => (
                        <label
                          className={`trazo-checkbox${
                            draft.generationGoals.includes(goal)
                              ? " is-selected"
                              : ""
                          }`}
                          key={goal}
                        >
                          <div className="trazo-inline-input">
                            <input
                              checked={draft.generationGoals.includes(goal)}
                              onChange={() => toggleGoal(goal)}
                              type="checkbox"
                            />
                            <div>
                              <strong>{generationGoalLabels[goal]}</strong>
                              <div className="trazo-micro">
                                {generationGoalDescriptions[goal]}
                              </div>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="trazo-footer-actions">
                <button
                  className="trazo-button trazo-button--secondary"
                  disabled={stepIndex === 0}
                  onClick={() => setStepIndex((current) => Math.max(0, current - 1))}
                  type="button"
                >
                  Volver
                </button>

                {!isLastStep ? (
                  <button
                    className="trazo-button trazo-button--primary"
                    disabled={!canContinue}
                    onClick={() =>
                      setStepIndex((current) =>
                        Math.min(steps.length - 1, current + 1),
                      )
                    }
                    type="button"
                  >
                    Siguiente
                  </button>
                ) : (
                  <button
                    className="trazo-button trazo-button--primary"
                    disabled={!canContinue || isSubmitting}
                    onClick={submitDraft}
                    type="button"
                  >
                    {isSubmitting ? "Preparando..." : "Crear brief inicial"}
                  </button>
                )}
              </div>
            </section>

            <aside className="trazo-grid">
              <section className="trazo-summary">
                <div className="trazo-kicker">Resumen del brief</div>
                <dl>
                  <dt>Producto</dt>
                  <dd>{draft.productName || "Pendiente"}</dd>

                  <dt>Cliente ideal</dt>
                  <dd>{draft.idealCustomer || "Pendiente"}</dd>

                  <dt>Marca</dt>
                  <dd>{draft.brandName || "Pendiente"}</dd>

                  <dt>Tono</dt>
                  <dd>
                    {
                      tonePresetOptions.find(
                        (item) => item.value === draft.brandTone,
                      )?.label
                    }
                  </dd>

                  <dt>Generacion</dt>
                  <dd>
                    {draft.generationGoals.length > 0
                      ? draft.generationGoals
                          .map((goal) => generationGoalLabels[goal])
                          .join(", ")
                      : "Pendiente"}
                  </dd>
                </dl>
              </section>

              <section className="trazo-output-panel">
                <div className="trazo-kicker">Resultado</div>
                {fetcher.data?.project ? (
                  <>
                    <h2 className="trazo-panel-title">
                      {fetcher.data.preview.headline}
                    </h2>
                    <p className="trazo-preview-text">
                      {fetcher.data.preview.summary}
                    </p>
                    <ul className="trazo-check-list">
                      {fetcher.data.preview.deliverables.map((item) => (
                        <li className="trazo-check-item" key={item}>
                          {item}
                        </li>
                      ))}
                    </ul>
                    <div className="trazo-card">
                      <div className="trazo-kicker">Anthropic</div>
                      <p className="trazo-preview-text">
                        {fetcher.data.integration.note}
                      </p>
                    </div>
                    {fetcher.data.generatedBundle ? (
                      <div className="trazo-card">
                        <div className="trazo-kicker">Salida generada</div>
                        <h3 className="trazo-panel-title">
                          {fetcher.data.generatedBundle.heroTitle}
                        </h3>
                        <p className="trazo-preview-text">
                          {fetcher.data.generatedBundle.subtitle}
                        </p>
                        <ul className="trazo-check-list">
                          {fetcher.data.generatedBundle.benefits.map((benefit) => (
                            <li className="trazo-check-item" key={benefit}>
                              {benefit}
                            </li>
                          ))}
                        </ul>
                        <div className="trazo-divider" />
                        <p className="trazo-preview-text">
                          <strong>Oferta sugerida:</strong>{" "}
                          {fetcher.data.generatedBundle.suggestedOffer}
                        </p>
                        <p className="trazo-preview-text">
                          <strong>SEO title:</strong>{" "}
                          {fetcher.data.generatedBundle.seoTitle}
                        </p>
                        <p className="trazo-preview-text">
                          <strong>SEO description:</strong>{" "}
                          {fetcher.data.generatedBundle.seoDescription}
                        </p>
                      </div>
                    ) : null}
                    {fetcher.data.generationError ? (
                      <div className="trazo-empty">
                        <p className="trazo-preview-text">
                          {fetcher.data.generationError}
                        </p>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <div className="trazo-empty">
                    <p className="trazo-preview-text">
                      Cuando completes el wizard, aqui veras el brief resumido,
                      los entregables previstos y el estado del provider.
                    </p>
                  </div>
                )}
              </section>
            </aside>
          </div>
        </div>
      </div>
    </s-page>
  );
}
