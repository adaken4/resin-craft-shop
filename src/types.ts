export interface Product {
  id: string;
  name: string;
  priceKES: number;
  photo: string;
  description: string;
  tag?: string;
}

export interface DropdownOption {
  value: string;
  label: string;
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
