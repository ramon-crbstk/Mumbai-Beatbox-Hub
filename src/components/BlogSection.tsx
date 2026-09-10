import React, { useState, useEffect } from 'react';
import { BlogPostRecord } from '../types';
import { BookOpen, User, Calendar, Plus, X, Check, AlertCircle, Sparkles } from 'lucide-react';
import { fetchPublishedBlogs, submitPublicBlog, getLocalBlogs } from '../lib/supabase';

export const BlogSection: React.FC = () => {
  const [blogs, setBlogs] = useState<BlogPostRecord[]>(() => 
    getLocalBlogs().filter((b) => b.published)
  );
  const [activeReadingBlog, setActiveReadingBlog] = useState<BlogPostRecord | null>(null);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [publisherName, setPublisherName] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetchPublishedBlogs().then((data) => {
      if (isMounted && data) {
        setBlogs(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenSubmit = () => {
    setTitle('');
    setPublisherName('');
    setContent('');
    setSubmitStatus(null);
    setSubmitModalOpen(true);
  };

  const handleBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !publisherName.trim()) {
      setSubmitStatus({
        type: 'error',
        message: "Please fill in Blog Title, Publisher's Name, and Blog Content.",
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    const res = await submitPublicBlog({
      title: title.trim(),
      author: publisherName.trim(),
      content: content.trim(),
      category: 'Community Voice',
    });

    setIsSubmitting(false);

    if (res.success) {
      setSubmitStatus({
        type: 'success',
        message: 'Your blog has been submitted for admin approval! Once approved, it will be published live here.',
      });
      setTitle('');
      setPublisherName('');
      setContent('');
    } else {
      setSubmitStatus({
        type: 'error',
        message: res.error || 'Failed to submit blog. Please check your connection.',
      });
    }
  };

  return (
    <section id="blog" className="py-16 md:py-24 bg-[#14120F] border-b-2 border-[#FFC93C]/20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#14120F] text-[#FFC93C] border border-[#FFC93C] text-xs font-mono font-bold uppercase tracking-widest mb-3">
              <BookOpen className="w-3.5 h-3.5" />
              <span>DISPATCHES & DRILLS</span>
            </div>
            <h2 className="font-['Anton'] text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight text-[#F4EFE4]">
              From the Hub Journal
            </h2>
            <p className="text-sm sm:text-base text-[#F4EFE4]/70 font-mono mt-1 max-w-xl">
              Vocal health guides, cypher histories, and sound design breakdowns from our core collective and community writers.
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Submit Blog Action Button */}
            <button
              type="button"
              id="submit-blog-trigger-btn"
              onClick={handleOpenSubmit}
              className="px-5 py-3 bg-[#FFC93C] hover:bg-[#ffe082] text-[#14120F] font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-2 border-[#14120F] shadow-[3px_3px_0px_0px_#FFC93C] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Submit a Blog</span>
            </button>
          </div>
        </div>

        {/* Blog Post Cards Grid */}
        {blogs.length === 0 ? (
          <div className="bg-[#1A1713] border-2 border-dashed border-[#F4EFE4]/20 p-12 text-center">
            <BookOpen className="w-12 h-12 text-[#F4EFE4]/30 mx-auto mb-3" />
            <h3 className="font-['Anton'] text-2xl uppercase tracking-tight text-[#F4EFE4] mb-2">
              Hub Journal Under Review
            </h3>
            <p className="text-xs sm:text-sm font-mono text-[#F4EFE4]/60 max-w-md mx-auto mb-6">
              Be the first community member to publish! Submit your article on beatbox techniques, battle routines, or street stories.
            </p>
            <button
              type="button"
              onClick={handleOpenSubmit}
              className="px-4 py-2 bg-[#FFC93C] text-[#14120F] font-mono text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Submit First Post</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((post) => (
              <article
                key={post.id}
                id={`blog-card-${post.id}`}
                className="bg-[#F4EFE4] text-[#14120F] border-2 border-[#14120F] p-6 sm:p-7 shadow-[6px_6px_0px_0px_#FFC93C] hover:shadow-[8px_8px_0px_0px_#E4402A] hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  {/* Meta header */}
                  <div className="flex items-center justify-between border-b border-[#14120F]/20 pb-3 mb-4 text-xs font-mono text-[#14120F]/70">
                    <span className="font-bold uppercase text-[#E4402A]">
                      {post.category || 'COMMUNITY POST'}
                    </span>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#14120F]" />
                      <span>{new Date(post.published_at || post.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-['Anton'] text-xl sm:text-2xl uppercase tracking-tight text-[#14120F] group-hover:text-[#E4402A] transition-colors leading-snug mb-3">
                    {post.title}
                  </h3>

                  {/* Publisher / Author Name */}
                  <div className="flex items-center gap-1.5 text-xs font-mono text-[#14120F]/80 mb-3 bg-[#E5DFC8] px-2.5 py-1 w-fit border border-[#14120F]/20">
                    <User className="w-3 h-3 text-[#E4402A]" />
                    <span>By <strong className="text-[#14120F]">{post.author}</strong></span>
                  </div>

                  {/* Excerpt / Content snippet */}
                  <p className="text-sm font-sans text-[#14120F]/85 leading-relaxed line-clamp-3 mb-6">
                    {post.excerpt || post.content}
                  </p>
                </div>

                {/* Footer with Read Post Action */}
                <div className="pt-4 border-t border-[#14120F]/20 flex items-center justify-between">
                  <span className="text-xs font-mono text-[#14120F]/60">
                    {Math.max(1, Math.ceil(post.content.length / 500))} min read
                  </span>

                  <button
                    type="button"
                    id={`read-post-btn-${post.id}`}
                    onClick={() => setActiveReadingBlog(post)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#14120F] text-[#FFC93C] hover:bg-[#E4402A] hover:text-[#F4EFE4] text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    <span>Read Post</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* ======================================================== */}
        {/* PUBLIC BLOG SUBMISSION MODAL                             */}
        {/* ======================================================== */}
        {submitModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
            <div
              id="submit-blog-modal"
              className="bg-[#1A1713] text-[#F4EFE4] border-2 border-[#FFC93C] w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-[10px_10px_0px_0px_#FFC93C]"
            >
              <div className="flex items-center justify-between border-b border-[#F4EFE4]/15 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#FFC93C]" />
                  <h3 className="font-['Anton'] text-2xl uppercase tracking-tight text-[#F4EFE4]">
                    Submit a Community Blog
                  </h3>
                </div>
                <button
                  type="button"
                  id="close-submit-modal-btn"
                  onClick={() => setSubmitModalOpen(false)}
                  className="p-1.5 text-[#F4EFE4]/60 hover:text-[#F4EFE4] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {submitStatus && (
                <div
                  className={`p-4 mb-6 border font-mono text-xs flex items-start gap-2.5 ${
                    submitStatus.type === 'success'
                      ? 'bg-emerald-950/50 border-emerald-500 text-emerald-300'
                      : 'bg-red-950/50 border-red-500 text-red-300'
                  }`}
                >
                  {submitStatus.type === 'success' ? (
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  )}
                  <span>{submitStatus.message}</span>
                </div>
              )}

              <form onSubmit={handleBlogSubmit} className="space-y-4">
                {/* Blog Title */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#FFC93C] mb-1.5">
                    Blog Title *
                  </label>
                  <input
                    type="text"
                    id="blog-title-input"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Finding Balance in Throat Bass: Mumbai Cypher Chronicles"
                    className="w-full px-3.5 py-2.5 bg-[#14120F] border border-[#F4EFE4]/20 text-[#F4EFE4] font-sans text-sm focus:border-[#FFC93C] focus:outline-none"
                  />
                </div>

                {/* Publisher's Name */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#FFC93C] mb-1.5">
                    Blog Publisher's Name *
                  </label>
                  <input
                    type="text"
                    id="blog-publisher-input"
                    required
                    value={publisherName}
                    onChange={(e) => setPublisherName(e.target.value)}
                    placeholder="e.g., Kabir 'BeatDrop' Sharma"
                    className="w-full px-3.5 py-2.5 bg-[#14120F] border border-[#F4EFE4]/20 text-[#F4EFE4] font-sans text-sm focus:border-[#FFC93C] focus:outline-none"
                  />
                </div>

                {/* Blog Content */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#FFC93C] mb-1.5">
                    Blog Content *
                  </label>
                  <textarea
                    id="blog-content-input"
                    required
                    rows={8}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Share your techniques, sound breakdowns, advice for beginners, or stories from Mumbai jams..."
                    className="w-full px-3.5 py-2.5 bg-[#14120F] border border-[#F4EFE4]/20 text-[#F4EFE4] font-sans text-sm focus:border-[#FFC93C] focus:outline-none leading-relaxed"
                  />
                </div>

                <div className="p-3 bg-[#14120F] border border-[#F4EFE4]/10 text-xs font-mono text-[#F4EFE4]/60">
                  Notice: All blog submissions are stored in Supabase and reviewed by hub admins before appearing on the public website.
                </div>

                {/* Submit Button */}
                <div className="pt-4 border-t border-[#F4EFE4]/15 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSubmitModalOpen(false)}
                    className="px-4 py-2 bg-transparent text-[#F4EFE4]/70 font-mono text-xs uppercase cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    id="submit-blog-btn"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-[#FFC93C] hover:bg-[#ffe082] text-[#14120F] font-mono text-xs font-bold uppercase tracking-wider border-2 border-[#14120F] shadow-[3px_3px_0px_0px_#14120F] cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Blog for Approval'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* READ BLOG READER MODAL (WITH CLOSE BLOG BUTTON)          */}
        {/* ======================================================== */}
        {activeReadingBlog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
            <div
              id="read-blog-modal"
              className="bg-[#F4EFE4] text-[#14120F] border-4 border-[#14120F] w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-10 shadow-[12px_12px_0px_0px_#FFC93C] flex flex-col justify-between"
            >
              {/* Header & Meta */}
              <div>
                <div className="flex items-start justify-between border-b-2 border-[#14120F] pb-4 mb-6">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 bg-[#E4402A] text-[#F4EFE4] font-mono text-xs font-bold uppercase tracking-wider mb-2">
                      {activeReadingBlog.category || 'COMMUNITY ARTICLE'}
                    </span>
                    <h2 className="font-['Anton'] text-2xl sm:text-4xl uppercase tracking-tight text-[#14120F] leading-tight">
                      {activeReadingBlog.title}
                    </h2>
                    
                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#14120F]/80 mt-3">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#E4402A]" />
                        <span>Published by: <strong className="text-[#14120F]">{activeReadingBlog.author}</strong></span>
                      </div>
                      <span>&bull;</span>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#14120F]" />
                        <span>{new Date(activeReadingBlog.published_at || activeReadingBlog.created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    id="close-blog-top-btn"
                    onClick={() => setActiveReadingBlog(null)}
                    aria-label="Close Blog"
                    className="p-2 text-[#14120F]/70 hover:text-[#14120F] hover:bg-[#E5DFC8] cursor-pointer"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Blog Content */}
                <div className="text-base sm:text-lg text-[#14120F] font-sans leading-relaxed whitespace-pre-wrap space-y-4 mb-8 bg-[#FAF6EE] p-6 border border-[#14120F]/20">
                  {activeReadingBlog.content}
                </div>
              </div>

              {/* Reader Bottom Action Bar */}
              <div className="pt-4 border-t-2 border-[#14120F] flex items-center justify-between">
                <span className="text-xs font-mono text-[#14120F]/60">
                  Mumbai Beatbox Hub &bull; Community Archive
                </span>

                {/* Prominent Close Blog Button */}
                <button
                  type="button"
                  id="close-blog-bottom-btn"
                  onClick={() => setActiveReadingBlog(null)}
                  className="px-6 py-3 bg-[#14120F] hover:bg-[#E4402A] text-[#FFC93C] hover:text-[#F4EFE4] font-mono text-xs font-bold uppercase tracking-wider border-2 border-[#14120F] shadow-[3px_3px_0px_0px_#14120F] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  <span>Close Blog</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
