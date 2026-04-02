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

    const { email, password, firstName, lastName, role, schoolLevel } = await req.json()

    if (!email || !password || !role) {
      throw new Error('email, password, and role are required')
    }

    // Validate role
    const validRoles = ['admin', 'pedago', 'parent', 'student']

    if (!validRoles.includes(role)) {
      throw new Error('Invalid role. Must be admin, pedago, parent, or student')
    }

    console.log(`Admin ${requestingUser.id} is creating user with email: ${email}, role: ${role}`)

    // Create user with auto-confirm
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName || '',
        last_name: lastName || '',
        role: role,
        school_level: schoolLevel || null,
      }
    })

    if (createError) {
      console.error('Error creating user:', createError)
      throw createError
    }

    console.log(`Successfully created user: ${newUser.user.id}`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'User created successfully',
        userId: newUser.user.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in admin-create-user function:', error)
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
