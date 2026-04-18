# 05. Data Model

## Estado actual
La app solo persiste sesiones de Shopify. Los modelos siguientes son la propuesta para la siguiente fase, pero todavia no se migran a Prisma.

## Entidad: Project
- `id`
- `shop`
- `name`
- `status`
- `primaryGoal`
- `createdAt`
- `updatedAt`

## Entidad: Brief
- `id`
- `projectId`
- `productName`
- `category`
- `productDescription`
- `idealCustomer`
- `customerPainPoints`
- `awarenessLevel`
- `brandName`
- `brandTone`
- `brandNotes`
- `primaryChannel`

## Entidad: GenerationRequest
- `id`
- `projectId`
- `requestedAssets`
- `provider`
- `providerModel`
- `status`
- `submittedAt`
- `completedAt`

## Entidad: GeneratedAsset
- `id`
- `projectId`
- `type`
- `title`
- `content`
- `metadataJson`
- `qualityScore`
- `createdAt`

## Entidad: BrandSuggestion
- `id`
- `projectId`
- `angle`
- `offerHook`
- `tagline`
- `notes`

## Relacion minima
- Un `Project` tiene un `Brief`
- Un `Project` puede tener muchas `GenerationRequest`
- Una `GenerationRequest` puede producir muchos `GeneratedAsset`
- Un `Project` puede tener varias `BrandSuggestion`
