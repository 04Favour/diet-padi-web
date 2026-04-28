
-- Clients table
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT,
  address TEXT,
  occupation TEXT,
  marital_status TEXT,
  condition TEXT,
  status TEXT NOT NULL DEFAULT 'Active',
  height TEXT,
  weight TEXT,
  blood_type TEXT,
  bmi NUMERIC,
  provider_id UUID NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Providers can view own clients" ON public.clients FOR SELECT TO authenticated
  USING (provider_id = auth.uid() OR public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Providers can insert own clients" ON public.clients FOR INSERT TO authenticated
  WITH CHECK (provider_id = auth.uid() OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Providers can update own clients" ON public.clients FOR UPDATE TO authenticated
  USING (provider_id = auth.uid() OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Providers can delete own clients" ON public.clients FOR DELETE TO authenticated
  USING (provider_id = auth.uid() OR public.has_role(auth.uid(), 'super_admin'));

-- Diet plans table
CREATE TABLE public.diet_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL,
  plan_name TEXT NOT NULL,
  description TEXT,
  meals JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'Pending',
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.diet_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Providers manage own diet plans" ON public.diet_plans FOR ALL TO authenticated
  USING (provider_id = auth.uid() OR public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Providers insert diet plans" ON public.diet_plans FOR INSERT TO authenticated
  WITH CHECK (provider_id = auth.uid() OR public.has_role(auth.uid(), 'super_admin'));

-- Prescriptions table
CREATE TABLE public.prescriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL,
  medication TEXT NOT NULL,
  dosage TEXT,
  instructions TEXT,
  status TEXT NOT NULL DEFAULT 'Pending Approval',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Providers manage own prescriptions" ON public.prescriptions FOR ALL TO authenticated
  USING (provider_id = auth.uid() OR public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Providers insert prescriptions" ON public.prescriptions FOR INSERT TO authenticated
  WITH CHECK (provider_id = auth.uid() OR public.has_role(auth.uid(), 'super_admin'));

-- Appointments table
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL,
  type TEXT NOT NULL,
  mode TEXT NOT NULL DEFAULT 'Virtual',
  date DATE NOT NULL,
  time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'Upcoming',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Providers manage own appointments" ON public.appointments FOR ALL TO authenticated
  USING (provider_id = auth.uid() OR public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Providers insert appointments" ON public.appointments FOR INSERT TO authenticated
  WITH CHECK (provider_id = auth.uid() OR public.has_role(auth.uid(), 'super_admin'));

-- Subscription plans table
CREATE TABLE public.subscription_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'NGN',
  billing_period TEXT NOT NULL DEFAULT 'monthly',
  features JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'Active',
  max_clients INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active plans" ON public.subscription_plans FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Super admins manage plans" ON public.subscription_plans FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins insert plans" ON public.subscription_plans FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- Messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messages" ON public.messages FOR SELECT TO authenticated
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can send messages" ON public.messages FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update own received messages" ON public.messages FOR UPDATE TO authenticated
  USING (receiver_id = auth.uid());

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT NOT NULL DEFAULT 'info',
  read BOOLEAN NOT NULL DEFAULT false,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (true);

-- Timestamp update triggers
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_diet_plans_updated_at BEFORE UPDATE ON public.diet_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON public.prescriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
