'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Navbar from '@/components/layout/navbar'
import { ArrowLeft, Loader2, Mail, Phone, MapPin } from 'lucide-react'
import { format } from 'date-fns'

interface Order {
  id: string
  orderNumber: string
  amount: number
  status: string
  createdAt: string
  paidAt: string | null
  shippingName: string
  shippingEmail: string
  shippingPhone: string
  shippingAddress: {
    line1: string
    line2?: string
    city: string
    state: string
    postal_code: string
    country: string
  }
  shippingNotes: string | null
  trackingNumber: string | null
  goat: {
    id: string
    name: string
    breed: string
    gender: string
    age: string
    primaryImage: string
    seller: {
      name: string
      businessName: string | null
      email: string
      phone: string | null
      location: string | null
    }
  }
}

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchOrder()
  }, [params.id])

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${params.id}`)
      if (!response.ok) {
        throw new Error('Order not found')
      }
      const data = await response.json()
      setOrder(data.order)
    } catch (error) {
      console.error('Failed to fetch order:', error)
      router.push('/orders')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-600'
      case 'PENDING':
        return 'bg-yellow-600'
      case 'SHIPPED':
        return 'bg-blue-600'
      case 'DELIVERED':
        return 'bg-purple-600'
      case 'CANCELLED':
        return 'bg-gray-600'
      default:
        return 'bg-gray-600'
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

  if (!order) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <Link href="/orders">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Header */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Order {order.orderNumber}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Placed on {format(new Date(order.createdAt), 'MMMM dd, yyyy')}
                    </p>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                </div>
              </CardHeader>
            </Card>

            {/* Goat Details */}
            <Card>
              <CardHeader>
                <CardTitle>Item Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <div className="w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={order.goat.primaryImage}
                      alt={order.goat.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{order.goat.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {order.goat.breed} • {order.goat.gender} • {order.goat.age}
                    </p>
                    <p className="text-lg font-bold text-primary mt-2">
                      ${(order.amount / 100).toFixed(2)}
                    </p>
                    <Link href={`/browse/${order.goat.id}`}>
                      <Button variant="outline" size="sm" className="mt-3">
                        View Listing
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Recipient</p>
                  <p className="font-medium">{order.shippingName}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">Address</p>
                  <p>{order.shippingAddress.line1}</p>
                  {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                    {order.shippingAddress.postal_code}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">Contact</p>
                  <p>{order.shippingEmail}</p>
                  <p>{order.shippingPhone}</p>
                </div>

                {order.shippingNotes && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Delivery Notes</p>
                    <p className="text-sm">{order.shippingNotes}</p>
                  </div>
                )}

                {order.trackingNumber && (
                  <div className="border-t pt-4">
                    <p className="text-sm font-medium text-muted-foreground">Tracking Number</p>
                    <p className="font-medium">{order.trackingNumber}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Seller Info */}
            <Card>
              <CardHeader>
                <CardTitle>Seller Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-semibold">
                    {order.goat.seller.businessName || order.goat.seller.name}
                  </p>
                  {order.goat.seller.businessName && (
                    <p className="text-sm text-muted-foreground">{order.goat.seller.name}</p>
                  )}
                </div>

                {order.goat.seller.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{order.goat.seller.location}</span>
                  </div>
                )}

                <div className="space-y-2 pt-4 border-t">
                  <a
                    href={`mailto:${order.goat.seller.email}`}
                    className="flex items-center gap-2 text-sm hover:text-primary"
                  >
                    <Mail className="h-4 w-4" />
                    <span>{order.goat.seller.email}</span>
                  </a>

                  {order.goat.seller.phone && (
                    <a
                      href={`tel:${order.goat.seller.phone}`}
                      className="flex items-center gap-2 text-sm hover:text-primary"
                    >
                      <Phone className="h-4 w-4" />
                      <span>{order.goat.seller.phone}</span>
                    </a>
                  )}
                </div>

                <Button
                  className="w-full mt-4"
                  asChild
                >
                  <a href={`mailto:${order.goat.seller.email}?subject=Question about Order ${order.orderNumber}`}>
                    Contact Seller
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${(order.amount / 100).toFixed(2)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span className="text-primary">${(order.amount / 100).toFixed(2)}</span>
                  </div>
                </div>

                {order.paidAt && (
                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    Paid on {format(new Date(order.paidAt), 'MMM dd, yyyy')}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
