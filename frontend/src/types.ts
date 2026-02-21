export interface Dish {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  category: string;
  isAvailable: boolean;
}

export interface Offer {
  id: string;
  title: string;
  description: string | null;
  discountType: "percentage" | "fixed";
  discountValue: number;
  applicableDishIds: string[];
  isActive: boolean;
}

export interface Banner {
  id: string;
  imageUrl: string;
  link: string | null;
  position: number;
  isActive: boolean;
}

export interface OrderItem {
  dishId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  tableId: string;
  table?: { tableNumber: number };
  items: OrderItem[];
  status: "pending" | "confirmed" | "preparing" | "completed";
  createdAt: string;
  payments?: { amount: number; paidAt: string; method: string }[];
}

export interface CafeTable {
  id: string;
  tableNumber: number;
  status: string;
  orders?: Order[];
}
