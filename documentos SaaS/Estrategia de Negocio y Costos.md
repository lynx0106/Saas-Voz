# 2. Estrategia de Negocio y Costos

## A. Roles de Usuario
1.  **Super Admin (Dueño de la Plataforma):**
    * Visión global del negocio (Mapa de calor de llamadas).
    * Gestión de usuarios y suspensión de servicios ("Kill switch").
    * **Herramienta de Ventas:** Generador de "Demos Flash" (Llamada inmediata a prospectos).
    * Configuración de márgenes de ganancia sobre proveedores.
2.  **Organización (Cliente):**
    * Acceso al Dashboard de gestión.
    * Puede tener múltiples agentes (Bots) y sedes bajo una misma facturación.

## B. Modelo de Monetización (Híbrido)
1.  **Suscripción SaaS (Recurrente):**
    * Cobro mensual fijo por el uso de la tecnología, el dashboard y el alquiler del número (DID).
    * Procesado vía Stripe (Internacional) o Wompi/Bold (Local Latam).
2.  **Consumo (Variable):**
    * **Prepago (Bolsas):** Compra de créditos de minutos por adelantado.
    * **Postpago (Threshold):** Cobro automático a tarjeta al alcanzar un límite de consumo (ej. cada $50 USD).

## C. Estrategia de Proveedores (Latam Focus)
* **Telefonía (SIP Trunking):**
    * Principal: **CommPeak** (Rutas directas Latam, costos bajos).
    * Secundario/Premium: **Telnyx** (Calidad global).
* **Inteligencia Artificial (Baja Latencia):**
    * Orquestación y Voz: **Deepgram Aura** (Optimizado para español latino).
    * Cerebro (LLM): **Groq (Llama 3)** para inferencia instantánea.

## D. Política de Pruebas (Trial)
Para evitar costos muertos en números telefónicos:
* **Estrategia:** "La Plataforma te llama a ti".
* **Recurso:** Uso de una línea de salida compartida propiedad de la plataforma.
* **Límites:** Configurable por Super Admin (ej. 3 minutos de voz telefónica, ilimitado en Web Widget).
* **Conversión:** Para recibir llamadas de clientes (Inbound), el usuario *debe* pagar la suscripción para obtener su propio número.