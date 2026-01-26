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
        const error = new Error(data.error?.message || 'Request failed');
        error.response = { status: response.status, data };
        throw error;
      }

      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      if (!error.response) {
        error.response = { status: 0, data: {} };
      }
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

  async getAllTickets() {
    return this.request('/tickets/all/');
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

  async createPaymentIntent(items, idempotencyKey, paymentMethod = 'card') {
    return this.request('/payments/checkout/create-intent/', {
      method: 'POST',
      body: JSON.stringify({ 
        items, 
        idempotency_key: idempotencyKey,
        payment_method: paymentMethod
      }),
    });
  }

  async confirmPayment(orderId, paymentIntentId) {
    return this.request('/payments/checkout/confirm/', {
      method: 'POST',
      body: JSON.stringify({ 
        order_id: orderId,
        payment_intent_id: paymentIntentId
      }),
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

  // ==================== PDF DOWNLOADS ====================

  getTicketPDFUrl(ticketId) {
    return `${this.baseUrl}/tickets/${ticketId}/pdf/`;
  }

  getOrderTicketsPDFUrl(orderId) {
    return `${this.baseUrl}/tickets/order/${orderId}/pdf/`;
  }

  async downloadTicketPDF(ticketId) {
    const token = this.getToken();
    const response = await fetch(`${this.baseUrl}/tickets/${ticketId}/pdf/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Failed to download PDF');
    return response.blob();
  }

  async downloadOrderTicketsPDF(orderId) {
    const token = this.getToken();
    const response = await fetch(`${this.baseUrl}/tickets/order/${orderId}/pdf/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Failed to download PDF');
    return response.blob();
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

  async submitBazaarVendor(data) {
    return this.request('/vendors/bazaar-registration/', {
      method: 'POST',
      body: JSON.stringify(data),
      skipAuth: true
    });
  }

  async submitFoodVendor(data) {
    return this.request('/vendors/food-registration/', {
      method: 'POST',
      body: JSON.stringify(data),
      skipAuth: true
    });
  }

  async getBazaarRegistrations() {
    return this.request('/vendors/admin/bazaar-registrations/');
  }

  async getFoodRegistrations() {
    return this.request('/vendors/admin/food-registrations/');
  }

  // ==================== ADMIN ORDERS ====================

  async getAdminOrders() {
    return this.request('/tickets/staff/orders/');
  }

  async getAdminOrderDetail(orderId) {
    return this.request(`/tickets/staff/orders/${orderId}/`);
  }

  async processRefund(orderId, reason) {
    return this.request('/tickets/staff/refund/', {
      method: 'POST',
      body: JSON.stringify({ order_id: orderId, reason })
    });
  }

  async issueCompTicket(email, ticketTypeId, quantity, reason) {
    return this.request('/tickets/staff/comp/', {
      method: 'POST',
      body: JSON.stringify({ 
        email, 
        ticket_type_id: ticketTypeId, 
        quantity,
        reason 
      })
    });
  }

  // ==================== SCANNING ====================

  async quickScan(qrData) {
    return this.request('/scan/quick/', {
      method: 'POST',
      body: JSON.stringify({ qr_data: qrData }),
      skipAuth: true
    });
  }

  async validateScan(qrData) {
    return this.request('/scan/validate/', {
      method: 'POST',
      body: JSON.stringify({ qr_data: qrData })
    });
  }

  async commitScan(ticketId) {
    return this.request('/scan/commit/', {
      method: 'POST',
      body: JSON.stringify({ ticket_id: ticketId })
    });
  }

  async getScanLogs(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/scanning/logs/${queryString ? '?' + queryString : ''}`);
  }

  async getScanStats() {
    return this.request('/scanning/stats/');
  }
}

// Export singleton instance
const api = new ApiService();
export default api;
