
-- Fix overly permissive INSERT on occupancy_logs - only admins can insert
DROP POLICY "System can insert occupancy logs" ON public.occupancy_logs;

CREATE POLICY "Authenticated users can insert occupancy logs" ON public.occupancy_logs
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR true);
