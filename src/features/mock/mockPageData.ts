import type { PageDataResponse } from "../../api/agent/types";
import type { DerivedAgentPageData } from "../agent/queries/useAgentPageDataQuery";
import type { MockQueryDataConfig } from "./types";

// Mock data for useAgentPageDataQuery - progressive site discovery
export const agentPageDataMockConfig: MockQueryDataConfig<DerivedAgentPageData> = {
  id: "agentPageData",
  initData: {
    siteTreeLines: ["/"],
    spiderStats: { pages: 1, requests: 1 },
    raw: {
      page_data: []
    } as PageDataResponse
  },
  replayData: [
    {
      delayMs: 2000,
      description: "Spider discovers initial pages",
      data: {
        siteTreeLines: [
          "/",
          "├── /login",
          "├── /dashboard",
          "└── /api"
        ],
        spiderStats: { pages: 4, requests: 8 }
      }
    },
    {
      delayMs: 3000,
      description: "Spider finds more endpoints",
      data: {
        siteTreeLines: [
          "/",
          "├── /login",
          "├── /dashboard",
          "│   ├── /dashboard/users",
          "│   └── /dashboard/settings",
          "├── /api",
          "│   ├── /api/auth",
          "│   ├── /api/users",
          "│   └── /api/data",
          "└── /static"
        ],
        spiderStats: { pages: 12, requests: 28 }
      }
    },
    {
      delayMs: 4000,
      description: "Spider completes discovery",
      data: {
        siteTreeLines: [
          "/",
          "├── /login",
          "├── /dashboard",
          "│   ├── /dashboard/users",
          "│   ├── /dashboard/settings",
          "│   ├── /dashboard/profile",
          "│   └── /dashboard/admin",
          "├── /api",
          "│   ├── /api/auth",
          "│   │   ├── /api/auth/login",
          "│   │   └── /api/auth/logout",
          "│   ├── /api/users",
          "│   │   ├── /api/users/list",
          "│   │   └── /api/users/create",
          "│   └── /api/data",
          "│       ├── /api/data/export",
          "│       └── /api/data/import",
          "├── /static",
          "│   ├── /static/css",
          "│   └── /static/js",
          "└── /docs"
        ],
        spiderStats: { pages: 24, requests: 67 }
      }
    }
  ],
  loop: false
};
