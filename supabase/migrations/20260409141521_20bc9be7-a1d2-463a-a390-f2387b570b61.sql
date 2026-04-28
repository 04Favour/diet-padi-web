
-- Create curated_diet_plans table for super admin general plans
CREATE TABLE public.curated_diet_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_name TEXT NOT NULL,
  description TEXT,
  plan_type TEXT NOT NULL DEFAULT 'General',
  duration TEXT,
  calories TEXT,
  total_meals INTEGER,
  tags TEXT[] DEFAULT '{}',
  features TEXT[] DEFAULT '{}',
  image_url TEXT,
  created_by UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.curated_diet_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view curated plans"
  ON public.curated_diet_plans FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Super admins can manage curated plans"
  ON public.curated_diet_plans FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can insert curated plans"
  ON public.curated_diet_plans FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE TRIGGER update_curated_diet_plans_updated_at
  BEFORE UPDATE ON public.curated_diet_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create avatars storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
