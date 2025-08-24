
import { prisma } from "@/lib/prisma";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { Analytics } from "@/components/analytics/Analytics";
import { Toaster as SonnerToaster } from "sonner";
import { defaultSettings } from "@/lib/defaultSettings";
import { cache } from 'react'
import type { Metadata, ResolvingMetadata } from 'next'
import { GoogleAnalytics } from '@next/third-parties/google'

async function checkSiteSettingTableExists() {
  const result: any = await prisma.$queryRaw`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE  table_schema = 'public'
      AND    table_name   = 'SiteSetting'
    );
  `;
  return result[0].exists;
}

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export const generateMetadata = async (
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> => {
  try {
    const tableExists = await checkSiteSettingTableExists();
    const keys = [
      "websiteName",
      "description",
      "keywords",
      "siteUrl",
      "faviconUrl",
      "ogImage",
      "siteTitle",
      "author",
      "robots",
      "twitterCard",
      "twitterSite",
      "twitterCreator",
      "structuredData"
    ];
    let settings: any;
    if (tableExists) {
      settings = await prisma.siteSetting.findMany({
        where: {
          key: {
            in: [...keys],
          },
        },
      });
    }

    // console.log(settings)

    settings = settings.length > 0 ? settings : defaultSettings.filter((setting) =>
      keys.includes(setting.key)
    );

    const settingsMap = settings.reduce((acc: any, setting: any) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    // const faviconBase =
    //   settingsMap.faviconUrl?.replace("favicon.ico", "") || "/favicon/";
    const siteUrl =
      settingsMap.siteUrl ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";


    const imageBaseUrl = '/api/images/'


    const faviconSetting = settings.find((setting: any) => setting.key === 'faviconUrl');
    const faviconId = faviconSetting ?
      (await prisma.settingImage.findFirst({
        where: { settingId: faviconSetting.id },
        select: { imageId: true }
      }))?.imageId || '' : '';
    const faviconUrl = faviconId ? `${imageBaseUrl}${faviconId}` : '/favicon/favicon.ico'

    // 构建 Open Graph 对象
    const openGraph: any = {
      title: settingsMap.siteTitle || settingsMap.websiteName,
      description: settingsMap.description,
      url: siteUrl,
      siteName: settingsMap.websiteName,
      locale: 'zh_CN',
      type: 'website',
    };

    // 如果有 OG 图片，则添加到 Open Graph 对象
    if (settingsMap.ogImage) {
      openGraph.images = [
        {
          url: settingsMap.ogImage,
          width: 1200,
          height: 630,
          alt: settingsMap.websiteName,
        }
      ];
    }

    // 构建 Twitter Card 对象
    const twitter: any = {
      card: settingsMap.twitterCard || 'summary_large_image',
      title: settingsMap.siteTitle || settingsMap.websiteName,
      description: settingsMap.description,
    };

    // 如果有 Twitter Site，则添加到 Twitter 对象
    if (settingsMap.twitterSite) {
      twitter.site = settingsMap.twitterSite;
    }

    // 如果有 Twitter Creator，则添加到 Twitter 对象
    if (settingsMap.twitterCreator) {
      twitter.creator = settingsMap.twitterCreator;
    }

    // 如果有 OG 图片，则添加到 Twitter 对象
    if (settingsMap.ogImage) {
      twitter.images = [settingsMap.ogImage];
    }

    return {
      title: settingsMap.siteTitle || settingsMap.websiteName,
      description: settingsMap.description,
      keywords: settingsMap.keywords,
      metadataBase: new URL(siteUrl),
      alternates: {
        canonical: siteUrl,
      },
      authors: settingsMap.author ? [{ name: settingsMap.author }] : [],
      robots: settingsMap.robots || "index, follow",
      openGraph,
      twitter,
      icons: {
        icon: [
          {
            url: faviconUrl,
            sizes: "32x32",
            type: "image/x-icon",
          },
          // {
          //   url: `${faviconBase}favicon-16x16.png`,
          //   sizes: "16x16",
          //   type: "image/png",
          // },
          // {
          //   url: `${faviconBase}favicon-32x32.png`,
          //   sizes: "32x32",
          //   type: "image/png",
          // },
          // {
          //   url: `${faviconBase}favicon-192x192.png`,
          //   sizes: "192x192",
          //   type: "image/png",
          // },
          // {
          //   url: `${faviconBase}favicon-512x512.png`,
          //   sizes: "512x512",
          //   type: "image/png",
          // },
        // apple: [
        //   {
        //     url: `${faviconBase}favicon-180x180.png`,
        //     sizes: "180x180",
        //     type: "image/png",
        //   },
        // ],
        ],
      },
    };
  } catch (error) {
    console.error("获取设置失败:", error);
    return {
      title: "Pintree - Smart Bookmark Management & Organization Platform",
      description:
        "Organize, manage and share your bookmarks efficiently with Pintree. Features AI-powered organization, custom collections, and seamless bookmark sharing for enhanced productivity.",
      keywords:
        "bookmark manager, bookmark organizer, bookmark collections, bookmark sharing, productivity tools, website organization, link management, bookmark tags, AI bookmarking, digital organization",
      icons: {
        icon: "/favicon/favicon.ico",
      },
    };
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let analyticsMap: any = {
    googleAnalyticsId: "",
    clarityId: "",
  };

  // 获取结构化数据设置
  let structuredData: string | null = null;
  const tableExists = await checkSiteSettingTableExists();
  if (tableExists) {
    const structuredDataSetting = await prisma.siteSetting.findFirst({
      where: {
        key: "structuredData",
      },
    });

    if (structuredDataSetting && structuredDataSetting.value) {
      structuredData = structuredDataSetting.value;
    }
  }

  if (process.env.NODE_ENV === "production") {
    if (tableExists) {
      // 获取统计代码ID
      const analytics = await prisma.siteSetting.findMany({
        where: {
          key: {
            in: ["googleAnalyticsId", "clarityId"],
          },
        },
      });

      if (analytics.length > 0) {
        analyticsMap = analytics.reduce((acc, setting) => {
          acc[setting.key] = setting.value || "";
          return acc;
        }, {} as Record<string, string>);
      }
    }
  }

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
      </body>
      <Analytics clarityId={analyticsMap.clarityId} />
      {!!analyticsMap.googleAnalyticsId && <GoogleAnalytics gaId={analyticsMap.googleAnalyticsId} />}
    </html>
  );
}
