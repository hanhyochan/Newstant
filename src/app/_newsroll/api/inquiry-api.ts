import { apiClient } from "./http-client";
import type { CreateInquiryInput, Inquiry } from "./types";

export const inquiryApi = {
  getInquiries(userId: string) {
    return apiClient.get<Inquiry[]>("/inquiries", {
      _order: "desc",
      _sort: "createdAt",
      userId,
    });
  },
  async createInquiry(input: CreateInquiryInput) {
    const response = await fetch("/api/inquiries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error(`Inquiry request failed: ${response.status}`);
    }

    return (await response.json()) as Inquiry;
  },
};
