'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Navbar from '@/components/layout/navbar'
import { Search, Loader2, Filter } from 'lucide-react'

interface Goat {
  id: string
  name: string
  breed: string
  gender: string
  age: string
  price: number
  primaryImage: string
  description: string
  seller: {
    name: string
    businessName: string | null
    location: string | null
    verified: boolean
  }
}

export default function BrowsePage() {
  const [goats, setGoats] = useState<Goat[]>([])
  const [filteredGoats, setFilteredGoats] = useState<Goat[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [genderFilter, setGenderFilter] = useState<string>('ALL')
  const [sortBy, setSortBy] = useState<string>('newest')

  useEffect(() => {
    fetchGoats()
  }, [])

  useEffect(() => {
    filterAndSortGoats()
  }, [goats, searchQuery, genderFilter, sortBy])

  const fetchGoats = async () => {
    try {
      const response = await fetch('/api/goats')
      const data = await response.json()
      setGoats(data.goats || [])
    } catch (error) {
      console.error('Failed to fetch goats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterAndSortGoats = () => {
    let filtered = [...goats]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (goat) =>
          goat.name.toLowerCase().includes(query) ||
          goat.breed.toLowerCase().includes(query) ||
          goat.description.toLowerCase().includes(query) ||
          goat.seller.businessName?.toLowerCase().includes(query) ||
          goat.seller.name.toLowerCase().includes(query)
      )
    }

    // Gender filter
    if (genderFilter !== 'ALL') {
      filtered = filtered.filter((goat) => goat.gender === genderFilter)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price
        case 'price-high':
          return b.price - a.price
        case 'name':
          return a.name.localeCompare(b.name)
        case 'newest':
        default:
          return 0 // Already in newest order from API
      }
    })

    setFilteredGoats(filtered)
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 font-[family-name:var(--font-poppins)]">
            Browse Goats
          </h1>
          <p className="text-muted-foreground">
            {filteredGoats.length} {filteredGoats.length === 1 ? 'goat' : 'goats'} available
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search by name, breed, or seller..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Gender Filter */}
            <div>
              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="ALL">All Genders</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Goats Grid */}
        {filteredGoats.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg text-muted-foreground mb-4">
              {searchQuery || genderFilter !== 'ALL'
                ? 'No goats match your filters'
                : 'No goats available at the moment'}
            </p>
            {(searchQuery || genderFilter !== 'ALL') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('')
                  setGenderFilter('ALL')
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredGoats.map((goat) => (
              <Link key={goat.id} href={`/browse/${goat.id}`}>
                <Card className="overflow-hidden hover:shadow-xl transition-shadow cursor-pointer h-full">
                  <div className="aspect-square relative">
                    <img
                      src={goat.primaryImage}
                      alt={goat.name}
                      className="w-full h-full object-cover"
                    />
                    {goat.seller.verified && (
                      <Badge className="absolute top-3 right-3 bg-green-600">
                        Verified
                      </Badge>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="truncate">{goat.name}</span>
                      <span className="text-primary whitespace-nowrap ml-2">
                        ${(goat.price / 100).toFixed(2)}
                      </span>
                    </CardTitle>
                    <CardDescription>
                      {goat.breed} • {goat.gender} • {goat.age}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {goat.description}
                    </p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <span className="truncate">
                        {goat.seller.businessName || goat.seller.name}
                      </span>
                      {goat.seller.location && (
                        <>
                          <span className="mx-2">•</span>
                          <span className="truncate">{goat.seller.location}</span>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
