# 4. Arquitectura Técnica

## A. Frontend (Cliente)
* **Framework:** **Next.js** (React).
* **Estilos:** Tailwind CSS + Shadcn/UI (Diseño profesional y responsivo).
* **Estado:** Zustand o React Query.
* **Comunicación:** WebSockets para el Web Voice Chat (WebRTC).

## B. Backend (Servidor)
* **Runtime:** **Node.js** con TypeScript.
* **Framework:** **Fastify** o **NestJS** (Para manejo robusto de eventos asíncronos).
* **Orquestación IA:** LangChain o Vercel AI SDK (Gestión de Function Calling y Prompts).
* **Webhooks:** Endpoints seguros para recibir eventos de telefonía y pagos.

## C. Infraestructura de Voz (El Core)
* **Streaming:** Uso de WebSockets bidireccionales para conectar Telefonía <-> IA en tiempo real.
* **Latencia:** Servidores ubicados estratégicamente (US East / South America según disponibilidad) para minimizar el delay (<500ms).

## D. Base de Datos
* **Proveedor:** **Supabase** (PostgreSQL gestionado).
* **Vector Store:** **pgvector** (Integrado en Supabase) para RAG (Búsqueda en PDFs de conocimiento).
* **Almacenamiento:** Supabase Storage para guardar grabaciones de llamadas y PDFs de usuarios.