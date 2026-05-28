# Foundation Settings Activation

## Objetivo

Activar de forma gradual y opcional la resolucion de `company_settings` sin cambiar el wiring global actual, sin reemplazar fuentes activas de produccion y sin afectar a EMAUS.

## Alcance de esta fase

Esta activacion se limita a:

- `timezone`
- `currency`
- `locale`
- `language`
- `date_format`
- `number_format`

No incluye:

- auth
- tenant enforcement global
- rutas nuevas
- activacion en `app.js` o `server.js`
- cambios agresivos en modulos financieros
- reemplazo de `company_modules`

## Nuevas piezas

### Backend

- `backend/src/foundation/settings/settings-resolver.service.js`

Este resolver:

- encapsula la lectura segura de settings para runtime futuro
- usa `company_settings` cuando existe
- cae de forma segura a `companies.timezone` y `companies.currency` via `settings.service.js`
- devuelve defaults seguros si falta `company_id` o si ocurre un fallo de runtime

### Frontend

- `frontend/src/foundation/hooks/useRuntimeSettings.js`

Este hook:

- consume `useSettings()` cuando no recibe datos explicitos
- normaliza y completa defaults seguros
- no depende de wiring global
- no rompe la UI si el runtime foundation aun no esta conectado

## Defaults seguros

- `timezone`: `America/Bogota`
- `currency`: `COP`
- `locale`: `es-CO`
- `language`: `es`
- `date_format`: `DD/MM/YYYY`
- `number_format`: `1.234,56`

## Reglas de activacion segura

- La resolucion de settings sigue siendo opcional.
- No se montan providers globalmente.
- No se activa ningun middleware nuevo.
- No se altera la logica actual de auth.
- No se modifica la logica financiera existente.
- Si `company_settings` no existe o falla, el runtime debe seguir estable.

## Estrategia de fallback

1. Si hay settings de empresa validos, usarlos.
2. Si no hay fila en `company_settings`, usar fallback desde `companies`.
3. Si falta `company_id`, devolver defaults seguros sin lanzar errores.
4. Si falla el runtime, devolver defaults seguros sin bloquear el flujo.

## Validacion esperada

- Backend syntax check del resolver.
- Frontend build exitoso.
- Sandbox foundation mostrando settings resueltos y fallback visible.

## Estado

- Activacion aislada y opcional: si
- Wiring global: no
- Impacto en produccion: no
- Riesgo para EMAUS: no mientras permanezca desconectado del runtime global
