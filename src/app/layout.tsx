import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { season } from "@/lib/comic";
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
    default: "漫畫書庫｜原創漫畫閱讀器",
    template: "%s｜漫畫書庫",
  },
  description: "一個可持續新增原創漫畫作品、章節與正式圖像的網頁漫畫閱讀器。",
  applicationName: "漫畫書庫",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "漫畫書庫",
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
    title: `${season.title}｜${season.subtitle}`,
    description: season.description,
    type: "website",
    locale: "zh_TW",
    images: [
      {
        url: season.ogImage,
        width: 1200,
        height: 630,
        alt: `${season.title} 分享預覽圖`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${season.title}｜${season.subtitle}`,
    description: season.description,
    images: [season.ogImage],
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
