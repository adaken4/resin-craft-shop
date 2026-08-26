import { Product, SiteSettings, OrderRecord, AnalyticsData, OrderFormState } from './types';
import { DEPARTMENTS, BUS_ROUTES, PICKUP_SPOTS } from './products';

export interface AppState {
  products: Product[];
  settings: SiteSettings;
  orders: OrderRecord[];
  analytics: AnalyticsData | null;
  adminToken: string | null;
  orderForm: OrderFormState;
  currentRoute: string;
  adminActiveTab: 'analytics' | 'products' | 'orders' | 'branding';
}

type StateListener = (state: AppState) => void;

class StateStore {
  private state: AppState = {
    products: [],
    settings: {
      shop_name: 'ResinCraft',
      tagline: 'Your emblem, sealed in pristine, hand-poured resin.',
      hero_title: 'Preserve Your Passion in Hand-Poured Resin',
      whatsapp_number: '254704513552',
      hero_badge: 'Nairobi Office & Route Express Delivery',
      custom_price_kes: '500',
    },
    orders: [],
    analytics: null,
    adminToken: localStorage.getItem('resincraft_admin_token'),
    orderForm: {
      productId: null,
      productName: 'Custom Resin Emblem',
      priceKES: 500,
      customImageUrl: null,
      department: DEPARTMENTS[0].value,
      busRoute: BUS_ROUTES[0].value,
      pickupSpot: PICKUP_SPOTS[0].value,
      quantity: 1,
      buyerName: '',
      note: '',
    },
    currentRoute: '/',
    adminActiveTab: 'analytics',
  };

  private listeners: Set<StateListener> = new Set();

  public getState(): Readonly<AppState> {
    return this.state;
  }

  public subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  public setProducts(products: Product[]): void {
    this.state.products = products;
    this.notify();
  }

  public updateSettings(settings: Partial<SiteSettings>): void {
    this.state.settings = { ...this.state.settings, ...settings };
    this.notify();
  }

  public setOrders(orders: OrderRecord[]): void {
    this.state.orders = orders;
    this.notify();
  }

  public setAnalytics(analytics: AnalyticsData | null): void {
    this.state.analytics = analytics;
    this.notify();
  }

  public setAdminToken(token: string | null): void {
    this.state.adminToken = token;
    if (token) {
      localStorage.setItem('resincraft_admin_token', token);
    } else {
      localStorage.removeItem('resincraft_admin_token');
    }
    this.notify();
  }

  public updateOrderForm(updates: Partial<OrderFormState>): void {
    this.state.orderForm = { ...this.state.orderForm, ...updates };
    this.notify();
  }

  public setCurrentRoute(route: string): void {
    this.state.currentRoute = route;
    this.notify();
  }

  public setAdminActiveTab(tab: 'analytics' | 'products' | 'orders' | 'branding'): void {
    this.state.adminActiveTab = tab;
    this.notify();
  }

  // API Sync Methods
  public async fetchPublicStoreData(): Promise<void> {
    try {
      const [settingsRes, productsRes] = await Promise.all([
        fetch('/api/settings'),
        fetch('/api/products'),
      ]);

      if (settingsRes.ok) {
        const data = await settingsRes.json();
        if (data.settings) {
          this.updateSettings(data.settings);
        }
      }

      if (productsRes.ok) {
        const data = await productsRes.json();
        if (data.products && Array.isArray(data.products) && data.products.length > 0) {
          this.setProducts(data.products);
        }
      }
    } catch (err) {
      console.info('Using fallback products and settings data:', err);
    }
  }

  public async fetchAdminData(): Promise<void> {
    if (!this.state.adminToken) return;

    const headers = {
      'Authorization': `Bearer ${this.state.adminToken}`,
      'Content-Type': 'application/json',
    };

    try {
      const [analyticsRes, productsRes, ordersRes, settingsRes] = await Promise.all([
        fetch('/api/analytics', { headers }),
        fetch('/api/products?all=true', { headers }),
        fetch('/api/orders?status=all', { headers }),
        fetch('/api/settings', { headers }),
      ]);

      if (analyticsRes.ok) {
        const aData = await analyticsRes.json();
        if (aData.analytics) this.setAnalytics(aData.analytics);
      }

      if (productsRes.ok) {
        const pData = await productsRes.json();
        if (pData.products) this.setProducts(pData.products);
      }

      if (ordersRes.ok) {
        const oData = await ordersRes.json();
        if (oData.orders) this.setOrders(oData.orders);
      }

      if (settingsRes.ok) {
        const sData = await settingsRes.json();
        if (sData.settings) this.updateSettings(sData.settings);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    }
  }
}

export const store = new StateStore();
