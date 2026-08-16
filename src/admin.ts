import './style.css';
import { Product, SiteSettings, OrderRecord, AnalyticsData } from './types';
import { uploadCustomEmblemImage } from './cloudinary';
import { showToast } from './utils/debounce';

// Admin Session State
let adminToken: string | null = localStorage.getItem('resincraft_admin_token');

let productsList: Product[] = [];
let ordersList: OrderRecord[] = [];
let siteSettings: SiteSettings = {
  shop_name: 'ResinCraft',
  tagline: 'Your emblem, sealed in pristine, hand-poured resin.',
  whatsapp_number: '254704513552',
  hero_badge: 'Nairobi Office & Route Express Delivery',
  custom_price_kes: '500',
};

// DOM Elements
let authScreenEl: HTMLElement;
let adminAppEl: HTMLElement;
let loginFormEl: HTMLFormElement;
let passcodePinInputEl: HTMLInputElement;
let logoutBtnEl: HTMLButtonElement;
let dashboardShopTitleEl: HTMLElement | null;

let desktopTabButtons: NodeListOf<HTMLButtonElement>;
let mobileNavButtons: NodeListOf<HTMLButtonElement>;
let tabContents: NodeListOf<HTMLElement>;

// Analytics Elements
let statTotalRevenueEl: HTMLElement;
let statWeeklyRevenueEl: HTMLElement;
let statWeeklyOrdersEl: HTMLElement;
let statTotalOrdersEl: HTMLElement;
let statItemsSoldEl: HTMLElement;
let statCustomRatioEl: HTMLElement;
let analyticsTopProductsEl: HTMLElement;
let analyticsTopRoutesEl: HTMLElement;
let refreshAnalyticsBtnEl: HTMLButtonElement | null;

// Product Elements
let adminProductsGridEl: HTMLElement;
let openAddProductBtnEl: HTMLButtonElement;
let productModalEl: HTMLElement;
let productModalTitleEl: HTMLElement;
let productModalFormEl: HTMLFormElement;
let closeProductModalBtnEl: HTMLButtonElement;
let modalCancelBtnEl: HTMLButtonElement;

let modalProductIdEl: HTMLInputElement;
let modalProductNameEl: HTMLInputElement;
let modalProductPriceEl: HTMLInputElement;
let modalProductTagEl: HTMLInputElement;
let modalProductDescEl: HTMLTextAreaElement;
let modalProductPhotoEl: HTMLInputElement;
let modalProductActiveEl: HTMLInputElement;
let modalImgPreviewEl: HTMLImageElement;
let modalImgFileEl: HTMLInputElement;
let modalUploadBtnEl: HTMLButtonElement;

// Orders Elements
let ordersContainerEl: HTMLElement;
let filterOrderStatusEl: HTMLSelectElement;
let refreshOrdersBtnEl: HTMLButtonElement;

// Branding Settings Elements
let brandingFormEl: HTMLFormElement;
let settingShopNameEl: HTMLInputElement;
let settingTaglineEl: HTMLTextAreaElement;
let settingWhatsappEl: HTMLInputElement;
let settingHeroBadgeEl: HTMLInputElement;
let settingCustomPriceEl: HTMLInputElement;

document.addEventListener('DOMContentLoaded', async () => {
  initDOMElements();
  setupEventListeners();

  if (adminToken) {
    const isValid = await verifySession();
    if (isValid) {
      showDashboard();
      await loadInitialData();
    } else {
      showAuthScreen();
    }
  } else {
    showAuthScreen();
  }
});

function initDOMElements(): void {
  authScreenEl = document.getElementById('auth-screen')!;
  adminAppEl = document.getElementById('admin-app')!;
  loginFormEl = document.getElementById('login-form') as HTMLFormElement;
  passcodePinInputEl = document.getElementById('admin-passcode-input') as HTMLInputElement;
  logoutBtnEl = document.getElementById('logout-btn') as HTMLButtonElement;
  dashboardShopTitleEl = document.getElementById('dashboard-shop-title');

  desktopTabButtons = document.querySelectorAll('.tab-btn');
  mobileNavButtons = document.querySelectorAll('.mobile-nav-btn');
  tabContents = document.querySelectorAll('.tab-content');

  statTotalRevenueEl = document.getElementById('stat-total-revenue')!;
  statWeeklyRevenueEl = document.getElementById('stat-weekly-revenue')!;
  statWeeklyOrdersEl = document.getElementById('stat-weekly-orders')!;
  statTotalOrdersEl = document.getElementById('stat-total-orders')!;
  statItemsSoldEl = document.getElementById('stat-items-sold')!;
  statCustomRatioEl = document.getElementById('stat-custom-ratio')!;
  analyticsTopProductsEl = document.getElementById('analytics-top-products')!;
  analyticsTopRoutesEl = document.getElementById('analytics-top-routes')!;
  refreshAnalyticsBtnEl = document.getElementById('refresh-analytics-btn') as HTMLButtonElement | null;

  adminProductsGridEl = document.getElementById('admin-products-grid')!;
  openAddProductBtnEl = document.getElementById('open-add-product-btn') as HTMLButtonElement;
  productModalEl = document.getElementById('product-modal')!;
  productModalTitleEl = document.getElementById('product-modal-title')!;
  productModalFormEl = document.getElementById('product-modal-form') as HTMLFormElement;
  closeProductModalBtnEl = document.getElementById('close-product-modal-btn') as HTMLButtonElement;
  modalCancelBtnEl = document.getElementById('modal-cancel-btn') as HTMLButtonElement;

  modalProductIdEl = document.getElementById('modal-product-id') as HTMLInputElement;
  modalProductNameEl = document.getElementById('modal-product-name') as HTMLInputElement;
  modalProductPriceEl = document.getElementById('modal-product-price') as HTMLInputElement;
  modalProductTagEl = document.getElementById('modal-product-tag') as HTMLInputElement;
  modalProductDescEl = document.getElementById('modal-product-desc') as HTMLTextAreaElement;
  modalProductPhotoEl = document.getElementById('modal-product-photo') as HTMLInputElement;
  modalProductActiveEl = document.getElementById('modal-product-active') as HTMLInputElement;
  modalImgPreviewEl = document.getElementById('modal-img-preview') as HTMLImageElement;
  modalImgFileEl = document.getElementById('modal-img-file') as HTMLInputElement;
  modalUploadBtnEl = document.getElementById('modal-upload-btn') as HTMLButtonElement;

  ordersContainerEl = document.getElementById('orders-container')!;
  filterOrderStatusEl = document.getElementById('filter-order-status') as HTMLSelectElement;
  refreshOrdersBtnEl = document.getElementById('refresh-orders-btn') as HTMLButtonElement;

  brandingFormEl = document.getElementById('branding-settings-form') as HTMLFormElement;
  settingShopNameEl = document.getElementById('setting-shop-name') as HTMLInputElement;
  settingTaglineEl = document.getElementById('setting-tagline') as HTMLTextAreaElement;
  settingWhatsappEl = document.getElementById('setting-whatsapp') as HTMLInputElement;
  settingHeroBadgeEl = document.getElementById('setting-hero-badge') as HTMLInputElement;
  settingCustomPriceEl = document.getElementById('setting-custom-price') as HTMLInputElement;
}

function setupEventListeners(): void {
  // Login Form
  loginFormEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    const passcode = passcodePinInputEl.value.trim();
    if (!passcode) return;

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passcode }),
      });

      const data = await res.json();
      if (res.ok && data.token) {
        adminToken = data.token;
        localStorage.setItem('resincraft_admin_token', data.token);
        showToast('Login successful! Welcome back.', 'success');
        showDashboard();
        await loadInitialData();
      } else {
        showToast(data.error || 'Invalid passcode. (Default: resin2026)', 'error');
        passcodePinInputEl.value = '';
        passcodePinInputEl.focus();
      }
    } catch {
      showToast('Authentication network error. Check connection.', 'error');
    }
  });

  // Quick Demo Login One-Click
  const quickDemoBtn = document.getElementById('quick-demo-login-btn');
  if (quickDemoBtn) {
    quickDemoBtn.addEventListener('click', () => {
      passcodePinInputEl.value = 'resin2026';
      loginFormEl.dispatchEvent(new Event('submit'));
    });
  }

  // Logout
  logoutBtnEl.addEventListener('click', () => {
    localStorage.removeItem('resincraft_admin_token');
    adminToken = null;
    showToast('Logged out of admin portal', 'info');
    showAuthScreen();
  });

  // Desktop Navigation Tabs
  desktopTabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.tab;
      if (targetTab) switchTab(targetTab);
    });
  });

  // Mobile Bottom Navigation Tabs
  mobileNavButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.tab;
      if (targetTab) switchTab(targetTab);
    });
  });

  // Open Add Product Modal
  openAddProductBtnEl.addEventListener('click', () => {
    openProductModal(null);
  });

  // Close Modal
  closeProductModalBtnEl.addEventListener('click', closeProductModal);
  modalCancelBtnEl.addEventListener('click', closeProductModal);

  // Upload Photo Button
  modalUploadBtnEl.addEventListener('click', () => modalImgFileEl.click());
  modalImgFileEl.addEventListener('change', async () => {
    if (modalImgFileEl.files && modalImgFileEl.files.length > 0) {
      const file = modalImgFileEl.files[0];
      try {
        modalUploadBtnEl.innerHTML = `<span class="material-symbols-outlined animate-spin text-base">sync</span><span>Uploading...</span>`;
        const url = await uploadCustomEmblemImage(file);
        modalProductPhotoEl.value = url;
        modalImgPreviewEl.src = url;
        showToast('Photo uploaded successfully!', 'success');
      } catch (err: any) {
        showToast(err.message || 'Photo upload failed', 'error');
      } finally {
        modalUploadBtnEl.innerHTML = `<span class="material-symbols-outlined text-base">add_a_photo</span><span>Choose Photo / Camera</span>`;
      }
    }
  });

  modalProductPhotoEl.addEventListener('input', () => {
    if (modalProductPhotoEl.value.trim()) {
      modalImgPreviewEl.src = modalProductPhotoEl.value.trim();
    }
  });

  // Save Product Submit
  productModalFormEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleSaveProduct();
  });

  // Orders Filter & Refresh
  filterOrderStatusEl.addEventListener('change', () => loadOrders());
  refreshOrdersBtnEl.addEventListener('click', () => {
    loadOrders();
    loadAnalytics();
    showToast('Refreshed orders and metrics', 'info');
  });

  if (refreshAnalyticsBtnEl) {
    refreshAnalyticsBtnEl.addEventListener('click', () => {
      loadAnalytics();
      showToast('Analytics refreshed', 'info');
    });
  }

  // Branding Settings Submit
  brandingFormEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleSaveSettings();
  });
}

function showAuthScreen(): void {
  authScreenEl.classList.remove('hidden');
  adminAppEl.classList.add('hidden');
  passcodePinInputEl.value = '';
}

function showDashboard(): void {
  authScreenEl.classList.add('hidden');
  adminAppEl.classList.remove('hidden');
}

async function verifySession(): Promise<boolean> {
  try {
    const res = await fetch('/api/auth', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    return res.ok;
  } catch {
    return false;
  }
}

function switchTab(tabName: string): void {
  // Update desktop tabs
  desktopTabButtons.forEach(btn => {
    if (btn.dataset.tab === tabName) {
      btn.className = 'tab-btn active px-5 py-2.5 rounded-xl font-headline font-bold text-xs sm:text-sm inline-flex items-center gap-2.5 bg-amber-400 text-obsidian-900 shadow-resin transition-all whitespace-nowrap';
    } else {
      btn.className = 'tab-btn px-5 py-2.5 rounded-xl font-headline font-bold text-xs sm:text-sm inline-flex items-center gap-2.5 text-text-secondary hover:text-white hover:bg-obsidian-700 transition-all whitespace-nowrap';
    }
  });

  // Update mobile bottom nav
  mobileNavButtons.forEach(btn => {
    if (btn.dataset.tab === tabName) {
      btn.className = 'mobile-nav-btn active flex flex-col items-center justify-center text-amber-400 text-[10px] font-bold py-1 px-3 rounded-xl transition-all';
    } else {
      btn.className = 'mobile-nav-btn flex flex-col items-center justify-center text-text-muted hover:text-white text-[10px] font-semibold py-1 px-3 rounded-xl transition-all';
    }
  });

  // Toggle content sections
  tabContents.forEach(content => {
    if (content.id === `tab-${tabName}`) {
      content.classList.remove('hidden');
    } else {
      content.classList.add('hidden');
    }
  });

  // Refresh tab data
  if (tabName === 'analytics') loadAnalytics();
  if (tabName === 'products') loadProducts();
  if (tabName === 'orders') loadOrders();
  if (tabName === 'branding') loadSettings();
}

async function loadInitialData(): Promise<void> {
  try { await loadAnalytics(); } catch (e) { console.warn('Analytics init error:', e); }
  try { await loadProducts(); } catch (e) { console.warn('Products init error:', e); }
  try { await loadOrders(); } catch (e) { console.warn('Orders init error:', e); }
  try { await loadSettings(); } catch (e) { console.warn('Settings init error:', e); }
}

// ------------------------------------------------------------------
// 1. ANALYTICS
// ------------------------------------------------------------------
async function loadAnalytics(): Promise<void> {
  try {
    const res = await fetch('/api/analytics', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    if (!res.ok) return;
    const data = await res.json();
    const stats: Partial<AnalyticsData> = data?.analytics || {};

    const totalRev = Number(stats?.totalRevenueKES) || 0;
    const weeklyRev = Number(stats?.weeklyRevenueKES) || 0;
    const weeklyOrders = Number(stats?.weeklyOrders) || 0;
    const totalOrders = Number(stats?.totalOrders) || 0;
    const totalItems = Number(stats?.totalItemsSold) || 0;

    if (statTotalRevenueEl) statTotalRevenueEl.textContent = `KES ${totalRev.toLocaleString()}`;
    if (statWeeklyRevenueEl) statWeeklyRevenueEl.textContent = `KES ${weeklyRev.toLocaleString()}`;
    if (statWeeklyOrdersEl) statWeeklyOrdersEl.textContent = `${weeklyOrders} orders this week`;
    if (statTotalOrdersEl) statTotalOrdersEl.textContent = `${totalOrders}`;
    if (statItemsSoldEl) statItemsSoldEl.textContent = `${totalItems} keyholders crafted`;

    const customRatioList = Array.isArray(stats?.customRatio) ? stats.customRatio : [];
    const totalCustOrders = customRatioList.reduce((acc, c) => acc + (Number(c?.count) || 0), 0);
    const customCount = customRatioList.find(c => c?.orderType === 'Custom Emblem')?.count || 0;
    const customPct = totalCustOrders > 0 ? Math.round((customCount / totalCustOrders) * 100) : 50;
    if (statCustomRatioEl) statCustomRatioEl.textContent = `${customPct}% Custom`;

    // Render Best Selling Products
    const topProductsList = Array.isArray(stats?.topProducts) ? stats.topProducts : [];
    if (analyticsTopProductsEl) {
      if (topProductsList.length === 0) {
        analyticsTopProductsEl.innerHTML = `<p class="text-xs text-text-muted py-4 text-center">Initial catalog ready for customer orders.</p>`;
      } else {
        const maxSales = Math.max(...topProductsList.map(p => Number(p?.totalSalesKES) || 0), 1);
        analyticsTopProductsEl.innerHTML = topProductsList.map(prod => {
          const salesKES = Number(prod?.totalSalesKES) || 0;
          const qty = Number(prod?.totalQuantity) || 0;
          return `
            <div class="space-y-1.5 p-3 rounded-2xl bg-obsidian-900/60 border border-obsidian-700/50">
              <div class="flex items-center justify-between text-xs font-semibold">
                <span class="text-white">${prod.productName}</span>
                <span class="text-amber-400 font-headline font-bold">KES ${salesKES.toLocaleString()} <span class="text-[11px] text-text-muted font-normal">(${qty} sold)</span></span>
              </div>
              <div class="w-full h-2 bg-obsidian-800 rounded-full overflow-hidden">
                <div class="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full" style="width: ${(salesKES / maxSales) * 100}%"></div>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // Render Top Routes
    const topRoutesList = Array.isArray(stats?.topRoutes) ? stats.topRoutes : [];
    if (analyticsTopRoutesEl) {
      if (topRoutesList.length === 0) {
        analyticsTopRoutesEl.innerHTML = `<p class="text-xs text-text-muted py-4 text-center">No route delivery records yet.</p>`;
      } else {
        analyticsTopRoutesEl.innerHTML = topRoutesList.map(route => `
          <div class="flex items-center justify-between p-3 rounded-2xl bg-obsidian-900/60 border border-obsidian-700/50 text-xs">
            <div class="flex items-center space-x-2">
              <span class="material-symbols-outlined text-amber-400 text-base">location_on</span>
              <span class="text-text-primary font-medium">${route.busRoute}</span>
            </div>
            <span class="text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">${route.orderCount} orders</span>
          </div>
        `).join('');
      }
    }
  } catch (err) {
    console.error('Analytics load error:', err);
  }
}

// ------------------------------------------------------------------
// 2. PRODUCTS MANAGEMENT
// ------------------------------------------------------------------
async function loadProducts(): Promise<void> {
  try {
    const res = await fetch('/api/products?all=true', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    if (!res.ok) return;
    const data = await res.json();
    productsList = data.products || [];
    renderAdminProducts();
  } catch (err) {
    console.error('Products load error:', err);
  }
}

function renderAdminProducts(): void {
  if (productsList.length === 0) {
    adminProductsGridEl.innerHTML = `
      <div class="col-span-full text-center py-12 text-text-muted bg-obsidian-800/60 rounded-3xl border border-obsidian-700">
        <span class="material-symbols-outlined text-4xl mb-2 text-obsidian-500">inventory_2</span>
        <p>No products in catalog. Tap "+ Add New Keyholder" above to create one!</p>
      </div>
    `;
    return;
  }

  adminProductsGridEl.innerHTML = productsList.map(product => `
    <div class="bg-gradient-to-b from-obsidian-800 to-obsidian-850 border ${product.isActive ? 'border-obsidian-600/80 hover:border-amber-400/60' : 'border-obsidian-700 opacity-65'} rounded-3xl overflow-hidden shadow-resin transition-all duration-300 flex flex-col justify-between group" data-id="${product.id}">
      
      <!-- Card Image Header -->
      <div class="relative aspect-square overflow-hidden bg-obsidian-900">
        <img src="${product.photo}" alt="${product.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onerror="this.src='/img/classic-car.jpg'" />
        
        <!-- Status Badges Top Left -->
        <div class="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          <span class="text-[10px] font-headline font-bold uppercase px-2.5 py-1 rounded-full shadow-md ${product.isActive ? 'bg-emerald-500 text-obsidian-900' : 'bg-obsidian-700 text-text-muted border border-obsidian-500'}">
            ${product.isActive ? 'In Stock' : 'Hidden'}
          </span>
          ${product.tag ? `<span class="bg-amber-400 text-obsidian-900 text-[10px] font-headline font-bold uppercase px-2.5 py-1 rounded-full shadow-md">${product.tag}</span>` : ''}
        </div>

        <div class="absolute inset-0 bg-gradient-to-t from-obsidian-900 via-transparent to-transparent opacity-70"></div>
      </div>

      <!-- Card Body -->
      <div class="p-4 sm:p-5 space-y-3 flex-grow flex flex-col justify-between">
        <div>
          <div class="flex items-baseline justify-between mb-1.5">
            <h4 class="font-headline font-bold text-white text-base sm:text-lg group-hover:text-amber-400 transition-colors">${product.name}</h4>
            <span class="text-amber-400 font-headline font-extrabold text-lg">KES ${product.priceKES}</span>
          </div>
          <p class="text-xs text-text-secondary leading-relaxed line-clamp-2">${product.description || 'No description provided.'}</p>
        </div>

        <!-- Action Bar -->
        <div class="pt-3 border-t border-obsidian-700/80 flex items-center justify-between gap-3">
          <!-- Toggle In-Stock Pill Button -->
          <button type="button" class="toggle-active-btn text-xs font-semibold px-3.5 py-1.5 rounded-xl border ${product.isActive ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'border-obsidian-500 bg-obsidian-700 text-text-muted hover:text-white'} transition-all active:scale-95 inline-flex items-center gap-1.5 whitespace-nowrap" data-id="${product.id}" data-active="${product.isActive}">
            <span class="w-2 h-2 rounded-full ${product.isActive ? 'bg-emerald-400' : 'bg-obsidian-400'} flex-shrink-0"></span>
            <span>${product.isActive ? 'Active' : 'Draft'}</span>
          </button>
          
          <!-- Edit & Delete Buttons -->
          <div class="flex items-center gap-1.5">
            <button type="button" class="edit-product-btn p-2.5 text-text-secondary hover:text-amber-400 bg-obsidian-700/80 hover:bg-obsidian-700 rounded-xl transition-colors active:scale-95 inline-flex items-center justify-center" data-id="${product.id}" title="Edit Keyholder">
              <span class="material-symbols-outlined text-lg leading-none">edit</span>
            </button>
            <button type="button" class="delete-product-btn p-2.5 text-text-muted hover:text-red-400 bg-obsidian-700/80 hover:bg-obsidian-700 rounded-xl transition-colors active:scale-95 inline-flex items-center justify-center" data-id="${product.id}" title="Delete Keyholder">
              <span class="material-symbols-outlined text-lg leading-none">delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join('');

  // Event Listeners for Product Card Actions
  adminProductsGridEl.querySelectorAll('.toggle-active-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const target = e.currentTarget as HTMLElement;
      const id = target.dataset.id!;
      const currentActive = target.dataset.active === 'true';
      await patchProductStatus(id, !currentActive);
    });
  });

  adminProductsGridEl.querySelectorAll('.edit-product-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.currentTarget as HTMLElement;
      const id = target.dataset.id!;
      const prod = productsList.find(p => p.id === id);
      if (prod) openProductModal(prod);
    });
  });

  adminProductsGridEl.querySelectorAll('.delete-product-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const target = e.currentTarget as HTMLElement;
      const id = target.dataset.id!;
      if (confirm('Are you sure you want to delete this keyholder design?')) {
        await deleteProduct(id);
      }
    });
  });
}

function openProductModal(product: Product | null): void {
  if (product) {
    productModalTitleEl.textContent = 'Edit Keyholder Details';
    modalProductIdEl.value = product.id;
    modalProductNameEl.value = product.name;
    modalProductPriceEl.value = product.priceKES.toString();
    modalProductTagEl.value = product.tag || '';
    modalProductDescEl.value = product.description || '';
    modalProductPhotoEl.value = product.photo;
    modalProductActiveEl.checked = product.isActive !== undefined ? product.isActive : true;
    modalImgPreviewEl.src = product.photo;
  } else {
    productModalTitleEl.textContent = 'Add New Keyholder';
    modalProductIdEl.value = '';
    modalProductNameEl.value = '';
    modalProductPriceEl.value = '500';
    modalProductTagEl.value = '';
    modalProductDescEl.value = '';
    modalProductPhotoEl.value = '/img/classic-car.jpg';
    modalProductActiveEl.checked = true;
    modalImgPreviewEl.src = '/img/classic-car.jpg';
  }
  productModalEl.classList.remove('hidden');
}

function closeProductModal(): void {
  productModalEl.classList.add('hidden');
}

async function handleSaveProduct(): Promise<void> {
  const id = modalProductIdEl.value.trim();
  const name = modalProductNameEl.value.trim();
  const priceKES = Number(modalProductPriceEl.value);
  const tag = modalProductTagEl.value.trim() || undefined;
  const description = modalProductDescEl.value.trim();
  const photo = modalProductPhotoEl.value.trim() || '/img/classic-car.jpg';
  const isActive = modalProductActiveEl.checked;

  if (!name || isNaN(priceKES) || priceKES <= 0) {
    showToast('Please enter a valid name and price in KES', 'error');
    return;
  }

  const payload = {
    id: id || undefined,
    name,
    priceKES,
    tag,
    description,
    photo,
    isActive,
    category: 'keyholder',
  };

  try {
    const method = id ? 'PUT' : 'POST';
    const res = await fetch('/api/products', {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (res.ok) {
      showToast(id ? 'Keyholder updated!' : 'New keyholder added!', 'success');
      closeProductModal();
      await loadProducts();
      await loadAnalytics();
    } else {
      showToast(data.error || 'Failed to save product', 'error');
    }
  } catch {
    showToast('Network error saving product', 'error');
  }
}

async function patchProductStatus(id: string, newActiveState: boolean): Promise<void> {
  try {
    const res = await fetch('/api/products', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ id, isActive: newActiveState }),
    });

    if (res.ok) {
      showToast(newActiveState ? 'Keyholder active in storefront' : 'Keyholder hidden', 'success');
      await loadProducts();
    }
  } catch {
    showToast('Failed to update status', 'error');
  }
}

async function deleteProduct(id: string): Promise<void> {
  try {
    const res = await fetch('/api/products', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ id }),
    });

    if (res.ok) {
      showToast('Keyholder deleted successfully', 'success');
      await loadProducts();
      await loadAnalytics();
    }
  } catch {
    showToast('Failed to delete product', 'error');
  }
}

// ------------------------------------------------------------------
// 3. ORDERS LOG (Mobile-First Card Layout)
// ------------------------------------------------------------------
async function loadOrders(): Promise<void> {
  const filter = filterOrderStatusEl.value;
  try {
    const res = await fetch(`/api/orders?status=${filter}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    if (!res.ok) return;
    const data = await res.json();
    ordersList = data.orders || [];
    renderOrders();
  } catch (err) {
    console.error('Orders load error:', err);
  }
}

function renderOrders(): void {
  if (ordersList.length === 0) {
    ordersContainerEl.innerHTML = `
      <div class="text-center py-12 text-text-muted bg-obsidian-800/60 rounded-3xl border border-obsidian-700">
        <span class="material-symbols-outlined text-4xl mb-2 text-obsidian-500">receipt_long</span>
        <p>No customer orders found matching this filter.</p>
      </div>
    `;
    return;
  }

  ordersContainerEl.innerHTML = ordersList.map(order => {
    const dateStr = new Date(order.createdAt).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });

    const statusBadge = 
      order.status === 'delivered' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
      order.status === 'ready' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' :
      order.status === 'in_progress' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
      'bg-obsidian-700 text-text-secondary border border-obsidian-500';

    return `
      <div class="bg-gradient-to-b from-obsidian-800 to-obsidian-850 border border-obsidian-600/70 rounded-3xl p-4 sm:p-5 shadow-resin space-y-4">
        
        <!-- Header: Customer Name, Price, Date -->
        <div class="flex items-start justify-between gap-3 border-b border-obsidian-700/80 pb-3">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 font-bold text-sm flex-shrink-0">
              ${order.buyerName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h4 class="font-headline font-bold text-white text-base">${order.buyerName}</h4>
              <span class="text-xs text-text-muted">${dateStr}</span>
            </div>
          </div>
          <div class="text-right">
            <span class="text-amber-400 font-headline font-extrabold text-base sm:text-lg">KES ${(order.priceKES * order.quantity).toLocaleString()}</span>
            <span class="text-xs text-text-muted block">Qty: ${order.quantity}</span>
          </div>
        </div>

        <!-- Details Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <!-- Product & Custom Preview -->
          <div class="flex items-center space-x-3 bg-obsidian-900/60 p-3 rounded-2xl border border-obsidian-700/50">
            ${order.customImageUrl ? `
              <a href="${order.customImageUrl}" target="_blank" class="relative w-12 h-12 rounded-full border-2 border-amber-400 overflow-hidden flex-shrink-0 shadow-amber-glow" title="View customer custom emblem">
                <img src="${order.customImageUrl}" class="w-full h-full object-cover" />
              </a>
            ` : `
              <div class="w-10 h-10 rounded-xl bg-obsidian-800 border border-obsidian-600 flex items-center justify-center text-amber-400 flex-shrink-0">
                <span class="material-symbols-outlined text-lg">local_mall</span>
              </div>
            `}
            <div class="overflow-hidden">
              <div class="font-bold text-white truncate">${order.productName}</div>
              <div class="text-text-muted text-[11px]">${order.customImageUrl ? '⭐ Custom Uploaded Emblem' : 'Ready-made Design'}</div>
            </div>
          </div>

          <!-- Pickup Location -->
          <div class="flex items-center space-x-3 bg-obsidian-900/60 p-3 rounded-2xl border border-obsidian-700/50">
            <span class="material-symbols-outlined text-amber-400 text-xl flex-shrink-0">place</span>
            <div>
              <div class="font-bold text-white">${order.pickupSpot}</div>
              <div class="text-text-muted text-[11px]">${order.busRoute} • ${order.department}</div>
            </div>
          </div>
        </div>

        ${order.note ? `
          <div class="text-xs bg-amber-400/5 border border-amber-400/20 rounded-xl p-2.5 text-amber-300 flex items-start space-x-2">
            <span class="material-symbols-outlined text-sm flex-shrink-0 mt-0.5">sticky_note_2</span>
            <span>${order.note}</span>
          </div>
        ` : ''}

        <!-- Footer Actions & Status Changer -->
        <div class="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <span class="text-xs font-semibold text-text-muted">Status:</span>
            <select class="order-status-select text-xs font-bold rounded-xl px-3.5 py-2 focus:outline-none ${statusBadge} shadow-sm" data-id="${order.id}">
              <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
              <option value="in_progress" ${order.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
              <option value="ready" ${order.status === 'ready' ? 'selected' : ''}>Ready for Pickup</option>
              <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
              <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
          </div>

          <a href="https://wa.me/?text=${encodeURIComponent(`Hi ${order.buyerName}, about your ${order.productName} order from ResinCraft...`)}" target="_blank" class="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold text-xs py-2.5 px-4 rounded-xl border border-emerald-500/30 inline-flex items-center justify-center gap-2 transition-all shadow-sm whitespace-nowrap">
            <span class="material-symbols-outlined text-sm leading-none flex-shrink-0">chat</span>
            <span>WhatsApp Customer</span>
          </a>
        </div>

      </div>
    `;
  }).join('');

  // Status Change Listener
  ordersContainerEl.querySelectorAll('.order-status-select').forEach(select => {
    select.addEventListener('change', async (e) => {
      const target = e.currentTarget as HTMLSelectElement;
      const orderId = target.dataset.id!;
      const newStatus = target.value;
      await updateOrderStatus(orderId, newStatus);
    });
  });
}

async function updateOrderStatus(orderId: string, status: string): Promise<void> {
  try {
    const res = await fetch('/api/orders', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ id: orderId, status }),
    });

    if (res.ok) {
      showToast(`Order status updated to "${status}"`, 'success');
      await loadOrders();
      await loadAnalytics();
    }
  } catch {
    showToast('Failed to update order status', 'error');
  }
}

// ------------------------------------------------------------------
// 4. STORE SETTINGS & BRANDING
// ------------------------------------------------------------------
async function loadSettings(): Promise<void> {
  try {
    const res = await fetch('/api/settings');
    if (!res.ok) return;
    const data = await res.json();
    if (data.settings) {
      siteSettings = data.settings;
      if (dashboardShopTitleEl) dashboardShopTitleEl.textContent = siteSettings.shop_name || 'ResinCraft';
      settingShopNameEl.value = siteSettings.shop_name || 'ResinCraft';
      settingTaglineEl.value = siteSettings.tagline || '';
      settingWhatsappEl.value = siteSettings.whatsapp_number || '254704513552';
      settingHeroBadgeEl.value = siteSettings.hero_badge || 'Nairobi Office & Route Express Delivery';
      settingCustomPriceEl.value = siteSettings.custom_price_kes || '500';
    }
  } catch (err) {
    console.error('Settings load error:', err);
  }
}

async function handleSaveSettings(): Promise<void> {
  const shop_name = settingShopNameEl.value.trim();
  const tagline = settingTaglineEl.value.trim();
  const whatsapp_number = settingWhatsappEl.value.trim().replace(/[^0-9]/g, '');
  const hero_badge = settingHeroBadgeEl.value.trim();
  const custom_price_kes = settingCustomPriceEl.value.trim();

  if (!shop_name || !whatsapp_number) {
    showToast('Shop Name and WhatsApp Phone Number are required.', 'error');
    return;
  }

  const payload = {
    shop_name,
    tagline,
    whatsapp_number,
    hero_badge,
    custom_price_kes,
  };

  try {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      showToast('Brand settings updated live in database!', 'success');
      siteSettings = { ...siteSettings, ...payload };
      if (dashboardShopTitleEl) dashboardShopTitleEl.textContent = shop_name;
    } else {
      const data = await res.json();
      showToast(data.error || 'Failed to save settings', 'error');
    }
  } catch {
    showToast('Network error saving settings', 'error');
  }
}
