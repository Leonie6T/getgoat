import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/session'

// GET - List orders for current user (buyer or seller)
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') // 'buyer' or 'seller'

    let orders

    if (type === 'seller') {
      // Get orders for goats sold by this seller
      orders = await prisma.order.findMany({
        where: {
          goat: {
            sellerId: user.id,
          },
        },
        include: {
          goat: {
            select: {
              id: true,
              name: true,
              breed: true,
              primaryImage: true,
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
        orderBy: {
          createdAt: 'desc',
        },
      })
    } else {
      // Get orders placed by this buyer
      orders = await prisma.order.findMany({
        where: {
          buyerId: user.id,
        },
        include: {
          goat: {
            select: {
              id: true,
              name: true,
              breed: true,
              primaryImage: true,
              seller: {
                select: {
                  name: true,
                  businessName: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
    }

    return NextResponse.json({ orders }, { status: 200 })
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.error('Get orders error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
