import "jsr:@supabase/functions-js/edge-runtime.d.ts";

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

interface PaymentRequestPayload {
  email: string;
  amount: number | string;
  currency?: string; // Defaults to NGN or account default if not provided (e.g. 'USD', 'NGN', 'GHS')
  callback_url?: string;
  metadata?: Record<string, unknown>;
  amountInSubunits?: boolean; // Set to true if the passed amount is already in kobo/cents
}

Deno.serve(async (req: Request) => {
  // 1. Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 2. Enforce POST
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method Not Allowed. Please send a POST request.' }),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 3. Parse and validate JSON payload
    let body: PaymentRequestPayload;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON payload provided.' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { email, amount, currency, callback_url, metadata, amountInSubunits } = body;

    // Validate email
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return new Response(
        JSON.stringify({ error: 'A valid customer email address is required.' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate amount
    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return new Response(
        JSON.stringify({ error: 'A valid positive amount is required.' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Paystack requires amount in lowest currency unit (kobo for NGN, cents for USD/GHS/ZAR)
    // If amount is 50.00, lowest currency unit is 5000
    const finalAmountInSubunits = amountInSubunits
      ? Math.round(parsedAmount)
      : Math.round(parsedAmount * 100);

    // Retrieve Paystack Keys
    const paystackSecretKey =
      Deno.env.get('PAYSTACK_SECRET_KEY') ||
      'sk_test_51b7d5e4ce1e4a803a08bf081d1088d70dd04c2b';

    const paystackPublicKey =
      Deno.env.get('PAYSTACK_PUBLIC_KEY') ||
      'pk_test_cd56db52ec2df4d9b0aca8dea61cda812f5eef34';

    // 4. Call Paystack Transaction Initialize API
    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.trim(),
        amount: finalAmountInSubunits,
        ...(currency ? { currency: currency.toUpperCase() } : {}),
        ...(callback_url ? { callback_url } : {}),
        ...(metadata ? { metadata } : {}),
      }),
    });

    const paystackData = await paystackResponse.json();

    // Check Paystack status
    if (!paystackResponse.ok || !paystackData.status) {
      return new Response(
        JSON.stringify({
          error: paystackData.message || 'Paystack transaction initialization failed.',
          details: paystackData,
        }),
        {
          status: paystackResponse.status || 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 5. Send back details needed for payment
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Paystack transaction initialized successfully',
        data: {
          authorization_url: paystackData.data.authorization_url,
          access_code: paystackData.data.access_code,
          reference: paystackData.data.reference,
          publicKey: paystackPublicKey,
          amount: parsedAmount,
          amountInSubunits: finalAmountInSubunits,
          email: email.trim(),
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Internal Server Error';
    console.error('Edge Function Error:', err);
    return new Response(
      JSON.stringify({ error: errorMsg }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
