import './style.css';
import { store } from './state';
import { router } from './router';
import { renderStorefrontHTML, initStorefrontLogic } from './views/storefrontView';
import { renderAdminHTML, initAdminLogic } from './views/adminView';

// SPA View Mount Controller
function mountCurrentView(): void {
  const appEl = document.getElementById('app');
  if (!appEl) return;

  const currentRoute = router.getNormalizedRoute();
  const pageTitleEl = document.getElementById('page-title');
  const shopName = store.getState().settings.shop_name;

  if (currentRoute === '/admin') {
    if (pageTitleEl) pageTitleEl.textContent = `${shopName} — Artisan Studio Dashboard`;
    appEl.innerHTML = renderAdminHTML();
    initAdminLogic(appEl);
  } else {
    if (pageTitleEl) pageTitleEl.textContent = `${shopName} — Custom Emblem Keyholders`;
    appEl.innerHTML = renderStorefrontHTML();
    initStorefrontLogic(appEl);
  }
}

// Bootstrap SPA
document.addEventListener('DOMContentLoaded', async () => {
  // 1. Initial view render based on URL
  mountCurrentView();

  // 2. Listen to route transitions (instant zero-reload navigation)
  router.onRoute(() => {
    mountCurrentView();
  });

  // 3. Re-render on key state updates (e.g. auth changes, tab switching)
  let lastToken = store.getState().adminToken;
  let lastAdminTab = store.getState().adminActiveTab;

  store.subscribe((state) => {
    if (state.adminToken !== lastToken || state.adminActiveTab !== lastAdminTab) {
      lastToken = state.adminToken;
      lastAdminTab = state.adminActiveTab;
      mountCurrentView();
    }
  });

  // 4. Fetch live store data from Neon database
  await store.fetchPublicStoreData();
  mountCurrentView();

  // 5. If logged in, fetch admin metrics and logs
  if (store.getState().adminToken) {
    await store.fetchAdminData();
    mountCurrentView();
  }
});
