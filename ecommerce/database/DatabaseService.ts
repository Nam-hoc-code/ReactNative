import { Category, Product, User, CartItem, Order, OrderItem, Coupon } from './types';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_USERS, INITIAL_COUPONS } from './seedData';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MOCK_STORAGE_KEY = '@mock_db_state';

let SQLite: any = null;
let sqliteLoaded = false;

function ensureSQLite() {
  if (sqliteLoaded) return;
  sqliteLoaded = true;
  try {
    SQLite = require('react-native-sqlite-storage');
  } catch {
    console.log('SQLite not available, using mock mode');
  }
}

class DatabaseService {
  private db: any = null;
  private useMock: boolean = true;
  private connectionPromise: Promise<boolean> | null = null;

  private mockCategories: Category[] = INITIAL_CATEGORIES.map(c => ({ ...c }));
  private mockProducts: Product[] = INITIAL_PRODUCTS.map(p => ({ ...p }));
  private mockUsers: User[] = INITIAL_USERS.map(u => ({ ...u }));
  private mockCart: CartItem[] = [];
  private mockOrders: Order[] = [];
  private mockOrderItems: OrderItem[] = [];
  private mockCoupons: Coupon[] = INITIAL_COUPONS.map(c => ({ ...c }));
  private _currentUser: User | null = null;

  constructor() {
    this.connect();
  }

  private connect(): Promise<boolean> {
    if (this.connectionPromise) return this.connectionPromise;
    this.connectionPromise = new Promise(resolve => {
      ensureSQLite();
      if (SQLite && typeof SQLite.openDatabase === 'function') {
        try {
          this.db = SQLite.openDatabase(
            { name: 'MyDatabase.db', location: 'default' },
            () => { this.useMock = false; resolve(true); },
            () => { this.useMock = true; resolve(false); }
          );
        } catch { this.useMock = true; resolve(false); }
      } else resolve(false);
    });
    return this.connectionPromise;
  }

  isUsingMock(): boolean { return this.useMock; }
  getCurrentUser(): User | null { return this._currentUser; }
  setCurrentUser(user: User | null) { this._currentUser = user; }
  logout() { this._currentUser = null; }

  async initDatabase(): Promise<boolean> {
    await this.connect();
    await this._loadPersistedState();
    if (this.useMock) return true;
    return new Promise(resolve => {
      this.db.transaction((tx: any) => {
        tx.executeSql('CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE)');
        tx.executeSql('CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, price REAL, img TEXT, categoryId INTEGER, FOREIGN KEY(categoryId) REFERENCES categories(id))');
        tx.executeSql('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password TEXT, email TEXT, fullname TEXT, role TEXT DEFAULT \'User\')');
        tx.executeSql('CREATE TABLE IF NOT EXISTS cart (id INTEGER PRIMARY KEY AUTOINCREMENT, userId INTEGER, productId INTEGER, quantity INTEGER, FOREIGN KEY(userId) REFERENCES users(id), FOREIGN KEY(productId) REFERENCES products(id))');
        tx.executeSql('CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY AUTOINCREMENT, userId INTEGER, orderDate TEXT, totalAmount REAL, address TEXT, note TEXT, status TEXT DEFAULT \'Pending\', completedAt TEXT, FOREIGN KEY(userId) REFERENCES users(id))');
        tx.executeSql('CREATE TABLE IF NOT EXISTS order_items (id INTEGER PRIMARY KEY AUTOINCREMENT, orderId INTEGER, productId INTEGER, productName TEXT, quantity INTEGER, unitPrice REAL, FOREIGN KEY(orderId) REFERENCES orders(id), FOREIGN KEY(productId) REFERENCES products(id))');

        tx.executeSql('SELECT COUNT(*) as count FROM categories', [], (_: any, r: any) => {
          if (r.rows.item(0).count === 0)
            INITIAL_CATEGORIES.forEach(c => tx.executeSql('INSERT INTO categories (name) VALUES (?)', [c.name]));
        });
        tx.executeSql('SELECT COUNT(*) as count FROM products', [], (_: any, r: any) => {
          if (r.rows.item(0).count === 0)
            INITIAL_PRODUCTS.forEach(p => tx.executeSql('INSERT INTO products (name, price, img, categoryId) VALUES (?, ?, ?, ?)', [p.name, p.price, p.img, p.categoryId]));
        });
        tx.executeSql('SELECT COUNT(*) as count FROM users', [], (_: any, r: any) => {
          if (r.rows.item(0).count === 0)
            INITIAL_USERS.forEach(u => tx.executeSql('INSERT INTO users (username, password, email, fullname, role) VALUES (?, ?, ?, ?, ?)', [u.username, u.password, u.email, u.fullname, u.role]));
        });
      }, () => resolve(false), () => resolve(true));
    });
  }

  // ===================== PERSISTENCE =====================

  private _persistKey: string = MOCK_STORAGE_KEY;

  private async _persist(): Promise<void> {
    if (!this.useMock) return;
    try {
      await AsyncStorage.setItem(this._persistKey, JSON.stringify({
        categories: this.mockCategories,
        products: this.mockProducts,
        users: this.mockUsers,
        cart: this.mockCart,
        orders: this.mockOrders,
        orderItems: this.mockOrderItems,
        coupons: this.mockCoupons,
      }));
    } catch {}
  }

  private async _loadPersistedState(): Promise<void> {
    if (!this.useMock) return;
    try {
      const raw = await AsyncStorage.getItem(this._persistKey);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved.categories) this.mockCategories = saved.categories;
      if (saved.products) this.mockProducts = saved.products;
      if (saved.users) this.mockUsers = saved.users;
      if (saved.cart) this.mockCart = saved.cart;
      if (saved.orders) this.mockOrders = saved.orders;
      if (saved.orderItems) this.mockOrderItems = saved.orderItems;
      if (saved.coupons) this.mockCoupons = saved.coupons;
    } catch {}
  }

  // ===================== AUTH =====================

  async login(username: string, password: string): Promise<User | null> {
    const u = username.trim().toLowerCase();
    const p = password.trim();
    if (this.useMock) {
      const user = this.mockUsers.find(x => x.username === u && x.password === p);
      return user ? { id: user.id, username: user.username, email: user.email, fullname: user.fullname, phone: user.phone, address: user.address, role: user.role } : null;
    }
    return new Promise(resolve => {
      this.db.transaction((tx: any) => {
        tx.executeSql('SELECT id, username, email, fullname, role FROM users WHERE username = ? AND password = ?', [u, p], (_: any, r: any) => {
          resolve(r.rows.length > 0 ? r.rows.item(0) : null);
        }, () => resolve(null));
      });
    });
  }

  async register(fullname: string, email: string, username: string, password: string, phone?: string, address?: string): Promise<User> {
    const u = username.trim().toLowerCase();
    const p = password.trim();
    const e = email.trim();
    const f = fullname.trim();
    if (u.length < 3 || u.length > 30) throw new Error('Tên đăng nhập phải từ 3-30 ký tự');
    if (p.length < 6 || p.length > 128) throw new Error('Mật khẩu phải từ 6-128 ký tự');
    if (!e.includes('@') || e.length > 254) throw new Error('Email không hợp lệ');
    if (f.length < 1 || f.length > 100) throw new Error('Họ tên phải từ 1-100 ký tự');

    if (this.useMock) {
      if (this.mockUsers.some(x => x.username === u || x.email === e))
        throw new Error('Tên tài khoản hoặc email đã tồn tại!');
      const newId = this.mockUsers.length > 0 ? Math.max(...this.mockUsers.map(x => x.id)) + 1 : 1;
      this.mockUsers.push({ id: newId, username: u, password: p, email: e, fullname: f, phone, address, role: 'User' });
      await this._persist();
      return { id: newId, username: u, email: e, fullname: f, phone, address, role: 'User' };
    }

    return new Promise((resolve, reject) => {
      this.db.transaction((tx: any) => {
        tx.executeSql('SELECT COUNT(*) as count FROM users WHERE username = ? OR email = ?', [u, e], (_: any, cr: any) => {
          if (cr.rows.item(0).count > 0) { reject(new Error('Tên tài khoản hoặc email đã tồn tại!')); return; }
          tx.executeSql('INSERT INTO users (username, password, email, fullname, phone, address, role) VALUES (?, ?, ?, ?, ?, ?, \'User\')', [u, p, e, f, phone || '', address || ''], (_: any, ir: any) => {
            resolve({ id: ir.insertId, username: u, email: e, fullname: f, phone, address, role: 'User' });
          }, (_: any, err: any) => reject(err));
        }, (_: any, err: any) => reject(err));
      });
    });
  }

  // ===================== CATEGORIES =====================

  getCategories(): Promise<Category[]> {
    return new Promise(resolve => {
      if (this.useMock) { resolve([...this.mockCategories]); return; }
      this.db.transaction((tx: any) => {
        tx.executeSql('SELECT * FROM categories ORDER BY id ASC', [], (_: any, r: any) => {
          const list: Category[] = [];
          for (let i = 0; i < r.rows.length; i++) list.push(r.rows.item(i));
          resolve(list);
        }, () => resolve([]));
      });
    });
  }

  async addCategory(name: string): Promise<boolean> {
    if (this.useMock) {
      if (this.mockCategories.some(c => c.name.toLowerCase() === name.trim().toLowerCase()))
        throw new Error('Danh mục này đã tồn tại');
      const maxId = this.mockCategories.reduce((m, c) => Math.max(m, c.id), 0);
      this.mockCategories.push({ id: maxId + 1, name: name.trim() });
      await this._persist();
      return true;
    }
    return new Promise((resolve, reject) => {
      this.db.transaction((tx: any) => {
        tx.executeSql('INSERT INTO categories (name) VALUES (?)', [name.trim()], () => resolve(true), (_: any, e: any) => reject(e));
      });
    });
  }

  async updateCategory(id: number, name: string): Promise<boolean> {
    if (!name.trim()) throw new Error('Tên danh mục không được trống');
    if (this.useMock) {
      const cat = this.mockCategories.find(c => c.id === id);
      if (!cat) throw new Error('Không tìm thấy danh mục');
      if (this.mockCategories.some(c => c.id !== id && c.name.toLowerCase() === name.trim().toLowerCase()))
        throw new Error('Tên danh mục đã tồn tại');
      cat.name = name.trim();
      await this._persist();
      return true;
    }
    return new Promise((resolve, reject) => {
      this.db.transaction((tx: any) => {
        tx.executeSql('UPDATE categories SET name = ? WHERE id = ?', [name.trim(), id], () => resolve(true), (_: any, e: any) => reject(e));
      });
    });
  }

  async deleteCategory(id: number): Promise<boolean> {
    if (this.useMock) {
      if (this.mockProducts.some(p => p.categoryId === id)) throw new Error('Không thể xóa danh mục có sản phẩm');
      this.mockCategories = this.mockCategories.filter(c => c.id !== id);
      await this._persist();
      return true;
    }
    return new Promise((resolve, reject) => {
      this.db.transaction((tx: any) => {
        tx.executeSql('SELECT COUNT(*) as count FROM products WHERE categoryId = ?', [id], (_: any, r: any) => {
          if (r.rows.item(0).count > 0) { reject(new Error('Không thể xóa danh mục có sản phẩm')); return; }
          tx.executeSql('DELETE FROM categories WHERE id = ?', [id], () => resolve(true), (_: any, e: any) => reject(e));
        });
      });
    });
  }

  // ===================== PRODUCTS =====================

  getProducts(search: string = '', categoryId?: number, maxPrice?: number, minPrice?: number): Promise<Product[]> {
    return new Promise(resolve => {
      if (this.useMock) {
        let list = this.mockProducts.map(p => {
          const cat = this.mockCategories.find(c => c.id === p.categoryId);
          return { ...p, categoryName: cat ? cat.name : 'Chưa phân loại' };
        });
        const q = search.toLowerCase().trim();
        if (q) list = list.filter(p => p.name.toLowerCase().includes(q));
        if (categoryId) list = list.filter(p => p.categoryId === categoryId);
        if (maxPrice !== undefined) list = list.filter(p => p.price <= maxPrice);
        if (minPrice !== undefined) list = list.filter(p => p.price >= minPrice);
        resolve(list); return;
      }
      this.db.transaction((tx: any) => {
        let sql = 'SELECT products.*, categories.name AS categoryName FROM products LEFT JOIN categories ON products.categoryId = categories.id';
        const params: any[] = [];
        const conds: string[] = [];
        if (search.trim()) { conds.push('products.name LIKE ?'); params.push(`%${search}%`); }
        if (categoryId) { conds.push('products.categoryId = ?'); params.push(categoryId); }
        if (maxPrice !== undefined) { conds.push('products.price <= ?'); params.push(maxPrice); }
        if (minPrice !== undefined) { conds.push('products.price >= ?'); params.push(minPrice); }
        if (conds.length > 0) sql += ' WHERE ' + conds.join(' AND ');
        sql += ' ORDER BY products.id DESC';
        tx.executeSql(sql, params, (_: any, r: any) => {
          const list: Product[] = [];
          for (let i = 0; i < r.rows.length; i++) list.push(r.rows.item(i));
          resolve(list);
        }, () => resolve([]));
      });
    });
  }

  async addProduct(name: string, price: number, img: string, categoryId: number, description?: string): Promise<boolean> {
    if (this.useMock) {
      const newId = this.mockProducts.length > 0 ? Math.max(...this.mockProducts.map(p => p.id)) + 1 : 1;
      this.mockProducts.push({ id: newId, name: name.trim(), price, img, categoryId, description, sold: 0 });
      await this._persist();
      return true;
    }
    return new Promise(resolve => {
      this.db.transaction((tx: any) => {
        tx.executeSql('INSERT INTO products (name, price, img, categoryId, description) VALUES (?, ?, ?, ?, ?)', [name.trim(), price, img, categoryId, description || ''], () => resolve(true));
      });
    });
  }

  async updateProduct(id: number, name: string, price: number, img: string, categoryId: number, description?: string): Promise<boolean> {
    if (this.useMock) {
      const idx = this.mockProducts.findIndex(p => p.id === id);
      if (idx === -1) return false;
      this.mockProducts[idx] = { ...this.mockProducts[idx], name: name.trim(), price, img, categoryId, description };
      await this._persist();
      return true;
    }
    return new Promise(resolve => {
      this.db.transaction((tx: any) => {
        tx.executeSql('UPDATE products SET name = ?, price = ?, img = ?, categoryId = ?, description = ? WHERE id = ?', [name.trim(), price, img, categoryId, description || '', id], () => resolve(true));
      });
    });
  }

  async deleteProduct(id: number): Promise<boolean> {
    if (this.useMock) { this.mockProducts = this.mockProducts.filter(p => p.id !== id); await this._persist(); return true; }
    return new Promise(resolve => {
      this.db.transaction((tx: any) => {
        tx.executeSql('DELETE FROM products WHERE id = ?', [id], () => resolve(true));
      });
    });
  }

  // ===================== CART =====================

  async addToCart(userId: number, productId: number, quantity: number): Promise<boolean> {
    if (quantity < 1) return false;
    if (this.useMock) {
      const ex = this.mockCart.find(i => i.userId === userId && i.productId === productId);
      if (ex) ex.quantity += quantity;
      else {
        const newId = this.mockCart.length > 0 ? Math.max(...this.mockCart.map(c => c.id)) + 1 : 1;
        this.mockCart.push({ id: newId, userId, productId, quantity });
      }
      await this._persist();
      return true;
    }
    return new Promise(resolve => {
      this.db.transaction((tx: any) => {
        tx.executeSql('SELECT * FROM cart WHERE userId = ? AND productId = ?', [userId, productId], (_: any, r: any) => {
          if (r.rows.length > 0) {
            const ex = r.rows.item(0);
            tx.executeSql('UPDATE cart SET quantity = ? WHERE id = ?', [ex.quantity + quantity, ex.id], () => resolve(true));
          } else {
            tx.executeSql('INSERT INTO cart (userId, productId, quantity) VALUES (?, ?, ?)', [userId, productId, quantity], () => resolve(true));
          }
        });
      });
    });
  }

  getCart(userId: number): Promise<CartItem[]> {
    return new Promise(resolve => {
      if (this.useMock) {
        const items = this.mockCart.filter(i => i.userId === userId).map(i => {
          const p = this.mockProducts.find(pr => pr.id === i.productId);
          return { ...i, productName: p?.name, price: p?.price, img: p?.img };
        });
        resolve(items); return;
      }
      this.db.transaction((tx: any) => {
        tx.executeSql('SELECT cart.*, products.name as productName, products.price, products.img FROM cart LEFT JOIN products ON cart.productId = products.id WHERE cart.userId = ?', [userId], (_: any, r: any) => {
          const list: CartItem[] = [];
          for (let i = 0; i < r.rows.length; i++) list.push(r.rows.item(i));
          resolve(list);
        }, () => resolve([]));
      });
    });
  }

  async updateCartQuantity(userId: number, productId: number, quantity: number): Promise<boolean> {
    if (quantity < 1) return false;
    if (this.useMock) {
      const item = this.mockCart.find(c => c.userId === userId && c.productId === productId);
      if (!item) return false;
      item.quantity = quantity;
      await this._persist();
      return true;
    }
    return new Promise(resolve => {
      this.db.transaction((tx: any) => {
        tx.executeSql('UPDATE cart SET quantity = ? WHERE userId = ? AND productId = ?', [quantity, userId, productId], () => resolve(true));
      });
    });
  }

  async removeFromCart(userId: number, productId: number): Promise<boolean> {
    if (this.useMock) { this.mockCart = this.mockCart.filter(i => !(i.userId === userId && i.productId === productId)); await this._persist(); return true; }
    return new Promise(resolve => {
      this.db.transaction((tx: any) => {
        tx.executeSql('DELETE FROM cart WHERE userId = ? AND productId = ?', [userId, productId], () => resolve(true));
      });
    });
  }

  async clearCart(userId: number): Promise<boolean> {
    if (this.useMock) { this.mockCart = this.mockCart.filter(i => i.userId !== userId); await this._persist(); return true; }
    return new Promise(resolve => {
      this.db.transaction((tx: any) => {
        tx.executeSql('DELETE FROM cart WHERE userId = ?', [userId], () => resolve(true));
      });
    });
  }

  async migrateGuestCart(guestId: number, userId: number): Promise<boolean> {
    const guestItems = this.mockCart.filter(i => i.userId === guestId);
    for (const item of guestItems) {
      await this.addToCart(userId, item.productId, item.quantity);
    }
    this.mockCart = this.mockCart.filter(i => i.userId !== guestId);
    await this._persist();
    return true;
  }

  // ===================== ORDERS / CHECKOUT =====================

  async checkout(userId: number, phone: string, address: string, note: string, discount: number = 0): Promise<number> {
    const cartItems = await this.getCart(userId);
    if (cartItems.length === 0) throw new Error('Giỏ hàng trống');
    const subtotal = cartItems.reduce((s, i) => s + (i.price || 0) * i.quantity, 0);
    const total = Math.max(0, subtotal - discount);
    const orderId = await this._createOrder(userId, cartItems, total, phone, address, note);
    await this.clearCart(userId);
    return orderId;
  }

  private async _createOrder(userId: number, cartItems: CartItem[], total: number, phone: string, address: string, note: string): Promise<number> {
    const date = new Date().toISOString();
    if (this.useMock) {
      const newId = this.mockOrders.length > 0 ? Math.max(...this.mockOrders.map(o => o.id)) + 1 : 1;
      this.mockOrders.push({ id: newId, userId, orderDate: date, totalAmount: total, status: 'Pending', phone, address, note });
      cartItems.forEach(item => {
        const nid = this.mockOrderItems.length > 0 ? Math.max(...this.mockOrderItems.map(oi => oi.id)) + 1 : 1;
        this.mockOrderItems.push({ id: nid, orderId: newId, productId: item.productId, productName: item.productName || '', quantity: item.quantity, unitPrice: item.price || 0 });
        const p = this.mockProducts.find(pr => pr.id === item.productId);
        if (p) p.sold = (p.sold || 0) + item.quantity;
      });
      await this._persist();
      return newId;
    }
    return new Promise(resolve => {
      this.db.transaction((tx: any) => {
        tx.executeSql('INSERT INTO orders (userId, orderDate, totalAmount, phone, address, note, status) VALUES (?, ?, ?, ?, ?, ?, \'Pending\')', [userId, date, total, phone, address, note], (_: any, r: any) => {
          const oid = r.insertId;
          cartItems.forEach((item, idx) => {
            tx.executeSql('INSERT INTO order_items (orderId, productId, productName, quantity, unitPrice) VALUES (?, ?, ?, ?, ?)', [oid, item.productId, item.productName, item.quantity, item.price], () => {
              if (idx === cartItems.length - 1) resolve(oid);
            });
          });
        });
      });
    });
  }

  async getOrders(userId: number): Promise<Order[]> {
    if (this.useMock) {
      const orders = this.mockOrders.filter(o => o.userId === userId).sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
      return orders.map(o => ({ ...o, items: this.mockOrderItems.filter(i => i.orderId === o.id) }));
    }
    const orders = await this._getOrdersFromDb('userId = ?', [userId]);
    return orders;
  }

  getAllOrders(): Promise<Order[]> {
    if (this.useMock) {
      const orders = this.mockOrders.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
      return Promise.resolve(orders.map(o => {
        const user = this.mockUsers.find(u => u.id === o.userId);
        return { ...o, customerName: user?.fullname, customerEmail: user?.email, items: this.mockOrderItems.filter(i => i.orderId === o.id) };
      }));
    }
    return this._getOrdersFromDb('1=1', []);
  }

  private _getOrdersFromDb(where: string, params: any[]): Promise<Order[]> {
    return new Promise(resolve => {
      this.db.transaction((tx: any) => {
        const sql = `SELECT orders.*, users.fullname as customerName, users.email as customerEmail FROM orders LEFT JOIN users ON orders.userId = users.id WHERE ${where} ORDER BY orders.orderDate DESC`;
        tx.executeSql(sql, params, async (_: any, r: any) => {
          const orders: Order[] = [];
          for (let i = 0; i < r.rows.length; i++) orders.push(r.rows.item(i));
          for (const o of orders) {
            o.items = await new Promise<OrderItem[]>(res2 => {
              tx.executeSql('SELECT * FROM order_items WHERE orderId = ?', [o.id], (_2: any, r2: any) => {
                const list: OrderItem[] = [];
                for (let j = 0; j < r2.rows.length; j++) list.push(r2.rows.item(j));
                res2(list);
              }, () => res2([]));
            });
          }
          resolve(orders);
        }, () => resolve([]));
      });
    });
  }

  async updateOrderStatus(orderId: number, status: string): Promise<boolean> {
    const valid = ['Pending', 'Confirmed', 'Shipping', 'Completed', 'Cancelled'];
    if (!valid.includes(status)) return false;
    const completedAt = status === 'Completed' ? new Date().toISOString() : null;
    if (this.useMock) {
      const o = this.mockOrders.find(o => o.id === orderId);
      if (!o) return false;
      o.status = status as any;
      if (completedAt) o.completedAt = completedAt;
      await this._persist();
      return true;
    }
    return new Promise(resolve => {
      this.db.transaction((tx: any) => {
        tx.executeSql('UPDATE orders SET status = ?, completedAt = ? WHERE id = ?', [status, completedAt, orderId], () => resolve(true));
      });
    });
  }

  // ===================== ADMIN: USERS =====================

  getAllUsers(): Promise<User[]> {
    return new Promise(resolve => {
      if (this.useMock) {
        resolve(this.mockUsers.map(u => ({ id: u.id, username: u.username, email: u.email, fullname: u.fullname, role: u.role })));
        return;
      }
      this.db.transaction((tx: any) => {
        tx.executeSql('SELECT id, username, email, fullname, role FROM users', [], (_: any, r: any) => {
          const list: User[] = [];
          for (let i = 0; i < r.rows.length; i++) list.push(r.rows.item(i));
          resolve(list);
        }, () => resolve([]));
      });
    });
  }

  async updateUserRole(userId: number, role: 'Admin' | 'User'): Promise<boolean> {
    if (this.useMock) {
      const u = this.mockUsers.find(x => x.id === userId);
      if (!u) return false;
      u.role = role;
      await this._persist();
      return true;
    }
    return new Promise(resolve => {
      this.db.transaction((tx: any) => {
        tx.executeSql('UPDATE users SET role = ? WHERE id = ?', [role, userId], () => resolve(true));
      });
    });
  }

  async deleteUser(userId: number, currentUserId: number): Promise<boolean> {
    if (userId === currentUserId) return false;
    if (this.useMock) { this.mockUsers = this.mockUsers.filter(u => u.id !== userId); await this._persist(); return true; }
    return new Promise(resolve => {
      this.db.transaction((tx: any) => {
        tx.executeSql('DELETE FROM users WHERE id = ?', [userId], () => resolve(true));
      });
    });
  }

  // ===================== USERS (admin) =====================

  getUsers(): Promise<User[]> {
    return Promise.resolve(this.mockUsers.map(({ password, ...u }) => u));
  }

  // ===================== PROFILE =====================

  async updateProfile(userId: number, fullname: string, email: string, phone?: string, address?: string): Promise<User> {
    if (!email.includes('@') || email.length > 254) throw new Error('Email không hợp lệ');
    if (fullname.length < 1 || fullname.length > 100) throw new Error('Họ tên phải từ 1-100 ký tự');
    if (this.useMock) {
      const u = this.mockUsers.find(x => x.id === userId);
      if (!u) throw new Error('Không tìm thấy người dùng');
      u.email = email; u.fullname = fullname;
      if (phone !== undefined) u.phone = phone;
      if (address !== undefined) u.address = address;
      await this._persist();
      return { id: u.id, username: u.username, email: u.email, fullname: u.fullname, phone: u.phone, address: u.address, role: u.role };
    }
    return new Promise((resolve, reject) => {
      this.db.transaction((tx: any) => {
        tx.executeSql('UPDATE users SET email = ?, fullname = ?, phone = ?, address = ? WHERE id = ?', [email, fullname, phone || '', address || '', userId], () => {
          tx.executeSql('SELECT id, username, email, fullname, role FROM users WHERE id = ?', [userId], (_: any, r: any) => {
            if (r.rows.length > 0) resolve(r.rows.item(0));
            else reject(new Error('Không tìm thấy người dùng'));
          }, () => reject(new Error('Lỗi truy vấn')));
        }, () => reject(new Error('Lỗi cập nhật')));
      });
    });
  }

  // ===================== COUPONS =====================

  getCoupons(): Promise<Coupon[]> {
    return Promise.resolve([...this.mockCoupons]);
  }

  async addCoupon(code: string, discount: number, type: 'percent' | 'fixed', minOrder: number, expiresAt: string, condition: 'none' | 'new_user' = 'none'): Promise<boolean> {
    if (this.mockCoupons.some(c => c.code === code)) throw new Error('Mã coupon đã tồn tại');
    const newId = this.mockCoupons.length > 0 ? Math.max(...this.mockCoupons.map(c => c.id)) + 1 : 1;
    this.mockCoupons.push({ id: newId, code: code.toUpperCase(), discount, type, minOrder, expiresAt, active: true, condition });
    await this._persist();
    return true;
  }

  async toggleCoupon(id: number): Promise<boolean> {
    const c = this.mockCoupons.find(c => c.id === id);
    if (!c) return false;
    c.active = !c.active;
    await this._persist();
    return true;
  }

  async deleteCoupon(id: number): Promise<boolean> {
    this.mockCoupons = this.mockCoupons.filter(c => c.id !== id);
    await this._persist();
    return true;
  }

  applyCoupon(code: string, total: number, userId?: number): Promise<{ code: string; discountAmount: number }> {
    const c = this.mockCoupons.find(c => c.code === code && c.active);
    if (!c) return Promise.reject(new Error('Mã không hợp lệ hoặc đã hết hạn'));
    if (new Date(c.expiresAt) < new Date()) return Promise.reject(new Error('Mã đã hết hạn'));
    if (total < c.minOrder) return Promise.reject(new Error(`Đơn tối thiểu ${c.minOrder.toLocaleString()}đ để dùng mã này`));
    if (c.condition === 'new_user' && userId) {
      const orderCount = this.mockOrders.filter(o => o.userId === userId).length;
      if (orderCount > 0) return Promise.reject(new Error('Mã này chỉ dành cho người dùng mới'));
    }
    const amount = c.type === 'percent' ? Math.round(total * c.discount / 100) : c.discount;
    return Promise.resolve({ code: c.code, discountAmount: Math.min(amount, total) });
  }

  getUserCoupons(userId: number): Promise<(Coupon & { locked?: boolean; lockReason?: string })[]> {
    const userOrderCount = this.mockOrders.filter(o => o.userId === userId).length;
    return Promise.resolve(this.mockCoupons
      .filter(c => c.active)
      .map(c => {
        if (c.condition === 'new_user' && userOrderCount > 0)
          return { ...c, locked: true, lockReason: 'Chỉ dành cho người dùng mới (chưa có đơn hàng nào)' };
        return { ...c, locked: false };
      }));
  }
}

export const dbService = new DatabaseService();
