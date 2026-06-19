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

type InquiryUser = {
  email?: string;
};

function createTimestamp() {
  return new Date().toISOString();
}

function createInquiryId() {
  return `inquiry-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function getInquiryReplyEmail(userId: string) {
  const response = await fetch(buildApiUrl(`/users/${userId}`), {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Inquiry user lookup failed: ${response.status}`);
  }

  const user = (await response.json()) as InquiryUser;
  const replyEmail = user.email?.trim();

  if (!replyEmail) {
    throw new Error("Inquiry user email is empty");
  }

  return replyEmail;
}

async function postMockInquiry(
  input: InquiryRequest,
  replyEmail: string,
  emailSent: boolean,
) {
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
      replyChannel: "email",
      replyEmail,
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

async function sendInquiryEmail(input: InquiryRequest, replyEmail: string) {
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
        `replyEmail: ${replyEmail}`,
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

  const replyEmail = await getInquiryReplyEmail(parsed.data.userId);
  const emailSent = await sendInquiryEmail(parsed.data, replyEmail);
  const inquiry = await postMockInquiry(parsed.data, replyEmail, emailSent);

  return NextResponse.json(inquiry, { status: 201 });
}
