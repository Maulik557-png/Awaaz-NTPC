-- Fix security warning: Set search_path for all functions
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;