import { buildApiUrl } from "./api";

export interface AuthResponse {
  token: string;
  userId: number;
  email: string;
}

export async function login(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const res = await fetch(buildApiUrl("/auth/login"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as any).error || "Login failed");
  }

  return (await res.json()) as AuthResponse;
}

export async function loginWithGoogle(idToken: string): Promise<AuthResponse> {
  const res = await fetch(buildApiUrl("/auth/google"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ idToken }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as any).error || "Google login failed");
  }

  return (await res.json()) as AuthResponse;
}

export async function register(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const res = await fetch(buildApiUrl("/auth/register"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as any).error || "Register failed");
  }

  return (await res.json()) as AuthResponse;
}

export function saveAuth(auth: AuthResponse) {
  localStorage.setItem("jobtracker_token", auth.token);
  localStorage.setItem("jobtracker_email", auth.email);
  localStorage.setItem("jobtracker_userId", String(auth.userId));
}

export function clearAuth() {
  localStorage.removeItem("jobtracker_token");
  localStorage.removeItem("jobtracker_email");
  localStorage.removeItem("jobtracker_userId");
}

export function getToken(): string | null {
  return localStorage.getItem("jobtracker_token");
}

export function getEmail(): string | null {
  return localStorage.getItem("jobtracker_email");
}

export async function changePassword(
  oldPassword: string,
  newPassword: string,
): Promise<void> {
  const token = getToken();
  if (!token) {
    throw new Error("No auth token");
  }

  const res = await fetch(buildApiUrl("/auth/change-password"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ oldPassword, newPassword }),
  });

  if (!res.ok) {
    if (handleUnauthorized(res.status)) {
      throw new Error("Unauthorized");
    }
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { error?: string }).error || "Failed to change password");
  }
}

export function handleUnauthorized(status: number): boolean {
  if (status === 401 || status === 403) {
    clearAuth();
    window.location.href = "/login";
    return true;
  }
  return false;
}
