# BACKLOG TÉCNICO MAESTRO: PLATAFORMA SAAS VOZ IA

## 🏁 FASE 1: MVP - EL NÚCLEO OPERATIVO
**Objetivo:** El usuario se registra, paga, la IA lo entrevista, se crea el bot y se realiza la prueba de llamada (Outbound).

### 1.1. Arquitectura & Autenticación
- [ ] **[DB-01] Configuración Inicial Supabase:** Crear proyecto, configurar tablas `users`, `organizations` y políticas RLS (Row Level Security) para aislamiento de datos.
- [ ] **[FE-01] Landing & Login:** Implementar página de login con Email/Password + Google Auth (Supabase Auth).
- [ ] **[FE-02] Flujo de Registro Seguro:** Pantalla de registro con validación de email obligatoria (OTP) para prevención de fraude.
- [ ] **[BE-01] Middleware de Organización:** Lógica post-registro para asignar automáticamente `organization_id` y crear billetera en `0`.

### 1.2. Módulo de Pagos & Suscripción (Billing)
- [ ] **[BE-02] Integración Stripe (Suscripciones):** Webhook para activar plan "Pro" tras pago exitoso.
- [ ] **[BE-03] Integración Pasarela Latam (Wompi/Bold):** Endpoint para confirmar pagos de paquetes de recarga (Bolsas de saldo).
- [ ] **[BE-04] Lógica de Wallet:** Función backend para descontar saldo de `organizations.wallet_balance`.
- [ ] **[FE-03] Vista de Billing:** Dashboard de facturación: saldo actual, historial y botón "Recargar/Suscribir".

### 1.3. La "IA Entrevistadora" (Onboarding Core)
- [ ] **[BE-05] API del Orquestador (Interview Agent):** Endpoint conectado a GPT-4o/Llama3 para entrevistar al usuario.
- [ ] **[BE-06] Parser de Configuración (Structured Output):** Sistema para extraer JSON limpio de la entrevista: `{ "business_name": "X", "goal": "Sales" }`.
- [ ] **[BE-07] Generador de System Prompt:** Script para transformar el JSON en el prompt maestro del Bot ("Eres un asistente...").
- [ ] **[FE-04] UI del Wizard (Chat):** Interfaz tipo chat (burbujas) para la entrevista. Soporte texto y voz.
- [ ] **[FE-05] Uploader de Archivos:** Componente para subir PDF/Imágenes (Menús/Precios).
- [ ] **[BE-08] Ingesta RAG:** Servicio de lectura de PDF, limpieza, generación de embeddings y guardado en `knowledge_base`.

### 1.4. Infraestructura de Voz (El Motor Realtime)
- [ ] **[BE-09] Servidor WebSocket (Fastify):** Servidor de sockets para stream de audio bidireccional.
- [ ] **[BE-10] Integración Deepgram (STT/TTS):** Conexión de socket para transcripción y síntesis de voz (<300ms).
- [ ] **[BE-11] Integración Groq (LLM):** Conexión de transcripción a Llama 3 en Groq para respuesta de texto instantánea.
- [ ] **[BE-12] Integración Telefonía (CommPeak/Telnyx):** Configuración de SIP Trunking para enviar audio al WebSocket.

### 1.5. Dashboard V1 & Prueba (Demo)
- [ ] **[FE-06] Dashboard Home (Clean State):** Vista inicial: estado del agente (On/Off) y botón "Editar".
- [ ] **[BE-13] Lógica "Llamada de Prueba":** Endpoint para disparar llamada desde número genérico al celular del usuario.
- [ ] **[BE-14] Lógica Demo Flash (Super Admin):** Panel administrativo para detonar llamadas de demostración inmediatas a prospectos.

---

## 🚀 FASE 2: SUITE DE NEGOCIOS (CRM & HERRAMIENTAS)
**Objetivo:** Retención. Gestión de contactos, citas y campañas.

### 2.1. CRM Visual (Gestión de Contactos)
- [ ] **[DB-02] Tablas CRM:** Implementación de tablas `customers`, `tags` y relaciones.
- [ ] **[BE-15] Importador Excel Inteligente:** Servicio de carga de .xlsx con limpieza de formatos de teléfono (+57) y validación.
- [ ] **[FE-07] Vista de Tarjetas (Card View):** UI para mostrar clientes como tarjetas con avatar y barra de estado.
- [ ] **[FE-08] Ficha 360 (Sidebar):** Panel lateral deslizable con historial de llamadas y notas del cliente.
- [ ] **[FE-09] Sistema de Tags Visuales:** Interfaz para gestión de etiquetas por color.

### 2.2. Agendamiento & Calendario
- [ ] **[BE-16] OAuth Google/Outlook:** Flujo de autorización para acceso a calendario externo.
- [ ] **[BE-17] Sincronización Bidireccional:** Webhook para leer disponibilidad ("Free/Busy").
- [ ] **[BE-18] Function Calling (Agendar):** Configuración de IA para ejecutar `create_appointment()` en calendario real.
- [ ] **[FE-10] Vista de Citas:** Pestaña de listado de próximas citas confirmadas.

### 2.3. Motor de Campañas (Outbound Marketing)
- [ ] **[DB-03] Tablas Campañas:** Implementación de `campaigns` y `campaign_logs`.
- [ ] **[BE-19] Scheduler (Cola de Llamadas):** Sistema (Redis/BullMQ) para encolar llamadas con límite de velocidad (Rate Limit).
- [ ] **[BE-20] Detector de Buzón (AMD):** Configuración de detección de contestadoras automáticas.
- [ ] **[FE-11] Wizard de Campaña:** UI: Segmento (Tags) -> Script -> Hora -> Lanzar.

---

## 💎 FASE 3: ENTERPRISE & ESCALABILIDAD
**Objetivo:** Grandes clientes, analítica avanzada y optimización.

### 3.1. Analítica & Inteligencia
- [ ] **[BE-21] Pipeline de Análisis Post-Llamada:** Servicio de transcripción asíncrona y extracción de Sentimiento/Resumen con LLM mini.
- [ ] **[FE-12] Dashboard de Analytics:** Gráficos de volumen, torta de sentimientos y tasa de conversión.

### 3.2. Gestión Multicentro (Franquicias)
- [ ] **[BE-22] Enrutador Inteligente:** Lógica de derivación a sub-agentes ("Para Norte marque 1").
- [ ] **[FE-13] Selector de Sede:** Filtro global de datos en Dashboard (Multitenancy lógico).

### 3.3. Optimización & Seguridad
- [ ] **[BE-23] Rate Limiting:** Protección de API contra DDoS.
- [ ] **[BE-24] Logs de Auditoría:** Registro de cambios en configuración por usuario.
- [ ] **[BE-25] Sistema de Alertas:** Emails automáticos por saldo bajo o errores críticos.

---

### 📝 Notas para el Equipo de Desarrollo
1.  **UX First:** Prioridad absoluta a la simplicidad visual en tareas Frontend. Evitar tablas de datos crudos.
2.  **Seguridad:** API Keys de proveedores (Deepgram, CommPeak) siempre ocultas en Backend.
3.  **Performance:** Latencia objetivo Voice-to-Voice: **<800ms**.