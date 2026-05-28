# Staging Settings Runtime Validation

## Objetivo

Validar la activacion aislada de settings runtime contra datos de staging sin conectar nada globalmente al runtime productivo.

## Alcance validado

- `backend/src/foundation/settings/settings-resolver.service.js`
- `frontend/src/foundation/hooks/useRuntimeSettings.js`
- `frontend/src/foundation/hooks/runtime-settings.shared.js`
- `frontend/src/foundation/dev/FoundationRuntimeSandbox.jsx`

## Entorno

- rama: `feature/foundation-enterprise-core`
- archivo usado: `backend/.env.staging`
- produccion: no tocada
- EMAUS: no afectado

## Casos validados

### Demo company

Se validan los settings resueltos para `RubDev Demo Company`:

- `timezone`
- `currency`
- `locale`
- `language`
- `date_format`
- `number_format`

### Unknown company

Se valida que una empresa desconocida no rompa runtime y vuelva a defaults seguros.

### Null company

Se valida que ausencia de `company_id` no rompa runtime y vuelva a defaults seguros.

### Hook / sandbox

Se valida que el helper compartido de `useRuntimeSettings`:

- normalice settings resueltos
- complete defaults cuando falten valores
- mantenga comportamiento seguro para sandbox sin wiring global

## Defaults esperados

- `timezone`: `America/Bogota`
- `currency`: `COP`
- `locale`: `es-CO`
- `language`: `es`
- `date_format`: `DD/MM/YYYY`
- `number_format`: `1.234,56`

## Resultado esperado

- runtime settings resueltos correctamente para demo company
- fallback seguro para empresa desconocida
- fallback seguro para `company_id` nulo
- frontend build exitoso
- ningun wiring global nuevo
- ningun cambio en auth o modulos financieros
