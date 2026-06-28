# Sashwears

Production-ready e-commerce site for Sashwears, a Ghana-based women's fashion boutique. Built with Next.js 15, Sanity v3, Paystack, and Tailwind CSS v4.

---

## Environment Setup

Copy `.env.local.example` and fill in your values:

```bash
cp .env.local .env.local.example  # already pre-filled with placeholder keys
```

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | [sanity.io/manage](https://sanity.io/manage) → your project |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` (default) |
| `SANITY_API_TOKEN` | Sanity → API → Tokens → add a write token |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | [dashboard.paystack.com](https://dashboard.paystack.com) → Settings → API Keys |
| `PAYSTACK_SECRET_KEY` | Same page, secret key |
| `NEXT_PUBLIC_SITE_URL` | Your production URL |

---

## Local Development

```bash
npm install
npm run dev
```

- App: [http://localhost:3000](http://localhost:3000)
- Sanity Studio: [http://localhost:3000/studio](http://localhost:3000/studio)

---

## Sanity Dataset Setup

### Option A — start fresh in Studio

1. Open [http://localhost:3000/studio](http://localhost:3000/studio)
2. Create your **Site Settings** document first (hero video URL, WhatsApp number, contact details)
3. Add **Categories**: Dresses, Tops, Two Pieces, Shoes
4. Add **Shipping Zones**: Accra (GH¢30, 1–2 days), Other Regions (GH¢60, 3–5 days), International (GH¢200, 7–14 days)
5. Add **Products** (see "Adding a Product" below)
6. Add a **Lookbook** entry with a hero image

### Option B — import sample data

```bash
npx sanity dataset import sample-data.ndjson production
```

> A `sample-data.ndjson` seed file with 3 products per category and 1 lookbook entry is included in the repo root (generate it from your Studio after first setup).

---

## Paystack Test Keys

Use the test keys from your Paystack dashboard. In test mode:

- Any valid card number works (e.g. `4084 0840 8408 4081`, expiry `01/25`, CVV `408`)
- MTN MoMo test: use number `0551234987`
- On success the app will redirect to `/order/[orderNumber]`

To go live, swap `pk_test_...` / `sk_test_...` for `pk_live_...` / `sk_live_...` in your environment variables.

---

## Vercel Deployment

1. Push to GitHub (see below)
2. Import the repo at [vercel.com/new](https://vercel.com/new)
3. Add all environment variables from `.env.local` in the Vercel dashboard
4. Set **Framework Preset** to `Next.js` (auto-detected)
5. Deploy — first build takes ~2 minutes

### Paystack Webhook

After deploy, set your Paystack webhook URL in the Paystack dashboard:

```
https://sashwears.com/api/paystack/webhook
```

---

## Adding a Product (3-step guide for the Sashwears team)

**Step 1 — Open Studio**
Go to `https://sashwears.com/studio`, log in with your Sanity account.

**Step 2 — Fill in the product**
- Click **Product → New Product**
- Enter: Title, Category, Price (in GHS), Images (upload at least 2), Sizes, Stock count
- Toggle **New Arrival** if it's a new drop
- Toggle **Featured on Home** to show it in the "The Edit" section (max 3)
- Click **Publish**

**Step 3 — Done**
The product appears on the site within 60 seconds (ISR revalidation).

---

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 15 App Router |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| CMS | Sanity v3 |
| Payments | Paystack Inline v2 |
| State | Zustand (persisted) |
| Forms | React Hook Form + Zod |
| Animations | Framer Motion (hero only) |
| Hosting | Vercel |
| Analytics | Vercel Analytics |

## Key directories

```
src/
  app/              # Next.js App Router pages and API routes
  components/       # Shared UI components
    layout/         # Nav, Footer, CartDrawer
    product/        # ProductCard, ProductGallery, AddToCartForm
    home/           # HeroSection
    ui/             # PortableTextRenderer
  sanity/           # Client, queries, schemas
  store/            # Zustand cart store
  types/            # Shared TypeScript types
  lib/              # Paystack helpers
```
# sashwears
