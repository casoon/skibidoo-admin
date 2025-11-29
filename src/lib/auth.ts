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

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  admin: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

interface RefreshResponse {
  accessToken: string;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Login failed" }));
    throw new Error(error.message || "Login failed");
  }

  return response.json();
}

export async function logout(): Promise<void> {
  const token = getAuthToken();
  if (!token) return;

  await fetch(`${API_URL}/admin/auth/logout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => {});
}

export async function refreshToken(refreshToken: string): Promise<RefreshResponse> {
  const response = await fetch(`${API_URL}/admin/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    throw new Error("Token refresh failed");
  }

  return response.json();
}

export async function validateSession(): Promise<boolean> {
  const token = getAuthToken();
  if (!token) return false;

  try {
    const response = await fetch(`${API_URL}/admin/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.ok;
  } catch {
    return false;
  }
}
