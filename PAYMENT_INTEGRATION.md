# GetGoat - Payment Integration Specification

## 1. Executive Summary

GetGoat will integrate Stripe as the primary payment processor, offering secure, PCI-compliant payment processing with support for multiple payment methods and currencies.

## 2. Payment Provider: Stripe

### 2.1 Why Stripe?
- **PCI DSS Level 1 Compliant**: Highest level of payment security
- **Developer-Friendly**: Excellent documentation and SDKs
- **Global Support**: 135+ currencies, 45+ countries
- **Payment Methods**: Cards, wallets, bank transfers, buy now pay later
- **Strong Fraud Prevention**: Radar for fraud detection
- **Webhook Support**: Real-time payment notifications
- **Transparent Pricing**: 2.9% + $0.30 per successful card charge
- **No Setup Fees**: Pay only for successful transactions

### 2.2 Alternative Considerations
- **PayPal**: Can be added as secondary option (95% of users recognize PayPal)
- **Square**: Good for in-person transactions if needed
- **Authorize.net**: Enterprise option with higher fees

## 3. Stripe Integration Architecture

### 3.1 Integration Flow

```
┌─────────────┐
│   Client    │
│  (React)    │
└──────┬──────┘
       │
       │ 1. Customer initiates checkout
       │
       ▼
┌─────────────┐
│   Stripe.js │ ← Loaded from Stripe CDN (PCI compliant)
│  Elements   │
└──────┬──────┘
       │
       │ 2. Customer enters payment info
       │    (card details never touch our server)
       │
       ▼
┌─────────────────────────────────────────┐
│         Backend API                      │
│                                          │
│  3. Create Payment Intent                │
│     POST /api/payments/create-intent     │
│     ↓                                    │
│  4. Return client_secret                 │
└────────┬─────────────────────────────────┘
         │
         │ 5. Client confirms payment with client_secret
         │
         ▼
┌─────────────┐
│   Stripe    │
│   API       │
└──────┬──────┘
       │
       │ 6. Process payment
       │ 7. Send webhook to our server
       │
       ▼
┌─────────────┐
│  Webhook    │ ← POST /api/webhooks/stripe
│  Handler    │
└──────┬──────┘
       │
       │ 8. Update order status
       │ 9. Send confirmation email
       │ 10. Notify seller
       │
       ▼
   [Complete]
```

### 3.2 Environment Setup

```bash
# .env.production
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# .env.development
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 4. Implementation Details

### 4.1 Frontend Implementation

#### Install Dependencies
```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

#### Initialize Stripe
```typescript
// lib/stripe.ts
import { loadStripe } from '@stripe/stripe-js'

export const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!
)
```

#### Checkout Component
```typescript
// components/checkout/CheckoutForm.tsx
import { useState } from 'react'
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'

export const CheckoutForm = () => {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setLoading(true)
    setError(null)

    // Confirm payment
    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
      },
    })

    if (stripeError) {
      setError(stripeError.message || 'An error occurred')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="btn-primary"
      >
        {loading ? 'Processing...' : `Pay $${total}`}
      </button>

      <div className="security-notice">
        🔒 Your payment is secure and encrypted
      </div>
    </form>
  )
}
```

#### Checkout Page
```typescript
// pages/CheckoutPage.tsx
import { Elements } from '@stripe/react-stripe-js'
import { stripePromise } from '@/lib/stripe'
import { CheckoutForm } from '@/components/checkout/CheckoutForm'
import { useEffect, useState } from 'react'

export const CheckoutPage = () => {
  const [clientSecret, setClientSecret] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Create payment intent
    fetch('/api/payments/create-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cartItems: cart.items,
        shippingAddress,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error creating payment intent:', error)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <LoadingSpinner />
  }

  if (!clientSecret) {
    return <ErrorMessage />
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#4A7C59',
        colorBackground: '#ffffff',
        colorText: '#1F2937',
        colorDanger: '#EF4444',
        fontFamily: 'Inter, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
    },
  }

  return (
    <div className="checkout-page">
      <Elements stripe={stripePromise} options={options}>
        <CheckoutForm />
      </Elements>
    </div>
  )
}
```

### 4.2 Backend Implementation

#### Install Dependencies
```bash
npm install stripe
```

#### Initialize Stripe Client
```typescript
// lib/stripe.ts
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
})
```

#### Create Payment Intent Endpoint
```typescript
// routes/payments.ts
import { Router } from 'express'
import { stripe } from '@/lib/stripe'
import { requireAuth } from '@/middleware/auth'
import { z } from 'zod'

const router = Router()

const createPaymentIntentSchema = z.object({
  cartItems: z.array(z.object({
    goatId: z.string(),
    price: z.number().positive(),
    quantity: z.number().int().positive(),
  })),
  shippingAddress: z.object({
    line1: z.string(),
    line2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    postal_code: z.string(),
    country: z.string(),
  }),
})

router.post('/create-intent', requireAuth, async (req, res) => {
  try {
    // Validate request
    const { cartItems, shippingAddress } = createPaymentIntentSchema.parse(req.body)

    // Calculate amounts
    const subtotal = cartItems.reduce((sum, item) =>
      sum + (item.price * item.quantity), 0
    )
    const tax = subtotal * 0.08 // 8% tax
    const shipping = 50 // Fixed shipping
    const total = subtotal + tax + shipping

    // Verify goats are still available
    const goatIds = cartItems.map(item => item.goatId)
    const goats = await prisma.goat.findMany({
      where: {
        id: { in: goatIds },
        status: 'AVAILABLE',
      },
    })

    if (goats.length !== cartItems.length) {
      return res.status(400).json({
        error: 'Some goats are no longer available',
      })
    }

    // Create order record (pending)
    const order = await prisma.order.create({
      data: {
        buyerId: req.user.id,
        orderNumber: generateOrderNumber(),
        status: 'PENDING',
        subtotal,
        tax,
        shipping,
        total,
        currency: 'USD',
        shippingAddress,
        items: {
          create: cartItems.map(item => ({
            goatId: item.goatId,
            price: item.price,
            quantity: item.quantity,
          })),
        },
      },
    })

    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        orderId: order.id,
        userId: req.user.id,
      },
      automatic_payment_methods: {
        enabled: true,
      },
      description: `GetGoat Order #${order.orderNumber}`,
      receipt_email: req.user.email,
    })

    // Update order with payment intent ID
    await prisma.order.update({
      where: { id: order.id },
      data: { transactionId: paymentIntent.id },
    })

    res.json({
      clientSecret: paymentIntent.client_secret,
      orderId: order.id,
    })
  } catch (error) {
    console.error('Error creating payment intent:', error)
    res.status(500).json({ error: 'Failed to create payment intent' })
  }
})

export default router
```

#### Webhook Handler
```typescript
// routes/webhooks.ts
import { Router } from 'express'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { sendOrderConfirmation } from '@/services/email'
import { notifySellerNewOrder } from '@/services/notifications'
import express from 'express'

const router = Router()

// Stripe requires raw body for signature verification
router.post(
  '/stripe',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'] as string

    let event: Stripe.Event

    try {
      // Verify webhook signature
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      )
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return res.status(400).send(`Webhook Error: ${err.message}`)
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object)
        break

      case 'charge.refunded':
        await handleRefund(event.data.object)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    res.json({ received: true })
  }
)

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata.orderId

  try {
    // Update order status
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'PAID',
        paidAt: new Date(),
      },
      include: {
        buyer: true,
        items: {
          include: {
            goat: {
              include: {
                seller: true,
              },
            },
          },
        },
      },
    })

    // Update goat statuses to SOLD
    await prisma.goat.updateMany({
      where: {
        id: {
          in: order.items.map(item => item.goatId),
        },
      },
      data: {
        status: 'SOLD',
      },
    })

    // Send confirmation email to buyer
    await sendOrderConfirmation(order)

    // Notify seller(s)
    const sellerIds = [...new Set(order.items.map(item => item.goat.sellerId))]
    for (const sellerId of sellerIds) {
      await notifySellerNewOrder(sellerId, order)
    }

    console.log(`Payment succeeded for order ${order.orderNumber}`)
  } catch (error) {
    console.error('Error handling payment success:', error)
    // Log to monitoring service (Sentry, etc.)
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata.orderId

  try {
    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'CANCELLED',
      },
    })

    console.log(`Payment failed for order ${orderId}`)
  } catch (error) {
    console.error('Error handling payment failure:', error)
  }
}

async function handleRefund(charge: Stripe.Charge) {
  const paymentIntentId = charge.payment_intent as string

  try {
    // Find order by transaction ID
    const order = await prisma.order.findFirst({
      where: { transactionId: paymentIntentId },
    })

    if (!order) {
      console.error(`Order not found for payment intent ${paymentIntentId}`)
      return
    }

    // Update order status
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'REFUNDED',
      },
    })

    // Update goat statuses back to AVAILABLE
    await prisma.goat.updateMany({
      where: {
        orderItems: {
          some: {
            orderId: order.id,
          },
        },
      },
      data: {
        status: 'AVAILABLE',
      },
    })

    console.log(`Refund processed for order ${order.orderNumber}`)
  } catch (error) {
    console.error('Error handling refund:', error)
  }
}

export default router
```

#### Helper Functions
```typescript
// utils/orderUtils.ts
export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `GT-${timestamp}-${random}`
}

export function calculateOrderTotals(items: CartItem[], shippingMethod: string) {
  const subtotal = items.reduce((sum, item) =>
    sum + (item.price * item.quantity), 0
  )

  // Tax calculation (simplified - would be more complex in production)
  const tax = subtotal * 0.08

  // Shipping calculation
  const shipping = {
    standard: 50,
    express: 100,
    overnight: 200,
  }[shippingMethod] || 50

  const total = subtotal + tax + shipping

  return { subtotal, tax, shipping, total }
}
```

## 5. Security Best Practices

### 5.1 PCI Compliance
```typescript
// ✅ CORRECT: Card details never touch our server
// Stripe.js collects payment info directly

// ❌ WRONG: Never do this
app.post('/checkout', (req, res) => {
  const { cardNumber, cvv, expiry } = req.body // NEVER!
})

// ✅ CORRECT: Use Stripe Elements
<CardElement /> // Hosted by Stripe
```

### 5.2 Webhook Security
```typescript
// Always verify webhook signatures
const event = stripe.webhooks.constructEvent(
  req.body,
  signature,
  webhookSecret
)

// Never trust webhook data without verification
```

### 5.3 Idempotency
```typescript
// Use idempotency keys to prevent duplicate charges
const paymentIntent = await stripe.paymentIntents.create(
  {
    amount: 1000,
    currency: 'usd',
  },
  {
    idempotencyKey: `order_${orderId}`,
  }
)
```

### 5.4 Amount Validation
```typescript
// Always recalculate amounts on backend
// Never trust amounts from frontend

// ❌ WRONG
const amount = req.body.amount

// ✅ CORRECT
const amount = calculateOrderTotal(orderId)
```

## 6. Error Handling

### 6.1 Payment Errors
```typescript
const errorMessages: Record<string, string> = {
  card_declined: 'Your card was declined. Please try a different card.',
  insufficient_funds: 'Your card has insufficient funds.',
  expired_card: 'Your card has expired.',
  incorrect_cvc: 'The CVC code is incorrect.',
  processing_error: 'An error occurred while processing your card.',
  rate_limit: 'Too many requests. Please try again in a moment.',
}

function getUserFriendlyError(error: Stripe.StripeError): string {
  return errorMessages[error.code] || 'An unexpected error occurred. Please try again.'
}
```

### 6.2 Retry Logic
```typescript
async function createPaymentIntentWithRetry(
  data: PaymentIntentData,
  maxRetries = 3
) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await stripe.paymentIntents.create(data)
    } catch (error) {
      if (error.code === 'rate_limit' && i < maxRetries - 1) {
        await sleep(1000 * (i + 1)) // Exponential backoff
        continue
      }
      throw error
    }
  }
}
```

## 7. Testing

### 7.1 Test Cards
```
Successful payments:
4242 4242 4242 4242 (Visa)
5555 5555 5555 4444 (Mastercard)

Declined:
4000 0000 0000 0002

Requires 3D Secure:
4000 0025 0000 3155

Insufficient funds:
4000 0000 0000 9995

CVC: Any 3 digits
Expiry: Any future date
ZIP: Any 5 digits
```

### 7.2 Test Webhooks
```bash
# Install Stripe CLI
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test events
stripe trigger payment_intent.succeeded
stripe trigger payment_intent.payment_failed
stripe trigger charge.refunded
```

### 7.3 Integration Tests
```typescript
// tests/payments.test.ts
describe('Payment Integration', () => {
  it('should create payment intent with correct amount', async () => {
    const response = await request(app)
      .post('/api/payments/create-intent')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        cartItems: [
          { goatId: 'goat-1', price: 1250, quantity: 1 }
        ],
        shippingAddress: testAddress,
      })

    expect(response.status).toBe(200)
    expect(response.body.clientSecret).toBeDefined()
  })

  it('should handle payment success webhook', async () => {
    const payload = createWebhookPayload('payment_intent.succeeded')
    const signature = createWebhookSignature(payload)

    const response = await request(app)
      .post('/api/webhooks/stripe')
      .set('stripe-signature', signature)
      .send(payload)

    expect(response.status).toBe(200)

    // Verify order was updated
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    })
    expect(order.status).toBe('PAID')
  })
})
```

## 8. Monitoring & Analytics

### 8.1 Key Metrics to Track
```typescript
const paymentMetrics = {
  // Conversion metrics
  'payment.started': counter,
  'payment.succeeded': counter,
  'payment.failed': counter,
  'payment.abandoned': counter,

  // Performance metrics
  'payment.duration': histogram,
  'webhook.processing_time': histogram,

  // Business metrics
  'payment.amount': gauge,
  'payment.fees': gauge,
  'refund.rate': gauge,

  // Error tracking
  'payment.error.card_declined': counter,
  'payment.error.insufficient_funds': counter,
  'payment.error.processing': counter,
}
```

### 8.2 Logging
```typescript
logger.info('Payment intent created', {
  orderId: order.id,
  amount: paymentIntent.amount,
  currency: paymentIntent.currency,
  userId: req.user.id,
})

logger.error('Payment failed', {
  orderId: order.id,
  error: error.code,
  message: error.message,
  userId: req.user.id,
})
```

### 8.3 Alerts
```typescript
// Set up alerts for:
- High payment failure rate (> 5%)
- Webhook processing failures
- Unusual refund rate (> 2%)
- Payment processing time > 3s
- API errors from Stripe
```

## 9. Additional Payment Features

### 9.1 Saved Payment Methods
```typescript
// Save card for future use
const customer = await stripe.customers.create({
  email: user.email,
  metadata: { userId: user.id },
})

const paymentMethod = await stripe.paymentMethods.attach(
  paymentMethodId,
  { customer: customer.id }
)

// Set as default
await stripe.customers.update(customer.id, {
  invoice_settings: {
    default_payment_method: paymentMethod.id,
  },
})
```

### 9.2 Refunds
```typescript
// Full refund
const refund = await stripe.refunds.create({
  payment_intent: paymentIntentId,
  reason: 'requested_by_customer',
})

// Partial refund
const refund = await stripe.refunds.create({
  payment_intent: paymentIntentId,
  amount: 500, // cents
  reason: 'requested_by_customer',
})
```

### 9.3 Subscriptions (Future)
```typescript
// For premium seller memberships
const subscription = await stripe.subscriptions.create({
  customer: customerId,
  items: [{ price: 'price_premium_monthly' }],
})
```

### 9.4 Connect (Marketplace Payments)
```typescript
// For direct payments to sellers (future feature)
const transfer = await stripe.transfers.create({
  amount: 1000,
  currency: 'usd',
  destination: sellerStripeAccountId,
})

// Or using application fees
const paymentIntent = await stripe.paymentIntents.create({
  amount: 1250,
  currency: 'usd',
  application_fee_amount: 125, // 10% platform fee
  transfer_data: {
    destination: sellerStripeAccountId,
  },
})
```

## 10. Production Checklist

### 10.1 Pre-Launch
- [ ] Switch to live API keys
- [ ] Update webhook endpoints to production URLs
- [ ] Test all payment flows with real cards
- [ ] Verify webhook signature validation
- [ ] Set up monitoring and alerts
- [ ] Test refund process
- [ ] Review Stripe Dashboard settings
- [ ] Enable 3D Secure for supported cards
- [ ] Configure email receipts
- [ ] Test error scenarios

### 10.2 Post-Launch
- [ ] Monitor payment success rate
- [ ] Review failed payment reasons
- [ ] Check webhook delivery success
- [ ] Monitor for fraud
- [ ] Review dispute/chargeback process
- [ ] Optimize checkout conversion
- [ ] Gather user feedback
- [ ] A/B test checkout flow

## 11. Compliance & Legal

### 11.1 Terms & Conditions
- Payment terms and refund policy
- Buyer protection guarantee
- Seller payout timeline
- Dispute resolution process

### 11.2 Privacy
- Clearly state Stripe processes payments
- Link to Stripe's privacy policy
- Explain data shared with Stripe
- Cookie consent for Stripe.js

### 11.3 Receipts & Records
- Email receipt for every purchase
- Downloadable invoice
- Transaction history in account
- Seller payout records

---

**Document Version**: 1.0
**Last Updated**: 2025-11-03
