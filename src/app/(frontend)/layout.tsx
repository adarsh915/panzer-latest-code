/* eslint-disable @next/next/no-css-tags, @next/next/no-page-custom-font */
import type { Metadata } from "next";
import { RouteScripts } from "@/components/frontend/RouteScripts";
import { LegacyMainScript } from "@/components/frontend/LegacyMainScript";
import { OptimizedScripts } from "@/components/frontend/OptimizedScripts";
import { SiteChrome } from "@/components/frontend/SiteChrome";
import { getHeaderData } from "./headerDataStore";
import { readSetting } from "@/app/admin/settings/settingsStore";
import { ScrollToTop } from "@/components/frontend/ScrollToTop";
import { HomeServicePins } from "@/components/frontend/HomeServicePins";
import { NonBlockingCSS } from "@/components/frontend/NonBlockingCSS";

// PERFORMANCE FIX: Import CSS through Next.js bundler for optimization
import "bootstrap/dist/css/bootstrap.min.css"; // Bootstrap from npm (227KB → optimized)
import "./globals.css";

import { SiteFooter } from "@/components/frontend/SiteFooter";

export const metadata: Metadata = {
  title: "Panzer IT | Make 'IT' Secure",
  description: "Panzer IT — Professional IT Services",
  icons: {
    icon: '/assets/images/favicons/favicon.jpeg',
    shortcut: '/assets/images/favicons/favicon.jpeg',
    apple: '/assets/images/favicons/favicon.jpeg',
  },
};

// Force dynamic rendering to ensure backend updates show up immediately without a hard refresh
export const dynamic = 'force-dynamic';
// export const revalidate = 1800; // Rebuild every 30 minutes (was 300)

export default async function FrontendLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  console.time('Header Data Load')
  // Optimized: Single cached query instead of loading full datasets
  const headerData = await getHeaderData();
  console.timeEnd('Header Data Load')
  console.log('Header data size:', JSON.stringify(headerData).length, 'bytes')

  const themeColors = await readSetting<Record<string, string>>('frontend_theme_colors', {});
  const cssVariables = Object.entries(themeColors)
    .map(([key, value]) => `${key}: ${value};`)
    .join('\n          ');

  return (
    <>
      {cssVariables && (
        <style dangerouslySetInnerHTML={{ __html: `
          :root, html:root, body {
            ${cssVariables}
          }
        `}} />
      )}
      {/* Resource Hints - Improve connection speed */}
      <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* Fonts - Async loading */}
      <link
        href="https://fonts.googleapis.com/css2?family=Alegreya:wght@400&family=Manrope:wght@200..800&family=Noto+Sans:ital,wght@0,100..900;1,100..900&display=swap"
        rel="stylesheet"
      />
      
      {/* CRITICAL CSS - Main template CSS loaded directly (has syntax issues, can't go through bundler) */}
      <link rel="stylesheet" href="/assets/css/style.css?v=20260608-2" />
      
      {/* Swiper CSS - Keep blocking (critical for slider) */}
      <link rel="stylesheet" href="/assets/css/swiper-bundle.min.css?v=20260524" />
      
      {/* Font Awesome - Keep blocking (icons used everywhere) */}
      <link rel="stylesheet" href="/assets/fontawesome/css/fontawesome.min.css?v=20260524" />
      
      {/* ✅ OPTIMIZED: Bootstrap loaded via Next.js bundler (imported above) */}
      
      {/* NON-BLOCKING CSS - Loaded asynchronously after initial render */}
      <NonBlockingCSS />

      <SiteChrome headerData={headerData} footer={<SiteFooter />}>
        {children}
      </SiteChrome>

      {/* Optimized Scripts - Load smartly based on page needs */}
      <OptimizedScripts />
      <LegacyMainScript />
      <RouteScripts />
      <ScrollToTop />
      <HomeServicePins />
    </>
  );
}
