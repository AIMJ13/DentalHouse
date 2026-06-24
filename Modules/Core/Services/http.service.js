import { API_BASE_URL, APP_ROUTES } from '../../../app/app.config.js';

export class HttpService {
  getToken() {
    return sessionStorage.getItem('token');
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };

    const token = this.getToken();

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  async request(endpoint, options = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...(options.headers || {})
      }
    });

    if (response.status === 401) {
      sessionStorage.clear();
      alert('Sesión expirada. Inicie sesión nuevamente.');
      window.location.href = APP_ROUTES.login;
      throw new Error('No autorizado');
    }

    if (response.status === 204) {
      return null;
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.message || data?.Message || `Error HTTP ${response.status}`);
    }

    return data;
  }

  get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;

    return this.request(url, {
      method: 'GET'
    });
  }

  post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  }
  patch(endpoint, body = null) {
  const options = {
    method: 'PATCH'
  };

  if (body !== null) {
    options.body = JSON.stringify(body);
  }

  return this.request(endpoint, options);
}
  

  delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    });
  }
}