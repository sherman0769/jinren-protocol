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
    default: "書籍書庫｜數位閱讀器",
    template: "%s｜書籍書庫",
  },
  description: "一個可持續新增書籍、章節與長文內容的網頁書籍閱讀器。",
  applicationName: "書籍書庫",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "書籍書庫",
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
    title: "書籍書庫｜數位閱讀器",
    description: "選擇一本書，進入乾淨、可調字級、有進度保存的長文閱讀器。",
    type: "website",
    locale: "zh_TW",
    images: [
      {
        url: "/books/exponential-ai-life/cover.png",
        width: 1200,
        height: 630,
        alt: "書籍書庫分享預覽圖",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "書籍書庫｜數位閱讀器",
    description: "選擇一本書，進入乾淨、可調字級、有進度保存的長文閱讀器。",
    images: ["/books/exponential-ai-life/cover.png"],
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
