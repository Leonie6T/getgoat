import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = headers().get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        const orderId = session.metadata?.orderId
        const goatId = session.metadata?.goatId

        if (!orderId || !goatId) {
          console.error('Missing metadata in checkout session')
          break
        }

        // Update order status to PAID
        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: 'PAID',
            stripePaymentId: session.payment_intent as string,
            paidAt: new Date(),
          },
        })

        // Update goat status to SOLD
        await prisma.goat.update({
          where: { id: goatId },
          data: { status: 'SOLD' },
        })

        console.log(`Order ${orderId} marked as PAID, Goat ${goatId} marked as SOLD`)

        // TODO: Send email notifications to buyer and seller

        break
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session

        const orderId = session.metadata?.orderId
        const goatId = session.metadata?.goatId

        if (!orderId || !goatId) {
          break
        }

        // Cancel the order
        await prisma.order.update({
          where: { id: orderId },
          data: { status: 'CANCELLED' },
        })

        // Make goat available again
        await prisma.goat.update({
          where: { id: goatId },
          data: { status: 'AVAILABLE' },
        })

        console.log(`Checkout expired: Order ${orderId} cancelled, Goat ${goatId} available again`)

        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent

        console.error('Payment failed:', paymentIntent.id)

        // Could add logic here to handle failed payments
        // For now, the order will remain in PENDING status

        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
