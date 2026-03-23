# ColabWize v2.2.0

Academic writing integrity + collaboration tools for students and researchers.

## Product Docs

- `docs/PRICING.md`
- `docs/CHANGELOG.md`
- `docs/PRIVACY_POLICY.md`
- `docs/TERMS_OF_SERVICE.md`

## Pricing (From The Current UI)

- Free: $0
- Plus: $5.99/mo or $57.50/year billed annually (20% savings; $4.79/mo effective)
- Premium: $12.99/mo or $124.70/year billed annually (20% savings; $10.39/mo effective)
- Credits (one-time): Starter (5 credits) $1.99, Professional (25 credits) $6.99, Enterprise (50 credits) $12.99; credits never expire

Full breakdown: `docs/PRICING.md`.

## Legal (Last Updated Jan 2026)

- Privacy Policy: `docs/PRIVACY_POLICY.md`
- Terms of Service: `docs/TERMS_OF_SERVICE.md`

## Local Development

This repo contains both the web app (root) and an API service (`backend/`).

### Frontend (web)

```bash
npm install
npm run dev
```

Environment:

- `REACT_APP_API_URL` (defaults to `http://localhost:3001`)

### Backend (API)

```bash
cd backend
npm install
npm run dev
```

Backend configuration lives in env vars; see `backend/README.md`.
