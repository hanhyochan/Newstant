import { createSessionResourceCache } from "./cache";
import { apiClient } from "./http-client";
import type { WelfarePolicy } from "./types";

const welfarePolicyListCache = createSessionResourceCache(
  (ageGroupId?: string) =>
    apiClient.get<WelfarePolicy[]>("/welfarePolicies", {
      ...(ageGroupId && ageGroupId !== "all" ? { ageGroupIds_like: ageGroupId } : {}),
      _sort: "registeredAt",
      _order: "desc",
    }),
  (ageGroupId?: string) => ageGroupId ?? "all",
);

export function invalidateWelfarePolicyCache(ageGroupId?: string) {
  if (ageGroupId) {
    welfarePolicyListCache.invalidate(ageGroupId);
    return;
  }

  welfarePolicyListCache.clear();
}

export const welfareApi = {
  getWelfarePolicyList(ageGroupId?: string) {
    return welfarePolicyListCache.get(ageGroupId);
  },
  getWelfarePolicyDetail(policyId: string) {
    return apiClient.get<WelfarePolicy>(`/welfarePolicies/${policyId}`);
  },
};
