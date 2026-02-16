-- ============================================================================
-- MIGRACIONES PENDIENTES PARA SAAS AGENTES DE VOZ
-- Ejecutar este archivo completo en el SQL Editor de Supabase
-- ============================================================================

-- 1. Agregar columna file_name a knowledge_base (si no existe)
ALTER TABLE public.knowledge_base
ADD COLUMN IF NOT EXISTS file_name text;

-- 2. Agregar columna widget_settings a agents (si no existe)
ALTER TABLE public.agents 
ADD COLUMN IF NOT EXISTS widget_settings jsonb DEFAULT '{"primary_color": "#000000", "position": "bottom-right"}'::jsonb;

-- 3. Actualizar trigger para crear organización automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  new_org_id uuid;
BEGIN
  -- 1. Crear nueva organización para el usuario
  INSERT INTO public.organizations (name, plan_type, wallet_balance)
  VALUES (
    split_part(new.email, '@', 1) || '''s Org',
    'trial',
    5.00
  )
  RETURNING id INTO new_org_id;

  -- 2. Crear perfil de usuario vinculado a esa organización
  INSERT INTO public.users (id, organization_id, email, role)
  VALUES (
    new.id, 
    new_org_id, 
    new.email, 
    'owner'
  );

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Crear función para búsqueda de documentos (RAG)
CREATE OR REPLACE FUNCTION match_documents (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_agent_id uuid
)
RETURNS TABLE (
  id uuid,
  content_text text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kb.id,
    kb.content_text,
    1 - (kb.embedding_vector <=> query_embedding) AS similarity
  FROM knowledge_base kb
  WHERE 1 - (kb.embedding_vector <=> query_embedding) > match_threshold
  AND kb.agent_id = filter_agent_id
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

-- 5. POLÍTICAS RLS COMPLETAS (Insert, Update, Delete)

-- Agents: Permisos completos
DROP POLICY IF EXISTS "Users can insert organization agents" ON public.agents;
CREATE POLICY "Users can insert organization agents"
  ON public.agents FOR INSERT
  WITH CHECK ( organization_id IN (SELECT organization_id FROM public.users WHERE users.id = auth.uid()) );

DROP POLICY IF EXISTS "Users can update organization agents" ON public.agents;
CREATE POLICY "Users can update organization agents"
  ON public.agents FOR UPDATE
  USING ( organization_id IN (SELECT organization_id FROM public.users WHERE users.id = auth.uid()) );

DROP POLICY IF EXISTS "Users can delete organization agents" ON public.agents;
CREATE POLICY "Users can delete organization agents"
  ON public.agents FOR DELETE
  USING ( organization_id IN (SELECT organization_id FROM public.users WHERE users.id = auth.uid()) );

-- Knowledge Base: Permisos completos
DROP POLICY IF EXISTS "Users can insert knowledge base" ON public.knowledge_base;
CREATE POLICY "Users can insert knowledge base"
  ON public.knowledge_base FOR INSERT
  WITH CHECK ( agent_id IN (SELECT id FROM public.agents WHERE organization_id IN (SELECT organization_id FROM public.users WHERE users.id = auth.uid())) );

DROP POLICY IF EXISTS "Users can update knowledge base" ON public.knowledge_base;
CREATE POLICY "Users can update knowledge base"
  ON public.knowledge_base FOR UPDATE
  USING ( agent_id IN (SELECT id FROM public.agents WHERE organization_id IN (SELECT organization_id FROM public.users WHERE users.id = auth.uid())) );

DROP POLICY IF EXISTS "Users can delete knowledge base" ON public.knowledge_base;
CREATE POLICY "Users can delete knowledge base"
  ON public.knowledge_base FOR DELETE
  USING ( agent_id IN (SELECT id FROM public.agents WHERE organization_id IN (SELECT organization_id FROM public.users WHERE users.id = auth.uid())) );

-- Customers: Permisos completos
DROP POLICY IF EXISTS "Users can insert organization customers" ON public.customers;
CREATE POLICY "Users can insert organization customers"
  ON public.customers FOR INSERT
  WITH CHECK ( organization_id IN (SELECT organization_id FROM public.users WHERE users.id = auth.uid()) );

DROP POLICY IF EXISTS "Users can update organization customers" ON public.customers;
CREATE POLICY "Users can update organization customers"
  ON public.customers FOR UPDATE
  USING ( organization_id IN (SELECT organization_id FROM public.users WHERE users.id = auth.uid()) );

DROP POLICY IF EXISTS "Users can delete organization customers" ON public.customers;
CREATE POLICY "Users can delete organization customers"
  ON public.customers FOR DELETE
  USING ( organization_id IN (SELECT organization_id FROM public.users WHERE users.id = auth.uid()) );

-- Calls: Permisos completos
DROP POLICY IF EXISTS "Users can insert organization calls" ON public.calls;
CREATE POLICY "Users can insert organization calls"
  ON public.calls FOR INSERT
  WITH CHECK ( organization_id IN (SELECT organization_id FROM public.users WHERE users.id = auth.uid()) );

DROP POLICY IF EXISTS "Users can update organization calls" ON public.calls;
CREATE POLICY "Users can update organization calls"
  ON public.calls FOR UPDATE
  USING ( organization_id IN (SELECT organization_id FROM public.users WHERE users.id = auth.uid()) );

-- Organizations: Permisos completos
DROP POLICY IF EXISTS "Users can insert organizations" ON public.organizations;
CREATE POLICY "Users can insert organizations"
  ON public.organizations FOR INSERT
  WITH CHECK ( id IN (SELECT organization_id FROM public.users WHERE users.id = auth.uid()) );

DROP POLICY IF EXISTS "Users can update organizations" ON public.organizations;
CREATE POLICY "Users can update organizations"
  ON public.organizations FOR UPDATE
  USING ( id IN (SELECT organization_id FROM public.users WHERE users.id = auth.uid()) );

-- Users: Permisos para propio perfil
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING ( id = auth.uid() );

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================
SELECT 'Migraciones ejecutadas correctamente' AS status;
