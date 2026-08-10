import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const userClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: userError } = await userClient.auth.getUser()
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Parse and validate input
    const body = await req.json()
    const { billing_period, plan_name, is_family } = body

    if (!billing_period || !plan_name || typeof is_family !== 'boolean') {
      return new Response(JSON.stringify({ error: 'Missing required fields: billing_period, plan_name, is_family' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Use service role to validate against subscription_config and insert
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Rate limiting : évite qu'un compte crée un nombre illimité de demandes
    // de paiement en attente.
    const { data: rateLimitAllowed, error: rateLimitError } = await serviceClient.rpc('check_and_log_rate_limit', {
      p_user_id: user.id,
      p_action: 'record_payment',
      p_window_seconds: 3600,
      p_max_requests: 10,
    })
    if (rateLimitError) {
      console.error('Rate limit check failed:', rateLimitError)
    } else if (!rateLimitAllowed) {
      return new Response(JSON.stringify({ error: 'Trop de demandes. Merci de patienter.' }), {
        status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Validate plan exists in subscription_config
    const { data: config, error: configError } = await serviceClient
      .from('subscription_config')
      .select('*')
      .eq('plan_type', billing_period)
      .eq('is_active', true)
      .single()

    if (configError || !config) {
      return new Response(JSON.stringify({ error: 'Invalid or inactive plan type' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Server determines price — never trust client
    const price = is_family ? config.price_family : config.price_single
    const childrenCount = is_family ? 3 : 1

    // Get active period
    const { data: periods } = await serviceClient
      .from('subscription_periods')
      .select('id')
      .eq('is_active', true)
      .limit(1)

    const periodId = periods && periods.length > 0 ? periods[0].id : null

    // Aucune passerelle de paiement réelle (CIB/EDAHABIA/Chargily...) n'est
    // intégrée : le formulaire carte côté client est purement visuel, rien
    // n'est débité. Le paiement est enregistré 'completed' et les codes
    // d'activation émis immédiatement.
    const { data: payment, error: payErr } = await serviceClient
      .from('payments')
      .insert({
        user_id: user.id,
        amount: price,
        plan_type: billing_period,
        plan_label: plan_name,
        is_family,
        children_count: childrenCount,
        period_id: periodId,
        status: 'completed',
      })
      .select()
      .single()

    if (payErr) {
      console.error('Payment insert error:', payErr)
      return new Response(JSON.stringify({ error: 'Failed to record payment' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const codes: string[] = []
    for (let i = 0; i < Math.max(childrenCount, 1); i++) {
      const { data: code, error: codeErr } = await serviceClient.rpc('generate_activation_code')
      if (codeErr || !code) {
        console.error('Code generation error:', codeErr)
        return new Response(JSON.stringify({ error: 'Failed to generate activation code' }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      const { error: insertCodeErr } = await serviceClient
        .from('activation_codes')
        .insert({
          code,
          payment_id: payment.id,
          created_by: user.id,
          plan_type: billing_period === 'annual' ? 'annual' : 'monthly',
          is_family,
          status: 'free',
        })
      if (insertCodeErr) {
        console.error('Activation code insert error:', insertCodeErr)
        return new Response(JSON.stringify({ error: 'Failed to record activation code' }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      codes.push(code)
    }

    return new Response(JSON.stringify({
      payment_id: payment.id,
      status: 'completed',
      codes,
      message: `${codes.length} code(s) d'activation généré(s).`,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('record-payment error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
