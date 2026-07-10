import type { WelfarePolicy } from "@/shared/newstant/api";

type SortOrder = "popular" | "latest";

export type PolicyDetailItem = {
  label: string;
  value: string;
};

export type PolicyItem = {
  details: PolicyDetailItem[];
  id: string;
  registeredAt: string;
  summary: string;
  tags: string[];
  title: string;
  updatedAt: string;
};

export function formatHeroCount(count: number) {
  return new Intl.NumberFormat("ko-KR").format(count);
}

export const policyAgeTabs = ["전체", "미성년", "청년", "중장년", "노년"];
export const policyAgeIdByLabel: Record<string, string> = {
  노년: "senior",
  미성년: "minor",
  전체: "all",
  중장년: "middle",
  청년: "youth",
};

const policySortLabels: Record<SortOrder, string> = {
  latest: "최신순",
  popular: "인기순",
};
export const policySortOptions: { label: string; value: SortOrder }[] = [
  { label: policySortLabels.popular, value: "popular" },
  { label: policySortLabels.latest, value: "latest" },
];
const dummyDateLabel = "0000년 00월 00일";

function formatPolicyDate(_value: string) {
  return dummyDateLabel;
}

export function getPolicyItemFromWelfarePolicy(policy: WelfarePolicy): PolicyItem {
  return {
    details: [
      { label: "지원 대상 연령", value: policy.targetAge },
      { label: "지원 내용", value: policy.supportContent },
      { label: "지원 기관", value: policy.institution },
      {
        label: "사업 기간",
        value: `${dummyDateLabel} ~ ${dummyDateLabel}`,
      },
      {
        label: "신청 기간",
        value: `${dummyDateLabel} ~ ${dummyDateLabel}`,
      },
      { label: "신청 방법", value: policy.applicationMethod },
      { label: "선발 방식", value: policy.selectionMethod },
      { label: "제출 서류", value: policy.documents },
    ],
    id: policy.id,
    registeredAt: formatPolicyDate(policy.registeredAt),
    summary: policy.summary,
    tags: [policy.category, policy.subcategory, policy.label],
    title: policy.title,
    updatedAt: formatPolicyDate(policy.updatedAt),
  };
}

