export const STRIPE_BASE_PRODUCT_ID = process.env.STRIPE_PRODUCT_ID || ''
export const STRIPE_BASE_PRICE_ID = process.env.STRIPE_PRICE_ID || ''

export const STRIPE_PRIORITY_PRODUCT_ID =
  process.env.STRIPE_PRIORITY_PRODUCT_ID || 'prod_TIGgc7MoGQ0lp6'
export const STRIPE_PRIORITY_PRICE_ID =
  process.env.STRIPE_PRIORITY_PRICE_ID || 'price_1SLg9bEaXgrrdfIhQFAPNTpm'

export const STRIPE_TOP_PRIORITY_PRODUCT_ID =
  process.env.STRIPE_TOP_PRIORITY_PRODUCT_ID || 'prod_TIGeIuWrQ3yqV8'
export const STRIPE_TOP_PRIORITY_PRICE_ID =
  process.env.STRIPE_TOP_PRIORITY_PRICE_ID || 'price_1SLg7WEaXgrrdfIhWCceh616'

export const STRIPE_DEFAULT_TAX_CODE =
  process.env.STRIPE_DEFAULT_TAX_CODE || 'txcd_10000000'

export const PRIORITY_PRICE_LEVELS = new Map<string, 1 | 2>([
  [STRIPE_TOP_PRIORITY_PRICE_ID, 1],
  [STRIPE_PRIORITY_PRICE_ID, 2],
])
