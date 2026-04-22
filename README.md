# TavernLedger

Aplicación web para crear y gestionar personajes de D&D en grupo, con seguimiento de campañas, grimorio de hechizos, bestiario, mapas interactivos y generación de trasfondos con IA.

## Stack Tecnológico

- **Next.js 16** (App Router)
- **React 19** + TypeScript
- **Tailwind CSS v4** (configuración en CSS, sin `tailwind.config.ts`)
- **Supabase** (autenticación + base de datos + storage)
- **next-themes v0.4** (modo oscuro/claro)
- **Groq** (generación de trasfondos con IA)
- **Open5e API** (bestiario y grimorio de hechizos)
- **Playwright** (tests E2E)

## Funcionalidades implementadas

### Autenticación
- Registro, login, recuperación y reset de contraseña
- Sesiones gestionadas por Supabase Auth

### Personajes
- Creación de personajes D&D 5e con ficha completa (stats, habilidades, HP, CA, rasgos, equipo, trasfondo)
- Listado y vista de detalle de personajes
- Generación de trasfondo con IA (Groq) con control de uso

### Campañas
- Creación y gestión de campañas
- Visibilidad configurable por campaña
- Asociación de personajes y mapas a campañas

### Bestiario
- Consulta de monstruos vía Open5e API
- Filtros por tipo de criatura y CR
- Paginación y vista de detalle de cada monstruo

### Grimorio
- Consulta de hechizos vía Open5e API
- Filtros por nivel, escuela y clase
- Vista de detalle de cada hechizo

### Mapas
- Subida de imágenes de mapas por campaña (Supabase Storage)
- Canvas interactivo con controles de zoom/pan
- Paleta de tokens para colocar sobre el mapa
- Gestión (crear, ver, eliminar) de mapas por campaña

### UI/UX
- Tema oscuro (por defecto) y tema claro "stone & marble"
- Tipografía medieval: Cinzel Decorative, Cinzel, Crimson Pro
- Textura grain en el fondo
- Diseño responsivo

## Estructura del proyecto

```
app/
├── auth/reset-password/
├── dashboard/
│   ├── bestiary/          # Bestiario (Open5e)
│   ├── campaigns/         # Gestión de campañas
│   ├── characters/        # Personajes D&D
│   ├── dice/              # Simulador de dados
│   ├── explore/           # Exploración
│   ├── maps/              # Mapas de campaña
│   ├── settings/          # Configuración
│   └── spellbook/         # Grimorio (Open5e)
├── login/
├── register/
└── forgot-password/

components/
├── dashboard/
│   ├── maps/              # MapCanvas, MapControls, TokenPalette, UploadMapImage
│   ├── DashboardHeader
│   ├── QuickActions
│   └── Sidebar
├── landing/               # Navbar, Hero, Features, CharacterPreview, etc.
├── ThemeProvider
└── ThemeToggle

supabase/migrations/       # Migraciones de base de datos
```

## Variables de entorno

Crea un archivo `.env.local` con:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
GROQ_API_KEY=
```

## Desarrollo

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en el navegador.

## Tests

```bash
npm test           # Playwright E2E
npm run test:ui    # Playwright con interfaz visual
```

## Base de datos

Las migraciones están en `supabase/migrations/`. Para aplicarlas localmente:

```bash
supabase db reset
```
