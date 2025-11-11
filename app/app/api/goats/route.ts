import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, requireRole } from '@/lib/session'
import { GoatStatus } from '@prisma/client'

// Schema for creating a goat
const createGoatSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  breed: z.string().min(1, 'Breed is required'),
  gender: z.enum(['MALE', 'FEMALE']),
  birthDate: z.string().min(1, 'Birth date is required'),
  age: z.string().min(1, 'Age is required'),
  price: z.number().min(1, 'Price must be greater than 0'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  weight: z.number().optional(),
  color: z.string().optional(),
  healthNotes: z.string().optional(),
  vaccinated: z.boolean().default(false),
  numberOfKids: z.number().default(0),
  images: z.array(z.string()).min(1, 'At least one image is required'),
  primaryImage: z.string().min(1, 'Primary image is required'),
})

// GET - List goats (public or seller-specific)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const sellerOnly = searchParams.get('sellerOnly') === 'true'
    const status = searchParams.get('status') as GoatStatus | null

    let where: any = {}

    if (sellerOnly) {
      const user = await requireRole('SELLER')
      where.sellerId = user.id
    } else {
      // Public view - only show available goats
      where.status = 'AVAILABLE'
    }

    if (status) {
      where.status = status
    }

    const goats = await prisma.goat.findMany({
      where,
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            businessName: true,
            location: true,
            verified: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ goats }, { status: 200 })
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.error('Get goats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch goats' },
      { status: 500 }
    )
  }
}

// POST - Create a new goat listing
export async function POST(req: NextRequest) {
  try {
    const user = await requireRole('SELLER')
    const body = await req.json()

    // Validate request body
    const validatedData = createGoatSchema.parse(body)

    // Convert price to cents if it's in dollars
    const priceInCents = Math.round(validatedData.price * 100)

    // Create goat
    const goat = await prisma.goat.create({
      data: {
        ...validatedData,
        birthDate: new Date(validatedData.birthDate),
        price: priceInCents,
        sellerId: user.id,
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            businessName: true,
            location: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        message: 'Goat listing created successfully',
        goat,
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json(
        { error: 'Only sellers can create listings' },
        { status: 403 }
      )
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Create goat error:', error)
    return NextResponse.json(
      { error: 'Failed to create goat listing' },
      { status: 500 }
    )
  }
}
