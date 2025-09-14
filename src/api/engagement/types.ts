// Engagement domain API types used by the frontend

import type { PageDTO } from "../agent/types";

export interface EngagementCreate {
  name: string;
  base_url: string;
  scopes_data?: string[] | null;
  description?: string | null;
}

export interface EngagementOut extends EngagementCreate {
  id: string; // UUID
  created_at: string; // ISO datetime
  findings?: Array<Record<string, unknown>> | null;
  domain_ownership_verified: boolean;
  page_data?: PageDTO[] | null;
}

export interface PageDataMergeRequest {
  agent_id: string;
  delta: PageDTO[];
}

export interface EngagementPageDataOut {
  page_data: PageDTO[];
}


