import { Breadcrumb } from "@/components/frontend/Breadcrumb";
import { SolutionDetailSticky } from "@/components/frontend/SolutionDetailSticky";
import Image from "next/image";
import Link from "next/link";
import { readSolutions } from "@/app/admin/solutions/solutionStore";
import { readActiveFaqs } from "@/app/admin/faqs/faqStore";
import { notFound } from "next/navigation";
import { sanitizeHtml } from "@/utils/sanitize";
import { generateToc, generateSlug } from "@/utils/toc";
import { TableOfContents } from "@/components/frontend/TableOfContents";
import { Metadata } from "next";
import { formatPageTitle } from "@/utils/metadata";

// Force dynamic rendering to avoid database connection during build
export const dynamic = 'force-dynamic';

const solutionCategories = [
  "Scopd DLP with UEBA",
  "Vulnerability Scanner, Assessment & VAPT",
  "Employee Monitoring Solution",
  "Most Advanced Anti-Malware",
  "Backup & Disaster Recovery",
  "IAM | PAM | PSM & DBAM",
];

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;

  const solutions = await readSolutions();
  const solution = solutions.find((s) => s.slug === slug);

  if (!solution) {
    return {
      title: formatPageTitle("Solution Not Found"),
    };
  }

  return {
    title: formatPageTitle(solution.metaTitle || solution.title),
    description: solution.metaDescription || solution.description.substring(0, 160).replace(/<[^>]*>?/gm, ''),
    keywords: solution.metaKeywords,
    openGraph: {
      title: solution.metaTitle || solution.title,
      description: solution.metaDescription || solution.description.substring(0, 160).replace(/<[^>]*>?/gm, ''),
      images: solution.image ? [{ url: solution.image }] : undefined,
    },
    alternates: {
      canonical: `/solution/${solution.slug}`,
    },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const [solutions, allFaqs] = await Promise.all([
    readSolutions(),
    readActiveFaqs()
  ]);

  const solution = solutions.find((s) => s.slug === slug);

  if (!solution) {
    notFound();
  }

  // Filter FAQs specific to this solution (supporting multi-select comma separated pageKeys)
  const faqs = allFaqs.filter(faq => faq.pageKey && faq.pageKey.split(',').includes(`solution-${slug}`));

  const faqSchema = faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question.replace(/<[^>]*>?/gm, '').trim(),
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer.replace(/<[^>]*>?/gm, '').trim()
      }
    }))
  } : null;

  const { html: descriptionHtml, toc: descriptionToc } = generateToc(sanitizeHtml(solution.description || ""));

  const featureCardsToc = (solution.featureCards || []).map(item => {
    const plainTitle = item.title.replace(/<[^>]*>?/gm, '').trim();
    return {
      id: generateSlug(plainTitle),
      text: plainTitle,
      level: 3
    };
  });

  let processedExtraCards: any[] = [];
  let extraCardsToc: any[] = [];

  if (solution.extraCards && solution.extraCards.length > 0) {
    processedExtraCards = solution.extraCards.map((card) => {
      const { html, toc } = generateToc(sanitizeHtml(card.description || ""));
      const headingId = generateSlug(card.heading);
      
      // We still add to TOC, but keep in mind heading might have HTML now
      // The generateSlug will strip HTML internally if it just uses regex to remove non-words
      extraCardsToc.push({ id: headingId, text: card.heading.replace(/<[^>]*>?/gm, ''), level: 3 }, ...toc);
      
      return { ...card, processedHtml: html, headingId };
    });
  }

  const implFlowTitle = "Implementation Flow";
  const implFlowId = generateSlug(implFlowTitle);
  const implFlowToc = (solution.implementationSteps && solution.implementationSteps.length > 0)
    ? [{ id: implFlowId, text: implFlowTitle, level: 3 }]
    : [];

  const faqTitle = "Frequently Asked Questions";
  const faqId = generateSlug(faqTitle);
  const faqToc = faqs.length > 0 ? [{ id: faqId, text: faqTitle, level: 3 }] : [];

  const fullToc = [
    ...descriptionToc,
    ...featureCardsToc,
    ...extraCardsToc,
    ...implFlowToc,
    ...faqToc
  ];

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.panzerit.com';

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": solution.metaTitle || solution.title,
    "description": solution.metaDescription || solution.description.substring(0, 160).replace(/<[^>]*>?/gm, ''),
    "provider": {
      "@type": "Organization",
      "name": "Panzer IT",
      "url": siteUrl,
      "logo": `${siteUrl}/assets/images/logo/logo.png`
    },
    "image": solution.image ? {
      "@type": "ImageObject",
      "url": solution.image,
      "name": solution.imageTitle || solution.title,
      "caption": solution.imageCaption || undefined,
      "description": solution.imageDescription || undefined
    } : undefined,
    "url": `${siteUrl}/solution/${solution.slug}`
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
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
          .panzer-page-solution-details .panzer-solution-detail-layout {
            grid-template-columns: 1fr !important;
            gap: 20px;
          }
          .panzer-page-solution-details .panzer-solution-detail-sidebar {
            position: static !important;
            top: auto !important;
          }
          .panzer-page-solution-details .panzer-solution-detail-sidebar-inner {
            position: static !important;
            top: auto !important;
            display: flex;
            flex-direction: column;
            gap: 18px;
          }
        }

        @media only screen 
  and (min-width: 834px) 
  and (max-width: 1194px) {
    .panzer-page-solution-details .panzer-solution-detail-layout {
        display: grid;
        grid-template-columns: minmax(240px, 320px) minmax(0, 1fr) !important;
        gap: 30px;
        align-items: start;
    }
}
        .faq-question-title * {
          margin-bottom: 0 !important;
          margin-top: 0 !important;
          display: inline !important;
        }
      `}</style>
      <SolutionDetailSticky />
      <Breadcrumb
        title={solution.title}
        paths={[{ name: "Solution", url: "/solution" }, { name: solution.title }]}
        image={solution.image || "/assets/images/hero/solution.png"}
        imageAlt={solution.imageAlt || solution.imageTitle || solution.title}
        imageTitle={solution.imageTitle}
        imageCaption={solution.imageCaption}
        imageDescription={solution.imageDescription}
        hideDescription={true}
      />

      <section className="panzer-solution-detail-section bg-light">
        <div className="container">
          <div className="panzer-solution-detail-layout">
            <aside className="panzer-solution-detail-sidebar" aria-label="Solution categories">
              <div className="panzer-solution-detail-sidebar-inner">
                <div className="panzer-solution-detail-side-card">
                  <h2>Solutions</h2>
                  <nav>
                    {solutions.map((solution) => (
                      <Link
                        href={`/solution/${solution.slug}`}  // ← dynamic slug route
                        key={solution.id}
                        className={solution.slug === slug ? "active" : undefined}  // ← highlight current
                      >
                        <span>{solution.title}</span>
                        <i className="fa-solid fa-arrow-right"></i>
                      </Link>
                    ))}
                  </nav>
                </div>

                {/* <TableOfContents toc={fullToc} /> */}

                <div className="panzer-solution-detail-help">
                  <span className="panzer-solution-detail-help-icon">
                    <i className="fa-solid fa-headset"></i>
                  </span>
                  <h3>Need Solution Guidance?</h3>
                  <p>Talk to Panzer IT for the right security, backup and data protection solution fit.</p>
                  <Link href="/contact">
                    <span>Contact Us</span>
                    <i className="fa-solid fa-arrow-right"></i>
                  </Link>
                </div>
              </div>
            </aside>

            <div className="panzer-solution-detail-content">
              <div className="panzer-solution-detail-hero" style={{ display: "block" }}>
                {/* 2. Text Content (Title, Description) - Image removed, now in breadcrumb */}
                <div style={{ display: "block", clear: "none" }}>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    {solution.category ? solution.category.split(',').map(c => c.trim()).filter(Boolean).map((cat, idx) => (
                      <div key={idx} className="panzer-solution-detail-pill">{cat}</div>
                    )) : (
                      <div className="panzer-solution-detail-pill">Panzer IT Portfolio</div>
                    )}
                  </div>
                  <h2 style={{ marginTop: "20px", marginBottom: "20px" }}>{solution.title}</h2>
                  <div className="panzer-solution-detail-hero-text editor-content" dangerouslySetInnerHTML={{ __html: descriptionHtml }} style={{ display: "block", width: "auto" }} />
                </div>
              </div>

              <div className="panzer-solution-detail-highlights">
                {(() => {
                  const staticIcons = ["fa-shield-halved", "fa-user-lock", "fa-rotate", "fa-bug-slash"];
                  return (solution.featureCards || []).map((item, index) => {
                    const plainTitle = item.title.replace(/<[^>]*>?/gm, '').trim();
                    return (
                      <article key={item.id}>
                        <span>
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.imageAlt || plainTitle}
                              title={item.imageTitle || plainTitle}
                              data-caption={item.imageCaption}
                              data-description={item.imageDescription}
                              style={{ width: '60%', height: '60%', objectFit: 'contain' }}
                            />
                          ) : (
                            <i className={`fa-solid ${staticIcons[index % staticIcons.length]}`}></i>
                          )}
                        </span>
                        <h3 id={generateSlug(plainTitle)} dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.title) }}></h3>
                        <div className="editor-content" dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.description) }}></div>
                      </article>
                    );
                  });
                })()}
              </div>

              {(processedExtraCards && processedExtraCards.length > 0) && (
                <div className="panzer-solution-detail-overview">
                  {processedExtraCards.map((card) => (
                    <div key={card.id}>
                      <h3 id={card.headingId} className="editor-content-heading" dangerouslySetInnerHTML={{ __html: card.heading }} />
                      <div className="editor-content" dangerouslySetInnerHTML={{ __html: card.processedHtml }} />
                    </div>
                  ))}
                </div>
              )}

              <div className="panzer-solution-detail-process">
                <h3 id={implFlowId}>Implementation Flow</h3>
                <div>
                  {(solution.implementationSteps || []).map((item) => (
                    <article key={item.id}>
                      <span>{item.step}</span>
                      <h4 dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.title) }}></h4>
                      <div className="editor-content" dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.description) }}></div>
                    </article>
                  ))}
                </div>
              </div>

              {faqs.length > 0 && (
                <div className="panzer-solution-detail-faq">
                  <h3 id={faqId}>Frequently Asked Questions</h3>
                  {faqs.map((faq, index) => (
                    <details key={faq.id} open={index === 0}>
                      <summary>
                        <span className="d-flex align-items-center gap-1 faq-question-title">
                          <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(faq.question) }} />
                        </span>
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
