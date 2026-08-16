import './style.css';
import { PRODUCTS as FALLBACK_PRODUCTS, DEPARTMENTS, BUS_ROUTES, PICKUP_SPOTS } from './products';
import { OrderFormState, Product, SiteSettings } from './types';
import { uploadCustomEmblemImage } from './cloudinary';
import { debounce, showToast } from './utils/debounce';

// Global Store State
let currentProducts: Product[] = [...FALLBACK_PRODUCTS];
let currentSettings: SiteSettings = {
  shop_name: 'ResinCraft',
  tagline: 'Your emblem, sealed in pristine, hand-poured resin.',
  whatsapp_number: '254704513552',
  hero_badge: 'Nairobi Office & Route Express Delivery',
  custom_price_kes: '500',
};

// Global Order State
const orderState: OrderFormState = {
  productId: null,
  productName: "Custom Resin Emblem",
  priceKES: 500,
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
let submitOrderBtnEl: HTMLButtonElement;

// Dynamic Branding DOM Elements
let brandHeaderNameEl: HTMLElement | null;
let brandLogoIconEl: HTMLElement | null;
let heroBadgeTextEl: HTMLElement | null;
let heroTaglineTextEl: HTMLElement | null;
let brandFooterNameEl: HTMLElement | null;
let customPriceHighlightEl: HTMLElement | null;
let pageTitleEl: HTMLElement | null;

document.addEventListener('DOMContentLoaded', async () => {
  initDOMElements();
  populateDropdowns();
  renderProductGrid();
  setupEventListeners();
  updateOrderSummary();

  // Fetch live dynamic products and store settings from Neon Backend
  await loadStoreData();
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
  submitOrderBtnEl = document.getElementById('submit-order-btn') as HTMLButtonElement;

  brandHeaderNameEl = document.getElementById('brand-header-name');
  brandLogoIconEl = document.getElementById('brand-logo-icon');
  heroBadgeTextEl = document.getElementById('hero-badge-text');
  heroTaglineTextEl = document.getElementById('hero-tagline-text');
  brandFooterNameEl = document.getElementById('brand-footer-name');
  customPriceHighlightEl = document.getElementById('custom-price-highlight');
  pageTitleEl = document.getElementById('page-title');
}

async function loadStoreData(): Promise<void> {
  try {
    // 1. Fetch site settings & branding
    const settingsRes = await fetch('/api/settings');
    if (settingsRes.ok) {
      const data = await settingsRes.json();
      if (data.settings) {
        currentSettings = { ...currentSettings, ...data.settings };
        applyDynamicBranding();
      }
    }
  } catch (err) {
    console.info('Using default settings fallback:', err);
  }

  try {
    // 2. Fetch live active products from Neon DB
    const productsRes = await fetch('/api/products');
    if (productsRes.ok) {
      const data = await productsRes.json();
      if (data.products && Array.isArray(data.products) && data.products.length > 0) {
        currentProducts = data.products;
        renderProductGrid();
      }
    }
  } catch (err) {
    console.info('Using default products fallback:', err);
  }
}

function applyDynamicBranding(): void {
  if (brandHeaderNameEl) brandHeaderNameEl.textContent = currentSettings.shop_name;
  if (brandLogoIconEl) brandLogoIconEl.textContent = currentSettings.shop_name.charAt(0).toUpperCase();
  if (heroBadgeTextEl) heroBadgeTextEl.textContent = currentSettings.hero_badge;
  if (heroTaglineTextEl) heroTaglineTextEl.textContent = currentSettings.tagline;
  if (brandFooterNameEl) brandFooterNameEl.textContent = `${currentSettings.shop_name} — Hand-Poured Emblem Keyholders`;
  if (customPriceHighlightEl) {
    customPriceHighlightEl.textContent = `Flat rate KES ${currentSettings.custom_price_kes} per custom keyholder`;
  }
  if (pageTitleEl) {
    pageTitleEl.textContent = `${currentSettings.shop_name} — Custom Emblem Keyholders`;
  }

  // Update default custom order price if set
  if (orderState.productId === null) {
    orderState.priceKES = Number(currentSettings.custom_price_kes) || 500;
    selectedProductPriceEl.textContent = `KES ${orderState.priceKES}`;
    updateOrderSummary();
  }
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
  if (currentProducts.length === 0) {
    productGridEl.innerHTML = `
      <div class="col-span-full text-center py-12 text-text-muted">
        <span class="material-symbols-outlined text-4xl mb-2 text-obsidian-400">inventory_2</span>
        <p>No products currently listed. Upload custom designs below!</p>
      </div>
    `;
    return;
  }

  productGridEl.innerHTML = currentProducts.map(product => `
    <div class="group relative bg-obsidian-700/80 border border-obsidian-500 hover:border-amber-400/60 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-resin flex flex-col justify-between" data-product-id="${product.id}">
      <div class="relative aspect-square overflow-hidden bg-obsidian-800">
        <img src="${product.photo}" alt="${product.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" onerror="this.src='/img/classic-car.jpg'" />
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
          <p class="text-sm text-text-secondary leading-relaxed mb-4 line-clamp-2">${product.description}</p>
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
      const product = currentProducts.find(p => p.id === productId);
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
    if (orderState.quantity < 50) {
      orderState.quantity++;
      qtyValEl.textContent = orderState.quantity.toString();
      updateOrderSummary();
    }
  });

  // Form Dropdowns
  departmentSelectEl.addEventListener('change', () => {
    orderState.department = departmentSelectEl.value;
  });

  busRouteSelectEl.addEventListener('change', () => {
    orderState.busRoute = busRouteSelectEl.value;
  });

  pickupSpotSelectEl.addEventListener('change', () => {
    orderState.pickupSpot = pickupSpotSelectEl.value;
  });

  // Debounced input handlers for typing performance & state sync
  const debouncedBuyerName = debounce((val: string) => {
    orderState.buyerName = val;
  }, 200);

  const debouncedNote = debounce((val: string) => {
    orderState.note = val;
  }, 200);

  buyerNameInputEl.addEventListener('input', () => {
    debouncedBuyerName(buyerNameInputEl.value);
  });

  noteInputEl.addEventListener('input', () => {
    debouncedNote(noteInputEl.value);
  });

  // Form Submission -> Save to Neon & Open WhatsApp
  orderFormEl.addEventListener('submit', (e) => {
    e.preventDefault();
    submitOrder();
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

  const orderFormSection = document.getElementById('order-section');
  if (orderFormSection) {
    orderFormSection.scrollIntoView({ behavior: 'smooth' });
  }

  showToast(`Selected "${product.name}" for checkout`, 'info');
}

async function handleFileSelected(file: File): Promise<void> {
  try {
    dropzonePromptEl.innerHTML = `
      <span class="material-symbols-outlined animate-spin text-amber-400 text-3xl mb-1">sync</span>
      <span class="text-sm font-semibold text-text-secondary">Securing & processing image...</span>
    `;

    const imageUrl = await uploadCustomEmblemImage(file);
    orderState.customImageUrl = imageUrl;

    previewImgEl.src = imageUrl;
    previewFrameEl.classList.remove('hidden');
    dropzonePromptEl.classList.add('hidden');

    orderState.productId = null;
    orderState.productName = "Custom Resin Emblem";
    orderState.priceKES = Number(currentSettings.custom_price_kes) || 500;

    selectedProductBadgeEl.textContent = "Custom Design Uploaded";
    selectedProductNameEl.textContent = "Custom Emblem Keyholder";
    selectedProductPriceEl.textContent = `KES ${orderState.priceKES}`;

    updateOrderSummary();
    showToast('Custom emblem loaded successfully!', 'success');
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Upload failed';
    showToast(errorMessage, 'error');
    dropzonePromptEl.innerHTML = `
      <div class="w-16 h-16 rounded-full bg-obsidian-600 text-amber-400 flex items-center justify-center mb-3">
        <span class="material-symbols-outlined text-3xl">add_photo_alternate</span>
      </div>
      <span class="text-base font-bold text-white">Drop emblem image here</span>
      <span class="text-xs text-text-muted mt-1">or click to browse (PNG, JPG up to 5MB)</span>
    `;
  }
}

function updateOrderSummary(): void {
  const totalKES = orderState.priceKES * orderState.quantity;
  totalCalcPriceEl.textContent = `KES ${totalKES.toLocaleString()}`;
  stickyTotalPriceEl.textContent = `KES ${totalKES.toLocaleString()}`;
}

async function submitOrder(): Promise<void> {
  // Sync values immediately in case user submitted right after typing
  orderState.buyerName = buyerNameInputEl.value.trim();
  orderState.note = noteInputEl.value.trim();

  if (!orderState.buyerName) {
    showToast("Please enter your name before placing the order.", "error");
    buyerNameInputEl.focus();
    return;
  }

  // Defensive button state
  submitOrderBtnEl.disabled = true;
  submitOrderBtnEl.innerHTML = `
    <span class="material-symbols-outlined animate-spin text-2xl">sync</span>
    <span>Opening WhatsApp...</span>
  `;

  // 1. Log order asynchronously in Neon Postgres backend
  try {
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderState),
    }).catch(err => console.warn('Order async DB log warning:', err));
  } catch (err) {
    console.warn('Network error logging order to DB:', err);
  }

  // 2. Build WhatsApp message
  let message = `New order:\n`;
  message += `${orderState.productName}\n`;
  message += `Qty: ${orderState.quantity}\n`;
  message += `Dept: ${orderState.department}\n`;
  message += `Bus route: ${orderState.busRoute} | Pickup: ${orderState.pickupSpot}\n`;
  message += `Name: ${orderState.buyerName}\n`;

  if (orderState.note) {
    message += `Note: ${orderState.note}\n`;
  }

  if (orderState.customImageUrl) {
    message += `Design: ${orderState.customImageUrl}\n`;
  }

  const targetPhone = currentSettings.whatsapp_number || '254704513552';
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${targetPhone}?text=${encodedMessage}`;

  showToast("Redirecting to WhatsApp with order details!", "success");

  // Open WhatsApp in new tab
  setTimeout(() => {
    window.open(whatsappUrl, '_blank');
    submitOrderBtnEl.disabled = false;
    submitOrderBtnEl.innerHTML = `
      <span class="material-symbols-outlined text-2xl">chat</span>
      <span>Send Order via WhatsApp</span>
    `;
  }, 400);
}
