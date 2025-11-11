# GetGoat - MVP Project Structure

## Complete Folder Structure

```
getgoat/
├── .env.local                      # Environment variables
├── .eslintrc.json                  # ESLint config
├── .gitignore                      # Git ignore
├── next.config.js                  # Next.js config
├── package.json                    # Dependencies
├── tsconfig.json                   # TypeScript config
├── tailwind.config.ts              # Tailwind config
├── postcss.config.js               # PostCSS config
│
├── prisma/
│   ├── schema.prisma               # Database schema
│   ├── migrations/                 # Database migrations
│   └── seed.ts                     # Database seed data
│
├── public/
│   ├── images/
│   │   ├── logo.svg
│   │   ├── hero-bg.jpg
│   │   └── placeholder-goat.jpg
│   ├── favicon.ico
│   └── manifest.json               # (For future PWA)
│
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── (auth)/                 # Auth route group
│   │   │   ├── login/
│   │   │   │   └── page.tsx        # Login page
│   │   │   └── signup/
│   │   │       └── page.tsx        # Signup page
│   │   │
│   │   ├── (public)/               # Public route group
│   │   │   ├── page.tsx            # Homepage
│   │   │   ├── layout.tsx          # Public layout
│   │   │   ├── goats/
│   │   │   │   ├── page.tsx        # Browse goats
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx    # Goat detail
│   │   │   ├── about/
│   │   │   │   └── page.tsx
│   │   │   ├── how-it-works/
│   │   │   │   └── page.tsx
│   │   │   └── contact/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (seller)/               # Seller route group
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx        # Seller dashboard
│   │   │   │   ├── layout.tsx      # Seller layout
│   │   │   │   ├── goats/
│   │   │   │   │   ├── page.tsx    # My listings
│   │   │   │   │   ├── new/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── edit/
│   │   │   │   │           └── page.tsx
│   │   │   │   └── orders/
│   │   │   │       ├── page.tsx    # Orders received
│   │   │   │       └── [id]/
│   │   │   │           └── page.tsx
│   │   │
│   │   ├── (buyer)/                # Buyer route group
│   │   │   └── my-orders/
│   │   │       ├── page.tsx        # My purchases
│   │   │       └── [id]/
│   │   │           └── page.tsx    # Order detail
│   │   │
│   │   ├── checkout/
│   │   │   ├── [goatId]/
│   │   │   │   └── page.tsx        # Checkout form
│   │   │   └── success/
│   │   │       └── page.tsx        # Order confirmation
│   │   │
│   │   ├── api/                    # API routes
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts    # NextAuth handler
│   │   │   ├── goats/
│   │   │   │   ├── route.ts        # GET /api/goats, POST /api/goats
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts    # GET, PUT, DELETE /api/goats/:id
│   │   │   ├── orders/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   ├── upload/
│   │   │   │   └── route.ts        # Image upload endpoint
│   │   │   ├── checkout/
│   │   │   │   └── route.ts        # Create Stripe session
│   │   │   └── webhooks/
│   │   │       └── stripe/
│   │   │           └── route.ts    # Stripe webhook handler
│   │   │
│   │   ├── layout.tsx              # Root layout
│   │   ├── globals.css             # Global styles
│   │   ├── providers.tsx           # Context providers
│   │   └── error.tsx               # Error boundary
│   │
│   ├── components/
│   │   ├── ui/                     # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── form.tsx
│   │   │   ├── label.tsx
│   │   │   ├── textarea.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Navigation.tsx
│   │   │   └── Sidebar.tsx
│   │   │
│   │   ├── goats/
│   │   │   ├── GoatCard.tsx
│   │   │   ├── GoatGrid.tsx
│   │   │   ├── GoatDetail.tsx
│   │   │   ├── GoatForm.tsx
│   │   │   ├── GoatFilters.tsx
│   │   │   └── ImageGallery.tsx
│   │   │
│   │   ├── orders/
│   │   │   ├── OrderCard.tsx
│   │   │   ├── OrderList.tsx
│   │   │   └── OrderDetail.tsx
│   │   │
│   │   ├── forms/
│   │   │   ├── ImageUpload.tsx
│   │   │   ├── CheckoutForm.tsx
│   │   │   └── ContactForm.tsx
│   │   │
│   │   └── common/
│   │       ├── LoadingSpinner.tsx
│   │       ├── ErrorMessage.tsx
│   │       ├── EmptyState.tsx
│   │       ├── StatusBadge.tsx
│   │       └── Avatar.tsx
│   │
│   ├── lib/
│   │   ├── prisma.ts               # Prisma client singleton
│   │   ├── auth.ts                 # NextAuth config
│   │   ├── stripe.ts               # Stripe client
│   │   ├── cloudinary.ts           # Cloudinary config
│   │   ├── email.ts                # Email helpers
│   │   ├── utils.ts                # Utility functions
│   │   └── constants.ts            # App constants
│   │
│   ├── types/
│   │   ├── index.ts                # Shared types
│   │   ├── goat.ts
│   │   ├── user.ts
│   │   ├── order.ts
│   │   └── next-auth.d.ts          # NextAuth type extensions
│   │
│   ├── hooks/
│   │   ├── useAuth.ts              # Auth hook
│   │   ├── useGoats.ts             # Goat data hook
│   │   ├── useOrders.ts            # Order data hook
│   │   └── useToast.ts             # Toast notifications
│   │
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   └── ToastContext.tsx
│   │
│   └── emails/                     # React Email templates
│       ├── order-confirmation.tsx
│       ├── seller-notification.tsx
│       └── components/
│           ├── EmailLayout.tsx
│           └── EmailButton.tsx
│
└── tests/                          # (Optional for MVP)
    ├── unit/
    ├── integration/
    └── e2e/
```

## Key Files Explained

### Environment Variables (.env.local)
```bash
# Database
DATABASE_URL="postgresql://user:pass@host:5432/getgoat"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Stripe
STRIPE_PUBLIC_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Resend
RESEND_API_KEY="re_..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Root Layout (src/app/layout.tsx)
```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GetGoat - Premium Goat Marketplace',
  description: 'Buy and sell quality goats online',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
```

### Providers (src/app/providers.tsx)
```tsx
'use client'

import { SessionProvider } from 'next-auth/react'
import { ToastProvider } from '@/context/ToastContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </SessionProvider>
  )
}
```

### Prisma Client (src/lib/prisma.ts)
```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
```

### Utility Functions (src/lib/utils.ts)
```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Merge Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format price
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}

// Format date
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

// Calculate age from birth date
export function calculateAge(birthDate: Date): string {
  const now = new Date()
  const birth = new Date(birthDate)

  let years = now.getFullYear() - birth.getFullYear()
  let months = now.getMonth() - birth.getMonth()

  if (months < 0) {
    years--
    months += 12
  }

  if (years === 0) {
    return `${months} month${months === 1 ? '' : 's'}`
  } else if (months === 0) {
    return `${years} year${years === 1 ? '' : 's'}`
  } else {
    return `${years} year${years === 1 ? '' : 's'} ${months} month${months === 1 ? '' : 's'}`
  }
}

// Generate order number
export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `GT-${timestamp}-${random}`
}
```

## Component Examples

### GoatCard Component
```tsx
// src/components/goats/GoatCard.tsx
import Image from 'next/image'
import Link from 'next/link'
import { formatPrice, calculateAge } from '@/lib/utils'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Goat } from '@prisma/client'

interface GoatCardProps {
  goat: Goat
}

export function GoatCard({ goat }: GoatCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/goats/${goat.id}`}>
        <div className="relative aspect-[4/3]">
          <Image
            src={goat.primaryImage}
            alt={goat.name}
            fill
            className="object-cover"
          />
          {goat.status === 'SOLD' && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="destructive">Sold</Badge>
            </div>
          )}
          {goat.featured && goat.status === 'AVAILABLE' && (
            <Badge className="absolute top-2 right-2">Featured</Badge>
          )}
        </div>

        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-1">{goat.name}</h3>
          <p className="text-sm text-muted-foreground mb-2">
            {goat.gender} • {calculateAge(goat.birthDate)}
          </p>
          <p className="text-sm text-muted-foreground">{goat.breed}</p>
        </CardContent>

        <CardFooter className="p-4 pt-0 flex justify-between items-center">
          <span className="text-2xl font-bold text-primary">
            {formatPrice(goat.price)}
          </span>
          {goat.status === 'AVAILABLE' && (
            <Badge variant="outline">Available</Badge>
          )}
        </CardFooter>
      </Link>
    </Card>
  )
}
```

### GoatGrid Component
```tsx
// src/components/goats/GoatGrid.tsx
import { GoatCard } from './GoatCard'
import { EmptyState } from '@/components/common/EmptyState'
import type { Goat } from '@prisma/client'

interface GoatGridProps {
  goats: Goat[]
  loading?: boolean
}

export function GoatGrid({ goats, loading }: GoatGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 aspect-[4/3] rounded-t-lg" />
            <div className="p-4 space-y-2">
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (goats.length === 0) {
    return (
      <EmptyState
        title="No goats found"
        description="Try adjusting your search or filters"
      />
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {goats.map((goat) => (
        <GoatCard key={goat.id} goat={goat} />
      ))}
    </div>
  )
}
```

## API Route Examples

### Get All Goats
```typescript
// src/app/api/goats/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const breed = searchParams.get('breed')
    const gender = searchParams.get('gender')
    const status = searchParams.get('status') || 'AVAILABLE'

    const goats = await prisma.goat.findMany({
      where: {
        ...(breed && { breed }),
        ...(gender && { gender: gender as 'MALE' | 'FEMALE' }),
        status: status as 'AVAILABLE' | 'SOLD' | 'RESERVED',
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            businessName: true,
            location: true,
            verified: true,
          },
        },
      },
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' },
      ],
    })

    return NextResponse.json(goats)
  } catch (error) {
    console.error('Error fetching goats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch goats' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  // Protected route - check authentication
  // Create new goat listing
}
```

## Package.json Scripts

```json
{
  "name": "getgoat",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "start": "next start",
    "lint": "next lint",
    "db:push": "prisma db push",
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio",
    "stripe:listen": "stripe listen --forward-to localhost:3000/api/webhooks/stripe"
  },
  "dependencies": {
    "next": "14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "@prisma/client": "^5.14.0",
    "next-auth": "^4.24.0",
    "@auth/prisma-adapter": "^1.6.0",
    "stripe": "^15.8.0",
    "@stripe/stripe-js": "^3.5.0",
    "cloudinary": "^2.2.0",
    "resend": "^3.2.0",
    "react-email": "^2.1.0",
    "zod": "^3.23.0",
    "react-hook-form": "^7.51.0",
    "@hookform/resolvers": "^3.3.0",
    "bcryptjs": "^2.4.3",
    "date-fns": "^3.6.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.3.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "@types/node": "^20.12.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@types/bcryptjs": "^2.4.6",
    "prisma": "^5.14.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^8.57.0",
    "eslint-config-next": "14.2.0"
  }
}
```

## Git Workflow

### .gitignore
```
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# prisma
/prisma/migrations
```

### Branch Strategy (Simple)
```
main          → Production
develop       → Development (optional)
feature/*     → Feature branches
bugfix/*      → Bug fixes
```

## Development Workflow

### Day 1: Setup
```bash
# Create Next.js app
npx create-next-app@latest getgoat --typescript --tailwind --app

# Install dependencies
npm install [all dependencies from package.json]

# Initialize Prisma
npx prisma init

# Set up database
# Copy .env.example to .env.local
# Update DATABASE_URL

# Run migrations
npx prisma db push

# Open Prisma Studio
npx prisma studio
```

### Daily Development
```bash
# Start dev server
npm run dev

# Open Prisma Studio (separate terminal)
npm run db:studio

# Listen to Stripe webhooks (separate terminal)
npm run stripe:listen
```

### Deployment
```bash
# Push to GitHub
git push origin main

# Vercel automatically deploys
# Configure environment variables in Vercel dashboard
# Run database migrations on production
```

---

This structure provides a clear, organized foundation for building the GetGoat MVP efficiently.
