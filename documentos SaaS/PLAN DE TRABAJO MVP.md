# 📋 PLAN DE TRABAJO MVP - VOICE AI SAAS

**Fecha de Inicio:** Febrero 2026  
**Fecha Estimada de Producción:** Abril 2026 (8-10 semanas)  
**Última Actualización:** 16-Feb-2026

---

## 📊 PROGRESO GLOBAL

```
████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  22% COMPLETADO
```

| Métrica | Valor |
|---------|-------|
| **Tareas Totales** | 47 |
| **Completadas** | 10 |
| **En Progreso** | 2 |
| **Pendientes** | 35 |
| **Bloqueadas** | 0 |

---

## 🎯 FASE 1: MVP - EL NÚCLEO OPERATIVO

### 📦 Módulo 1.1: Arquitectura & Autenticación

**Progreso:** `██████████████████████░░░░░░░░░░░░░░░░░░` 70%

| ID | Tarea | Estado | Responsable | Fecha |
|----|-------|--------|-------------|-------|
| DB-01 | Configuración Inicial Supabase | ✅ Completado | - | Done |
| DB-01a | Políticas RLS para aislamiento de datos | ✅ Completado | - | Done |
| FE-01 | Landing & Login (Email/Password + Google Auth) | ✅ Completado | - | Done |
| FE-02 | Flujo de Registro Seguro | 🟡 En Progreso | - | - |
| BE-01 | Middleware de Organización | ✅ Completado | - | Done |
| DB-01b | Corregir tipos de datos (embedding_vector) | ⬜ Pendiente | - | - |
| DB-01c | Agregar campos de auditoría (updated_at, deleted_at) | ⬜ Pendiente | - | - |

**Notas:**
- Falta implementar validación de email OTP para prevención de fraude
- Los tipos de `supabase.ts` necesitan correcciones

---

### 💳 Módulo 1.2: Pagos & Suscripción (Billing)

**Progreso:** `██░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░` 5%

| ID | Tarea | Estado | Responsable | Fecha |
|----|-------|--------|-------------|-------|
| BE-02 | Integración Stripe (Suscripciones) | ⬜ Pendiente | - | - |
| BE-02a | Crear cuenta Stripe Business | ⬜ Pendiente | - | - |
| BE-02b | Webhook para activar plan "Pro" | ⬜ Pendiente | - | - |
| BE-03 | Integración Pasarela Latam (Wompi/Bold) | ⬜ Pendiente | - | - |
| BE-03a | Crear cuenta Wompi/Bold | ⬜ Pendiente | - | - |
| BE-04 | Lógica de Wallet | ⬜ Pendiente | - | - |
| BE-04a | Función para descontar saldo | ⬜ Pendiente | - | - |
| BE-04b | Función para recargar saldo | ⬜ Pendiente | - | - |
| FE-03 | Vista de Billing Dashboard | ⬜ Pendiente | - | - |

**Bloqueantes:**
- ❌ Se requiere cuenta Stripe Business
- ❌ Se requiere cuenta Wompi/Bold

---

### 🤖 Módulo 1.3: La "IA Entrevistadora" (Onboarding Core)

**Progreso:** `██████████████████████████████░░░░░░░░░░` 80%

| ID | Tarea | Estado | Responsable | Fecha |
|----|-------|--------|-------------|-------|
| BE-05 | API del Orquestador (Interview Agent) | ✅ Completado | - | Done |
| BE-06 | Parser de Configuración (Structured Output) | ✅ Completado | - | Done |
| BE-07 | Generador de System Prompt | ✅ Completado | - | Done |
| FE-04 | UI del Wizard (Chat) | ✅ Completado | - | Done |
| FE-04a | Soporte de voz en chat (Speech Recognition) | ✅ Completado | - | Done |
| FE-05 | Uploader de Archivos (PDF/Imágenes) | ⬜ Pendiente | - | - |
| BE-08 | Ingesta RAG | 🟡 En Progreso | - | - |
| BE-08a | Lectura de PDF | ⬜ Pendiente | - | - |
| BE-08b | Generación de embeddings | ✅ Completado | - | Done |
| BE-08c | Guardado en knowledge_base | ✅ Completado | - | Done |

**Notas:**
- El chat de onboarding funciona correctamente
- Falta implementar carga de archivos PDF para knowledge base

---

### 🎙️ Módulo 1.4: Infraestructura de Voz (CRÍTICO)

**Progreso:** `██████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░` 15%

| ID | Tarea | Estado | Responsable | Fecha |
|----|-------|--------|-------------|-------|
| BE-09 | Servidor WebSocket (Fastify) | ✅ Completado | - | Done |
| BE-09a | Streaming de audio bidireccional | ⬜ Pendiente | - | - |
| BE-10 | Integración Deepgram STT | ⬜ Pendiente | - | - |
| BE-10a | Obtener API Key Deepgram | ⬜ Pendiente | - | - |
| BE-10b | Conexión WebSocket para transcripción | ⬜ Pendiente | - | - |
| BE-10c | Integración Deepgram TTS | ⬜ Pendiente | - | - |
| BE-11 | Integración Groq (LLM) | ⬜ Pendiente | - | - |
| BE-11a | Obtener API Key Groq | ⬜ Pendiente | - | - |
| BE-11b | Migrar de OpenAI a Llama 3 | ⬜ Pendiente | - | - |
| BE-11c | Optimizar para latencia <100ms | ⬜ Pendiente | - | - |
| BE-12 | Integración Telefonía (CommPeak/Telnyx) | ⬜ Pendiente | - | - |
| BE-12a | Crear cuenta SIP Trunking | ⬜ Pendiente | - | - |
| BE-12b | Configurar webhook para inbound | ⬜ Pendiente | - | - |
| BE-12c | Implementar disparador outbound | ⬜ Pendiente | - | - |
| BE-12d | Prueba de latencia end-to-end <800ms | ⬜ Pendiente | - | - |

**Bloqueantes:**
- ❌ Se requiere API Key de Deepgram
- ❌ Se requiere API Key de Groq
- ❌ Se requiere cuenta de SIP Trunking

**Este es el módulo más crítico - Sin esto NO hay producto.**

---

### 📊 Módulo 1.5: Dashboard V1 & Prueba (Demo)

**Progreso:** `████████████████████░░░░░░░░░░░░░░░░░░░░` 50%

| ID | Tarea | Estado | Responsable | Fecha |
|----|-------|--------|-------------|-------|
| FE-06 | Dashboard Home (Clean State) | ✅ Completado | - | Done |
| FE-06a | Cards de estadísticas | ✅ Completado | - | Done |
| FE-06b | Lista de agentes | ✅ Completado | - | Done |
| FE-06c | Datos dinámicos (no hardcodeados) | ⬜ Pendiente | - | - |
| BE-13 | Lógica "Llamada de Prueba" | ⬜ Pendiente | - | - |
| BE-13a | Endpoint para disparar llamada | ⬜ Pendiente | - | - |
| BE-13b | Integración con módulo de voz | ⬜ Pendiente | - | - |
| BE-14 | Lógica Demo Flash (Super Admin) | ⬜ Pendiente | - | - |
| FE-07 | Página de detalle de llamada | ✅ Completado | - | Done |
| FE-08 | Página de contactos | ✅ Completado | - | Done |
| FE-09 | Página de configuración | ✅ Completado | - | Done |

---

## 🚀 FASE 2: SUITE DE NEGOCIOS (POST-MVP)

**Progreso:** `░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░` 0%

| ID | Tarea | Estado | Responsable | Fecha |
|----|-------|--------|-------------|-------|
| DB-02 | Tablas CRM (customers, tags) | ✅ Completado | - | Done |
| BE-15 | Importador Excel Inteligente | ⬜ Pendiente | - | - |
| FE-07 | Vista de Tarjetas (Card View) | ⬜ Pendiente | - | - |
| FE-08 | Ficha 360 (Sidebar) | ⬜ Pendiente | - | - |
| FE-09 | Sistema de Tags Visuales | ⬜ Pendiente | - | - |
| BE-16 | OAuth Google/Outlook | ⬜ Pendiente | - | - |
| BE-17 | Sincronización Bidireccional | ⬜ Pendiente | - | - |
| BE-18 | Function Calling (Agendar) | ⬜ Pendiente | - | - |
| DB-03 | Tablas Campañas | ⬜ Pendiente | - | - |
| BE-19 | Scheduler (Cola de Llamadas) | ⬜ Pendiente | - | - |
| BE-20 | Detector de Buzón (AMD) | ⬜ Pendiente | - | - |

---

## 💎 FASE 3: ENTERPRISE & ESCALABILIDAD

**Progreso:** `░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░` 0%

| ID | Tarea | Estado | Responsable | Fecha |
|----|-------|--------|-------------|-------|
| BE-21 | Pipeline de Análisis Post-Llamada | ⬜ Pendiente | - | - |
| FE-12 | Dashboard de Analytics | ⬜ Pendiente | - | - |
| BE-22 | Enrutador Inteligente | ⬜ Pendiente | - | - |
| FE-13 | Selector de Sede | ⬜ Pendiente | - | - |
| BE-23 | Rate Limiting | ⬜ Pendiente | - | - |
| BE-24 | Logs de Auditoría | ⬜ Pendiente | - | - |
| BE-25 | Sistema de Alertas | ⬜ Pendiente | - | - |

---

## 📅 CRONOGRAMA SEMANAL

### Semana 1-2: Infraestructura de Voz (ACTUAL)
- [ ] Obtener credenciales Deepgram
- [ ] Obtener credenciales Groq
- [ ] Implementar streaming de audio bidireccional
- [ ] Migrar LLM de OpenAI a Groq

### Semana 3-4: Telefonía SIP
- [ ] Crear cuenta SIP Trunking
- [ ] Implementar webhooks para inbound
- [ ] Implementar disparador outbound
- [ ] Pruebas de latencia

### Semana 5-6: Sistema de Pagos
- [ ] Crear cuenta Stripe
- [ ] Implementar webhooks de pago
- [ ] Lógica de Wallet
- [ ] Vista de Billing

### Semana 7-8: Pulido MVP
- [ ] Uploader de PDFs
- [ ] Datos dinámicos en Dashboard
- [ ] Llamada de prueba funcional
- [ ] Tests de integración

### Semana 9-10: Pre-Producción
- [ ] Testing exhaustivo
- [ ] Documentación
- [ ] Deployment a producción
- [ ] Monitoreo y alertas

---

## 🚨 RIESGOS Y BLOQUEANTES

| Riesgo | Impacto | Probabilidad | Mitigación |
|--------|---------|--------------|------------|
| Sin API Key Deepgram | 🔴 Crítico | Alta | Solicitar inmediatamente |
| Sin API Key Groq | 🔴 Crítico | Alta | Solicitar inmediatamente |
| Sin cuenta SIP | 🔴 Crítico | Alta | Investigar CommPeak/Telnyx |
| Sin cuenta Stripe | 🟡 Alto | Media | Solicitar cuenta business |
| Latencia >800ms | 🟡 Alto | Media | Optimizar pipeline de audio |

---

## 📝 NOTAS DE ACTUALIZACIÓN

### 16-Feb-2026
- Creación inicial del plan de trabajo
- Identificación de bloqueantes críticos (APIs de voz)
- Progreso actual estimado en 22%

---

## 🔄 CÓMO ACTUALIZAR ESTE DOCUMENTO

1. Cambiar el estado de las tareas: `⬜ Pendiente` → `🟡 En Progreso` → `✅ Completado`
2. Actualizar el progreso de cada módulo
3. Actualizar el progreso global
4. Agregar notas en la sección de actualizaciones

**Leyenda:**
- ✅ Completado
- 🟡 En Progreso
- ⬜ Pendiente
- 🔴 Bloqueado
- ❌ Cancelado
