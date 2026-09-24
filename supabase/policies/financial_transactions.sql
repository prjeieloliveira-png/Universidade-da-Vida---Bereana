-- Financial transactions policies
CREATE POLICY "financial_transactions_select" ON financial_transactions
  FOR SELECT USING (auth.role() IN ('coordinator','secretary','network_leader'));

CREATE POLICY "financial_transactions_insert" ON financial_transactions
  FOR INSERT WITH CHECK (auth.role() IN ('coordinator','secretary'));

CREATE POLICY "financial_transactions_update" ON financial_transactions
  FOR UPDATE WITH CHECK (auth.role() IN ('coordinator','secretary'));
