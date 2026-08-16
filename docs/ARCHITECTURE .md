# Architecture — ResinCraft Emblem Keyholders

## Overview
A single-page storefront where checkout is a pre-filled WhatsApp message,
not a payment transaction. The system has two deployable states — see
`MVP_0.md` (no backend) and `MVP_1.md` (adds a C# API) — and this doc
describes the shape once both exist. Do not build MVP_1's pieces before
MVP_0 is working end-to-end.

## System diagram (MVP_1 state)

```
                     ┌─────────────────────────┐
   Colleague's       │  Static Frontend         │
   phone browser ───▶│  (Stitch export, hosted  │
   (from a WhatsApp   │   on Firebase Hosting /  │
    or Teams link)    │   Netlify)                │
                     └───────────┬──────────────┘
                                 │
                 ┌───────────────┼───────────────┐
                 ▼                               ▼
      POST /api/uploads                 POST /api/orders
                 │                               │
                 ▼                               ▼
      ┌─────────────────────────────────────────────┐
      │  ASP.NET Core Minimal API (.NET 10)          │
      │  containerized, deployed on Cloud Run         │
      │  (scale-to-zero)                              │
      └───────┬───────────────────────────┬───────────┘
              │                           │
              ▼                           ▼
      Image storage                Order log
      (Cloudinary /                (Firestore or
       Firebase Storage)            Google Sheet)

                                 │
                                 ▼
                    Browser opens wa.me deep link
                    → shop owner's WhatsApp
```

In the MVP_0 state, the two API boxes and the Cloud Run layer don't exist
yet — the browser talks to image storage directly and the `wa.me` link is
the only "backend."

## Tech stack
| Layer | Choice | Why |
|---|---|---|
| Design | Google Stitch | Generates the Tailwind/HTML UI, exports to Antigravity |
| Frontend build | Whatever Antigravity scaffolds from the Stitch export (plain HTML/Tailwind is enough — no framework required for a single page) | Keeps MVP_0 dependency-free |
| Backend (MVP_1 only) | ASP.NET Core Minimal API, .NET 10 | Matches existing C#/.NET skill; Antigravity has strong .NET 10 support |
| Backend hosting | Google Cloud Run | Scale-to-zero billing; same ecosystem as Stitch/Antigravity; containerized so the language choice doesn't matter to the platform |
| Frontend hosting | Firebase Hosting or Netlify (static) | No compute needed for a static page |
| Image storage | Cloudinary (unsigned upload for MVP_0) or Firebase Storage | Public URL on upload, generous free tier |
| Order log (MVP_1) | Firestore, or Google Sheets via service account | Sheet if the shop owner needs to read it directly without tooling |

## Data model
```
Product {
  id: string
  name: string
  priceKES: number
  photoUrl: string
  kind: "ready-made"
}

Order {
  productId: string | null      // null when it's a custom order
  customImageUrl: string | null // set only for custom orders
  department: string
  busRoute: string
  pickupSpot: string
  quantity: number
  buyerName: string
  note: string | null
  createdAt: timestamp           // MVP_1 only
}
```
Two shapes, no relations, no auth-scoped ownership. Resist adding fields
that aren't needed to fulfill an order.

## WhatsApp message template
```
New order:
{productName or "Custom emblem"}
Qty: {quantity}
Dept: {department}
Bus route: {busRoute} | Pickup: {pickupSpot}
Name: {buyerName}
Design: {customImageUrl}     ← only present for custom orders
```
Keep the encoded message under ~1500 characters — some WhatsApp clients
truncate longer pre-filled text.

## Open Graph
- MVP_0: one static `og:title` / `og:description` / `og:image` for the
  whole page (see MVP_0.md)
- MVP_1 (optional, low priority): per-product OG image generated server-side
  when someone shares a direct product link

## Security / trust notes
- Validate uploaded file type and size **server-side** in MVP_1, not just
  in the browser — MVP_0's client-only check is a stopgap, not a control
- Strip EXIF metadata from uploaded images before storing (phone photos
  often carry location metadata)
- Don't collect more than the order fields above — no need for phone
  numbers, emails, or IDs beyond what WhatsApp already carries implicitly
- Uploaded "logos" may occasionally be a company or department logo — this
  is a personal side project, not an official CIFOR-ICRAF service, so avoid
  anything that implies institutional endorsement (e.g. no CIFOR-ICRAF
  branding on the storefront itself)

## Distribution note (not a code concern, but worth keeping in this doc)
The link is meant to go into Nairobi bus-route WhatsApp groups and MS Teams
channels across departments — get explicit permission through those same
channels before a wide send, and consider a single bus-route pilot before
a department-wide Teams post.
