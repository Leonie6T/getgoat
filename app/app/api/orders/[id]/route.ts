import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/session'

// GET - Get a single order
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        goat: {
          include: {
            seller: {
              select: {
                id: true,
                name: true,
                businessName: true,
                email: true,
                phone: true,
                location: true,
                verified: true,
              },
            },
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Check if user has access to this order (buyer or seller)
    if (order.buyerId !== user.id && order.goat.sellerId !== user.id) {
      return NextResponse.json(
        { error: 'You do not have access to this order' },
        { status: 403 }
      )
    }

    return NextResponse.json({ order }, { status: 200 })
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.error('Get order error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}
