# Foundation Design Tokens

## Objetivo

Crear la base visual tokenizada para RubDev SaaS sin reemplazar la UI activa y sin montar ningun theme globalmente.

## Estructura creada

- `frontend/src/foundation/theme/tokens/colors.js`
- `frontend/src/foundation/theme/tokens/spacing.js`
- `frontend/src/foundation/theme/tokens/radius.js`
- `frontend/src/foundation/theme/tokens/typography.js`
- `frontend/src/foundation/theme/tokens/shadows.js`
- `frontend/src/foundation/theme/tokens/transitions.js`
- `frontend/src/foundation/theme/foundation-theme.js`

## Cobertura de tokens

### Colors

- paleta primaria
- paleta neutral
- paleta accent
- semantic colors
- colores future-branding-ready

### Spacing

- escala base de spacing
- spacing de layout

### Radius

- radios desde `sm` hasta `pill`

### Typography

- familias tipograficas
- escala de tamaños
- pesos
- line heights
- text styles reutilizables

### Shadows

- sombras `sm`, `md`, `lg`, `xl`

### Transitions

- duraciones
- curvas easing
- presets interactivos

## Foundation theme

`foundation-theme.js` ensambla los tokens en un theme reusable y future-branding-ready.

El builder:

- usa una base estable
- permite override desde branding
- no requiere wiring global
- no reemplaza `ThemeProvider` actual

## Reglas de seguridad

- no global UI replacement
- no cambios agresivos en paginas financieras activas
- no activacion automatica en `main.jsx`
- no reemplazo del estilo productivo actual
- uso solo opt-in y aislado

## Sandbox

El sandbox foundation ahora muestra:

- preview de tokens
- surfaces tokenizadas
- compatibilidad con branding foundation

## Estado

- tokens creados: si
- theme foundation creado: si
- wiring global: no
- impacto en produccion: no
- EMAUS afectado: no
