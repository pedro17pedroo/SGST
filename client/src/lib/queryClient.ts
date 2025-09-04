import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Global reference to auth handler - will be set by AuthProvider
let globalAuthHandler: (() => void) | null = null;

// Function to set the auth handler from AuthProvider
export function setAuthHandler(handler: () => void) {
  globalAuthHandler = handler;
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

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    // Handle 401 Unauthorized specifically
    if (res.status === 401) {
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
  
  const res = await fetch(fullUrl, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
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
    
    const res = await fetch(fullUrl, {
      credentials: "include",
    });

    if (res.status === 401) {
      if (unauthorizedBehavior === "returnNull") {
        return null;
      } else {
        // Handle 401 error globally
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
