import { NextResponse } from "next/server";
import { z } from "zod";

import { buildApiUrl } from "../../_newsroll/api-config";

const inquirySchema = z.object({
  content: z.string().trim().min(1),
  title: z.string().trim().min(1),
  typeId: z.string().trim().min(1),
  userId: z.string().trim().min(1),
});

type InquiryRequest = z.infer<typeof inquirySchema>;

function createTimestamp() {
  return new Date().toISOString();
}

function createInquiryId() {
  return `inquiry-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function postMockInquiry(input: InquiryRequest, emailSent: boolean) {
  const now = createTimestamp();
  const response = await fetch(buildApiUrl("/inquiries"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: createInquiryId(),
      userId: input.userId,
      typeId: input.typeId,
      title: input.title,
      content: input.content,
      status: "received",
      emailSent,
      createdAt: now,
      updatedAt: now,
    }),
  });

  if (!response.ok) {
    throw new Error(`Mock inquiry save failed: ${response.status}`);
  }

  return response.json();
}

async function sendInquiryEmail(input: InquiryRequest) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const to = process.env.INQUIRY_NOTIFY_EMAIL;

  if (!resendApiKey || !to) {
    return false;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.INQUIRY_FROM_EMAIL ?? "NewsRoll <onboarding@resend.dev>",
      to,
      subject: `[NewsRoll 문의] ${input.title}`,
      text: [
        `userId: ${input.userId}`,
        `typeId: ${input.typeId}`,
        "",
        input.content,
      ].join("\n"),
    }),
  });

  return response.ok;
}

export async function POST(request: Request) {
  const parsed = inquirySchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid inquiry payload" }, { status: 400 });
  }

  const emailSent = await sendInquiryEmail(parsed.data);
  const inquiry = await postMockInquiry(parsed.data, emailSent);

  return NextResponse.json(inquiry, { status: 201 });
}
