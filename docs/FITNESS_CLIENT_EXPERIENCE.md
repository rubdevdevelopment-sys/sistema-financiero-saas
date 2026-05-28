# Fitness Client Experience

## Alcance

Se agrego una experiencia aislada para clientes fitness en:

- `frontend/src/fitness/pages/FitnessClientsPage.jsx`
- `frontend/src/fitness/components/clients/FitnessClientCard.jsx`
- `frontend/src/fitness/components/clients/FitnessClientProgressCard.jsx`
- `frontend/src/fitness/components/clients/FitnessClientTable.jsx`

Ruta agregada:

- `/fitness/clients`

## UX incluida

- tarjetas resumen para clientes destacados
- tarjetas de progreso demo
- tabla detallada con enfoque de entrenador
- busqueda local
- estados de carga, error y vacio
- textos visibles en espanol ES-CO

## Fuente de datos

- usa `listFitnessClients(companyId)` como fuente real
- enriquece la UI con campos demo derivados para nivel, rutina, progreso y ultima actividad
- mantiene tenant safety y fallback seguro cuando falta `companyId`
