import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, requireRole } from '@/lib/session'

// Schema for updating a goat
const updateGoatSchema = z.object({
  name: z.string().min(1).optional(),
  breed: z.string().min(1).optional(),
  gender: z.enum(['MALE', 'FEMALE']).optional(),
  birthDate: z.string().optional(),
  age: z.string().optional(),
  price: z.number().min(1).optional(),
  description: z.string().min(10).optional(),
  weight: z.number().optional(),
  color: z.string().optional(),
  healthNotes: z.string().optional(),
  vaccinated: z.boolean().optional(),
  numberOfKids: z.number().optional(),
  images: z.array(z.string()).optional(),
  primaryImage: z.string().optional(),
  status: z.enum(['AVAILABLE', 'SOLD', 'RESERVED']).optional(),
  featured: z.boolean().optional(),
})

// GET - Get a single goat
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const goat = await prisma.goat.findUnique({
      where: { id: params.id },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            businessName: true,
            location: true,
            phone: true,
            email: true,
            verified: true,
          },
        },
      },
    })

    if (!goat) {
      return NextResponse.json({ error: 'Goat not found' }, { status: 404 })
    }

    // Increment view count
    await prisma.goat.update({
      where: { id: params.id },
      data: { viewCount: { increment: 1 } },
    })

    return NextResponse.json({ goat }, { status: 200 })
  } catch (error) {
    console.error('Get goat error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch goat' },
      { status: 500 }
    )
  }
}

// PATCH - Update a goat
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireRole('SELLER')
    const body = await req.json()

    // Validate request body
    const validatedData = updateGoatSchema.parse(body)

    // Check if goat exists and belongs to the seller
    const existingGoat = await prisma.goat.findUnique({
      where: { id: params.id },
    })

    if (!existingGoat) {
      return NextResponse.json({ error: 'Goat not found' }, { status: 404 })
    }

    if (existingGoat.sellerId !== user.id) {
      return NextResponse.json(
        { error: 'You can only update your own listings' },
        { status: 403 }
      )
    }

    // Convert price to cents if provided
    const updateData: any = { ...validatedData }
    if (validatedData.price) {
      updateData.price = Math.round(validatedData.price * 100)
    }
    if (validatedData.birthDate) {
      updateData.birthDate = new Date(validatedData.birthDate)
    }

    // Update goat
    const goat = await prisma.goat.update({
      where: { id: params.id },
      data: updateData,
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
        message: 'Goat listing updated successfully',
        goat,
      },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json(
        { error: 'Only sellers can update listings' },
        { status: 403 }
      )
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Update goat error:', error)
    return NextResponse.json(
      { error: 'Failed to update goat listing' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a goat
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireRole('SELLER')

    // Check if goat exists and belongs to the seller
    const existingGoat = await prisma.goat.findUnique({
      where: { id: params.id },
    })

    if (!existingGoat) {
      return NextResponse.json({ error: 'Goat not found' }, { status: 404 })
    }

    if (existingGoat.sellerId !== user.id) {
      return NextResponse.json(
        { error: 'You can only delete your own listings' },
        { status: 403 }
      )
    }

    // Check if goat has an order
    const hasOrder = await prisma.order.findFirst({
      where: { goatId: params.id },
    })

    if (hasOrder) {
      return NextResponse.json(
        { error: 'Cannot delete a goat with an existing order' },
        { status: 400 }
      )
    }

    // Delete goat
    await prisma.goat.delete({
      where: { id: params.id },
    })

    return NextResponse.json(
      { message: 'Goat listing deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json(
        { error: 'Only sellers can delete listings' },
        { status: 403 }
      )
    }

    console.error('Delete goat error:', error)
    return NextResponse.json(
      { error: 'Failed to delete goat listing' },
      { status: 500 }
    )
  }
}
