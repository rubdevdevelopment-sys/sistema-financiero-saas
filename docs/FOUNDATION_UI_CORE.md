# Foundation UI Core

## Objetivo

Crear un set inicial de componentes base reutilizables sobre los design tokens foundation, sin reemplazar la UI actual y sin introducir wiring global.

## Componentes creados

- `frontend/src/foundation/components/FoundationButton.jsx`
- `frontend/src/foundation/components/FoundationCard.jsx`
- `frontend/src/foundation/components/FoundationInput.jsx`
- `frontend/src/foundation/components/FoundationBadge.jsx`
- `frontend/src/foundation/components/FoundationLoader.jsx`
- `frontend/src/foundation/components/FoundationEmptyState.jsx`
- `frontend/src/foundation/components/FoundationModal.jsx`

## Principios

- accesibles
- reutilizables
- aislados
- responsive-ready
- future-branding-ready
- basados solo en `foundation-theme`

## Alcance de esta fase

Estos componentes:

- existen solo en la capa `foundation`
- no reemplazan componentes productivos actuales
- no cambian paginas financieras activas
- no se montan globalmente
- se validan unicamente en sandbox

## Preview en sandbox

`FoundationRuntimeSandbox.jsx` ahora muestra:

- botones
- badges
- inputs
- loader
- empty state
- modal
- combinacion con runtime settings y design tokens

## Seguridad

- no global UI replacement
- no impact on production
- no auth changes
- no aggressive finance page changes
- EMAUS no afectado
