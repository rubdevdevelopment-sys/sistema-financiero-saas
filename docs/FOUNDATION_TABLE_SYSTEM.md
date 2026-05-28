# Foundation Table System

## Objetivo

Crear un sistema de tablas enterprise-ready y reusable dentro de la capa foundation, sin reemplazar las tablas financieras activas ni alterar vistas productivas.

## Componentes creados

- `frontend/src/foundation/tables/FoundationTable.jsx`
- `frontend/src/foundation/tables/FoundationTableToolbar.jsx`
- `frontend/src/foundation/tables/FoundationPagination.jsx`
- `frontend/src/foundation/tables/FoundationTableEmptyState.jsx`
- `frontend/src/foundation/tables/FoundationTableSkeleton.jsx`

## Capacidades incluidas

- columnas
- filas
- loading state
- empty state
- actions column
- search placeholder simple
- pagination controls
- responsive overflow seguro

## Dependencias foundation usadas

- `foundation-theme`
- `FoundationButton`
- `FoundationCard`
- `FoundationBadge`
- `FoundationEmptyState`
- `FoundationLoader`

## Sandbox

`FoundationRuntimeSandbox.jsx` ahora incluye:

- preview principal con datos demo fake
- toolbar con search local
- acciones por fila
- paginacion
- preview de empty state
- preview de loading state

## Seguridad

- no reemplazo de tablas productivas
- no cambios en vistas activas EMAUS
- no wiring global
- no impacto en produccion
- solo opt-in y aislado
