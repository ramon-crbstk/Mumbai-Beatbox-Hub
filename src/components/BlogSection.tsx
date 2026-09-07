import React from 'react';
import { BLOG_POSTS } from '../data/communityData';
import { BookOpen, ArrowUpRight, Clock } from 'lucide-react';

export const BlogSection: React.FC = () => {
  return (
    <section id="blog" className="py-16 md:py-24 bg-[#14120F] border-b-2 border-[#FFC93C]/20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#14120F] text-[#FFC93C] border border-[#FFC93C] text-xs font-mono font-bold uppercase tracking-widest mb-3">
              <BookOpen className="w-3.5 h-3.5" />
              <span>DISPATCHES & DRILLS</span>
            </div>
            <h2 className="font-['Anton'] text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight text-[#F4EFE4]">
              From the Hub Journal
            </h2>
            <p className="text-sm sm:text-base text-[#F4EFE4]/70 font-mono mt-1 max-w-xl">
              Vocal health guides, cypher histories, and sound design breakdowns from our core collective.
            </p>
          </div>

          <div className="text-xs font-mono text-[#FFC93C]">
            COMMUNITY WRITING // ARCHIVE
          </div>
        </div>

        {/* 2-3 Placeholder Post Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {BLOG_POSTS.map((post, idx) => (
            <article
              key={post.id}
              id={`blog-card-${post.id}`}
              className="bg-[#F4EFE4] text-[#14120F] border-2 border-[#14120F] p-6 sm:p-7 shadow-[6px_6px_0px_0px_#FFC93C] hover:shadow-[8px_8px_0px_0px_#E4402A] hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                {/* Meta header */}
                <div className="flex items-center justify-between border-b border-[#14120F]/20 pb-3 mb-4 text-xs font-mono text-[#14120F]/70">
                  <span className="font-bold uppercase text-[#E4402A]">
                    {post.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#14120F]" />
                    <span>{post.readTime}</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-['Anton'] text-xl sm:text-2xl uppercase tracking-tight text-[#14120F] group-hover:text-[#E4402A] transition-colors leading-snug mb-3">
                  {post.title}
                </h3>

                {/* Excerpt */}
                <p className="text-sm font-sans text-[#14120F]/85 leading-relaxed line-clamp-3 mb-6">
                  {post.excerpt}
                </p>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-[#14120F]/20 flex items-center justify-between">
                <span className="text-xs font-mono text-[#14120F]/60">
                  {post.date}
                </span>

                <span className="inline-flex items-center gap-1 text-xs font-mono font-bold uppercase tracking-wider text-[#14120F] group-hover:text-[#E4402A] transition-colors">
                  <span>Read Post</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
};
