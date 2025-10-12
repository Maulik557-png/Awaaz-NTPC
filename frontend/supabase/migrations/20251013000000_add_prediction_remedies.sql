-- Add prediction and remedies columns to recordings table
ALTER TABLE public.recordings ADD COLUMN prediction INTEGER;
ALTER TABLE public.recordings ADD COLUMN remedies TEXT;
