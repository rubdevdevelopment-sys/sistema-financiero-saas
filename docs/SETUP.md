# Guia Paso a Paso

Esta guia esta escrita para que no tengas que asumir configuraciones previas.

## 1. Requisitos

Debes tener instalado en Windows:

1. `Node.js 22+`
2. `Git`
3. `VS Code`

Ya valide en tu equipo que `node`, `npm` y `git` existen.

## 2. Estructura del proyecto

Este repositorio quedara asi:

```text
frontend/   -> aplicacion React
backend/    -> API Express
docs/       -> documentacion operativa
```

## 3. Crear proyecto en Supabase

1. Entra a `https://supabase.com/dashboard`
2. Presiona `New project`
3. Organization: deja la predeterminada o crea una
4. Name: `sistema-financiero-saas`
5. Database Password: crea una clave fuerte y guardala
6. Region: usa la mas cercana a tus usuarios
7. Presiona `Create new project`
8. Espera a que finalice el aprovisionamiento

## 4. Obtener credenciales de Supabase

Cuando el proyecto este creado:

1. En el menu lateral entra a `Project Settings`
2. Presiona `API`
3. Copia:
   - `Project URL`
   - `anon public key`
4. Luego entra a `Project Settings > Database`
5. Copia la `Connection string` en formato URI

## 5. Crear variables de entorno

### Backend

1. Duplica `backend/.env.example` como `backend/.env`
2. Completa los valores reales

### Frontend

1. Duplica `frontend/.env.example` como `frontend/.env`
2. Completa los valores reales

## 6. Ejecutar SQL inicial

En Supabase:

1. Entra a `SQL Editor`
2. Presiona `New query`
3. Abre el archivo `backend/supabase/migrations/001_init_schema.sql`
4. Copia todo el contenido y pegalo en el editor
5. Presiona `Run`
6. Repite con `backend/supabase/seeds/001_seed_demo.sql`

## 7. Instalar dependencias

Abre dos terminales en la raiz del proyecto.

Terminal 1:

```powershell
cd backend
npm install
npm run dev
```

Terminal 2:

```powershell
cd frontend
npm install
npm run dev
```

## 8. Primer acceso

1. Abre `http://localhost:5173`
2. Usa:
   - correo: `superadmin@demo.local`
   - clave: `Admin123*`

## 9. GitHub

1. Crea un repositorio nuevo en GitHub con el nombre `sistema-financiero-saas`
2. No agregues README ni `.gitignore` desde GitHub
3. En la terminal, desde la raiz:

```powershell
git init
git branch -M main
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/rubdevdevelopment-sys/sistema-financiero-saas.git
git push -u origin main
```

## 10. Deploy del frontend en Vercel

1. Entra a `https://vercel.com/dashboard`
2. Presiona `Add New...`
3. Selecciona `Project`
4. Importa tu repositorio de GitHub
5. Framework: Vite
6. Root Directory: `frontend`
7. Variables:
   - `VITE_API_URL`
8. Presiona `Deploy`

## 11. Deploy del backend

### Opcion recomendada: Railway

1. Entra a `https://railway.app`
2. Presiona `New Project`
3. Selecciona `Deploy from GitHub repo`
4. Elige este repositorio
5. Root Directory: `backend`
6. Agrega variables del archivo `.env.example`
7. Configura el `Start Command`: `npm start`

### Opcion alternativa

Puedes mantener todo en Vercel, pero para Express con conexion persistente y evolucion SaaS normalmente Railway o Render es mas comodo.

## 12. Errores comunes

- `JWT_SECRET is required`
  - Falta configurar `backend/.env`
- `password authentication failed for user`
  - La URI de PostgreSQL de Supabase esta mal copiada
- `CORS blocked`
  - Falta agregar la URL del frontend en `CORS_ORIGIN`
- `relation does not exist`
  - No ejecutaste las migraciones SQL
- `Invalid credentials`
  - El seed no corrio o la clave fue cambiada
