import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

// Point d'entrée appelé par Paiement.tsx (handlePayment) quand un utilisateur
// authentifié valide un paiement (carte factice ou virement avec reçu). Ne
// fait jamais confiance au prix côté client : recalcule le montant à partir
// de `subscription_config`. Paiement par carte : activé instantanément (voir
// complete_card_payment plus bas). Paiement par virement : reste en statut
// 'pending', seul admin_approve_payment (RPC, appelé depuis AdminPaiements)
// peut le faire passer à 'completed' et émettre les codes d'activation, après
// vérification humaine du reçu.
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
    const { billing_period, plan_name, is_family, payment_method, receipt_path } = body

    if (!billing_period || !plan_name || typeof is_family !== 'boolean') {
      return new Response(JSON.stringify({ error: 'Missing required fields: billing_period, plan_name, is_family' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const paymentMethod = payment_method === 'bank_transfer' ? 'bank_transfer' : 'card'

    if (paymentMethod === 'bank_transfer') {
      if (!receipt_path || typeof receipt_path !== 'string' || !receipt_path.startsWith(`${user.id}/`)) {
        return new Response(JSON.stringify({ error: 'Le reçu de virement est manquant ou invalide.' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    // Use service role to validate against subscription_config and insert
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (paymentMethod === 'bank_transfer') {
      // Vérifie que le fichier existe réellement dans le bucket (pas juste un
      // chemin inventé côté client) avant d'enregistrer le paiement.
      const { error: receiptCheckError } = await serviceClient.storage
        .from('payment-receipts')
        .createSignedUrl(receipt_path, 60)
      if (receiptCheckError) {
        return new Response(JSON.stringify({ error: 'Le reçu de virement est introuvable. Merci de le joindre à nouveau.' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

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
    // intégrée pour l'instant : le formulaire carte côté client est purement
    // visuel, rien n'est débité. Le paiement entre donc toujours en statut
    // 'pending' à l'insertion (valeur par défaut de la colonne, cf. migration
    // payment_requires_admin_approval) — pour un virement, seul un admin qui a
    // vérifié le reçu peut le faire passer à 'completed' via admin_approve_payment.
    // Pour une carte, à la demande explicite du client (environnement de test,
    // pas de vrai paiement en jeu), on appelle immédiatement ci-dessous
    // complete_card_payment — même effet que l'approbation admin (statut
    // 'completed' + émission des codes), mais automatique. Cette fonction
    // n'est exécutable que par le service_role (jamais exposée au client), donc
    // un utilisateur authentifié ne peut pas se l'auto-accorder autrement
    // qu'en passant réellement par ce flux de paiement carte.
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
        status: 'pending',
        payment_method: paymentMethod,
        receipt_url: paymentMethod === 'bank_transfer' ? receipt_path : null,
      })
      .select()
      .single()

    if (payErr) {
      console.error('Payment insert error:', payErr)
      return new Response(JSON.stringify({ error: 'Failed to record payment' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (paymentMethod === 'card') {
      const { data: codes, error: activateErr } = await serviceClient
        .rpc('complete_card_payment', { p_payment_id: payment.id })

      if (activateErr) {
        console.error('Instant card activation error:', activateErr)
        return new Response(JSON.stringify({ error: "Le paiement a été enregistré mais l'activation a échoué. Contactez le support." }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      return new Response(JSON.stringify({
        payment_id: payment.id,
        status: 'completed',
        codes,
        message: 'Paiement validé, votre abonnement est actif.',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({
      payment_id: payment.id,
      status: 'pending',
      message: 'Paiement enregistré, en attente de validation par un administrateur.',
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
