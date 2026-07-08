import { Metadata } from 'next';

/**
 * Adds the "Make 'IT' Secure" tagline to page titles
 * @param title - The base page title (e.g., "About Us")
 * @returns Formatted title with company name and tagline (e.g., "About Us | Panzer IT | Make 'IT' Secure")
 */
export function formatPageTitle(title: string | undefined | null): string {
  if (!title) {
    return "Panzer IT | Make 'IT' Secure";
  }
  
  // If title already contains "Panzer IT", don't add it again
  if (title.includes('Panzer IT')) {
    // Check if it already has the tagline
    if (title.includes("Make 'IT' Secure")) {
      return title;
    }
    return `${title} | Make 'IT' Secure`;
  }
  
  return `${title} | Panzer IT | Make 'IT' Secure`;
}

/**
 * Creates metadata object with formatted title and tagline
 * @param seoData - SEO data from database
 * @param canonicalPath - Canonical URL path (e.g., '/about')
 * @returns Metadata object with formatted title
 */
export function createPageMetadata(
  seoData: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    ogImage?: string;
  },
  canonicalPath: string
): Metadata {
  return {
    title: formatPageTitle(seoData.metaTitle),
    description: seoData.metaDescription,
    keywords: seoData.metaKeywords,
    openGraph: {
      title: formatPageTitle(seoData.metaTitle),
      description: seoData.metaDescription,
      images: seoData.ogImage ? [{ url: seoData.ogImage }] : undefined,
    },
    alternates: {
      canonical: canonicalPath,
    },
  };
}
