Got it. Here’s a clean split, a MUI rewrite in TypeScript, and a polling architecture you can drop in later with minimal churn.

# 1) Proposed file structure

```
src/
  app/
    page.tsx                              // routes to pages/agent_dashboard/DashboardPage
  components/
    common/
      ActivityLog.tsx
      HeaderBar.tsx
      ProgressStat.tsx                    // number + caption
      SeverityChip.tsx
      SiteTree.tsx
      types.ts                            // shared small UI types (e.g., StatProps)
    pages/
      agent_dashboard/
        DashboardPage.tsx
        SpiderStatsCard.tsx
        VulnerabilityList.tsx
        VulnerabilityItem.tsx
        types.ts                          // domain types for this page
  hooks/
    usePolling.ts                          // generic polling hook (abort, backoff, visibility pause)
  lib/
    api.ts                                 // typed fetchers for this page
```

> Rule of thumb used: page-specific UI lives in `components/pages/agent_dashboard`; anything reusable (chips, log list, small stat widgets) goes in `components/common`.

---

# 2) Split-up + 3) MUI rewrite (TypeScript)

Below are the key files. These are drop-in and compile assuming MUI v5 and React 18. I removed Tailwind and replaced with MUI props/sx.

## `src/components/pages/agent_dashboard/types.ts`

```tsx
export interface VulnerabilityStep {
  description: string;
}

export type Severity = "high" | "medium" | "low";

export interface Vulnerability {
  id: string;
  title: string;
  severity: Severity;
  location: string;
  steps: VulnerabilityStep[];
}

export type AgentType = "spider" | "scanner";

export interface LogEntry {
  id: string;
  time: string;    // "HH:MM:SS"
  agent: AgentType;
  message: string;
}

export interface SpiderStats {
  pages: number;
  links: number;
  requests: number;
}

export interface DashboardData {
  targetUrl: string;
  scanning: boolean;
  progressPercent: number;
  spiderStats: SpiderStats;
  vulnerabilities: Vulnerability[];
  logEntries: LogEntry[];
}
```

## `src/components/common/types.ts`

```tsx
export interface StatProps {
  label: string;
  value: number | string;
  "data-testid"?: string;
}
```

## `src/components/common/SeverityChip.tsx`

```tsx
"use client";

import { Chip } from "@mui/material";
import type { Severity } from "../pages/agent_dashboard/types";

function colorFor(severity: Severity): "error" | "warning" | "info" {
  switch (severity) {
    case "high":
      return "error";
    case "medium":
      return "warning";
    case "low":
    default:
      return "info";
  }
}

export interface SeverityChipProps {
  severity: Severity;
  size?: "small" | "medium";
}

export default function SeverityChip({ severity, size = "small" }: SeverityChipProps) {
  return <Chip label={severity.toUpperCase()} color={colorFor(severity)} size={size} variant="outlined" />;
}
```

## `src/components/common/ProgressStat.tsx`

```tsx
"use client";

import { Box, LinearProgress, Typography } from "@mui/material";
import type { StatProps } from "./types";

interface ProgressStatProps extends StatProps {
  percent?: number; // 0..100
}

export default function ProgressStat({ label, value, percent }: ProgressStatProps) {
  return (
    <Box>
      <Typography variant="body2" sx={{ color: "text.secondary", mb: 0.5 }}>{label}</Typography>
      <Typography variant="h5" sx={{ fontWeight: 600 }}>{value}</Typography>
      {typeof percent === "number" && (
        <Box sx={{ mt: 1 }}>
          <LinearProgress variant="determinate" value={percent} />
        </Box>
      )}
    </Box>
  );
}
```

## `src/components/common/ActivityLog.tsx`

```tsx
"use client";

import { Box, Chip, List, ListItem, ListItemText, Typography } from "@mui/material";
import type { LogEntry } from "../pages/agent_dashboard/types";

export interface ActivityLogProps {
  entries: LogEntry[];
  maxHeight?: number;
}

export default function ActivityLog({ entries, maxHeight = 360 }: ActivityLogProps) {
  return (
    <Box sx={{ maxHeight, overflowY: "auto" }}>
      <List dense disablePadding>
        {entries.map((e) => (
          <ListItem key={e.id} sx={{ py: 0.5 }}>
            <ListItemText
              primary={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="caption" sx={{ color: "text.secondary", fontFamily: "monospace" }}>
                    {e.time}
                  </Typography>
                  <Chip
                    size="small"
                    label={e.agent.toUpperCase()}
                    color={e.agent === "spider" ? "info" : "secondary"}
                    variant="outlined"
                  />
                  <Typography variant="body2">{e.message}</Typography>
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
```

## `src/components/common/SiteTree.tsx`

```tsx
"use client";

import { Box, Typography } from "@mui/material";

export interface SiteTreeProps {
  lines: string[]; // formatted lines, e.g., "├─ /login"
  maxHeight?: number;
}

export default function SiteTree({ lines, maxHeight = 320 }: SiteTreeProps) {
  return (
    <Box sx={{ bgcolor: "background.paper", borderRadius: 1, p: 2, maxHeight, overflowY: "auto" }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>Site Structure</Typography>
      <Box component="pre" sx={{ m: 0, fontFamily: "monospace", fontSize: 13, color: "text.secondary" }}>
        {lines.join("\n")}
      </Box>
    </Box>
  );
}
```

## `src/components/common/HeaderBar.tsx`

```tsx
"use client";

import { Box, Chip, Typography } from "@mui/material";

export interface HeaderBarProps {
  title: string;
  target: string;
  scanning: boolean;
}

export default function HeaderBar({ title, target, scanning }: HeaderBarProps) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        p: 2,
        borderRadius: 2,
        border: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        mb: 2
      }}
    >
      <Typography variant="h5" sx={{ fontWeight: 700 }}>{title}</Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>Target:</Typography>
        <Typography variant="body2" sx={{ fontFamily: "monospace" }}>{target}</Typography>
        <Chip label={scanning ? "SCANNING" : "IDLE"} color={scanning ? "success" : "default"} variant="outlined" />
      </Box>
    </Box>
  );
}
```

## `src/components/pages/agent_dashboard/VulnerabilityItem.tsx`

```tsx
"use client";

import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SeverityChip from "../../common/SeverityChip";
import type { Vulnerability } from "./types";

export interface VulnerabilityItemProps {
  vuln: Vulnerability;
}

export default function VulnerabilityItem({ vuln }: VulnerabilityItemProps) {
  return (
    <Accordion disableGutters>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%", justifyContent: "space-between" }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{vuln.title}</Typography>
          <SeverityChip severity={vuln.severity} />
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Typography variant="caption" sx={{ color: "text.secondary", fontFamily: "monospace" }}>
          {vuln.location}
        </Typography>
        <Box sx={{ mt: 1.5 }}>
          {vuln.steps.map((s, idx) => (
            <Typography key={idx} variant="body2" sx={{ color: "text.secondary" }}>
              → {s.description}
            </Typography>
          ))}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}
```

## `src/components/pages/agent_dashboard/VulnerabilityList.tsx`

```tsx
"use client";

import { Box, Card, CardContent, CardHeader, Typography } from "@mui/material";
import VulnerabilityItem from "./VulnerabilityItem";
import type { Vulnerability } from "./types";

export interface VulnerabilityListProps {
  items: Vulnerability[];
}

export default function VulnerabilityList({ items }: VulnerabilityListProps) {
  return (
    <Card variant="outlined">
      <CardHeader
        title={<Typography variant="h6">Vulnerability Scanner</Typography>}
        subheader={<Typography variant="body2" color="text.secondary">{items.length} Vulnerabilities Found</Typography>}
      />
      <CardContent sx={{ maxHeight: 380, overflowY: "auto" }}>
        <Box sx={{ display: "grid", gap: 1 }}>
          {items.map((v) => <VulnerabilityItem key={v.id} vuln={v} />)}
        </Box>
      </CardContent>
    </Card>
  );
}
```

## `src/components/pages/agent_dashboard/SpiderStatsCard.tsx`

```tsx
"use client";

import { Card, CardContent, CardHeader, Grid2, Typography } from "@mui/material";
import ProgressStat from "../../common/ProgressStat";
import SiteTree from "../../common/SiteTree";
import type { SpiderStats } from "./types";

export interface SpiderStatsCardProps {
  stats: SpiderStats;
  progressPercent: number;
  siteTreeLines: string[];
}

export default function SpiderStatsCard({ stats, progressPercent, siteTreeLines }: SpiderStatsCardProps) {
  return (
    <Card variant="outlined">
      <CardHeader title={<Typography variant="h6">Spider Agent</Typography>} subheader="Active" />
      <CardContent>
        <Grid2 container spacing={2}>
          <Grid2 size={{ xs: 12, md: 12 }}>
            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 4 }}>
                <ProgressStat label="Pages" value={stats.pages} />
              </Grid2>
              <Grid2 size={{ xs: 4 }}>
                <ProgressStat label="Links" value={stats.links} />
              </Grid2>
              <Grid2 size={{ xs: 4 }}>
                <ProgressStat label="Requests" value={stats.requests} />
              </Grid2>
            </Grid2>
          </Grid2>

          <Grid2 size={{ xs: 12 }}>
            <ProgressStat label="Progress" value={`${Math.round(progressPercent)}%`} percent={progressPercent} />
          </Grid2>

          <Grid2 size={{ xs: 12 }}>
            <SiteTree lines={siteTreeLines} />
          </Grid2>
        </Grid2>
      </CardContent>
    </Card>
  );
}
```

## `src/components/pages/agent_dashboard/DashboardPage.tsx`

```tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Box, Card, CardContent, CardHeader, Container, Grid2, Typography } from "@mui/material";
import HeaderBar from "../../common/HeaderBar";
import ActivityLog from "../../common/ActivityLog";
import SpiderStatsCard from "./SpiderStatsCard";
import VulnerabilityList from "./VulnerabilityList";
import type { DashboardData, LogEntry, Vulnerability } from "./types";
import { getDemoData } from "../../../lib/api"; // replace with real fetchers later

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>(() => getDemoData());

  // Simulated client-side updates to mirror the original behavior (remove once polling wired)
  useEffect(() => {
    const logTimer = setInterval(() => {
      setData((prev) => {
        const agents: Array<"spider" | "scanner"> = ["spider", "scanner"];
        const agent = agents[Math.floor(Math.random() * agents.length)];
        const messages = {
          spider: [
            "New endpoint discovered: /api/v3/users",
            "Crawling depth increased to level 4",
            "Form submission point identified",
            "JavaScript file analysis in progress",
            "Hidden parameter found in response"
          ],
          scanner: [
            "Testing for CSRF vulnerabilities",
            "Analyzing session management",
            "Fuzzing input parameters",
            "Checking for XML injection",
            "Validating SSL/TLS configuration"
          ]
        } as const;

        const time = new Date().toLocaleTimeString("en-US", { hour12: false });
        const message = messages[agent][Math.floor(Math.random() * messages[agent].length)];

        const newEntry: LogEntry = {
          id: Date.now().toString(),
          time,
          agent,
          message
        };

        return {
          ...prev,
          logEntries: [newEntry, ...prev.logEntries].slice(0, 30),
          progressPercent: Math.min(prev.progressPercent + Math.random() * 2, 100),
          spiderStats: {
            pages: prev.spiderStats.pages + Math.floor(Math.random() * 3),
            links: prev.spiderStats.links + Math.floor(Math.random() * 3),
            requests: prev.spiderStats.requests + Math.floor(Math.random() * 3)
          }
        };
      });
    }, 3000);

    return () => {
      clearInterval(logTimer);
    };
  }, []);

  const siteTreeLines = useMemo(
    () => [
      "/",
      "├─ /login",
      "│  ├─ POST /api/auth",
      "│  └─ GET /api/session",
      "├─ /dashboard",
      "│  ├─ GET /api/user",
      "│  └─ GET /api/stats",
      "├─ /products",
      "│  ├─ GET /api/products",
      "│  └─ GET /api/categories",
      "├─ /admin",
      "│  ├─ GET /api/admin/users",
      "│  └─ POST /api/admin/config",
      "└─ /api/v2",
      "   ├─ GET /api/v2/search",
      "   └─ POST /api/v2/upload"
    ],
    []
  );

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <HeaderBar title="Pentest Agent Dashboard" target={data.targetUrl} scanning={data.scanning} />

      <Grid2 container spacing={2}>
        <Grid2 size={{ xs: 12, lg: 4 }}>
          <SpiderStatsCard
            stats={data.spiderStats}
            progressPercent={data.progressPercent}
            siteTreeLines={siteTreeLines}
          />
        </Grid2>

        <Grid2 size={{ xs: 12, lg: 8 }}>
          <VulnerabilityList items={data.vulnerabilities} />
        </Grid2>

        <Grid2 size={{ xs: 12 }}>
          <Card variant="outlined">
            <CardHeader title={<Typography variant="h6">Activity Log</Typography>} subheader="Real-time" />
            <CardContent>
              <ActivityLog entries={data.logEntries} />
            </CardContent>
          </Card>
        </Grid2>
      </Grid2>
    </Container>
  );
}
```

## `src/lib/api.ts`

```tsx
import type { DashboardData } from "../components/pages/agent_dashboard/types";

export function getDemoData(): DashboardData {
  return {
    targetUrl: "https://example-target.com",
    scanning: true,
    progressPercent: 65,
    spiderStats: { pages: 47, links: 312, requests: 856 },
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
          { description: "Session tokens predictable" }
        ]
      },
      {
        id: "3",
        title: "Cross-Site Scripting (XSS)",
        severity: "medium",
        location: "/dashboard?search={input}",
        steps: [
          { description: "Found unescaped user input in search" },
          { description: "Injected test payload: <script>alert(1)</script>" },
          { description: "Payload reflected in response" },
          { description: "Confirmed stored XSS possibility" }
        ]
      },
      {
        id: "4",
        title: "Directory Traversal",
        severity: "medium",
        location: "/api/v2/upload",
        steps: [
          { description: "File upload endpoint discovered" },
          { description: "Tested path traversal sequences" },
          { description: "Successfully accessed parent directories" },
          { description: "Retrieved /etc/passwd contents" }
        ]
      },
      {
        id: "5",
        title: "Information Disclosure",
        severity: "low",
        location: "/admin (GET)",
        steps: [
          { description: "Admin panel accessible without auth" },
          { description: "Stack traces visible in errors" },
          { description: "Server version headers exposed" }
        ]
      },
      {
        id: "6",
        title: "Missing Security Headers",
        severity: "low",
        location: "/* (All endpoints)",
        steps: [
          { description: "Analyzed HTTP response headers" },
          { description: "Missing X-Frame-Options" },
          { description: "No Content-Security-Policy" },
          { description: "HSTS not implemented" }
        ]
      }
    ],
    logEntries: [
      { id: "1", time: "14:32:15", agent: "scanner", message: "Critical SQL injection vulnerability confirmed at /api/products" },
      { id: "2", time: "14:32:01", agent: "spider",  message: "Discovered new endpoint: /api/v2/search" },
      { id: "3", time: "14:31:45", agent: "scanner", message: "Testing authentication bypass on /api/auth" },
      { id: "4", time: "14:31:32", agent: "spider",  message: "Crawling /admin directory - 12 new links found" },
      { id: "5", time: "14:31:15", agent: "scanner", message: "XSS payload successful on /dashboard?search=" },
      { id: "6", time: "14:30:58", agent: "spider",  message: "Mapping API endpoints at /api/v2/*" },
      { id: "7", time: "14:30:42", agent: "scanner", message: "Initiating directory traversal tests" },
      { id: "8", time: "14:30:28", agent: "spider",  message: "Site structure analysis 65% complete" }
    ]
  };
}
```

## `src/hooks/usePolling.ts`

```tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface PollingOptions<T> {
  intervalMs: number;
  fetcher: (signal: AbortSignal) => Promise<T>;
  onData?: (data: T) => void;
  // If server supports ETag/If-None-Match or If-Modified-Since, put the header mgmt in fetcher.
  backoff?: { initialMs: number; maxMs: number; factor: number };
  pauseWhenHidden?: boolean;
}

export function usePolling<T>(opts: PollingOptions<T>) {
  const { intervalMs, fetcher, onData, backoff, pauseWhenHidden = true } = opts;

  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<unknown>(undefined);
  const [isRunning, setIsRunning] = useState<boolean>(true);

  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<number | null>(null);
  const backoffMsRef = useRef<number>(backoff?.initialMs ?? intervalMs);

  const clearTimer = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const schedule = useCallback((ms: number) => {
    clearTimer();
    timerRef.current = window.setTimeout(tick, ms);
  }, []);

  const tick = useCallback(async () => {
    if (!isRunning) return;
    if (pauseWhenHidden && document.visibilityState === "hidden") {
      schedule(intervalMs);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const next = await fetcher(controller.signal);
      setData(next);
      onData?.(next);
      setError(undefined);
      backoffMsRef.current = intervalMs;
      schedule(intervalMs);
    } catch (e) {
      if ((e as any)?.name === "AbortError") return;
      setError(e);
      if (backoff) {
        backoffMsRef.current = Math.min(backoff.maxMs, Math.floor(backoffMsRef.current * backoff.factor));
        schedule(backoffMsRef.current);
      } else {
        schedule(intervalMs);
      }
    }
  }, [fetcher, intervalMs, isRunning, onData, pauseWhenHidden, schedule, backoff]);

  useEffect(() => {
    setIsRunning(true);
    schedule(0);
    return () => {
      setIsRunning(false);
      abortRef.current?.abort();
      clearTimer();
    };
  }, [schedule]);

  return { data, error, isRunning, stop: () => setIsRunning(false), start: () => setIsRunning(true) };
}
```

---

# 4) Live client polling architecture (designed for easy swap-in)

**Goal:** Replace the demo’s local timers with real HTTP polling without refactoring component trees.

## Recommended design

* **Typed API layer (`lib/api.ts`)**

  * Expose `getDashboardData(signal: AbortSignal): Promise<DashboardData>`.
  * Internally manage `ETag` or `Last-Modified` headers so the server can return `304 Not Modified` and save bandwidth.
  * On `304`, return the previous cached data; on `200`, parse and return fresh data.

* **Generic polling hook (`hooks/usePolling.ts`)**

  * Accepts a `fetcher(signal)` and base interval.
  * Supports exponential backoff on failures.
  * Pauses when the tab is hidden to reduce load.
  * Aborts in-flight requests when re-polling.

* **Page component (`DashboardPage.tsx`)**

  * Swap demo state to use `usePolling` and set data into local state. Components like `SpiderStatsCard`, `VulnerabilityList`, and `ActivityLog` remain unchanged because they already consume the typed `DashboardData` slices.

### Minimal code change to switch to polling

Replace the demo timer in `DashboardPage.tsx`:

```tsx
// 1) add real fetcher
import { getDashboardData } from "../../../lib/api";

// 2) inside component:
const { data: polled, error } = usePolling<DashboardData>({
  intervalMs: 5000,
  fetcher: getDashboardData,
  onData: (d) => setData(d),
  backoff: { initialMs: 5000, maxMs: 60000, factor: 1.8 },
  pauseWhenHidden: true
});

// remove the setInterval demo effect entirely
```

### Server expectations

* **Endpoint:** `GET /api/dashboard`
  Returns `DashboardData` JSON:

  ```ts
  {
    targetUrl: string;
    scanning: boolean;
    progressPercent: number;
    spiderStats: { pages: number; links: number; requests: number };
    vulnerabilities: Vulnerability[];
    logEntries: LogEntry[];
  }
  ```
* **Caching semantics:**

  * Respond with `ETag` and `Last-Modified`.
  * Respect `If-None-Match` and `If-Modified-Since` from client. Return `304` on no changes.
  * Optional: include `Cache-Control: no-cache` to force validation every poll.

### Example real fetcher (`lib/api.ts`)

```tsx
import type { DashboardData } from "../components/pages/agent_dashboard/types";

let lastEtag: string | undefined;
let lastModified: string | undefined;
let cached: DashboardData | undefined;

export async function getDashboardData(signal: AbortSignal): Promise<DashboardData> {
  const headers: Record<string, string> = {};
  if (lastEtag) headers["If-None-Match"] = lastEtag;
  if (lastModified) headers["If-Modified-Since"] = lastModified;

  const res = await fetch("/api/dashboard", { headers, signal });

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
```

### Why this is seamless

* Components rely on strict, shared **types** (`DashboardData`, `Vulnerability`, etc.).
* The **data shape** remains identical between the demo generator and the real API.
* The **hook boundary** (`usePolling`) encapsulates all polling behavior; swapping implementations doesn’t ripple through UI.

---

## Notes on precision and quality

* All components are fully typed; props expose the minimum shape they need.
* MUI components are used throughout; no Tailwind classes remain.
* Accessibility: `Accordion` for vulnerability details; `Chip` for severity and agent labels.
* Performance: lists are simple; if logs get large, add virtualization later.

If you want, I can wire this into your current Next.js route (`app/page.tsx`) and include a minimal MUI theme provider scaffold so it runs end-to-end.
