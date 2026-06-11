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
  metadataBase: new URL("https://jinren-protocol.vercel.app"),
  title: {
    default: "詩塾書院",
    template: "%s｜詩塾書院",
  },
  description: "詩塾書院整理 AI 時代的知識理解方法，支援長文閱讀、書籤保存與繼續閱讀。",
  applicationName: "詩塾書院",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "詩塾書院",
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: ["/favicon-48.png"],
  },
  openGraph: {
    title: "詩塾書院",
    description: "詩塾書院整理 AI 時代的知識理解方法，支援長文閱讀、書籤保存與繼續閱讀。",
    type: "website",
    locale: "zh_TW",
    images: [
      {
        url: "/share/shishu-academy-og.png",
        width: 1200,
        height: 630,
        alt: "詩塾書院分享預覽圖",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "詩塾書院",
    description: "詩塾書院整理 AI 時代的知識理解方法，支援長文閱讀、書籤保存與繼續閱讀。",
    images: ["/share/shishu-academy-og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-Hant-TW"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
