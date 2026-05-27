# Foundation Architecture Map

## Objetivo

Preparar una estructura enterprise-safe para la evolucion incremental de RubDev SaaS sin activar logica productiva nueva, sin migraciones y sin afectar al tenant EMAUS.

## Estado actual observado

### Areas SaaS ya existentes

- El backend ya opera con aislamiento multiempresa mediante `company_id`.
- Ya existe operacion `super_admin` y modo soporte para entrar de forma explicita a un tenant.
- Ya existe configuracion de empresa y activacion modular por `company_modules`.
- El frontend ya tiene contexto de empresa activa y vistas administrativas de plataforma.

### Estructura tenant-aware parcial ya presente

- Backend: `services/company.service.js`, `services/auth.service.js`, `services/public-dashboard.service.js` y servicios operativos con resolucion de `company_id`.
- Frontend: `context/ActiveCompanyContext.jsx`, `pages/super-admin/*`, `pages/settings/SettingsPage.jsx` y servicios que envian `company_id`.

### Restos o trabajo incompleto de fitness foundation

- La rama `feature/fitness-module-foundation` introduce rutas, servicios, validadores, paginas y migraciones propias de fitness.
- Ese trabajo agrega logica productiva y cambios de superficie funcional, por lo que no debe mezclarse con esta foundation enterprise inicial.
- La rama actual de trabajo para esta tarea debe permanecer solo como base organizacional y documental.

## Strategy

La foundation enterprise se prepara como capas vacias y estables alrededor de la arquitectura actual. El objetivo es abrir espacio para evolucion tenant-aware, branding por empresa, feature flags, permisos avanzados y auditoria, sin conectar aun estas capas a rutas, auth, modulos financieros ni migraciones.

## Carpetas backend

- `backend/src/tenant`: resolucion futura de tenant, contexto operativo y reglas de aislamiento.
- `backend/src/settings`: configuraciones por tenant y configuracion de plataforma desacoplada de controladores actuales.
- `backend/src/branding`: branding por tenant, assets logicos y reglas de personalizacion.
- `backend/src/features`: catalogo y habilitacion futura de capacidades por tenant.
- `backend/src/permissions`: permisos granulares y politicas futuras sin tocar el auth actual.
- `backend/src/audit`: trazabilidad y eventos de auditoria futuros.
- `backend/src/shared`: contratos, utilidades y piezas transversales no financieras.

## Carpetas frontend

- `frontend/src/providers`: providers futuros de plataforma, tenant y feature state.
- `frontend/src/tenant`: utilidades y modelos de tenant para UI.
- `frontend/src/branding`: tokens y adaptadores visuales por tenant.
- `frontend/src/features`: acceso futuro a feature flags y capacidad modular.
- `frontend/src/themes`: definicion de temas y tokens visuales.
- `frontend/src/design-system`: componentes base enterprise-safe reutilizables.
- `frontend/src/layouts`: layouts futuros desacoplados de shells actuales.

## Regla oficial de evolucion incremental

- Crear primero estructura y contratos vacios.
- Conectar luego solo una capacidad por vez.
- Validar aislamiento tenant antes de exponer cualquier modulo nuevo.
- No mezclar iniciativas incompletas previas con nuevas capas foundation.
- Toda evolucion futura debe preservar compatibilidad con EMAUS antes de expandirse a otros tenants.

## Proteccion EMAUS

- EMAUS es el unico tenant productivo real actual.
- No se modifica flujo financiero existente.
- No se modifica autenticacion actual.
- No se cambian rutas actuales.
- No se cambian imports actuales.
- No se alteran modelos operativos ni consultas productivas existentes.

## Reglas oficiales de esta foundation

- NO logica productiva todavia.
- NO migracion automatica de datos.
- NO integracion con auth todavia.
- NO cambios en modulos financieros todavia.
- NO activacion automatica de features todavia.

## Primera migracion foundation permitida

- `011_company_settings_foundation.sql` crea `company_settings` como capa complementaria.
- La tabla no reemplaza `companies.timezone` ni `companies.currency`.
- No modifica queries, servicios, validators ni flujos actuales.
- No ejecuta backfill ni sincronizacion automatica.
- Su objetivo es preparar una evolucion futura hacia configuracion desacoplada por tenant con estrategia expand first.

## Segunda migracion foundation permitida

- `012_company_branding_foundation.sql` crea `company_branding` como capa complementaria de branding por tenant.
- La tabla no reemplaza estilos globales, clases actuales, ni configuracion visual ya usada por el frontend.
- Aun no se usa en runtime.
- No modifica dashboards, `CompaniesPage`, CSS actual ni componentes existentes.
- No ejecuta backfill ni sincronizacion automatica.
- La evolucion futura debera usar fallback visual global cuando una empresa no tenga branding propio definido.

## Tercera migracion foundation permitida

- `013_company_features_foundation.sql` crea `company_features` como foundation enterprise futura para feature enablement mas granular.
- `company_modules` sigue siendo la estructura activa actual.
- `company_features` no reemplaza `company_modules` todavia.
- Aun no se usa en runtime.
- No modifica servicios actuales, auth, frontend ni logica financiera.
- No ejecuta backfill ni sincronizacion automatica con `company_modules`.

## Foundation service preparado

- `backend/src/settings/settings.service.js` existe como foundation-only.
- Todavia no se usa en runtime.
- Se creo primero para preparar centralizacion futura de settings por tenant.
- El fallback futuro respetara `companies.timezone` y `companies.currency` mientras `company_settings` no sea la fuente activa.
- No modifica `company.service.js` ni cambia el comportamiento actual.

## Foundation branding service preparado

- `backend/src/branding/branding.service.js` existe como foundation-only.
- Branding todavia no se usa en runtime.
- El fallback global sera obligatorio mientras no exista branding propio por empresa.
- La estrategia future-safe multiempresa preparara branding por tenant sin reemplazar themes, layouts ni CSS actuales de forma anticipada.
- No modifica frontend runtime ni comportamiento visual actual.

## Foundation features service preparado

- `backend/src/features/features.service.js` existe como foundation-only.
- La coexistencia temporal es explicita: `company_modules` sigue activo y `company_features` queda como capa futura.
- Runtime aun NO conectado.
- La gobernanza futura de features prepara tenant flags, beta flags, environment flags, rollout gradual y premium features.
- La estrategia modular SaaS future-safe evitara reemplazos bruscos mientras conviven `company_modules` y `company_features`.

## Resultado esperado de esta fase

La base queda lista para crecimiento enterprise posterior mediante trabajo incremental, con aislamiento seguro respecto a produccion y sin impacto funcional sobre EMAUS.
