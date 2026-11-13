import React from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { SeoHead } from '../components/SeoHead';
import { BLOG_POSTS, getBlogPostBySlug } from '../data/blogPosts';
import {
  buildAssetUrl,
  buildCanonicalUrl,
  getSiteBaseUrl,
  PAGE_SEO,
  SITE_BRAND,
} from '../data/seoConfig';
import { ArrowLeft, ArrowRight, BookOpen, Calendar, ChevronRight, Clock } from 'lucide-react';

export function BlogIndexPage() {
  return (
    <div className="min-h-screen bg-[#14120F] text-white font-sans selection:bg-[#FFC93C] selection:text-[#14120F] flex flex-col">
      <SeoHead
        meta={PAGE_SEO.blog}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Blog & Guides', path: '/blog' },
        ]}
      />
      <Navbar />

      <div className="bg-[#181512] border-b border-white/10">
        <nav
          aria-label="Breadcrumb"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center gap-2 text-xs font-mono text-white/65"
        >
          <Link to="/" className="hover:text-[#FFC93C] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-white/40" aria-hidden="true" />
          <span className="text-[#FFC93C] font-semibold" aria-current="page">
            Blog &amp; Beatboxing Guides
          </span>
        </nav>
      </div>

      <main className="flex-1 py-16 md:py-24 bg-[#14120F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFC93C] text-[#14120F] text-xs font-mono font-bold uppercase tracking-widest border border-[#14120F] shadow-[2px_2px_0px_0px_#E4402A]">
              <BookOpen className="w-3.5 h-3.5" />
              <span>COMMUNITY EDITORIAL // GUIDES &amp; CULTURE</span>
            </div>
            <h1 className="font-['Anton'] text-4xl sm:text-5xl md:text-6xl uppercase tracking-tight text-white">
              Mumbai Beatbox Hub Blog
            </h1>
            <p className="text-sm sm:text-base text-white/75 font-mono leading-relaxed">
              Original guides on beatboxing in Mumbai, beginner vocal percussion techniques, Indian beatboxers, and upcoming community events.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {BLOG_POSTS.map((post) => (
              <article
                key={post.slug}
                className="bg-[#181512] border-2 border-white/15 hover:border-[#FFC93C] p-6 flex flex-col justify-between shadow-[4px_4px_0px_0px_#14120F] hover:shadow-[6px_6px_0px_0px_#E4402A] transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 text-[11px] font-mono">
                    <span className="px-2 py-0.5 bg-[#FFC93C] text-[#14120F] font-bold uppercase">
                      {post.category}
                    </span>
                    <span className="text-white/55 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readingTime}
                    </span>
                  </div>

                  <h2 className="font-['Anton'] text-2xl uppercase tracking-tight text-white leading-snug">
                    <Link to={`/blog/${post.slug}`} className="hover:text-[#FFC93C] transition-colors">
                      {post.title}
                    </Link>
                  </h2>

                  <p className="text-sm text-white/75 leading-relaxed">{post.excerpt}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                  <span className="text-white/50">{post.publishedDate}</span>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="text-[#FFC93C] font-bold uppercase tracking-wider inline-flex items-center gap-1 hover:underline"
                  >
                    <span>Read Guide</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getBlogPostBySlug(slug) : undefined;

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const baseUrl = getSiteBaseUrl();
  const articlePath = `/blog/${post.slug}`;
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.metaDescription,
    datePublished: post.publishedDate,
    dateModified: post.publishedDate,
    inLanguage: 'en',
    keywords: post.keywords.join(', '),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': buildCanonicalUrl(articlePath, baseUrl),
    },
    image: [buildAssetUrl(SITE_BRAND.defaultOgImage, baseUrl)],
    author: {
      '@type': 'Organization',
      name: SITE_BRAND.name,
      url: `${baseUrl}/`,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_BRAND.name,
      logo: {
        '@type': 'ImageObject',
        url: buildAssetUrl(SITE_BRAND.defaultLogo, baseUrl),
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#14120F] text-white font-sans selection:bg-[#FFC93C] selection:text-[#14120F] flex flex-col">
      <SeoHead
        meta={{
          path: articlePath,
          title: post.seoTitle,
          description: post.metaDescription,
          keywords: post.keywords.join(', '),
          ogType: 'article',
          ogImage: SITE_BRAND.defaultOgImage,
          ogImageAlt: post.title,
        }}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Blog', path: '/blog' },
          { name: post.title, path: articlePath },
        ]}
        structuredData={[articleSchema]}
      />
      <Navbar />

      <div className="bg-[#181512] border-b border-white/10">
        <nav
          aria-label="Breadcrumb"
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center gap-2 text-xs font-mono text-white/65"
        >
          <Link to="/" className="hover:text-[#FFC93C] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-white/40" aria-hidden="true" />
          <Link to="/blog" className="hover:text-[#FFC93C] transition-colors">
            Blog
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-white/40" aria-hidden="true" />
          <span className="text-[#FFC93C] font-semibold truncate" aria-current="page">
            {post.title}
          </span>
        </nav>
      </div>

      <main className="flex-1 py-12 md:py-20 bg-[#14120F]">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="space-y-4 border-b border-white/15 pb-8">
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
              <span className="px-2.5 py-1 bg-[#FFC93C] text-[#14120F] font-bold uppercase">
                {post.category}
              </span>
              <span className="text-white/60 inline-flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#E4402A]" />
                {post.publishedDate}
              </span>
              <span className="text-white/60 inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#FFC93C]" />
                {post.readingTime}
              </span>
            </div>

            <h1 className="font-['Anton'] text-3xl sm:text-5xl uppercase tracking-tight text-white leading-[1.06]">
              {post.title}
            </h1>

            <p className="text-base sm:text-lg text-white/85 leading-relaxed">
              {post.excerpt}
            </p>
          </div>

          <div className="space-y-8">
            {post.sections.map((section) => (
              <section key={section.heading} className="space-y-3">
                <h2 className="font-['Anton'] text-2xl sm:text-3xl uppercase tracking-tight text-[#FFC93C]">
                  {section.heading}
                </h2>
                {section.paragraphs.map((paragraph, pIdx) => (
                  <p key={pIdx} className="text-sm sm:text-base text-white/85 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
                {section.bullets && section.bullets.length > 0 && (
                  <ul className="space-y-2 pt-2 pl-4 border-l-2 border-[#E4402A] font-mono text-xs sm:text-sm text-white/85">
                    {section.bullets.map((bullet, bIdx) => (
                      <li key={bIdx} className="leading-relaxed">
                        {bullet}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          {/* Related Internal Links */}
          <div className="bg-[#181512] border-2 border-[#E4402A]/50 p-6 space-y-4">
            <h2 className="font-['Anton'] text-xl uppercase text-white">
              Continue Exploring Mumbai Beatbox Hub
            </h2>
            <div className="flex flex-wrap gap-3 font-mono text-xs font-bold uppercase">
              {post.relatedLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#FFC93C] text-[#14120F] hover:bg-white border border-[#14120F] transition-colors"
                >
                  <span>{link.label}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              ))}
              <Link
                to="/blog"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#14120F] text-white border border-white/30 hover:border-[#FFC93C] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>All Articles</span>
              </Link>
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
