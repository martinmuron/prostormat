"use client"

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentFormProps {
  venueData: any;
  onPaymentSuccess: () => void;
  onPaymentError: (error: string) => void;
}

function PaymentForm({ venueData, onPaymentSuccess, onPaymentError }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const isClaimSubmission = venueData?.mode === 'claim';

  useEffect(() => {
    // Create payment intent when component mounts
    const createPaymentIntent = async () => {
      try {
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ venueData }),
        });

        const data = await response.json();
        
        if (response.ok) {
          setClientSecret(data.clientSecret);
          setPaymentIntentId(data.paymentIntentId);
        } else {
          throw new Error(data.error);
        }
      } catch (error) {
        console.error('Error creating payment intent:', error);
        onPaymentError('Nepodařilo se připravit platbu. Zkuste to prosím znovu.');
      }
    };

    createPaymentIntent();
  }, [venueData, onPaymentError]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsProcessing(true);

    const card = elements.getElement(CardElement);
    if (!card) {
      onPaymentError('Platební formulář nebyl správně načten.');
      setIsProcessing(false);
      return;
    }

    // Confirm payment with Stripe
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card,
        billing_details: {
          name: venueData.userName,
          email: venueData.userEmail,
          phone: venueData.userPhone || undefined,
        },
      },
    });

    if (error) {
      console.error('Payment failed:', error);
      onPaymentError(error.message || 'Platba se nezdařila. Zkuste to prosím znovu.');
      setIsProcessing(false);
    } else if (paymentIntent.status === 'succeeded') {
      // Confirm with our backend
      try {
        const confirmResponse = await fetch('/api/confirm-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ paymentIntentId: paymentIntent.id }),
        });

        const confirmData = await confirmResponse.json();

        if (confirmResponse.ok) {
          onPaymentSuccess();
        } else {
          throw new Error(confirmData.error);
        }
      } catch (error) {
        console.error('Error confirming payment:', error);
        onPaymentError('Platba byla úspěšná, ale došlo k chybě při vytváření účtu. Kontaktujte nás prosím.');
      }
    }

    setIsProcessing(false);
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#000000',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        '::placeholder': {
          color: '#6b7280',
        },
      },
      invalid: {
        color: '#dc2626',
        iconColor: '#dc2626',
      },
    },
    hidePostalCode: false,
  };

  if (!clientSecret) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2 text-gray-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Připravujeme platbu...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          {isClaimSubmission ? 'Odeslat žádost o převzetí - 12,000 CZK' : 'Dokončit platbu - 12,000 CZK'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Co zahrnuje platba:</h4>
            {isClaimSubmission ? (
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✅ Potvrzení vašeho nároku na existující listing</li>
                <li>✅ Přístup ke správě po schválení administrátorem</li>
                <li>✅ Možnost upravovat fotografie, popisy a kontakty</li>
                <li>✅ Příjem rezervací přes Prostormat</li>
              </ul>
            ) : (
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✅ Vytvoření účtu a profilu prostoru</li>
                <li>✅ Zveřejnění na platformě po schválení</li>
                <li>✅ Příjem rezervací od klientů</li>
                <li>✅ Správa prostoru v administraci</li>
              </ul>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Platební údaje
              </label>
              <div className="border border-gray-300 rounded-lg p-3 bg-white">
                <CardElement options={cardElementOptions} />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Vaše platební údaje jsou chráněny SSL šifrováním
              </p>
            </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-2">Souhrn platby:</h5>
            <div className="flex justify-between text-sm">
              <span>
                {isClaimSubmission
                  ? `Žádost o převzetí "${venueData.name}"`
                  : `Přidání prostoru "${venueData.name}"`}
              </span>
              <span className="font-medium">12,000 CZK</span>
            </div>
              <div className="flex justify-between text-sm mt-1 pt-2 border-t border-gray-300">
                <span className="font-medium">Celkem k úhradě:</span>
                <span className="font-bold text-lg">12,000 CZK</span>
              </div>
            </div>

            <Button
              type="submit"
              disabled={!stripe || isProcessing}
              className="w-full h-12"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Zpracování platby...</span>
                </div>
              ) : (
                isClaimSubmission
                  ? 'Zaplatit 12,000 CZK a požádat o převzetí'
                  : 'Zaplatit 12,000 CZK a vytvořit prostor'
              )}
            </Button>
          </form>

          <div className="text-xs text-gray-500 text-center">
            <p>Platba je zabezpečena službou Stripe</p>
            <p>Po úspěšné platbě bude váš prostor předán ke schválení administrátorem</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface StripeCheckoutProps {
  venueData: any;
  onPaymentSuccess: () => void;
  onPaymentError: (error: string) => void;
}

export function StripeCheckout({ venueData, onPaymentSuccess, onPaymentError }: StripeCheckoutProps) {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm 
        venueData={venueData}
        onPaymentSuccess={onPaymentSuccess}
        onPaymentError={onPaymentError}
      />
    </Elements>
  );
}
