import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
})

export function formatAmountForStripe(amount: number): number {
  // Amount should already be in cents from our database
  return Math.round(amount)
}

export function formatAmountFromStripe(amount: number): number {
  // Convert from cents to dollars
  return amount / 100
}
