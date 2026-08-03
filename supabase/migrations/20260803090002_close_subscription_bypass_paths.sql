DROP POLICY IF EXISTS "Authenticated can insert codes" ON public.activation_codes;
DROP POLICY IF EXISTS "Parents can insert subscriptions for their children" ON public.student_subscriptions;

-- NOT VALID : 17/35 codes existants ont payment_id NULL (génération admin
-- historique, non auditée dans le cadre de cet audit — décision produit à
-- part). La contrainte ne bloque donc que les NOUVELLES lignes à partir de
-- maintenant, sans toucher aux données existantes.
ALTER TABLE public.activation_codes
  ADD CONSTRAINT activation_codes_payment_required
  CHECK (payment_id IS NOT NULL) NOT VALID;

ALTER TABLE public.activation_codes
  ADD CONSTRAINT activation_codes_plan_type_check
  CHECK (plan_type IN ('monthly', 'annual'));

DROP POLICY IF EXISTS "Users can insert/update their own student_scores" ON public.student_scores;

CREATE POLICY "Users can insert their own student_scores"
  ON public.student_scores FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own student_scores (no delete)"
  ON public.student_scores FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
