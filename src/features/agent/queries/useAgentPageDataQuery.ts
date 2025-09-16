import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { agentKeys } from "../queryKeys";
import type { PageDataResponse } from "../../../api/agent/types";
import { http } from "../../../api/http";
import type { SpiderStats } from "../../../components/pages/agent_dashboard/types";
import { PageObservations } from "../models/PageObservations";

export interface DerivedAgentPageData {
  siteTreeLines: string[];
  spiderStats: SpiderStats;
  raw?: PageDataResponse;
}

// NOTE: can not directly pass these in as props since they will refer to the same
// static var ref
const lastObsByEngagement = new Map<string, PageObservations>();
const timelineByEngagement = new Map<string, PageObservations[]>();

export function useAgentPageDataQuery(engagementId?: string, options?: { intervalMs?: number }) {
  const intervalMs = options?.intervalMs ?? 5_000;

  return useQuery({
    enabled: Boolean(engagementId),
    queryKey: engagementId ? agentKeys.pageData(engagementId) : agentKeys.all,
    queryFn: async ({ signal }) => {
      return http.getAgentPageData(engagementId as string, signal);
    },
    refetchInterval: intervalMs,
    refetchIntervalInBackground: true,
    placeholderData: keepPreviousData,
    select: (resp): DerivedAgentPageData => {
      const obs = PageObservations.fromResponse(resp);
      const key = (engagementId as string) || "__unknown__";
      const prev = lastObsByEngagement.get(key) ?? PageObservations.empty();
      const diff = prev.diff(obs);
      if (diff.length > 0) {
        lastObsByEngagement.set(key, obs);
        const arr = timelineByEngagement.get(key) ?? [];
        arr.push(obs);
        timelineByEngagement.set(key, arr);
      }

      return {
        siteTreeLines: obs.toAsciiTreeLines(),
        spiderStats: obs.toStats(),
        raw: resp
      };
    }
  });
}


