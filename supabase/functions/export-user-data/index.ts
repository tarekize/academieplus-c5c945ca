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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the user from the request
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(
        JSON.stringify({ error: 'Non autorisé' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Exporting data for user:', user.id);

    // Log the data access
    await supabaseClient.rpc('log_data_access', {
      p_user_id: user.id,
      p_access_type: 'export',
      p_data_type: 'all_user_data'
    });

    // 1. Get profile data
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // 2. Get subscriptions
    const { data: subscriptions } = await supabaseClient
      .from('subscriptions')
      .select(`
        *,
        plan:subscription_plans(*)
      `)
      .eq('user_id', user.id);

    // 3. Get subscription payments
    const { data: payments } = await supabaseClient
      .from('subscription_payments')
      .select(`
        *,
        subscription:subscriptions(*)
      `)
      .in('subscription_id', subscriptions?.map(s => s.id) || []);

    // 4. Get invoices
    const { data: invoices } = await supabaseClient
      .from('invoices')
      .select('*')
      .eq('user_id', user.id);

    // 5. Get exam attempts
    const { data: examAttempts } = await supabaseClient
      .from('exam_attempts')
      .select('*')
      .eq('user_id', user.id);

    // 6. Get referral data (as referrer)
    const { data: referralsAsReferrer } = await supabaseClient
      .from('referrals')
      .select('*')
      .eq('referrer_id', user.id);

    // 7. Get referral data (as referee)
    const { data: referralsAsReferee } = await supabaseClient
      .from('referrals')
      .select('*')
      .eq('referee_id', user.id);

    // 8. Get referral codes
    const { data: referralCodes } = await supabaseClient
      .from('referral_codes')
      .select('*')
      .eq('user_id', user.id);

    // 9. Get user consents
    const { data: consents } = await supabaseClient
      .from('user_consents')
      .select('*')
      .eq('user_id', user.id);

    // 10. Get data access logs
    const { data: accessLogs } = await supabaseClient
      .from('data_access_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100);

    // 11. Get parent-children relationships
    const { data: children } = await supabaseClient
      .from('parent_children')
      .select(`
        *,
        child:profiles!parent_children_child_id_fkey(*)
      `)
      .eq('parent_id', user.id);

    // Construct the export object
    const exportData = {
      export_date: new Date().toISOString(),
      user_id: user.id,
      profile: profile,
      subscriptions: subscriptions || [],
      payments: payments || [],
      invoices: invoices || [],
      exam_attempts: examAttempts || [],
      referrals: {
        as_referrer: referralsAsReferrer || [],
        as_referee: referralsAsReferee || []
      },
      referral_codes: referralCodes || [],
      consents: consents || [],
      children: children || [],
      access_logs: accessLogs || [],
      notes: {
        fr: 'Ces données vous appartiennent conformément au RGPD. Vous pouvez les utiliser pour les transférer vers un autre service (droit à la portabilité).',
        ar: 'هذه البيانات ملك لك وفقًا للقانون العام لحماية البيانات. يمكنك استخدامها لنقلها إلى خدمة أخرى (الحق في نقل البيانات).'
      }
    };

    return new Response(
      JSON.stringify(exportData, null, 2),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="edusuccess-data-export-${user.id}-${Date.now()}.json"`
        }
      }
    );

  } catch (error: any) {
    console.error('Export error:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
