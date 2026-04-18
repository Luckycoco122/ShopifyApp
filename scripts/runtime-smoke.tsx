import { JSDOM } from "jsdom";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { fireEvent, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { AppProvider } from "@shopify/shopify-app-react-router/react";

const dom = new JSDOM("<!doctype html><html><body><div id='root'></div></body></html>", {
  url: "http://localhost/app",
});

process.env.SHOPIFY_APP_URL ||= "http://localhost:3000";
process.env.SHOPIFY_API_KEY ||= "test-key";
process.env.SHOPIFY_API_SECRET ||= "test-secret";
process.env.SCOPES ||= "write_products";

globalThis.window = dom.window as never;
globalThis.document = dom.window.document;
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.HTMLInputElement = dom.window.HTMLInputElement;
globalThis.HTMLTextAreaElement = dom.window.HTMLTextAreaElement;
globalThis.HTMLSelectElement = dom.window.HTMLSelectElement;
globalThis.FormData = dom.window.FormData;
globalThis.Event = dom.window.Event;
Object.defineProperty(dom.window.HTMLElement.prototype, "attachEvent", {
  configurable: true,
  value: () => {},
});
Object.defineProperty(dom.window.HTMLElement.prototype, "detachEvent", {
  configurable: true,
  value: () => {},
});
Object.defineProperty(globalThis, "navigator", {
  configurable: true,
  value: dom.window.navigator,
});
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

function renderRouter(router: ReturnType<typeof createMemoryRouter>) {
  const container = document.getElementById("root");

  if (!container) {
    throw new Error("No se encontro el contenedor del smoke test.");
  }

  const root = createRoot(container);

  act(() => {
    root.render(<RouterProvider router={router} />);
  });

  return {
    container,
    cleanup() {
      act(() => root.unmount());
      container.innerHTML = "";
    },
  };
}

function wrapInProvider(element: React.ReactNode) {
  return (
    <AppProvider embedded apiKey="test-api-key">
      {element}
    </AppProvider>
  );
}

async function smokeDashboard() {
  const [{ default: DashboardRoute, loader: dashboardLoader }] = await Promise.all([
    import("../app/routes/app._index"),
  ]);

  const router = createMemoryRouter(
    [
      {
        path: "/app",
        loader: dashboardLoader,
        element: wrapInProvider(<DashboardRoute />),
      },
    ],
    { initialEntries: ["/app"] },
  );

  const view = renderRouter(router);
  const queries = within(view.container);
  await waitFor(() =>
    queries.getByText(
      /Convierte una idea de producto en una primera campana coherente/i,
    ),
  );
  view.cleanup();
}

async function smokeWizard() {
  const [
    { default: NewProjectRoute },
    { buildTrazoProjectDraft },
    { createProjectPreview },
  ] = await Promise.all([
    import("../app/routes/app.projects.new"),
    import("../app/lib/trazo"),
    import("../app/services/trazo-generator.server"),
  ]);

  const router = createMemoryRouter(
    [
      {
        path: "/app/projects/new",
        action: async ({ request }) => {
          const formData = await request.formData();
          return createProjectPreview(buildTrazoProjectDraft(formData));
        },
        element: wrapInProvider(<NewProjectRoute />),
      },
    ],
    { initialEntries: ["/app/projects/new"] },
  );

  const view = renderRouter(router);
  const queries = within(view.container);
  const user = userEvent.setup({
    document: dom.window.document,
  });

  await waitFor(() =>
    queries.getByText(
      /Captura el contexto minimo para que Trazo escriba con criterio/i,
    ),
  );

  await user.type(
    queries.getByPlaceholderText(/Serum nocturno Calm Tide/i),
    "Cafe de especialidad Atlas Roast",
  );
  await user.type(
    queries.getByPlaceholderText(/Cosmetica, hogar, food, accesorios/i),
    "Cafe",
  );
  await user.type(
    queries.getByPlaceholderText(/Que hace el producto, que lo diferencia/i),
    "Cafe de especialidad en grano con perfil achocolatado y tueste medio para rutina diaria.",
  );
  await waitFor(() =>
    queries.getByDisplayValue(/Cafe de especialidad Atlas Roast/i),
  );
  await user.click(queries.getByRole("button", { name: /Siguiente/i }));
  await waitFor(() =>
    queries.getByPlaceholderText(/Quien es, que estilo de vida tiene, que busca/i),
  );

  await user.type(
    queries.getByPlaceholderText(/Quien es, que estilo de vida tiene, que busca/i),
    "Profesionales que valoran buen cafe en casa y quieren algo simple pero mejor que el supermercado.",
  );
  await user.type(
    queries.getByPlaceholderText(/Que problema quiere resolver/i),
    "Quiere disfrutar una taza mejor sin complicarse con demasiada tecnica.",
  );
  await user.click(queries.getByRole("button", { name: /Siguiente/i }));
  await waitFor(() => queries.getByPlaceholderText(/Trazo Studio/i));

  await user.type(queries.getByPlaceholderText(/Trazo Studio/i), "Atlas Roast");
  await user.click(queries.getByLabelText(/Directo/i));
  await user.type(
    queries.getByPlaceholderText(/Palabras que quieres usar, palabras a evitar/i),
    "Hablar con claridad, evitar elitismo, sonar experto pero cercano.",
  );
  await user.click(queries.getByRole("button", { name: /Siguiente/i }));
  await waitFor(() => queries.getByText(/Activos a generar/i));

  await user.click(queries.getByRole("button", { name: /Crear brief inicial/i }));

  await waitFor(() =>
    queries.getByText(/Brief listo para Cafe de especialidad Atlas Roast/i),
  );

  view.cleanup();
}

await smokeDashboard();
await smokeWizard();

console.log(
  "Runtime smoke OK: dashboard y wizard renderizan y el flujo principal completa.",
);
