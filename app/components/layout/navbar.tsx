'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useCurrentUser } from '@/hooks/use-current-user'
import { signOut } from 'next-auth/react'
import { User, LogOut } from 'lucide-react'

export default function Navbar() {
  const { user, isAuthenticated } = useCurrentUser()

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-primary font-[family-name:var(--font-poppins)]">
          GetGoat
        </Link>
        <nav className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/browse">Browse Goats</Link>
          </Button>

          {isAuthenticated ? (
            <>
              {user?.role === 'SELLER' && (
                <Button variant="outline" asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
              )}
              {user?.role === 'BUYER' && (
                <Button variant="outline" asChild>
                  <Link href="/orders">My Orders</Link>
                </Button>
              )}
              <Button variant="ghost" onClick={() => signOut({ callbackUrl: '/' })}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
