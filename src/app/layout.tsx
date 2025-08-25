
import { prisma } from "@/lib/prisma";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { Toaster as SonnerToaster } from "sonner";
import { cache } from 'react'
import type { Metadata, ResolvingMetadata } from 'next'
import { GoogleAnalytics } from '@next/third-parties/google'

async function checkSiteSettingTableExists() {
  // 简化版本 - 返回 false，表示不存在 SiteSetting 表
  return false;
}

type Props = {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    title: "🚀 书签导航树 - 全新重构版本 | Smart Bookmark Management & Organization Platform",
    description: "Organize, manage and share your bookmarks efficiently with LinkTree. Features AI-powered organization, custom collections, and seamless bookmark sharing for enhanced productivity.",
    keywords: "bookmark manager, bookmark organizer, bookmark collections, bookmark sharing, productivity tools, website organization, link management, bookmark tags, AI bookmarking, digital organization",
    icons: {
      icon: "/favicon/favicon.ico",
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 简化版本 - 跳过结构化数据和分析设置
  let structuredData: string | null = null;
  let analyticsMap: any = {
    googleAnalyticsId: "",
    clarityId: "",
  };

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        {structuredData && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: structuredData }}
          />
        )}
      </head>
      <body suppressHydrationWarning>
        <SessionProvider>{children}</SessionProvider>
        <Toaster />
        <SonnerToaster />
        {!!analyticsMap.googleAnalyticsId && <GoogleAnalytics gaId={analyticsMap.googleAnalyticsId} />}
      </body>
    </html>
  );
}
