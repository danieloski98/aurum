import { createClient } from '@/lib/supabase/client';

export interface InitializePaymentParams {
  email: string;
  amount: number; // e.g. 295.00
  currency?: string; // e.g. 'NGN', 'USD', 'GHS'
  callback_url?: string;
  metadata?: Record<string, unknown>;
  amountInSubunits?: boolean;
}

export interface InitializePaymentResponse {
  success: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
    publicKey: string;
    amount: number;
    amountInSubunits: number;
    email: string;
  };
}

/**
 * Invokes the Supabase Edge Function 'initialize-payment' to create a Paystack transaction.
 */
export async function initializePayment(
  params: InitializePaymentParams
): Promise<InitializePaymentResponse> {
  const supabase = createClient();

  const { data, error } = await supabase.functions.invoke('initialize-payment', {
    body: params,
  });

  if (error) {
    throw new Error(error.message || 'Failed to initialize payment');
  }

  return data as InitializePaymentResponse;
}
