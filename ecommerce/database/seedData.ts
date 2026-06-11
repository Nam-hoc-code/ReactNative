import { Category, Product, User, Coupon } from './types';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 1, name: 'Điện thoại' },
  { id: 2, name: 'Laptop' },
  { id: 3, name: 'Phụ kiện' },
];

export const INITIAL_PRODUCTS: Product[] = [
  { id: 1, name: 'iPhone 17e', price: 24990000, img: 'iphone_17e_pink_1.jpg', categoryId: 1, description: 'Chip A19, màn hình 6.1" OLED, camera 48MP, pin siêu bền.', sold: 128 },
  { id: 2, name: 'Samsung Galaxy S26 Ultra', price: 32990000, img: 'samsung-galaxy-s26-ultra-1.jpg', categoryId: 1, description: 'Snapdragon 9 Gen 4, màn hình 6.9" Dynamic AMOLED, camera 250MP, bút S Pen.', sold: 95 },
  { id: 3, name: 'MacBook Air 2025', price: 28990000, img: 'macbook_13_17.jpg', categoryId: 2, description: 'Apple M4, RAM 16GB, SSD 512GB, màn hình 13.6" Liquid Retina, thiết kế siêu mỏng.', sold: 67 },
  { id: 4, name: 'AirPods 4', price: 4990000, img: 'apple-airpods-4-thumb.jpg', categoryId: 3, description: 'Chống ồn chủ động, chip H3, âm thanh không gian, thời lượng pin 7h.', sold: 312 },
  { id: 5, name: 'iPhone Air', price: 35990000, img: 'iphone_air-3_2.jpg', categoryId: 1, description: 'Siêu mỏng nhẹ, chip A19 Pro, màn hình 6.7" OLED, titan.', sold: 44 },
  { id: 6, name: 'Nokia 6300', price: 890000, img: 'Nokia_6300_(1).jpg', categoryId: 1, description: 'Điện thoại cổ điển, pin trâu, bền bỉ, hỗ trợ 4G.', sold: 203 },
  { id: 7, name: 'Nubia Neo 5G', price: 6990000, img: 'dien-thoai-nubia-neo-5-5g-den.jpg', categoryId: 1, description: '5G giá rẻ, chip Dimensity, màn hình 120Hz, pin 5000mAh.', sold: 156 },
  { id: 8, name: 'DJI Osmo Pocket 3', price: 11990000, img: 'may-quay-chong-rung-dji-osmo-pocket-3-advanced-4k_1.jpg', categoryId: 3, description: 'Quay phim 4K, chống rung 3 trục, gimbal thông minh.', sold: 78 },
  { id: 9, name: 'UGREEN USB-C Hub 7in1', price: 690000, img: 'hub-chuyen-doi-ugreen-usb-c-to-usb-a-2-0-usb-a-3-0-hdmi-pd-ho-tro-4k-15495.jpg', categoryId: 3, description: 'HDMI 4K, USB 3.0, PD 100W, đọc thẻ nhớ, tương thích MacBook.', sold: 521 },
];

export const INITIAL_USERS: User[] = [
  { id: 1, username: 'admin', password: 'admin123', email: 'admin@example.com', fullname: 'Admin System', phone: '0901234567', address: '123 Nguyễn Huệ, Q.1, TP.HCM', role: 'Admin' },
  { id: 2, username: 'user', password: 'user123', email: 'user@example.com', fullname: 'Regular User', phone: '0912345678', address: '456 Lê Lợi, Q.3, TP.HCM', role: 'User' },
];

const nextYear = new Date(); nextYear.setFullYear(nextYear.getFullYear() + 1);

export const INITIAL_COUPONS: Coupon[] = [
  { id: 1, code: 'SALE10', discount: 10, type: 'percent', minOrder: 50000, expiresAt: nextYear.toISOString(), active: true, condition: 'none' },
  { id: 2, code: 'GIAM50K', discount: 50000, type: 'fixed', minOrder: 200000, expiresAt: nextYear.toISOString(), active: true, condition: 'none' },
  { id: 3, code: 'WELCOME', discount: 15, type: 'percent', minOrder: 0, expiresAt: nextYear.toISOString(), active: true, condition: 'new_user' },
];
