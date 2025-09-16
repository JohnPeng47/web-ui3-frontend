export const agentKeys = {
  all: ["agent"] as const,
  engagementAgents: (engagementId: string) =>
    [...agentKeys.all, "engagementAgents", engagementId] as const,
  agentSteps: (agentId: string) =>
    [...agentKeys.all, "agentSteps", agentId] as const,
  pageData: (engagementId: string) => [...agentKeys.all, "pageData", engagementId] as const,
  exploitAgentId: (engagementId: string) => [...agentKeys.all, "exploitAgentId", engagementId] as const,
  exploitSteps: (agentId: string) => [...agentKeys.all, "exploitSteps", agentId] as const,
  multipleExploitSteps: (agentIds: string[]) => [...agentKeys.all, "multipleExploitSteps", agentIds] as const
};


