import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "中国汽车出海情报探测系统",
  description:
    "聚合比亚迪、奇瑞、上汽 MG、长城、吉利、长安、蔚来、小鹏、零跑等企业在欧洲、东南亚、拉美、中东、澳洲等目的地的新闻情报，自动识别新品发布、销量、建厂、战略合作与政策风险。",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background">{children}</body>
    </html>
  );
}
