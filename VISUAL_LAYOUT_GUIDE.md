# 🏪 **City Mart Web Application - Comprehensive Visual & Layout Guide**

## **📋 Table of Contents**
1. [Design System Elements](#design-system-elements)
2. [Typography System](#typography-system)
3. [Component Styling](#component-styling)
4. [Page-by-Page Layout Description](#page-by-page-layout-description)
5. [Header Elements](#header-elements)
6. [Footer Elements](#footer-elements)
7. [Animation & Interaction Details](#animation--interaction-details)

---

## **🎨 Design System Elements**

### **Primary Color Palette**
```css
Primary Colors:
- Blue: #3b82f6 (Primary buttons, links, accents)
- Green: #10b981 (Success states, secondary actions)
- Purple: #8b5cf6 (Secondary elements)
- Orange: #f97316 (Accent highlights)

Background Colors:
- Light: #ffffff (Cards, main backgrounds)
- Dark: #f1f5f9 (Section backgrounds)
- Gray-50: #f9fafb (Page backgrounds)

Text Colors:
- Dark: #1e293b (Primary text)
- Light: #f8fafc (Light text on dark backgrounds)
- Muted: #64748b (Secondary text)

Status Colors:
- Danger: #ef4444 (Errors, warnings)
- Success: #22c55e (Success messages)
- Warning: #eab308 (Warning states)
- Info: #06b6d4 (Information)
```

### **Gradient Combinations**
```css
Hero Gradients:
- Green to Emerald: from-green-500 to-emerald-700
- Blue to Indigo: from-blue-400 to-blue-600
- Red to Orange: from-red-500 to-orange-600
- Primary to Dark: from-primary to-primary-dark

Background Gradients:
- Light sections: from-green-50 to-blue-50
- Special offers: from-green-600 to-emerald-700
- Newsletter: from-green-500 to-emerald-600
```

---

## **📝 Typography System**

### **Font Configuration**
```css
Font Family: 'Poppins', sans-serif

Font Hierarchy:
- H1: 2.5rem (40px), font-weight: 600, line-height: 1.2
- H2: 2rem (32px), font-weight: 600, line-height: 1.3
- H3: 1.75rem (28px), font-weight: 600, line-height: 1.4
- H4: 1.5rem (24px), font-weight: 500, line-height: 1.4
- Body: 1rem (16px), font-weight: 400, line-height: 1.6
- Small: 0.875rem (14px), font-weight: 400, line-height: 1.5
- Tiny: 0.75rem (12px), font-weight: 400, line-height: 1.4

Special Text Classes:
- .auth-title: 1.875rem (30px), font-weight: 700
- .form-label: 0.875rem (14px), font-weight: 500
- .card-title: 1.125rem (18px), font-weight: 600
```

---

## **🧩 Component Styling**

### **Button Styles**
```css
Primary Button:
- Background: bg-primary (#3b82f6)
- Text: text-white
- Padding: py-3 px-6 (12px 24px)
- Border-radius: rounded-lg (8px)
- Font-weight: font-medium
- Hover: bg-primary-dark, transform translateY(-1px)
- Focus: ring-2 ring-primary ring-opacity-50

Secondary Button:
- Background: bg-transparent
- Border: border-2 border-primary
- Text: text-primary
- Padding: py-2 px-4 (8px 16px)
- Hover: bg-primary, text-white

Danger Button:
- Background: bg-red-500
- Text: text-white
- Hover: bg-red-600

Success Button:
- Background: bg-green-500
- Text: text-white
- Hover: bg-green-600
```

### **Card Styles**
```css
Standard Card:
- Background: bg-white
- Border-radius: rounded-xl (12px)
- Shadow: shadow-lg (0 10px 15px rgba(0,0,0,0.1))
- Padding: p-6 (24px)
- Hover: transform translateY(-2px), shadow-xl

Product Card:
- Background: bg-white
- Border-radius: rounded-xl (12px)
- Shadow: shadow-lg
- Overflow: hidden
- Height: h-full (flex layout)
- Hover: transform translateY(-5px), shadow-xl

Metric Card (Admin):
- Background: bg-white
- Border-radius: rounded-lg (8px)
- Shadow: shadow-md
- Padding: p-4 (16px)
- Border-left: border-l-4 (colored accent)
```

### **Input Field Styles**
```css
Form Input:
- Border: border border-gray-300
- Border-radius: rounded-md (6px)
- Padding: px-3 py-2 (12px 8px)
- Font-size: text-sm (14px)
- Focus: border-primary, ring-2 ring-primary ring-opacity-20
- Error: border-red-500, ring-red-500

Select Dropdown:
- Same as input with dropdown arrow
- Background: bg-white
- Options: hover:bg-gray-100

Checkbox/Radio:
- Size: h-4 w-4
- Color: text-primary
- Focus: ring-primary
- Border-radius: rounded (checkbox), rounded-full (radio)
```

---

## **📱 Page-by-Page Layout Description**

### **1. LANDING PAGE** (`/`)
**Page Identification**: Main landing page with hero carousel and product sections

**Overall Layout Structure**:
```
┌─────────────────────────────────────────────────────────────┐
│ HEADER (Fixed, gradient background when not scrolled)      │
├─────────────────────────────────────────────────────────────┤
│ HERO CAROUSEL SECTION (60-70vh height)                     │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Background Image + Gradient Overlay + Dark Overlay     │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ Centered Content (z-20)                             │ │ │
│ │ │ • H1 Title (4xl md:6xl, font-bold, white)          │ │ │
│ │ │ • Subtitle (xl md:2xl, white, max-w-2xl)           │ │ │
│ │ │ • CTA Button (white bg, primary text, rounded-full)│ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ CATEGORIES SECTION (py-12, bg-background-light)            │
│ • Title: "Shop by Category" (3xl, font-bold, center)      │
│ • Grid: grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4   │
│ • Cards: Colored backgrounds + emoji icons + hover lift   │
├─────────────────────────────────────────────────────────────┤
│ FEATURED PRODUCTS SECTION (py-12, bg-background-dark)      │
│ • Header: Title + "View All" link (flex justify-between)  │
│ • Grid: grid-cols-1 sm:2 md:3 lg:4 gap-6                 │
│ • Product cards with animations                           │
├─────────────────────────────────────────────────────────────┤
│ SPECIAL OFFERS SECTION (py-12, gradient green bg)          │
│ • Title: "Fresh Deals" (3xl, font-bold, white)           │
│ • Grid: Same as featured products                         │
│ • Light theme product cards                               │
├─────────────────────────────────────────────────────────────┤
│ BEST SELLERS SECTION (py-12, bg-background-light)          │
│ • Similar structure to featured products                   │
│ • Sorted by sold_count                                    │
├─────────────────────────────────────────────────────────────┤
│ FEATURES SECTION (py-12, bg-background-dark)               │
│ • Title: "Why Choose Us" (3xl, font-bold, center)        │
│ • Grid: grid-cols-1 md:2 lg:4 gap-8                      │
│ • Feature cards: white bg, emoji icons, hover lift       │
├─────────────────────────────────────────────────────────────┤
│ NEWSLETTER SECTION (py-16, gradient green bg)              │
│ • Centered content, max-w-4xl                            │
│ • Email input + subscribe button                          │
├─────────────────────────────────────────────────────────────┤
│ FOOTER (bg-gray-800, text-white)                          │
└─────────────────────────────────────────────────────────────┘
```

**Hero Carousel Details**:
- **Auto-rotation**: 5-second intervals
- **Navigation**: Dots indicator at bottom
- **Banners**: 3 rotating banners (Fruits, Vegetables, Dairy)
- **Overlay**: Black opacity-40 + colored gradient opacity-60
- **Animation**: Framer Motion with staggered text reveals

**Category Cards**:
```
┌─────────────────────┐
│ Colored Background  │
│ ┌─────────────────┐ │
│ │ Emoji Icon (4xl)│ │
│ │ Category Name   │ │
│ │ (font-semibold) │ │
│ └─────────────────┘ │
└─────────────────────┘
```

---

### **2. HOME PAGE** (`/home`)
**Page Identification**: Simplified home page with city selection focus

**Layout Structure**:
```
┌─────────────────────────────────────────────────────────────┐
│ HEADER (Dynamic - changes appearance on scroll)            │
├─────────────────────────────────────────────────────────────┤
│ HERO SECTION (min-h-screen, gradient: green→teal→blue)     │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Container (mx-auto, px-4, flex items-center)           │ │
│ │ ┌─────────────────┐    ┌─────────────────────────────┐ │ │
│ │ │ LEFT CONTENT    │    │ CITY SELECTOR CARD          │ │ │
│ │ │ • Main Title    │    │ • Glassmorphism effect      │ │ │
│ │ │ • Subtitle      │    │ • Semi-transparent bg       │ │ │
│ │ │ • Feature List  │    │ • City Dropdown             │ │ │
│ │ │ • CTA Buttons   │    │ • "Explore Products" Button │ │ │
│ │ └─────────────────┘    └─────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ FEATURES SECTION (py-16, bg-gray-50)                      │
│ • Grid: 3 columns on desktop                              │
│ • Feature cards with icons and descriptions               │
├─────────────────────────────────────────────────────────────┤
│ CATEGORIES SECTION (py-16, bg-white)                      │
│ • Animated category cards with Framer Motion              │
│ • Staggered reveal animations                             │
├─────────────────────────────────────────────────────────────┤
│ CTA SECTION (py-16, bg-primary)                           │
│ • Centered call-to-action content                         │
│ • White text on primary background                        │
└─────────────────────────────────────────────────────────────┘
```

**City Selector Card Details**:
```css
Background: bg-white bg-opacity-10 backdrop-blur-md
Border: border border-white border-opacity-20
Border-radius: rounded-2xl
Padding: p-8
Shadow: shadow-2xl
```

---

### **3. LOGIN PAGE** (`/login`)
**Page Identification**: Authentication page with centered form

**Layout Structure**:
```
┌─────────────────────────────────────────────────────────────┐
│ HEADER (Minimal navigation)                                │
├─────────────────────────────────────────────────────────────┤
│ MAIN CONTENT (min-h-[calc(100vh-16rem)], bg-gray-50)      │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Flex container (items-center, justify-center)          │ │
│ │        ┌─────────────────────────────────────┐         │ │
│ │        │ AUTH CONTAINER (max-w-md, w-full)   │         │ │
│ │        │ ┌─────────────────────────────────┐ │         │ │
│ │        │ │ HEADER SECTION                  │ │         │ │
│ │        │ │ • User icon (h-12 w-12)        │ │         │ │
│ │        │ │ • Title: "Sign in to Mini Mart"│ │         │ │
│ │        │ │ • Description text              │ │         │ │
│ │        │ ├─────────────────────────────────┤ │         │ │
│ │        │ │ ERROR ALERT (if present)        │ │         │ │
│ │        │ │ • Red border-left + icon        │ │         │ │
│ │        │ ├─────────────────────────────────┤ │         │ │
│ │        │ │ FORM SECTION                    │ │         │ │
│ │        │ │ • Email input (full width)      │ │         │ │
│ │        │ │ • Password input                │ │         │ │
│ │        │ │ • Remember me checkbox          │ │         │ │
│ │        │ │ • Forgot password link          │ │         │ │
│ │        │ │ • Submit button (full width)    │ │         │ │
│ │        │ ├─────────────────────────────────┤ │         │ │
│ │        │ │ FOOTER LINKS                    │ │         │ │
│ │        │ │ • "Don't have account?" link    │ │         │ │
│ │        │ │ • "Back to Home" link           │ │         │ │
│ │        │ └─────────────────────────────────┘ │         │ │
│ │        └─────────────────────────────────────┘         │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Form Styling Details**:
```css
Container: bg-white, rounded-xl, shadow-lg, p-8
Inputs: border-gray-300, rounded-md, focus:border-primary
Button: bg-primary, text-white, rounded-lg, hover:bg-primary-dark
Animation: opacity-0 translate-y-10 → opacity-100 translate-y-0
```

---

### **4. REGISTER PAGE** (`/register`)
**Page Identification**: User registration with role selection

**Similar layout to Login with additional fields**:
```
┌─────────────────────────────────────────────────────────────┐
│ REGISTER FORM (extends login layout)                       │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ • Name input field                                      │ │
│ │ • Email input field                                     │ │
│ │ • Password input field                                  │ │
│ │ • Role selection (Radio buttons)                       │ │
│ │   ○ Customer  ○ Admin                                  │ │
│ │ • City dropdown (extensive Indian cities)              │ │
│ │ • Terms & conditions checkbox                          │ │
│ │ • Submit button: "Create Account"                      │ │
│ │ • Login link: "Already have account?"                  │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Role Selection Styling**:
```css
Container: flex space-x-4
Radio buttons: h-4 w-4, text-primary, focus:ring-primary
Labels: ml-2, text-sm, text-gray-700
```

---

### **5. CUSTOMER DASHBOARD** (`/customer/dashboard`)
**Page Identification**: Customer's main account page

**Layout Structure**:
```
┌─────────────────────────────────────────────────────────────┐
│ HEADER (with cart count badge)                             │
├─────────────────────────────────────────────────────────────┤
│ HERO SECTION (gradient: green-50 to blue-50)               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Welcome Card (rounded-xl, p-6, shadow-sm)              │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ LEFT: Welcome message + city info                   │ │ │
│ │ │ RIGHT: Action buttons                               │ │ │
│ │ │ [🛒 Cart (X)] [📦 My Orders]                       │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ RECENT ORDERS SECTION                                      │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Section Title + "View All" link                        │ │
│ │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │ │
│ │ │ Order Card  │ │ Order Card  │ │ Order Card  │       │ │
│ │ │ #12345      │ │ #12346      │ │ #12347      │       │ │
│ │ │ Status      │ │ Status      │ │ Status      │       │ │
│ │ │ Date        │ │ Date        │ │ Date        │       │ │
│ │ │ Total       │ │ Total       │ │ Total       │       │ │
│ │ └─────────────┘ └─────────────┘ └─────────────┘       │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ FEATURED PRODUCTS SECTION                                  │
│ │ Grid layout: 1-2-3-4 columns (responsive)               │
│ │ Product cards with add to cart functionality            │
├─────────────────────────────────────────────────────────────┤
│ LOCAL SHOPS SECTION                                        │
│ │ List of shops in user's city                            │
│ │ Shop cards with basic info                              │
└─────────────────────────────────────────────────────────────┘
```

**Order Card Details**:
```css
Background: bg-white
Border-radius: rounded-lg
Shadow: shadow-md
Padding: p-4
Border-left: border-l-4 (status color)
Hover: shadow-lg, transform translateY(-1px)
```

---

### **6. PRODUCTS PAGE** (`/products/*`)
**Page Identification**: Product listing with filters and search

**Layout Structure**:
```
┌─────────────────────────────────────────────────────────────┐
│ HEADER                                                      │
├─────────────────────────────────────────────────────────────┤
│ PAGE TITLE BAR (bg-white, border-b, shadow-sm)            │
│ • Breadcrumb navigation                                    │
│ • Page title (dynamic based on filter/city/category)      │
├─────────────────────────────────────────────────────────────┤
│ FILTERS & SEARCH SECTION (bg-gray-50, p-4)                │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Top Row: Search bar + Filter toggle button             │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ [🔍 Search products...] [🔧 Filters] [🔄 Reset]   │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ │ Expandable Filters Row (when toggled):                 │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ Price Range | Categories | Sort By                  │ │ │
│ │ │ [₹0 - ₹10000] [☑️Fruits ☑️Veggies] [Featured ▼]    │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ PRODUCTS GRID SECTION                                      │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Grid: grid-cols-1 sm:2 md:3 lg:4 gap-6                │ │
│ │ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                       │ │
│ │ │Card │ │Card │ │Card │ │Card │                       │ │
│ │ │ 1   │ │ 2   │ │ 3   │ │ 4   │                       │ │
│ │ └─────┘ └─────┘ └─────┘ └─────┘                       │ │
│ │ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                       │ │
│ │ │Card │ │Card │ │Card │ │Card │                       │ │
│ │ │ 5   │ │ 6   │ │ 7   │ │ 8   │                       │ │
│ │ └─────┘ └─────┘ └─────┘ └─────┘                       │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ PAGINATION (if needed)                                     │
└─────────────────────────────────────────────────────────────┘
```

**Product Card Detailed Structure**:
```
┌─────────────────────────────────┐
│ IMAGE SECTION (h-48, relative)  │
│ ┌─────────────────────────────┐ │
│ │ Product Image               │ │
│ │ (hover: scale-110)          │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ TOP-RIGHT BADGES        │ │ │
│ │ │ [X% OFF] [₹XX.XX]      │ │ │
│ │ └─────────────────────────┘ │ │
│ │ OUT OF STOCK OVERLAY        │ │
│ │ (if quantity <= 0)          │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ CONTENT SECTION (p-4)           │
│ • Product Name (font-semibold)  │
│ • Shop Name (text-gray-500)     │
│ • Category (emoji + name)       │
│ • Price Section:                │
│   - Original price (if discount)│
│   - Final price (prominent)     │
│ • Stock indicator               │
│ • [Add to Cart] Button          │
│   (disabled if out of stock)    │
└─────────────────────────────────┘
```

**Filter Section Details**:
```css
Search Input: w-full, rounded-lg, border-gray-300
Price Range: Dual slider component
Categories: Checkbox grid
Sort Dropdown: Select with custom styling
Reset Button: text-gray-500, hover:text-gray-700
```

---

### **7. CART PAGE** (`/cart`)
**Page Identification**: Shopping cart with items and checkout

**Layout Structure**:
```
┌─────────────────────────────────────────────────────────────┐
│ HEADER                                                      │
├─────────────────────────────────────────────────────────────┤
│ PAGE TITLE SECTION                                         │
│ • "Shopping Cart" (2xl, font-bold)                        │
│ • Item count subtitle                                      │
├─────────────────────────────────────────────────────────────┤
│ MAIN CONTENT (grid lg:grid-cols-3 gap-8)                  │
│ ┌─────────────────────────────────┐ ┌─────────────────────┐ │
│ │ CART ITEMS (lg:col-span-2)      │ │ ORDER SUMMARY       │ │
│ │ ┌─────────────────────────────┐ │ │ ┌─────────────────┐ │ │
│ │ │ ITEM 1                      │ │ │ │ Sticky Card     │ │ │
│ │ │ [IMG] Name      [- 2 +]     │ │ │ │ ┌─────────────┐ │ │ │
│ │ │       Shop      $Price      │ │ │ │ │ Subtotal:   │ │ │ │
│ │ │       [Remove]              │ │ │ │ │ $XX.XX      │ │ │ │
│ │ ├─────────────────────────────┤ │ │ │ ├─────────────┤ │ │ │
│ │ │ ITEM 2                      │ │ │ │ │ Delivery:   │ │ │ │
│ │ │ [IMG] Name      [- 1 +]     │ │ │ │ │ $X.XX       │ │ │ │
│ │ │       Shop      $Price      │ │ │ │ ├─────────────┤ │ │ │
│ │ │       [Remove]              │ │ │ │ │ Total:      │ │ │ │
│ │ ├─────────────────────────────┤ │ │ │ │ $XX.XX      │ │ │ │
│ │ │ ITEM 3                      │ │ │ │ │ (font-bold) │ │ │ │
│ │ │ Similar structure...        │ │ │ │ ├─────────────┤ │ │ │
│ │ └─────────────────────────────┘ │ │ │ │ [Checkout]  │ │ │ │
│ └─────────────────────────────────┘ │ │ │ Button      │ │ │ │
│                                     │ │ └─────────────┘ │ │ │
│                                     │ └─────────────────┘ │ │
│                                     └─────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ RECOMMENDED PRODUCTS (if cart not empty)                   │
│ • "You might also like" section                           │
│ • Horizontal scroll of product cards                       │
└─────────────────────────────────────────────────────────────┘
```

**Cart Item Structure**:
```css
Container: bg-white, rounded-lg, shadow-md, p-4
Layout: flex items-center space-x-4
Image: w-20 h-20, rounded-lg, object-cover
Content: flex-1
Quantity Controls: flex items-center space-x-2
Remove Button: text-red-500, hover:text-red-700
```

**Empty Cart State**:
```
┌─────────────────────────────────────┐
│ EMPTY CART ILLUSTRATION             │
│ 🛒 (large cart icon)                │
│ "Your cart is empty"                │
│ "Start shopping to add items"       │
│ [Continue Shopping] Button          │
└─────────────────────────────────────┘
```

---

### **8. ADMIN LAYOUT** (All `/admin/*` pages)
**Page Identification**: Admin interface with sidebar navigation

**Layout Structure**:
```
┌─────────────────────────────────────────────────────────────┐
│ ADMIN HEADER (bg-white, shadow-sm, fixed, z-50)           │
│ ┌─────────────┐              ┌─────────────────────────────┐ │
│ │ [☰] LOGO    │              │ Admin Panel | User Menu     │ │
│ │ City Mart   │              │ Page Title  | [Profile ▼]  │ │
│ └─────────────┘              └─────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ MAIN LAYOUT (flex, pt-16/20)                              │
│ ┌─────────────┐ ┌─────────────────────────────────────────┐ │
│ │ SIDEBAR     │ │ MAIN CONTENT AREA                       │ │
│ │ (w-64)      │ │                                         │ │
│ │ ┌─────────┐ │ │ ┌─────────────────────────────────────┐ │ │
│ │ │ ADMIN   │ │ │ │ BREADCRUMB BAR                      │ │ │
│ │ │ PANEL   │ │ │ │ Admin > Dashboard                   │ │ │
│ │ │ Header  │ │ │ │ (bg-white, border-b, shadow-sm)     │ │ │
│ │ ├─────────┤ │ │ ├─────────────────────────────────────┤ │ │
│ │ │ MAIN    │ │ │ │                                     │ │ │
│ │ │ • Dash  │ │ │ │ PAGE CONTENT                        │ │ │
│ │ │ • Analy │ │ │ │ (container mx-auto px-4 py-6)       │ │ │
│ │ ├─────────┤ │ │ │                                     │ │ │
│ │ │PRODUCTS │ │ │ │                                     │ │ │
│ │ │ • Add   │ │ │ │                                     │ │ │
│ │ │ • Manage│ │ │ │                                     │ │ │
│ │ ├─────────┤ │ │ │                                     │ │ │
│ │ │ SHOP    │ │ │ │                                     │ │ │
│ │ │ • Orders│ │ │ │                                     │ │ │
│ │ │ • Set   │ │ │ │                                     │ │ │
│ │ ├─────────┤ │ │ │                                     │ │ │
│ │ │ HELP    │ │ │ │                                     │ │ │
│ │ └─────────┘ │ │ └─────────────────────────────────────┘ │ │
│ └─────────────┘ └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ FOOTER                                                      │
└─────────────────────────────────────────────────────────────┘
```

**Sidebar Details**:
```css
Desktop Sidebar:
- Width: w-64 (256px)
- Position: fixed left-0 top-0
- Background: bg-white
- Shadow: shadow-lg
- Padding-top: pt-20 (below header)
- Z-index: z-30

Mobile Sidebar:
- Full overlay with backdrop
- Slide-in animation from left
- Close button in header
- Backdrop: bg-black opacity-50
```

**Navigation Structure**:
```
MAIN SECTION:
├── Dashboard
└── Analytics

PRODUCTS SECTION:
├── Add Product
└── Manage Products

SHOP MANAGEMENT:
├── Orders
└── Shop Settings

HELP:
└── Documentation (external link)
```

**Active Navigation State**:
```css
Active: bg-primary, text-white, font-medium
Inactive: text-gray-700, hover:bg-gray-100
Icons: h-5 w-5, mr-3
```

---

### **9. ADMIN DASHBOARD** (`/admin/dashboard`)
**Page Identification**: Admin overview with metrics and charts

**Layout Structure**:
```
┌─────────────────────────────────────────────────────────────┐
│ METRICS CARDS ROW (grid-cols-1 md:2 lg:4 gap-6)           │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│ │ TOTAL   │ │ ORDERS  │ │ REVENUE │ │ PRODUCTS│           │
│ │ SALES   │ │ TODAY   │ │ MONTH   │ │ COUNT   │           │
│ │ ┌─────┐ │ │ ┌─────┐ │ │ ┌─────┐ │ │ ┌─────┐ │           │
│ │ │ 📊  │ │ │ │ 📦  │ │ │ │ 💰  │ │ │ │ 📋  │ │           │
│ │ │ 150 │ │ │ │ 23  │ │ │ │₹45K │ │ │ │ 89  │ │           │
│ │ └─────┘ │ │ └─────┘ │ │ └─────┘ │ │ └─────┘ │           │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘           │
├─────────────────────────────────────────────────────────────┤
│ CHARTS & TABLES SECTION (grid lg:grid-cols-2 gap-6)       │
│ ┌─────────────────────┐ ┌─────────────────────────────────┐ │
│ │ SALES CHART         │ │ RECENT ORDERS TABLE             │ │
│ │ ┌─────────────────┐ │ │ ┌─────────────────────────────┐ │ │
│ │ │ Line/Bar Chart  │ │ │ │ Order ID | Customer | Amount│ │ │
│ │ │ (Chart.js/      │ │ │ │ Status   | Date    | Action │ │ │
│ │ │  Recharts)      │ │ │ │ ─────────────────────────── │ │ │
│ │ │                 │ │ │ │ #12345   | John    | ₹450  │ │ │
│ │ │                 │ │ │ │ Pending  | Today   | [View]│ │ │
│ │ │                 │ │ │ │ ─────────────────────────── │ │ │
│ │ │                 │ │ │ │ #12346   | Jane    | ₹320  │ │ │
│ │ │                 │ │ │ │ Complete | Today   | [View]│ │ │
│ │ └─────────────────┘ │ │ └─────────────────────────────┘ │ │
│ └─────────────────────┘ └─────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ QUICK ACTIONS SECTION                                      │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [+ Add Product] [📦 View Orders] [📊 Analytics] [⚙️ Set]│ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Metric Card Structure**:
```css
Background: bg-white
Border-radius: rounded-lg
Shadow: shadow-md
Padding: p-6
Border-left: border-l-4 (colored by metric type)
Icon: text-3xl mb-2
Value: text-2xl font-bold
Label: text-sm text-gray-600
```

**Chart Container**:
```css
Background: bg-white
Border-radius: rounded-lg
Shadow: shadow-md
Padding: p-6
Height: h-80 (320px)
```

---

### **10. ORDERS PAGE** (`/orders`)
**Page Identification**: Customer order history

**Layout Structure**:
```
┌─────────────────────────────────────────────────────────────┐
│ PAGE HEADER                                                │
│ • Title: "My Orders" (2xl, font-bold)                     │
│ • Subtitle: Order count and filters                       │
├─────────────────────────────────────────────────────────────┤
│ FILTERS BAR (optional)                                     │
│ [All] [Pending] [Completed] [Cancelled] [Date Range]      │
├─────────────────────────────────────────────────────────────┤
│ ORDERS LIST (space-y-4)                                   │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ORDER CARD #1                                           │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ HEADER: Order #12345 | Date | Status Badge         │ │ │
│ │ ├─────────────────────────────────────────────────────┤ │ │
│ │ │ ITEMS SECTION                                       │ │ │
│ │ │ ┌─────┐ Product 1 - Qty: 2 - ₹XX.XX               │ │ │
│ │ │ │ IMG │ Shop: Fresh Mart                           │ │ │
│ │ │ └─────┘                                             │ │ │
│ │ │ ┌─────┐ Product 2 - Qty: 1 - ₹XX.XX               │ │ │
│ │ │ │ IMG │ Shop: Green Grocers                        │ │ │
│ │ │ └─────┘                                             │ │ │
│ │ ├─────────────────────────────────────────────────────┤ │ │
│ │ │ FOOTER: Total: ₹XX.XX                              │ │ │
│ │ │ [Track Order] [Reorder] [View Details] [Support]  │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ORDER CARD #2                                           │ │
│ │ Similar structure...                                    │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ORDER CARD #3                                           │ │
│ │ Similar structure...                                    │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ PAGINATION (if needed)                                     │
│ [← Previous] [1] [2] [3] [Next →]                         │
└─────────────────────────────────────────────────────────────┘
```

**Order Status Badges**:
```css
Pending: bg-yellow-100 text-yellow-800
Processing: bg-blue-100 text-blue-800
Shipped: bg-purple-100 text-purple-800
Delivered: bg-green-100 text-green-800
Cancelled: bg-red-100 text-red-800
```

**Empty Orders State**:
```
┌─────────────────────────────────────┐
│ EMPTY ORDERS ILLUSTRATION           │
│ 📦 (large package icon)             │
│ "No orders yet"                     │
│ "Start shopping to see your orders" │
│ [Start Shopping] Button             │
└─────────────────────────────────────┘
```

---

## **🎯 Header Elements (Consistent Across Pages)**

### **Main Layout Header**
```
┌─────────────────────────────────────────────────────────────┐
│ HEADER (fixed top-0 w-full z-50)                          │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Container (mx-auto px-4)                                │ │
│ │ ┌─────────────┐              ┌─────────────────────────┐ │ │
│ │ │ BRAND       │              │ NAVIGATION & USER       │ │ │
│ │ │ ┌─────────┐ │              │ ┌─────────────────────┐ │ │ │
│ │ │ │ [🛒]    │ │              │ │ Desktop Navigation  │ │ │ │
│ │ │ │ City    │ │              │ │ Home | Products     │ │ │ │
│ │ │ │ Mart    │ │              │ │ Cart | Orders       │ │ │ │
│ │ │ └─────────┘ │              │ │ Dashboard | Profile │ │ │ │
│ │ └─────────────┘              │ └─────────────────────┘ │ │ │
│ │                              │ ┌─────────────────────┐ │ │ │
│ │                              │ │ Mobile Menu Button  │ │ │ │
│ │                              │ │ [☰] + Cart Icon     │ │ │ │
│ │                              │ └─────────────────────┘ │ │ │
│ │                              └─────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Header States**:
```css
Not Scrolled:
- Background: gradient (from-primary to-primary-dark)
- Text: text-white
- Height: h-16 md:h-20

Scrolled:
- Background: bg-white
- Text: text-gray-700
- Shadow: shadow-md
- Transition: all 0.3s ease
```

**Cart Icon with Badge**:
```css
Position: relative
Icon: h-6 w-6
Badge: absolute -top-2 -right-2, bg-red-500, text-white, text-xs, w-5 h-5, rounded-full
```

**Mobile Menu**:
```css
Backdrop: bg-black opacity-50
Menu: bg-white, slide-down animation
Items: block py-2, text-gray-700, hover:text-primary
```

### **Admin Layout Header**
```
┌─────────────────────────────────────────────────────────────┐
│ ADMIN HEADER (bg-white shadow-sm)                          │
│ ┌─────────────┐              ┌─────────────────────────────┐ │
│ │ [☰] BRAND   │              │ PAGE TITLE | USER MENU      │ │
│ │ Toggle +    │              │ Dashboard  | Admin Profile  │ │
│ │ Logo        │              │            | [Settings ▼]   │ │
│ └─────────────┘              └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## **🦶 Footer Elements (Consistent)**

```
┌─────────────────────────────────────────────────────────────┐
│ FOOTER (bg-gray-800 text-white py-10)                     │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Container (mx-auto px-4)                                │ │
│ │ ┌─────────────────┐ ┌─────────────┐ ┌─────────────────┐ │ │
│ │ │ BRAND SECTION   │ │ QUICK LINKS │ │ CONTACT INFO    │ │ │
│ │ │ (col-span-2)    │ │             │ │                 │ │ │
│ │ │ ┌─────────────┐ │ │ ┌─────────┐ │ │ ┌─────────────┐ │ │ │
│ │ │ │ Logo + Name │ │ │ │ Home    │ │ │ │ 📍 Address  │ │ │ │
│ │ │ │ Description │ │ │ │ Login   │ │ │ │ 📧 Email    │ │ │ │
│ │ │ │ Social Icons│ │ │ │ Register│ │ │ │ 📞 Phone    │ │ │ │
│ │ │ │ [📱][📷][💼]│ │ │ └─────────┘ │ │ └─────────────┘ │ │ │
│ │ │ └─────────────┘ │ │             │ │                 │ │ │
│ │ └─────────────────┘ └─────────────┘ └─────────────────┘ │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ COPYRIGHT & LEGAL (border-t border-gray-700 pt-6)  │ │ │
│ │ │ © 2024 Mini Mart. All rights reserved.             │ │ │
│ │ │ Privacy Policy • Terms of Service                  │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Footer Styling**:
```css
Grid: grid-cols-1 md:grid-cols-4 gap-8
Brand Section: col-span-1 md:col-span-2
Links: text-gray-400, hover:text-white, transition-colors
Social Icons: h-6 w-6, space-x-4
Copyright: text-center, text-gray-400, text-sm
```

---

## **🎨 Animation & Interaction Details**

### **Page Transitions**
```css
Framer Motion Configuration:
- Initial: { opacity: 0, y: 10 }
- Animate: { opacity: 1, y: 0 }
- Exit: { opacity: 0, y: -10 }
- Duration: 0.3s
- Easing: ease-in-out
```

### **Component Animations**

**Card Hover Effects**:
```css
Transform: translateY(-5px)
Shadow: shadow-lg → shadow-xl
Transition: all 0.3s ease
```

**Button Interactions**:
```css
Hover: transform translateY(-1px), shadow increase
Active: transform scale(0.98)
Focus: ring-2 ring-primary ring-opacity-50
Disabled: opacity-50, cursor-not-allowed
```

**Image Hover Effects**:
```css
Product Images: transform scale(1.1)
Duration: 0.5s
Overflow: hidden (on container)
```

**Loading Animations**:
```css
Spinner: animate-spin, duration-1s, repeat-infinite
Skeleton: animate-pulse, bg-gray-200
Progress: animate-bounce (for cart flying animation)
```

### **Interactive States**

**Form Elements**:
```css
Focus States:
- Border: border-primary
- Ring: ring-2 ring-primary ring-opacity-20
- Outline: outline-none

Error States:
- Border: border-red-500
- Ring: ring-red-500
- Text: text-red-600
```

**Navigation States**:
```css
Active Link:
- Background: bg-primary
- Text: text-white
- Font-weight: font-medium

Hover Link:
- Background: bg-gray-100 (light theme)
- Background: bg-white bg-opacity-10 (dark theme)
```

**Cart Animation**:
```css
Flying Product Animation:
- Start: Product image position
- End: Cart icon position
- Transform: scale(1) → scale(0.2)
- Opacity: 1 → 0.5
- Duration: 0.8s
- Easing: cubic-bezier(0.19, 1, 0.22, 1)
```

### **Responsive Breakpoints**
```css
Mobile: < 640px (sm)
Tablet: 640px - 1024px (md/lg)
Desktop: > 1024px (xl)

Grid Responsive Patterns:
- Categories: grid-cols-2 md:grid-cols-3 lg:grid-cols-6
- Products: grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4
- Metrics: grid-cols-1 md:grid-cols-2 lg:grid-cols-4
```

### **Accessibility Features**
```css
Focus Indicators: ring-2 ring-primary
ARIA Labels: Proper labeling for screen readers
Keyboard Navigation: Tab order and focus management
Color Contrast: WCAG AA compliant
Alt Text: Descriptive image alternatives
```

---

## **📱 Mobile-Specific Layouts**

### **Mobile Header**
```
┌─────────────────────────────────────┐
│ [🛒 Logo] [Cart 🛒] [☰ Menu]       │
└─────────────────────────────────────┘
```

### **Mobile Navigation Menu**
```
┌─────────────────────────────────────┐
│ SLIDE-DOWN MENU                     │
│ ┌─────────────────────────────────┐ │
│ │ User Info (if logged in)        │ │
│ ├─────────────────────────────────┤ │
│ │ Home                            │ │
│ │ Products                        │ │
│ │ Cart                            │ │
│ │ Orders                          │ │
│ │ Dashboard                       │ │
│ │ Settings                        │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### **Mobile Product Grid**
```css
Grid: grid-cols-1 sm:grid-cols-2
Gap: gap-4
Card Height: Auto-adjust
Image: Aspect ratio maintained
```

This comprehensive visual layout guide provides all the necessary details to accurately recreate the City Mart web application's frontend design across all pages, components, and interactive states.