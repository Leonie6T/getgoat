'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Navbar from '@/components/layout/navbar'
import { ArrowLeft, Loader2, CreditCard } from 'lucide-react'
import { useCurrentUser } from '@/hooks/use-current-user'

const checkoutSchema = z.object({
  shippingName: z.string().min(1, 'Name is required'),
  shippingEmail: z.string().email('Valid email is required'),
  shippingPhone: z.string().min(10, 'Valid phone number is required'),
  line1: z.string().min(1, 'Address is required'),
  line2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postal_code: z.string().min(5, 'Postal code is required'),
  shippingNotes: z.string().optional(),
})

type CheckoutFormData = z.infer<typeof checkoutSchema>

interface Goat {
  id: string
  name: string
  breed: string
  gender: string
  age: string
  price: number
  primaryImage: string
  status: string
  seller: {
    name: string
    businessName: string | null
  }
}

export default function CheckoutPage({ params }: { params: { goatId: string } }) {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: userLoading } = useCurrentUser()
  const [goat, setGoat] = useState<Goat | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string>('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  })

  useEffect(() => {
    if (!userLoading) {
      if (!isAuthenticated) {
        router.push(`/login?callbackUrl=/checkout/${params.goatId}`)
      } else {
        fetchGoat()
        // Pre-fill with user's email
        if (user?.email) {
          setValue('shippingEmail', user.email)
        }
        if (user?.name) {
          setValue('shippingName', user.name)
        }
      }
    }
  }, [userLoading, isAuthenticated, params.goatId, user])

  const fetchGoat = async () => {
    try {
      const response = await fetch(`/api/goats/${params.goatId}`)
      if (!response.ok) {
        throw new Error('Goat not found')
      }
      const data = await response.json()

      if (data.goat.status !== 'AVAILABLE') {
        setError('This goat is no longer available for purchase')
      }

      setGoat(data.goat)
    } catch (error) {
      console.error('Failed to fetch goat:', error)
      router.push('/browse')
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: CheckoutFormData) => {
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goatId: params.goatId,
          shippingName: data.shippingName,
          shippingEmail: data.shippingEmail,
          shippingPhone: data.shippingPhone,
          shippingAddress: {
            line1: data.line1,
            line2: data.line2,
            city: data.city,
            state: data.state,
            postal_code: data.postal_code,
            country: 'US',
          },
          shippingNotes: data.shippingNotes,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Failed to create checkout session')
        setIsSubmitting(false)
        return
      }

      // Redirect to Stripe Checkout
      if (result.sessionUrl) {
        window.location.href = result.sessionUrl
      }
    } catch (err) {
      setError('An unexpected error occurred')
      setIsSubmitting(false)
    }
  }

  if (userLoading || isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (!goat) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <Link href={`/browse/${params.goatId}`}>
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Listing
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Contact Info */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Contact Details</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="shippingName">Full Name *</Label>
                        <Input
                          id="shippingName"
                          {...register('shippingName')}
                          disabled={isSubmitting}
                        />
                        {errors.shippingName && (
                          <p className="text-sm text-red-500">
                            {errors.shippingName.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="shippingEmail">Email *</Label>
                        <Input
                          id="shippingEmail"
                          type="email"
                          {...register('shippingEmail')}
                          disabled={isSubmitting}
                        />
                        {errors.shippingEmail && (
                          <p className="text-sm text-red-500">
                            {errors.shippingEmail.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="shippingPhone">Phone *</Label>
                      <Input
                        id="shippingPhone"
                        type="tel"
                        placeholder="(555) 123-4567"
                        {...register('shippingPhone')}
                        disabled={isSubmitting}
                      />
                      {errors.shippingPhone && (
                        <p className="text-sm text-red-500">
                          {errors.shippingPhone.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="space-y-4 border-t pt-6">
                    <h3 className="text-lg font-semibold">Shipping Address</h3>

                    <div className="space-y-2">
                      <Label htmlFor="line1">Street Address *</Label>
                      <Input
                        id="line1"
                        {...register('line1')}
                        disabled={isSubmitting}
                      />
                      {errors.line1 && (
                        <p className="text-sm text-red-500">{errors.line1.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="line2">Apartment, Suite, etc. (Optional)</Label>
                      <Input
                        id="line2"
                        {...register('line2')}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          {...register('city')}
                          disabled={isSubmitting}
                        />
                        {errors.city && (
                          <p className="text-sm text-red-500">{errors.city.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="state">State *</Label>
                        <Input
                          id="state"
                          placeholder="CA"
                          {...register('state')}
                          disabled={isSubmitting}
                        />
                        {errors.state && (
                          <p className="text-sm text-red-500">{errors.state.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="postal_code">ZIP Code *</Label>
                        <Input
                          id="postal_code"
                          {...register('postal_code')}
                          disabled={isSubmitting}
                        />
                        {errors.postal_code && (
                          <p className="text-sm text-red-500">
                            {errors.postal_code.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Additional Notes */}
                  <div className="space-y-4 border-t pt-6">
                    <h3 className="text-lg font-semibold">Additional Information</h3>

                    <div className="space-y-2">
                      <Label htmlFor="shippingNotes">
                        Delivery Notes (Optional)
                      </Label>
                      <Textarea
                        id="shippingNotes"
                        rows={3}
                        placeholder="Any special instructions for delivery or pickup..."
                        {...register('shippingNotes')}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={isSubmitting || goat.status !== 'AVAILABLE'}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-5 w-5 mr-2" />
                        Proceed to Payment
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-square rounded-lg overflow-hidden">
                  <img
                    src={goat.primaryImage}
                    alt={goat.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div>
                  <h3 className="font-semibold text-lg">{goat.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {goat.breed} • {goat.gender} • {goat.age}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Sold by {goat.seller.businessName || goat.seller.name}
                  </p>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">
                      ${(goat.price / 100).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Payment Processing
                    </span>
                    <span className="text-muted-foreground">via Stripe</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">
                      ${(goat.price / 100).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  <p>
                    Payment will be processed securely through Stripe. You will be
                    redirected to complete your purchase.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
