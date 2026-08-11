import { Breadcrumb } from "@/components/frontend/Breadcrumb";
import { Metadata } from 'next';
import { getSeoData } from '@/app/admin/settings/seo/seoStore';
import { readPosts, readCategories } from "@/app/admin/posts/blogStore";
import { BlogGridClient } from "@/components/frontend/BlogGridClient";
import { createPageMetadata } from '@/utils/metadata';

const fallbackImages = [
  "/assets/images/blog/blog01.webp",
  "/assets/images/blog/blog02.webp",
  "/assets/images/blog/blog03.webp",
  "/assets/images/blog/blog-grid01.webp",
  "/assets/images/blog/blog-grid02.webp",
  "/assets/images/blog/blog-grid03.webp",
];

type PageProps = {
  params: Promise<{ tagName: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const tagName = decodeURIComponent(resolvedParams.tagName);
  const seo = await getSeoData('seo_blog_grid');
  return createPageMetadata({
    ...seo,
    metaTitle: `${tagName} - Blog Tags | Panzer IT`,
  }, `/blog/tag/${encodeURIComponent(tagName)}`);
}

export default async function TagPage({ params }: PageProps) {
  const resolvedParams = await params;
  const tagName = decodeURIComponent(resolvedParams.tagName);

  const [posts, categories] = await Promise.all([readPosts(), readCategories()]);
  let published = posts.filter((p) => p.status === "published");
  
  if (tagName) {
    published = published.filter((p) => p.tags && p.tags.includes(tagName));
  }

  const categoryById = new Map(categories.map((c) => [c.id, c.name]));

  return (
    <>
      <Breadcrumb title={tagName} paths={[{ name: "Blogs", url: "/blog" }, { name: tagName }]} image="/assets/images/hero/breadblog.png" />

      <section className="tv-blog-section space bg-light">
        <div className="container">
          <BlogGridClient 
            posts={published} 
            fallbackImages={fallbackImages} 
            categoryMap={Object.fromEntries(categoryById)} 
          />
        </div>
      </section>
    </>
  );
}
