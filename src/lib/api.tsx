import type { DashboardData } from "../components/pages/agent_dashboard/types";
import { getApiBaseUrl, isMockDataEnabled } from "../config";
import type { HealthResponse } from "../api/system/types";

export function getDemoData(): DashboardData {
  return {
    spiderStats: { pages: 47, requests: 856 },
    vulnerabilities: [
      {
        id: "1",
        title: "SQL Injection",
        severity: "high",
        location: "/api/products?id={param}",
        steps: [
          { description: "Identified parameter 'id' in GET request" },
          { description: "Tested with payload: 1' OR '1'='1" },
          { description: "Database error message exposed" },
          { description: "Successfully extracted table names" },
          { description: "Confirmed blind SQL injection vector" }
        ]
      },
      {
        id: "2",
        title: "Broken Authentication",
        severity: "high",
        location: "/api/auth (POST)",
        steps: [
          { description: "Analyzed authentication endpoint" },
          { description: "No rate limiting detected" },
          { description: "Weak password policy identified" },
          { description: "Potential credential stuffing risk" }
        ]
      },
      {
        id: "3",
        title: "XSS in Search Field",
        severity: "medium",
        location: "/search?q={param}",
        steps: [
          { description: "Reflected input found in HTML" },
          { description: "Output not sanitized" },
          { description: "Injected payload executed: <script>alert(1)</script>" }
        ]
      },
      {
        id: "4",
        title: "Sensitive Data Exposure",
        severity: "low",
        location: "/api/user (GET)",
        steps: [
          { description: "Unnecessary fields exposed in response" },
          { description: "Consider minimizing PII in payloads" }
        ]
      }
    ],
    logEntries: [
      { id: "l1", time: "10:15:11", agent: "spider", message: "Starting crawl on root /" },
      { id: "l2", time: "10:15:15", agent: "spider", message: "Discovered endpoint /login" },
      { id: "l3", time: "10:15:22", agent: "scanner", message: "Initiated SQL injection tests" }
    ]
  };
}

let lastEtag: string | undefined;
let lastModified: string | undefined;
let cached: DashboardData | undefined;

export async function getDashboardData(signal: AbortSignal): Promise<DashboardData> {
  const headers: Record<string, string> = {};
  if (lastEtag) headers["If-None-Match"] = lastEtag;
  if (lastModified) headers["If-Modified-Since"] = lastModified;

  const res = await fetch(`${getApiBaseUrl()}/api/dashboard`, { headers, signal });

  if (res.status === 304 && cached) {
    return cached;
  }
  if (!res.ok) {
    throw new Error(`Failed to fetch dashboard: ${res.status}`);
  }

  const etag = res.headers.get("ETag") ?? undefined;
  const modified = res.headers.get("Last-Modified") ?? undefined;
  const json = (await res.json()) as DashboardData;

  lastEtag = etag;
  lastModified = modified;
  cached = json;
  return json;
}

export async function initApi(signal?: AbortSignal): Promise<void> {
  if (isMockDataEnabled()) {
    return;
  }
  const res = await fetch(`${getApiBaseUrl()}/health`, { signal, credentials: "include" });
  if (!res.ok) {
    throw new Error(`Health check failed (${res.status})`);
  }
  const json = (await res.json()) as HealthResponse;
  if (json?.status !== "healthy") {
    throw new Error("Health check returned unhealthy status");
  }
}
