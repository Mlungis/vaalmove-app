import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

function toHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function constantTimeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

async function validSignature(payload: string, signature: string, secret: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-512' },
    false,
    ['sign'],
  );
  const digest = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return constantTimeEqual(toHex(new Uint8Array(digest)), signature.toLowerCase());
}

serve(async (request) => {
  if (request.method !== 'POST') return new Response('Method not allowed.', { status: 405 });

  try {
    const payload = await request.text();
    const signature = request.headers.get('x-paystack-signature') || '';
    const paystackSecret = Deno.env.get('PAYSTACK_SECRET_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!paystackSecret || !supabaseUrl || !serviceRoleKey) {
      console.error('Paystack webhook is not configured.');
      return new Response('Webhook is not configured.', { status: 500 });
    }
    if (!signature || !(await validSignature(payload, signature, paystackSecret))) {
      return new Response('Invalid signature.', { status: 401 });
    }

    const event = JSON.parse(payload);
    if (event.event !== 'charge.success' || typeof event.data?.reference !== 'string') {
      return Response.json({ received: true });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: attempt, error: attemptError } = await admin
      .from('payment_attempts')
      .select('reference, booking_id, user_id, amount_minor, currency, status')
      .eq('reference', event.data.reference)
      .maybeSingle();
    if (attemptError) throw attemptError;
    if (!attempt) return new Response('Payment attempt not found.', { status: 404 });
    if (attempt.status === 'success') return Response.json({ received: true });

    const verifyResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(attempt.reference)}`,
      { headers: { Authorization: `Bearer ${paystackSecret}` } },
    );
    const verification = await verifyResponse.json();
    if (!verifyResponse.ok || !verification.status) {
      throw new Error(verification.message || 'Unable to verify Paystack event.');
    }
    const transaction = verification.data;
    if (
      transaction.status !== 'success' ||
      transaction.reference !== attempt.reference ||
      transaction.amount !== attempt.amount_minor ||
      transaction.currency !== attempt.currency ||
      transaction.metadata?.booking_id !== attempt.booking_id ||
      transaction.metadata?.user_id !== attempt.user_id
    ) {
      return new Response('Payment details do not match.', { status: 400 });
    }

    const { error: confirmError } = await admin.rpc(
      'mark_booking_payment_success',
      { p_reference: attempt.reference },
    );
    if (confirmError) throw confirmError;
    return Response.json({ received: true });
  } catch (error) {
    console.error('Paystack webhook failed:', error);
    return new Response('Unable to process payment event.', { status: 500 });
  }
});
