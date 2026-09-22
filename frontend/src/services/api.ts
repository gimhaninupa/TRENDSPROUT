// TRENDSPROUT API Client Service
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private getHeaders(includeAuth = true): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = localStorage.getItem('ts_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}, includeAuth = true): Promise<T> {
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const headers = {
      ...this.getHeaders(includeAuth),
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || `Request failed with status ${response.status}`);
      }

      return data as T;
    } catch (error: any) {
      console.warn(`API Error [${endpoint}]:`, error.message);
      throw error;
    }
  }

  // ─── AUTH ──────────────────────────────────────────────────────────────────
  async login(emailOrUsername: string, password: string) {
    return this.request<{ status: string; data: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ emailOrUsername, password }),
    }, false);
  }

  async register(userData: { username: string; email: string; password: string; role?: string; phone?: string }) {
    return this.request<{ status: string; data: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }, false);
  }

  async getProfile() {
    return this.request<{ status: string; data: any }>('/auth/me');
  }

  // ─── PRODUCTS & CATEGORIES ─────────────────────────────────────────────────
  async getCategories() {
    return this.request<{ status: string; data: any[] }>('/categories', {}, false);
  }

  async getProducts(params?: {
    category?: string;
    search?: string;
    tag?: string;
    brand?: string;
    sort?: string;
    priceMin?: number;
    priceMax?: number;
    page?: number;
    limit?: number;
  }) {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query.append(key, String(value));
        }
      });
    }
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return this.request<{ status: string; data: any[]; total: number; pages: number }>(`/products${queryString}`, {}, false);
  }

  async getProductById(id: string) {
    return this.request<{ status: string; data: any }>(`/products/${id}`, {}, false);
  }

  // ─── CART ──────────────────────────────────────────────────────────────────
  async getCart() {
    return this.request<{ status: string; data: any }>('/cart');
  }

  async addToCart(item: { productId: string; quantity?: number; size?: string; color?: string }) {
    return this.request<{ status: string; data: any }>('/cart', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  async updateCartItem(itemId: string, quantity: number) {
    return this.request<{ status: string; data: any }>(`/cart/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  }

  async removeCartItem(itemId: string) {
    return this.request<{ status: string; data: any }>(`/cart/${itemId}`, {
      method: 'DELETE',
    });
  }

  async clearCart() {
    return this.request<{ status: string; data: any }>('/cart', {
      method: 'DELETE',
    });
  }

  // ─── ORDERS & TRACKING ────────────────────────────────────────────────────
  async createOrder(orderData: {
    items: any[];
    totalAmount: number;
    shippingAddress: any;
    paymentMethod?: string;
    paymentDetails?: any;
    paymentStatus?: string;
    clearCart?: boolean;
  }) {
    return this.request<{ status: string; data: any }>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async processPayment(paymentData: {
    orderId?: string;
    paymentMethod: string;
    cardDetails?: {
      cardNumber: string;
      cardHolder: string;
      expiry: string;
      cvv: string;
      cardBrand?: string;
    };
    slipUrl?: string;
    amount: number;
  }) {
    return this.request<{
      status: string;
      message: string;
      data: {
        transactionId: string;
        paymentStatus: string;
        paymentMethod: string;
        cardLast4?: string;
        cardBrand?: string;
        paidAt: string;
        amount: number;
        order?: any;
      };
    }>('/orders/process-payment', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    }, false);
  }

  async getMyOrders() {
    return this.request<{ status: string; data: any[] }>('/orders/my-orders');
  }

  async trackOrder(orderIdOrTrackingNumber: string) {
    return this.request<{ status: string; data: any }>(`/orders/${orderIdOrTrackingNumber}/track`, {}, false);
  }

  async getOrderById(id: string) {
    return this.request<{ status: string; data: any }>(`/orders/${id}`);
  }

  // ─── REVIEWS ───────────────────────────────────────────────────────────────
  async getProductReviews(productId: string) {
    return this.request<{ status: string; data: any[] }>(`/reviews/product/${productId}`, {}, false);
  }

  async submitReview(reviewData: { productId: string; rating: number; comment: string }) {
    return this.request<{ status: string; data: any }>('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  // ─── COUPONS ───────────────────────────────────────────────────────────────
  async getCoupons() {
    return this.request<{ status: string; data: any[] }>('/coupons', {}, false);
  }

  async applyCoupon(code: string, orderAmount: number) {
    return this.request<{ status: string; data: any }>('/coupons/apply', {
      method: 'POST',
      body: JSON.stringify({ code, orderAmount }),
    }, false);
  }

  // ─── VENDOR ────────────────────────────────────────────────────────────────
  async getVendorStats() {
    return this.request<{ status: string; data: any }>('/vendor/stats');
  }

  async getVendorProducts() {
    return this.request<{ status: string; data: any[] }>('/vendor/products');
  }

  async createVendorProduct(productData: any) {
    return this.request<{ status: string; data: any }>('/vendor/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateVendorStore(storeData: { storeName?: string; storeDescription?: string; bannerImage?: string; logoImage?: string }) {
    return this.request<{ status: string; data: any }>('/vendor/store', {
      method: 'PUT',
      body: JSON.stringify(storeData),
    });
  }

  // ─── ADMIN ─────────────────────────────────────────────────────────────────
  async getAdminMetrics() {
    return this.request<{ status: string; data: any }>('/admin/metrics');
  }

  async getVendors() {
    return this.request<{ status: string; data: any[] }>('/admin/vendors');
  }

  async verifyVendor(vendorId: string, isVerified = true) {
    return this.request<{ status: string; data: any }>(`/admin/vendors/${vendorId}/verify`, {
      method: 'PUT',
      body: JSON.stringify({ isVerified }),
    });
  }

  // ─── AI TOOLS ──────────────────────────────────────────────────────────────
  async chatWithStylist(message: string, history?: any[]) {
    return this.request<{ status: string; data: { role: string; text: string; recommendedProducts?: any[] } }>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, history }),
    }, false);
  }

  async generateDesign(prompt: string, style = 'Editorial', fabric = 'Silk', colorPalette = '') {
    return this.request<{ status: string; data: any }>('/ai/generate-design', {
      method: 'POST',
      body: JSON.stringify({ prompt, style, fabric, colorPalette }),
    }, false);
  }

  async generateVendorDescription(params: any) {
    return this.request<{ status: string; data: any }>('/ai/vendor-description', {
      method: 'POST',
      body: JSON.stringify(params),
    }, false);
  }

  async generateVendorPricing(params: any) {
    return this.request<{ status: string; data: any }>('/ai/vendor-pricing', {
      method: 'POST',
      body: JSON.stringify(params),
    }, false);
  }

  // ─── COMPUTER VISION (CV) MICROSERVICE ─────────────────────────────────────
  async removeBackground(imageBase64: string) {
    return this.request<{ status: string; message: string; imageUrl: string }>('/cv/remove-bg', {
      method: 'POST',
      body: JSON.stringify({ image_base64: imageBase64 }),
    }, false);
  }

  async generateMockup(imageBase64: string, templateType = 'tshirt') {
    return this.request<{ status: string; message: string; template: string; imageUrl: string }>('/cv/generate-mockup', {
      method: 'POST',
      body: JSON.stringify({ image_base64: imageBase64, template_type: templateType }),
    }, false);
  }

  async visualSearch(imageBase64: string, crop?: { x: number; y: number; w: number; h: number; containerW?: number; containerH?: number }) {
    return this.request<{
      status: string;
      croppedImage?: string;
      detectedCategory?: string;
      matches: Array<{
        id: string;
        name: string;
        brand: string;
        price: number;
        similarity: number;
        matchReason: string;
        image: string;
      }>;
    }>('/cv/visual-search', {
      method: 'POST',
      body: JSON.stringify({
        image_base64: imageBase64,
        crop_x: crop?.x || 0,
        crop_y: crop?.y || 0,
        crop_w: crop?.w || 0,
        crop_h: crop?.h || 0,
        container_w: crop?.containerW || 400,
        container_h: crop?.containerH || 400,
      }),
    }, false);
  }
}

export const api = new ApiClient();
export default api;
