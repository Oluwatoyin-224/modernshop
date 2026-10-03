# Modern Shop

A complete, responsive e-commerce shop built with React, TypeScript, Vite, Tailwind CSS, Supabase, Mailgun, and Google OAuth.

## Features

- **Shop page** with a responsive product grid loaded from Supabase
- **Shopping cart** with add/remove, quantity controls, and persistent storage (survives page refresh)
- **Checkout page** with form validation (name, email, phone, address)
- **Order confirmation** page with order number and summary
- **Order confirmation emails** sent via Mailgun (server-side edge function)
- **Google authentication** via Supabase Auth + Google OAuth
- **Fully responsive** — works on mobile, tablet, iPad, and desktop
- **Loading, error, and success states** throughout

## Tech Stack

| Layer       | Technology                          |
| ----------- | ----------------------------------- |
| Frontend    | React 18 + TypeScript + Vite        |
| Styling     | Tailwind CSS                        |
| Icons       | Lucide React                        |
| Database    | Supabase (PostgreSQL)               |
| Auth        | Supabase Auth + Google OAuth        |
| Email       | Mailgun (via Supabase Edge Function)|
| Testing     | Vitest + Testing Library            |

## Installation

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables
cp .env.example .env
# Edit .env with your Supabase URL and anon key
```

Your Supabase URL and anon key are already pre-configured in `.env`. You only need to edit `.env` if you're using a different Supabase project.

## Running Locally

```bash
npm run dev
```

The app runs at `http://localhost:5173`.

## Building for Production

```bash
npm run build
npm run preview
```

The production build is output to `dist/`.

## Running Tests

```bash
npm test
```

Tests cover:
- Adding a product to cart
- Removing a product from cart
- Increasing/decreasing cart quantity
- Calculating subtotal and total
- Checkout form validation

## Environment Variables

### Frontend (in `.env`)

| Variable                 | Description                        | Required |
| ------------------------ | ---------------------------------- | -------- |
| `VITE_SUPABASE_URL`      | Your Supabase project URL          | Yes      |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public key      | Yes      |

### Server-side (Edge Function secrets — set in Supabase Dashboard)

| Variable              | Description                                      | Required |
| --------------------- | ------------------------------------------------ | -------- |
| `MAILGUN_API_KEY`     | Your Mailgun API key                             | Yes*     |
| `MAILGUN_DOMAIN`      | Your Mailgun sending domain                      | Yes*     |
| `MAILGUN_FROM_EMAIL`  | The "from" email address for order confirmations | Yes*     |

*Only required if you want confirmation emails to be sent. Orders will still be saved without Mailgun configured.

**How to set Mailgun secrets:**
1. Go to your Supabase Dashboard
2. Navigate to **Project Settings > Edge Functions > Secrets**
3. Add each secret: `MAILGUN_API_KEY`, `MAILGUN_DOMAIN`, `MAILGUN_FROM_EMAIL`

## Supabase Configuration

### 1. Database Schema

The database tables are already created and seeded with 10 products. The schema includes:

- **products** — id, name, description, price, image_url, created_at
- **orders** — id, customer_name, email, phone, address, total, status, created_at
- **order_items** — id, order_id, product_id, quantity, price

Row Level Security (RLS) is enabled on all tables with policies allowing:
- Public read of products
- Public insert and read of orders (guest checkout)
- Public insert and read of order items

### 2. Google OAuth Setup

To enable "Sign in with Google":

#### Step A: Configure Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select an existing one)
3. Navigate to **APIs & Services > Credentials**
4. Click **Create Credentials > OAuth client ID**
5. Choose **Web application**
6. Add your authorized redirect URIs:
   - For local dev: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
   - For production: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
7. Copy the **Client ID** and **Client Secret**

#### Step B: Configure Supabase Auth

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **Authentication > Providers**
3. Find **Google** and enable it
4. Paste the **Client ID** and **Client Secret** from Google Cloud Console
5. Save

After this, the "Sign in" button in the navbar will trigger Google's OAuth flow.

## Mailgun Configuration

### 1. Create a Mailgun Account

1. Sign up at [Mailgun](https://www.mailgun.com/)
2. Add and verify your sending domain (e.g. `mail.yourdomain.com`)
3. Get your API key from **Settings > API Keys**

### 2. Configure Secrets in Supabase

Set these as Edge Function secrets in Supabase Dashboard (**Project Settings > Edge Functions > Secrets**):

```
MAILGUN_API_KEY=key-your-api-key
MAILGUN_DOMAIN=mail.yourdomain.com
MAILGUN_FROM_EMAIL=orders@yourdomain.com
```

### 3. How It Works

When an order is placed:
1. The order and order items are saved to Supabase
2. The frontend calls the `send-confirmation-email` Edge Function
3. The Edge Function uses the Mailgun API to send an HTML email with:
   - Order number
   - Products purchased (name, quantity, price)
   - Total amount
   - Thank-you message

Mailgun credentials are never exposed to the frontend — they live only as server-side secrets.

## Project Structure

```
src/
  components/       # Reusable UI components
    Navbar.tsx
    ProductCard.tsx
    ProductGrid.tsx
    CartDrawer.tsx
  context/          # React context providers
    CartContext.tsx
    AuthContext.tsx
  lib/              # Utilities and config
    supabase.ts
    cart-utils.ts
  pages/            # Route-level pages
    HomePage.tsx
    CheckoutPage.tsx
    OrderSuccessPage.tsx
  test/             # Test files
  types/            # TypeScript types
supabase/
  functions/        # Edge functions (server-side)
    send-confirmation-email/
  config.toml       # Supabase config
```

## Deployment

### Deploy to Vercel / Netlify / any static host

1. Run `npm run build`
2. Deploy the `dist/` folder to your hosting provider
3. Set the environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) in your hosting provider's settings

### Edge Function

The `send-confirmation-email` Edge Function is already deployed to Supabase. If you update it:

1. Edit `supabase/functions/send-confirmation-email/index.ts`
2. The function will be redeployed automatically when changes are detected

## What You Need to Configure Manually

1. **Google Cloud Console**: Create an OAuth 2.0 client ID and add the Supabase callback URL as an authorized redirect URI. See [Google OAuth Setup](#2-google-oauth-setup) above.

2. **Supabase Dashboard**: Enable the Google auth provider and paste your Google Client ID and Secret. See [Step B](#step-b-configure-supabase-auth) above.

3. **Mailgun**: Create an account, verify your sending domain, and add the three secrets (`MAILGUN_API_KEY`, `MAILGUN_DOMAIN`, `MAILGUN_FROM_EMAIL`) to Supabase Edge Function secrets. See [Mailgun Configuration](#mailgun-configuration) above.
