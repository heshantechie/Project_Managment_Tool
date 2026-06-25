import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  try {
    const payload = await req.json()
    const record = payload.record

    if (!record) {
      return new Response('No record found', { status: 400 })
    }

    // In a production app, you'd use a service like Resend, SendGrid, etc. to send an email.
    console.log('--- ADMIN NOTIFICATION ---')
    console.log(`To: bethahemanth7264@gmail.com`)
    console.log(`Subject: New Registration Request`)
    console.log(`A new user has requested access to the platform.`)
    console.log(`Name: ${record.full_name}`)
    console.log(`Email: ${record.email}`)
    console.log(`Requested At: ${record.requested_at}`)
    console.log(`Please log in to the admin dashboard to approve or reject this request.`)
    console.log('--------------------------')

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: unknown) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
