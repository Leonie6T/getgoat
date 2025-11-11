# GetGoat - Technical Architecture Specification

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Browser    │  │    Mobile    │  │   Tablet     │     │
│  │   (PWA)      │  │    (PWA)     │  │    (PWA)     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                           ↕ HTTPS
┌─────────────────────────────────────────────────────────────┐
│                      CDN Layer (Cloudflare)                  │
│              Static Assets, Image Optimization               │
└─────────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │            React Frontend (TypeScript)                  │ │
│  │  - Service Worker (Workbox)                            │ │
│  │  - State Management (Redux Toolkit)                    │ │
│  │  - UI Components (shadcn/ui + Tailwind)                │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                           ↕ REST API / WebSocket
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway                             │
│  - Rate Limiting                                             │
│  - Authentication/Authorization                              │
│  - Request Validation                                        │
└─────────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────────┐
│                    Backend Services                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Auth      │  │   Goat      │  │   Order     │        │
│  │  Service    │  │  Service    │  │  Service    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Payment    │  │   Media     │  │ Notification│        │
│  │  Service    │  │  Service    │  │  Service    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  PostgreSQL  │  │    Redis     │  │   AWS S3     │     │
│  │  (Primary)   │  │   (Cache)    │  │  (Storage)   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────────┐
│                   External Services                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │    Stripe    │  │   SendGrid   │  │   Pusher     │     │
│  │  (Payment)   │  │   (Email)    │  │  (Real-time) │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

## 2. Frontend Architecture

### 2.1 Project Structure
```
src/
├── app/
│   ├── store.ts                    # Redux store configuration
│   └── hooks.ts                    # Typed hooks
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── authSlice.ts
│   ├── goats/
│   │   ├── components/
│   │   │   ├── GoatCard.tsx
│   │   │   ├── GoatGrid.tsx
│   │   │   ├── GoatDetail.tsx
│   │   │   └── GoatFilters.tsx
│   │   ├── hooks/
│   │   │   └── useGoats.ts
│   │   ├── services/
│   │   │   └── goatsApi.ts
│   │   └── goatsSlice.ts
│   ├── cart/
│   ├── orders/
│   └── admin/
├── components/
│   ├── ui/                         # shadcn/ui components
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Navigation.tsx
│   └── common/
│       ├── Button.tsx
│       ├── Card.tsx
│       └── ImageGallery.tsx
├── lib/
│   ├── api.ts                      # API client configuration
│   ├── utils.ts
│   └── validation.ts
├── pages/
│   ├── HomePage.tsx
│   ├── GoatsPage.tsx
│   ├── GoatDetailPage.tsx
│   ├── CartPage.tsx
│   ├── CheckoutPage.tsx
│   └── AdminDashboard.tsx
├── styles/
│   └── globals.css
├── types/
│   ├── goat.ts
│   ├── user.ts
│   └── order.ts
├── service-worker.ts               # Service Worker
└── manifest.json                   # PWA Manifest
```

### 2.2 State Management Architecture

```typescript
// Redux Store Structure
{
  auth: {
    user: User | null
    token: string | null
    isAuthenticated: boolean
    loading: boolean
  },
  goats: {
    items: Goat[]
    selectedGoat: Goat | null
    filters: FilterState
    pagination: PaginationState
    loading: boolean
    error: string | null
  },
  cart: {
    items: CartItem[]
    total: number
  },
  orders: {
    items: Order[]
    currentOrder: Order | null
  },
  ui: {
    theme: 'light' | 'dark'
    isOnline: boolean
    notifications: Notification[]
  }
}
```

### 2.3 Service Worker Strategy

```javascript
// Network strategies by resource type
const strategies = {
  // API calls - Network first, fallback to cache
  '/api/goats': 'NetworkFirst',
  '/api/orders': 'NetworkFirst',

  // Static assets - Cache first
  '/assets/': 'CacheFirst',
  '/images/icons/': 'CacheFirst',

  // Goat images - Stale while revalidate
  '/images/goats/': 'StaleWhileRevalidate',

  // HTML pages - Network first with timeout
  '/': 'NetworkFirst',

  // Background sync for critical operations
  backgroundSync: [
    'order-queue',
    'wishlist-sync',
    'analytics-queue'
  ]
}
```

## 3. Backend Architecture

### 3.1 Project Structure (Node.js/Express)
```
server/
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   └── env.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── validation.ts
│   │   ├── errorHandler.ts
│   │   └── rateLimiter.ts
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.routes.ts
│   │   │   └── auth.validation.ts
│   │   ├── goats/
│   │   │   ├── goat.controller.ts
│   │   │   ├── goat.service.ts
│   │   │   ├── goat.routes.ts
│   │   │   └── goat.validation.ts
│   │   ├── orders/
│   │   ├── payments/
│   │   ├── media/
│   │   └── notifications/
│   ├── models/
│   │   ├── User.ts
│   │   ├── Goat.ts
│   │   ├── Order.ts
│   │   └── index.ts
│   ├── utils/
│   │   ├── jwt.ts
│   │   ├── email.ts
│   │   └── logger.ts
│   ├── types/
│   └── app.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
└── tests/
```

### 3.2 API Endpoints

#### Authentication
```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - Login user
POST   /api/auth/refresh           - Refresh access token
POST   /api/auth/logout            - Logout user
GET    /api/auth/me                - Get current user
POST   /api/auth/forgot-password   - Request password reset
POST   /api/auth/reset-password    - Reset password
```

#### Goats
```
GET    /api/goats                  - List goats (with filters)
GET    /api/goats/:id              - Get goat details
POST   /api/goats                  - Create goat (admin)
PUT    /api/goats/:id              - Update goat (admin)
DELETE /api/goats/:id              - Delete goat (admin)
GET    /api/goats/:id/similar      - Get similar goats
POST   /api/goats/:id/favorite     - Add to favorites
DELETE /api/goats/:id/favorite     - Remove from favorites
```

#### Cart
```
GET    /api/cart                   - Get user's cart
POST   /api/cart/items             - Add item to cart
PUT    /api/cart/items/:id         - Update cart item
DELETE /api/cart/items/:id         - Remove from cart
DELETE /api/cart                   - Clear cart
```

#### Orders
```
GET    /api/orders                 - List user's orders
GET    /api/orders/:id             - Get order details
POST   /api/orders                 - Create order
PUT    /api/orders/:id/cancel      - Cancel order
GET    /api/admin/orders           - List all orders (admin)
PUT    /api/admin/orders/:id       - Update order status (admin)
```

#### Payments
```
POST   /api/payments/intent        - Create payment intent
POST   /api/payments/webhook       - Stripe webhook handler
GET    /api/payments/:id/status    - Get payment status
```

#### Media
```
POST   /api/media/upload           - Upload image
POST   /api/media/upload-multiple  - Bulk upload
DELETE /api/media/:id              - Delete image
GET    /api/media/:id              - Get image URL
```

### 3.3 Database Schema (Prisma)

```prisma
// schema.prisma

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum UserRole {
  BUYER
  ADMIN
  SUPER_ADMIN
}

enum Gender {
  MALE
  FEMALE
}

enum GoatStatus {
  AVAILABLE
  RESERVED
  SOLD
  PENDING
}

enum OrderStatus {
  PENDING
  PAID
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
  REFUNDED
}

model User {
  id            String    @id @default(uuid())
  email         String    @unique
  passwordHash  String
  role          UserRole  @default(BUYER)

  // Profile
  firstName     String
  lastName      String
  phone         String?
  avatar        String?

  // Buyer fields
  wishlist      Goat[]    @relation("UserWishlist")
  orders        Order[]   @relation("BuyerOrders")

  // Admin fields
  businessName  String?
  verified      Boolean   @default(false)
  listings      Goat[]    @relation("AdminListings")

  // Metadata
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  lastLogin     DateTime?

  @@index([email])
}

model Goat {
  id              String      @id @default(uuid())
  name            String
  breed           String
  gender          Gender
  birthDate       DateTime
  price           Float
  currency        String      @default("USD")
  description     String      @db.Text
  weight          Float?
  color           String?
  markings        String?

  // Birth History
  numberOfKids    Int         @default(0)
  lastKiddingDate DateTime?
  complications   String?

  // Status
  status          GoatStatus  @default(AVAILABLE)
  featured        Boolean     @default(false)

  // Relationships
  sellerId        String
  seller          User        @relation("AdminListings", fields: [sellerId], references: [id])

  images          GoatImage[]
  videos          GoatVideo[]
  healthRecords   HealthRecord[]
  vaccinations    Vaccination[]

  // Analytics
  viewCount       Int         @default(0)
  favoriteCount   Int         @default(0)

  // Wishlist relationship
  favoritedBy     User[]      @relation("UserWishlist")

  // Orders
  orderItems      OrderItem[]

  // Metadata
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  @@index([status])
  @@index([price])
  @@index([breed])
  @@index([gender])
  @@index([sellerId])
}

model GoatImage {
  id        String   @id @default(uuid())
  goatId    String
  goat      Goat     @relation(fields: [goatId], references: [id], onDelete: Cascade)
  url       String
  thumbnail String
  order     Int      @default(0)
  isPrimary Boolean  @default(false)
  createdAt DateTime @default(now())

  @@index([goatId])
}

model GoatVideo {
  id        String   @id @default(uuid())
  goatId    String
  goat      Goat     @relation(fields: [goatId], references: [id], onDelete: Cascade)
  url       String
  thumbnail String
  duration  Int?
  createdAt DateTime @default(now())

  @@index([goatId])
}

model HealthRecord {
  id          String   @id @default(uuid())
  goatId      String
  goat        Goat     @relation(fields: [goatId], references: [id], onDelete: Cascade)
  date        DateTime
  type        String
  description String   @db.Text
  veterinarian String?
  attachments String[]
  createdAt   DateTime @default(now())

  @@index([goatId])
}

model Vaccination {
  id            String   @id @default(uuid())
  goatId        String
  goat          Goat     @relation(fields: [goatId], references: [id], onDelete: Cascade)
  name          String
  date          DateTime
  nextDue       DateTime?
  administeredBy String?
  batchNumber   String?
  createdAt     DateTime @default(now())

  @@index([goatId])
}

model Order {
  id            String      @id @default(uuid())
  orderNumber   String      @unique

  // Relationships
  buyerId       String
  buyer         User        @relation("BuyerOrders", fields: [buyerId], references: [id])

  items         OrderItem[]

  // Pricing
  subtotal      Float
  tax           Float
  shipping      Float
  total         Float
  currency      String      @default("USD")

  // Status
  status        OrderStatus @default(PENDING)

  // Payment
  paymentMethod String
  transactionId String?
  paidAt        DateTime?

  // Shipping
  shippingAddress Json
  shippingMethod  String
  trackingNumber  String?
  estimatedDelivery DateTime?

  // Metadata
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  @@index([buyerId])
  @@index([status])
  @@index([orderNumber])
}

model OrderItem {
  id        String   @id @default(uuid())
  orderId   String
  order     Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)

  goatId    String
  goat      Goat     @relation(fields: [goatId], references: [id])

  price     Float
  quantity  Int      @default(1)

  createdAt DateTime @default(now())

  @@index([orderId])
  @@index([goatId])
}

model Session {
  id        String   @id @default(uuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())

  @@index([userId])
  @@index([token])
}
```

## 4. Caching Strategy

### 4.1 Redis Cache Structure
```typescript
// Cache keys
const CACHE_KEYS = {
  GOAT: (id: string) => `goat:${id}`,
  GOATS_LIST: (page: number, filters: string) => `goats:${page}:${filters}`,
  USER: (id: string) => `user:${id}`,
  CART: (userId: string) => `cart:${userId}`,
  SESSION: (token: string) => `session:${token}`,
}

// TTL (Time To Live) in seconds
const CACHE_TTL = {
  GOAT: 3600,           // 1 hour
  GOATS_LIST: 300,      // 5 minutes
  USER: 1800,           // 30 minutes
  CART: 86400,          // 24 hours
  SESSION: 604800,      // 7 days
}

// Cache invalidation patterns
const invalidateCache = {
  onGoatUpdate: (goatId: string) => {
    redis.del(CACHE_KEYS.GOAT(goatId))
    redis.del('goats:*')  // Clear all list caches
  },
  onOrder: (userId: string) => {
    redis.del(CACHE_KEYS.CART(userId))
  }
}
```

## 5. Security Implementation

### 5.1 Authentication Flow
```
1. User submits credentials
   ↓
2. Backend validates credentials
   ↓
3. Generate JWT access token (15 min expiry)
   ↓
4. Generate refresh token (7 days expiry)
   ↓
5. Store refresh token in httpOnly cookie
   ↓
6. Return access token to client
   ↓
7. Client stores access token in memory
   ↓
8. Include access token in Authorization header
   ↓
9. On token expiry, use refresh token
   ↓
10. Backend validates refresh token
    ↓
11. Issue new access token
```

### 5.2 Authorization Middleware
```typescript
// middleware/auth.ts
export const requireAuth = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '')

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decoded.userId)
    next()
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' })
  }
}

export const requireRole = (roles: UserRole[]) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' })
    }
    next()
  }
}

// Usage
router.post('/goats', requireAuth, requireRole(['ADMIN']), createGoat)
```

### 5.3 Input Validation
```typescript
// Using Zod for validation
import { z } from 'zod'

const createGoatSchema = z.object({
  name: z.string().min(2).max(100),
  breed: z.string().min(2).max(50),
  gender: z.enum(['MALE', 'FEMALE']),
  birthDate: z.string().datetime(),
  price: z.number().positive(),
  description: z.string().min(10).max(2000),
  weight: z.number().positive().optional(),
  color: z.string().max(50).optional(),
  numberOfKids: z.number().int().min(0).default(0),
})

// Middleware
const validate = (schema: z.ZodSchema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body)
      next()
    } catch (error) {
      res.status(400).json({ error: error.errors })
    }
  }
}

router.post('/goats', validate(createGoatSchema), createGoat)
```

## 6. File Upload Architecture

### 6.1 Image Upload Flow
```
1. Client selects images
   ↓
2. Client-side validation (type, size, dimensions)
   ↓
3. Generate presigned S3 URL from backend
   ↓
4. Client uploads directly to S3
   ↓
5. S3 triggers Lambda for image processing
   ↓
6. Lambda creates thumbnails and WebP versions
   ↓
7. Lambda saves metadata to database
   ↓
8. Client receives image URLs
   ↓
9. Client includes URLs in goat creation request
```

### 6.2 Image Processing
```typescript
// Lambda function for image processing
const processImage = async (s3Event) => {
  const bucket = s3Event.bucket.name
  const key = s3Event.object.key

  // Download original
  const original = await s3.getObject({ Bucket: bucket, Key: key })

  // Create variants
  const variants = [
    { name: 'thumbnail', width: 200, height: 200 },
    { name: 'medium', width: 800, height: 600 },
    { name: 'large', width: 1920, height: 1080 },
  ]

  for (const variant of variants) {
    // Resize and optimize
    const processed = await sharp(original.Body)
      .resize(variant.width, variant.height, { fit: 'cover' })
      .webp({ quality: 85 })
      .toBuffer()

    // Upload to S3
    await s3.putObject({
      Bucket: bucket,
      Key: `${key.replace('.', `-${variant.name}.`)}`,
      Body: processed,
      ContentType: 'image/webp',
    })
  }
}
```

## 7. Real-time Features

### 7.1 WebSocket Events
```typescript
// Server-side events
const events = {
  // Admin notifications
  'goat:view': { goatId, viewerId },
  'goat:favorited': { goatId, userId },
  'order:created': { orderId, sellerId },
  'order:paid': { orderId, sellerId },

  // Buyer notifications
  'price:drop': { goatId, oldPrice, newPrice },
  'goat:available': { goatId },
  'order:status': { orderId, status },
}

// Client-side subscription
socket.on('order:status', (data) => {
  dispatch(updateOrderStatus(data))
  showNotification(`Order ${data.orderId} is now ${data.status}`)
})
```

## 8. Performance Monitoring

### 8.1 Key Metrics to Track
```typescript
const metrics = {
  // API performance
  'api.response_time': histogram,
  'api.error_rate': counter,
  'api.request_count': counter,

  // Database
  'db.query_time': histogram,
  'db.connection_pool': gauge,

  // Cache
  'cache.hit_rate': gauge,
  'cache.miss_rate': gauge,

  // Business
  'goat.views': counter,
  'goat.favorites': counter,
  'order.created': counter,
  'payment.success': counter,
  'payment.failure': counter,
}
```

## 9. Deployment Architecture

### 9.1 Infrastructure (AWS)
```
Frontend (Vercel/Netlify)
  ↓
CloudFront CDN
  ↓
Route 53 DNS
  ↓
ALB (Application Load Balancer)
  ↓
ECS Fargate (Backend containers)
  ├── Auto-scaling (2-10 instances)
  └── Health checks
  ↓
RDS PostgreSQL (Multi-AZ)
  └── Read replicas
  ↓
ElastiCache Redis (Cluster mode)
  ↓
S3 (Image storage)
  └── CloudFront CDN
```

### 9.2 Environment Configuration
```bash
# Production
NODE_ENV=production
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=...
STRIPE_SECRET_KEY=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET=getgoat-media-prod
SENDGRID_API_KEY=...
FRONTEND_URL=https://getgoat.com

# Rate limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# CORS
ALLOWED_ORIGINS=https://getgoat.com
```

---

**Document Version**: 1.0
**Last Updated**: 2025-11-03
