import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    // Init Supabase client with Service Role Key to bypass RLS and create users
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // Get the JWT from the Authorization header to verify the user calling this is an admin
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    if (user.email !== 'bethahemanth7264@gmail.com') {
       throw new Error('Forbidden: Only admin can perform this action')
    }

    const { action, registrationId } = await req.json()

    // Fetch the pending registration
    const { data: registration, error: fetchError } = await supabaseAdmin
      .from('pending_registrations')
      .select('*')
      .eq('id', registrationId)
      .single()

    if (fetchError || !registration) {
      throw new Error('Registration not found')
    }

    if (registration.status !== 'pending') {
      throw new Error(`Registration is already ${registration.status}`)
    }

    if (action === 'approve') {
      // 1. Create the user
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: registration.email,
        email_confirm: true,
        user_metadata: { full_name: registration.full_name }
      })

      if (createError) throw createError

      // 2. Generate password recovery link so the user can set their password
      const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email: registration.email,
      })

      if (linkError) throw linkError

      // Here you would send an email using an email service like Resend, SendGrid, etc.
      // For now, we will log the link.
      console.log(`Approval email to send to ${registration.email}. Password setup link: ${linkData.properties?.action_link}`)

      // 3. Update status to approved
      await supabaseAdmin
        .from('pending_registrations')
        .update({ status: 'approved', approved_at: new Date().toISOString(), approved_by: user.id })
        .eq('id', registrationId)

    } else if (action === 'reject') {
      // 1. Update status to rejected
      await supabaseAdmin
        .from('pending_registrations')
        .update({ status: 'rejected', approved_at: new Date().toISOString(), approved_by: user.id })
        .eq('id', registrationId)
        
      console.log(`Rejection email to send to ${registration.email}.`)
    } else {
      throw new Error('Invalid action')
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
