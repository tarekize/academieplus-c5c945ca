import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const RATE_LIMIT_WINDOW_SECONDS = 60 * 60;
const RATE_LIMIT_MAX_REQUESTS = 5;

// Appelé par MesInformations.tsx / MesDonneesPersonnelles.tsx quand un
// utilisateur authentifié change sa propre adresse email. Vérifie que
// l'appelant (JWT) est bien le propriétaire du userId fourni, puis passe par
// le flux double opt-in standard de Supabase Auth (email de confirmation
// envoyé à la NOUVELLE adresse, changement effectif seulement après clic).
Deno.serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        // Get the authorization header from the request
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            throw new Error('No authorization header')
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
        const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''

        // User-scoped client (not the admin/service-role client): calling
        // auth.updateUser() through the user's own session goes through
        // Supabase's normal double opt-in email change — a confirmation
        // link is sent to the NEW address, and the change only takes effect
        // once the user clicks it. This replaces the previous admin-API
        // update, which changed the email instantly with no proof the user
        // actually controls the new address (a stolen session could
        // silently redirect the account to an attacker-owned inbox).
        const userClient = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: authHeader } },
            auth: { persistSession: false, autoRefreshToken: false },
        })

        const { data: { user }, error: userError } = await userClient.auth.getUser()
        if (userError || !user) {
            throw new Error('Unauthorized')
        }

        const { userId, newEmail } = await req.json()

        // Security check: users can only update their own email
        if (user.id !== userId) {
            throw new Error('You can only update your own email')
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(newEmail)) {
            throw new Error('Invalid email format')
        }

        // Rate limiting : sans throttle, un compte pouvait déclencher un envoi
        // illimité d'emails "confirmez votre nouvelle adresse" vers N'IMPORTE
        // QUELLE adresse email en la soumettant en boucle comme newEmail — un
        // vecteur de spam/harcèlement par email visant un tiers qui n'a même
        // pas de compte sur la plateforme.
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        const adminClient = createClient(supabaseUrl, serviceRoleKey, {
            auth: { persistSession: false, autoRefreshToken: false },
        })
        const { data: rateLimitAllowed, error: rateLimitError } = await adminClient.rpc('check_and_log_rate_limit', {
            p_user_id: user.id,
            p_action: 'update_user_email',
            p_window_seconds: RATE_LIMIT_WINDOW_SECONDS,
            p_max_requests: RATE_LIMIT_MAX_REQUESTS,
        })
        if (rateLimitError) {
            console.error('Rate limit check failed:', rateLimitError)
        } else if (!rateLimitAllowed) {
            throw new Error('Trop de demandes de changement d\'email. Merci de patienter avant de réessayer.')
        }

        console.log(`Requesting email change for user: ${userId}`)

        const { error: updateError } = await userClient.auth.updateUser({ email: newEmail })

        if (updateError) {
            console.error('Error requesting email change:', updateError)
            throw new Error("Impossible de mettre à jour l'email.")
        }

        // profiles.email is NOT updated here anymore: it stays in sync
        // automatically (via a DB trigger) only once the change is actually
        // confirmed on auth.users, not before.

        console.log(`Email change confirmation sent for user: ${userId}`)

        return new Response(
            JSON.stringify({
                success: true,
                message: 'Un email de confirmation a été envoyé à la nouvelle adresse. Le changement ne sera effectif qu\'après avoir cliqué sur le lien reçu.',
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )
    } catch (error) {
        console.error('Error in update-user-email function:', error)
        const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue.'
        return new Response(
            JSON.stringify({ error: errorMessage }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})
