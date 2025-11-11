'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Navbar from '@/components/layout/navbar'
import { CheckCircle, Loader2, Package } from 'lucide-react'

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get('session_id')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (!sessionId) {
      router.push('/browse')
    } else {
      // Just verify we have a session ID
      // The actual order status is updated by the webhook
      setTimeout(() => setIsLoading(false), 1000)
    }
  }, [sessionId, router])

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

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-green-100 p-3">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-3xl">Payment Successful!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-center">
              <div>
                <p className="text-lg text-muted-foreground mb-2">
                  Thank you for your purchase!
                </p>
                <p className="text-sm text-muted-foreground">
                  Your order has been confirmed and the seller will be notified.
                  You&apos;ll receive an email confirmation shortly with your order
                  details.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Package className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-left text-sm">
                    <p className="font-semibold text-blue-900 mb-1">
                      What happens next?
                    </p>
                    <ul className="space-y-1 text-blue-800">
                      <li>• The seller will be notified of your purchase</li>
                      <li>• You&apos;ll receive order updates via email</li>
                      <li>
                        • Coordinate delivery/pickup with the seller directly
                      </li>
                      <li>• Track your order status in your order history</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Link href="/orders" className="flex-1">
                  <Button size="lg" className="w-full">
                    View My Orders
                  </Button>
                </Link>
                <Link href="/browse" className="flex-1">
                  <Button variant="outline" size="lg" className="w-full">
                    Continue Shopping
                  </Button>
                </Link>
              </div>

              <p className="text-xs text-muted-foreground pt-4">
                Order confirmation #: {sessionId}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
