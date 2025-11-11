import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Navbar from '@/components/layout/navbar'
import { prisma } from '@/lib/prisma'

async function getFeaturedGoats() {
  try {
    const goats = await prisma.goat.findMany({
      where: {
        status: 'AVAILABLE',
      },
      take: 6,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        seller: {
          select: {
            name: true,
            businessName: true,
            location: true,
            verified: true,
          },
        },
      },
    })
    return goats
  } catch (error) {
    console.error('Failed to fetch goats:', error)
    return []
  }
}

export default async function HomePage() {
  const featuredGoats = await getFeaturedGoats()

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 font-[family-name:var(--font-poppins)]">
          Find Your Perfect Goat
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Premium goat marketplace connecting quality breeders with buyers.
          Browse verified listings and find healthy, well-cared-for goats.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/browse">Browse Goats</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>
      </section>

      {/* Featured Goats Section */}
      {featuredGoats.length > 0 && (
        <section className="container mx-auto px-4 py-16 bg-gray-50">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold font-[family-name:var(--font-poppins)]">
              Featured Goats
            </h2>
            <Button variant="outline" asChild>
              <Link href="/browse">View All</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredGoats.map((goat) => (
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
                        Verified Seller
                      </Badge>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{goat.name}</span>
                      <span className="text-primary">
                        ${(goat.price / 100).toFixed(2)}
                      </span>
                    </CardTitle>
                    <CardDescription>
                      {goat.breed} • {goat.gender} • {goat.age}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {goat.description}
                    </p>
                    <div className="mt-3 flex items-center text-sm text-muted-foreground">
                      <span>
                        {goat.seller.businessName || goat.seller.name}
                      </span>
                      {goat.seller.location && (
                        <>
                          <span className="mx-2">•</span>
                          <span>{goat.seller.location}</span>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 font-[family-name:var(--font-poppins)]">
          Why Choose GetGoat?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Verified Sellers</CardTitle>
              <CardDescription>
                All sellers are verified to ensure quality and trust
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                We carefully vet every seller to maintain the highest standards
                for animal welfare and business practices.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Secure Payments</CardTitle>
              <CardDescription>
                Safe and encrypted payment processing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Your transactions are protected with industry-leading security
                through Stripe payment processing.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Health Guaranteed</CardTitle>
              <CardDescription>
                Comprehensive health records included
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Every goat listing includes vaccination records and health
                history for your peace of mind.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 font-[family-name:var(--font-poppins)]">
            Ready to Get Started?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Join our community of goat enthusiasts today
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/browse">Browse Listings</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent border-white text-white hover:bg-white/10"
              asChild
            >
              <Link href="/signup">Create Account</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold mb-4 font-[family-name:var(--font-poppins)]">GetGoat</h3>
              <p className="text-sm text-muted-foreground">
                The trusted marketplace for buying and selling quality goats.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Marketplace</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/browse" className="hover:text-foreground">Browse Goats</Link></li>
                <li><Link href="/signup" className="hover:text-foreground">Sell Your Goats</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground">About</Link></li>
                <li><Link href="/contact" className="hover:text-foreground">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/terms" className="hover:text-foreground">Terms</Link></li>
                <li><Link href="/privacy" className="hover:text-foreground">Privacy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} GetGoat. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
