-- Migration: Add role column to profiles table
-- This column is required for RBAC (Role-Based Access Control)

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'
CHECK (role IN ('user', 'scanner', 'manager', 'admin', 'super_admin'));

-- Create index for faster role lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Assign super_admin to Dan Duclos (initial Super Admin setup)
UPDATE public.profiles
SET role = 'super_admin'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'danduclos777@gmail.com'
);
