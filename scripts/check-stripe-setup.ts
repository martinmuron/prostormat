#!/usr/bin/env tsx

import 'dotenv/config'
import Stripe from 'stripe'
import {
  STRIPE_BASE_PRICE_ID,
  STRIPE_BASE_PRODUCT_ID,
  STRIPE_PRIORITY_PRICE_ID,
  STRIPE_PRIORITY_PRODUCT_ID,
  STRIPE_TOP_PRIORITY_PRICE_ID,
  STRIPE_TOP_PRIORITY_PRODUCT_ID,
} from '../src/lib/stripe-config'

const REQUIRED_SECRET = process.env.STRIPE_SECRET_KEY

if (!REQUIRED_SECRET) {
  console.error('Missing STRIPE_SECRET_KEY environment variable.')
  process.exit(1)
}

const stripe = new Stripe(REQUIRED_SECRET, { apiVersion: '2025-08-27.basil' })

type PriceExpectation = {
  label: string
  priceId: string
  productId: string
  expectedCurrency: string
  expectedInterval: 'year'
}

const EXPECTED_PRICES: PriceExpectation[] = [
  {
    label: 'Base venue subscription',
    priceId: STRIPE_BASE_PRICE_ID,
    productId: STRIPE_BASE_PRODUCT_ID,
    expectedCurrency: 'czk',
    expectedInterval: 'year',
  },
  {
    label: 'Priority add-on',
    priceId: STRIPE_PRIORITY_PRICE_ID,
    productId: STRIPE_PRIORITY_PRODUCT_ID,
    expectedCurrency: 'czk',
    expectedInterval: 'year',
  },
  {
    label: 'Top Priority add-on',
    priceId: STRIPE_TOP_PRIORITY_PRICE_ID,
    productId: STRIPE_TOP_PRIORITY_PRODUCT_ID,
    expectedCurrency: 'czk',
    expectedInterval: 'year',
  },
]

async function verifyPrice({
  label,
  priceId,
  productId,
  expectedCurrency,
  expectedInterval,
}: PriceExpectation) {
  if (!priceId) {
    throw new Error(`No price ID configured for "${label}".`)
  }

  if (!productId) {
    throw new Error(`No product ID configured for "${label}".`)
  }

  const price = await stripe.prices.retrieve(priceId)

  if (price.product !== productId) {
    throw new Error(
      `${label}: Price ${priceId} is attached to product ${price.product} instead of ${productId}`
    )
  }

  if (price.currency !== expectedCurrency) {
    throw new Error(
      `${label}: Expected currency ${expectedCurrency}, got ${price.currency}`
    )
  }

  if (!price.recurring || price.recurring.interval !== expectedInterval) {
    throw new Error(
      `${label}: Expected recurring interval "${expectedInterval}", got ${
        price.recurring?.interval ?? 'none'
      }`
    )
  }

  if (!price.active) {
    throw new Error(`${label}: Price ${priceId} is not active.`)
  }

  const product =
    typeof price.product === 'string'
      ? await stripe.products.retrieve(price.product)
      : price.product

  if (!product.active) {
    throw new Error(`${label}: Product ${productId} is not active.`)
  }

  return {
    label,
    priceId,
    productId,
    unitAmount: price.unit_amount ?? null,
    taxCode: product.tax_code ?? null,
  }
}

async function main() {
  console.log('🔍 Verifying Stripe pricing configuration...\n')

  try {
    const results = []
    for (const expectation of EXPECTED_PRICES) {
      const outcome = await verifyPrice(expectation)
      results.push(outcome)
      console.log(
        `✅ ${expectation.label} (${expectation.priceId}) – currency ${expectation.expectedCurrency.toUpperCase()}, recurring ${expectation.expectedInterval}`
      )
    }

    console.log('\nDetails:')
    for (const result of results) {
      console.log(
        `• ${result.label}: product ${result.productId}, tax code ${result.taxCode ?? 'n/a'}, amount ${
          result.unitAmount !== null ? `${result.unitAmount / 100} CZK` : 'n/a'
        }`
      )
    }

    console.log('\nAll Stripe products and prices look good! ✅')
  } catch (error) {
    console.error('\n❌ Stripe verification failed.')
    if (error instanceof Error) {
      console.error(error.message)
    } else {
      console.error(error)
    }
    process.exit(1)
  }
}

main()
