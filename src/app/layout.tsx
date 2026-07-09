import type { Metadata } from "next";
import localFont from "next/font/local";
import "./styles/tokens.css";
import "./styles/reset.css";
import "./styles/utilities.css";
const pretendard = localFont({
  src: "../../public/fonts/woff2/PretendardVariable.woff2",
  display: "swap",
  style: "normal",
  weight: "45 920",
  variable: "--font-pretendard",
});

export const metadata: Metadata = {
  title: "Newstant",
  description: "Newstant",
  icons: {
    icon: "/images/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html className={pretendard.variable} lang="ko">
      <body>{children}</body>
    </html>
  );
}
