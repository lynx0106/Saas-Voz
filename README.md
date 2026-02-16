# 🎙️ Voice AI SaaS

Plataforma No-Code para crear Agentes de Voz con Inteligencia Artificial.

## 📋 Descripción

Voice AI SaaS permite a usuarios no técnicos crear, configurar y desplegar agentes de voz IA para call centers, asistentes virtuales y automatización de llamadas.

### Características Principales

- 🤖 **Creación de Agentes** - Wizard conversacional para configurar agentes
- 🎙️ **Voz en Tiempo Real** - Streaming bidireccional con latencia <800ms
- 📚 **Base de Conocimiento** - RAG con embeddings para respuestas contextuales
- 📊 **Dashboard** - Métricas de llamadas, minutos y contactos
- 🔌 **Widget Embebible** - Chat widget para sitios web externos

## 🏗️ Arquitectura

```
voice-ai-saas/
├── apps/
│   ├── web/          # Next.js 14 (App Router) - Frontend
│   └── server/       # Fastify + WebSocket - Backend de Voz
├── packages/
│   └── types/        # Tipos TypeScript compartidos
└── supabase/         # Migraciones de base de datos
```

### Stack Tecnológico

| Componente | Tecnología |
|------------|------------|
| Frontend | Next.js 14, React, Tailwind CSS, Shadcn/UI |
| Backend | Fastify, WebSocket, Node.js |
| Base de Datos | Supabase (PostgreSQL + Auth + RLS) |
| IA/LLM | OpenAI GPT, Groq (Llama 3) |
| Voz | OpenAI TTS, Deepgram (STT/TTS) |
| Embeddings | OpenAI text-embedding-3-small |

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+
- npm o pnpm
- Cuenta de Supabase
- API Key de OpenAI

### Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/your-org/voice-ai-saas.git
   cd voice-ai-saas
   ```

2. **Instalar dependencias**
   ```bash
   # Root
   npm install
   
   # Frontend
   cd apps/web && npm install
   
   # Backend
   cd ../server && npm install
   
   # Tipos compartidos
   cd ../../packages/types && npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   # Frontend
   cp apps/web/.env.example apps/web/.env.local
   
   # Backend
   cp apps/server/.env.example apps/server/.env
   ```
   
   Edita los archivos `.env` con tus credenciales de Supabase y OpenAI.

4. **Ejecutar migraciones de base de datos**
   ```bash
   # Usando Supabase CLI
   supabase db push
   
   # O ejecuta los scripts SQL en supabase/migrations/ manualmente
   ```

5. **Iniciar los servidores**
   ```bash
   # Terminal 1 - Frontend (puerto 3000)
   cd apps/web && npm run dev
   
   # Terminal 2 - Backend de Voz (puerto 8080)
   cd apps/server && npm run dev
   ```

6. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## 📁 Estructura del Proyecto

```
apps/web/
├── app/                    # App Router de Next.js
│   ├── (dashboard)/        # Rutas protegidas del dashboard
│   ├── api/                # API Routes
│   ├── login/              # Autenticación
│   └── onboarding/         # Wizard de creación de agentes
├── components/
│   ├── ui/                 # Componentes Shadcn/UI
│   ├── dashboard/          # Componentes del dashboard
│   └── onboarding/         # Componentes del wizard
├── hooks/                  # Custom hooks
├── lib/                    # Utilidades y constantes
├── types/                  # Tipos de TypeScript
└── utils/                  # Helpers de Supabase

apps/server/
├── src/
│   ├── index.ts            # Entry point
│   └── routes/
│       └── websocket.ts    # WebSocket para streaming de voz
└── scripts/                # Scripts de utilidad
```

## 🔧 Scripts Disponibles

### Frontend (apps/web)

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run start        # Iniciar en producción
npm run lint         # Linting con ESLint
npm run type-check   # Verificación de tipos
```

### Backend (apps/server)

```bash
npm run dev          # Servidor con hot-reload
npm run build        # Compilar TypeScript
npm run start        # Producción
```

## 🔐 Autenticación y Seguridad

- **Supabase Auth** para autenticación de usuarios
- **Row Level Security (RLS)** para aislamiento de datos por organización
- **Service Role Keys** nunca expuestas al cliente
- **CORS** configurado para orígenes permitidos

## 📊 Base de Datos

### Tablas Principales

| Tabla | Descripción |
|-------|-------------|
| `organizations` | Organizaciones (tenants) |
| `users` | Usuarios del sistema |
| `agents` | Agentes de voz IA |
| `knowledge_base` | Documentos para RAG |
| `customers` | Contactos/Clientes |
| `calls` | Registro de llamadas |

### Diagrama ER

```
organizations ─┬─ users
               ├─ agents ─── knowledge_base
               ├─ customers
               └─ calls ──── agents, customers
```

## 🧪 Testing

```bash
# Ejecutar tests (cuando estén implementados)
npm run test
npm run test:e2e
```

## 📝 Roadmap

Ver [PLAN DE TRABAJO MVP.md](documentos%20SaaS/PLAN%20DE%20TRABAJO%20MVP.md) para el estado actual del desarrollo.

### Fase 1: MVP (Actual)
- [x] Autenticación
- [x] Wizard de Onboarding
- [x] Dashboard básico
- [ ] Infraestructura de voz real (Deepgram/Groq)
- [ ] Sistema de pagos

### Fase 2: Suite de Negocios
- [ ] CRM Visual
- [ ] Agendamiento
- [ ] Campañas Outbound

### Fase 3: Enterprise
- [ ] Analítica avanzada
- [ ] Multi-sede
- [ ] API externa

## 🤝 Contribuir

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia ISC.

## 📞 Soporte

- 📧 Email: soporte@voiceai-saas.com
- 📖 Documentación: [docs.voiceai-saas.com](https://docs.voiceai-saas.com)
- 🐛 Issues: [GitHub Issues](https://github.com/your-org/voice-ai-saas/issues)

---

Desarrollado con ❤️ por el equipo de Voice AI SaaS
