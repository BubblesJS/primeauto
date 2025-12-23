# PrimeAuto

Static site served by Node.js, with a `/api/contact` endpoint that sends form submissions via Zoho SMTP.

## Run locally

1. Install deps:

   - `npm install`

2. Create `.env` (copy from `.env.example`) and set `SMTP_PASS` to your Zoho **app password**.

3. Start:

   - `npm start`

Then open:
- `http://localhost:3000/index.html`
- `http://localhost:3000/auto.html`
- `http://localhost:3000/collision.html`

## Environment variables

See `.env.example`.

## Endpoint

- `POST /api/contact`
  - Accepts standard HTML form POST (`application/x-www-form-urlencoded` or `multipart/form-data`).
  - Fields: `name`, `email`, `phone`, `service`, `vehicle`, `message`.
