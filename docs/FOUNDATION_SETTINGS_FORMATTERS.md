# Foundation Settings Formatters

## Objetivo

Agregar utilidades de formato aisladas que usen settings foundation de runtime sin reemplazar los formatters globales actuales ni cambiar el comportamiento del modulo financiero existente.

## Utilidades creadas

- `frontend/src/foundation/utils/formatCurrency.js`
- `frontend/src/foundation/utils/formatDate.js`
- `frontend/src/foundation/utils/formatNumber.js`
- `frontend/src/foundation/utils/formatDateTime.js`
- `frontend/src/foundation/utils/formatter-settings.shared.js`

## Inputs soportados

- `locale`
- `currency`
- `timezone`
- `date_format`
- `number_format`

## Defaults seguros

Si runtime settings no esta disponible, las utilidades usan:

- `locale`: `es-CO`
- `currency`: `COP`
- `timezone`: `America/Bogota`
- `date_format`: `DD/MM/YYYY`
- `number_format`: `1.234,56`

## Comportamiento seguro

- Todas las utilidades usan `Intl.NumberFormat` o `Intl.DateTimeFormat`.
- Si un valor no es valido, el formatter devuelve un fallback seguro.
- Si un locale o currency falla, se usa fallback `es-CO` y `COP`.
- No existe wiring global.
- No se modifica ningun formatter activo fuera de `foundation/utils`.

## Casos cubiertos

- moneda con currency por runtime
- numero con `number_format` preferido para decimales
- fecha con preferencia `DD/MM/YYYY`, `MM/DD/YYYY` o `YYYY/MM/DD`
- datetime con timezone y locale seguros
- fallback visible en sandbox foundation

## Validacion

- preview agregado a `FoundationRuntimeSandbox.jsx`
- frontend build debe pasar
- los formatters deben funcionar con runtime settings reales o faltantes
