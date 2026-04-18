# Trazo - Working Agreement

## Product context
- Trazo is an embedded Shopify app focused on helping merchants create better go-to-market assets faster.
- The MVP solves four jobs: product page copy, basic SEO, marketing emails, and initial offer or branding suggestions.
- The current stage is "scaffolded MVP": UX, documentation, prompt design, and provider abstraction exist before real AI generation is connected.

## Tech stack
- Shopify embedded app
- React Router 7
- Shopify App Bridge + Polaris web components
- Prisma + SQLite
- TypeScript

## Current route map
- `/app`: Trazo dashboard
- `/app/projects/new`: new project wizard
- `/app/additional`: legacy template route, currently not part of the main nav

## Engineering intent
- Keep the app useful with mocks and structured previews before wiring the real provider.
- Preserve embedded Shopify behavior and authentication flow from the template.
- Prefer small server-side seams that make Anthropic integration easy to add later.

## Anthropic status
- Do not ship a real Anthropic client yet.
- Use `app/services/anthropic.server.ts` only as a scaffold and environment contract.
- Use `app/services/trazo-generator.server.ts` for preview generation, mocked orchestration, and future provider routing.

## UX principles
- The product should feel calm, strategic, and merchant-friendly rather than "raw AI console".
- Each screen must clarify what the merchant gets, what is needed from them, and what happens next.
- Favor guided workflows over open-ended prompt boxes in the MVP.

## Documentation map
- `docs/00-vision.md`: why Trazo should exist
- `docs/01-prd.md`: MVP scope and acceptance criteria
- `docs/02-user-flow.md`: end-to-end merchant journey
- `docs/03-ui-spec.md`: screen-by-screen UI contract
- `docs/04-architecture.md`: technical blueprint
- `docs/05-data-model.md`: future persistence design
- `docs/06-prompts.md`: prompt strategy and templates
- `docs/07-roadmap.md`: phased delivery
- `docs/08-rules.md`: generation and safety rules

## Implementation guardrails
- Avoid changing Prisma schema unless the UI or server flow actually needs persistence.
- Reuse shared option lists from `app/lib/trazo.ts`.
- Keep Spanish as the primary product language for the current UI and docs.
