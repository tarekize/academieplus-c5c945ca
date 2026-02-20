import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
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

    // Verify the requesting user is authenticated
    const token = authHeader.replace('Bearer ', '')
    const { data: { user: requestingUser }, error: userError } = await supabaseAdmin.auth.getUser(token)
    
    if (userError || !requestingUser) {
      throw new Error('Unauthorized')
    }

    // Check if the requesting user is an admin
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', requestingUser.id)
      .eq('role', 'admin')
      .maybeSingle()

    if (roleError || !roleData) {
      console.error('User is not an admin:', requestingUser.id)
      throw new Error('Forbidden: Admin access required')
    }

    const { userId } = await req.json()

    if (!userId) {
      throw new Error('userId is required')
    }

    // Prevent admin from deleting themselves
    if (requestingUser.id === userId) {
      throw new Error('Cannot delete your own account')
    }

    console.log(`Admin ${requestingUser.id} is deleting user: ${userId}`)

    // Delete user roles first
    const { error: rolesDeleteError } = await supabaseAdmin
      .from('user_roles')
      .delete()
      .eq('user_id', userId)

    if (rolesDeleteError) {
      console.error('Error deleting user roles:', rolesDeleteError)
    }

    // Delete parent-child links
    const { error: linksDeleteError } = await supabaseAdmin
      .from('parent_child_links')
      .delete()
      .or(`parent_id.eq.${userId},child_id.eq.${userId}`)

    if (linksDeleteError) {
      console.error('Error deleting parent-child links:', linksDeleteError)
    }

    // Delete profile
    const { error: profileDeleteError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (profileDeleteError) {
      console.error('Error deleting profile:', profileDeleteError)
    }

    // Delete the user from auth using admin API
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (deleteError) {
      console.error('Error deleting user from auth:', deleteError)
      throw deleteError
    }

    console.log(`Successfully deleted user: ${userId}`)

    return new Response(
      JSON.stringify({ success: true, message: 'User deleted successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in admin-delete-user function:', error)
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
