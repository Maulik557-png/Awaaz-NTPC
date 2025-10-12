-- Fix critical security issues: Restrict role visibility and equipment updates

-- 1. Fix user_roles table: Restrict role visibility to owners and admins only
DROP POLICY IF EXISTS "Users can view all roles" ON public.user_roles;

CREATE POLICY "Users can view own roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'));

-- 2. Fix equipment table: Restrict updates to owners and admins only
DROP POLICY IF EXISTS "Technicians can update equipment" ON public.equipment;

CREATE POLICY "Users can update own equipment" 
ON public.equipment 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins can update all equipment" 
ON public.equipment 
FOR UPDATE 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'));