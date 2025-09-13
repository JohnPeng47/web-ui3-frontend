import { getApiBaseUrl } from "../config";
import type {
  EngagementCreate,
  EngagementOut,
  EngagementPageDataOut,
  PageDataMergeRequest
} from "./engagement/types";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

function ensureAuthCookiesFromLocalStorage() {
  try {
    const raw = localStorage.getItem("authCookies");
    if (!raw) return;
    const cookies = JSON.parse(raw) as Record<string, string>;
    Object.entries(cookies).forEach(([key, value]) => {
      if (typeof document !== "undefined") {
        document.cookie = `${key}=${value}; path=/`;
      }
    });
  } catch {
    // ignore malformed localStorage
  }
}

export class HTTPProvider {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = getApiBaseUrl().replace(/\/$/, "");
    console.log("baseUrl:", this.baseUrl);
    ensureAuthCookiesFromLocalStorage();
  }

  private async request<TResponse>(
    path: string,
    options: { method?: HttpMethod; body?: unknown; signal?: AbortSignal } = {}
  ): Promise<TResponse> {
    ensureAuthCookiesFromLocalStorage();
    const { method = "GET", body, signal } = options;
    const headers: Record<string, string> = { "Content-Type": "application/json" };

    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers,
      credentials: "include",
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal
    });

    if (!res.ok) {
      let detail: string | undefined;
      try {
        const errorJson = (await res.json()) as { detail?: string };
        detail = errorJson?.detail;
      } catch {
        // ignore
      }
      throw new Error(detail || `HTTP ${res.status}`);
    }
    if (res.status === 204) return undefined as unknown as TResponse;
    return (await res.json()) as TResponse;
  }

  // Engagement API
  async createEngagement(payload: EngagementCreate, signal?: AbortSignal): Promise<EngagementOut> {
    return this.request<EngagementOut>(`/engagement/`, { method: "POST", body: payload, signal });
  }

  async getEngagement(engagementId: string, signal?: AbortSignal): Promise<EngagementOut> {
    return this.request<EngagementOut>(`/engagement/${encodeURIComponent(engagementId)}`, {
      method: "GET",
      signal
    });
  }

  async mergePageData(
    engagementId: string,
    payload: PageDataMergeRequest,
    signal?: AbortSignal
  ): Promise<EngagementPageDataOut> {
    return this.request<EngagementPageDataOut>(
      `/engagement/${encodeURIComponent(engagementId)}/page-data`,
      { method: "POST", body: payload, signal }
    );
  }
}

export const http = new HTTPProvider();


