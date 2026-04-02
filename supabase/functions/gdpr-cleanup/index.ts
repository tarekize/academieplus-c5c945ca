import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    console.log('Starting GDPR cleanup job...');

    const results = {
      timestamp: new Date().toISOString(),
      actions: [] as any[]
    };

    // 1. Supprimer les archives > 3 ans
    console.log('Deleting old archived accounts (>3 years)...');
    const { error: archiveError } = await supabaseClient.rpc('delete_old_archives');
    
    if (archiveError) {
      console.error('Error deleting old archives:', archiveError);
      results.actions.push({
        action: 'delete_old_archives',
        status: 'error',
        error: archiveError.message
      });
    } else {
      results.actions.push({
        action: 'delete_old_archives',
        status: 'success'
      });
    }

    // 2. Supprimer les logs d'accès > 1 an
    console.log('Deleting old data access logs (>1 year)...');
    const { data: deletedLogs, error: logsError } = await supabaseClient
      .from('data_access_logs')
      .delete()
      .lt('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString())
      .select('count');

    if (logsError) {
      console.error('Error deleting old logs:', logsError);
      results.actions.push({
        action: 'delete_old_logs',
        status: 'error',
        error: logsError.message
      });
    } else {
      results.actions.push({
        action: 'delete_old_logs',
        status: 'success',
        count: deletedLogs?.length || 0
      });
    }

    // 3. Désactiver les comptes inactifs > 3 ans
    console.log('Deactivating inactive accounts (>3 years)...');
    const threeYearsAgo = new Date(Date.now() - 3 * 365 * 24 * 60 * 60 * 1000).toISOString();
    
    const { data: inactiveUsers, error: inactiveError } = await supabaseClient
      .from('profiles')
      .select('id, email, updated_at')
      .eq('account_active', true)
      .lt('updated_at', threeYearsAgo);

    if (inactiveError) {
      console.error('Error finding inactive accounts:', inactiveError);
      results.actions.push({
        action: 'find_inactive_accounts',
        status: 'error',
        error: inactiveError.message
      });
    } else if (inactiveUsers && inactiveUsers.length > 0) {
      console.log(`Found ${inactiveUsers.length} inactive accounts to deactivate`);
      
      // Désactiver chaque compte inactif
      for (const user of inactiveUsers) {
        const { error: deactivateError } = await supabaseClient
          .from('profiles')
          .update({ account_active: false })
          .eq('id', user.id);

        if (deactivateError) {
          console.error(`Error deactivating account ${user.id}:`, deactivateError);
        } else {
          console.log(`Deactivated account ${user.id} (${user.email})`);
        }
      }

      results.actions.push({
        action: 'deactivate_inactive_accounts',
        status: 'success',
        count: inactiveUsers.length,
        users: inactiveUsers.map(u => ({ id: u.id, email: u.email, last_activity: u.updated_at }))
      });
    } else {
      results.actions.push({
        action: 'deactivate_inactive_accounts',
        status: 'success',
        count: 0
      });
    }

    // 4. Exécuter les demandes de suppression de compte dont la période de grâce est écoulée
    console.log('Processing account deletion requests...');
    const { data: pendingDeletions, error: deletionError } = await supabaseClient
      .from('account_deletion_requests')
      .select('*')
      .eq('executed', false)
      .eq('cancelled', false)
      .lt('scheduled_deletion_at', new Date().toISOString());

    if (deletionError) {
      console.error('Error finding pending deletions:', deletionError);
      results.actions.push({
        action: 'process_deletion_requests',
        status: 'error',
        error: deletionError.message
      });
    } else if (pendingDeletions && pendingDeletions.length > 0) {
      console.log(`Found ${pendingDeletions.length} accounts to delete`);
      
      for (const deletion of pendingDeletions) {
        try {
          // Invoke delete-user-account edge function
          const { error: deleteError } = await supabaseClient.functions.invoke('delete-user-account', {
            body: { userId: deletion.user_id }
          });

          if (deleteError) {
            console.error(`Error deleting account ${deletion.user_id}:`, deleteError);
          } else {
            // Mark deletion as executed
            await supabaseClient
              .from('account_deletion_requests')
              .update({ 
                executed: true, 
                executed_at: new Date().toISOString() 
              })
              .eq('id', deletion.id);

            console.log(`Successfully deleted account ${deletion.user_id}`);
          }
        } catch (err) {
          console.error(`Exception deleting account ${deletion.user_id}:`, err);
        }
      }

      results.actions.push({
        action: 'process_deletion_requests',
        status: 'success',
        count: pendingDeletions.length
      });
    } else {
      results.actions.push({
        action: 'process_deletion_requests',
        status: 'success',
        count: 0
      });
    }

    // 5. Supprimer les tokens de consentement parental expirés
    console.log('Deleting expired parental consent tokens...');
    const { data: expiredTokens, error: tokenError } = await supabaseClient
      .from('parental_consents')
      .delete()
      .eq('verified', false)
      .lt('expires_at', new Date().toISOString())
      .select('count');

    if (tokenError) {
      console.error('Error deleting expired tokens:', tokenError);
      results.actions.push({
        action: 'delete_expired_tokens',
        status: 'error',
        error: tokenError.message
      });
    } else {
      results.actions.push({
        action: 'delete_expired_tokens',
        status: 'success',
        count: expiredTokens?.length || 0
      });
    }

    console.log('GDPR cleanup completed:', results);

    return new Response(
      JSON.stringify(results, null, 2),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('GDPR cleanup error:', error);
    return new Response(
      JSON.stringify({ 
        error: error?.message || 'Unknown error',
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
