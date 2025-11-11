import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { stripe, formatAmountForStripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/session'

const checkoutSchema = z.object({
  goatId: z.string().min(1, 'Goat ID is required'),
  shippingName: z.string().min(1, 'Name is required'),
  shippingEmail: z.string().email('Valid email is required'),
  shippingPhone: z.string().min(1, 'Phone is required'),
  shippingAddress: z.object({
    line1: z.string().min(1, 'Address is required'),
    line2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    postal_code: z.string().min(1, 'Postal code is required'),
    country: z.string().default('US'),
  }),
  shippingNotes: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await req.json()

    // Validate request body
    const validatedData = checkoutSchema.parse(body)

    // Get goat and verify it's available
    const goat = await prisma.goat.findUnique({
      where: { id: validatedData.goatId },
      include: {
        seller: {
          select: {
            name: true,
            businessName: true,
          },
        },
      },
    })

    if (!goat) {
      return NextResponse.json({ error: 'Goat not found' }, { status: 404 })
    }

    if (goat.status !== 'AVAILABLE') {
      return NextResponse.json(
        { error: 'This goat is no longer available' },
        { status: 400 }
      )
    }

    // Check if user is trying to buy their own goat
    if (goat.sellerId === user.id) {
      return NextResponse.json(
        { error: 'You cannot purchase your own listing' },
        { status: 400 }
      )
    }

    // Generate unique order number
    const orderNumber = `GO-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`

    // Create order in database (PENDING status)
    const order = await prisma.order.create({
      data: {
        orderNumber,
        buyerId: user.id,
        goatId: goat.id,
        amount: goat.price,
        status: 'PENDING',
        shippingName: validatedData.shippingName,
        shippingEmail: validatedData.shippingEmail,
        shippingPhone: validatedData.shippingPhone,
        shippingAddress: validatedData.shippingAddress,
        shippingNotes: validatedData.shippingNotes,
      },
    })

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: goat.name,
              description: `${goat.breed} - ${goat.gender} - ${goat.age}`,
              images: [goat.primaryImage],
            },
            unit_amount: formatAmountForStripe(goat.price),
          },
          quantity: 1,
        },
      ],
      customer_email: validatedData.shippingEmail,
      metadata: {
        orderId: order.id,
        goatId: goat.id,
        buyerId: user.id,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/browse/${goat.id}`,
    })

    // Update order with Stripe session ID
    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id },
    })

    // Mark goat as reserved
    await prisma.goat.update({
      where: { id: goat.id },
      data: { status: 'RESERVED' },
    })

    return NextResponse.json(
      {
        sessionId: session.id,
        sessionUrl: session.url,
        orderId: order.id,
      },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
