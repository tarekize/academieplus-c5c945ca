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

    const { userId } = await req.json()

    // Security check: users can only delete their own account
    if (user.id !== userId) {
      throw new Error('You can only delete your own account')
    }

    console.log(`Deleting account for user: ${userId}`)

    // First, get the user's profile data to archive
    const { data: profileData, error: profileError } = await supabaseClient
      .from('profiles')
      .select('first_name, full_name, email, phone, date_of_birth, school_level, role')
      .eq('id', userId)
      .single()

    if (profileError) {
      console.error('Error fetching profile:', profileError)
    }

    // Archive the account information before deletion
    if (profileData) {
      const { error: archiveError } = await supabaseClient
        .from('archived_accounts')
        .insert({
          original_user_id: userId,
          first_name: profileData.first_name,
          full_name: profileData.full_name,
          email: profileData.email,
          phone: profileData.phone,
          date_of_birth: profileData.date_of_birth,
          school_level: profileData.school_level,
          role: profileData.role,
          archived_reason: 'User deleted account'
        })

      if (archiveError) {
        console.error('Error archiving account:', archiveError)
        // Continue with deletion even if archiving fails
      } else {
        console.log(`Successfully archived account for user: ${userId}`)
      }
    }

    // Delete the user using admin API
    const { error: deleteError } = await supabaseClient.auth.admin.deleteUser(userId)

    if (deleteError) {
      console.error('Error deleting user:', deleteError)
      throw deleteError
    }

    console.log(`Successfully deleted account for user: ${userId}`)

    return new Response(
      JSON.stringify({ success: true, message: 'Account deleted successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in delete-user-account function:', error)
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
