import { Breadcrumb } from "@/components/frontend/Breadcrumb";
import { SolutionsGridClient } from "@/components/frontend/SolutionsGridClient";
import Image from "next/image";
import { Metadata } from 'next';
import { getSeoData } from '@/app/admin/settings/seo/seoStore';
import { readSolutions, readCategories } from "@/app/admin/solutions/solutionStore";
import { createPageMetadata } from '@/utils/metadata';
import { notFound } from 'next/navigation';

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const categories = await readCategories();
  const category = categories.find(c => c.slug === slug);
  const seo = await getSeoData('seo_solution');
  return createPageMetadata({
    ...seo,
    metaTitle: category ? `${category.name} | Solutions` : seo.metaTitle
  }, `/solution/category/${slug}`);
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;

  const [solutions, categories] = await Promise.all([readSolutions(), readCategories()]);
  
  const category = categories.find(c => c.slug === slug);
  if (!category) {
    notFound();
  }

  const published = solutions.filter((s) => s.status === "active" && s.category === category.name);

  return (
    <>
      <Breadcrumb title={category.name} paths={[{ name: "Solutions", url: "/solution" }, { name: category.name }]} image="/assets/images/hero/solution.png" />

      <section className="tv-service-section space-bottom inner style-2 bg-light pt-100 ">
        <div className="tv-service-inner position-relative overflow-hidden mx-30 ml-mx-0">
          <div className="container">

            <div className="row">
              <div className="col-lg-12 text-center">
                <div className="title-wrap two white" data-wow-duration="2s" data-wow-delay=".0s">
                  <div className="sub-title-2">Solutions</div>
                  <h2 className="sec-title text-dark no-title-animation">
                    {category.name}
                  </h2>
                </div>
              </div>
            </div>
            <SolutionsGridClient solutions={published} />
          </div>
        </div>
      </section>
    </>
  );
}
