import './style.css';
import { PRODUCTS, DEPARTMENTS, BUS_ROUTES, PICKUP_SPOTS } from './products';
import { OrderFormState, Product } from './types';
import { uploadCustomEmblemImage } from './cloudinary';

// Target WhatsApp phone number for shop owner
const TARGET_WHATSAPP_NUMBER = "254704513552";

// Global Order State
const orderState: OrderFormState = {
  productId: null,
  productName: "Custom Resin Emblem",
  priceKES: 500, // Default price for custom emblem
  customImageUrl: null,
  department: DEPARTMENTS[0].value,
  busRoute: BUS_ROUTES[0].value,
  pickupSpot: PICKUP_SPOTS[0].value,
  quantity: 1,
  buyerName: "",
  note: "",
};

// DOM Elements
let productGridEl: HTMLElement;
let dropzoneEl: HTMLElement;
let fileInputEl: HTMLInputElement;
let previewFrameEl: HTMLElement;
let previewImgEl: HTMLImageElement;
let dropzonePromptEl: HTMLElement;

let selectedProductBadgeEl: HTMLElement;
let selectedProductNameEl: HTMLElement;
let selectedProductPriceEl: HTMLElement;
let totalCalcPriceEl: HTMLElement;
let stickyTotalPriceEl: HTMLElement;

let departmentSelectEl: HTMLSelectElement;
let busRouteSelectEl: HTMLSelectElement;
let pickupSpotSelectEl: HTMLSelectElement;
let qtyValEl: HTMLElement;
let qtyDecBtn: HTMLButtonElement;
let qtyIncBtn: HTMLButtonElement;
let buyerNameInputEl: HTMLInputElement;
let noteInputEl: HTMLInputElement;
let orderFormEl: HTMLFormElement;

document.addEventListener('DOMContentLoaded', () => {
  initDOMElements();
  populateDropdowns();
  renderProductGrid();
  setupEventListeners();
  updateOrderSummary();
});

function initDOMElements(): void {
  productGridEl = document.getElementById('product-grid')!;
  dropzoneEl = document.getElementById('emblem-dropzone')!;
  fileInputEl = document.getElementById('emblem-file-input') as HTMLInputElement;
  previewFrameEl = document.getElementById('emblem-preview-frame')!;
  previewImgEl = document.getElementById('emblem-preview-img') as HTMLImageElement;
  dropzonePromptEl = document.getElementById('dropzone-prompt')!;

  selectedProductBadgeEl = document.getElementById('selected-product-badge')!;
  selectedProductNameEl = document.getElementById('selected-product-name')!;
  selectedProductPriceEl = document.getElementById('selected-product-price')!;
  totalCalcPriceEl = document.getElementById('total-calc-price')!;
  stickyTotalPriceEl = document.getElementById('sticky-total-price')!;

  departmentSelectEl = document.getElementById('select-department') as HTMLSelectElement;
  busRouteSelectEl = document.getElementById('select-bus-route') as HTMLSelectElement;
  pickupSpotSelectEl = document.getElementById('select-pickup-spot') as HTMLSelectElement;

  qtyValEl = document.getElementById('qty-val')!;
  qtyDecBtn = document.getElementById('qty-dec-btn') as HTMLButtonElement;
  qtyIncBtn = document.getElementById('qty-inc-btn') as HTMLButtonElement;

  buyerNameInputEl = document.getElementById('buyer-name-input') as HTMLInputElement;
  noteInputEl = document.getElementById('note-input') as HTMLInputElement;
  orderFormEl = document.getElementById('order-form') as HTMLFormElement;
}

function populateDropdowns(): void {
  departmentSelectEl.innerHTML = DEPARTMENTS.map(
    d => `<option value="${d.value}">${d.label}</option>`
  ).join('');

  busRouteSelectEl.innerHTML = BUS_ROUTES.map(
    r => `<option value="${r.value}">${r.label}</option>`
  ).join('');

  pickupSpotSelectEl.innerHTML = PICKUP_SPOTS.map(
    p => `<option value="${p.value}">${p.label}</option>`
  ).join('');
}

function renderProductGrid(): void {
  productGridEl.innerHTML = PRODUCTS.map(product => `
    <div class="group relative bg-obsidian-700/80 border border-obsidian-500 hover:border-amber-400/60 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-resin flex flex-col justify-between" data-product-id="${product.id}">
      <div class="relative aspect-square overflow-hidden bg-obsidian-800">
        <img src="${product.photo}" alt="${product.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        ${product.tag ? `
          <span class="absolute top-3 left-3 bg-amber-400 text-obsidian-900 text-xs font-headline font-bold px-3 py-1 rounded-full shadow-md">
            ${product.tag}
          </span>
        ` : ''}
        <div class="absolute inset-0 bg-gradient-to-t from-obsidian-900 via-transparent to-transparent opacity-60"></div>
      </div>
      <div class="p-5 flex flex-col flex-grow justify-between">
        <div>
          <div class="flex items-baseline justify-between mb-2">
            <h3 class="text-lg font-bold text-text-primary group-hover:text-amber-400 transition-colors">${product.name}</h3>
            <span class="text-amber-400 font-bold font-headline text-lg">KES ${product.priceKES}</span>
          </div>
          <p class="text-sm text-text-secondary leading-relaxed mb-4">${product.description}</p>
        </div>
        <button type="button" class="order-product-btn w-full bg-obsidian-600 hover:bg-amber-400 hover:text-obsidian-900 text-amber-400 font-semibold py-2.5 px-4 rounded-xl border border-amber-400/30 hover:border-amber-400 transition-all flex items-center justify-center space-x-2 group-hover:shadow-amber-glow" data-id="${product.id}">
          <span class="material-symbols-outlined text-xl">add_shopping_cart</span>
          <span>Order This</span>
        </button>
      </div>
    </div>
  `).join('');
}

function setupEventListeners(): void {
  // Product Grid Order Buttons
  productGridEl.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('.order-product-btn') as HTMLButtonElement;
    if (btn) {
      const productId = btn.dataset.id;
      const product = PRODUCTS.find(p => p.id === productId);
      if (product) {
        selectProduct(product);
      }
    }
  });

  // Drag and Drop Emblem Image Upload
  dropzoneEl.addEventListener('click', () => fileInputEl.click());

  dropzoneEl.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzoneEl.classList.add('border-amber-400', 'bg-obsidian-700');
  });

  dropzoneEl.addEventListener('dragleave', () => {
    dropzoneEl.classList.remove('border-amber-400', 'bg-obsidian-700');
  });

  dropzoneEl.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzoneEl.classList.remove('border-amber-400', 'bg-obsidian-700');
    if (e.dataTransfer && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  });

  fileInputEl.addEventListener('change', () => {
    if (fileInputEl.files && fileInputEl.files.length > 0) {
      handleFileSelected(fileInputEl.files[0]);
    }
  });

  // Quantity Stepper
  qtyDecBtn.addEventListener('click', () => {
    if (orderState.quantity > 1) {
      orderState.quantity--;
      qtyValEl.textContent = orderState.quantity.toString();
      updateOrderSummary();
    }
  });

  qtyIncBtn.addEventListener('click', () => {
    if (orderState.quantity < 20) {
      orderState.quantity++;
      qtyValEl.textContent = orderState.quantity.toString();
      updateOrderSummary();
    }
  });

  // Form Inputs
  departmentSelectEl.addEventListener('change', () => {
    orderState.department = departmentSelectEl.value;
  });

  busRouteSelectEl.addEventListener('change', () => {
    orderState.busRoute = busRouteSelectEl.value;
  });

  pickupSpotSelectEl.addEventListener('change', () => {
    orderState.pickupSpot = pickupSpotSelectEl.value;
  });

  buyerNameInputEl.addEventListener('input', () => {
    orderState.buyerName = buyerNameInputEl.value;
  });

  noteInputEl.addEventListener('input', () => {
    orderState.note = noteInputEl.value;
  });

  // Form Submission -> WhatsApp
  orderFormEl.addEventListener('submit', (e) => {
    e.preventDefault();
    submitOrderToWhatsApp();
  });
}

function selectProduct(product: Product): void {
  orderState.productId = product.id;
  orderState.productName = product.name;
  orderState.priceKES = product.priceKES;

  selectedProductBadgeEl.textContent = "Featured Ready-Made";
  selectedProductNameEl.textContent = product.name;
  selectedProductPriceEl.textContent = `KES ${product.priceKES}`;

  updateOrderSummary();

  // Smooth scroll to order form
  const orderFormSection = document.getElementById('order-section');
  if (orderFormSection) {
    orderFormSection.scrollIntoView({ behavior: 'smooth' });
  }
}

async function handleFileSelected(file: File): Promise<void> {
  try {
    dropzonePromptEl.innerHTML = `<span class="material-symbols-outlined animate-spin text-amber-400 text-3xl mb-1">sync</span><span class="text-sm font-semibold text-text-secondary">Processing image...</span>`;
    
    const imageUrl = await uploadCustomEmblemImage(file);
    orderState.customImageUrl = imageUrl;
    
    // Switch preview to circular frame mask
    previewImgEl.src = imageUrl;
    previewFrameEl.classList.remove('hidden');
    dropzonePromptEl.classList.add('hidden');

    // Automatically set selection to Custom Order
    orderState.productId = null;
    orderState.productName = "Custom Resin Emblem";
    orderState.priceKES = 500;

    selectedProductBadgeEl.textContent = "Custom Design Uploaded";
    selectedProductNameEl.textContent = "Custom Emblem Keyholder";
    selectedProductPriceEl.textContent = "KES 500";

    updateOrderSummary();
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Upload failed';
    alert(errorMessage);
    dropzonePromptEl.innerHTML = `
      <span class="material-symbols-outlined text-amber-400 text-3xl mb-1">upload_file</span>
      <span class="text-sm font-semibold text-text-primary">Click or drop custom logo here</span>
      <span class="text-xs text-text-muted mt-1">PNG, JPG up to 5MB</span>
    `;
  }
}

function updateOrderSummary(): void {
  const totalKES = orderState.priceKES * orderState.quantity;
  totalCalcPriceEl.textContent = `KES ${totalKES.toLocaleString()}`;
  stickyTotalPriceEl.textContent = `KES ${totalKES.toLocaleString()}`;
}

function submitOrderToWhatsApp(): void {
  if (!orderState.buyerName.trim()) {
    alert("Please enter your name before placing the order.");
    buyerNameInputEl.focus();
    return;
  }

  // WhatsApp Message Format per ARCHITECTURE.md
  let message = `New order:\n`;
  message += `${orderState.productName}\n`;
  message += `Qty: ${orderState.quantity}\n`;
  message += `Dept: ${orderState.department}\n`;
  message += `Bus route: ${orderState.busRoute} | Pickup: ${orderState.pickupSpot}\n`;
  message += `Name: ${orderState.buyerName.trim()}\n`;

  if (orderState.note.trim()) {
    message += `Note: ${orderState.note.trim()}\n`;
  }

  if (orderState.customImageUrl) {
    message += `Design: ${orderState.customImageUrl}\n`;
  }

  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${TARGET_WHATSAPP_NUMBER}?text=${encodedMessage}`;

  // Open WhatsApp in new tab / deep link
  window.open(whatsappUrl, '_blank');
}
