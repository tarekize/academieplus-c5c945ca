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

    // Insert payment with service role (server-controlled values)
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

    // Generate activation codes server-side
    const codes: string[] = []
    for (let i = 0; i < childrenCount; i++) {
      // Generate code using the DB function
      const { data: codeData } = await serviceClient.rpc('generate_activation_code')
      const code = codeData || Math.random().toString(36).substring(2, 10).toUpperCase()
      codes.push(code)

      await serviceClient.from('activation_codes').insert({
        code,
        payment_id: payment.id,
        created_by: user.id,
        plan_type: billing_period === 'annual' ? 'annual' : 'monthly',
        is_family,
        status: 'free',
      })
    }

    return new Response(JSON.stringify({ codes, payment_id: payment.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('record-payment error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
