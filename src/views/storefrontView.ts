import { store } from '../state';
import { DEPARTMENTS, BUS_ROUTES, PICKUP_SPOTS } from '../products';
import { Product } from '../types';
import { uploadCustomEmblemImage } from '../cloudinary';
import { debounce, showToast } from '../utils/debounce';

export function renderStorefrontHTML(): string {
  const state = store.getState();
  const settings = state.settings;

  return `
  <!-- Header -->
  <header class="sticky top-0 z-40 bg-obsidian-900/90 backdrop-blur-md border-b border-obsidian-600">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div id="brand-logo-icon" class="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-amber-500 flex items-center justify-center text-obsidian-900 font-bold font-headline text-xl shadow-amber-glow">
          ${settings.shop_name.charAt(0).toUpperCase()}
        </div>
        <div>
          <span id="brand-header-name" class="font-headline font-extrabold text-xl tracking-tight text-text-primary block">${settings.shop_name}</span>
          <span class="text-[10px] text-amber-400 font-semibold tracking-wider uppercase block -mt-1">Handmade Resin Studio</span>
        </div>
      </div>
      
      <div class="flex items-center gap-3">
        <a href="/admin" data-link class="inline-flex items-center gap-2 bg-obsidian-800 hover:bg-obsidian-700 text-text-secondary hover:text-amber-400 border border-obsidian-600 px-3.5 py-2 rounded-xl text-xs font-headline font-bold transition-all shadow-sm">
          <span class="material-symbols-outlined text-base leading-none flex-shrink-0">admin_panel_settings</span>
          <span class="hidden sm:inline">Artisan Portal</span>
        </a>
      </div>
    </div>
  </header>

  <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
    <!-- Hero Section -->
    <section class="text-center space-y-4 max-w-3xl mx-auto pt-4">
      <div id="hero-badge-text" class="inline-flex items-center space-x-2 bg-amber-400/10 text-amber-400 border border-amber-400/20 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase">
        <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
        <span>${settings.hero_badge}</span>
      </div>
      <h1 id="hero-title-text" class="text-3xl sm:text-5xl font-extrabold font-headline tracking-tight text-text-primary leading-tight">
        ${settings.hero_title || 'Preserve Your Passion in Hand-Poured Resin'}
      </h1>
      <p id="hero-tagline-text" class="text-base sm:text-lg text-text-secondary leading-relaxed">
        ${settings.tagline}
      </p>
    </section>

    <!-- Custom Upload Dropzone Section -->
    <section class="bg-obsidian-800/60 border border-obsidian-600 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
      <div class="max-w-2xl mx-auto text-center space-y-6">
        <div>
          <span class="text-amber-400 text-xs font-bold uppercase tracking-wider font-label">Custom Order</span>
          <h2 class="text-2xl sm:text-3xl font-headline font-bold text-text-primary mt-1">Upload Your Custom Emblem</h2>
          <p class="text-sm text-text-secondary mt-2">Car badge, football club, corporate brand, or monogram logo. We pour crystal-clear dome resin over it.</p>
        </div>

        <div id="emblem-dropzone" class="border-2 border-dashed border-obsidian-500 hover:border-amber-400 bg-obsidian-800/90 rounded-2xl p-8 cursor-pointer transition-all duration-300 flex flex-col items-center justify-center space-y-3 group hover:shadow-resin">
          <input type="file" id="emblem-file-input" class="hidden" accept="image/png, image/jpeg, image/webp" />
          
          <div id="emblem-preview-frame" class="hidden relative w-36 h-36 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-resin-lg bg-obsidian-900">
            <img id="emblem-preview-img" src="" alt="Custom Emblem Preview" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-gradient-to-tr from-amber-400/20 to-transparent pointer-events-none"></div>
          </div>

          <div id="dropzone-prompt" class="flex flex-col items-center space-y-2">
            <div class="w-14 h-14 rounded-full bg-obsidian-700 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <span class="material-symbols-outlined text-2xl">cloud_upload</span>
            </div>
            <p class="text-sm font-semibold text-text-primary">Click to upload or drag & drop</p>
            <p class="text-xs text-text-muted">PNG, JPG, or WEBP (Up to 5MB)</p>
          </div>
        </div>

        <div class="flex items-center justify-center space-x-2 text-xs text-text-muted">
          <span class="material-symbols-outlined text-amber-400 text-sm">verified</span>
          <span id="custom-price-highlight">Flat rate KES ${settings.custom_price_kes} per custom keyholder</span>
        </div>
      </div>
    </section>

    <!-- Ready-Made Designs Gallery -->
    <section class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-obsidian-600 pb-4">
        <div>
          <span class="text-amber-400 text-xs font-bold uppercase tracking-wider font-label">Ready To Ship</span>
          <h2 class="text-2xl sm:text-3xl font-headline font-bold text-text-primary">Featured Ready-Made Keyholders</h2>
        </div>
        <p class="text-sm text-text-muted">Select an artisan pre-cast design below</p>
      </div>

      <div id="product-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Dynamic Product Cards -->
      </div>
    </section>

    <!-- Order & Delivery Details Form -->
    <section id="order-section" class="bg-obsidian-800/80 border border-obsidian-600 rounded-3xl p-6 sm:p-10 shadow-2xl relative">
      <div class="max-w-2xl mx-auto space-y-8">
        <div class="text-center space-y-2 border-b border-obsidian-600 pb-6">
          <span class="text-amber-400 text-xs font-bold uppercase tracking-wider font-label">Checkout</span>
          <h2 class="text-2xl sm:text-3xl font-headline font-bold text-text-primary">Confirm Your Order & Delivery</h2>
          <p class="text-sm text-text-secondary">Direct pickup at your office reception or transit stage in Nairobi.</p>
        </div>

        <form id="order-form" class="space-y-6">
          <!-- Selected Product Summary Card -->
          <div class="bg-obsidian-900/90 border border-obsidian-500 rounded-2xl p-4 sm:p-5 flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                <span class="material-symbols-outlined text-2xl">diamond</span>
              </div>
              <div>
                <span id="selected-product-badge" class="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">Custom Design</span>
                <h4 id="selected-product-name" class="font-headline font-bold text-text-primary text-base sm:text-lg">Custom Emblem Keyholder</h4>
              </div>
            </div>
            <div class="text-right">
              <span id="selected-product-price" class="text-lg sm:text-xl font-bold font-headline text-amber-400">KES ${settings.custom_price_kes}</span>
              <span class="text-xs text-text-muted block">unit price</span>
            </div>
          </div>

          <!-- Nairobi Delivery & Pickup Selectors -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="block text-xs font-label font-bold uppercase tracking-wider text-text-secondary">
                Department / Office Unit
              </label>
              <select id="select-department" class="w-full bg-obsidian-700 border border-obsidian-500 rounded-xl px-3.5 py-2.5 text-text-primary text-sm focus:border-amber-400 focus:outline-none transition-colors">
              </select>
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-label font-bold uppercase tracking-wider text-text-secondary">
                Nairobi Bus / Transit Route
              </label>
              <select id="select-bus-route" class="w-full bg-obsidian-700 border border-obsidian-500 rounded-xl px-3.5 py-2.5 text-text-primary text-sm focus:border-amber-400 focus:outline-none transition-colors">
              </select>
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="block text-xs font-label font-bold uppercase tracking-wider text-text-secondary">
              Preferred Pickup Spot
            </label>
            <select id="select-pickup-spot" class="w-full bg-obsidian-700 border border-obsidian-500 rounded-xl px-3.5 py-2.5 text-text-primary text-sm focus:border-amber-400 focus:outline-none transition-colors">
            </select>
          </div>

          <!-- Quantity Stepper -->
          <div class="space-y-1.5">
            <label class="block text-xs font-label font-bold uppercase tracking-wider text-text-secondary">
              Quantity
            </label>
            <div class="flex items-center space-x-4 bg-obsidian-700 border border-obsidian-500 rounded-xl p-2 w-fit">
              <button type="button" id="qty-dec-btn" class="w-9 h-9 rounded-lg bg-obsidian-800 hover:bg-obsidian-600 text-text-primary flex items-center justify-center font-bold text-lg transition-colors">-</button>
              <span id="qty-val" class="font-headline font-bold text-lg text-amber-400 min-w-[2rem] text-center">1</span>
              <button type="button" id="qty-inc-btn" class="w-9 h-9 rounded-lg bg-obsidian-800 hover:bg-obsidian-600 text-text-primary flex items-center justify-center font-bold text-lg transition-colors">+</button>
            </div>
          </div>

          <!-- Buyer Contact -->
          <div class="space-y-1.5">
            <label class="block text-xs font-label font-bold uppercase tracking-wider text-text-secondary">
              Your Name
            </label>
            <input type="text" id="buyer-name-input" required placeholder="e.g. Kennedy O." class="w-full bg-obsidian-700 border border-obsidian-500 rounded-xl px-4 py-3 text-text-primary text-sm placeholder-text-muted focus:border-amber-400 focus:outline-none transition-colors" />
          </div>

          <!-- Note / Instructions -->
          <div class="space-y-1.5">
            <label class="block text-xs font-label font-bold uppercase tracking-wider text-text-secondary">
              Custom Inscription / Special Note (Optional)
            </label>
            <input type="text" id="note-input" placeholder="e.g. Add name 'Kada' in gold script or gold flakes" class="w-full bg-obsidian-700 border border-obsidian-500 rounded-xl px-4 py-3 text-text-primary text-sm placeholder-text-muted focus:border-amber-400 focus:outline-none transition-colors" />
          </div>

          <!-- Order Total Calculation -->
          <div class="pt-4 border-t border-obsidian-600 flex items-center justify-between">
            <span class="text-sm font-semibold text-text-secondary">Estimated Total</span>
            <span id="total-calc-price" class="text-2xl sm:text-3xl font-headline font-extrabold text-amber-400">KES 500</span>
          </div>

          <!-- Submit Order via WhatsApp -->
          <button type="submit" id="submit-order-btn" class="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-headline font-bold text-lg py-4 px-6 rounded-2xl shadow-lg hover:shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center space-x-2">
            <span class="material-symbols-outlined text-2xl">chat</span>
            <span>Send Order via WhatsApp</span>
          </button>
          
          <p class="text-[11px] text-center text-text-muted">
            Clicking opens WhatsApp with your pre-filled custom order & logs your order directly to our artisan ledger.
          </p>
        </form>
      </div>
    </section>
  </main>

  <!-- Sticky Mobile Price Bar -->
  <div class="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-obsidian-900/95 backdrop-blur-md border-t border-obsidian-600 px-4 py-3 flex items-center justify-between shadow-2xl">
    <div>
      <span class="text-[10px] text-text-muted uppercase tracking-wider block">Estimated Total</span>
      <span id="sticky-total-price" class="text-lg font-headline font-bold text-amber-400">KES 500</span>
    </div>
    <a href="#order-section" class="bg-amber-400 hover:bg-amber-500 text-obsidian-900 font-headline font-bold text-xs px-5 py-2.5 rounded-xl shadow-resin inline-flex items-center space-x-1">
      <span>Complete Order</span>
      <span class="material-symbols-outlined text-sm">arrow_forward</span>
    </a>
  </div>

  <!-- Footer -->
  <footer class="border-t border-obsidian-600 bg-obsidian-900 py-10 mt-20">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
      <p id="brand-footer-name" class="font-headline font-bold text-sm text-text-secondary">${settings.shop_name} — Hand-Poured Emblem Keyholders</p>
      <p class="text-xs text-text-muted">Made with passion in Nairobi, Kenya. High-gloss UV resistant resin.</p>
      <div class="pt-2">
        <a href="/admin" data-link class="text-xs text-text-muted hover:text-amber-400 transition-colors inline-flex items-center gap-1">
          <span class="material-symbols-outlined text-sm">lock</span>
          <span>Artisan Studio Dashboard</span>
        </a>
      </div>
    </div>
  </footer>
  `;
}

export function initStorefrontLogic(container: HTMLElement): void {
  const productGridEl = container.querySelector('#product-grid') as HTMLElement;
  const dropzoneEl = container.querySelector('#emblem-dropzone') as HTMLElement;
  const fileInputEl = container.querySelector('#emblem-file-input') as HTMLInputElement;
  const previewFrameEl = container.querySelector('#emblem-preview-frame') as HTMLElement;
  const previewImgEl = container.querySelector('#emblem-preview-img') as HTMLImageElement;
  const dropzonePromptEl = container.querySelector('#dropzone-prompt') as HTMLElement;

  const selectedProductBadgeEl = container.querySelector('#selected-product-badge') as HTMLElement;
  const selectedProductNameEl = container.querySelector('#selected-product-name') as HTMLElement;
  const selectedProductPriceEl = container.querySelector('#selected-product-price') as HTMLElement;
  const totalCalcPriceEl = container.querySelector('#total-calc-price') as HTMLElement;
  const stickyTotalPriceEl = container.querySelector('#sticky-total-price') as HTMLElement;

  const departmentSelectEl = container.querySelector('#select-department') as HTMLSelectElement;
  const busRouteSelectEl = container.querySelector('#select-bus-route') as HTMLSelectElement;
  const pickupSpotSelectEl = container.querySelector('#select-pickup-spot') as HTMLSelectElement;

  const qtyValEl = container.querySelector('#qty-val') as HTMLElement;
  const qtyDecBtn = container.querySelector('#qty-dec-btn') as HTMLButtonElement;
  const qtyIncBtn = container.querySelector('#qty-inc-btn') as HTMLButtonElement;

  const buyerNameInputEl = container.querySelector('#buyer-name-input') as HTMLInputElement;
  const noteInputEl = container.querySelector('#note-input') as HTMLInputElement;
  const orderFormEl = container.querySelector('#order-form') as HTMLFormElement;

  // Populate Selectors
  if (departmentSelectEl) {
    departmentSelectEl.innerHTML = DEPARTMENTS.map(d => `<option value="${d.value}">${d.label}</option>`).join('');
  }
  if (busRouteSelectEl) {
    busRouteSelectEl.innerHTML = BUS_ROUTES.map(r => `<option value="${r.value}">${r.label}</option>`).join('');
  }
  if (pickupSpotSelectEl) {
    pickupSpotSelectEl.innerHTML = PICKUP_SPOTS.map(p => `<option value="${p.value}">${p.label}</option>`).join('');
  }

  function updateOrderSummary(): void {
    const order = store.getState().orderForm;
    const total = order.priceKES * order.quantity;
    if (totalCalcPriceEl) totalCalcPriceEl.textContent = `KES ${total.toLocaleString()}`;
    if (stickyTotalPriceEl) stickyTotalPriceEl.textContent = `KES ${total.toLocaleString()}`;
    if (qtyValEl) qtyValEl.textContent = order.quantity.toString();
  }

  function renderProducts(): void {
    const products = store.getState().products.filter(p => p.isActive !== false);
    if (!productGridEl) return;

    if (products.length === 0) {
      productGridEl.innerHTML = `
        <div class="col-span-full text-center py-12 text-text-muted">
          <span class="material-symbols-outlined text-4xl mb-2 text-obsidian-400">inventory_2</span>
          <p>No products currently listed. Upload custom designs below!</p>
        </div>
      `;
      return;
    }

    productGridEl.innerHTML = products.map(product => `
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

  function selectProduct(product: Product): void {
    store.updateOrderForm({
      productId: product.id,
      productName: product.name,
      priceKES: product.priceKES,
    });

    if (selectedProductBadgeEl) selectedProductBadgeEl.textContent = 'Featured Ready-Made';
    if (selectedProductNameEl) selectedProductNameEl.textContent = product.name;
    if (selectedProductPriceEl) selectedProductPriceEl.textContent = `KES ${product.priceKES}`;

    updateOrderSummary();

    const orderFormSection = container.querySelector('#order-section');
    if (orderFormSection) {
      orderFormSection.scrollIntoView({ behavior: 'smooth' });
    }
    showToast(`Selected "${product.name}" for checkout`, 'info');
  }

  async function handleFileSelected(file: File): Promise<void> {
    try {
      if (dropzonePromptEl) {
        dropzonePromptEl.innerHTML = `
          <span class="material-symbols-outlined animate-spin text-amber-400 text-3xl mb-1">sync</span>
          <span class="text-sm font-semibold text-text-secondary">Securing & processing image...</span>
        `;
      }

      const imageUrl = await uploadCustomEmblemImage(file);
      const customPrice = Number(store.getState().settings.custom_price_kes) || 500;

      store.updateOrderForm({
        customImageUrl: imageUrl,
        productId: null,
        productName: 'Custom Resin Emblem',
        priceKES: customPrice,
      });

      if (previewImgEl) previewImgEl.src = imageUrl;
      if (previewFrameEl) previewFrameEl.classList.remove('hidden');
      if (dropzonePromptEl) dropzonePromptEl.classList.add('hidden');

      if (selectedProductBadgeEl) selectedProductBadgeEl.textContent = 'Custom Design Uploaded';
      if (selectedProductNameEl) selectedProductNameEl.textContent = 'Custom Emblem Keyholder';
      if (selectedProductPriceEl) selectedProductPriceEl.textContent = `KES ${customPrice}`;

      updateOrderSummary();
      showToast('Emblem uploaded! Customized keyholder selected.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Image processing failed. Please choose another file.', 'error');
      if (dropzonePromptEl) {
        dropzonePromptEl.innerHTML = `
          <div class="w-14 h-14 rounded-full bg-obsidian-700 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
            <span class="material-symbols-outlined text-2xl">cloud_upload</span>
          </div>
          <p class="text-sm font-semibold text-text-primary">Click to upload or drag & drop</p>
          <p class="text-xs text-text-muted">PNG, JPG, or WEBP (Up to 5MB)</p>
        `;
      }
    }
  }

  async function submitOrder(): Promise<void> {
    const order = store.getState().orderForm;
    const settings = store.getState().settings;

    if (!order.buyerName.trim()) {
      showToast('Please enter your name for order pickup', 'error');
      buyerNameInputEl?.focus();
      return;
    }

    const deptObj = DEPARTMENTS.find(d => d.value === order.department) || DEPARTMENTS[0];
    const routeObj = BUS_ROUTES.find(r => r.value === order.busRoute) || BUS_ROUTES[0];
    const spotObj = PICKUP_SPOTS.find(p => p.value === order.pickupSpot) || PICKUP_SPOTS[0];
    const totalPrice = order.priceKES * order.quantity;

    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: order.productId,
          productName: order.productName,
          priceKES: order.priceKES,
          quantity: order.quantity,
          customImageUrl: order.customImageUrl,
          department: deptObj.label,
          busRoute: routeObj.label,
          pickupSpot: spotObj.label,
          buyerName: order.buyerName.trim(),
          note: order.note.trim() || null,
        }),
      });
    } catch (err) {
      console.warn('Neon DB order logging notice:', err);
    }

    const waText = [
      `*🌟 NEW KEYHOLDER ORDER — ${settings.shop_name.toUpperCase()}*`,
      `---------------------------------`,
      `*Item:* ${order.productName}`,
      `*Quantity:* ${order.quantity} pcs`,
      `*Unit Price:* KES ${order.priceKES}`,
      `*Total Amount:* KES ${totalPrice.toLocaleString()}`,
      `---------------------------------`,
      `*Customer:* ${order.buyerName.trim()}`,
      `*Department:* ${deptObj.label}`,
      `*Bus Route:* ${routeObj.label}`,
      `*Pickup Spot:* ${spotObj.label}`,
      order.note ? `*Custom Note:* ${order.note.trim()}` : null,
      order.customImageUrl ? `*Custom Emblem:* ${order.customImageUrl}` : null,
      `---------------------------------`,
      `_Sent from ${settings.shop_name} Web Store_`,
    ].filter(Boolean).join('\n');

    const cleanPhone = settings.whatsapp_number.replace(/\D/g, '') || '254704513552';
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waText)}`;

    showToast('Order recorded! Launching WhatsApp...', 'success');
    setTimeout(() => {
      window.open(waUrl, '_blank');
    }, 400);
  }

  // Event Listeners
  if (productGridEl) {
    productGridEl.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest('.order-product-btn') as HTMLButtonElement;
      if (btn) {
        const productId = btn.dataset.id;
        const product = store.getState().products.find(p => p.id === productId);
        if (product) selectProduct(product);
      }
    });
  }

  if (dropzoneEl && fileInputEl) {
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
  }

  if (qtyDecBtn) {
    qtyDecBtn.addEventListener('click', () => {
      const currentQty = store.getState().orderForm.quantity;
      if (currentQty > 1) {
        store.updateOrderForm({ quantity: currentQty - 1 });
        updateOrderSummary();
      }
    });
  }

  if (qtyIncBtn) {
    qtyIncBtn.addEventListener('click', () => {
      const currentQty = store.getState().orderForm.quantity;
      if (currentQty < 50) {
        store.updateOrderForm({ quantity: currentQty + 1 });
        updateOrderSummary();
      }
    });
  }

  if (departmentSelectEl) {
    departmentSelectEl.addEventListener('change', () => {
      store.updateOrderForm({ department: departmentSelectEl.value });
    });
  }
  if (busRouteSelectEl) {
    busRouteSelectEl.addEventListener('change', () => {
      store.updateOrderForm({ busRoute: busRouteSelectEl.value });
    });
  }
  if (pickupSpotSelectEl) {
    pickupSpotSelectEl.addEventListener('change', () => {
      store.updateOrderForm({ pickupSpot: pickupSpotSelectEl.value });
    });
  }

  const debouncedBuyer = debounce((v: string) => store.updateOrderForm({ buyerName: v }), 200);
  const debouncedNote = debounce((v: string) => store.updateOrderForm({ note: v }), 200);

  if (buyerNameInputEl) {
    buyerNameInputEl.addEventListener('input', () => debouncedBuyer(buyerNameInputEl.value));
  }
  if (noteInputEl) {
    noteInputEl.addEventListener('input', () => debouncedNote(noteInputEl.value));
  }

  if (orderFormEl) {
    orderFormEl.addEventListener('submit', (e) => {
      e.preventDefault();
      submitOrder();
    });
  }

  // Initial render
  renderProducts();
  updateOrderSummary();
}
