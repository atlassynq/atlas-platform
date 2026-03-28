const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface RequestConfig extends RequestInit {
  requiresAuth?: boolean;
}

async function request<T>(
  endpoint: string,
  config: RequestConfig = {}
): Promise<T> {
  const { requiresAuth = true, headers, ...rest } = config;

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (requiresAuth) {
    const token = localStorage.getItem('atlas_admin_token');
    if (token) {
      defaultHeaders.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...rest,
    headers: {
      ...defaultHeaders,
      ...headers,
    },
  });

  if (response.status === 401) {
    localStorage.removeItem('atlas_admin_token');
    localStorage.removeItem('atlas_admin_email');
    window.location.href = '/login';
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || error.message || `HTTP ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

async function requestFormData<T>(
  endpoint: string,
  formData: FormData,
  config: RequestConfig = {}
): Promise<T> {
  const { requiresAuth = true, headers, ...rest } = config;

  const defaultHeaders: HeadersInit = {};

  if (requiresAuth) {
    const token = localStorage.getItem('atlas_admin_token');
    if (token) {
      defaultHeaders.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...rest,
    method: rest.method || 'POST',
    body: formData,
    headers: {
      ...defaultHeaders,
      ...headers,
    },
  });

  if (response.status === 401) {
    localStorage.removeItem('atlas_admin_token');
    localStorage.removeItem('atlas_admin_email');
    window.location.href = '/login';
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || error.message || `HTTP ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export const api = {
  get: <T>(endpoint: string, config?: RequestConfig) =>
    request<T>(endpoint, { ...config, method: 'GET' }),

  post: <T>(endpoint: string, data?: unknown, config?: RequestConfig) =>
    request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: JSON.stringify(data),
    }),

  patch: <T>(endpoint: string, data?: unknown, config?: RequestConfig) =>
    request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  put: <T>(endpoint: string, data?: unknown, config?: RequestConfig) =>
    request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: <T>(endpoint: string, config?: RequestConfig) =>
    request<T>(endpoint, { ...config, method: 'DELETE' }),

  postFormData: <T>(endpoint: string, formData: FormData, config?: RequestConfig) =>
    requestFormData<T>(endpoint, formData, { ...config, method: 'POST' }),

  patchFormData: <T>(endpoint: string, formData: FormData, config?: RequestConfig) =>
    requestFormData<T>(endpoint, formData, { ...config, method: 'PATCH' }),
};
