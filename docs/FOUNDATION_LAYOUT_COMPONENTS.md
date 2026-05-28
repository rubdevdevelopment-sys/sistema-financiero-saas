# Foundation Layout Components

## Objetivo

Crear una capa reusable de layouts enterprise-ready usando solamente tokens foundation y componentes UI core, sin reemplazar los layouts productivos actuales.

## Componentes creados

- `frontend/src/foundation/layouts/FoundationPageLayout.jsx`
- `frontend/src/foundation/layouts/FoundationSection.jsx`
- `frontend/src/foundation/layouts/FoundationGrid.jsx`
- `frontend/src/foundation/layouts/FoundationPageHeader.jsx`
- `frontend/src/foundation/layouts/FoundationPanel.jsx`

## Principios

- responsive-ready
- reusable
- accessible
- future-branding-ready
- future-sidebar-compatible
- opt-in only

## Uso previsto

Estos layouts sirven para:

- futuras vistas enterprise
- demos internas
- sandboxes foundation
- nuevos modulos que nazcan fuera del runtime productivo actual

## Restricciones

- no reemplazan layouts actuales
- no modifican dashboards EMAUS
- no agregan wiring global
- no alteran rutas o shells productivos

## Sandbox

`FoundationRuntimeSandbox.jsx` ahora incluye:

- preview de `FoundationPageLayout`
- preview de `FoundationSection`
- preview de `FoundationGrid`
- preview de `FoundationPageHeader`
- preview de `FoundationPanel`

## Estado

- layout components creados: si
- preview aislado: si
- replacement global: no
- impacto en produccion: no
- EMAUS afectado: no
