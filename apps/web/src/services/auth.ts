const rawApiUrl = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:3000";
const baseApiUrl = rawApiUrl.replace(/\/+$/, "");
const authApiBaseUrl = baseApiUrl.endsWith("/api/v1") ? baseApiUrl : `${baseApiUrl}/api/v1`;

const SESSION_STORAGE_KEY = "telecom.auth.session";
const LAST_ACTIVITY_STORAGE_KEY = "telecom.auth.lastActivityAt";

export type AuthUser = {
  id: string;
  email: string;
  blocked: boolean;
  roles: string[];
  permissions: string[];
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer";
  expiresIn: number;
  refreshExpiresIn: number;
  user: AuthUser;
};

const parseAuthSession = (raw: string | null): AuthSession | null => {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as AuthSession;
    if (!parsed.accessToken || !parsed.refreshToken || !parsed.user?.id) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

const parseJwtExp = (token: string): number | null => {
  try {
    const [, payloadPart] = token.split(".");
    if (!payloadPart) {
      return null;
    }
    const payload = JSON.parse(base64UrlDecode(payloadPart)) as { exp?: number };
    return typeof payload.exp === "number" ? payload.exp : null;
  } catch {
    return null;
  }
};

const parseLastActivity = (): number | null => {
  const raw = window.localStorage.getItem(LAST_ACTIVITY_STORAGE_KEY);
  if (!raw) {
    return null;
  }
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
};

const base64UrlDecode = (value: string): string => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return atob(padded);
};

export const authService = {
  getSession(): AuthSession | null {
    return parseAuthSession(window.localStorage.getItem(SESSION_STORAGE_KEY));
  },

  setSession(session: AuthSession): void {
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  },

  clearSession(): void {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    window.localStorage.removeItem(LAST_ACTIVITY_STORAGE_KEY);
  },

  markActivity(atMs = Date.now()): void {
    window.localStorage.setItem(LAST_ACTIVITY_STORAGE_KEY, String(atMs));
  },

  getLastActivityAt(): number | null {
    return parseLastActivity();
  },

  isInactive(maxInactivityMs: number, nowMs = Date.now()): boolean {
    const lastActivityAt = this.getLastActivityAt();
    if (!lastActivityAt) {
      return false;
    }
    return nowMs - lastActivityAt >= maxInactivityMs;
  },

  getAccessTokenExpiresAtMs(session: AuthSession): number | null {
    const expSeconds = parseJwtExp(session.accessToken);
    return expSeconds ? expSeconds * 1000 : null;
  },

  shouldRefreshSession(bufferMs: number): boolean {
    const session = this.getSession();
    if (!session) {
      return false;
    }

    const expiresAtMs = this.getAccessTokenExpiresAtMs(session);
    if (!expiresAtMs) {
      return false;
    }

    return expiresAtMs - Date.now() <= bufferMs;
  },

  async refreshSession(): Promise<AuthSession> {
    const session = this.getSession();
    if (!session) {
      throw new Error("No session to refresh.");
    }

    const response = await fetch(`${authApiBaseUrl}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: session.refreshToken }),
    });

    if (!response.ok) {
      let message = `Session refresh failed (${response.status})`;
      try {
        const body = (await response.json()) as { detail?: string; message?: string };
        message = body.detail ?? body.message ?? message;
      } catch {
        // Ignore parse failures and keep fallback message.
      }
      throw new Error(message);
    }

    const refreshed = (await response.json()) as AuthSession;
    this.setSession(refreshed);
    return refreshed;
  },

  async logout(): Promise<void> {
    const session = this.getSession();

    if (session?.refreshToken) {
      try {
        await fetch(`${authApiBaseUrl}/auth/logout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken: session.refreshToken }),
        });
      } catch {
        // Best effort logout.
      }
    }

    this.clearSession();
  },

  async loginWithPassword(email: string, password: string): Promise<AuthSession> {
    const response = await fetch(`${authApiBaseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      let message = `Login failed (${response.status})`;
      try {
        const body = (await response.json()) as { detail?: string; message?: string };
        message = body.detail ?? body.message ?? message;
      } catch {
        // Ignore parse failures and keep fallback message.
      }
      throw new Error(message);
    }

    return (await response.json()) as AuthSession;
  },
};
