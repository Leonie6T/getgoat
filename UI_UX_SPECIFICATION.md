# GetGoat - UI/UX Design Specification

## 1. Design Philosophy

### 1.1 Core Principles
- **Trust & Transparency**: Clear product information, honest imagery, secure transactions
- **Simplicity**: Clean, uncluttered interfaces that prioritize content
- **Accessibility**: WCAG 2.1 AA compliant, usable by everyone
- **Performance**: Fast, responsive, works on all devices and connections
- **Delight**: Subtle animations, satisfying interactions, pleasant experience

### 1.2 Target Users

**Primary Buyers**
- Age: 25-65
- Tech savviness: Moderate to high
- Device: 60% mobile, 30% desktop, 10% tablet
- Goals: Find healthy goats, compare prices, secure purchase

**Admin Sellers**
- Age: 30-70
- Tech savviness: Low to moderate
- Device: 50% desktop, 40% mobile, 10% tablet
- Goals: Easy listing management, track sales, communicate with buyers

## 2. Design System

### 2.1 Color Palette

```css
/* Primary Colors */
--primary-50: #f0f7f3;
--primary-100: #dceee3;
--primary-200: #bddcc9;
--primary-300: #91c3a7;
--primary-400: #63a480;
--primary-500: #4A7C59;      /* Main brand color */
--primary-600: #3c6648;
--primary-700: #32523b;
--primary-800: #2a4131;
--primary-900: #243629;

/* Secondary Colors */
--secondary-50: #faf7f3;
--secondary-100: #f5ede0;
--secondary-200: #ebd9be;
--secondary-300: #dfc096;
--secondary-400: #D4A574;     /* Warm tan */
--secondary-500: #c89459;
--secondary-600: #b8804a;
--secondary-700: #99663e;

/* Accent Colors */
--accent-500: #8B4513;        /* Saddle brown */

/* Neutral Colors */
--gray-50: #fafaf9;
--gray-100: #f5f5f4;
--gray-200: #e7e5e4;
--gray-300: #d6d3d1;
--gray-400: #a8a29e;
--gray-500: #78716c;
--gray-600: #57534e;
--gray-700: #44403c;
--gray-800: #292524;
--gray-900: #1c1917;

/* Semantic Colors */
--success: #10B981;
--warning: #F59E0B;
--error: #EF4444;
--info: #3B82F6;

/* Background */
--bg-primary: #FAFAF9;
--bg-secondary: #FFFFFF;
--bg-tertiary: #F5F5F4;
```

### 2.2 Typography

```css
/* Font Families */
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-heading: 'Poppins', sans-serif;
--font-mono: 'JetBrains Mono', monospace;

/* Font Sizes */
--text-xs: 0.75rem;      /* 12px */
--text-sm: 0.875rem;     /* 14px */
--text-base: 1rem;       /* 16px */
--text-lg: 1.125rem;     /* 18px */
--text-xl: 1.25rem;      /* 20px */
--text-2xl: 1.5rem;      /* 24px */
--text-3xl: 1.875rem;    /* 30px */
--text-4xl: 2.25rem;     /* 36px */
--text-5xl: 3rem;        /* 48px */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

/* Line Heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

### 2.3 Spacing Scale

```css
/* Spacing (rem based) */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
```

### 2.4 Border Radius

```css
--radius-sm: 0.25rem;   /* 4px */
--radius-md: 0.5rem;    /* 8px */
--radius-lg: 0.75rem;   /* 12px */
--radius-xl: 1rem;      /* 16px */
--radius-2xl: 1.5rem;   /* 24px */
--radius-full: 9999px;
```

### 2.5 Shadows

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
--shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
```

## 3. Component Library

### 3.1 Button Components

```tsx
// Primary Button
<Button variant="primary" size="lg">
  Buy Now
</Button>

// Variants: primary, secondary, outline, ghost, danger
// Sizes: sm, md, lg, xl
// States: default, hover, active, disabled, loading

/* CSS */
.btn-primary {
  background: var(--primary-500);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-lg);
  font-weight: var(--font-semibold);
  transition: all 0.2s;
}

.btn-primary:hover {
  background: var(--primary-600);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}
```

### 3.2 Card Components

```tsx
// Goat Card
<GoatCard>
  <GoatImage />
  <GoatBadges />      {/* Status, Featured */}
  <GoatName />
  <GoatDetails />     {/* Breed, Age, Gender */}
  <GoatPrice />
  <GoatActions />     {/* View, Favorite */}
</GoatCard>

/* Styling */
.goat-card {
  background: white;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: all 0.3s;
  position: relative;
}

.goat-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-4px);
}

.goat-card-image {
  aspect-ratio: 4/3;
  object-fit: cover;
  width: 100%;
}

.goat-card-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.5rem 1rem;
  background: var(--primary-500);
  color: white;
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
}
```

### 3.3 Input Components

```tsx
// Text Input
<Input
  label="Search goats"
  placeholder="Enter breed, age..."
  icon={<SearchIcon />}
  error="Please enter at least 2 characters"
/>

// Select
<Select
  label="Gender"
  options={[
    { value: 'all', label: 'All' },
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' }
  ]}
/>

// Range Slider
<RangeSlider
  label="Price Range"
  min={0}
  max={5000}
  step={100}
  value={[500, 2000]}
/>
```

### 3.4 Navigation Components

```tsx
// Mobile Bottom Navigation
<BottomNav>
  <NavItem icon={<HomeIcon />} label="Home" active />
  <NavItem icon={<SearchIcon />} label="Browse" />
  <NavItem icon={<HeartIcon />} label="Favorites" badge={3} />
  <NavItem icon={<CartIcon />} label="Cart" badge={2} />
  <NavItem icon={<UserIcon />} label="Account" />
</BottomNav>

// Desktop Header
<Header>
  <Logo />
  <SearchBar />
  <NavLinks>
    <Link>Browse</Link>
    <Link>How it Works</Link>
    <Link>About</Link>
  </NavLinks>
  <UserActions>
    <IconButton icon={<HeartIcon />} badge={3} />
    <IconButton icon={<CartIcon />} badge={2} />
    <UserMenu />
  </UserActions>
</Header>
```

## 4. Page Layouts

### 4.1 Home Page

```
┌─────────────────────────────────────────────────┐
│  Header (Logo, Search, Nav, Cart, User)         │
├─────────────────────────────────────────────────┤
│                                                  │
│  Hero Section                                    │
│  ┌───────────────────────────────────────────┐  │
│  │  Headline: "Find Your Perfect Goat"       │  │
│  │  Subheadline: "Premium goats from..."     │  │
│  │  [Browse Goats CTA]  [How it Works]      │  │
│  │  Background: Hero image/illustration      │  │
│  └───────────────────────────────────────────┘  │
│                                                  │
│  Featured Categories                             │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐       │
│  │Dairy │  │Meat  │  │Fiber │  │Show  │       │
│  │Goats │  │Goats │  │Goats │  │Goats │       │
│  └──────┘  └──────┘  └──────┘  └──────┘       │
│                                                  │
│  Featured Listings                               │
│  ┌───────┐  ┌───────┐  ┌───────┐  ┌───────┐   │
│  │ Goat  │  │ Goat  │  │ Goat  │  │ Goat  │   │
│  │ Card  │  │ Card  │  │ Card  │  │ Card  │   │
│  └───────┘  └───────┘  └───────┘  └───────┘   │
│  [View All Listings →]                          │
│                                                  │
│  How It Works                                    │
│  ┌─────────────────────────────────────────┐   │
│  │  1. Browse  →  2. Select  →  3. Buy    │   │
│  │  [Icon]        [Icon]        [Icon]     │   │
│  └─────────────────────────────────────────┘   │
│                                                  │
│  Trust Indicators                                │
│  • Secure Payments  • Verified Sellers           │
│  • Health Guarantee • Customer Support           │
│                                                  │
│  Footer                                          │
│  Links, Contact, Social, Legal                   │
└─────────────────────────────────────────────────┘
```

### 4.2 Browse/Marketplace Page

```
┌─────────────────────────────────────────────────┐
│  Header                                          │
├─────────────────────────────────────────────────┤
│  Page Title: "Browse Goats"                     │
│  [Search Bar]                                    │
├──────────┬──────────────────────────────────────┤
│          │                                       │
│ Filters  │  Results Header                       │
│ Panel    │  [128 goats found]  [Sort: ▼]        │
│          │  Active filters: [Breed: Nubian] [×]  │
│ Breed    │                                       │
│ □ Nubian │  Goat Grid                            │
│ □ Alpine │  ┌────┐ ┌────┐ ┌────┐ ┌────┐        │
│ □ Boer   │  │Goat│ │Goat│ │Goat│ │Goat│        │
│          │  │Card│ │Card│ │Card│ │Card│        │
│ Gender   │  └────┘ └────┘ └────┘ └────┘        │
│ ○ All    │  ┌────┐ ┌────┐ ┌────┐ ┌────┐        │
│ ○ Male   │  │Goat│ │Goat│ │Goat│ │Goat│        │
│ ○ Female │  │Card│ │Card│ │Card│ │Card│        │
│          │  └────┘ └────┘ └────┘ └────┘        │
│ Age      │  ┌────┐ ┌────┐ ┌────┐ ┌────┐        │
│ [0──●────5]│ │Goat│ │Goat│ │Goat│ │Goat│        │
│          │  │Card│ │Card│ │Card│ │Card│        │
│ Price    │  └────┘ └────┘ └────┘ └────┘        │
│ [●───────]│                                       │
│          │  [Load More] or Infinite Scroll       │
│ Status   │                                       │
│ □ Available                                      │
│ □ Featured│                                      │
│          │                                       │
│ [Apply]  │                                       │
│ [Reset]  │                                       │
└──────────┴──────────────────────────────────────┘

Mobile:
- Filters in slide-out panel or modal
- Grid: 1 column portrait, 2 columns landscape
- Sticky filter button at bottom
```

### 4.3 Goat Detail Page

```
┌─────────────────────────────────────────────────┐
│  Header                                          │
├─────────────────────────────────────────────────┤
│  Breadcrumb: Home > Browse > Nubian > Bella     │
│                                                  │
│  ┌────────────────────┬────────────────────────┐│
│  │                    │                        ││
│  │  Image Gallery     │  Product Info          ││
│  │  ┌──────────────┐  │                        ││
│  │  │              │  │  Bella                 ││
│  │  │  Main Image  │  │  Female Nubian Dairy   ││
│  │  │              │  │  ★★★★★ (verified)     ││
│  │  └──────────────┘  │                        ││
│  │  [◄] [○][○][○] [►] │  $1,250                ││
│  │                    │  ✓ Available           ││
│  │  [○] [○] [○] [○]  │                        ││
│  │  Thumbnails        │  Age: 2 years 3 months ││
│  │                    │  Weight: 135 lbs       ││
│  │                    │  Color: Brown & White  ││
│  │                    │                        ││
│  │                    │  [❤ Add to Wishlist]  ││
│  │                    │  [🛒 Add to Cart]      ││
│  │                    │  [⚡ Buy Now]          ││
│  │                    │                        ││
│  │                    │  [Share] [Report]      ││
│  └────────────────────┴────────────────────────┘│
│                                                  │
│  Tabs: [Details] [Health] [Birth History] [Seller]│
│  ┌────────────────────────────────────────────┐ │
│  │ Details Tab (Active)                       │ │
│  │                                            │ │
│  │ About This Goat                            │ │
│  │ Description text...                        │ │
│  │                                            │ │
│  │ Specifications                             │ │
│  │ • Breed: Nubian                           │ │
│  │ • Gender: Female                          │ │
│  │ • Date of Birth: Jan 15, 2023            │ │
│  │ • Registration: ADGA #12345              │ │
│  │ • Color: Brown with white markings        │ │
│  │ • Horns: Disbudded                        │ │
│  │ • Temperament: Friendly, docile           │ │
│  │                                            │ │
│  │ Birth History                              │ │
│  │ • Kids born: 3 (2023), 2 (2024)          │ │
│  │ • Last kidding: March 2024                │ │
│  │ • No complications                         │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  Seller Information                              │
│  ┌────────────────────────────────────────────┐ │
│  │ [Avatar] Green Valley Farm                 │ │
│  │          ✓ Verified Seller                 │ │
│  │          ★★★★★ (48 reviews)               │ │
│  │          Member since 2022                 │ │
│  │          📍 Vermont, USA                   │ │
│  │                                            │ │
│  │          [Contact Seller] [View Profile]   │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  Similar Goats                                   │
│  [Carousel of similar goat cards]               │
│                                                  │
└─────────────────────────────────────────────────┘
```

### 4.4 Cart Page

```
┌─────────────────────────────────────────────────┐
│  Header                                          │
├─────────────────────────────────────────────────┤
│  Shopping Cart                                   │
│                                                  │
│  ┌───────────────────────┬──────────────────┐   │
│  │ Cart Items (2)        │ Order Summary    │   │
│  │                       │                  │   │
│  │ ┌──────────────────┐  │ Subtotal: $2,450│   │
│  │ │[Img] Bella       │  │ Tax:      $196  │   │
│  │ │     Nubian, 2yr  │  │ Shipping: $50   │   │
│  │ │     $1,250       │  │ ─────────────── │   │
│  │ │     [−][1][+]    │  │ Total:   $2,696 │   │
│  │ │     [Remove]     │  │                  │   │
│  │ └──────────────────┘  │ [Proceed to     │   │
│  │                       │  Checkout]       │   │
│  │ ┌──────────────────┐  │                  │   │
│  │ │[Img] Charlie     │  │ We Accept:       │   │
│  │ │     Alpine, 1yr  │  │ [Visa][MC][PayPal]│  │
│  │ │     $1,200       │  │                  │   │
│  │ │     [−][1][+]    │  │ ✓ Secure        │   │
│  │ │     [Remove]     │  │   Checkout       │   │
│  │ └──────────────────┘  │ ✓ 30-day        │   │
│  │                       │   Guarantee      │   │
│  │ [Continue Shopping]   │                  │   │
│  └───────────────────────┴──────────────────┘   │
│                                                  │
│  Trust Badges                                    │
│  [Secure Payment] [Money Back] [Free Shipping]  │
└─────────────────────────────────────────────────┘
```

### 4.5 Checkout Flow

```
Step 1: Shipping Information
┌─────────────────────────────────────────────────┐
│  Checkout                                        │
│  ○━━━━━━○━━━━━━○━━━━━━○                        │
│  Shipping Payment Review Success                 │
│                                                  │
│  Shipping Address                                │
│  ┌────────────────────────────────────────────┐ │
│  │ First Name:     [_______________]          │ │
│  │ Last Name:      [_______________]          │ │
│  │ Email:          [_______________]          │ │
│  │ Phone:          [_______________]          │ │
│  │ Address Line 1: [_______________]          │ │
│  │ Address Line 2: [_______________]          │ │
│  │ City:           [_______________]          │ │
│  │ State:          [▼ Select State]           │ │
│  │ ZIP Code:       [_______________]          │ │
│  │                                            │ │
│  │ □ Save this address                        │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  Delivery Notes (Optional)                       │
│  ┌────────────────────────────────────────────┐ │
│  │ [Text area for special instructions]       │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  [← Back to Cart]        [Continue to Payment →]│
└─────────────────────────────────────────────────┘

Step 2: Payment
┌─────────────────────────────────────────────────┐
│  Checkout                                        │
│  ●━━━━━━○━━━━━━○━━━━━━○                        │
│  Shipping Payment Review Success                 │
│                                                  │
│  Payment Method                                  │
│  ┌────────────────────────────────────────────┐ │
│  │ ○ Credit/Debit Card                        │ │
│  │ ○ PayPal                                   │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  Card Information (powered by Stripe)            │
│  ┌────────────────────────────────────────────┐ │
│  │ Card Number:    [________________]         │ │
│  │ Name on Card:   [________________]         │ │
│  │ Expiry:         [MM/YY]  CVV: [___]       │ │
│  │                                            │ │
│  │ Billing same as shipping □                 │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  🔒 Your payment is secure and encrypted        │
│                                                  │
│  [← Back]                [Continue to Review →] │
└─────────────────────────────────────────────────┘

Step 3: Review Order
┌─────────────────────────────────────────────────┐
│  Checkout                                        │
│  ●━━━━━━●━━━━━━○━━━━━━○                        │
│  Shipping Payment Review Success                 │
│                                                  │
│  Review Your Order                               │
│                                                  │
│  Items (2)                    [Edit]            │
│  • Bella (Nubian, 2yr)        $1,250           │
│  • Charlie (Alpine, 1yr)      $1,200           │
│                                                  │
│  Shipping Address             [Edit]            │
│  John Smith                                      │
│  123 Farm Road                                   │
│  Burlington, VT 05401                            │
│                                                  │
│  Payment Method               [Edit]            │
│  Visa ending in 4242                            │
│                                                  │
│  Order Summary                                   │
│  Subtotal:              $2,450                  │
│  Tax (8%):              $196                    │
│  Shipping:              $50                     │
│  ───────────────────────────                    │
│  Total:                 $2,696                  │
│                                                  │
│  □ I agree to the Terms and Conditions          │
│                                                  │
│  [← Back]                [Place Order →]        │
└─────────────────────────────────────────────────┘

Step 4: Success
┌─────────────────────────────────────────────────┐
│  ●━━━━━━●━━━━━━●━━━━━━●                        │
│  Shipping Payment Review Success                 │
│                                                  │
│           ✓                                      │
│     Order Confirmed!                             │
│                                                  │
│  Thank you for your purchase, John!              │
│                                                  │
│  Order #: GT-2024-001234                        │
│  Confirmation sent to: john@email.com            │
│                                                  │
│  What's Next?                                    │
│  • Seller will be notified                      │
│  • You'll receive updates via email              │
│  • Track your order anytime                      │
│                                                  │
│  [View Order Details]  [Continue Shopping]      │
└─────────────────────────────────────────────────┘
```

### 4.6 Admin Dashboard

```
┌─────────────────────────────────────────────────┐
│  Admin Dashboard                       [User ▼] │
├──────────┬──────────────────────────────────────┤
│          │                                       │
│ Sidebar  │  Dashboard Overview                   │
│          │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐│
│ Dashboard│  │ 24   │ │ 18   │ │ 6    │ │$4.2K ││
│ Listings │  │Active│ │Sold  │ │Pending││Revenue││
│ Orders   │  │Goats │ │Goats │ │Orders││       ││
│ Analytics│  └──────┘ └──────┘ └──────┘ └──────┘│
│ Settings │                                       │
│          │  Recent Orders                        │
│          │  ┌────────────────────────────────┐  │
│          │  │ #GT-001234  Bella    $1,250  ✓ │  │
│          │  │ #GT-001235  Charlie  $1,200  ⏳ │  │
│          │  │ #GT-001236  Daisy    $950    ✓ │  │
│          │  └────────────────────────────────┘  │
│          │                                       │
│          │  Performance Chart                    │
│          │  [Line/Bar chart showing sales]       │
│          │                                       │
│          │  Quick Actions                        │
│          │  [+ Add New Goat] [View All Orders]  │
└──────────┴──────────────────────────────────────┘
```

## 5. Interaction Patterns

### 5.1 Micro-interactions

```typescript
// Favorite Heart Animation
const HeartButton = () => {
  const [isFavorite, setIsFavorite] = useState(false)

  return (
    <button
      onClick={() => setIsFavorite(!isFavorite)}
      className={`heart-button ${isFavorite ? 'favorited' : ''}`}
    >
      <motion.div
        initial={false}
        animate={{
          scale: isFavorite ? [1, 1.3, 1] : 1,
          rotate: isFavorite ? [0, -10, 10, 0] : 0
        }}
        transition={{ duration: 0.4 }}
      >
        ❤️
      </motion.div>
    </button>
  )
}

// Add to Cart Success
const CartAnimation = () => {
  return (
    <motion.div
      initial={{ y: 0, opacity: 1 }}
      animate={{ y: -100, opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="cart-item-flying"
    >
      🛒
    </motion.div>
  )
}

// Loading States
- Skeleton screens for content loading
- Spinner for actions
- Progress bar for image uploads
- Pulse animation for refresh
```

### 5.2 Gestures (Mobile)

```
Swipe Right: Go back / Close modal
Swipe Left: Delete item (with confirmation)
Swipe Down: Refresh listing
Pinch to Zoom: Image gallery
Long Press: Quick actions menu
Pull to Refresh: Update content
```

### 5.3 Transitions

```css
/* Page transitions */
.page-enter {
  opacity: 0;
  transform: translateX(20px);
}

.page-enter-active {
  opacity: 1;
  transform: translateX(0);
  transition: all 300ms ease-out;
}

/* Modal transitions */
.modal-enter {
  opacity: 0;
  transform: scale(0.95);
}

.modal-enter-active {
  opacity: 1;
  transform: scale(1);
  transition: all 200ms ease-out;
}

/* Card hover */
.card {
  transition: transform 300ms ease, box-shadow 300ms ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}
```

## 6. Responsive Breakpoints

```css
/* Mobile First */
/* Small devices (phones) */
@media (min-width: 640px) { /* sm */ }

/* Medium devices (tablets) */
@media (min-width: 768px) { /* md */ }

/* Large devices (desktops) */
@media (min-width: 1024px) { /* lg */ }

/* Extra large devices */
@media (min-width: 1280px) { /* xl */ }

/* 2K and above */
@media (min-width: 1536px) { /* 2xl */ }
```

### Layout Adjustments
```
Mobile (< 768px):
- Single column layout
- Hamburger menu
- Bottom navigation
- Full-width cards
- Stacked forms

Tablet (768px - 1023px):
- Two column grid
- Collapsible sidebar
- Hybrid navigation
- Cards in 2 columns

Desktop (≥ 1024px):
- Three/four column grid
- Persistent sidebar
- Top navigation
- Cards in 3-4 columns
- Side-by-side forms
```

## 7. Accessibility Features

### 7.1 Keyboard Navigation
```
Tab: Navigate forward
Shift + Tab: Navigate backward
Enter/Space: Activate buttons/links
Esc: Close modals/dropdowns
Arrow keys: Navigate dropdowns/sliders
```

### 7.2 Screen Reader Support
```html
<!-- Image alt text -->
<img src="goat.jpg" alt="Brown and white Nubian dairy goat named Bella" />

<!-- ARIA labels -->
<button aria-label="Add Bella to favorites">❤️</button>

<!-- ARIA live regions for updates -->
<div aria-live="polite" aria-atomic="true">
  Item added to cart
</div>

<!-- Form labels -->
<label for="price-min">Minimum Price</label>
<input id="price-min" type="number" />
```

### 7.3 Focus Indicators
```css
/* Visible focus states */
*:focus-visible {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}

/* Skip to main content */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--primary-500);
  color: white;
  padding: 8px;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
```

## 8. Error States & Empty States

### 8.1 Form Errors
```tsx
<Input
  label="Email"
  error="Please enter a valid email address"
  icon={<AlertIcon />}
/>

// Inline validation
// Real-time feedback
// Clear error messages
// Error summary at form top
```

### 8.2 Empty States
```tsx
// No search results
<EmptyState
  icon={<SearchIcon />}
  title="No goats found"
  description="Try adjusting your filters or search terms"
  action={<Button>Clear Filters</Button>}
/>

// Empty cart
<EmptyState
  icon={<CartIcon />}
  title="Your cart is empty"
  description="Browse our marketplace to find your perfect goat"
  action={<Button href="/browse">Browse Goats</Button>}
/>

// No favorites
<EmptyState
  icon={<HeartIcon />}
  title="No favorites yet"
  description="Save goats you like to easily find them later"
/>
```

### 8.3 Loading States
```tsx
// Skeleton loader for cards
<div className="skeleton-card">
  <div className="skeleton-image" />
  <div className="skeleton-text" />
  <div className="skeleton-text short" />
</div>

// Page loader
<Spinner size="lg" />

// Inline loader
<Button loading>
  <Spinner size="sm" />
  Processing...
</Button>
```

## 9. Offline Experience

### 9.1 Offline Indicator
```tsx
<OfflineBanner>
  ⚠️ You're offline. Some features may be limited.
  <Button>Retry</Button>
</OfflineBanner>
```

### 9.2 Cached Content
```
- Recently viewed goats available offline
- Wishlist accessible offline
- Cart persists offline
- Queue purchases for when online
- Show "Queued" badge on pending actions
```

## 10. UI Copywriting Guidelines

### 10.1 Voice & Tone
- **Friendly but professional**: "Let's find your perfect goat"
- **Clear and direct**: "Add to cart" not "Proceed with selection"
- **Encouraging**: "You're almost done!"
- **Honest**: "This will take about 5 minutes"
- **Empathetic**: "We're sorry, something went wrong"

### 10.2 Button Labels
```
✓ Good:
- "Buy Now"
- "Add to Cart"
- "Save Changes"
- "Create Listing"

✗ Avoid:
- "Submit"
- "Click Here"
- "OK"
- "Proceed"
```

### 10.3 Error Messages
```
✓ Good:
- "Please enter a valid email address"
- "This field is required"
- "Price must be greater than $0"

✗ Avoid:
- "Error"
- "Invalid input"
- "This is wrong"
```

---

**Document Version**: 1.0
**Last Updated**: 2025-11-03
