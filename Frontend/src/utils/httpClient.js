const API_BASE_URL = 'http://localhost:5001';

class HttpClient {
  constructor() {
    this.accessToken = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
  }

  setTokens(accessToken, refreshToken) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  async refreshAccessToken() {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: this.refreshToken
        })
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      this.setTokens(data.accessToken, data.refreshToken);
      return data.accessToken;
    } catch (error) {
      this.clearTokens();
      throw error;
    }
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Add authorization header if token exists
    if (this.accessToken) {
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${this.accessToken}`
      };
    }

    try {
      const response = await fetch(url, options);
      
      // Handle 401 Unauthorized
      if (response.status === 401) {
        try {
          const newAccessToken = await this.refreshAccessToken();
          // Retry the original request with new token
          options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${newAccessToken}`
          };
          return await fetch(url, options);
        } catch (refreshError) {
          // Redirect to login if refresh fails
          window.location.href = '/auth/login';
          throw refreshError;
        }
      }

      return response;
    } catch (error) {
      console.error('HTTP request failed:', error);
      throw error;
    }
  }

  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

export const httpClient = new HttpClient(); 