export interface Product {
  id: string;
  name: string;
  priceKES: number;
  photo: string;
  description: string;
  tag?: string;
  category?: string;
  isActive?: boolean;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface DropdownOption {
  value: string;
  label: string;
}

export interface SiteSettings {
  shop_name: string;
  tagline: string;
  whatsapp_number: string;
  hero_badge: string;
  custom_price_kes: string;
}

export interface OrderFormState {
  productId: string | null;
  productName: string | null;
  priceKES: number;
  customImageUrl: string | null;
  department: string;
  busRoute: string;
  pickupSpot: string;
  quantity: number;
  buyerName: string;
  note: string;
}

export interface OrderRecord {
  id: string;
  productId: string | null;
  productName: string;
  priceKES: number;
  quantity: number;
  customImageUrl: string | null;
  department: string;
  busRoute: string;
  pickupSpot: string;
  buyerName: string;
  note: string | null;
  status: 'pending' | 'in_progress' | 'ready' | 'delivered' | 'cancelled';
  createdAt: string;
}

export interface AnalyticsData {
  totalRevenueKES: number;
  totalOrders: number;
  totalItemsSold: number;
  weeklyRevenueKES: number;
  weeklyOrders: number;
  weeklyItemsSold: number;
  topProducts: Array<{
    productName: string;
    orderCount: number;
    totalQuantity: number;
    totalSalesKES: number;
  }>;
  topRoutes: Array<{
    busRoute: string;
    orderCount: number;
    totalQuantity: number;
  }>;
  topDepartments: Array<{
    department: string;
    orderCount: number;
  }>;
  customRatio: Array<{
    orderType: string;
    count: number;
    revenue: number;
  }>;
  statusBreakdown: Array<{
    status: string;
    count: number;
  }>;
}
