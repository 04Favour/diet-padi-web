
DROP POLICY "System can create notifications" ON public.notifications;

CREATE POLICY "Users and system can create notifications" ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'));
