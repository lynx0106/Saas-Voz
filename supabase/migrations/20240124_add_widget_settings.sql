-- Add widget_settings column to agents table
ALTER TABLE public.agents 
ADD COLUMN IF NOT EXISTS widget_settings jsonb default '{"primary_color": "#000000", "position": "bottom-right"}'::jsonb;
