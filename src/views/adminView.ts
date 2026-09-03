import { store } from '../state';
import { Product } from '../types';
import { uploadCustomEmblemImage } from '../cloudinary';
import { showToast } from '../utils/debounce';

export function renderAdminHTML(): string {
  const state = store.getState();
  const settings = state.settings;
  const isAuthenticated = Boolean(state.adminToken);
  const activeTab = state.adminActiveTab;

  if (!isAuthenticated) {
    return `
    <div class="min-h-screen bg-obsidian-950 flex items-center justify-center p-4 sm:p-6">
      <div class="w-full max-w-md bg-obsidian-800/90 border border-obsidian-600 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6 relative overflow-hidden backdrop-blur-md">
        
        <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 flex items-center justify-center text-obsidian-900 mx-auto shadow-amber-glow">
          <span class="material-symbols-outlined text-3xl font-bold">admin_panel_settings</span>
        </div>

        <div>
          <h2 class="text-2xl font-headline font-extrabold text-white tracking-tight">Artisan Studio Admin</h2>
          <p class="text-xs sm:text-sm text-text-secondary mt-1">Manage keyholders, adjust live prices, update branding, and review customer orders.</p>
        </div>

        <form id="admin-login-form" class="space-y-4 text-left relative z-10">
          <div>
            <label for="admin-passcode-input" class="block text-xs font-label font-bold uppercase tracking-wider text-amber-400/90 mb-1.5">
              Admin Passcode
            </label>
            <input 
              type="password" 
              id="admin-passcode-input" 
              required 
              placeholder="Enter passcode" 
              class="w-full bg-obsidian-900 border border-obsidian-500 rounded-2xl px-4 py-3.5 text-white text-base placeholder-text-muted focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 focus:outline-none transition-all text-center tracking-widest" 
            />
          </div>

          <button 
            type="submit" 
            id="admin-login-btn"
            class="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 active:scale-[0.98] text-obsidian-900 font-headline font-bold text-base py-3.5 px-6 rounded-2xl shadow-resin hover:shadow-resin-lg transition-all inline-flex items-center justify-center gap-2.5 whitespace-nowrap"
          >
            <span class="material-symbols-outlined text-xl leading-none flex-shrink-0">login</span>
            <span>Unlock Dashboard</span>
          </button>
        </form>

        <div class="pt-3 border-t border-obsidian-600/60">
          <a href="/" data-link class="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-amber-400 transition-colors">
            <span class="material-symbols-outlined text-sm leading-none">arrow_back</span>
            <span>Return to Customer Storefront</span>
          </a>
        </div>
      </div>
    </div>
    `;
  }

  return `
  <div class="min-h-screen bg-obsidian-950 flex flex-col pb-20 md:pb-8">
    <!-- Top Header -->
    <header class="w-full bg-obsidian-900/90 border-b border-obsidian-600 sticky top-0 z-40 backdrop-blur-md">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-400 to-amber-500 flex items-center justify-center text-obsidian-900 font-bold font-headline text-lg shadow-amber-glow">
            ${settings.shop_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-headline font-extrabold text-base sm:text-lg text-white">${settings.shop_name}</span>
              <span class="text-[10px] bg-amber-400/10 text-amber-400 font-bold px-2 py-0.5 rounded-full border border-amber-400/30">Neon Live</span>
            </div>
            <span class="text-[10px] text-text-muted hidden sm:block">Artisan Studio Dashboard</span>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <a href="/" data-link class="inline-flex items-center gap-2 text-xs font-headline font-bold text-amber-400 bg-obsidian-800 hover:bg-obsidian-700 border border-amber-400/30 hover:border-amber-400 px-4 py-2 rounded-xl transition-all shadow-sm whitespace-nowrap">
            <span class="material-symbols-outlined text-lg leading-none flex-shrink-0">storefront</span>
            <span>View Storefront</span>
          </a>

          <button id="admin-logout-btn" class="inline-flex items-center gap-2 text-xs font-semibold text-text-secondary hover:text-rose-400 bg-obsidian-800 hover:bg-obsidian-700 border border-obsidian-600 px-4 py-2 rounded-xl transition-all whitespace-nowrap">
            <span class="material-symbols-outlined text-lg leading-none flex-shrink-0">logout</span>
            <span class="hidden sm:inline">Logout</span>
          </button>
        </div>

      </div>
    </header>

    <!-- Desktop Navigation Sub-Header -->
    <div class="desktop-nav-bar w-full bg-obsidian-900/95 border-b border-obsidian-600 px-4 sm:px-6 lg:px-8 py-3 sticky top-[64px] z-30 shadow-md backdrop-blur-md">
      <div class="max-w-6xl mx-auto w-full flex items-center justify-center">
        <nav class="inline-flex items-center bg-obsidian-800/90 border border-obsidian-600 rounded-2xl p-1.5 shadow-inner gap-2">
          <button data-admin-tab="analytics" class="admin-tab-btn px-5 py-2.5 rounded-xl font-headline font-bold text-xs sm:text-sm inline-flex items-center gap-2.5 ${activeTab === 'analytics' ? 'bg-amber-400 text-obsidian-900 shadow-resin' : 'text-text-secondary hover:text-white hover:bg-obsidian-700'} transition-all whitespace-nowrap">
            <span class="material-symbols-outlined text-lg leading-none flex-shrink-0">insights</span>
            <span>Analytics & Sales</span>
          </button>
          <button data-admin-tab="products" class="admin-tab-btn px-5 py-2.5 rounded-xl font-headline font-bold text-xs sm:text-sm inline-flex items-center gap-2.5 ${activeTab === 'products' ? 'bg-amber-400 text-obsidian-900 shadow-resin' : 'text-text-secondary hover:text-white hover:bg-obsidian-700'} transition-all whitespace-nowrap">
            <span class="material-symbols-outlined text-lg leading-none flex-shrink-0">inventory_2</span>
            <span>Keyholders & Catalog</span>
          </button>
          <button data-admin-tab="orders" class="admin-tab-btn px-5 py-2.5 rounded-xl font-headline font-bold text-xs sm:text-sm inline-flex items-center gap-2.5 ${activeTab === 'orders' ? 'bg-amber-400 text-obsidian-900 shadow-resin' : 'text-text-secondary hover:text-white hover:bg-obsidian-700'} transition-all whitespace-nowrap">
            <span class="material-symbols-outlined text-lg leading-none flex-shrink-0">receipt_long</span>
            <span>Customer Orders Log</span>
          </button>
          <button data-admin-tab="branding" class="admin-tab-btn px-5 py-2.5 rounded-xl font-headline font-bold text-xs sm:text-sm inline-flex items-center gap-2.5 ${activeTab === 'branding' ? 'bg-amber-400 text-obsidian-900 shadow-resin' : 'text-text-secondary hover:text-white hover:bg-obsidian-700'} transition-all whitespace-nowrap">
            <span class="material-symbols-outlined text-lg leading-none flex-shrink-0">tune</span>
            <span>Branding & Contacts</span>
          </button>
        </nav>
      </div>
    </div>

    <!-- Main Admin Body -->
    <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow space-y-10">

      <!-- TAB 1: ANALYTICS -->
      <section id="admin-tab-analytics" class="${activeTab === 'analytics' ? '' : 'hidden'} space-y-8">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-obsidian-600 pb-4">
          <div>
            <h2 class="text-2xl sm:text-3xl font-headline font-extrabold text-white">Sales & Performance</h2>
            <p class="text-xs sm:text-sm text-text-secondary mt-1">Live overview of revenue, items crafted, and popular delivery routes.</p>
          </div>
          <button id="admin-refresh-analytics-btn" class="self-start sm:self-auto inline-flex items-center gap-2 text-xs font-headline font-bold text-amber-400 bg-obsidian-700 hover:bg-obsidian-600 px-4 py-2.5 rounded-xl border border-amber-400/30 transition-all shadow-sm whitespace-nowrap">
            <span class="material-symbols-outlined text-base leading-none flex-shrink-0">sync</span>
            <span>Refresh Metrics</span>
          </button>
        </div>

        <div class="dashboard-grid-4">
          <div class="stat-card space-y-2">
            <div class="flex items-center justify-between text-xs text-text-muted font-bold uppercase tracking-wider">
              <span>Total Revenue</span>
              <div class="w-8 h-8 rounded-xl bg-amber-400/10 flex items-center justify-center text-amber-400">
                <span class="material-symbols-outlined text-lg leading-none">payments</span>
              </div>
            </div>
            <div id="stat-total-revenue" class="text-2xl sm:text-3xl font-headline font-extrabold text-amber-400 tracking-tight">KES 0</div>
            <div class="text-xs text-text-secondary">Total sales generated</div>
          </div>

          <div class="stat-card space-y-2">
            <div class="flex items-center justify-between text-xs text-text-muted font-bold uppercase tracking-wider">
              <span>Past 7 Days</span>
              <div class="w-8 h-8 rounded-xl bg-emerald-400/10 flex items-center justify-center text-emerald-400">
                <span class="material-symbols-outlined text-lg leading-none">trending_up</span>
              </div>
            </div>
            <div id="stat-weekly-revenue" class="text-2xl sm:text-3xl font-headline font-extrabold text-emerald-400 tracking-tight">KES 0</div>
            <div id="stat-weekly-orders" class="text-xs text-text-secondary">0 orders this week</div>
          </div>

          <div class="stat-card space-y-2">
            <div class="flex items-center justify-between text-xs text-text-muted font-bold uppercase tracking-wider">
              <span>Total Orders</span>
              <div class="w-8 h-8 rounded-xl bg-sky-400/10 flex items-center justify-center text-sky-400">
                <span class="material-symbols-outlined text-lg leading-none">shopping_bag</span>
              </div>
            </div>
            <div id="stat-total-orders" class="text-2xl sm:text-3xl font-headline font-extrabold text-white tracking-tight">0</div>
            <div id="stat-items-sold" class="text-xs text-text-secondary">0 keyholders crafted</div>
          </div>

          <div class="stat-card space-y-2">
            <div class="flex items-center justify-between text-xs text-text-muted font-bold uppercase tracking-wider">
              <span>Order Type Split</span>
              <div class="w-8 h-8 rounded-xl bg-purple-400/10 flex items-center justify-center text-purple-400">
                <span class="material-symbols-outlined text-lg leading-none">donut_large</span>
              </div>
            </div>
            <div id="stat-custom-ratio" class="text-2xl sm:text-3xl font-headline font-extrabold text-purple-400 tracking-tight">50% Custom</div>
            <div class="text-xs text-text-secondary">Custom uploads vs ready-made</div>
          </div>
        </div>

        <div class="dashboard-grid-2">
          <div class="bg-obsidian-700/80 border border-obsidian-500 rounded-3xl p-6 sm:p-7 space-y-4 shadow-resin">
            <div class="flex items-center justify-between border-b border-obsidian-600 pb-3">
              <h3 class="font-headline font-bold text-lg text-white flex items-center space-x-2">
                <span class="material-symbols-outlined text-amber-400 leading-none">leaderboard</span>
                <span>Best-Selling Keyholders</span>
              </h3>
              <span class="text-xs text-amber-400 font-bold bg-amber-400/10 px-2.5 py-1 rounded-full">Revenue Rank</span>
            </div>
            <div id="analytics-top-products" class="space-y-3 pt-2">
              <p class="text-xs text-text-muted py-4 text-center">Loading sales breakdown...</p>
            </div>
          </div>

          <div class="bg-obsidian-700/80 border border-obsidian-500 rounded-3xl p-6 sm:p-7 space-y-4 shadow-resin">
            <div class="flex items-center justify-between border-b border-obsidian-600 pb-3">
              <h3 class="font-headline font-bold text-lg text-white flex items-center space-x-2">
                <span class="material-symbols-outlined text-amber-400 leading-none">directions_bus</span>
                <span>Top Delivery Routes</span>
              </h3>
              <span class="text-xs text-text-muted font-semibold">Nairobi Coverage</span>
            </div>
            <div id="analytics-top-routes" class="space-y-3 pt-2">
              <p class="text-xs text-text-muted py-4 text-center">Loading route breakdown...</p>
            </div>
          </div>
        </div>
      </section>

      <!-- TAB 2: CATALOG -->
      <section id="admin-tab-products" class="${activeTab === 'products' ? '' : 'hidden'} space-y-8">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-obsidian-600 pb-4">
          <div>
            <h2 class="text-2xl sm:text-3xl font-headline font-extrabold text-white">Keyholder Catalog & Pricing</h2>
            <p class="text-xs sm:text-sm text-text-secondary mt-1">Add showcase designs, patch prices in KES, and control in-stock visibility.</p>
          </div>
          <button id="admin-open-add-product-btn" class="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-obsidian-900 font-headline font-bold text-sm px-6 py-3 rounded-2xl shadow-resin hover:shadow-resin-lg inline-flex items-center gap-2.5 active:scale-95 transition-all self-start sm:self-auto whitespace-nowrap">
            <span class="material-symbols-outlined text-xl leading-none flex-shrink-0">add_circle</span>
            <span>+ Add New Keyholder</span>
          </button>
        </div>

        <div id="admin-products-grid" class="dashboard-grid-4">
          <!-- Dynamic Products -->
        </div>
      </section>

      <!-- TAB 3: ORDERS -->
      <section id="admin-tab-orders" class="${activeTab === 'orders' ? '' : 'hidden'} space-y-8">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-obsidian-600 pb-4">
          <div>
            <h2 class="text-2xl sm:text-3xl font-headline font-extrabold text-white">Customer Orders Log</h2>
            <p class="text-xs sm:text-sm text-text-secondary mt-1">Durable records of all orders submitted by buyers across Nairobi routes.</p>
          </div>
          <div class="flex items-center gap-3">
            <select id="admin-filter-order-status" class="bg-obsidian-700 border border-obsidian-500 rounded-xl px-4 py-2.5 text-xs font-semibold text-white focus:border-amber-400 focus:outline-none shadow-sm">
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="ready">Ready for Pickup</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button id="admin-refresh-orders-btn" class="bg-obsidian-700 hover:bg-obsidian-600 text-text-secondary hover:text-white p-2.5 rounded-xl border border-obsidian-500 transition-colors shadow-sm inline-flex items-center justify-center" title="Refresh Orders">
              <span class="material-symbols-outlined text-lg leading-none">refresh</span>
            </button>
          </div>
        </div>

        <div id="admin-orders-container" class="space-y-6 max-w-5xl mx-auto">
          <!-- Dynamic Orders -->
        </div>
      </section>

      <!-- TAB 4: BRANDING -->
      <section id="admin-tab-branding" class="${activeTab === 'branding' ? '' : 'hidden'} space-y-8">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-obsidian-600 pb-4">
          <div>
            <h2 class="text-2xl sm:text-3xl font-headline font-extrabold text-white">Storefront Branding & Contacts</h2>
            <p class="text-xs sm:text-sm text-text-secondary mt-1">Configure shop name, order receiving phone number, and tagline.</p>
          </div>
        </div>

        <div class="max-w-3xl mx-auto bg-obsidian-800/80 border border-obsidian-500 rounded-3xl p-6 sm:p-10 shadow-resin space-y-6">
          <form id="admin-branding-form" class="space-y-6">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="block text-xs font-label font-bold uppercase tracking-wider text-amber-400">Shop / Brand Name</label>
                <input type="text" id="admin-setting-shop-name" value="${settings.shop_name}" required class="w-full bg-obsidian-900 border border-obsidian-500 rounded-xl px-4 py-3 text-white text-sm focus:border-amber-400 focus:outline-none transition-colors" />
              </div>

              <div class="space-y-1.5">
                <label class="block text-xs font-label font-bold uppercase tracking-wider text-amber-400">Hero Section Badge</label>
                <input type="text" id="admin-setting-hero-badge" value="${settings.hero_badge}" required class="w-full bg-obsidian-900 border border-obsidian-500 rounded-xl px-4 py-3 text-white text-sm focus:border-amber-400 focus:outline-none transition-colors" />
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-label font-bold uppercase tracking-wider text-amber-400">Hero Headline Title</label>
              <input type="text" id="admin-setting-hero-title" value="${settings.hero_title || 'Preserve Your Passion in Hand-Poured Resin'}" required class="w-full bg-obsidian-900 border border-obsidian-500 rounded-xl px-4 py-3 text-white text-sm focus:border-amber-400 focus:outline-none transition-colors" />
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-label font-bold uppercase tracking-wider text-amber-400">Hero Subtitle / Tagline</label>
              <textarea id="admin-setting-tagline" rows="2" required class="w-full bg-obsidian-900 border border-obsidian-500 rounded-xl px-4 py-3 text-white text-sm focus:border-amber-400 focus:outline-none transition-colors">${settings.tagline}</textarea>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="block text-xs font-label font-bold uppercase tracking-wider text-amber-400">WhatsApp Order Recipient Phone</label>
                <input type="text" id="admin-setting-whatsapp" value="${settings.whatsapp_number}" required placeholder="e.g. 254704513552" class="w-full bg-obsidian-900 border border-obsidian-500 rounded-xl px-4 py-3 text-white text-sm focus:border-amber-400 focus:outline-none transition-colors" />
              </div>

              <div class="space-y-1.5">
                <label class="block text-xs font-label font-bold uppercase tracking-wider text-amber-400">Custom Keyholder Price (KES)</label>
                <input type="number" id="admin-setting-custom-price" value="${settings.custom_price_kes}" required min="100" class="w-full bg-obsidian-900 border border-obsidian-500 rounded-xl px-4 py-3 text-white text-sm focus:border-amber-400 focus:outline-none transition-colors" />
              </div>
            </div>

            <button type="submit" id="admin-save-settings-btn" class="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-obsidian-900 font-headline font-bold text-sm sm:text-base py-3.5 px-8 rounded-2xl shadow-resin hover:shadow-resin-lg transition-all inline-flex items-center justify-center gap-3 whitespace-nowrap">
              <span class="material-symbols-outlined text-xl leading-none flex-shrink-0">save</span>
              <span>Save & Update Storefront</span>
            </button>
          </form>
        </div>
      </section>

    </main>

    <!-- Mobile Navigation Bottom Bar -->
    <div class="mobile-nav-bar fixed bottom-0 left-0 right-0 z-40 bg-obsidian-900/95 backdrop-blur-md border-t border-obsidian-600 px-3 py-2 flex items-center justify-around shadow-2xl">
      <button data-admin-tab="analytics" class="admin-tab-btn flex flex-col items-center gap-1 ${activeTab === 'analytics' ? 'text-amber-400' : 'text-text-muted hover:text-white'} transition-colors">
        <span class="material-symbols-outlined text-xl leading-none">insights</span>
        <span class="text-[10px] font-bold">Analytics</span>
      </button>
      <button data-admin-tab="products" class="admin-tab-btn flex flex-col items-center gap-1 ${activeTab === 'products' ? 'text-amber-400' : 'text-text-muted hover:text-white'} transition-colors">
        <span class="material-symbols-outlined text-xl leading-none">inventory_2</span>
        <span class="text-[10px] font-bold">Catalog</span>
      </button>
      <button data-admin-tab="orders" class="admin-tab-btn flex flex-col items-center gap-1 ${activeTab === 'orders' ? 'text-amber-400' : 'text-text-muted hover:text-white'} transition-colors">
        <span class="material-symbols-outlined text-xl leading-none">receipt_long</span>
        <span class="text-[10px] font-bold">Orders</span>
      </button>
      <button data-admin-tab="branding" class="admin-tab-btn flex flex-col items-center gap-1 ${activeTab === 'branding' ? 'text-amber-400' : 'text-text-muted hover:text-white'} transition-colors">
        <span class="material-symbols-outlined text-xl leading-none">tune</span>
        <span class="text-[10px] font-bold">Branding</span>
      </button>
    </div>

    <!-- Add/Edit Product Modal -->
    <div id="admin-product-modal" class="hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-obsidian-800 border border-obsidian-500 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between border-b border-obsidian-600 pb-3">
          <h3 id="admin-modal-title" class="font-headline font-bold text-xl text-white">Add New Keyholder</h3>
          <button id="admin-close-modal-btn" class="text-text-muted hover:text-white p-1 rounded-lg">
            <span class="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        <form id="admin-product-modal-form" class="space-y-4">
          <input type="hidden" id="admin-modal-product-id" />

          <div class="space-y-1">
            <label class="block text-xs font-bold text-amber-400 uppercase tracking-wider">Product Name</label>
            <input type="text" id="admin-modal-product-name" required placeholder="e.g. Classic Mercedes Logo Dome" class="w-full bg-obsidian-900 border border-obsidian-500 rounded-xl px-4 py-2.5 text-white text-sm focus:border-amber-400 focus:outline-none" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1">
              <label class="block text-xs font-bold text-amber-400 uppercase tracking-wider">Price (KES)</label>
              <input type="number" id="admin-modal-product-price" required min="50" placeholder="450" class="w-full bg-obsidian-900 border border-obsidian-500 rounded-xl px-4 py-2.5 text-white text-sm focus:border-amber-400 focus:outline-none" />
            </div>
            <div class="space-y-1">
              <label class="block text-xs font-bold text-amber-400 uppercase tracking-wider">Badge / Tag</label>
              <input type="text" id="admin-modal-product-tag" placeholder="e.g. Bestseller, New" class="w-full bg-obsidian-900 border border-obsidian-500 rounded-xl px-4 py-2.5 text-white text-sm focus:border-amber-400 focus:outline-none" />
            </div>
          </div>

          <div class="space-y-1">
            <label class="block text-xs font-bold text-amber-400 uppercase tracking-wider">Description</label>
            <textarea id="admin-modal-product-desc" rows="2" placeholder="Hand-poured crystal resin with gold foil trim..." class="w-full bg-obsidian-900 border border-obsidian-500 rounded-xl px-4 py-2.5 text-white text-sm focus:border-amber-400 focus:outline-none"></textarea>
          </div>

          <div class="space-y-2">
            <label class="block text-xs font-bold text-amber-400 uppercase tracking-wider">Product Photo</label>
            <div class="flex items-center space-x-3">
              <img id="admin-modal-img-preview" src="/img/classic-car.jpg" alt="Preview" class="w-16 h-16 rounded-xl object-cover border border-obsidian-500 bg-obsidian-900" />
              <div class="flex-grow space-y-2">
                <input type="file" id="admin-modal-img-file" class="hidden" accept="image/*" />
                <button type="button" id="admin-modal-upload-btn" class="w-full bg-obsidian-700 hover:bg-obsidian-600 text-amber-400 font-bold text-xs py-2 px-3 rounded-xl border border-amber-400/30 flex items-center justify-center space-x-1.5 transition-colors">
                  <span class="material-symbols-outlined text-base">add_a_photo</span>
                  <span>Choose Photo / Camera</span>
                </button>
                <input type="text" id="admin-modal-product-photo" placeholder="or enter image URL" class="w-full bg-obsidian-900 border border-obsidian-500 rounded-xl px-3 py-1.5 text-xs text-white placeholder-text-muted focus:outline-none" />
              </div>
            </div>
          </div>

          <div class="flex items-center space-x-2 pt-2">
            <input type="checkbox" id="admin-modal-product-active" checked class="rounded bg-obsidian-900 border-obsidian-500 text-amber-400 focus:ring-amber-400 w-4 h-4" />
            <label for="admin-modal-product-active" class="text-xs font-semibold text-text-primary">Active in Storefront Catalog</label>
          </div>

          <div class="pt-4 flex items-center justify-end space-x-3 border-t border-obsidian-600">
            <button type="button" id="admin-modal-cancel-btn" class="px-4 py-2 text-xs font-bold text-text-muted hover:text-white rounded-xl">Cancel</button>
            <button type="submit" id="admin-modal-save-btn" class="bg-amber-400 hover:bg-amber-500 text-obsidian-900 font-headline font-bold text-xs px-5 py-2.5 rounded-xl shadow-resin">Save Keyholder</button>
          </div>
        </form>
      </div>
    </div>
  </div>
  `;
}

export function initAdminLogic(container: HTMLElement): void {
  const loginFormEl = container.querySelector('#admin-login-form') as HTMLFormElement | null;
  const passcodePinInputEl = container.querySelector('#admin-passcode-input') as HTMLInputElement | null;
  const logoutBtnEl = container.querySelector('#admin-logout-btn') as HTMLButtonElement | null;

  // Tabs
  const tabButtons = container.querySelectorAll('.admin-tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = (btn as HTMLElement).dataset.adminTab as 'analytics' | 'products' | 'orders' | 'branding';
      if (tab) {
        store.setAdminActiveTab(tab);
      }
    });
  });

  // Login handler
  if (loginFormEl && passcodePinInputEl) {
    loginFormEl.addEventListener('submit', async (e) => {
      e.preventDefault();
      const enteredPasscode = passcodePinInputEl.value.trim();

      try {
        const res = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: enteredPasscode }),
        });

        const data = await res.json();
        if (res.ok && data.token) {
          store.setAdminToken(data.token);
          showToast('Login successful! Welcome back.', 'success');
          await store.fetchAdminData();
        } else {
          showToast(data.error || 'Invalid passcode. Access denied.', 'error');
          passcodePinInputEl.value = '';
          passcodePinInputEl.focus();
        }
      } catch {
        showToast('Authentication network error. Check connection.', 'error');
      }
    });
  }

  // Logout handler
  if (logoutBtnEl) {
    logoutBtnEl.addEventListener('click', () => {
      store.setAdminToken(null);
      showToast('Logged out of admin portal', 'info');
    });
  }

  // Refresh Analytics
  const refreshAnalyticsBtn = container.querySelector('#admin-refresh-analytics-btn');
  if (refreshAnalyticsBtn) {
    refreshAnalyticsBtn.addEventListener('click', async () => {
      await store.fetchAdminData();
      renderAnalyticsUI(container);
      showToast('Metrics updated with live data', 'success');
    });
  }

  // Refresh Orders
  const refreshOrdersBtn = container.querySelector('#admin-refresh-orders-btn');
  if (refreshOrdersBtn) {
    refreshOrdersBtn.addEventListener('click', async () => {
      await store.fetchAdminData();
      renderOrdersUI(container);
      showToast('Orders refreshed', 'info');
    });
  }

  // Filter Orders
  const filterOrdersSelect = container.querySelector('#admin-filter-order-status') as HTMLSelectElement | null;
  if (filterOrdersSelect) {
    filterOrdersSelect.addEventListener('change', () => {
      renderOrdersUI(container, filterOrdersSelect.value);
    });
  }

  // Branding Form Submit
  const brandingForm = container.querySelector('#admin-branding-form') as HTMLFormElement | null;
  if (brandingForm) {
    brandingForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const shopName = (container.querySelector('#admin-setting-shop-name') as HTMLInputElement).value.trim();
      const heroBadge = (container.querySelector('#admin-setting-hero-badge') as HTMLInputElement).value.trim();
      const heroTitle = (container.querySelector('#admin-setting-hero-title') as HTMLInputElement).value.trim();
      const tagline = (container.querySelector('#admin-setting-tagline') as HTMLTextAreaElement).value.trim();
      const whatsapp = (container.querySelector('#admin-setting-whatsapp') as HTMLInputElement).value.trim();
      const customPrice = (container.querySelector('#admin-setting-custom-price') as HTMLInputElement).value.trim();

      const newSettings = {
        shop_name: shopName,
        tagline: tagline,
        hero_title: heroTitle,
        whatsapp_number: whatsapp,
        hero_badge: heroBadge,
        custom_price_kes: customPrice,
      };

      try {
        const res = await fetch('/api/settings', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${store.getState().adminToken}`,
          },
          body: JSON.stringify(newSettings),
        });

        if (res.ok) {
          store.updateSettings(newSettings);
          showToast('Storefront branding updated in real-time!', 'success');
        } else {
          showToast('Failed to save settings', 'error');
        }
      } catch (err: any) {
        showToast(err.message || 'Error updating settings', 'error');
      }
    });
  }

  // Product Modal Setup
  setupProductModal(container);

  // Initial renders
  renderAnalyticsUI(container);
  renderCatalogUI(container);
  renderOrdersUI(container);
}

function renderAnalyticsUI(container: HTMLElement): void {
  const analytics = store.getState().analytics;
  if (!analytics) return;

  const totalRevEl = container.querySelector('#stat-total-revenue');
  const weeklyRevEl = container.querySelector('#stat-weekly-revenue');
  const weeklyOrdersEl = container.querySelector('#stat-weekly-orders');
  const totalOrdersEl = container.querySelector('#stat-total-orders');
  const itemsSoldEl = container.querySelector('#stat-items-sold');
  const customRatioEl = container.querySelector('#stat-custom-ratio');

  if (totalRevEl) totalRevEl.textContent = `KES ${Number(analytics.totalRevenueKES || 0).toLocaleString()}`;
  if (weeklyRevEl) weeklyRevEl.textContent = `KES ${Number(analytics.weeklyRevenueKES || 0).toLocaleString()}`;
  if (weeklyOrdersEl) weeklyOrdersEl.textContent = `${Number(analytics.weeklyOrders || 0)} orders this week`;
  if (totalOrdersEl) totalOrdersEl.textContent = Number(analytics.totalOrders || 0).toString();
  if (itemsSoldEl) itemsSoldEl.textContent = `${Number(analytics.totalItemsSold || 0)} keyholders crafted`;

  if (customRatioEl && analytics.customRatio && analytics.customRatio.length > 0) {
    const custom = analytics.customRatio.find(c => c.orderType === 'Custom Emblem');
    const totalCount = analytics.customRatio.reduce((sum, c) => sum + Number(c.count), 0);
    const customPct = totalCount > 0 ? Math.round((Number(custom?.count || 0) / totalCount) * 100) : 50;
    customRatioEl.textContent = `${customPct}% Custom`;
  }

  // Best-Selling List
  const topProductsEl = container.querySelector('#analytics-top-products');
  if (topProductsEl && analytics.topProducts) {
    if (analytics.topProducts.length === 0) {
      topProductsEl.innerHTML = `<p class="text-xs text-text-muted py-4 text-center">Initial catalog ready for customer orders.</p>`;
    } else {
      topProductsEl.innerHTML = analytics.topProducts.map((p, idx) => `
        <div class="flex items-center justify-between p-3 rounded-2xl bg-obsidian-800 border border-obsidian-600">
          <div class="flex items-center space-x-3">
            <span class="w-6 h-6 rounded-full bg-amber-400/20 text-amber-400 text-xs font-bold flex items-center justify-center">#${idx + 1}</span>
            <div>
              <h4 class="text-sm font-bold text-white">${p.productName}</h4>
              <span class="text-xs text-text-muted">${Number(p.orderCount)} orders (${Number(p.totalQuantity)} crafted)</span>
            </div>
          </div>
          <span class="text-xs font-headline font-bold text-amber-400">KES ${Number(p.totalSalesKES).toLocaleString()}</span>
        </div>
      `).join('');
    }
  }

  // Top Routes
  const topRoutesEl = container.querySelector('#analytics-top-routes');
  if (topRoutesEl && analytics.topRoutes) {
    if (analytics.topRoutes.length === 0) {
      topRoutesEl.innerHTML = `<p class="text-xs text-text-muted py-4 text-center">No route delivery records yet.</p>`;
    } else {
      topRoutesEl.innerHTML = analytics.topRoutes.map(r => `
        <div class="flex items-center justify-between p-3 rounded-2xl bg-obsidian-800 border border-obsidian-600">
          <div class="flex items-center space-x-2">
            <span class="material-symbols-outlined text-amber-400 text-base">alt_route</span>
            <span class="text-xs font-semibold text-white">${r.busRoute}</span>
          </div>
          <span class="text-xs font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full">${Number(r.orderCount)} parcels</span>
        </div>
      `).join('');
    }
  }
}

function renderCatalogUI(container: HTMLElement): void {
  const gridEl = container.querySelector('#admin-products-grid');
  if (!gridEl) return;

  const products = store.getState().products;

  if (products.length === 0) {
    gridEl.innerHTML = `<p class="col-span-full text-center py-12 text-text-muted">No products found. Add your first keyholder design above!</p>`;
    return;
  }

  gridEl.innerHTML = products.map(product => `
    <div class="bg-obsidian-800 border border-obsidian-600 hover:border-amber-400/40 rounded-3xl overflow-hidden shadow-resin flex flex-col justify-between transition-all" data-id="${product.id}">
      <div class="relative aspect-square bg-obsidian-900">
        <img src="${product.photo}" alt="${product.name}" class="w-full h-full object-cover" onerror="this.src='/img/classic-car.jpg'" />
        <span class="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full ${product.isActive !== false ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}">
          ${product.isActive !== false ? '● In Stock' : '○ Draft'}
        </span>
        ${product.tag ? `<span class="absolute top-3 right-3 bg-amber-400 text-obsidian-900 text-[10px] font-headline font-bold px-2.5 py-0.5 rounded-full shadow-md">${product.tag}</span>` : ''}
      </div>

      <div class="p-4 space-y-3">
        <div class="flex items-baseline justify-between">
          <h4 class="font-headline font-bold text-sm text-white line-clamp-1">${product.name}</h4>
          <span class="font-headline font-bold text-amber-400 text-sm">KES ${product.priceKES}</span>
        </div>
        <p class="text-xs text-text-muted line-clamp-2">${product.description || 'Handcrafted dome resin keyholder.'}</p>

        <div class="pt-2 border-t border-obsidian-600/60 flex items-center justify-between gap-2">
          <button class="admin-toggle-active-btn text-xs font-bold px-3.5 py-1.5 rounded-xl border ${product.isActive !== false ? 'border-amber-400/30 text-amber-400 hover:bg-amber-400/10' : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'} transition-colors whitespace-nowrap" data-id="${product.id}" data-active="${product.isActive !== false}">
            ${product.isActive !== false ? 'Set Draft' : 'Publish'}
          </button>
          
          <div class="flex items-center gap-1.5">
            <button class="admin-edit-product-btn p-2 rounded-xl bg-obsidian-700 hover:bg-obsidian-600 text-text-secondary hover:text-white transition-colors" data-id="${product.id}" title="Edit Keyholder">
              <span class="material-symbols-outlined text-base leading-none">edit</span>
            </button>
            <button class="admin-delete-product-btn p-2 rounded-xl bg-obsidian-700 hover:bg-rose-500/20 text-text-secondary hover:text-rose-400 transition-colors" data-id="${product.id}" title="Delete Keyholder">
              <span class="material-symbols-outlined text-base leading-none">delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join('');

  // Attach card event listeners
  gridEl.querySelectorAll('.admin-toggle-active-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = (e.currentTarget as HTMLElement).dataset.id!;
      const currentActive = (e.currentTarget as HTMLElement).dataset.active === 'true';
      await updateProductStatus(id, !currentActive);
    });
  });

  gridEl.querySelectorAll('.admin-edit-product-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = (e.currentTarget as HTMLElement).dataset.id!;
      const product = store.getState().products.find(p => p.id === id);
      if (product) openProductModal(container, product);
    });
  });

  gridEl.querySelectorAll('.admin-delete-product-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = (e.currentTarget as HTMLElement).dataset.id!;
      if (confirm('Are you sure you want to remove this keyholder design?')) {
        await deleteProduct(id);
      }
    });
  });
}

function renderOrdersUI(container: HTMLElement, filterStatus = 'all'): void {
  const ordersContainerEl = container.querySelector('#admin-orders-container');
  if (!ordersContainerEl) return;

  const orders = store.getState().orders;
  const filtered = filterStatus === 'all' ? orders : orders.filter(o => o.status === filterStatus);

  if (filtered.length === 0) {
    ordersContainerEl.innerHTML = `
      <div class="text-center py-16 bg-obsidian-800/40 rounded-3xl border border-obsidian-600">
        <span class="material-symbols-outlined text-4xl text-obsidian-400 mb-2">receipt_long</span>
        <p class="text-sm text-text-muted">No orders found matching the filter.</p>
      </div>
    `;
    return;
  }

  ordersContainerEl.innerHTML = filtered.map(order => {
    const total = order.priceKES * order.quantity;
    const formattedDate = new Date(order.createdAt).toLocaleDateString('en-KE', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    let statusBadge = 'bg-amber-400/10 text-amber-400 border-amber-400/30';
    if (order.status === 'delivered') statusBadge = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    if (order.status === 'in_progress') statusBadge = 'bg-sky-500/10 text-sky-400 border-sky-500/30';
    if (order.status === 'cancelled') statusBadge = 'bg-rose-500/10 text-rose-400 border-rose-500/30';

    return `
      <div class="bg-obsidian-800 border border-obsidian-600 rounded-3xl p-5 sm:p-6 space-y-4 shadow-resin">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-obsidian-600 pb-3">
          <div>
            <div class="flex items-center space-x-2">
              <span class="font-headline font-bold text-base text-white">${order.buyerName}</span>
              <span class="text-xs font-semibold text-text-muted">• ${formattedDate}</span>
            </div>
            <span class="text-xs text-amber-400 font-semibold">${order.department}</span>
          </div>
          <div class="flex items-center space-x-3">
            <span class="text-sm font-headline font-bold text-amber-400">KES ${total.toLocaleString()} (${order.quantity} pcs)</span>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
          <div class="space-y-1">
            <div class="text-text-primary font-semibold">${order.productName}</div>
            <div class="text-text-muted flex items-center space-x-1">
              <span class="material-symbols-outlined text-sm">directions_bus</span>
              <span>${order.busRoute} ➔ ${order.pickupSpot}</span>
            </div>
            ${order.note ? `<div class="text-text-secondary italic">Note: "${order.note}"</div>` : ''}
          </div>

          ${order.customImageUrl ? `
            <a href="${order.customImageUrl}" target="_blank" class="flex-shrink-0 flex items-center space-x-2 bg-obsidian-900 border border-obsidian-500 hover:border-amber-400 p-1.5 rounded-xl transition-colors">
              <img src="${order.customImageUrl}" class="w-12 h-12 rounded-lg object-cover" />
              <span class="text-[10px] text-amber-400 font-bold pr-2">View Emblem</span>
            </a>
          ` : ''}
        </div>

        <div class="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <span class="text-xs font-semibold text-text-muted">Status:</span>
            <select class="admin-order-status-select text-xs font-bold rounded-xl px-3.5 py-2 focus:outline-none ${statusBadge} shadow-sm" data-id="${order.id}">
              <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
              <option value="in_progress" ${order.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
              <option value="ready" ${order.status === 'ready' ? 'selected' : ''}>Ready for Pickup</option>
              <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
              <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
          </div>

          <a href="https://wa.me/?text=${encodeURIComponent(`Hi ${order.buyerName}, regarding your ${order.productName} order from ResinCraft...`)}" target="_blank" class="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold text-xs py-2.5 px-4 rounded-xl border border-emerald-500/30 inline-flex items-center justify-center gap-2 transition-all shadow-sm whitespace-nowrap">
            <span class="material-symbols-outlined text-sm leading-none flex-shrink-0">chat</span>
            <span>WhatsApp Customer</span>
          </a>
        </div>
      </div>
    `;
  }).join('');

  ordersContainerEl.querySelectorAll('.admin-order-status-select').forEach(select => {
    select.addEventListener('change', async (e) => {
      const target = e.currentTarget as HTMLSelectElement;
      const orderId = target.dataset.id!;
      await updateOrderStatus(orderId, target.value);
    });
  });
}

function setupProductModal(container: HTMLElement): void {
  const modalEl = container.querySelector('#admin-product-modal') as HTMLElement | null;
  const openBtn = container.querySelector('#admin-open-add-product-btn');
  const closeBtn = container.querySelector('#admin-close-modal-btn');
  const cancelBtn = container.querySelector('#admin-modal-cancel-btn');
  const formEl = container.querySelector('#admin-product-modal-form') as HTMLFormElement | null;
  const uploadBtn = container.querySelector('#admin-modal-upload-btn') as HTMLButtonElement | null;
  const fileInput = container.querySelector('#admin-modal-img-file') as HTMLInputElement | null;
  const photoUrlInput = container.querySelector('#admin-modal-product-photo') as HTMLInputElement | null;
  const previewImg = container.querySelector('#admin-modal-img-preview') as HTMLImageElement | null;

  if (openBtn) {
    openBtn.addEventListener('click', () => openProductModal(container, null));
  }
  if (closeBtn) closeBtn.addEventListener('click', () => modalEl?.classList.add('hidden'));
  if (cancelBtn) cancelBtn.addEventListener('click', () => modalEl?.classList.add('hidden'));

  if (uploadBtn && fileInput) {
    uploadBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', async () => {
      if (fileInput.files && fileInput.files.length > 0) {
        const file = fileInput.files[0];
        try {
          uploadBtn.innerHTML = `<span class="material-symbols-outlined animate-spin text-base">sync</span><span>Uploading...</span>`;
          const url = await uploadCustomEmblemImage(file);
          if (photoUrlInput) photoUrlInput.value = url;
          if (previewImg) previewImg.src = url;
          showToast('Photo uploaded successfully!', 'success');
        } catch (err: any) {
          showToast(err.message || 'Photo upload failed', 'error');
        } finally {
          uploadBtn.innerHTML = `<span class="material-symbols-outlined text-base">add_a_photo</span><span>Choose Photo / Camera</span>`;
        }
      }
    });
  }

  if (photoUrlInput && previewImg) {
    photoUrlInput.addEventListener('input', () => {
      if (photoUrlInput.value.trim()) previewImg.src = photoUrlInput.value.trim();
    });
  }

  if (formEl) {
    formEl.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = (container.querySelector('#admin-modal-product-id') as HTMLInputElement).value;
      const name = (container.querySelector('#admin-modal-product-name') as HTMLInputElement).value.trim();
      const priceKES = Number((container.querySelector('#admin-modal-product-price') as HTMLInputElement).value);
      const tag = (container.querySelector('#admin-modal-product-tag') as HTMLInputElement).value.trim() || undefined;
      const description = (container.querySelector('#admin-modal-product-desc') as HTMLTextAreaElement).value.trim();
      const photo = (container.querySelector('#admin-modal-product-photo') as HTMLInputElement).value.trim() || '/img/classic-car.jpg';
      const isActive = (container.querySelector('#admin-modal-product-active') as HTMLInputElement).checked;

      const productPayload = {
        name,
        priceKES,
        tag,
        description,
        photo,
        isActive,
        category: 'keyholder',
      };

      try {
        const url = id ? `/api/products?id=${id}` : '/api/products';
        const method = id ? 'PUT' : 'POST';

        const res = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${store.getState().adminToken}`,
          },
          body: JSON.stringify(productPayload),
        });

        if (res.ok) {
          showToast(id ? 'Keyholder updated successfully!' : 'New keyholder added!', 'success');
          modalEl?.classList.add('hidden');
          await store.fetchAdminData();
          renderCatalogUI(container);
        } else {
          showToast('Failed to save keyholder', 'error');
        }
      } catch (err: any) {
        showToast(err.message || 'Error saving keyholder', 'error');
      }
    });
  }
}

function openProductModal(container: HTMLElement, product: Product | null): void {
  const modalEl = container.querySelector('#admin-product-modal') as HTMLElement | null;
  const titleEl = container.querySelector('#admin-modal-title') as HTMLElement | null;
  const idEl = container.querySelector('#admin-modal-product-id') as HTMLInputElement | null;
  const nameEl = container.querySelector('#admin-modal-product-name') as HTMLInputElement | null;
  const priceEl = container.querySelector('#admin-modal-product-price') as HTMLInputElement | null;
  const tagEl = container.querySelector('#admin-modal-product-tag') as HTMLInputElement | null;
  const descEl = container.querySelector('#admin-modal-product-desc') as HTMLTextAreaElement | null;
  const photoEl = container.querySelector('#admin-modal-product-photo') as HTMLInputElement | null;
  const previewImgEl = container.querySelector('#admin-modal-img-preview') as HTMLImageElement | null;
  const activeEl = container.querySelector('#admin-modal-product-active') as HTMLInputElement | null;

  if (product) {
    if (titleEl) titleEl.textContent = 'Edit Keyholder Design';
    if (idEl) idEl.value = product.id;
    if (nameEl) nameEl.value = product.name;
    if (priceEl) priceEl.value = product.priceKES.toString();
    if (tagEl) tagEl.value = product.tag || '';
    if (descEl) descEl.value = product.description || '';
    if (photoEl) photoEl.value = product.photo;
    if (previewImgEl) previewImgEl.src = product.photo;
    if (activeEl) activeEl.checked = product.isActive !== false;
  } else {
    if (titleEl) titleEl.textContent = 'Add New Keyholder';
    if (idEl) idEl.value = '';
    if (nameEl) nameEl.value = '';
    if (priceEl) priceEl.value = '450';
    if (tagEl) tagEl.value = '';
    if (descEl) descEl.value = '';
    if (photoEl) photoEl.value = '';
    if (previewImgEl) previewImgEl.src = '/img/classic-car.jpg';
    if (activeEl) activeEl.checked = true;
  }

  modalEl?.classList.remove('hidden');
}

async function updateProductStatus(productId: string, isActive: boolean): Promise<void> {
  try {
    const res = await fetch(`/api/products?id=${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${store.getState().adminToken}`,
      },
      body: JSON.stringify({ isActive }),
    });

    if (res.ok) {
      showToast(`Keyholder ${isActive ? 'published to' : 'hidden from'} storefront`, 'success');
      await store.fetchAdminData();
    }
  } catch {
    showToast('Failed to update product status', 'error');
  }
}

async function deleteProduct(productId: string): Promise<void> {
  try {
    const res = await fetch(`/api/products?id=${productId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${store.getState().adminToken}`,
      },
    });

    if (res.ok) {
      showToast('Keyholder deleted from catalog', 'info');
      await store.fetchAdminData();
    }
  } catch {
    showToast('Failed to delete keyholder', 'error');
  }
}

async function updateOrderStatus(orderId: string, status: string): Promise<void> {
  try {
    const res = await fetch(`/api/orders?id=${orderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${store.getState().adminToken}`,
      },
      body: JSON.stringify({ status }),
    });

    if (res.ok) {
      showToast(`Order status marked as ${status.replace('_', ' ')}`, 'success');
      await store.fetchAdminData();
    }
  } catch {
    showToast('Failed to update order status', 'error');
  }
}
