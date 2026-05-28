# Foundation UI Adoption Guide

## Objetivo

Definir como adoptar Foundation Design System v1 de manera segura, gradual y reversible sin alterar la experiencia productiva actual de RubDev SaaS.

## Zonas de adopcion

### Zonas seguras

Puede adoptarse ahora en:

- `frontend/src/foundation/dev/*`
- demos internas
- sandboxes de diseño
- nuevos modulos enterprise que aun no esten conectados al runtime productivo
- componentes nuevos que acepten foundation props de forma opt-in

### Zonas de riesgo medio

Puede evaluarse despues, con revision explicita, en:

- configuraciones internas de plataforma
- vistas administrativas no financieras
- flows super-admin no criticos
- nuevas shells UI que no reemplacen layouts actuales
- nuevas vistas de analytics que nazcan como modulo separado

Estas zonas requieren:

- comparacion visual manual
- validacion responsive
- fallback seguro
- rollback por componente

### Zonas bloqueadas

No deben migrarse todavia:

- dashboards EMAUS
- `frontend/src/pages/funds/*`
- `frontend/src/pages/participants/*`
- `frontend/src/pages/dashboard/*`
- `frontend/src/pages/public/*`
- tablas financieras activas
- componentes productivos compartidos usados por finanzas

Estas zonas siguen protegidas porque cualquier cambio visual o de formato puede alterar flujos ya operativos.

## UI migration strategy

### Fase 1

- mantener foundation en sandbox y demos
- estabilizar tokens, layouts y tablas
- evitar sustitucion de imports existentes

### Fase 2

- permitir adopcion en componentes nuevos
- introducir wrappers opt-in por vista nueva
- pasar runtime settings y branding solo por props o providers aislados

### Fase 3

- evaluar migracion de vistas administrativas no financieras
- comparar renders legacy vs foundation
- medir impacto de spacing, tipografia, tablas y formato

### Fase 4

- aprobar adopcion por pantalla
- migrar por secciones completas, no por refactors globales
- mantener rollback por commit o por componente

## Rollback strategy

Si una adopcion foundation genera problemas:

1. Revertir el componente o pantalla puntual.
2. No tocar `main` como parte del rollback.
3. No modificar tokens base si el problema es local.
4. Volver temporalmente al componente legacy solo en la vista afectada.
5. Revalidar `npm run build` despues del rollback.

## Testing strategy

Antes de cualquier adopcion fuera de sandbox, validar:

- build frontend
- render visual en desktop
- render visual en mobile
- contraste y legibilidad
- estados vacios
- estados loading
- tablas con overflow
- modal focus y cierre
- botones deshabilitados y loading
- variaciones con branding futuro
- fallback sin runtime settings

## Reglas operativas

- no reemplazo global de UI
- no wiring global en `main.jsx`
- no cambios agresivos en pantallas financieras
- no cambios en dashboards EMAUS
- no dependencia obligatoria del sandbox
- no adopcion por “search and replace”

## Future roadmap

### Dark mode foundation

- tokens oscuros
- semantic surfaces nocturnas
- contraste y accesibilidad

### Branding runtime

- branding por empresa
- semantic overrides seguros
- carga opt-in desde foundation runtime

### Tenant themes

- variaciones por tenant
- presets por vertical
- compatibilidad con configuracion futura

### Enterprise navigation

- shells con sidebar real
- top navigation enterprise
- breadcrumbs y subnavigation

### Analytics UI

- cards avanzadas
- filtros visuales
- tablas y paneles metricos

### Fitness UI foundation

- layouts y cards para fitness
- patrones visuales propios del modulo
- integracion gradual sin mezclar logica financiera existente

## Final confirmations

- no production UI replacement
- no EMAUS impact
- no global wiring
- no runtime coupling forced
- adoption remains opt-in and reversible
