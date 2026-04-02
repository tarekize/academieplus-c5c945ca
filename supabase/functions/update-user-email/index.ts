import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        )

        // Get the authorization header from the request
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            throw new Error('No authorization header')
        }

        // Verify the user is authenticated
        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)

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

        console.log(`Updating email for user: ${userId} to: ${newEmail}`)

        // Update the user's email using admin API (bypasses confirmation)
        const { error: updateError } = await supabaseClient.auth.admin.updateUserById(userId, {
            email: newEmail
        })

        if (updateError) {
            console.error('Error updating user email:', updateError)
            throw updateError
        }

        // Also update the email in the profiles table
        const { error: profileError } = await supabaseClient
            .from('profiles')
            .update({ email: newEmail })
            .eq('id', userId)

        if (profileError) {
            console.error('Error updating profile email:', profileError)
            throw profileError
        }

        console.log(`Successfully updated email for user: ${userId}`)

        return new Response(
            JSON.stringify({ success: true, message: 'Email updated successfully' }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )
    } catch (error) {
        console.error('Error in update-user-email function:', error)
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
        return new Response(
            JSON.stringify({ error: errorMessage }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})
