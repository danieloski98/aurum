'use client';

import { useState } from 'react';
import { ProductRow } from '@/types/database';
import { initializePayment, InitializePaymentResponse } from '@/lib/paystack';
import {
  X,
  CreditCard,
  Mail,
  Loader2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  Copy,
  Check
} from 'lucide-react';

interface PaystackCheckoutModalProps {
  product: ProductRow;
  isOpen: boolean;
  onClose: () => void;
}

export default function PaystackCheckoutModal({
  product,
  isOpen,
  onClose
}: PaystackCheckoutModalProps) {
  const [email, setEmail] = useState('');
  const [currency, setCurrency] = useState<'NGN' | 'USD' | 'GHS'>('NGN');
  const [isLoading, setIsLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<InitializePaymentResponse['data'] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCopiedRef, setIsCopiedRef] = useState(false);

  if (!isOpen) return null;

  const handleInitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid customer email.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setPaymentData(null);

    try {
      const response = await initializePayment({
        email: email.trim(),
        amount: Number(product.price),
        currency,
        metadata: {
          productId: product.id,
          productName: product.name,
        }
      });

      if (response && response.data) {
        setPaymentData(response.data);
      } else {
        throw new Error('No transaction details returned from Paystack.');
      }
    } catch (err: unknown) {
      console.error('Paystack initialization error:', err);
      const msg = err instanceof Error ? err.message : 'Failed to initialize Paystack payment.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyReference = (ref: string) => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(ref);
      setIsCopiedRef(true);
      setTimeout(() => setIsCopiedRef(false), 2000);
    }
  };

  const formattedPrice = Number(product.price).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD'
  });

  return (
    <div className="paystack-modal-backdrop" onClick={onClose}>
      <div className="paystack-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button type="button" className="paystack-modal-close" onClick={onClose} title="Close">
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="paystack-modal-header">
          <div className="paystack-badge-icon">
            <CreditCard size={22} />
          </div>
          <div>
            <h2 className="paystack-modal-title">Paystack Checkout</h2>
            <p className="paystack-modal-sub">
              Initialize a secure transaction via the Supabase Edge Function.
            </p>
          </div>
        </div>

        {/* Product Summary Box */}
        <div className="paystack-product-summary">
          <div>
            <span className="summary-label">Item</span>
            <strong className="summary-title">{product.name}</strong>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className="summary-label">Amount</span>
            <strong className="summary-price">{formattedPrice}</strong>
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="feedback-banner error" style={{ margin: '1rem 0' }}>
            <AlertCircle size={18} className="feedback-icon" />
            <div className="feedback-text">
              <strong>Initialization Failed</strong>
              <p>{errorMessage}</p>
              {errorMessage.includes('Failed to send a request') && (
                <p style={{ marginTop: '0.4rem', fontSize: '0.78rem' }}>
                  Deploy the function using: <code>supabase functions deploy initialize-payment</code>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Success / Details Display */}
        {paymentData ? (
          <div className="paystack-success-box">
            <div className="success-header">
              <CheckCircle2 size={24} style={{ color: '#059669' }} />
              <div>
                <h4>Transaction Initialized</h4>
                <p>Paystack authorization session created successfully.</p>
              </div>
            </div>

            <div className="paystack-details-grid">
              <div className="detail-row">
                <span>Reference:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <code className="ref-code">{paymentData.reference}</code>
                  <button
                    type="button"
                    className="copy-btn"
                    onClick={() => handleCopyReference(paymentData.reference)}
                    title="Copy reference"
                  >
                    {isCopiedRef ? <Check size={14} style={{ color: '#059669' }} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              <div className="detail-row">
                <span>Access Code:</span>
                <code className="ref-code">{paymentData.access_code}</code>
              </div>

              <div className="detail-row">
                <span>Amount:</span>
                <strong>
                  {paymentData.amount} (subunits: {paymentData.amountInSubunits})
                </strong>
              </div>

              <div className="detail-row">
                <span>Customer Email:</span>
                <span>{paymentData.email}</span>
              </div>
            </div>

            {/* Action to proceed to Paystack */}
            <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <a
                href={paymentData.authorization_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-paystack-direct"
              >
                Proceed to Paystack Checkout <ExternalLink size={16} />
              </a>

              <button
                type="button"
                className="btn-test-another"
                onClick={() => setPaymentData(null)}
              >
                Initialize Another Transaction
              </button>
            </div>
          </div>
        ) : (
          /* Form to initiate payment */
          <form onSubmit={handleInitPayment} noValidate style={{ marginTop: '1.25rem' }}>
            {/* Customer Email */}
            <div className="field-group">
              <label className="field-label" htmlFor="customer-email">
                Customer Email <span className="required-star">*</span>
              </label>
              <div className="field-input-wrapper">
                <Mail size={18} className="field-icon-left" />
                <input
                  id="customer-email"
                  type="email"
                  className="custom-text-input"
                  placeholder="e.g. customer@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {/* Currency selector */}
            <div className="field-group">
              <label className="field-label" htmlFor="payment-currency">
                Paystack Currency
              </label>
              <select
                id="payment-currency"
                className="custom-text-input"
                style={{ paddingLeft: '1rem' }}
                value={currency}
                onChange={(e) => setCurrency(e.target.value as 'NGN' | 'USD' | 'GHS')}
                disabled={isLoading}
              >
                <option value="NGN">NGN (Nigerian Naira - Default)</option>
                <option value="USD">USD (US Dollar)</option>
                <option value="GHS">GHS (Ghanaian Cedi)</option>
              </select>
            </div>

            {/* Test Keys Notice */}
            <div className="paystack-key-notice">
              <Sparkles size={14} style={{ color: '#c2410c' }} />
              <span>Using Paystack Sandbox Test Keys</span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn-init-paystack"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Initializing with Paystack...</span>
                </>
              ) : (
                <>
                  <CreditCard size={18} />
                  <span>Initialize Transaction</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Security Footer */}
        <div className="paystack-modal-footer">
          <ShieldCheck size={14} /> End-to-end encrypted with Paystack & Supabase Edge Functions
        </div>
      </div>
    </div>
  );
}
