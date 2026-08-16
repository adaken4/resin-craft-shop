# MVP_1 — Adds a C# Backend (Cloud Run)

## Precondition
MVP_0 is live and has taken at least a few real orders through WhatsApp.
Do not start MVP_1 until MVP_0 is validated — it exists to fix specific
gaps MVP_0 has, not to add complexity for its own sake.

## Problems MVP_1 solves
1. Uploaded logo images go straight to a public bucket in MVP_0, unresized
   and unvalidated beyond a client-side size check.
2. There is no durable, ownable record of orders — only what lives in the
   shop owner's WhatsApp thread.
3. The OG preview image is one static hero shot for every link share,
   regardless of which product someone is pointing people at.

## New component
ASP.NET Core Minimal API (.NET 10), containerized, deployed to Cloud Run
(scale-to-zero). Antigravity can scaffold both the Dockerfile and the API
project together.

## Endpoints

### `POST /api/uploads`
Accepts a multipart image upload. Validates content-type and size
server-side, strips EXIF metadata, resizes to a max dimension (e.g. 1600px),
re-uploads to storage, returns the public URL. Replaces the client-side-only
upload path from MVP_0.

```
Request:  multipart/form-data, field "file"
Response: { "url": "https://storage.../uploads/abc123.jpg" }
```

### `POST /api/orders`
Logs an order server-side in addition to (not instead of) the WhatsApp
message — this becomes the shop owner's actual sellable record.

```json
// Request
{
  "productId": "classic-car",        // null for custom orders
  "customImageUrl": null,             // set for custom orders
  "department": "IS",
  "busRoute": "Route 4",
  "pickupSpot": "Main gate",
  "quantity": 1,
  "buyerName": "Jane K.",
  "note": ""
}
```
Store: Firestore document, or — if the shop owner wants something he can
open himself without any tooling — an append to a Google Sheet via a
service account. Prefer the Sheet if "the owner needs to read this without
a developer" is a hard requirement; prefer Firestore if you expect to build
a dashboard later.

### `GET /api/products` (optional for this phase)
Moves the product catalog from MVP_0's static JSON into something the
backend serves, so the shop owner can eventually update prices/photos
without redeploying the frontend. Not required if the JSON-file workflow
from MVP_0 is still working fine for him.

## Explicitly still out of scope
- Authentication / accounts
- Payment gateway integration
- Admin UI (a spreadsheet is the admin UI for now)

## Migration notes from MVP_0
- Frontend upload call switches from direct Cloudinary/Firebase client SDK
  to `POST /api/uploads`
- Frontend form submit fires `POST /api/orders` *and then* still opens the
  `wa.me` link — do not remove the WhatsApp step, it's still the actual
  handoff to the shop owner
- Dynamic OG image generation (per-product share cards) is a nice-to-have
  once the above two endpoints are stable — do not build it first

## Acceptance checklist
- [ ] Upload proxy rejects oversized/invalid files server-side, not just
      client-side
- [ ] Every order placed via the form is retrievable afterward without
      relying on WhatsApp chat history
- [ ] MVP_0's WhatsApp handoff still fires on every order
- [ ] Cloud Run service scales to zero when idle (no cost while unused)
