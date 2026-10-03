import { createClient } from 'npm:@supabase/supabase-js@2.45.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
}

interface EmailItem {
  name: string
  quantity: number
  price: number
}

interface EmailRequest {
  orderId: string
  email: string
  customerName: string
  items: EmailItem[]
  total: number
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  try {
    const body: EmailRequest = await req.json()

    if (!body.email || !body.orderId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, orderId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const mailgunApiKey = Deno.env.get('MAILGUN_API_KEY')
    const mailgunDomain = Deno.env.get('MAILGUN_DOMAIN')
    const mailgunFromEmail = Deno.env.get('MAILGUN_FROM_EMAIL')

    if (!mailgunApiKey || !mailgunDomain || !mailgunFromEmail) {
      return new Response(
        JSON.stringify({ error: 'Mailgun not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const orderNumber = body.orderId.slice(0, 8).toUpperCase()
    const itemsHtml = body.items
      .map(
        (item) =>
          `<tr><td style="padding:8px 0;">${item.name}</td><td style="padding:8px 0;text-align:center;">${item.quantity}</td><td style="padding:8px 0;text-align:right;">$${item.price.toFixed(2)}</td></tr>`
      )
      .join('')

    const total = body.total.toFixed(2)

    const htmlBody = `<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
  <h1 style="color:#0284c7;">Order Confirmed!</h1>
  <p>Hi ${body.customerName},</p>
  <p>Thank you for your order at Modern Shop. Your order has been received and is being processed.</p>
  <h2 style="color:#333;font-size:18px;">Order #${orderNumber}</h2>
  <table style="width:100%;border-collapse:collapse;margin:16px 0;">
    <thead>
      <tr style="border-bottom:2px solid #eee;">
        <th style="text-align:left;padding:8px 0;">Product</th>
        <th style="text-align:center;padding:8px 0;">Qty</th>
        <th style="text-align:right;padding:8px 0;">Price</th>
      </tr>
    </thead>
    <tbody>${itemsHtml}</tbody>
  </table>
  <p style="font-size:20px;font-weight:bold;text-align:right;margin-top:16px;">Total: $${total}</p>
  <p style="margin-top:24px;color:#666;">We'll notify you when your order ships.</p>
  <p style="color:#666;">Thank you for shopping with Modern Shop!</p>
</body>
</html>`

    const formData = new FormData()
    formData.append('from', mailgunFromEmail)
    formData.append('to', body.email)
    formData.append('subject', `Order Confirmation #${orderNumber} - Modern Shop`)
    formData.append('html', htmlBody)

    const mailgunResponse = await fetch(
      `https://api.mailgun.net/v3/${mailgunDomain}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${btoa(`api:${mailgunApiKey}`)}`,
        },
        body: formData,
      }
    )

    if (!mailgunResponse.ok) {
      const errorText = await mailgunResponse.text()
      return new Response(
        JSON.stringify({ error: `Mailgun API error: ${errorText}` }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const result = await mailgunResponse.json()

    return new Response(
      JSON.stringify({ success: true, messageId: result.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
