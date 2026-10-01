import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function respond(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return respond({ error: 'Method not allowed.' }, 405);

  try {
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      throw new HttpError(400, 'Request body must be valid JSON.');
    }

    const authorization = request.headers.get('Authorization');
    if (!authorization) throw new HttpError(401, 'Authentication required.');

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const paystackSecret = Deno.env.get('PAYSTACK_SECRET_KEY');
    if (!supabaseUrl || !anonKey || !serviceRoleKey || !paystackSecret) {
      throw new HttpError(500, 'Payment service is not configured.');
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authorization } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) throw new HttpError(401, 'Authentication required.');

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    if (body.action === 'initialize') {
      const bookingId = typeof body.bookingId === 'string' ? body.bookingId : '';
      const callbackUrl = typeof body.callbackUrl === 'string' ? body.callbackUrl : '';
      if (!bookingId || !callbackUrl) throw new HttpError(400, 'Booking and callback details are required.');

      let callback: URL;
      try {
        callback = new URL(callbackUrl);
      } catch {
        throw new HttpError(400, 'The payment callback URL is invalid.');
      }
      if (
        callback.protocol !== 'https:' &&
        callback.protocol !== 'lexridesza:' &&
        !(callback.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(callback.hostname))
      ) {
        throw new HttpError(400, 'The payment callback URL must use a secure app or web address.');
      }

      const { data: booking, error: bookingError } = await admin
        .from('bookings')
        .select('id, renter_id, total, status, payment_status')
        .eq('id', bookingId)
        .maybeSingle();
      if (bookingError) throw bookingError;
      if (!booking || booking.renter_id !== user.id) throw new HttpError(404, 'Booking not found.');
      if (booking.status !== 'pending' || !['unpaid', 'pending'].includes(booking.payment_status)) {
        throw new HttpError(409, 'This booking is not awaiting payment.');
      }
      if (!user.email) throw new HttpError(400, 'Your account must have an email address to pay.');

      const amountMinor = Math.round(Number(booking.total) * 100);
      if (!Number.isSafeInteger(amountMinor) || amountMinor <= 0) {
        throw new HttpError(400, 'The booking amount is invalid.');
      }

      const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${paystackSecret}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amountMinor,
          currency: 'ZAR',
          email: user.email,
          callback_url: callback.toString(),
          metadata: { booking_id: booking.id, user_id: user.id },
        }),
      });
      const initialized = await paystackResponse.json();
      if (!paystackResponse.ok || !initialized.status || !initialized.data?.reference || !initialized.data?.authorization_url) {
        throw new HttpError(502, initialized.message || 'Unable to start Paystack checkout.');
      }

      const { error: paymentError } = await admin.from('payment_attempts').insert({
        reference: initialized.data.reference,
        booking_id: booking.id,
        user_id: user.id,
        amount_minor: amountMinor,
        currency: 'ZAR',
        status: 'initialized',
      });
      if (paymentError) throw paymentError;

      const { error: updateError } = await admin
        .from('bookings')
        .update({ payment_status: 'pending' })
        .eq('id', booking.id)
        .eq('renter_id', user.id)
        .eq('status', 'pending');
      if (updateError) throw updateError;

      return respond({
        authorization_url: initialized.data.authorization_url,
        reference: initialized.data.reference,
        bookingId: booking.id,
      });
    }

    if (body.action === 'verify') {
      const reference = typeof body.reference === 'string' ? body.reference.trim() : '';
      if (!reference) throw new HttpError(400, 'Payment reference is required.');

      const { data: attempt, error: attemptError } = await admin
        .from('payment_attempts')
        .select('reference, booking_id, user_id, amount_minor, currency, status')
        .eq('reference', reference)
        .maybeSingle();
      if (attemptError) throw attemptError;
      if (!attempt || attempt.user_id !== user.id) throw new HttpError(404, 'Payment attempt not found.');
      if (attempt.status === 'success') {
        return respond({ paid: true, reference, bookingId: attempt.booking_id });
      }

      const verificationResponse = await fetch(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
        { headers: { Authorization: `Bearer ${paystackSecret}` } },
      );
      const verified = await verificationResponse.json();
      if (!verificationResponse.ok || !verified.status) {
        throw new HttpError(502, verified.message || 'Unable to verify Paystack payment.');
      }

      const transaction = verified.data;
      if (transaction.status !== 'success') return respond({ paid: false, reference });
      if (
        transaction.reference !== reference ||
        transaction.amount !== attempt.amount_minor ||
        transaction.currency !== attempt.currency ||
        transaction.metadata?.booking_id !== attempt.booking_id ||
        transaction.metadata?.user_id !== user.id
      ) {
        throw new HttpError(400, 'Verified payment details do not match this booking.');
      }

      const { data: bookingId, error: confirmError } = await admin.rpc(
        'mark_booking_payment_success',
        { p_reference: reference },
      );
      if (confirmError) throw confirmError;
      return respond({ paid: true, reference, bookingId });
    }

    throw new HttpError(400, 'Unsupported payment action.');
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 500;
    const message = error instanceof Error ? error.message : 'Payment request failed.';
    if (status === 500) console.error('Paystack transaction failed:', error);
    return respond({ error: message }, status);
  }
});
