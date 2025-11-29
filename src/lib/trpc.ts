import { createTRPCClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import type { AppRouter } from "skibidoo-core/trpc";

const API_URL = import.meta.env.PUBLIC_API_URL || "http://localhost:3000";

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("admin_token");
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${API_URL}/trpc`,
      transformer: superjson,
      headers() {
        const token = getAuthToken();
        return token ? { Authorization: `Bearer ${token}` } : {};
      },
    }),
  ],
});

// Helper for API calls with error handling
export async function apiCall<T>(
  fn: () => Promise<T>,
  onError?: (error: Error) => void
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    if (onError) {
      onError(err);
    } else {
      console.error("API Error:", err);
    }
    return null;
  }
}
