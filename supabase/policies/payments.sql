-- Payments policies
CREATE POLICY "payments_select" ON payments
  FOR SELECT USING (auth.role() IN ('coordinator','secretary','network_leader'));

CREATE POLICY "payments_insert" ON payments
  FOR INSERT WITH CHECK (auth.role() IN ('coordinator','secretary'));

CREATE POLICY "payments_update" ON payments
  FOR UPDATE WITH CHECK (auth.role() IN ('coordinator','secretary'));
