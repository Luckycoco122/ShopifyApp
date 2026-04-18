# 01. PRD

## Objetivo del MVP
Construir la primera version funcional de Trazo como app embebida en Shopify para crear briefs y preparar la generacion de activos comerciales.

## Jobs to be done
1. "Quiero lanzar o mejorar una pagina de producto sin escribirla desde cero."
2. "Quiero una base SEO aceptable sin contratar a un especialista."
3. "Quiero enviar un email comercial que suene a mi marca."
4. "Quiero ideas de oferta y posicionamiento para arrancar mas rapido."

## Alcance MVP
- Dashboard con estado del trabajo y accesos rapidos
- Flujo de "Nuevo proyecto"
- Wizard guiado con 4 pasos:
  - producto
  - cliente ideal
  - marca y tono
  - que generar
- Preparacion de un brief estructurado
- Preview de entregables sugeridos
- Capa de proveedor preparada para Anthropic, pero sin llamada real

## Fuera de alcance
- Persistencia completa de proyectos
- Edicion avanzada del resultado generado
- Integracion con Shopify product writeback
- Historial de versiones
- Facturacion
- Multiusuario

## Requisitos funcionales
- El merchant puede iniciar un proyecto nuevo desde el dashboard
- El wizard obliga a recoger minima informacion de producto, publico, marca y objetivos
- El sistema devuelve un brief inicial con entregables esperados
- El sistema muestra claramente que la integracion de IA real aun no esta activada

## Requisitos no funcionales
- Embedded UX estable dentro del admin de Shopify
- Navegacion clara entre dashboard y wizard
- TypeScript sin errores
- Arquitectura preparada para evolucionar a provider real sin reescribir la UI

## KPIs tempranos
- Tasa de inicio de proyecto
- Tasa de finalizacion del wizard
- Activos solicitados por categoria
- Tiempo hasta brief listo

## Criterios de aceptacion
- Existe documentacion base del producto, UX y arquitectura
- `/app` muestra un dashboard de Trazo en lugar de la plantilla por defecto
- `/app/projects/new` funciona como wizard simple de 4 pasos
- El submit del wizard devuelve un preview estructurado usando una capa server preparada para Anthropic
