import Stripe from 'stripe';
import { loadStripe } from '@stripe/stripe-js';
import type { Stripe as StripeJS } from '@stripe/stripe-js';
import {
  STRIPE_BASE_PRICE_ID,
  STRIPE_BASE_PRODUCT_ID,
  STRIPE_PRIORITY_PRICE_ID,
  STRIPE_PRIORITY_PRODUCT_ID,
  STRIPE_TOP_PRIORITY_PRICE_ID,
  STRIPE_TOP_PRIORITY_PRODUCT_ID,
  PRIORITY_PRICE_LEVELS,
} from '@/lib/stripe-config';

// Initialize Stripe with secret key (server-side)
export const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-08-27.basil',
    })
  : null;

// Initialize Stripe.js (client-side)
let stripePromise: Promise<StripeJS | null>;
export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY 
      ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
      : Promise.resolve(null);
  }
  return stripePromise;
};

// Stripe product and price IDs for yearly subscription
export const STRIPE_PRODUCT_ID = STRIPE_BASE_PRODUCT_ID;
export const STRIPE_PRICE_ID = STRIPE_BASE_PRICE_ID;

export const STRIPE_PRIORITY_ADDON_PRODUCT_ID = STRIPE_PRIORITY_PRODUCT_ID;
export const STRIPE_PRIORITY_ADDON_PRICE_ID = STRIPE_PRIORITY_PRICE_ID;
export const STRIPE_TOP_PRIORITY_ADDON_PRODUCT_ID = STRIPE_TOP_PRIORITY_PRODUCT_ID;
export const STRIPE_TOP_PRIORITY_ADDON_PRICE_ID = STRIPE_TOP_PRIORITY_PRICE_ID;

// Venue submission payment configuration (now subscription-based)
export const VENUE_PAYMENT_CONFIG = {
  amount: 1200000, // 12,000 CZK in haléře (Czech cents)
  currency: 'czk',
  description: 'Prostormat - Roční předplatné prostoru',
  interval: 'year' as const,
  priceId: STRIPE_PRICE_ID,
  productId: STRIPE_PRODUCT_ID,
} as const;

export default stripe;

// Helper function to check if Stripe is configured
export const isStripeConfigured = () => {
  return Boolean(
    process.env.STRIPE_SECRET_KEY &&
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY &&
    STRIPE_PRODUCT_ID &&
    STRIPE_PRICE_ID
  );
};

export function determinePriorityLevelFromPriceIds(priceIds: string[]): 1 | 2 | null {
  if (!priceIds.length) {
    return null;
  }

  let level: 1 | 2 | null = null;

  for (const priceId of priceIds) {
    const resolvedLevel = PRIORITY_PRICE_LEVELS.get(priceId);
    if (!resolvedLevel) {
      continue;
    }

    if (resolvedLevel === 1) {
      return 1;
    }

    level = level ?? resolvedLevel;
  }

  return level;
}

export function determinePriorityLevelFromSubscription(subscription: Stripe.Subscription): 1 | 2 | null {
  const priceIds = subscription.items?.data
    ?.map((item) => {
      const price = item.price as Stripe.Price | string | undefined | null;
      if (!price) return null;
      return typeof price === 'string' ? price : price.id;
    })
    .filter((value): value is string => Boolean(value)) ?? [];

  return determinePriorityLevelFromPriceIds(priceIds);
}

// Helper function to create a subscription
export const createSubscription = async (
  customerId: string,
  priceId: string,
  metadata?: Record<string, string>
) => {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    payment_settings: { save_default_payment_method: 'on_subscription' },
    expand: ['latest_invoice.payment_intent'],
    metadata: metadata || {},
  });

  return subscription;
};

// Helper function to get a subscription
export const getSubscription = async (subscriptionId: string) => {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  return subscription;
};

// Helper function to cancel a subscription
export const cancelSubscription = async (subscriptionId: string) => {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  const subscription = await stripe.subscriptions.cancel(subscriptionId);
  return subscription;
};

// Helper function to create or get a customer
export const createOrGetCustomer = async (email: string, metadata?: Record<string, string>) => {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  // First, try to find existing customer by email
  const existingCustomers = await stripe.customers.list({
    email: email,
    limit: 1,
  });

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0];
  }

  // Create new customer if not found
  const customer = await stripe.customers.create({
    email: email,
    metadata: metadata || {},
  });

  return customer;
};
