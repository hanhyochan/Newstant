import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const pretendard = localFont({
  src: "../../public/fonts/woff2/PretendardVariable.woff2",
  display: "swap",
  style: "normal",
  weight: "45 930",
  variable: "--font-pretendard",
});

export const metadata: Metadata = {
  title: "NewsRoll",
  description: "NewsRoll",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html className={pretendard.variable} lang="ko">
      <body className={pretendard.className}>{children}</body>
    </html>
  );
}
