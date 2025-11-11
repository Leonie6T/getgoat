# GetGoat - MVP Reference Document
## Streamlined Goat Marketplace

**Version**: 2.0 (MVP Focus)
**Last Updated**: 2025-11-04
**Timeline**: 4-6 weeks to launch

---

## Executive Summary

GetGoat is a web marketplace connecting goat sellers with buyers. This MVP focuses on core functionality to validate the business model before investing in advanced features.

**Core Value Proposition**: Simple, trusted platform to buy and sell goats online.

---

## 1. MVP Scope (4-6 Weeks)

### What We're Building
✅ **Essential Features Only**
- Public marketplace to browse goats (no login required)
- Seller accounts to create and manage listings
- Basic buyer accounts for purchases
- Contact seller via email
- Stripe Checkout (hosted) for payments
- Order confirmation and tracking
- Mobile-responsive design (not PWA yet)

### What We're NOT Building (Yet)
❌ **Deferred to Post-MVP**
- PWA/offline capabilities
- Push notifications
- Real-time features (WebSockets)
- Advanced search/filters
- Wishlist/favorites
- Shopping cart (direct purchase only)
- Video uploads
- Social login (OAuth)
- Admin analytics dashboard
- Image processing pipeline
- Seller ratings/reviews

---

## 2. Technology Stack (Simplified)

### Frontend
```
Framework: Next.js 14+ (App Router)
Language: TypeScript
Styling: Tailwind CSS
Components: shadcn/ui
Forms: React Hook Form + Zod
State: React Context (no Redux needed yet)
```

### Backend
```
Runtime: Next.js API Routes (same repo)
Database: PostgreSQL (Supabase or Railway)
ORM: Prisma
File Storage: Cloudinary (simpler than S3)
Authentication: NextAuth.js
Email: Resend (simpler than SendGrid)
```

### Payments
```
Provider: Stripe Checkout (hosted)
  - Faster integration (30 min vs 3 days)
  - PCI compliant by default
  - Mobile optimized
  - Can upgrade to embedded later
```

### Hosting
```
Application: Vercel (includes hosting + functions)
Database: Supabase (includes PostgreSQL + storage)
Cost: ~$25-50/month to start
```

---

## 3. Simplified Architecture

```
┌─────────────────────────────────────┐
│         User's Browser              │
│  (Next.js App - SSR + Client)       │
└──────────┬──────────────────────────┘
           │ HTTPS
           ↓
┌─────────────────────────────────────┐
│           Vercel                     │
│  ┌────────────────────────────────┐ │
│  │  Next.js Application           │ │
│  │  - Pages (SSR)                 │ │
│  │  - API Routes                  │ │
│  │  - Authentication              │ │
│  └────────────────────────────────┘ │
└──────────┬────────────┬─────────────┘
           │            │
           ↓            ↓
   ┌─────────────┐  ┌──────────────┐
   │  Supabase   │  │   Stripe     │
   │ PostgreSQL  │  │  Checkout    │
   │   Storage   │  │  Webhooks    │
   └─────────────┘  └──────────────┘
```

**One repo. One deployment. Simple.**

---

## 4. Database Schema (Minimal)

```prisma
// prisma/schema.prisma

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum UserRole {
  BUYER
  SELLER
}

enum Gender {
  MALE
  FEMALE
}

enum GoatStatus {
  AVAILABLE
  SOLD
  RESERVED
}

enum OrderStatus {
  PENDING
  PAID
  SHIPPED
  DELIVERED
  CANCELLED
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String
  role          UserRole
  phone         String?

  // Seller specific
  businessName  String?
  location      String?
  verified      Boolean   @default(false)

  // Relations
  listings      Goat[]    @relation("SellerListings")
  orders        Order[]   @relation("BuyerOrders")

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([email])
}

model Goat {
  id              String      @id @default(cuid())
  name            String
  breed           String
  gender          Gender
  birthDate       DateTime
  age             String      // e.g., "2 years 3 months"
  price           Int         // in cents
  description     String      @db.Text

  // Basic details
  weight          Int?        // in lbs
  color           String?

  // Health (simplified)
  healthNotes     String?     @db.Text
  vaccinated      Boolean     @default(false)

  // Birth history (simplified)
  numberOfKids    Int         @default(0)

  // Images (URLs)
  images          String[]    // Array of Cloudinary URLs
  primaryImage    String      // Main display image

  // Status
  status          GoatStatus  @default(AVAILABLE)
  featured        Boolean     @default(false)

  // Relations
  sellerId        String
  seller          User        @relation("SellerListings", fields: [sellerId], references: [id])
  order           Order?

  // Metadata
  viewCount       Int         @default(0)
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  @@index([status])
  @@index([sellerId])
  @@index([breed])
  @@index([price])
}

model Order {
  id              String      @id @default(cuid())
  orderNumber     String      @unique

  // Relations
  buyerId         String
  buyer           User        @relation("BuyerOrders", fields: [buyerId], references: [id])

  goatId          String      @unique
  goat            Goat        @relation(fields: [goatId], references: [id])

  // Pricing
  amount          Int         // in cents

  // Status
  status          OrderStatus @default(PENDING)

  // Payment
  stripeSessionId String?     // Stripe Checkout session ID
  stripePaymentId String?     // Payment intent ID

  // Shipping
  shippingName    String
  shippingEmail   String
  shippingPhone   String
  shippingAddress Json
  shippingNotes   String?     @db.Text

  // Tracking
  trackingNumber  String?

  // Timestamps
  paidAt          DateTime?
  shippedAt       DateTime?
  deliveredAt     DateTime?

  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  @@index([buyerId])
  @@index([status])
  @@index([orderNumber])
}
```

**Key Simplifications:**
- No separate image/video tables
- No complex health record system
- No shopping cart (one goat per order)
- No wishlist
- Simpler relationships

---

## 5. Core User Flows

### 5.1 Buyer Journey (Simplified)
```
1. Visit homepage → Browse featured goats
2. Click "View All Goats" → See all listings
3. Click goat card → View details
4. Click "Buy Now" → Goes to checkout
5. Enter shipping info → Continue
6. Pay with Stripe Checkout → Redirect to Stripe
7. Complete payment → Return to success page
8. Receive confirmation email
```

**No account required for browsing. Account created during checkout.**

### 5.2 Seller Journey
```
1. Sign up as seller
2. Verify email
3. Click "Add Listing"
4. Upload images (drag & drop)
5. Fill form: name, breed, age, price, description
6. Preview listing
7. Publish
8. Receive email when goat is purchased
9. Mark as shipped when delivered
```

---

## 6. Page Structure

### Public Pages
```
/                          → Homepage
/goats                     → Browse all goats
/goats/[id]               → Goat detail page
/about                     → About the platform
/how-it-works             → Buying/selling guide
/contact                   → Contact form
```

### Seller Pages (Auth Required)
```
/dashboard                 → Seller dashboard
/dashboard/goats          → My listings
/dashboard/goats/new      → Add new goat
/dashboard/goats/[id]/edit → Edit listing
/dashboard/orders         → Orders received
```

### Buyer Pages (Auth Required)
```
/my-orders                → My purchases
/my-orders/[id]          → Order details
```

### Checkout Flow
```
/checkout/[goatId]        → Shipping information
→ Redirect to Stripe Checkout
→ Return to /checkout/success?session_id=xxx
```

### Legal
```
/terms                     → Terms of service
/privacy                   → Privacy policy
/refunds                   → Refund policy
```

---

## 7. UI Design (Mobile-First)

### Design Tokens
```css
/* Colors */
--primary: #4A7C59;       /* Earthy green */
--secondary: #D4A574;     /* Warm tan */
--accent: #8B4513;        /* Saddle brown */
--background: #FAFAF9;
--surface: #FFFFFF;
--text: #1F2937;
--text-secondary: #6B7280;
--success: #10B981;
--error: #EF4444;

/* Typography */
--font-body: 'Inter', sans-serif;
--font-heading: 'Poppins', sans-serif;

/* Spacing (Tailwind defaults) */
4px, 8px, 12px, 16px, 20px, 24px, 32px, 48px, 64px

/* Breakpoints */
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
```

### Key Components

**Goat Card**
```
┌────────────────────┐
│                    │
│   [Image 4:3]      │
│                    │
├────────────────────┤
│ Bella              │
│ Female • 2 years   │
│ Nubian             │
│                    │
│ $1,250             │
│ [View Details]     │
└────────────────────┘
```

**Goat Detail Page (Mobile)**
```
┌─────────────────────────────┐
│ [< Back]      [Contact]     │
├─────────────────────────────┤
│                             │
│    [Image Gallery]          │
│    [◄] [●][○][○] [►]       │
│                             │
├─────────────────────────────┤
│ Bella                       │
│ ★ Verified Seller           │
├─────────────────────────────┤
│ $1,250                      │
│ ✓ Available                 │
│                             │
│ [Buy Now]                   │
├─────────────────────────────┤
│ Details                     │
│ • Breed: Nubian            │
│ • Gender: Female           │
│ • Age: 2 years 3 months    │
│ • Weight: 135 lbs          │
│ • Color: Brown & White     │
│ • Vaccinated: Yes          │
│                             │
│ About                       │
│ [Description text...]       │
│                             │
│ Health                      │
│ [Health notes...]           │
│                             │
│ Birth History               │
│ • Kids born: 5 total       │
│                             │
├─────────────────────────────┤
│ Seller Information          │
│ Green Valley Farm           │
│ ✓ Verified                  │
│ Vermont, USA                │
│ [Contact Seller]            │
├─────────────────────────────┤
│ Similar Goats               │
│ [Card] [Card] [Card]        │
└─────────────────────────────┘
```

---

## 8. Stripe Checkout Integration (Simple)

### Why Stripe Checkout vs. Custom?
✅ **Stripe Checkout (Hosted)**
- 30 minutes to integrate
- PCI compliant by default
- Mobile optimized UI
- Supports Apple Pay, Google Pay
- Handles 3D Secure automatically
- No custom form validation needed
- Payment details never touch our server

❌ **Custom Integration (Stripe Elements)**
- 2-3 days to build properly
- Complex error handling
- Need to build entire UI
- More testing required

**For MVP, use Stripe Checkout. Upgrade later if needed.**

### Implementation

**Frontend**
```typescript
// app/checkout/[goatId]/page.tsx
'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'

export default function CheckoutPage({ params }: { params: { goatId: string } }) {
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    setLoading(true)

    // Create checkout session
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        goatId: params.goatId,
        shippingAddress: formData,
      }),
    })

    const { sessionId } = await response.json()

    // Redirect to Stripe
    const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!)
    await stripe?.redirectToCheckout({ sessionId })
  }

  return (
    <form onSubmit={handleCheckout}>
      {/* Shipping form fields */}
      <button type="submit" disabled={loading}>
        {loading ? 'Processing...' : 'Continue to Payment'}
      </button>
    </form>
  )
}
```

**Backend**
```typescript
// app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

export async function POST(req: NextRequest) {
  try {
    const { goatId, shippingAddress } = await req.json()

    // Get goat details
    const goat = await prisma.goat.findUnique({
      where: { id: goatId, status: 'AVAILABLE' },
      include: { seller: true },
    })

    if (!goat) {
      return NextResponse.json({ error: 'Goat not available' }, { status: 400 })
    }

    // Create order record
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        goatId: goat.id,
        buyerId: userId, // From session
        amount: goat.price,
        status: 'PENDING',
        shippingAddress,
        shippingName: shippingAddress.name,
        shippingEmail: shippingAddress.email,
        shippingPhone: shippingAddress.phone,
      },
    })

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${goat.name} - ${goat.breed}`,
              images: [goat.primaryImage],
              description: goat.description,
            },
            unit_amount: goat.price,
          },
          quantity: 1,
        },
      ],
      metadata: {
        orderId: order.id,
        goatId: goat.id,
      },
      success_url: `${req.headers.get('origin')}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/goats/${goat.id}`,
      customer_email: shippingAddress.email,
    })

    // Store session ID
    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id },
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 })
  }
}

function generateOrderNumber(): string {
  return `GT-${Date.now().toString(36).toUpperCase()}`
}
```

**Webhook Handler**
```typescript
// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { sendOrderConfirmation } from '@/lib/email'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Handle checkout completion
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const orderId = session.metadata?.orderId

    // Update order
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'PAID',
        stripePaymentId: session.payment_intent as string,
        paidAt: new Date(),
      },
    })

    // Mark goat as sold
    await prisma.goat.update({
      where: { id: session.metadata?.goatId },
      data: { status: 'SOLD' },
    })

    // Send confirmation emails
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { goat: true, buyer: true },
    })

    await sendOrderConfirmation(order)
  }

  return NextResponse.json({ received: true })
}
```

---

## 9. Authentication (NextAuth.js)

**Simple email/password auth. No OAuth for MVP.**

```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.passwordHash) {
          return null
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        )

        if (!isValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    signUp: '/signup',
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

---

## 10. File Upload (Cloudinary)

**Why Cloudinary instead of AWS S3?**
- Simpler API (no presigned URLs)
- Automatic image optimization
- Built-in transformations
- Free tier: 25GB storage, 25GB bandwidth
- No Lambda needed for processing

```typescript
// lib/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadImage(file: File) {
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: 'getgoat',
        transformation: [
          { width: 1200, height: 900, crop: 'limit' },
          { quality: 'auto' },
          { fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) reject(error)
        else resolve(result?.secure_url)
      }
    ).end(buffer)
  })
}
```

---

## 11. Email Notifications (Resend)

**Simple transactional emails with React Email templates.**

```typescript
// lib/email.ts
import { Resend } from 'resend'
import { OrderConfirmationEmail } from '@/emails/order-confirmation'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendOrderConfirmation(order: Order) {
  await resend.emails.send({
    from: 'GetGoat <orders@getgoat.com>',
    to: order.shippingEmail,
    subject: `Order Confirmation - ${order.orderNumber}`,
    react: OrderConfirmationEmail({ order }),
  })
}
```

```tsx
// emails/order-confirmation.tsx
import { Html, Head, Body, Container, Text, Button } from '@react-email/components'

export function OrderConfirmationEmail({ order }) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'sans-serif' }}>
        <Container>
          <Text>Thank you for your purchase!</Text>
          <Text>Order Number: {order.orderNumber}</Text>
          <Text>Goat: {order.goat.name}</Text>
          <Text>Total: ${(order.amount / 100).toFixed(2)}</Text>
          <Button href={`https://getgoat.com/my-orders/${order.id}`}>
            View Order Details
          </Button>
        </Container>
      </Body>
    </Html>
  )
}
```

---

## 12. MVP Launch Checklist

### Pre-Development
- [ ] Set up Vercel account
- [ ] Set up Supabase database
- [ ] Set up Stripe account (test mode)
- [ ] Set up Cloudinary account
- [ ] Set up Resend account
- [ ] Register domain name
- [ ] Create logo and brand assets

### Development (Week 1-2)
- [ ] Initialize Next.js project
- [ ] Set up Prisma with database
- [ ] Create database schema and migrations
- [ ] Set up authentication (NextAuth.js)
- [ ] Build homepage and browse pages
- [ ] Build goat detail page
- [ ] Build seller dashboard
- [ ] Build add/edit listing forms
- [ ] Implement image upload (Cloudinary)

### Development (Week 3-4)
- [ ] Integrate Stripe Checkout
- [ ] Build webhook handler
- [ ] Implement email notifications
- [ ] Build order pages
- [ ] Build user registration/login
- [ ] Add form validations
- [ ] Mobile responsive styling
- [ ] Error handling

### Testing & Polish (Week 5-6)
- [ ] Test entire user flow (buy + sell)
- [ ] Test Stripe webhooks
- [ ] Test email delivery
- [ ] Cross-browser testing
- [ ] Mobile device testing
- [ ] Write legal pages (terms, privacy)
- [ ] Set up error monitoring (Sentry)
- [ ] Performance optimization
- [ ] SEO meta tags

### Launch Preparation
- [ ] Switch Stripe to live mode
- [ ] Configure production environment variables
- [ ] Set up custom domain on Vercel
- [ ] SSL certificate (automatic with Vercel)
- [ ] Configure email DNS (SPF, DKIM)
- [ ] Test production deployment
- [ ] Prepare launch announcement
- [ ] Set up customer support email

### Post-Launch
- [ ] Monitor error logs
- [ ] Monitor Stripe dashboard
- [ ] Collect user feedback
- [ ] Fix critical bugs
- [ ] Plan Phase 2 features

---

## 13. Cost Estimate (Monthly)

### Startup Costs (First 6 Months)
```
Vercel Pro:           $20/month   (unlimited deployments)
Supabase Pro:         $25/month   (8GB database, 100GB bandwidth)
Cloudinary:           $0/month    (free tier sufficient)
Resend:               $0/month    (free tier: 3k emails/month)
Stripe:               Pay per use (2.9% + $0.30 per transaction)
Domain:               $15/year    (~$1.25/month)
---------------------------------------------------
Total Fixed:          ~$45-50/month
```

### Variable Costs (Per Sale)
```
Selling a $1,000 goat:
- Stripe fee: $31 (2.9% + $0.30)
- Your platform fee: 5-10% ($50-100)
- Net to seller: $869-919
```

### At Scale (1,000 users, 50 sales/month)
```
Infrastructure:       $50/month
Stripe fees:          $1,550/month (50 × $1000 × 3.1%)
Platform revenue:     $2,500-5,000/month (5-10% commission)
---------------------------------------------------
Gross margin:         $950-3,450/month
```

---

## 14. Success Metrics

### Week 1-4 (Beta Testing)
- 10 seller signups
- 25 goat listings
- 5 completed transactions
- < 3s page load time
- Zero payment failures
- Collect qualitative feedback

### Month 2-3 (Growth)
- 50 active sellers
- 200+ goat listings
- 25 sales/month
- 40%+ browse-to-view rate
- 10%+ view-to-purchase rate
- < 5% support tickets per order

### Month 4-6 (Product-Market Fit)
- Organic growth (SEO, word of mouth)
- Repeat sellers
- Geographic expansion
- Positive unit economics
- Clear path to profitability

---

## 15. Phase 2 Roadmap (Post-MVP)

**Only build after validating MVP with real users**

### Phase 2A (Month 2-3)
- Shopping cart (multi-goat purchases)
- Wishlist/favorites
- Advanced search and filters
- Seller profiles and ratings
- In-app messaging
- Email/SMS notifications

### Phase 2B (Month 4-6)
- Progressive Web App (PWA)
- Offline support
- Push notifications
- Admin analytics dashboard
- Featured listings (paid promotion)
- Subscription plans for sellers

### Phase 2C (Month 7-9)
- Mobile apps (React Native)
- Video uploads
- Live chat support
- Auction/bidding system
- Breeding pedigree tracking
- Multi-language support

---

## 16. Risk Mitigation

### Technical Risks
| Risk | Mitigation |
|------|------------|
| Payment failures | Use Stripe Checkout (battle-tested), comprehensive error handling |
| Database downtime | Supabase has 99.9% SLA, automated backups |
| Image storage costs | Cloudinary free tier covers ~1000 goats, optimize compression |
| Slow page loads | Next.js SSR, image optimization, Vercel edge network |

### Business Risks
| Risk | Mitigation |
|------|------------|
| No sellers sign up | Direct outreach to goat farms, farming forums |
| No buyers | SEO optimization, goat breeder partnerships |
| Fraud/scams | Seller verification, buyer protection policy |
| Legal compliance | Consult lawyer for livestock sale regulations |
| Shipping issues | Clear policies, partner with livestock transporters |

### Operational Risks
| Risk | Mitigation |
|------|------------|
| Customer support load | FAQ page, email templates, consider part-time support |
| Goat health disputes | Clear health disclosure requirements, disclaimer |
| Payment disputes | Clear refund policy, Stripe dispute handling |

---

## 17. What Changed from Original Plan?

### Removed Complexity
❌ Microservices architecture → ✅ Monolithic Next.js app
❌ Separate backend API → ✅ Next.js API routes
❌ Redis caching → ✅ Not needed yet
❌ WebSocket real-time → ✅ Polling or later
❌ Complex service worker → ✅ Standard web app
❌ AWS infrastructure → ✅ Vercel + Supabase
❌ S3 + Lambda → ✅ Cloudinary
❌ Custom Stripe UI → ✅ Stripe Checkout
❌ OAuth social login → ✅ Email/password only
❌ Shopping cart → ✅ Direct purchase
❌ Advanced analytics → ✅ Basic metrics

### Kept Essential
✅ PostgreSQL database
✅ Prisma ORM
✅ TypeScript
✅ Stripe payments
✅ Image uploads
✅ Email notifications
✅ Mobile responsive
✅ User authentication
✅ Order management

### Result
- **Development time**: 16 weeks → 4-6 weeks
- **Team size needed**: 2-3 developers → 1-2 developers
- **Monthly costs**: $500-1000 → $45-50
- **Complexity**: High → Low
- **Time to feedback**: 4 months → 1 month

---

## 18. Getting Started

### Day 1: Setup
```bash
# Create Next.js app
npx create-next-app@latest getgoat --typescript --tailwind --app

# Install dependencies
npm install prisma @prisma/client next-auth @auth/prisma-adapter
npm install stripe @stripe/stripe-js
npm install cloudinary resend react-email
npm install zod react-hook-form @hookform/resolvers
npm install bcryptjs date-fns

# Initialize Prisma
npx prisma init

# Install shadcn/ui
npx shadcn-ui@latest init
```

### Day 2-3: Database & Auth
- Set up Supabase database
- Create Prisma schema
- Run migrations
- Set up NextAuth.js
- Build login/signup pages

### Week 1: Core Pages
- Homepage
- Browse goats page
- Goat detail page
- Navigation & layout

### Week 2: Seller Features
- Seller dashboard
- Add listing form
- Edit listing
- Image upload

### Week 3: Payments
- Stripe Checkout integration
- Webhook handler
- Order confirmation

### Week 4: Polish
- Email notifications
- Error handling
- Mobile responsive
- Testing

### Week 5-6: Launch Prep
- Legal pages
- SEO optimization
- Performance testing
- Beta user testing

---

## 19. Support & Maintenance

### Ongoing Tasks
- Monitor error logs (Sentry)
- Check Stripe dashboard weekly
- Respond to customer inquiries (< 24 hours)
- Update dependencies monthly
- Database backups (automatic with Supabase)
- Review and moderate new listings

### Key Contacts
- Stripe Support: support@stripe.com
- Vercel Support: support@vercel.com
- Supabase Support: support@supabase.com

---

## Conclusion

This MVP is **4-6 weeks of focused development** instead of 16+ weeks.

**The goal**: Get to market fast, validate demand, then iterate based on real user feedback.

You can always add complexity later. But you can't get early validation time back.

**Next Steps:**
1. Review and approve this simplified plan
2. Set up accounts (Vercel, Supabase, Stripe, Cloudinary, Resend)
3. Start development Week 1
4. Launch in 4-6 weeks
5. Gather feedback and iterate

---

**Questions? Ready to start?**
