import { apiClient } from "./http-client";
import type { CreateInquiryInput, Inquiry } from "./types";
import { guestStorageApi } from "../guest-storage";

export const inquiryApi = {
  getInquiries(userId: string) {
    if (guestStorageApi.isGuestUserId(userId)) {
      return guestStorageApi.getInquiries();
    }

    return apiClient.get<Inquiry[]>("/inquiries", {
      _order: "desc",
      _sort: "createdAt",
      userId,
    });
  },
  async createInquiry(input: CreateInquiryInput) {
    if (guestStorageApi.isGuestUserId(input.userId)) {
      return guestStorageApi.createInquiry(input);
    }

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
