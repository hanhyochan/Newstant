import { apiClient } from "./http-client";
import type { Faq, InquiryType, Notice } from "./types";

export const infoApi = {
  getNotices() {
    return apiClient.get<Notice[]>("/notices", {
      _sort: "registeredAt",
      _order: "desc",
    });
  },
  getFaqs() {
    return apiClient.get<Faq[]>("/faqs", {
      _sort: "order",
      _order: "asc",
    });
  },
  getInquiryTypes() {
    return apiClient.get<InquiryType[]>("/inquiryTypes");
  },
};
