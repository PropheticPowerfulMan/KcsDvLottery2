# Payment Integration

Payments must be implemented through provider adapters. Sandbox mode is required for development. Production success states must come only from verified webhooks or authorized finance reconciliation.

## Mobile Money Providers

M-Pesa, Airtel Money, and Orange Money should be activated only after the organization has official merchant credentials or an approved payment aggregator contract. Each provider integration must include:

- A server-side payment initiation endpoint.
- A signed webhook or callback verification secret.
- Idempotent transaction storage by provider transaction ID.
- Reconciliation against provider statements before final finance closure.
- Audit logs for every status change.

The browser must never be allowed to mark a payment as successful by itself.

## Secure Manual Payment Workflow

Until the official APIs are available, the application can use a controlled manual payment process:

1. Generate a unique application payment reference, for example `KCS-2026-123456`.
2. Require the applicant to submit sender name, phone number, amount, transaction ID, payment date, and receipt screenshot.
3. Keep the payment status as `pending_finance_review`.
4. Finance compares the submitted evidence with mobile money, bank, or cash-office statements.
5. A second authorized reviewer confirms high-risk or mismatched payments.
6. Only a server-side admin action changes the status to `paid_verified`.
7. Store rejection reasons and correction requests for incomplete or suspicious payment evidence.

Recommended statuses: `not_started`, `submitted_by_applicant`, `pending_finance_review`, `needs_correction`, `paid_verified`, `rejected`, and `refunded`.
