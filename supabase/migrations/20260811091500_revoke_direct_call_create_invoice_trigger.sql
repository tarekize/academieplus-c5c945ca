-- create_invoice_for_payment() est une fonction de trigger uniquement (fires
-- sur payments AFTER INSERT/UPDATE OF status), jamais destinée à être
-- appelée directement en RPC — même pattern que les guard_* de ce projet.
REVOKE ALL ON FUNCTION public.create_invoice_for_payment() FROM PUBLIC, anon, authenticated;
