-- Fix recordings table security: Restrict SELECT to own recordings or admins
DROP POLICY IF EXISTS "Users can view all recordings" ON public.recordings;

CREATE POLICY "Users can view own recordings" 
ON public.recordings 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all recordings" 
ON public.recordings 
FOR SELECT 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'));