
-- Add license_number and clinic to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS license_number text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS clinic text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';

-- Create admin_permissions table
CREATE TABLE IF NOT EXISTS public.admin_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL,
  permission text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(admin_user_id, permission)
);

ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage all permissions"
ON public.admin_permissions FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can view own permissions"
ON public.admin_permissions FOR SELECT
TO authenticated
USING (admin_user_id = auth.uid());

-- Allow admins to view all profiles (needed for super admin client/provider management)
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
