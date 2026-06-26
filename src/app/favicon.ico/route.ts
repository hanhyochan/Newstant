import { NextResponse } from "next/server";

const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#7B3FF2"/><path d="M10 9h12v3H10V9Zm0 5h12v3H10v-3Zm0 5h8v3h-8v-3Z" fill="#fff"/></svg>`;

export function GET() {
  return new NextResponse(faviconSvg, {
    headers: {
      "Cache-Control": "public, max-age=86400",
      "Content-Type": "image/svg+xml",
    },
  });
}
