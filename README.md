# KCS Opportunity Program

Private academic opportunity platform for Kinshasa Christian School graduates.

Legal notice: This is a private academic opportunity program organized by Kinshasa Christian School. It is not affiliated with the U.S. Government, the U.S. Department of State, the U.S. Embassy, USCIS, or the official Diversity Visa Program.

## Current Status

Phase 1 and the first Phase 2 foundation are started. This workspace originally contained only `public/kcs-icon-512.png` and the ORBYX-style dashboard reference image. The app now includes a Next.js/Tailwind dashboard foundation that reproduces the reference design language with KCS branding.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Lucide React icons
- Recharts
- Planned: Supabase Auth, PostgreSQL, Storage, RLS, Edge Functions

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:4173`. The default local command builds the static export, verifies that CSS is present, and serves `out/` over HTTP.

For framework hot reload only, use `npm run dev:next` and open `http://localhost:3000`. For delivery testing, prefer `npm run dev`.

## Logo Replacement

The current logo lives at `public/branding/kcs-logo-placeholder.png` and is copied from the supplied `public/kcs-icon-512.png` asset. Replace that file with the official production KCS logo using the same filename to avoid layout changes.

## Environment

Copy `.env.example` to `.env.local` and fill in the required values. Never commit real credentials.

## Implementation Plan

1. Foundation: finish shared layout, public pages, responsive applicant shell, and design system components.
2. Supabase: add schema migrations, typed clients, auth, RBAC, and RLS.
3. Applicant workflow: multi-step form, document upload, draft saving, review, and declaration.
4. Payments: provider abstraction, sandbox provider, webhook verification, receipts, and finance reconciliation.
5. Notifications: email/SMS adapters, templates, retries, and delivery logs.
6. Administration: review queues, user management, audit logs, reports, and exports.
7. Selection: eligibility freeze, candidate hash, secure server-side draw, two-person approval, and publication.
8. Quality: unit, integration, RLS, payment, selection, and Playwright tests.

## Security Notes

- Payment success must come from verified server-side webhooks or authorized finance reconciliation.
- Selection must never use browser-side random logic.
- Private documents must use Supabase private buckets and signed URLs.
- Applicant and admin permissions must be enforced on the server and in database policies.
