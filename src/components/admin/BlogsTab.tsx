import React, { useState } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Eye, 
  User, 
  Check, 
  X, 
  AlertCircle, 
  Plus,
  Edit3,
  Globe,
  FileText,
  Tag
} from 'lucide-react';
import { BlogPostRecord } from '../../types';
import { 
  createBlog, 
  updateBlog, 
  deleteBlog, 
  togglePublishBlog,
  generateSlug 
} from '../../lib/supabase';

interface BlogsTabProps {
  items: BlogPostRecord[];
  onRefresh: () => void;
}

export function BlogsTab({ items, onRefresh }: BlogsTabProps) {
  const [filter, setFilter] = useState<'all' | 'published' | 'drafts'>('all');
  const [readingBlog, setReadingBlog] = useState<BlogPostRecord | null>(null);
  const [editingBlog, setEditingBlog] = useState<BlogPostRecord | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Create Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManual, setSlugManual] = useState(false);
  const [excerpt, setExcerpt] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('Hub Journal');
  const [content, setContent] = useState('');
  const [published, setPublished] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Edit Modal State
  const [editTitle, setEditTitle] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editExcerpt, setEditExcerpt] = useState('');
  const [editAuthor, setEditAuthor] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editPublished, setEditPublished] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);

  const publishedCount = items.filter((b) => b.published).length;
  const draftsCount = items.filter((b) => !b.published).length;

  const filteredItems = items.filter((item) => {
    if (filter === 'published') return item.published;
    if (filter === 'drafts') return !item.published;
    return true;
  });

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slugManual) {
      setSlug(generateSlug(val));
    }
  };

  const handleOpenCreateModal = () => {
    setTitle('');
    setSlug('');
    setSlugManual(false);
    setExcerpt('');
    setAuthor('');
    setCategory('Hub Journal');
    setContent('');
    setPublished(true);
    setCreateModalOpen(true);
  };

  const handleOpenEditModal = (blog: BlogPostRecord) => {
    setEditingBlog(blog);
    setEditTitle(blog.title);
    setEditSlug(blog.slug);
    setEditExcerpt(blog.excerpt || '');
    setEditAuthor(blog.author);
    setEditCategory(blog.category || 'Hub Journal');
    setEditContent(blog.content);
    setEditPublished(blog.published);
  };

  const handleTogglePublish = async (blog: BlogPostRecord) => {
    setUpdatingId(blog.id);
    const newStatus = !blog.published;
    const res = await togglePublishBlog(blog.id, newStatus);
    setUpdatingId(null);

    if (res.success) {
      setNotification({
        type: 'success',
        message: newStatus 
          ? 'Blog published! It is now live on the public website.' 
          : 'Blog unpublished and moved to drafts.',
      });
      onRefresh();
      if (readingBlog?.id === blog.id) {
        setReadingBlog((prev) => (prev ? { ...prev, published: newStatus } : null));
      }
    } else {
      setNotification({ type: 'error', message: res.error || 'Failed to toggle publish status.' });
    }
  };

  const handleDelete = async (id: string) => {
    setUpdatingId(id);
    const res = await deleteBlog(id);
    setUpdatingId(null);
    setDeleteConfirmId(null);

    if (res.success) {
      setNotification({ type: 'success', message: 'Blog post deleted from public.blogs.' });
      onRefresh();
      if (readingBlog?.id === id) {
        setReadingBlog(null);
      }
    } else {
      setNotification({ type: 'error', message: res.error || 'Failed to delete blog post.' });
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !author.trim()) {
      setNotification({ type: 'error', message: 'Title, author, and content are required.' });
      return;
    }

    setSubmitting(true);
    const res = await createBlog({
      title: title.trim(),
      slug: slug.trim() || generateSlug(title),
      excerpt: excerpt.trim(),
      content: content.trim(),
      author: author.trim(),
      category: category.trim() || 'Hub Journal',
      published,
    });

    setSubmitting(false);

    if (res.success) {
      setCreateModalOpen(false);
      setNotification({
        type: 'success',
        message: published 
          ? 'Blog post created and published live!' 
          : 'Blog post saved as draft.',
      });
      onRefresh();
    } else {
      setNotification({ type: 'error', message: res.error || 'Failed to create blog post.' });
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlog) return;
    if (!editTitle.trim() || !editContent.trim() || !editAuthor.trim()) {
      setNotification({ type: 'error', message: 'Title, author, and content are required.' });
      return;
    }

    setEditSubmitting(true);
    const res = await updateBlog(editingBlog.id, {
      title: editTitle.trim(),
      slug: editSlug.trim() || generateSlug(editTitle),
      excerpt: editExcerpt.trim(),
      content: editContent.trim(),
      author: editAuthor.trim(),
      category: editCategory.trim() || 'Hub Journal',
      published: editPublished,
    });

    setEditSubmitting(false);

    if (res.success) {
      setEditingBlog(null);
      setNotification({
        type: 'success',
        message: 'Blog post updated successfully in public.blogs!',
      });
      onRefresh();
      if (readingBlog?.id === editingBlog.id && res.blog) {
        setReadingBlog(res.blog);
      }
    } else {
      setNotification({ type: 'error', message: res.error || 'Failed to update blog post.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1A1713] p-6 border border-[#F4EFE4]/15">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[#FFC93C] text-[#14120F] text-xs font-mono font-bold uppercase tracking-wider mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>EDITORIAL & ARTICLES</span>
          </div>
          <h2 className="font-['Anton'] text-2xl sm:text-3xl uppercase tracking-tight text-[#F4EFE4]">
            Blog Management
          </h2>
          <p className="text-sm font-mono text-[#F4EFE4]/70 mt-1">
            Create, edit, publish, or remove community articles and journal posts stored in Supabase.
          </p>
        </div>

        <button
          type="button"
          id="admin-create-blog-btn"
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 bg-[#FFC93C] hover:bg-[#ffe082] text-[#14120F] font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border border-[#14120F] shadow-[3px_3px_0px_0px_#14120F] cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Write New Blog</span>
        </button>
      </div>

      {/* Notification */}
      {notification && (
        <div
          className={`p-4 border flex items-center justify-between font-mono text-xs ${
            notification.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
              : 'bg-red-950/40 border-red-500/50 text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-current hover:opacity-75 cursor-pointer p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#F4EFE4]/15 pb-3 font-mono text-xs">
        <button
          type="button"
          id="filter-all-blogs-btn"
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 uppercase transition-colors cursor-pointer ${
            filter === 'all'
              ? 'bg-[#FFC93C] text-[#14120F] font-bold'
              : 'bg-[#1A1713] text-[#F4EFE4]/70 hover:text-[#F4EFE4] border border-[#F4EFE4]/10'
          }`}
        >
          All ({items.length})
        </button>

        <button
          type="button"
          id="filter-published-blogs-btn"
          onClick={() => setFilter('published')}
          className={`px-3 py-1.5 uppercase flex items-center gap-2 transition-colors cursor-pointer ${
            filter === 'published'
              ? 'bg-[#FFC93C] text-[#14120F] font-bold'
              : 'bg-[#1A1713] text-[#F4EFE4]/70 hover:text-[#F4EFE4] border border-[#F4EFE4]/10'
          }`}
        >
          <span>Published ({publishedCount})</span>
        </button>

        <button
          type="button"
          id="filter-drafts-blogs-btn"
          onClick={() => setFilter('drafts')}
          className={`px-3 py-1.5 uppercase flex items-center gap-2 transition-colors cursor-pointer ${
            filter === 'drafts'
              ? 'bg-[#FFC93C] text-[#14120F] font-bold'
              : 'bg-[#1A1713] text-[#F4EFE4]/70 hover:text-[#F4EFE4] border border-[#F4EFE4]/10'
          }`}
        >
          <span>Drafts / Unpublished ({draftsCount})</span>
        </button>
      </div>

      {/* Blogs List */}
      {filteredItems.length === 0 ? (
        <div className="bg-[#1A1713] border border-dashed border-[#F4EFE4]/20 p-12 text-center">
          <BookOpen className="w-12 h-12 text-[#F4EFE4]/30 mx-auto mb-3" />
          <h3 className="font-['Anton'] text-xl uppercase text-[#F4EFE4] mb-1">
            No Blog Articles Found
          </h3>
          <p className="text-xs font-mono text-[#F4EFE4]/60 max-w-sm mx-auto mb-4">
            {filter === 'drafts'
              ? 'There are currently no draft articles.'
              : filter === 'published'
              ? 'There are no published articles yet.'
              : 'Start by publishing your first article to public.blogs.'}
          </p>
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-4 py-2 bg-[#FFC93C] text-[#14120F] font-mono text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Article</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((blog) => {
            const isPublished = blog.published;

            return (
              <div
                key={blog.id}
                id={`admin-blog-${blog.id}`}
                className={`bg-[#1A1713] border-2 p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors ${
                  isPublished
                    ? 'border-emerald-500/40'
                    : 'border-[#FFC93C] shadow-[4px_4px_0px_0px_#FFC93C]/20'
                }`}
              >
                {/* Left side info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5 mb-2">
                    {/* Status Pill */}
                    {isPublished ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-500 text-[#14120F] font-mono text-[10px] font-bold uppercase tracking-wider">
                        <CheckCircle2 className="w-3 h-3" />
                        Published & Live
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#FFC93C] text-[#14120F] font-mono text-[10px] font-bold uppercase tracking-wider">
                        <Clock className="w-3 h-3" />
                        Draft / Unpublished
                      </span>
                    )}

                    <span className="text-xs font-mono text-[#FFC93C] uppercase flex items-center gap-1">
                      <Tag className="w-3 h-3 text-[#FFC93C]/60" />
                      {blog.category || 'Community Voice'}
                    </span>

                    <span className="text-[11px] font-mono text-[#F4EFE4]/50">
                      Slug: <code className="text-[#F4EFE4]/80">/{blog.slug}</code>
                    </span>

                    <span className="text-[11px] font-mono text-[#F4EFE4]/50">
                      Created: {new Date(blog.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-['Anton'] text-xl sm:text-2xl uppercase tracking-tight text-[#F4EFE4] mb-2 leading-snug">
                    {blog.title}
                  </h3>

                  {/* Author */}
                  <div className="flex items-center gap-2 text-xs font-mono text-[#F4EFE4]/80 mb-2">
                    <User className="w-3.5 h-3.5 text-[#FFC93C]" />
                    <span>
                      Author: <strong className="text-[#FFC93C]">{blog.author}</strong>
                    </span>
                  </div>

                  {/* Excerpt */}
                  {blog.excerpt && (
                    <p className="text-xs font-mono text-[#F4EFE4]/60 italic mb-2 line-clamp-1">
                      "{blog.excerpt}"
                    </p>
                  )}

                  {/* Content Preview */}
                  <p className="text-xs text-[#F4EFE4]/70 font-sans line-clamp-2 leading-relaxed">
                    {blog.content}
                  </p>
                </div>

                {/* Right side actions */}
                <div className="flex flex-wrap sm:flex-nowrap md:flex-col lg:flex-row items-center gap-2 shrink-0 border-t md:border-t-0 border-[#F4EFE4]/10 pt-3 md:pt-0">
                  {/* Read Post */}
                  <button
                    type="button"
                    onClick={() => setReadingBlog(blog)}
                    className="px-3 py-2 bg-[#14120F] hover:bg-[#25211B] text-[#F4EFE4] border border-[#F4EFE4]/20 font-mono text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                    title="Read blog full text"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#FFC93C]" />
                    <span>Read</span>
                  </button>

                  {/* Edit Post */}
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(blog)}
                    className="px-3 py-2 bg-[#14120F] hover:bg-[#25211B] text-[#FFC93C] border border-[#FFC93C]/40 font-mono text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                    title="Edit blog post"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  {/* Publish / Unpublish Toggle */}
                  <button
                    type="button"
                    onClick={() => handleTogglePublish(blog)}
                    disabled={updatingId === blog.id}
                    className={`px-3.5 py-2 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                      isPublished
                        ? 'bg-[#14120F] hover:bg-[#25211B] text-[#F4EFE4]/80 border border-[#F4EFE4]/20'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-[#14120F]'
                    }`}
                    title={isPublished ? 'Unpublish to draft' : 'Publish to live website'}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>
                      {updatingId === blog.id
                        ? '...'
                        : isPublished
                        ? 'Unpublish'
                        : 'Publish Live'}
                    </span>
                  </button>

                  {/* Delete */}
                  {deleteConfirmId === blog.id ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleDelete(blog.id)}
                        disabled={updatingId === blog.id}
                        className="px-2 py-1.5 bg-red-600 hover:bg-red-700 text-white font-mono text-xs font-bold uppercase cursor-pointer"
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-2 py-1.5 bg-[#14120F] text-[#F4EFE4]/60 font-mono text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(blog.id)}
                      className="p-2 text-[#F4EFE4]/50 hover:text-red-400 cursor-pointer"
                      title="Delete post"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* READ BLOG READER MODAL (WITH CLOSE BLOG BUTTON)          */}
      {/* ======================================================== */}
      {readingBlog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
          <div
            id="admin-read-blog-modal"
            className="bg-[#1A1713] text-[#F4EFE4] border-2 border-[#FFC93C] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-[10px_10px_0px_0px_#FFC93C] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#F4EFE4]/15 pb-4 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${
                      readingBlog.published
                        ? 'bg-emerald-500 text-[#14120F]'
                        : 'bg-[#FFC93C] text-[#14120F]'
                    }`}
                  >
                    {readingBlog.published ? 'LIVE PUBLISHED' : 'DRAFT'}
                  </span>
                  <span className="text-xs font-mono text-[#FFC93C] uppercase">
                    {readingBlog.category}
                  </span>
                </div>
                <h3 className="font-['Anton'] text-2xl sm:text-3xl uppercase tracking-tight text-[#F4EFE4]">
                  {readingBlog.title}
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[#F4EFE4]/70 mt-2">
                  <span>Author: <strong className="text-[#FFC93C]">{readingBlog.author}</strong></span>
                  <span>&bull;</span>
                  <span>Slug: <code className="text-[#F4EFE4]/90">/{readingBlog.slug}</code></span>
                  <span>&bull;</span>
                  <span>{new Date(readingBlog.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <button
                type="button"
                id="admin-close-blog-x-btn"
                onClick={() => setReadingBlog(null)}
                className="p-1.5 text-[#F4EFE4]/60 hover:text-[#F4EFE4] cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Excerpt if present */}
            {readingBlog.excerpt && (
              <div className="p-3 bg-[#14120F] border-l-2 border-[#FFC93C] text-xs font-mono text-[#F4EFE4]/80 italic mb-4">
                {readingBlog.excerpt}
              </div>
            )}

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto text-sm sm:text-base text-[#F4EFE4]/90 font-sans leading-relaxed whitespace-pre-wrap space-y-4 mb-6 bg-[#14120F] p-5 border border-[#F4EFE4]/10">
              {readingBlog.content}
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-[#F4EFE4]/15 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const target = readingBlog;
                    setReadingBlog(null);
                    handleOpenEditModal(target);
                  }}
                  className="px-4 py-2 bg-[#14120F] hover:bg-[#25211B] text-[#FFC93C] border border-[#FFC93C]/40 font-mono text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Post</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTogglePublish(readingBlog)}
                  disabled={updatingId === readingBlog.id}
                  className={`px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer ${
                    readingBlog.published
                      ? 'bg-[#14120F] text-[#F4EFE4]/80 border border-[#F4EFE4]/20 hover:bg-[#25211B]'
                      : 'bg-emerald-500 text-[#14120F] hover:bg-emerald-400'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  <span>{readingBlog.published ? 'Unpublish' : 'Publish Live'}</span>
                </button>
              </div>

              {/* Close Blog Button */}
              <button
                type="button"
                id="admin-close-blog-btn"
                onClick={() => setReadingBlog(null)}
                className="px-5 py-2 bg-[#FFC93C] hover:bg-[#ffe082] text-[#14120F] font-mono text-xs font-bold uppercase tracking-wider cursor-pointer shadow-[2px_2px_0px_0px_#14120F]"
              >
                Close Blog
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* CREATE BLOG MODAL                                        */}
      {/* ======================================================== */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div
            id="admin-create-blog-modal"
            className="bg-[#1A1713] text-[#F4EFE4] border-2 border-[#FFC93C] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-[10px_10px_0px_0px_#FFC93C]"
          >
            <div className="flex items-center justify-between border-b border-[#F4EFE4]/15 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#FFC93C]" />
                <h3 className="font-['Anton'] text-2xl uppercase tracking-tight text-[#F4EFE4]">
                  Create Blog Post
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="p-1.5 text-[#F4EFE4]/60 hover:text-[#F4EFE4] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#FFC93C] mb-1.5">
                  Blog Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Master Your Inward K Snare and Acoustic Timing"
                  className="w-full px-3.5 py-2.5 bg-[#14120F] border border-[#F4EFE4]/20 text-[#F4EFE4] font-sans text-sm focus:border-[#FFC93C] focus:outline-none"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#FFC93C] mb-1.5">
                  Slug (URL identifier) *
                </label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setSlugManual(true);
                  }}
                  placeholder="e.g. master-your-inward-k-snare"
                  className="w-full px-3.5 py-2.5 bg-[#14120F] border border-[#F4EFE4]/20 text-[#F4EFE4] font-mono text-xs focus:border-[#FFC93C] focus:outline-none"
                />
              </div>

              {/* Author & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#FFC93C] mb-1.5">
                    Author *
                  </label>
                  <input
                    type="text"
                    required
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="e.g. Ramon Bakuri"
                    className="w-full px-3.5 py-2.5 bg-[#14120F] border border-[#F4EFE4]/20 text-[#F4EFE4] font-sans text-sm focus:border-[#FFC93C] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#FFC93C] mb-1.5">
                    Category
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Vocal Science, Cypher Guide, Tutorial"
                    className="w-full px-3.5 py-2.5 bg-[#14120F] border border-[#F4EFE4]/20 text-[#F4EFE4] font-sans text-sm focus:border-[#FFC93C] focus:outline-none"
                  />
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#FFC93C] mb-1.5">
                  Excerpt (Brief Summary)
                </label>
                <input
                  type="text"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Short 1-2 sentence preview for cards..."
                  className="w-full px-3.5 py-2.5 bg-[#14120F] border border-[#F4EFE4]/20 text-[#F4EFE4] font-sans text-sm focus:border-[#FFC93C] focus:outline-none"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#FFC93C] mb-1.5">
                  Blog Content *
                </label>
                <textarea
                  required
                  rows={8}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write the full article content here..."
                  className="w-full px-3.5 py-2.5 bg-[#14120F] border border-[#F4EFE4]/20 text-[#F4EFE4] font-sans text-sm focus:border-[#FFC93C] focus:outline-none leading-relaxed"
                />
              </div>

              {/* Published Toggle */}
              <div className="flex items-center gap-3 p-3 bg-[#14120F] border border-[#F4EFE4]/15">
                <input
                  type="checkbox"
                  id="create-published-checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="w-4 h-4 accent-[#FFC93C] cursor-pointer"
                />
                <label htmlFor="create-published-checkbox" className="text-xs font-mono text-[#F4EFE4] cursor-pointer">
                  Publish immediately (check to make live on public website, uncheck to save as draft)
                </label>
              </div>

              <div className="pt-4 border-t border-[#F4EFE4]/15 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 bg-transparent text-[#F4EFE4]/70 font-mono text-xs uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-[#FFC93C] hover:bg-[#ffe082] text-[#14120F] font-mono text-xs font-bold uppercase tracking-wider border border-[#14120F] cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : published ? 'Publish Blog' : 'Save as Draft'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* EDIT BLOG MODAL                                          */}
      {/* ======================================================== */}
      {editingBlog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div
            id="admin-edit-blog-modal"
            className="bg-[#1A1713] text-[#F4EFE4] border-2 border-[#FFC93C] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-[10px_10px_0px_0px_#FFC93C]"
          >
            <div className="flex items-center justify-between border-b border-[#F4EFE4]/15 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#FFC93C]" />
                <h3 className="font-['Anton'] text-2xl uppercase tracking-tight text-[#F4EFE4]">
                  Edit Blog Post
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingBlog(null)}
                className="p-1.5 text-[#F4EFE4]/60 hover:text-[#F4EFE4] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#FFC93C] mb-1.5">
                  Blog Title *
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#14120F] border border-[#F4EFE4]/20 text-[#F4EFE4] font-sans text-sm focus:border-[#FFC93C] focus:outline-none"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#FFC93C] mb-1.5">
                  Slug (URL identifier) *
                </label>
                <input
                  type="text"
                  required
                  value={editSlug}
                  onChange={(e) => setEditSlug(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#14120F] border border-[#F4EFE4]/20 text-[#F4EFE4] font-mono text-xs focus:border-[#FFC93C] focus:outline-none"
                />
              </div>

              {/* Author & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#FFC93C] mb-1.5">
                    Author *
                  </label>
                  <input
                    type="text"
                    required
                    value={editAuthor}
                    onChange={(e) => setEditAuthor(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#14120F] border border-[#F4EFE4]/20 text-[#F4EFE4] font-sans text-sm focus:border-[#FFC93C] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#FFC93C] mb-1.5">
                    Category
                  </label>
                  <input
                    type="text"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#14120F] border border-[#F4EFE4]/20 text-[#F4EFE4] font-sans text-sm focus:border-[#FFC93C] focus:outline-none"
                  />
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#FFC93C] mb-1.5">
                  Excerpt (Brief Summary)
                </label>
                <input
                  type="text"
                  value={editExcerpt}
                  onChange={(e) => setEditExcerpt(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#14120F] border border-[#F4EFE4]/20 text-[#F4EFE4] font-sans text-sm focus:border-[#FFC93C] focus:outline-none"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#FFC93C] mb-1.5">
                  Blog Content *
                </label>
                <textarea
                  required
                  rows={8}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#14120F] border border-[#F4EFE4]/20 text-[#F4EFE4] font-sans text-sm focus:border-[#FFC93C] focus:outline-none leading-relaxed"
                />
              </div>

              {/* Published Toggle */}
              <div className="flex items-center gap-3 p-3 bg-[#14120F] border border-[#F4EFE4]/15">
                <input
                  type="checkbox"
                  id="edit-published-checkbox"
                  checked={editPublished}
                  onChange={(e) => setEditPublished(e.target.checked)}
                  className="w-4 h-4 accent-[#FFC93C] cursor-pointer"
                />
                <label htmlFor="edit-published-checkbox" className="text-xs font-mono text-[#F4EFE4] cursor-pointer">
                  Published (check to display live on the public website)
                </label>
              </div>

              <div className="pt-4 border-t border-[#F4EFE4]/15 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingBlog(null)}
                  className="px-4 py-2 bg-transparent text-[#F4EFE4]/70 font-mono text-xs uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="px-6 py-2.5 bg-[#FFC93C] hover:bg-[#ffe082] text-[#14120F] font-mono text-xs font-bold uppercase tracking-wider border border-[#14120F] cursor-pointer disabled:opacity-50"
                >
                  {editSubmitting ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
