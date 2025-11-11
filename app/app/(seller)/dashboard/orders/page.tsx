'use client'

import { useEffect, useState } from 'react'
import { useCurrentUser } from '@/hooks/use-current-user'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { Loader2, Package, ArrowLeft } from 'lucide-react'
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
  goat: {
    id: string
    name: string
    breed: string
    primaryImage: string
  }
  buyer: {
    name: string
    email: string
  }
}

export default function SellerOrdersPage() {
  const { user, isLoading: userLoading } = useCurrentUser()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders?type=seller')
      const data = await response.json()
      setOrders(data.orders || [])
    } catch (error) {
      console.error('Failed to fetch orders:', error)
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

  if (userLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const paidOrders = orders.filter((o) => o.status === 'PAID' || o.status === 'SHIPPED' || o.status === 'DELIVERED')
  const pendingOrders = orders.filter((o) => o.status === 'PENDING')
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.amount, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sales & Orders</h1>
              <p className="text-sm text-gray-500">Manage your incoming orders</p>
            </div>
            <Button variant="outline" onClick={() => signOut({ callbackUrl: '/' })}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{orders.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Paid Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{paidOrders.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">
                ${(totalRevenue / 100).toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Orders List */}
        <Card>
          <CardHeader>
            <CardTitle>Order History</CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No orders received yet</p>
                <Link href="/dashboard">
                  <Button>Back to Dashboard</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={order.goat.primaryImage}
                          alt={order.goat.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">{order.goat.name}</h3>
                            <p className="text-sm text-muted-foreground">{order.goat.breed}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Buyer: {order.buyer.name} ({order.buyer.email})
                            </p>
                          </div>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mt-4">
                          <div>
                            <p className="text-muted-foreground">Order Number</p>
                            <p className="font-medium">{order.orderNumber}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Total</p>
                            <p className="font-medium">${(order.amount / 100).toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Order Date</p>
                            <p className="font-medium">
                              {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Paid Date</p>
                            <p className="font-medium">
                              {order.paidAt
                                ? format(new Date(order.paidAt), 'MMM dd, yyyy')
                                : '-'}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                          <Link href={`/dashboard/orders/${order.id}`}>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </Link>
                          <a href={`mailto:${order.buyer.email}`}>
                            <Button variant="outline" size="sm">
                              Contact Buyer
                            </Button>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
