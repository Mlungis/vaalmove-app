import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers });
  try {
    const body = await request.json();
    const secret = Deno.env.get('PAYSTACK_SECRET_KEY');
    if (!secret) throw new Error('PAYSTACK_SECRET_KEY is not configured.');
    const auth = request.headers.get('Authorization');
    if (!auth) return new Response(JSON.stringify({ error: 'Authentication required.' }), { status: 401, headers });
    const client = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: auth } } });
    const { data: { user }, error: userError } = await client.auth.getUser();
    if (userError || !user) return new Response(JSON.stringify({ error: 'Authentication required.' }), { status: 401, headers });

    if (body.action === 'initialize') {
      if (!body.amount || !body.email || !body.bookingId || !body.callbackUrl) throw new Error('Payment details are incomplete.');
      const response = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: body.amount,
          email: user.email,
          callback_url: body.callbackUrl,
          metadata: { booking_id: body.bookingId },
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.status) throw new Error(result.message || 'Unable to start Paystack checkout.');
      return new Response(JSON.stringify(result.data), { headers });
    }

    if (body.action === 'verify') {
      if (!body.reference) throw new Error('Payment reference is missing.');
      const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(body.reference)}`, {
        headers: { Authorization: `Bearer ${secret}` },
      });
      const result = await response.json();
      if (!response.ok || !result.status) throw new Error(result.message || 'Unable to verify Paystack payment.');
      return new Response(JSON.stringify({
        paid: result.data.status === 'success',
        reference: result.data.reference,
        amount: result.data.amount,
      }), { headers });
    }

    throw new Error('Unsupported payment action.');
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || 'Payment failed.' }), { status: 400, headers });
  }
});
