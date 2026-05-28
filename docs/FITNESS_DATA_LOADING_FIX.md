# Fitness Data Loading Fix

## Causa raíz

Había dos causas combinadas detrás del `0` en `/fitness/exercises` y `/fitness/routines`:

1. El backend local con `npm run dev` seguía cargando `backend/.env`, no `backend/.env.staging`.
2. `useFitnessCompanyScope` hacía fallback a `companies[0]` cuando no encontraba `rubdev-demo-company`.

Ese fallback producía un `companyId` válido pero equivocado cuando el backend apuntaba a otra base o a otro dataset. Como resultado, las llamadas a Fitness devolvían `[]` en vez de fallar visiblemente.

Además, los clientes frontend Fitness atrapaban cualquier error real de API y devolvían `[]` o `null`, ocultando diferencias entre:

- falta de `companyId`
- `401` o `403`
- tenant incorrecto
- dataset realmente vacío

## Solución aplicada

- Se agregó soporte para seleccionar archivo de entorno backend vía `ENV_FILE`.
- Se creó `backend/scripts/dev-staging.js` y el script `npm run dev:staging`.
- `dev:staging` usa `backend/.env.staging` y un `JWT_SECRET` local efímero solo para desarrollo local contra staging.
- `useFitnessCompanyScope` ya no cae a la primera empresa disponible; solo acepta `rubdev-demo-company` para el auto-scope demo de `super_admin`.
- Los clientes frontend Fitness mantienen fallback seguro cuando falta `companyId`, pero ya no silencian errores reales de red o API.

## Cómo correr backend staging

Desde `backend/`:

```bash
npm run dev:staging
```

Notas:

- `npm run dev` sigue intacto y continúa usando `backend/.env`.
- `npm run dev:staging` queda aislado para pruebas locales contra staging.

## Validación real

Se validó con llamada real autenticada contra la API usando staging:

- `GET /api/fitness/exercises?companyId=<uuid>&isActive=true`
- `GET /api/fitness/routine-templates?companyId=<uuid>&isActive=true`

Resultado confirmado:

- exercises: `54`
- routine templates: `8`

El `companyId` validado es UUID real, no slug.
