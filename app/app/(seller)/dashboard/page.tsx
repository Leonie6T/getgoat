'use client'

import { useEffect, useState } from 'react'
import { useCurrentUser } from '@/hooks/use-current-user'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { Loader2, Plus, Edit, Trash2 } from 'lucide-react'

interface Goat {
  id: string
  name: string
  breed: string
  gender: string
  age: string
  price: number
  primaryImage: string
  status: string
  viewCount: number
  createdAt: string
}

export default function DashboardPage() {
  const { user, isLoading: userLoading } = useCurrentUser()
  const [goats, setGoats] = useState<Goat[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    fetchGoats()
  }, [])

  const fetchGoats = async () => {
    try {
      const response = await fetch('/api/goats?sellerOnly=true')
      const data = await response.json()
      setGoats(data.goats || [])
    } catch (error) {
      console.error('Failed to fetch goats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return

    setDeleteId(id)
    try {
      const response = await fetch(`/api/goats/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setGoats(goats.filter((g) => g.id !== id))
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete listing')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete listing')
    } finally {
      setDeleteId(null)
    }
  }

  if (userLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const activeListings = goats.filter((g) => g.status === 'AVAILABLE').length
  const soldListings = goats.filter((g) => g.status === 'SOLD').length
  const totalRevenue = goats
    .filter((g) => g.status === 'SOLD')
    .reduce((sum, g) => sum + g.price, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Seller Dashboard</h1>
            <p className="text-sm text-gray-500">Welcome back, {user?.name}</p>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard/orders">
              <Button variant="outline">
                Orders
              </Button>
            </Link>
            <Link href="/dashboard/goats/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Listing
              </Button>
            </Link>
            <Button variant="outline" onClick={() => signOut({ callbackUrl: '/' })}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Total Listings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{goats.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Listings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{activeListings}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                ${(totalRevenue / 100).toFixed(2)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {soldListings} {soldListings === 1 ? 'sale' : 'sales'}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Your Listings</CardTitle>
            {goats.length > 0 && (
              <Link href="/dashboard/goats/new">
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New
                </Button>
              </Link>
            )}
          </CardHeader>
          <CardContent>
            {goats.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">
                  You don&apos;t have any listings yet
                </p>
                <Link href="/dashboard/goats/new">
                  <Button>Create Your First Listing</Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {goats.map((goat) => (
                  <div
                    key={goat.id}
                    className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="aspect-square relative">
                      <img
                        src={goat.primaryImage}
                        alt={goat.name}
                        className="w-full h-full object-cover"
                      />
                      <Badge
                        className="absolute top-2 right-2"
                        variant={
                          goat.status === 'AVAILABLE'
                            ? 'default'
                            : goat.status === 'SOLD'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {goat.status}
                      </Badge>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-1">{goat.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {goat.breed} • {goat.gender} • {goat.age}
                      </p>
                      <p className="text-lg font-bold text-primary mb-3">
                        ${(goat.price / 100).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500 mb-3">
                        {goat.viewCount} {goat.viewCount === 1 ? 'view' : 'views'}
                      </p>
                      <div className="flex gap-2">
                        <Link href={`/dashboard/goats/${goat.id}/edit`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </Link>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(goat.id)}
                          disabled={deleteId === goat.id}
                        >
                          {deleteId === goat.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
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
