# 04. Architecture

## Objetivo tecnico
Separar claramente:
- experiencia de captura del brief
- logica de orquestacion
- proveedor de generacion

## Capas
### UI
- Rutas React Router dentro de `app/routes`
- Dashboard en `app/routes/app._index.tsx`
- Wizard en `app/routes/app.projects.new.tsx`
- Estilos globales de Trazo en `app/styles/trazo.css`

### Shared domain
- Tipos, presets y opciones en `app/lib/trazo.ts`

### Application services
- `app/services/trazo-generator.server.ts`
- Responsable de convertir el brief en un preview estructurado

### Provider layer
- `app/services/anthropic.server.ts`
- Define el punto de entrada futuro para Anthropic
- Hoy solo expone estado de scaffold y contrato basico

## Data flow actual
1. El usuario completa el wizard en cliente
2. La ruta envia un `FormData` al `action`
3. El `action` valida y normaliza el brief
4. `trazo-generator.server.ts` construye un proyecto preview
5. La UI muestra entregables y estado del provider

## Evolucion prevista
- Persistir proyectos, briefs y outputs en Prisma
- Encolar ejecucion real por tipo de asset
- Asociar outputs con producto Shopify y acciones de exportacion

## Riesgos
- Mezclar demasiado pronto UI, prompts y proveedor real
- Acoplar la experiencia a un solo modelo
- Prometer resultados finales cuando todavia solo existe preview
