# Arquitectura de Fondos Cooperativos

Esta linea de negocio queda separada del flujo financiero actual. Los modulos de
ingresos, egresos, dashboard empresa, autenticacion, tenant context y super admin
no dependen de las tablas de fondos.

## Modelo de empresa

`companies.business_model` define el modo principal de operacion:

- `standard`
- `cooperative_fund`
- `investment_fund`
- `rotating_capital`
- `lending_group`

Cuando una empresa usa un modelo distinto de `standard`, se activa el modulo
`cooperative_fund` en `company_modules`.

## Namespace modular

Backend:

- API: `/api/funds`
- Rutas: `backend/src/routes/fund.routes.js`
- Controlador: `backend/src/controllers/fund.controller.js`
- Servicio: `backend/src/services/fund.service.js`
- Validadores: `backend/src/validators/fund.validators.js`

Frontend:

- Paginas: `frontend/src/pages/funds`
- Servicio API: `frontend/src/services/fund.service.js`
- Rutas: `/fondos/*`

## Entidades base

- `fund_cycles`: anios, temporadas o ciclos de operacion.
- `fund_memberships`: miembros del fondo, desacoplados de participantes Emaus.
- `fund_shares`: cupos por miembro y ciclo.
- `loan_accounts`: prestamos internos.
- `installment_schedules`: cuotas de prestamos.
- `penalties`: multas, mora e intereses por atraso.
- `settlements`: cierre anual.
- `distributions`: reparto proporcional por cupos.

## Regla de frontera

Los fondos pueden convivir con ingresos y egresos tradicionales, pero la logica
de cupos, prestamos, mora, rendimientos y reparto anual debe permanecer dentro
del namespace de fondos. Si en una fase futura se registran pagos reales como
movimientos financieros, debe hacerse mediante integraciones explicitas y no
acoplando reglas de fondos al dashboard financiero existente.
