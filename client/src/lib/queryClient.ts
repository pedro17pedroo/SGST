import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Global reference to auth handler - will be set by AuthProvider
let globalAuthHandler: (() => void) | null = null;

// Function to set the auth handler from AuthProvider
export function setAuthHandler(handler: () => void) {
  globalAuthHandler = handler;
}

// Get JWT token from localStorage
function getAuthToken(): string | null {
  const userData = localStorage.getItem('sgst-user');
  if (userData) {
    try {
      const parsed = JSON.parse(userData);
      return parsed.accessToken || null;
    } catch {
      return null;
    }
  }
  return null;
}

// Get refresh token from localStorage
function getRefreshToken(): string | null {
  const userData = localStorage.getItem('sgst-user');
  if (userData) {
    try {
      const parsed = JSON.parse(userData);
      return parsed.refreshToken || null;
    } catch {
      return null;
    }
  }
  return null;
}

// Attempt to refresh the access token
async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return false;
  }

  try {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/api/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      const userData = localStorage.getItem('sgst-user');
      if (userData) {
        try {
          const parsed = JSON.parse(userData);
          parsed.accessToken = data.accessToken;
          parsed.refreshToken = data.refreshToken;
          localStorage.setItem('sgst-user', JSON.stringify(parsed));
          return true;
        } catch {
          return false;
        }
      }
    }
    return false;
  } catch {
    return false;
  }
}

// Handle 401 errors globally
function handle401Error() {
  if (globalAuthHandler) {
    globalAuthHandler();
  } else {
    // Fallback if auth handler not set
    localStorage.removeItem('sgst-user');
    if (window.location.pathname !== '/') {
      window.location.href = '/';
    }
  }
}

async function throwIfResNotOk(res: Response, retryCallback?: () => Promise<Response>) {
  if (!res.ok) {
    // Handle 401 Unauthorized specifically
    if (res.status === 401 && retryCallback) {
      // Try to refresh token and retry the request
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        const retryRes = await retryCallback();
        if (retryRes.ok) {
          return; // Success after retry
        }
        // If retry also fails, continue with error handling
        res = retryRes;
      }
      
      // If refresh failed or retry failed, handle 401
      if (res.status === 401) {
        handle401Error();
      }
    } else if (res.status === 401) {
      handle401Error();
    }
    
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Get the API base URL from environment variables or default to backend port
const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    // Client-side: check for environment variable or use backend port
    return import.meta.env.VITE_API_URL || 'http://localhost:5000';
  }
  // Server-side: fallback to backend port
  return 'http://localhost:5000';
};

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const baseUrl = getApiBaseUrl();
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
  
  const makeRequest = async (): Promise<Response> => {
    const headers: Record<string, string> = {};
    
    if (data) {
      headers['Content-Type'] = 'application/json';
    }
    
    // Add Authorization header with JWT token
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return await fetch(fullUrl, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
  };
  
  const res = await makeRequest();
  await throwIfResNotOk(res, makeRequest);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const baseUrl = getApiBaseUrl();
    const url = queryKey.join("/") as string;
    const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
    
    const makeRequest = async (): Promise<Response> => {
      const headers: Record<string, string> = {};
      
      // Add Authorization header with JWT token
      const token = getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      return await fetch(fullUrl, {
        headers,
      });
    };
    
    const res = await makeRequest();

    if (res.status === 401) {
      if (unauthorizedBehavior === "returnNull") {
        // Try to refresh token first
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          const retryRes = await makeRequest();
          if (retryRes.ok) {
            return await retryRes.json();
          }
        }
        return null;
      } else {
        // Try to refresh token and retry
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          const retryRes = await makeRequest();
          if (retryRes.ok) {
            return await retryRes.json();
          }
        }
        // Handle 401 error globally if refresh failed
        handle401Error();
      }
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
