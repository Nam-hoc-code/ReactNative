export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  img: string;
  categoryId: number;
  categoryName?: string;
  description?: string;
  sold?: number;
}

export interface User {
  id: number;
  username: string;
  password?: string;
  email: string;
  fullname: string;
  phone?: string;
  address?: string;
  role?: 'Admin' | 'User';
}

export interface CartItem {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
  productName?: string;
  price?: number;
  img?: string;
}

export interface Order {
  id: number;
  userId: number;
  orderDate: string;
  totalAmount: number;
  status: 'Pending' | 'Confirmed' | 'Shipping' | 'Completed' | 'Cancelled';
  completedAt?: string;
  phone: string;
  address: string;
  note?: string;
  customerName?: string;
  customerEmail?: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface Coupon {
  id: number;
  code: string;
  discount: number;
  type: 'percent' | 'fixed';
  minOrder: number;
  expiresAt: string;
  active: boolean;
  condition: 'none' | 'new_user';
}
