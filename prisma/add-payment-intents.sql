-- Add payment intents table for tracking Stripe payments
CREATE TABLE IF NOT EXISTS prostormat_payment_intents (
  id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  stripe_payment_intent_id VARCHAR(255) UNIQUE NOT NULL,
  amount INTEGER NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'czk',
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  venue_data TEXT NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  venue_id VARCHAR(255), -- Will be set after venue is created
  payment_completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_payment_intents_stripe_id ON prostormat_payment_intents(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_user_email ON prostormat_payment_intents(user_email);
CREATE INDEX IF NOT EXISTS idx_payment_intents_status ON prostormat_payment_intents(status);