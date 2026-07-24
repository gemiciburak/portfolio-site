"use client";

import { BROWSER_API_URL } from "./api";
import type {
  ApiEnvelope,
  ApiErrorEnvelope,
  AuthResult,
  Message,
  PaginationMeta,
  Profile,
  Project,
  SkillCategory,
  TokenPair,
} from "@/types/api";

/**
 * Token'lar sessionStorage'da tutulur: sekme kapanınca oturum biter ve
 * localStorage'ın aksine diğer sekmelere taşınmaz.
 *
 * Not: XSS'e karşı en sağlam seçenek httpOnly cookie'dir. Bu panel tek
 * kullanıcılı ve API ayrı origin'de olduğu için burada Bearer token tercih
 * edildi; kayıtlı token'ın ömrü 15 dakikayla sınırlı.
 */
const ACCESS_KEY = "portfolio.accessToken";
const REFRESH_KEY = "portfolio.refreshToken";

export const tokenStore = {
  get access(): string | null {
    return typeof window === "undefined" ? null : sessionStorage.getItem(ACCESS_KEY);
  },
  get refresh(): string | null {
    return typeof window === "undefined" ? null : sessionStorage.getItem(REFRESH_KEY);
  },
  save(tokens: TokenPair) {
    sessionStorage.setItem(ACCESS_KEY, tokens.accessToken);
    sessionStorage.setItem(REFRESH_KEY, tokens.refreshToken);
  },
  clear() {
    sessionStorage.removeItem(ACCESS_KEY);
    sessionStorage.removeItem(REFRESH_KEY);
  },
};

export class AdminApiError extends Error {
  constructor(
    readonly statusCode: number,
    message: string,
    readonly fieldErrors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "AdminApiError";
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  /** Sonsuz döngüyü önler: yenileme sonrası tek deneme. */
  retryOnUnauthorized?: boolean;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<ApiEnvelope<T>> {
  const { method = "GET", body, retryOnUnauthorized = true } = options;
  const accessToken = tokenStore.access;

  const response = await fetch(`${BROWSER_API_URL}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  // Access token süresi dolduysa bir kez yenile, isteği tekrarla.
  if (response.status === 401 && retryOnUnauthorized && tokenStore.refresh) {
    const refreshed = await tryRefresh();

    if (refreshed) {
      return request<T>(path, { ...options, retryOnUnauthorized: false });
    }
  }

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const error = payload as ApiErrorEnvelope | null;
    throw new AdminApiError(
      response.status,
      error?.message ?? `İstek başarısız (${response.status})`,
      error?.errors,
    );
  }

  return payload as ApiEnvelope<T>;
}

async function tryRefresh(): Promise<boolean> {
  const refreshToken = tokenStore.refresh;
  if (!refreshToken) return false;

  const response = await fetch(`${BROWSER_API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    tokenStore.clear();
    return false;
  }

  const payload = (await response.json()) as ApiEnvelope<TokenPair>;
  tokenStore.save(payload.data);
  return true;
}

export const adminApi = {
  async login(email: string, password: string): Promise<AuthResult> {
    const response = await fetch(`${BROWSER_API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const payload: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      const error = payload as ApiErrorEnvelope | null;
      throw new AdminApiError(response.status, error?.message ?? "Giriş başarısız");
    }

    const result = (payload as ApiEnvelope<AuthResult>).data;
    tokenStore.save(result.tokens);
    return result;
  },

  async logout(): Promise<void> {
    try {
      await request("/auth/logout", {
        method: "POST",
        body: { refreshToken: tokenStore.refresh },
      });
    } finally {
      // API çağrısı düşse bile yerel oturum kapanmalı.
      tokenStore.clear();
    }
  },

  me: () => request<{ id: string; email: string; name: string }>("/auth/me").then((r) => r.data),

  getProfile: () => request<Profile>("/profile").then((r) => r.data),
  updateProfile: (patch: Partial<Profile>) =>
    request<Profile>("/profile", { method: "PATCH", body: patch }).then((r) => r.data),

  listProjects: () => request<Project[]>("/projects/all").then((r) => r.data),
  createProject: (data: Partial<Project>) =>
    request<Project>("/projects", { method: "POST", body: data }).then((r) => r.data),
  updateProject: (id: string, data: Partial<Project>) =>
    request<Project>(`/projects/${id}`, { method: "PATCH", body: data }).then((r) => r.data),
  deleteProject: (id: string) => request(`/projects/${id}`, { method: "DELETE" }),

  listSkills: () => request<SkillCategory[]>("/skills").then((r) => r.data),

  listMessages: (page = 1): Promise<{ items: Message[]; meta?: PaginationMeta }> =>
    request<Message[]>(`/messages?page=${page}&limit=20`).then((r) => ({
      items: r.data,
      meta: r.meta,
    })),
  markMessageRead: (id: string, isRead: boolean) =>
    request<Message>(`/messages/${id}/read`, { method: "PATCH", body: { isRead } }).then(
      (r) => r.data,
    ),
  deleteMessage: (id: string) => request(`/messages/${id}`, { method: "DELETE" }),
};
