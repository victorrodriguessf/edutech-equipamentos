export class ApiError extends Error {
  public status: number;
  public detalhes: any;

  constructor(message: string, status: number, detalhes?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.detalhes = detalhes;
  }
}

const API_URL = import.meta.env.VITE_API_URL;

let accessToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const setOnUnauthorized = (callback: () => void) => {
  onUnauthorized = callback;
};

export async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<any> {
  const url = `${API_URL}${endpoint}`;
  
  const headers = new Headers(options.headers);
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const config: RequestInit = {
    ...options,
    headers,
    credentials: 'include',
  };

  let response = await fetch(url, config);

  if (response.status === 401 && endpoint !== '/auth/refresh' && endpoint !== '/auth/login') {
    try {
      const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        setAccessToken(data.accessToken);
        
        const newHeaders = new Headers(options.headers);
        newHeaders.set('Authorization', `Bearer ${data.accessToken}`);
        if (!newHeaders.has('Content-Type')) {
          newHeaders.set('Content-Type', 'application/json');
        }
        
        response = await fetch(url, {
          ...options,
          headers: newHeaders,
          credentials: 'include',
        });
      } else {
        if (onUnauthorized) onUnauthorized();
      }
    } catch (err) {
      if (onUnauthorized) onUnauthorized();
    }
  }

  if (!response.ok) {
    let errorMessage = 'Ocorreu um erro inesperado';
    let detalhes;
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.erro || errorMessage;
      detalhes = errorData.detalhes;
    } catch (e) {
      // Ignore if not JSON
    }
    
    throw new ApiError(errorMessage, response.status, detalhes);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}
