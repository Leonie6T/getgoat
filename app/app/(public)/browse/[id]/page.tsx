'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Navbar from '@/components/layout/navbar'
import { ArrowLeft, Mail, MapPin, Check, Calendar, Weight, Heart, Loader2 } from 'lucide-react'
import { format } from 'date-fns'

interface Goat {
  id: string
  name: string
  breed: string
  gender: string
  age: string
  birthDate: string
  price: number
  description: string
  weight: number | null
  color: string | null
  healthNotes: string | null
  vaccinated: boolean
  numberOfKids: number
  images: string[]
  primaryImage: string
  viewCount: number
  seller: {
    id: string
    name: string
    email: string
    businessName: string | null
    location: string | null
    phone: string | null
    verified: boolean
  }
}

export default function GoatDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [goat, setGoat] = useState<Goat | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showContactModal, setShowContactModal] = useState(false)

  useEffect(() => {
    fetchGoat()
  }, [params.id])

  const fetchGoat = async () => {
    try {
      const response = await fetch(`/api/goats/${params.id}`)
      if (!response.ok) {
        throw new Error('Goat not found')
      }
      const data = await response.json()
      setGoat(data.goat)
    } catch (error) {
      console.error('Failed to fetch goat:', error)
      router.push('/browse')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
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
        <Link href="/browse">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Browse
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div>
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-200 mb-4">
              <img
                src={goat.images[currentImageIndex]}
                alt={`${goat.name} - Image ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
            {goat.images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {goat.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`aspect-square rounded-md overflow-hidden ${
                      currentImageIndex === index
                        ? 'ring-2 ring-primary'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${goat.name} thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{goat.name}</h1>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span>{goat.breed}</span>
                    <span>•</span>
                    <span>{goat.gender}</span>
                    <span>•</span>
                    <span>{goat.age}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-primary">
                    ${(goat.price / 100).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4 mb-4">
                <h3 className="font-semibold mb-3">Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{goat.description}</p>
              </div>

              <div className="border-t pt-4 mb-4">
                <h3 className="font-semibold mb-3">Details</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div className="text-sm">
                      <p className="text-muted-foreground">Birth Date</p>
                      <p className="font-medium">
                        {format(new Date(goat.birthDate), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>

                  {goat.weight && (
                    <div className="flex items-center gap-2">
                      <Weight className="h-4 w-4 text-muted-foreground" />
                      <div className="text-sm">
                        <p className="text-muted-foreground">Weight</p>
                        <p className="font-medium">{goat.weight} lbs</p>
                      </div>
                    </div>
                  )}

                  {goat.color && (
                    <div className="text-sm">
                      <p className="text-muted-foreground">Color</p>
                      <p className="font-medium">{goat.color}</p>
                    </div>
                  )}

                  <div className="text-sm">
                    <p className="text-muted-foreground">Vaccinated</p>
                    <p className="font-medium">
                      {goat.vaccinated ? (
                        <span className="flex items-center text-green-600">
                          <Check className="h-4 w-4 mr-1" /> Yes
                        </span>
                      ) : (
                        'No'
                      )}
                    </p>
                  </div>

                  {goat.numberOfKids > 0 && (
                    <div className="text-sm">
                      <p className="text-muted-foreground">Kids (Offspring)</p>
                      <p className="font-medium">{goat.numberOfKids}</p>
                    </div>
                  )}
                </div>
              </div>

              {goat.healthNotes && (
                <div className="border-t pt-4 mb-4">
                  <h3 className="font-semibold mb-2">Health Notes</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {goat.healthNotes}
                  </p>
                </div>
              )}

              <div className="border-t pt-4 space-y-3">
                <Link href={`/checkout/${goat.id}`}>
                  <Button className="w-full" size="lg">
                    Buy Now
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full"
                  size="lg"
                  onClick={() => setShowContactModal(true)}
                >
                  <Mail className="h-5 w-5 mr-2" />
                  Contact Seller
                </Button>
              </div>
            </div>

            {/* Seller Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Seller Information</span>
                  {goat.seller.verified && (
                    <Badge className="bg-green-600">Verified</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold">
                      {goat.seller.businessName || goat.seller.name}
                    </p>
                    {goat.seller.businessName && (
                      <p className="text-sm text-muted-foreground">{goat.seller.name}</p>
                    )}
                  </div>

                  {goat.seller.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{goat.seller.location}</span>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    <p>{goat.viewCount} people viewed this listing</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Contact Seller</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                To inquire about <strong>{goat.name}</strong>, please contact the seller directly:
              </p>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Seller</p>
                  <p className="font-semibold">
                    {goat.seller.businessName || goat.seller.name}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <a
                    href={`mailto:${goat.seller.email}?subject=Inquiry about ${goat.name}&body=Hi, I'm interested in learning more about ${goat.name} (${goat.breed}).`}
                    className="text-primary hover:underline font-medium"
                  >
                    {goat.seller.email}
                  </a>
                </div>

                {goat.seller.phone && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Phone</p>
                    <a
                      href={`tel:${goat.seller.phone}`}
                      className="text-primary hover:underline font-medium"
                    >
                      {goat.seller.phone}
                    </a>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  className="flex-1"
                  asChild
                >
                  <a
                    href={`mailto:${goat.seller.email}?subject=Inquiry about ${goat.name}&body=Hi, I'm interested in learning more about ${goat.name} (${goat.breed}).`}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </a>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowContactModal(false)}
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
