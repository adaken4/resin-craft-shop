# MVP_0 — ResinCraft Emblem Keyholders (Static, No Backend)

## Goal
Ship a working, orderable storefront in one evening. No server, no database,
no auth, no payment gateway. The "backend" is a `wa.me` link.

## In scope
- Hero section: shop name **ResinCraft**, tagline "Your logo, sealed in
  pristine, hand-poured resin.", primary CTA "Order Custom Emblem" scrolling
  to the order form
- Product grid ("Featured Designs") — static, hardcoded, matches the Stitch
  export:
  - Classic Car — KES 450
  - Geometric Gold — KES 500
  - Pressed Floral — KES 450
  - Marble Initial — KES 550
  - Each card: photo, name, price, "Order This" button (pre-fills the order
    form with that product selected)
- Custom order section: image dropzone with a live circular preview masking
  the upload into a keyholder-frame shape
- Order form: department dropdown, bus route dropdown, pickup spot dropdown,
  quantity stepper, buyer name, optional note
- Sticky mobile CTA bar
- One static Open Graph image + title/description for link previews in
  WhatsApp/Teams

## Explicitly out of scope (do not build)
- User accounts / login
- Payment integration of any kind
- A database or persisted order history — WhatsApp *is* the order record
  at this stage
- Per-product OG images
- Any server-side code

## Data (hardcoded, not fetched)
```json
[
  { "id": "classic-car", "name": "Classic Car", "priceKES": 450, "photo": "/img/classic-car.jpg" },
  { "id": "geometric-gold", "name": "Geometric Gold", "priceKES": 500, "photo": "/img/geometric-gold.jpg" },
  { "id": "pressed-floral", "name": "Pressed Floral", "priceKES": 450, "photo": "/img/pressed-floral.jpg" },
  { "id": "marble-initial", "name": "Marble Initial", "priceKES": 550, "photo": "/img/marble-initial.jpg" }
]
```
Ready-made product list lives in one JS/JSON file so the shop owner (not a
developer) can eventually edit prices without touching layout code.

## Image upload (client-side only, no backend)
Use an unsigned upload preset (Cloudinary) or a public-write scoped path
(Firebase Storage `/uploads/{timestamp}-{filename}`) so the browser gets a
public URL back directly. Reject files over ~5MB client-side before upload.

## Checkout mechanic
On submit, serialize the order into a `wa.me` deep link (see
`ARCHITECTURE.md` for the exact message template) and redirect/open it.
No server round-trip.

## Theme
Follow the Stitch-generated "Amber & Obsidian" design tokens (amber accent
on a dark/obsidian background, rounded cards, soft glossy-resin shadows) —
pull the exact palette from the Stitch design-token export rather than
re-guessing values.

## Deploy target
Any static host — Firebase Hosting, Netlify, Vercel, or a static bucket
behind Cloud Run. No compute needed for MVP_0.

## Acceptance checklist
- [ ] Hero, grid, dropzone, form, sticky CTA all render on mobile viewport
- [ ] "Order This" on a product card pre-selects that product in the form
- [ ] Uploading an image shows the circular keyholder-frame preview
- [ ] Submitting the form opens WhatsApp with a correctly formatted message
- [ ] Pasting the live URL into WhatsApp renders a rich preview card
- [ ] Total page weight reasonable for mobile data (compress hero images)
