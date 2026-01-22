/**
 * API Service for OC MENA Festival
 * Handles all communication with the Django backend
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

class ApiService {
  constructor() {
    this.accessToken = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
  }

  // Token management
  setTokens(access, refresh) {
    this.accessToken = access;
    this.refreshToken = refresh;
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  isAuthenticated() {
    return !!this.accessToken;
  }

  // Base request method
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.accessToken && !options.skipAuth) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle 401 - try to refresh token
      if (response.status === 401 && this.refreshToken && !options.isRetry) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          return this.request(endpoint, { ...options, isRetry: true });
        }
        this.clearTokens();
        window.location.href = '/login';
        return null;
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  async refreshAccessToken() {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: this.refreshToken }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      this.setTokens(data.access, data.refresh || this.refreshToken);
      return true;
    } catch {
      return false;
    }
  }

  // ==================== AUTH ====================
  
  async register(email, password, confirmPassword, fullName, phone = '') {
    const data = await this.request('/auth/register/', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        confirm_password: confirmPassword,
        full_name: fullName,
        phone,
      }),
      skipAuth: true,
    });

    if (data?.success) {
      this.setTokens(data.data.tokens.access, data.data.tokens.refresh);
      this.setUser(data.data.user);
    }
    return data;
  }

  async login(email, password) {
    const data = await this.request('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      skipAuth: true,
    });

    if (data?.success) {
      this.setTokens(data.data.tokens.access, data.data.tokens.refresh);
      this.setUser(data.data.user);
    }
    return data;
  }

  async logout() {
    try {
      await this.request('/auth/logout/', {
        method: 'POST',
        body: JSON.stringify({ refresh: this.refreshToken }),
      });
    } finally {
      this.clearTokens();
    }
  }

  async getProfile() {
    return this.request('/auth/me/');
  }

  async updateProfile(data) {
    return this.request('/auth/me/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // ==================== CONFIG ====================

  async getPublicConfig() {
    return this.request('/config/public/', { skipAuth: true });
  }

  async getSponsors() {
    return this.request('/config/sponsors/', { skipAuth: true });
  }

  async getSchedule(day = null, category = null) {
    let endpoint = '/config/schedule/';
    const params = new URLSearchParams();
    if (day) params.append('day', day);
    if (category) params.append('category', category);
    if (params.toString()) endpoint += `?${params}`;
    return this.request(endpoint, { skipAuth: true });
  }

  async submitContact(formData) {
    return this.request('/config/contact/', {
      method: 'POST',
      body: JSON.stringify(formData),
      skipAuth: true,
    });
  }

  // ==================== TICKETS ====================

  async getTicketTypes() {
    return this.request('/tickets/types/', { skipAuth: true });
  }

  async getMyTickets() {
    return this.request('/tickets/my/');
  }

  async getTicketDetail(ticketId) {
    return this.request(`/tickets/${ticketId}/`);
  }

  async getTicketQR(ticketId) {
    return this.request(`/tickets/${ticketId}/qr/`);
  }

  // ==================== TRANSFERS ====================

  async getMyTransfers() {
    return this.request('/tickets/transfers/');
  }

  async createTransfer(ticketId, toEmail) {
    return this.request('/tickets/transfers/create/', {
      method: 'POST',
      body: JSON.stringify({ ticket_id: ticketId, to_email: toEmail }),
    });
  }

  async cancelTransfer(transferId) {
    return this.request(`/tickets/transfers/${transferId}/cancel/`, {
      method: 'POST',
    });
  }

  async acceptTransfer(token) {
    return this.request('/tickets/transfers/accept/', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  // ==================== PAYMENTS ====================

  async createPaymentIntent(items, idempotencyKey) {
    return this.request('/payments/checkout/create-intent/', {
      method: 'POST',
      body: JSON.stringify({ items, idempotency_key: idempotencyKey }),
    });
  }

  async confirmPayment(orderId) {
    return this.request('/payments/checkout/confirm/', {
      method: 'POST',
      body: JSON.stringify({ order_id: orderId }),
    });
  }

  async checkDemoMode() {
    return this.request('/payments/checkout/demo-mode/', { skipAuth: true });
  }

  async getMyOrders() {
    return this.request('/payments/orders/');
  }

  async getOrderDetail(orderId) {
    return this.request(`/payments/orders/${orderId}/`);
  }

  // ==================== VENDORS ====================

  async getPublicVendors() {
    return this.request('/vendors/list/', { skipAuth: true });
  }

  async getVendorProfile() {
    return this.request('/vendors/profile/');
  }

  async getVendorDashboard() {
    return this.request('/vendors/dashboard/');
  }
}

// Export singleton instance
const api = new ApiService();
export default api;
