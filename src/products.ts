import { Product, DropdownOption } from './types';

export const PRODUCTS: Product[] = [
  {
    id: "classic-car",
    name: "Classic Car",
    priceKES: 450,
    photo: "/img/classic-car.jpg",
    description: "Vintage automobile emblem encased in high-gloss dome resin with gold rim trim.",
    tag: "Bestseller"
  },
  {
    id: "geometric-gold",
    name: "Geometric Gold",
    priceKES: 500,
    photo: "/img/geometric-gold.jpg",
    description: "Intricate mandala geometric gold foil pattern embedded in crystal-clear resin.",
    tag: "Popular"
  },
  {
    id: "pressed-floral",
    name: "Pressed Floral",
    priceKES: 450,
    photo: "/img/pressed-floral.jpg",
    description: "Handcrafted miniature dried botanicals and gold leaf flakes preserved in glass dome.",
    tag: "Artisanal"
  },
  {
    id: "marble-initial",
    name: "Marble Initial",
    priceKES: 550,
    photo: "/img/marble-initial.jpg",
    description: "Custom gold monogram set on obsidian dark marble texture resin frame.",
    tag: "Customizable"
  }
];

export const DEPARTMENTS: DropdownOption[] = [
  { value: "Finance & Operations", label: "Finance & Operations" },
  { value: "Research & Development", label: "Research & Development" },
  { value: "Communications & Outreach", label: "Communications & Outreach" },
  { value: "Human Resources", label: "Human Resources" },
  { value: "IT & Digital Services", label: "IT & Digital Services" },
  { value: "CIFOR-ICRAF Campus", label: "CIFOR-ICRAF Campus" },
  { value: "External Partner / Guest", label: "External Partner / Guest" }
];

export const BUS_ROUTES: DropdownOption[] = [
  { value: "Ngong Road / Karen", label: "Ngong Road / Karen" },
  { value: "Waiyaki Way / Westlands", label: "Waiyaki Way / Westlands" },
  { value: "Thika Superhighway / Roysambu", label: "Thika Superhighway / Roysambu" },
  { value: "Mombasa Road / Syokimau", label: "Mombasa Road / Syokimau" },
  { value: "Kiambu Road / Runda", label: "Kiambu Road / Runda" },
  { value: "Limuru Road / Gigiri", label: "Limuru Road / Gigiri" },
  { value: "Langata Road / Madaraka", label: "Langata Road / Madaraka" }
];

export const PICKUP_SPOTS: DropdownOption[] = [
  { value: "Main Reception", label: "Main Reception Desk" },
  { value: "Cafeteria Terrace", label: "Cafeteria Terrace" },
  { value: "Bus Park / Security Gate", label: "Bus Park / Security Gate" },
  { value: "Building A - Ground Floor", label: "Building A - Ground Floor" },
  { value: "Direct Desk Delivery", label: "Direct Desk Delivery" }
];
