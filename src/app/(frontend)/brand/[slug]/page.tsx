import { Breadcrumb } from "@/components/frontend/Breadcrumb";
import { BrandDetailSticky } from "@/components/frontend/SolutionDetailSticky";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { readBrands } from "@/app/admin/brands/brandStore";
import { readActiveFaqs } from "@/app/admin/faqs/faqStore";
import { sanitizeHtml } from "@/utils/sanitize";
import { generateToc, generateSlug } from "@/utils/toc";
import { TableOfContents } from "@/components/frontend/TableOfContents";
import { Metadata } from "next";
import { formatPageTitle } from "@/utils/metadata";

// Force dynamic rendering to avoid database connection during build
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}




export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;

  const allBrands = await readBrands();
  const brand = allBrands.find((b) => b.slug === resolvedParams.slug && b.status === "active");

  if (!brand) {
    return {
      title: formatPageTitle("Brand Not Found"),
    };
  }

  return {
    title: formatPageTitle(brand.metaTitle || brand.name),
    description: brand.metaDescription || brand.description.substring(0, 160).replace(/<[^>]*>?/gm, ''),
    keywords: brand.metaKeywords,
    openGraph: {
      title: formatPageTitle(brand.metaTitle || brand.name),
      description: brand.metaDescription || brand.description.substring(0, 160).replace(/<[^>]*>?/gm, ''),
      images: brand.image || brand.logo ? [{ url: brand.image || brand.logo }] : undefined,
    },
    alternates: {
      canonical: `/brand/${brand.slug}`,
    },
  };
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;

  const [allBrands, allFaqs] = await Promise.all([
    readBrands(),
    readActiveFaqs()
  ]);
  const activeBrands = allBrands.filter((b) => b.status === "active");
  const brand = activeBrands.find(b => b.slug === resolvedParams.slug);

  if (!brand) {
    notFound();
  }

  // Filter FAQs specific to this brand (supporting multi-select comma separated pageKeys)
  const faqs = allFaqs.filter(faq => faq.pageKey && faq.pageKey.split(',').includes(`brand-${resolvedParams.slug}`));

  const { html: descriptionHtml, toc: descriptionToc } = generateToc(sanitizeHtml(brand.description || ""));

  const hasCapabilities = brand.capabilitiesTitle || brand.capabilitiesHeading || brand.capabilitiesPoints;
  const capabilitiesTitleHtml = brand.capabilitiesTitle || "Brand Capabilities";
  const capabilitiesTitleText = capabilitiesTitleHtml.replace(/<[^>]*>?/gm, '');
  const capabilitiesId = generateSlug(capabilitiesTitleText);
  const capabilitiesToc = hasCapabilities ? [{ id: capabilitiesId, text: capabilitiesTitleText, level: 3 }] : [];

  const processedExtraCards = brand.extraCards?.map(card => {
    const { html, toc } = generateToc(sanitizeHtml(card.description || ""));
    const headingId = generateSlug(card.heading);
    return { ...card, processedHtml: html, toc: [{ id: headingId, text: card.heading.replace(/<[^>]*>?/gm, ''), level: 3 }, ...toc] };
  }) || [];

  const faqTitle = "Frequently Asked Questions";
  const faqId = generateSlug(faqTitle);
  const faqToc = faqs.length > 0 ? [{ id: faqId, text: faqTitle, level: 3 }] : [];

  const fullToc = [
    ...descriptionToc,
    ...capabilitiesToc,
    ...processedExtraCards.flatMap(c => c.toc),
    ...faqToc
  ];

  const categoryName = brand.category || "Panzer IT Portfolio";

  // Capabilities points are now rendered directly as HTML from JoditEditor
  const pointsHtml = brand.capabilitiesPoints || "";

  const faqSchema = faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  } : null;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.panzerit.com';

  const brandSchema = {
    "@context": "https://schema.org",
    "@type": "Brand",
    "name": brand.name,
    "description": brand.metaDescription || brand.description.substring(0, 160).replace(/<[^>]*>?/gm, ''),
    "logo": brand.logo || brand.image,
    "image": brand.image ? {
      "@type": "ImageObject",
      "url": brand.image,
      "name": brand.imageTitle || brand.name,
      "caption": brand.imageCaption || undefined,
      "description": brand.imageDescription || undefined
    } : undefined,
    "url": `${siteUrl}/brand/${brand.slug}`
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(brandSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <style>{`
        /* Fix iPad and tablet layout */
        @media (max-width: 1024px) {
          .panzer-page-brand-details .panzer-brand-detail-layout {
            grid-template-columns: 1fr !important;
            gap: 20px;
          }
          .panzer-page-brand-details .panzer-brand-detail-sidebar {
            position: static !important;
            top: auto !important;
          }
          .panzer-page-brand-details .panzer-brand-detail-sidebar-inner {
            position: static !important;
            top: auto !important;
            display: flex;
            flex-direction: column;
            gap: 18px;
          }
        }
      `}</style>
      <BrandDetailSticky />
      <Breadcrumb
        title={brand.name}
        paths={[{ name: "Brand", url: "/brand" }, { name: brand.name }]}
        image={brand.image || brand.logo || "/assets/images/hero/brand.png"}
        imageAlt={brand.imageAlt || brand.imageTitle || brand.name}
        imageTitle={brand.imageTitle}
        imageCaption={brand.imageCaption}
        imageDescription={brand.imageDescription}
        hideDescription={true}
      />

      <section className="panzer-brand-detail-section bg-light">
        <div className="container">
          <div className="panzer-brand-detail-layout">
            <aside className="panzer-brand-detail-sidebar" aria-label="Brand navigation">
              <div className="panzer-brand-detail-sidebar-inner">
                <div className="panzer-brand-detail-side-card">
                  <h2>Brands</h2>
                  <nav>
                    {activeBrands.map((b) => (
                      <Link href={`/brand/${b.slug}`} key={b.id} className={b.id === brand.id ? "active" : ""}>
                        <span>{b.name}</span>
                        <i className="fa-solid fa-arrow-right"></i>
                      </Link>
                    ))}
                  </nav>
                </div>

                {/* <TableOfContents toc={fullToc} /> */}

                <div className="panzer-brand-detail-help">
                  <span className="panzer-brand-detail-help-icon">
                    <i className="fa-solid fa-headset"></i>
                  </span>
                  <h3>Need Brand Guidance?</h3>
                  <p>Talk to Panzer IT for the right security, backup and data protection brand fit.</p>
                  <Link href="/contact">
                    <span>Contact Us</span>
                    <i className="fa-solid fa-arrow-right"></i>
                  </Link>
                </div>
              </div>
            </aside>

            <div className="panzer-brand-detail-content">
              <div className="panzer-brand-detail-hero" style={{ display: "block", marginBottom: "28px" }}>
                {/* Text Content (Category, Title, Description) - Image removed, now in breadcrumb */}
                <div style={{ display: "block", clear: "none" }}>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    {categoryName ? categoryName.split(',').map(c => c.trim()).filter(Boolean).map((cat, idx) => (
                      <div key={idx} className="panzer-brand-detail-pill">{cat}</div>
                    )) : (
                      <div className="panzer-brand-detail-pill">Panzer IT Portfolio</div>
                    )}
                  </div>
                  <h2 style={{ marginTop: "20px", marginBottom: "20px" }}>{brand.name}</h2>
                  <div className="panzer-brand-detail-hero-text editor-content" dangerouslySetInnerHTML={{ __html: descriptionHtml }} style={{ display: "block", width: "auto" }} />
                </div>
              </div>

              {hasCapabilities ? (
                <div className="panzer-brand-detail-capabilities">
                  <h3 id={capabilitiesId} className="editor-content-heading" dangerouslySetInnerHTML={{ __html: capabilitiesTitleHtml }} />
                  {brand.capabilitiesHeading && (
                    <div className="editor-content" dangerouslySetInnerHTML={{ __html: brand.capabilitiesHeading }} />
                  )}
                  {pointsHtml && (
                    <div className="editor-content panzer-brand-detail-capabilities-points" dangerouslySetInnerHTML={{ __html: pointsHtml }} />
                  )}
                </div>
              ) : null}

              {(processedExtraCards && processedExtraCards.length > 0) && (
                <div className="panzer-brand-detail-overview">
                  {processedExtraCards.map((card) => (
                    <div key={card.id}>
                      <h3 id={generateSlug(card.heading)} className="editor-content-heading" dangerouslySetInnerHTML={{ __html: card.heading }} />
                      <div className="editor-content" dangerouslySetInnerHTML={{ __html: card.processedHtml }} />
                    </div>
                  ))}
                </div>
              )}

              {faqs.length > 0 && (
                <div className="panzer-brand-detail-faq">
                  <h3 id={faqId}>Frequently Asked Questions</h3>
                  {faqs.map((faq, index) => (
                    <details key={faq.id} open={index === 0}>
                      <summary>
                        <span>{String(index + 1).padStart(2, "0")}. {faq.question}</span>
                        <i className="fa-solid fa-chevron-down"></i>
                      </summary>
                      <div className="editor-content" dangerouslySetInnerHTML={{ __html: faq.answer }} />
                    </details>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
