const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

interface FetchOptions extends RequestInit {
  data?: any;
}

export const api = {
  request: async (endpoint: string, options: FetchOptions = {}) => {
    const url = `${BASE_URL}${endpoint}`;
    
    const headers = new Headers(options.headers || {});
    
    // Auto-attach content-type for JSON payloads
    if (options.data && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    // Auto-attach authorization token
    const token = localStorage.getItem('token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    if (options.data) {
      config.body = JSON.stringify(options.data);
    }

    const response = await fetch(url, config);
    
    let json;
    try {
      json = await response.json();
    } catch (e) {
      json = null;
    }

    if (!response.ok) {
      const error = new Error(json?.message || response.statusText);
      (error as any).status = response.status;
      (error as any).data = json;
      throw error;
    }

    return json;
  },

  get: (endpoint: string, options?: FetchOptions) => api.request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint: string, data?: any, options?: FetchOptions) => api.request(endpoint, { ...options, method: 'POST', data }),
  patch: (endpoint: string, data?: any, options?: FetchOptions) => api.request(endpoint, { ...options, method: 'PATCH', data }),
  delete: (endpoint: string, options?: FetchOptions) => api.request(endpoint, { ...options, method: 'DELETE' }),
};
