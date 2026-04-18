import { useLoaderData } from "react-router";

import {
  dashboardStats,
  generationGoalLabels,
  moduleHighlights,
  sampleProjects,
} from "../lib/trazo";
import { getAnthropicScaffoldStatus } from "../services/anthropic.server";

export const loader = async () => {
  return {
    stats: dashboardStats,
    modules: moduleHighlights,
    projects: sampleProjects,
    priorities: [
      generationGoalLabels.product_copy,
      generationGoalLabels.seo,
      generationGoalLabels.marketing_email,
    ],
    integration: getAnthropicScaffoldStatus(),
  };
};

export default function DashboardRoute() {
  const { stats, modules, projects, priorities, integration } =
    useLoaderData<typeof loader>();

  return (
    <s-page heading="Trazo">
      <div className="trazo-shell">
        <div className="trazo-grid">
          <section className="trazo-hero">
            <div className="trazo-kicker">MVP workspace</div>
            <div className="trazo-grid trazo-grid--2">
              <div className="trazo-grid">
                <h1 className="trazo-hero__title">
                  Convierte una idea de producto en una primera campana coherente.
                </h1>
                <p className="trazo-hero__body">
                  Trazo prepara copy de producto, SEO, emails de marketing y
                  propuestas de oferta desde un brief guiado. La capa de IA real
                  todavia no esta conectada, pero el recorrido del MVP ya esta
                  listo para validarse con merchants.
                </p>
                <div className="trazo-actions">
                  <a
                    className="trazo-button trazo-button--primary"
                    href="/app/projects/new"
                  >
                    Nuevo proyecto
                  </a>
                  <a
                    className="trazo-button trazo-button--secondary"
                    href="/app/additional"
                  >
                    Ver sandbox actual
                  </a>
                </div>
              </div>

              <div className="trazo-card">
                <div className="trazo-kicker">Prioridades del MVP</div>
                <h2 className="trazo-panel-title">
                  Un brief estructurado antes de generar.
                </h2>
                <p className="trazo-hero__body">
                  El objetivo no es abrir una caja negra de prompts, sino ordenar
                  el contexto minimo para que el contenido salga util y
                  consistente.
                </p>
                <div className="trazo-pill-list">
                  {priorities.map((priority) => (
                    <span className="trazo-pill" key={priority}>
                      {priority}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <s-section heading="Senales iniciales">
            <div className="trazo-grid trazo-grid--3">
              {stats.map((stat) => (
                <article className="trazo-card trazo-stat" key={stat.label}>
                  <span className="trazo-kicker">{stat.label}</span>
                  <span className="trazo-stat__value">{stat.value}</span>
                  <p>{stat.detail}</p>
                </article>
              ))}
            </div>
          </s-section>

          <s-section heading="Lo que Trazo prepara">
            <div className="trazo-grid trazo-grid--2">
              {modules.map((module) => (
                <article className="trazo-card" key={module.title}>
                  <h3>{module.title}</h3>
                  <p>{module.body}</p>
                </article>
              ))}
            </div>
          </s-section>

          <div className="trazo-grid trazo-grid--2">
            <s-section heading="Proyectos de referencia">
              <ol className="trazo-project-list">
                {projects.map((project) => (
                  <li className="trazo-project-item" key={project.name}>
                    <div className="trazo-project-header">
                      <strong>{project.name}</strong>
                      <span className="trazo-badge">{project.status}</span>
                    </div>
                    <div className="trazo-project-meta">{project.focus}</div>
                  </li>
                ))}
              </ol>
            </s-section>

            <s-section heading="Estado de la integracion">
              <div className="trazo-card">
                <div className="trazo-row">
                  <strong>Provider</strong>
                  <span className="trazo-badge">{integration.provider}</span>
                </div>
                <div className="trazo-divider" />
                <div className="trazo-row">
                  <span className="trazo-helper">Modelo previsto</span>
                  <strong>{integration.model}</strong>
                </div>
                <div className="trazo-row">
                  <span className="trazo-helper">API key detectada</span>
                  <strong>{integration.apiKeyPresent ? "Si" : "No"}</strong>
                </div>
                <p className="trazo-preview-text">{integration.note}</p>
              </div>
            </s-section>
          </div>
        </div>
      </div>
    </s-page>
  );
}
