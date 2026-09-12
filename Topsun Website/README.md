<div align="center">

# 👟 TOPSUN FOOTWEAR
### *Engineered for Movement. Designed for the Future.*

[![Live Demo](https://img.shields.io/badge/Live%20Store-topsun.in-FF5722?style=for-the-badge&logo=google-chrome&logoColor=white)](https://topsun.in)
[![React](https://img.shields.io/badge/React%2018-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite%206-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Razorpay](https://img.shields.io/badge/Razorpay-02042B?style=for-the-badge&logo=razorpay&logoColor=3395FF)](https://razorpay.com/)

<p align="center">
  A state-of-the-art, high-performance direct-to-consumer (D2C) footwear e-commerce platform built with <strong>React 18</strong>, <strong>Three.js</strong>, <strong>Supabase</strong>, and <strong>Tailwind CSS</strong>. Featuring interactive 3D product previews, instant checkout with Razorpay, hardened database security, and pre-rendered SSG routes for peak SEO performance.
</p>

[Explore Live Store](https://topsun.in) • [Key Features](#-key-features) • [Tech Stack](#-tech-stack) • [Architecture](#-architecture) • [Getting Started](#-getting-started) • [About the Designer](#-about-the-designer)

---

</div>

## 🌟 Executive Overview

**TOPSUN Footwear** is an athletic and lifestyle footwear storefront designed to deliver a luxury digital retail experience. Every aspect of the platform—from dynamic Three.js shoe rendering to sub-second page transitions, automated invoice PDF generation, and phone OTP authentication—is crafted to maximize user engagement and checkout conversion.

---

## ✨ Key Features

### 🎮 Immersive 3D Product Showcase
- **Real-Time 3D Shoe Viewer**: Powered by Three.js, allowing customers to interact, rotate, inspect textures, and preview colorways dynamically.
- **Dynamic Lighting & Reflections**: Studio-grade lighting and realistic sole shadows for a tactile product inspection experience.

### 🛍️ Frictionless Shopping & Checkout
- **Instant Cart & Mini-Drawer**: Real-time cart calculations, combo offers, and cross-sell recommendations.
- **Multi-Method Payments via Razorpay**: Seamless support for UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, Net Banking, and Cash on Delivery (COD).
- **Automated Digital Invoices**: Instant client-side PDF receipt and invoice generation upon successful order placement.
- **Cart Abandonment Recovery**: Local and remote session tracking with automated recovery nudges.

### 🔒 Enterprise-Grade Security & Database Architecture
- **Supabase PostgreSQL & Row Level Security (RLS)**: Enforced granular security policies across all tables (`orders`, `order_items`, `products`, `product_variants`, `shipments`).
- **Security Invoker Views**: Views (`dashboard_orders`, `low_stock_variants`) configured with `security_invoker = true` to strictly respect caller permissions.
- **Hardened API Gateways**: Server-side PHP dispatchers with CORS origin whitelisting, IP rate limiting, input sanitization, and no hardcoded secret keys.
- **Authentication Dual-Engine**: Phone OTP verification via SMS gateway (APITxT) alongside Google OAuth.

### 🚀 SEO & Lighthouse Optimization
- **Pre-Rendered Static Routes (SSG)**: Automated pre-rendering generates static HTML for 20+ core routes during build, ensuring 100% crawlability.
- **Comprehensive Metadata & Social Cards**: Rich OpenGraph images, Twitter cards, and structured JSON-LD schema on all product pages.
- **Automated Image Optimization**: WebP compression pipeline with asset size reduction averaging 20-80%.
- **Robots, Sitemap & LLMs Manifest**: Automated XML sitemap generation, structured `robots.txt`, and `llms.txt` for AI crawlers.

### 📊 Real-Time Operations & Admin Suite
- **Interactive Telemetry Dashboard**: Visual metrics for gross revenue, 7-day revenue trends, average order value (AOV), and conversion rates.
- **Order Lifecycle Management**: One-click status transitions (Pending → Processing → Shipped → Delivered).
- **Live Inventory Health**: Automated stock level alerts and low-stock variant monitoring.

---

## 🛠️ Tech Stack

| Domain | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18 + TypeScript | Component-driven, type-safe user interface |
| **Build & Bundler** | Vite 6 | Lightning-fast HMR and optimized production bundles |
| **Styling & Design System** | Tailwind CSS + Custom CSS Variables | Fluid responsive layouts, dark/light theme switching |
| **3D Graphics** | Three.js | Real-time interactive 3D model rendering |
| **Icons & Micro-Interactions** | Lucide React + Radix UI | Accessible UI primitives and crisp vector iconography |
| **Database & Auth** | Supabase (PostgreSQL + RLS) | Real-time data persistence, authentication, and security |
| **Payment Gateway** | Razorpay SDK | Secure UPI, Card, and Netbanking processing |
| **Logistics & Tracking** | ShipMozo Integration | Real-time courier dispatch and shipment timeline tracking |
| **Transactional Email** | Hostinger SMTP API | Order confirmations, dispatch notifications |
| **SMS & OTP** | APITxT SMS Gateway | Fast Indian mobile OTP authentication |

---

## 📁 Repository Structure

```text
Topsun-Website/
├── public/
│   ├── api/                     # Hardened server-side PHP dispatchers
│   │   ├── config.php           # Dynamic environment loader (no secrets)
│   │   ├── send-otp.php         # Rate-limited SMS OTP gateway
│   │   └── send-email.php       # Anti-relay transactional email sender
│   ├── images/                  # High-resolution optimized product assets
│   ├── sitemap.xml              # Search engine index
│   ├── robots.txt               # Crawler directives
│   └── llms.txt                 # AI search discovery manifest
├── scripts/
│   └── prerender.mjs            # Static site pre-rendering script (20 routes)
├── src/
│   ├── app/
│   │   ├── components/          # Reusable UI & feature components
│   │   │   ├── Header.tsx       # Responsive header with search & cart badge
│   │   │   ├── HeroShoe3D.tsx   # Three.js interactive 3D shoe canvas
│   │   │   ├── ThemeToggle.tsx  # Dark / Light theme switcher
│   │   │   ├── CookieBanner.tsx # GDPR / Consent notification
│   │   │   └── FloatingWhatsApp # Direct VIP support channel
│   │   ├── context/             # Global state (Cart, Auth, Theme)
│   │   ├── pages/               # Top-level view routes
│   │   │   ├── Home.tsx         # High-impact landing page
│   │   │   ├── Shop.tsx         # Filterable catalog with search & sorting
│   │   │   ├── Checkout.tsx     # Streamlined multi-step checkout
│   │   │   ├── Admin.tsx        # Operations & sales dashboard
│   │   │   └── ...              # ProductDetail, Orders, Sizing, Policies
│   │   ├── routes/              # Client-side router configuration
│   │   └── utils/               # Services (Razorpay, Supabase, Invoicing)
│   ├── data/
│   │   └── products.ts          # Static catalog metadata & specs
│   └── styles/
│       └── theme.css            # Design tokens, gradients, and animations
├── database/                    # SQL migration scripts & RLS policy fixes
├── .env.example                 # Safe environment template
├── package.json                 # Dependencies & scripts
└── vite.config.ts               # Vite configuration & optimizations
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **pnpm**
- A **Supabase** project account
- A **Razorpay** test/live key

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/avish2696/Topsun-Web.git
   cd "Topsun-Web/Topsun Website"
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Copy `.env.example` to `.env` and fill in your keys:
   ```bash
   cp .env.example .env
   ```
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key
   VITE_RAZORPAY_KEY_ID=rzp_live_your_key_id
   VITE_API_BASE_URL=https://topsun.in/api
   VITE_AUTH_TYPE=phone
   ```

4. **Start the Development Server**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

5. **Production Build & Static Pre-Rendering**
   ```bash
   npm run build
   ```
   This will bundle assets with Vite and automatically run `scripts/prerender.mjs` to generate 20 pre-rendered static routes into `dist/`.

---

## 🔒 Security Architecture

```
                       ┌─────────────────────────┐
                       │     Browser Client      │
                       └────────────┬────────────┘
                                    │
           ┌────────────────────────┼────────────────────────┐
           │ (Read / Anon JWT)      │ (Secure POST)          │ (Direct Payment)
           ▼                        ▼                        ▼
┌───────────────────────┐ ┌──────────────────────┐ ┌───────────────────┐
│     Supabase RLS      │ │  Hardened PHP API    │ │     Razorpay      │
│  - product_variants   │ │  - Rate Limiting     │ │  - UPI / Cards    │
│  - shipments          │ │  - CORS Whitelist    │ │  - Webhooks       │
│  - orders (isolated)  │ │  - Sanitized Headers │ │  - Verification   │
│  - Security Invoker   │ │  - .env Driven Keys  │ └───────────────────┘
└───────────────────────┘ └──────────────────────┘
```

- **Row Level Security (RLS)**: Enforces table isolation so customers only access their own orders while the product catalog remains publicly queryable.
- **Zero Exposed Server Secrets**: All private keys (`RAZORPAY_KEY_SECRET`, `APITXT_API_KEY`, SMTP credentials) are excluded from the client-side bundle and accessed strictly on the backend.

---

## 👨‍💻 About the Designer & Developer

<div align="center">

### **Avishkar**
*Full-Stack Engineer & Digital E-Commerce UI/UX Architect*

[![GitHub](https://img.shields.io/badge/GitHub-avish2696-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/avish2696)
[![Portfolio / Website](https://img.shields.io/badge/Portfolio-topsun.in-FF5722?style=for-the-badge&logo=safari&logoColor=white)](https://topsun.in)

</div>

### 🎨 Design Philosophy
> *"An e-commerce platform should not just be a digital catalog—it should be an immersive brand experience. By combining tactile 3D interactions, micro-animations, and uncompromising speed with ironclad security, we turn passive visitors into loyal brand advocates."*

### 🛠️ Core Capabilities
- **E-Commerce Design Systems**: Crafting cohesive design languages with fluid typography, responsive grid systems, and dark/light mode balance.
- **Interactive Web Experiences**: Seamlessly integrating Three.js 3D web graphics into consumer web apps without sacrificing load speeds.
- **Full-Stack Architecture**: End-to-end implementation from React frontends to PostgreSQL database schemas, Supabase Row Level Security, and payment gateway integration.
- **Performance & Conversion Optimization**: Deep understanding of user psychology, frictionless checkout flows, Core Web Vitals, and technical SEO.

---

## 📄 License

This project is licensed under the **MIT License**. Feel free to use and adapt this project for educational and commercial purposes.

---

<div align="center">

Made with ❤️ by [Avishkar](https://github.com/avish2696) • Built for **TOPSUN Footwear**

</div>
