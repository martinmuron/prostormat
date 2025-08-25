import Stripe from 'stripe';
import { loadStripe } from '@stripe/stripe-js';
import type { Stripe as StripeJS } from '@stripe/stripe-js';

// Initialize Stripe with secret key (server-side)
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

// Initialize Stripe.js (client-side)
let stripePromise: Promise<StripeJS | null>;
export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
};

// Venue submission payment configuration
export const VENUE_PAYMENT_CONFIG = {
  amount: 1200000, // 12,000 CZK in haléře (Czech cents)
  currency: 'czk',
  description: 'Prostormat - Přidání prostoru na platformu',
} as const;

export default stripe;