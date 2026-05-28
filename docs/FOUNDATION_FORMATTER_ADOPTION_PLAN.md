# Foundation Formatter Adoption Plan

## Objetivo

Definir una adopcion segura y gradual de los formatters foundation sin reemplazar los formatters globales actuales ni alterar el comportamiento financiero productivo.

## Estado actual observado

### Formateo activo actual

El frontend sigue usando `frontend/src/utils/format.js` como fuente principal para:

- `currency`
- `formatCurrency`
- `integer`
- `percent`
- `formatDate`

Tambien existen usos inline de `Intl.NumberFormat` en:

- `frontend/src/pages/expenses/ExpensesPage.jsx`
- `frontend/src/pages/incomes/IncomesPage.jsx`

### Foundation formatters disponibles

- `frontend/src/foundation/utils/formatCurrency.js`
- `frontend/src/foundation/utils/formatDate.js`
- `frontend/src/foundation/utils/formatNumber.js`
- `frontend/src/foundation/utils/formatDateTime.js`

Estos formatters:

- son aislados
- usan runtime settings con fallback seguro
- no tienen wiring global
- no reemplazan el flujo actual

## Zonas de adopcion

### Zonas seguras

Puede usarse foundation formatting ahora en:

- `frontend/src/foundation/dev/*`
- sandboxes y previews aislados
- futuros componentes enterprise nuevos no conectados a pantallas productivas
- herramientas internas de validacion o demos desacopladas

### Zonas de riesgo medio

Puede evaluarse mas adelante, con revision explicita, en:

- vistas de settings de plataforma
- vistas super-admin no financieras
- nuevas cards o componentes informativos no transaccionales
- componentes opt-in que acepten settings runtime como prop explicita

Estas zonas requieren:

- comparacion visual previa
- validacion manual
- fallback visible
- capacidad de rollback rapido

### Zonas bloqueadas / alto riesgo

No deben migrarse todavia:

- `frontend/src/pages/funds/*`
- `frontend/src/pages/participants/*`
- `frontend/src/pages/dashboard/DashboardPage.jsx`
- `frontend/src/pages/public/PublicCompanyDashboardPage.jsx`
- `frontend/src/components/common/ParticipantTable.jsx`
- `frontend/src/components/common/StatCard.jsx`
- cualquier pantalla o card que hoy muestre metricas financieras activas de EMAUS

Estas zonas siguen dependiendo del comportamiento historico de `frontend/src/utils/format.js` y cualquier cambio puede alterar salidas visibles en producción.

## Estrategia de migracion

### Etapa 1

- mantener `foundation/utils/*` aislado
- usar solo en sandbox y previews
- validar comportamiento con runtime settings y fallback

### Etapa 2

- introducir adopcion opt-in solo en componentes nuevos
- pasar runtime settings por props o contexto aislado
- evitar reemplazo de imports existentes

### Etapa 3

- comparar salida visual entre formatter legacy y formatter foundation
- medir impacto en layout, longitud de strings y decimales
- aprobar por pantalla antes de cualquier sustitucion

### Etapa 4

- considerar wrappers de compatibilidad solo despues de evidencia suficiente
- no tocar finance flows productivos hasta tener aprobacion separada

## Estrategia de rollback

- si un componente opt-in falla, revertir solo ese import local
- no modificar `frontend/src/utils/format.js` como parte del rollback
- mantener previews y sandbox como zona segura de depuracion
- preferir rollback por componente y no por refactor global

## Estrategia de testing

- validar output con runtime settings reales
- validar output con runtime settings faltantes
- validar output con `company_id` nulo
- revisar diferencias de longitud visual en currency y datetime
- correr `npm run build`
- revisar que no aparezcan imports foundation en pantallas bloqueadas

## Recomendaciones actuales

### Puede usarse ahora

- `FoundationRuntimeSandbox`
- `FoundationFormatterPreview`
- nuevos componentes foundation-only
- futuras demos internas aisladas

### No debe usarse todavía

- reemplazo directo de `utils/format.js`
- pantallas financieras activas
- dashboards productivos
- flujo publico activo
- componentes compartidos usados hoy por EMAUS

## Decision

- adopcion planificada: si
- reemplazo global: no
- impacto en producción: no
- EMAUS protegido: si
