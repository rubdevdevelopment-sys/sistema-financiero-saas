# Arquitectura Base

## Objetivo

Construir una plataforma administrativa y financiera multiempresa, modular y preparada para crecer hacia SaaS completo.

## Decisiones tecnicas

- Frontend separado en React para mantener una UI moderna y escalable
- Backend separado en Express para exponer API REST reusable
- PostgreSQL en Supabase para soporte SQL robusto y escalable
- JWT propio para control explicito de autenticacion, roles y permisos
- Multiempresa desde el inicio mediante `company_id` en tablas operativas
- Arquitectura modular por dominios: auth, users, companies, incomes, expenses, dashboard

## Capas del backend

- `routes/`: define endpoints
- `controllers/`: coordina request y response
- `services/`: contiene logica de negocio y acceso a datos
- `middlewares/`: auth, roles, errores, validacion
- `validators/`: reglas con Zod
- `config/`: entorno, base de datos, logger

## Capas del frontend

- `app/`: router y shell global
- `components/`: componentes reutilizables
- `pages/`: vistas por modulo
- `context/`: estado global de autenticacion
- `services/`: cliente HTTP
- `utils/`: helpers de formato

## Multiempresa

- Cada usuario pertenece a una empresa
- Super Admin puede operar transversalmente
- Cada consulta del backend filtra por `company_id` excepto acciones globales del Super Admin
- Los modulos activables por empresa viven en `company_modules`

## Seguridad

- `helmet`
- `cors`
- `express-rate-limit`
- Hash de contrasenas con `bcryptjs`
- Validaciones con `zod`
- JWT con expiracion configurable
- Manejo centralizado de errores

## Escalabilidad futura

El esquema ya deja espacio para:

- inventario
- facturacion
- notificaciones
- app movil
- exportaciones
- auditoria avanzada
