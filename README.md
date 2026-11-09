# Salesforce Mobile CRM — OAuth2 (PKCE) + Supabase + Next.js App Router

A mobile-first web application that connects directly to **Salesforce CRM** using the **OAuth 2.0 Web Server Flow (with PKCE S256)**, encrypts tokens at rest using **AES-256-GCM**, manages credentials via **Supabase (`sf_tokens`)**, and integrates **Salesforce REST API v60.0** for querying (SOQL) and creating **Contacts**.

---

## 1. Architecture Overview

```text
[Browser / Mobile UI]
   │
   ├── 1. GET /api/auth/salesforce
   │      ├─ Generates PKCE (code_verifier + code_challenge S256) & CSRF state
   │      ├─ Stores them in temporary httpOnly cookies (sf_oauth_verifier, sf_oauth_state)
   │      └─ 307 Redirects to https://login.salesforce.com/services/oauth2/authorize
   │
   ├── 2. GET /api/auth/callback/salesforce?code=...&state=...
   │      ├─ Validates CSRF state & reads code_verifier from cookies
   │      ├─ POSTs to https://login.salesforce.com/services/oauth2/token (application/x-www-form-urlencoded)
   │      ├─ Encrypts access_token & refresh_token using AES-256-GCM
   │      ├─ Upserts into `public.sf_tokens` in Supabase (with Encrypted Local Fallback)
   │      └─ Sets encrypted `sf_session` httpOnly cookie & Redirects to `/`
   │
   ├── 3. GET & POST /api/salesforce/contacts
   │      ├─ Calls `getValidAccessToken()` to verify token validity
   │      ├─ On HTTP 401 Unauthorized → Automatically calls `grant_type=refresh_token` to renew token
   │      └─ Executes SOQL Query / Creates `Contact` SObject via Salesforce REST API v60.0
   │
   └── 4. POST /api/auth/salesforce/disconnect
          ├─ Revokes token at `/services/oauth2/revoke`
          └─ Deletes token record from `sf_tokens` & clears `sf_session` cookie
```

---

## 2. Project Structure & File-by-File Reference

### A. Root Configuration & Environment Files

| File | Purpose & Detailed Description |
| :--- | :--- |
| `.env.local` | Contains local runtime secrets (git-ignored): `SALESFORCE_CLIENT_ID`, `SALESFORCE_CLIENT_SECRET`, `SALESFORCE_REDIRECT_URI`, `SALESFORCE_LOGIN_URL`, the 32-byte hex `TOKEN_ENCRYPTION_KEY`, and Supabase credentials (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`). |
| `.env.local.example` | Template environment file documenting all required variables for onboarding developers. |
| `next.config.ts` | Next.js App Router configuration. |
| `postcss.config.mjs` | PostCSS configuration registering the internal Tailwind CSS v4 compiler plugin (`lib/tailwind-postcss.cjs`). |
| `proxy.ts` | Next.js 16 Proxy (Middleware) that refreshes Supabase sessions (`updateSession`) on incoming requests and guards the `/dashboard` route. |
| `package.json` | Declares project dependencies (`next`, `react`, `tailwindcss`, `@supabase/ssr`, `@supabase/supabase-js`) and npm scripts (`dev`, `build`, `start`, `lint`). |
| `tsconfig.json` | Strict TypeScript configuration (`strict: true`) with `@/*` path aliases. |

---

### B. Database Schema & Supabase Utilities (`supabase/` & `lib/supabase/`)

| File | Purpose & Detailed Description |
| :--- | :--- |
| `supabase/migrations/20261109000000_create_sf_tokens.sql` | Primary SQL migration creating the `public.sf_tokens` table (`id`, `user_id`, `salesforce_user_id`, `instance_url`, `access_token`, `refresh_token`, `issued_at`, `updated_at`), lookup indexes, an automatic `updated_at` trigger, and **Row Level Security (RLS)** policies for `authenticated` users and `service_role`. |
| `supabase/schema.sql` | Supplemental SQL schema defining `public.sf_credentials` (used by the extended `/dashboard` route). |
| `lib/supabase/client.ts` | Creates a Supabase Browser Client (`createBrowserClient`) for use inside Client Components (`'use client'`). |
| `lib/supabase/server.ts` | Provides two server-side Supabase factories:<br>1. `createClient()`: Uses Next.js async `cookies()` for Server Components and Route Handlers.<br>2. `createServiceRoleClient()`: Uses `SUPABASE_SERVICE_ROLE_KEY` for server-side token management in `sf_tokens` during OAuth callbacks and token refreshes (bypasses RLS safely on the server). |
| `utils/supabase/client.ts`<br>`utils/supabase/server.ts`<br>`utils/supabase/middleware.ts` | SSR session helpers supporting `proxy.ts` and the `/login` authentication flow. |

---

### C. Cryptography & Salesforce Service Layer (`lib/crypto.ts` & `lib/salesforce/`)

| File | Purpose & Detailed Description |
| :--- | :--- |
| `lib/crypto.ts` | **AES-256-GCM** authenticated encryption utilities:<br>- `encrypt(plaintext, keyHex)`: Generates a random 12-byte IV, encrypts the plaintext, and returns `iv:authTag:ciphertext`.<br>- `decrypt(ciphertext, keyHex)`: Verifies the 16-byte GCM authentication tag (preventing tampering) and decrypts the payload.<br>- `generateEncryptionKey()`: Helper to generate a 32-byte (64-hex-character) encryption key. |
| `lib/salesforce/token.ts` | **Salesforce Token Lifecycle & Session Management**:<br>- `getSalesforceEnv()`: Reads and normalizes Salesforce environment variables.<br>- `sealToken()` / `unsealToken()`: Encrypts and decrypts `access_token` and `refresh_token`.<br>- `getSalesforceSession()` / `encodeSalesforceSession()`: Reads and encrypts the `sf_session` (`httpOnly`) cookie payload.<br>- `getValidAccessToken(salesforceUserId)`: Loads tokens from Supabase `sf_tokens` (with an encrypted local fallback if Supabase is not yet configured) and probes Salesforce REST API (`/services/data/v60.0/limits`). If Salesforce returns `401 Unauthorized`, it automatically triggers `refreshSalesforceAccessToken()`.<br>- `refreshSalesforceAccessToken()`: Sends a `POST` request with `grant_type=refresh_token` to obtain a fresh `access_token` and persists it back to `sf_tokens`. |
| `lib/salesforce/client.ts` | **Salesforce REST API v60.0 Client**:<br>- `salesforceFetch()`: Internal fetch wrapper that attaches `Authorization: Bearer <token>` and automatically retries once after refreshing the token if a `401` response is encountered.<br>- `query<T>(soql)`: Executes a SOQL query against `/services/data/v60.0/query/?q=...`.<br>- `getRecord(sobject, id, fields)`: Retrieves a single SObject record by ID.<br>- `createRecord(sobject, payload)`: Creates a new SObject record (`POST /services/data/v60.0/sobjects/{sobject}/`).<br>- `updateRecord(sobject, id, payload)`: Updates an existing SObject record (`PATCH /services/data/v60.0/sobjects/{sobject}/{id}`). |
| `lib/salesforce/api.ts` | High-level wrappers for fetching Org limits (`getOrgLimits`) and Salesforce user identity (`getSalesforceUserInfo`). |
| `lib/tailwind-postcss.cjs` | Local PostCSS plugin powered by `@tailwindcss/node` and `@tailwindcss/oxide` to compile Tailwind CSS v4 reliably. |

---

### D. API Route Handlers (`app/api/`)

| File | Endpoint | Purpose & Detailed Description |
| :--- | :--- | :--- |
| `app/api/auth/salesforce/route.ts` | `GET /api/auth/salesforce` | **Initiates OAuth2 PKCE Flow**:<br>1. Generates a cryptographic `code_verifier` (32 random bytes, Base64URL) and `code_challenge` (`SHA-256`).<br>2. Generates a random `state` token for CSRF protection.<br>3. Stores `sf_oauth_verifier` and `sf_oauth_state` in `httpOnly` cookies (10-minute TTL).<br>4. Redirects the user to `${SALESFORCE_LOGIN_URL}/services/oauth2/authorize` with `scope=api refresh_token offline_access openid`. |
| `app/api/auth/callback/salesforce/route.ts` | `GET /api/auth/callback/salesforce` | **Handles Salesforce OAuth2 Callback**:<br>1. Validates `state` against the stored cookie and retrieves `code_verifier`.<br>2. Sends a `POST` request to `/services/oauth2/token` using `Content-Type: application/x-www-form-urlencoded` and `URLSearchParams` (`grant_type=authorization_code`, `code`, `client_id`, `client_secret`, `redirect_uri`, `code_verifier`).<br>3. Captures and logs detailed HTTP `status`, `statusText`, and `responseBody` if an error occurs.<br>4. Fetches user metadata from the Salesforce Identity URL (`tokenData.id`), encrypts the tokens, and upserts them into `sf_tokens` in Supabase.<br>5. Sets the encrypted `sf_session` (`httpOnly`) cookie and redirects to `/?connected=true`. |
| `app/api/auth/salesforce/callback/route.ts` | `GET /api/auth/salesforce/callback` | Route alias forwarding to `/api/auth/callback/salesforce` for backward compatibility. |
| `app/api/auth/salesforce/disconnect/route.ts` | `POST /api/auth/salesforce/disconnect` | **Disconnects & Revokes Token**:<br>1. Reads the active `sf_session` cookie.<br>2. Calls `${SALESFORCE_LOGIN_URL}/services/oauth2/revoke` to invalidate the token on Salesforce.<br>3. Deletes the token record from `sf_tokens` and clears the `sf_session` cookie. |
| `app/api/salesforce/contacts/route.ts` | `GET / POST /api/salesforce/contacts` | **Contacts CRUD Proxy Endpoint**:<br>- `GET`: Runs `SELECT Id, Name, Email, Phone, Title FROM Contact LIMIT 10` and returns the Contact records.<br>- `POST`: Validates `LastName`, invokes `createRecord('Contact', payload)`, and returns the newly created Contact. |
| `app/api/salesforce/limits/route.ts` | `GET /api/salesforce/limits` | Server proxy returning Salesforce Org API and storage utilization metrics (`DailyApiRequests`, `DataStorageMB`, `FileStorageMB`). |

---

### E. User Interface (App Router Pages & Components)

| File | Purpose & Detailed Description |
| :--- | :--- |
| `app/layout.tsx` | Root application layout importing `app/globals.css` and configuring SEO metadata. |
| `app/globals.css` | **Tailwind CSS v4** stylesheet (`@import "tailwindcss"`), defining Salesforce brand tokens (`--color-sf-blue`, `.sf-gradient`), `.skeleton` shimmer animations, Dark Mode variables, and native `dialog::backdrop` blur styling. |
| `app/page.tsx` | Main Server Component entry page: reads the active `sf_session` cookie via `getSalesforceSession()`, extracts any OAuth error query parameters, and renders `MobileAppShell`. |
| `components/salesforce/MobileAppShell.tsx` | **Mobile-First Application Shell (`max-w-md mx-auto`)**:<br>- **Disconnected State**: Displays the *"Connect with Salesforce"* CTA button, a breakdown of requested OAuth2 scopes (`api`, `refresh_token`, `offline_access`, `openid`), and a *"Preview Connected Workspace (Demo Mode)"* button.<br>- **Connected State**: Displays the sticky Header with User Name / Instance URL and `Connected` status badge, a real-time Contact search input, a `Refresh` button, Contact cards, a `Disconnect / Revoke Token` button, a **Floating Action Button (`+`)** that opens a native `<dialog closedby="any">` modal form to create a new Contact, and a fixed bottom navigation bar. |
| `components/salesforce/ConnectButton.tsx` | Reusable Connect / Disconnect button component with loading state. |
| `components/salesforce/OrgLimitsCard.tsx` | Displays Salesforce Org API and storage limits with animated progress bars. |
| `components/ui/LoadingSpinner.tsx` | Accessible animated SVG loading spinner. |
| `app/(auth)/login/page.tsx`<br>`app/(auth)/login/actions.ts` | Supabase Auth login page and Server Actions (Email/Password & Magic Link) for the `/dashboard` route. |
| `app/(dashboard)/dashboard/page.tsx` | Extended dashboard page displaying `OrgLimitsCard` and connection details. |

---

## 3. Getting Started

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment Variables (`.env.local`)
Populate `.env.local` with your Salesforce Connected App and Supabase credentials:
```env
SALESFORCE_CLIENT_ID="your_consumer_key"
SALESFORCE_CLIENT_SECRET="your_consumer_secret"
SALESFORCE_REDIRECT_URI="http://localhost:3000/api/auth/callback/salesforce"
SALESFORCE_LOGIN_URL="https://login.salesforce.com"

TOKEN_ENCRYPTION_KEY="64_hex_characters_key"

NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_anon_key"
SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"
```

### Step 3: Run the Supabase Migration
Open **Supabase Dashboard → SQL Editor**, paste the contents of `supabase/migrations/20261109000000_create_sf_tokens.sql`, and click **Run**.

### Step 4: Run the Application
```bash
# Start the development server at http://localhost:3000
npm run dev

# Run ESLint checks
npm run lint

# Build for production
npm run build
```
