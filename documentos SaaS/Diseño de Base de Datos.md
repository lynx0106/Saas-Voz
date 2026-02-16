# 5. Diseño de Base de Datos (Schema)

## A. Organización y Acceso
* **organizations:** `id`, `name`, `plan_type`, `wallet_balance`, `billing_settings`.
* **users:** `id`, `organization_id`, `email`, `role` (Owner, Admin, Viewer).

## B. Configuración de IA (Agentes)
* **agents:** `id`, `organization_id`, `name`, `phone_number_id`, `system_prompt`, `voice_settings` (ID de voz, velocidad), `is_active`.
* **knowledge_base:** `id`, `agent_id`, `content_text`, `embedding_vector` (Para RAG).
* **phone_numbers:** `id`, `provider` (CommPeak/Telnyx), `number`, `status` (Trial, Active).

## C. CRM y Clientes
* **customers:** `id`, `organization_id`, `phone`, `name`, `email`, `reputation_score`.
* **tags:** `id`, `organization_id`, `name`, `color`.
* **customer_tags:** Tabla pivote (Relación Cliente <-> Etiqueta).
* **contact_lists:** `id`, `filename`, `upload_date`, `total_records`.

## D. Operación y Negocio
* **calls:** `id`, `agent_id`, `customer_id`, `direction` (Inbound/Outbound), `duration`, `recording_url`, `status`, `cost`.
* **call_analysis:** `id`, `call_id`, `transcript`, `sentiment`, `summary`, `success_boolean`.
* **appointments:** `id`, `customer_id`, `agent_id`, `date_time`, `status`, `external_calendar_id`.
* **campaigns:** `id`, `organization_id`, `name`, `segment_config`, `script_goal`, `status` (Running, Paused), `metrics`.