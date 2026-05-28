# Staging Demo Login

Credenciales demo permitidas para pruebas locales de Fitness Foundation en staging.

## Usuario recomendado

- Email: `demo@rubdev.test`
- Password: `RubDevDemo123!`
- Empresa: `rubdev-demo-company`
- Rol: `admin`

## Usuario fitness adicional

- Email: `trainer@rubdev.fit`
- Password: `DemoFitness123!`
- Empresa: `rubdev-demo-company`
- Rol real usado por el sistema: `admin`

## Alcance

- Uso permitido: pruebas locales de rutas ` /fitness/* ` contra staging.
- Entorno permitido: `backend/.env.staging`.
- Datos: demo/staging solamente.

## Notas

- No fue necesario crear un usuario nuevo porque el seed base ya contempla un usuario demo reutilizable.
- Para pruebas Fitness tambien queda permitido `trainer@rubdev.fit` como usuario demo staging.
- El sistema actual soporta `super_admin`, `admin` y `operator`; no existe un rol `trainer` utilizable en auth hoy, por eso el usuario fitness usa `admin`.
- Si el usuario no existe en staging, ejecutar el seed foundation staging para reponerlo de forma idempotente.
- Si `trainer@rubdev.fit` no existe o pierde acceso, ejecutar `backend/scripts/ensure-staging-demo-login.js`.
