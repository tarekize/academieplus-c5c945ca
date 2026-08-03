// Purge périodique RGPD, appelée uniquement par pg_cron (job
// "gdpr-cleanup-daily" -> public.trigger_gdpr_cleanup(), qui lit le secret
// partagé depuis Supabase Vault au lieu de le stocker en clair).
//
// Réécriture complète : la version précédente (jamais versionnée dans le
// dépôt) référençait des tables qui n'existent pas dans ce schéma
// (data_access_logs, account_deletion_requests, parental_consents au moment
// de son écriture, profiles.account_active) — chaque étape échouait
// silencieusement (erreur capturée puis renvoyée en HTTP 200), donnant une
// fausse impression de purge fonctionnelle alors qu'aucune donnée n'était
// jamais nettoyée. Cette version n'agit que sur des tables réellement
// existantes, et fait remonter un statut HTTP d'échec si une étape échoue.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Cette fonction utilise le service role (contourne la RLS) et supprime
  // des données de façon irréversible. Elle ne doit être appelable QUE par
  // le planificateur (cron), jamais par un client public.
  const cronSecret = Deno.env.get('CRON_SECRET');
  const providedSecret = req.headers.get('x-cron-secret');
  if (!cronSecret || providedSecret !== cronSecret) {
    return new Response(
      JSON.stringify({ error: 'Non autorisé.' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );

  const results = {
    timestamp: new Date().toISOString(),
    actions: [] as any[],
  };
  let hadError = false;

  // 1. Purge des logs d'activité de plus d'un an (retention conforme à la
  // politique de confidentialité).
  try {
    const { error, count } = await supabaseClient
      .from('activity_logs')
      .delete({ count: 'exact' })
      .lt('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString());
    if (error) throw error;
    results.actions.push({ action: 'delete_old_activity_logs', status: 'success', count: count ?? 0 });
  } catch (error) {
    hadError = true;
    console.error('Error deleting old activity logs:', error);
    results.actions.push({ action: 'delete_old_activity_logs', status: 'error', error: (error as Error).message });
  }

  // 2. Purge des jetons de consentement parental expirés et jamais vérifiés
  // (ne supprime PAS le compte enfant associé — décision produit à part).
  try {
    const { error, count } = await supabaseClient
      .from('parental_consents')
      .delete({ count: 'exact' })
      .eq('verified', false)
      .lt('expires_at', new Date().toISOString());
    if (error) throw error;
    results.actions.push({ action: 'delete_expired_parental_consent_tokens', status: 'success', count: count ?? 0 });
  } catch (error) {
    hadError = true;
    console.error('Error deleting expired parental consent tokens:', error);
    results.actions.push({ action: 'delete_expired_parental_consent_tokens', status: 'error', error: (error as Error).message });
  }

  // 3. Purge des messages de contact de plus de 2 ans (aucune FK vers un
  // compte, donc pas couverts par la suppression de compte).
  try {
    const { error, count } = await supabaseClient
      .from('contact_messages')
      .delete({ count: 'exact' })
      .lt('created_at', new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000).toISOString());
    if (error) throw error;
    results.actions.push({ action: 'delete_old_contact_messages', status: 'success', count: count ?? 0 });
  } catch (error) {
    hadError = true;
    console.error('Error deleting old contact messages:', error);
    results.actions.push({ action: 'delete_old_contact_messages', status: 'error', error: (error as Error).message });
  }

  console.log('GDPR cleanup completed:', results);

  return new Response(
    JSON.stringify(results, null, 2),
    {
      status: hadError ? 500 : 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
});
