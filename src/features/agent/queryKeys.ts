export const agentKeys = {
  all: ["agent"] as const,
  pageData: (engagementId: string) => [...agentKeys.all, "pageData", engagementId] as const
};


