import { apiClient } from "./http-client";
import type { WelfarePolicy } from "./types";

export const welfareApi = {
  getWelfarePolicyList(ageGroupId?: string) {
    return apiClient.get<WelfarePolicy[]>("/welfarePolicies", {
      ...(ageGroupId && ageGroupId !== "all" ? { ageGroupIds_like: ageGroupId } : {}),
      _sort: "registeredAt",
      _order: "desc",
    });
  },
  getWelfarePolicyDetail(policyId: string) {
    return apiClient.get<WelfarePolicy>(`/welfarePolicies/${policyId}`);
  },
};
