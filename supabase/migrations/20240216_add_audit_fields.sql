-- ============================================================
-- MIGRACIÓN: Agregar campos de auditoría y corregir tipos
-- Fecha: 2026-02-16
-- Descripción: Agrega updated_at, deleted_at a todas las tablas
--              y corrige tipos de datos
-- ============================================================

-- ============================================================
-- 1. AGREGAR CAMPOS DE AUDITORÍA
-- ============================================================

-- Organizations
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone DEFAULT NULL;

-- Users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone DEFAULT NULL;

-- Agents
ALTER TABLE public.agents 
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone DEFAULT NULL,
ADD COLUMN IF NOT EXISTS widget_settings jsonb DEFAULT NULL;

-- Knowledge Base
ALTER TABLE public.knowledge_base 
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
ADD COLUMN IF NOT EXISTS file_name text DEFAULT NULL;

-- Customers
ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone DEFAULT NULL;

-- Calls
ALTER TABLE public.calls 
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
ADD COLUMN IF NOT EXISTS transcription text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS summary text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS sentiment text DEFAULT NULL CHECK (sentiment IN ('positive', 'negative', 'neutral'));

-- ============================================================
-- 2. CREAR ÍNDICES PARA MEJOR RENDIMIENTO
-- ============================================================

-- Índices para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_agents_organization_id ON public.agents(organization_id);
CREATE INDEX IF NOT EXISTS idx_agents_is_active ON public.agents(is_active);
CREATE INDEX IF NOT EXISTS idx_calls_organization_id ON public.calls(organization_id);
CREATE INDEX IF NOT EXISTS idx_calls_agent_id ON public.calls(agent_id);
CREATE INDEX IF NOT EXISTS idx_calls_customer_id ON public.calls(customer_id);
CREATE INDEX IF NOT EXISTS idx_calls_status ON public.calls(status);
CREATE INDEX IF NOT EXISTS idx_calls_created_at ON public.calls(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_customers_organization_id ON public.customers(organization_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_agent_id ON public.knowledge_base(agent_id);
CREATE INDEX IF NOT EXISTS idx_users_organization_id ON public.users(organization_id);

-- Índice para vector similarity search
CREATE INDEX IF NOT EXISTS idx_knowledge_base_embedding ON public.knowledge_base 
USING ivfflat (embedding_vector vector_cosine_ops)
WITH (lists = 100);

-- ============================================================
-- 3. CREAR TABLA DE AUDITORÍA (LOGS)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL CHECK (action IN ('create', 'update', 'delete', 'login', 'logout', 'export')),
  resource_type text NOT NULL,
  resource_id uuid,
  changes jsonb DEFAULT '{}'::jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS para audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own organization audit logs"
  ON public.audit_logs FOR SELECT
  USING ( organization_id IN (SELECT organization_id FROM public.users WHERE users.id = auth.uid()) );

-- Índice para audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_organization_id ON public.audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- ============================================================
-- 4. FUNCIÓN PARA ACTUALIZAR updated_at AUTOMÁTICAMENTE
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_organizations_updated_at ON public.organizations;
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_agents_updated_at ON public.agents;
CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON public.agents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_knowledge_base_updated_at ON public.knowledge_base;
CREATE TRIGGER update_knowledge_base_updated_at
  BEFORE UPDATE ON public.knowledge_base
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_customers_updated_at ON public.customers;
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_calls_updated_at ON public.calls;
CREATE TRIGGER update_calls_updated_at
  BEFORE UPDATE ON public.calls
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 5. FUNCIÓN PARA LOG DE AUDITORÍA
-- ============================================================

CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_action text,
  p_resource_type text,
  p_resource_id uuid DEFAULT NULL,
  p_changes jsonb DEFAULT '{}'::jsonb
)
RETURNS void AS $$
DECLARE
  v_org_id uuid;
  v_user_id uuid;
BEGIN
  -- Obtener user_id actual
  v_user_id := auth.uid();
  
  -- Obtener organization_id del usuario actual
  SELECT organization_id INTO v_org_id
  FROM public.users
  WHERE id = v_user_id;
  
  -- Insertar log
  INSERT INTO public.audit_logs (
    organization_id,
    user_id,
    action,
    resource_type,
    resource_id,
    changes
  ) VALUES (
    v_org_id,
    v_user_id,
    p_action,
    p_resource_type,
    p_resource_id,
    p_changes
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 6. AGREGAR POLÍTICAS RLS FALTANTES
-- ============================================================

-- Políticas para INSERT
CREATE POLICY "Users can insert agents in own organization"
  ON public.agents FOR INSERT
  WITH CHECK ( organization_id IN (SELECT organization_id FROM public.users WHERE users.id = auth.uid()) );

CREATE POLICY "Users can insert customers in own organization"
  ON public.customers FOR INSERT
  WITH CHECK ( organization_id IN (SELECT organization_id FROM public.users WHERE users.id = auth.uid()) );

CREATE POLICY "Users can insert calls in own organization"
  ON public.calls FOR INSERT
  WITH CHECK ( organization_id IN (SELECT organization_id FROM public.users WHERE users.id = auth.uid()) );

CREATE POLICY "Users can insert knowledge base for own agents"
  ON public.knowledge_base FOR INSERT
  WITH CHECK ( agent_id IN (SELECT id FROM public.agents WHERE organization_id IN (SELECT organization_id FROM public.users WHERE users.id = auth.uid())) );

-- Políticas para UPDATE
CREATE POLICY "Users can update agents in own organization"
  ON public.agents FOR UPDATE
  USING ( organization_id IN (SELECT organization_id FROM public.users WHERE users.id = auth.uid()) );

CREATE POLICY "Users can update customers in own organization"
  ON public.customers FOR UPDATE
  USING ( organization_id IN (SELECT organization_id FROM public.users WHERE users.id = auth.uid()) );

CREATE POLICY "Users can update calls in own organization"
  ON public.calls FOR UPDATE
  USING ( organization_id IN (SELECT organization_id FROM public.users WHERE users.id = auth.uid()) );

CREATE POLICY "Users can update knowledge base for own agents"
  ON public.knowledge_base FOR UPDATE
  USING ( agent_id IN (SELECT id FROM public.agents WHERE organization_id IN (SELECT organization_id FROM public.users WHERE users.id = auth.uid())) );

-- Políticas para DELETE
CREATE POLICY "Users can delete agents in own organization"
  ON public.agents FOR DELETE
  USING ( organization_id IN (SELECT organization_id FROM public.users WHERE users.id = auth.uid()) );

CREATE POLICY "Users can delete customers in own organization"
  ON public.customers FOR DELETE
  USING ( organization_id IN (SELECT organization_id FROM public.users WHERE users.id = auth.uid()) );

CREATE POLICY "Users can delete calls in own organization"
  ON public.calls FOR DELETE
  USING ( organization_id IN (SELECT organization_id FROM public.users WHERE users.id = auth.uid()) );

CREATE POLICY "Users can delete knowledge base for own agents"
  ON public.knowledge_base FOR DELETE
  USING ( agent_id IN (SELECT id FROM public.agents WHERE organization_id IN (SELECT organization_id FROM public.users WHERE users.id = auth.uid())) );

-- ============================================================
-- 7. CORREGIR TIPO DE PLAN_TYPE
-- ============================================================

ALTER TABLE public.organizations 
DROP CONSTRAINT IF EXISTS organizations_plan_type_check,
ADD CONSTRAINT organizations_plan_type_check 
CHECK (plan_type IN ('free', 'trial', 'pro', 'enterprise'));

-- ============================================================
-- 8. COMENTARIOS EN TABLAS
-- ============================================================

COMMENT ON TABLE public.organizations IS 'Organizaciones (cuentas) del sistema';
COMMENT ON TABLE public.users IS 'Usuarios vinculados a Supabase Auth';
COMMENT ON TABLE public.agents IS 'Agentes de voz configurados';
COMMENT ON TABLE public.knowledge_base IS 'Base de conocimiento para RAG con embeddings';
COMMENT ON TABLE public.customers IS 'Contactos/CRM de la organización';
COMMENT ON TABLE public.calls IS 'Registro de llamadas realizadas/recibidas';
COMMENT ON TABLE public.audit_logs IS 'Log de auditoría del sistema';
