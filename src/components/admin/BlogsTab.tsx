import React, { useState } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Eye, 
  Clock, 
  User, 
  Check, 
  X, 
  AlertCircle, 
  Filter,
  Plus
} from 'lucide-react';
import { BlogPostRecord } from '../../types';
import { updateBlogStatus, deleteBlog, submitPublicBlog } from '../../lib/supabase';

interface BlogsTabProps {
  items: BlogPostRecord[];
  onRefresh: () => void;
}

export function BlogsTab({ items, onRefresh }: BlogsTabProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [readingBlog, setReadingBlog] = useState<BlogPostRecord | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // New admin blog modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [publisherName, setPublisherName] = useState('');
  const [category, setCategory] = useState('Hub Journal');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const pendingCount = items.filter((b) => b.status === 'pending').length;
  const approvedCount = items.filter((b) => b.status === 'approved').length;

  const filteredItems = items.filter((item) => {
    if (filter === 'pending') return item.status === 'pending';
    if (filter === 'approved') return item.status === 'approved';
    if (filter === 'rejected') return item.status === 'rejected';
    return true;
  });

  const handleApprove = async (id: string) => {
    setUpdatingId(id);
    const res = await updateBlogStatus(id, 'approved');
    setUpdatingId(null);

    if (res.success) {
      setNotification({
        type: 'success',
        message: 'Blog post approved! It is now published live on the public website.',
      });
      onRefresh();
      if (readingBlog?.id === id) {
        setReadingBlog((prev) => (prev ? { ...prev, status: 'approved' } : null));
      }
    } else {
      setNotification({ type: 'error', message: res.error || 'Failed to approve blog post.' });
    }
  };

  const handleReject = async (id: string) => {
    setUpdatingId(id);
    const res = await updateBlogStatus(id, 'rejected');
    setUpdatingId(null);

    if (res.success) {
      setNotification({
        type: 'success',
        message: 'Blog post marked as rejected (not shown publicly).',
      });
      onRefresh();
      if (readingBlog?.id === id) {
        setReadingBlog((prev) => (prev ? { ...prev, status: 'rejected' } : null));
      }
    } else {
      setNotification({ type: 'error', message: res.error || 'Failed to update blog.' });
    }
  };

  const handleDelete = async (id: string) => {
    setUpdatingId(id);
    const res = await deleteBlog(id);
    setUpdatingId(null);
    setDeleteConfirmId(null);

    if (res.success) {
      setNotification({ type: 'success', message: 'Blog post removed from database.' });
      onRefresh();
      if (readingBlog?.id === id) {
        setReadingBlog(null);
      }
    } else {
      setNotification({ type: 'error', message: res.error || 'Failed to delete blog post.' });
    }
  };

  const handleCreateOfficial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !publisherName.trim()) {
      setNotification({ type: 'error', message: 'Title, publisher name, and content are required.' });
      return;
    }

    setSubmitting(true);
    const res = await submitPublicBlog({
      title: title.trim(),
      content: content.trim(),
      publisherName: publisherName.trim(),
      category: category.trim() || 'Hub Journal',
    });

    if (res.success && res.blog) {
      // Auto-approve admin created post
      await updateBlogStatus(res.blog.id, 'approved');
      setSubmitting(false);
      setCreateModalOpen(false);
      setTitle('');
      setContent('');
      setPublisherName('');
      setNotification({
        type: 'success',
        message: 'Official blog post created and published directly!',
      });
      onRefresh();
    } else {
      setSubmitting(false);
      setNotification({ type: 'error', message: res.error || 'Failed to publish post.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1A1713] p-6 border border-[#F4EFE4]/15">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[#FFC93C] text-[#14120F] text-xs font-mono font-bold uppercase tracking-wider mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>EDITORIAL REVIEW & MODERATION</span>
          </div>
          <h2 className="font-['Anton'] text-2xl sm:text-3xl uppercase tracking-tight text-[#F4EFE4]">
            Community Blog Approvals
          </h2>
          <p className="text-sm font-mono text-[#F4EFE4]/70 mt-1">
            Review user submissions, approve posts for the public journal, or publish official articles.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCreateModalOpen(true)}
          className="px-4 py-2.5 bg-[#FFC93C] hover:bg-[#ffe082] text-[#14120F] font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border border-[#14120F] shadow-[3px_3px_0px_0px_#14120F] cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Write Official Post</span>
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
          onClick={() => setFilter('pending')}
          className={`px-3 py-1.5 uppercase flex items-center gap-2 transition-colors cursor-pointer ${
            filter === 'pending'
              ? 'bg-[#FFC93C] text-[#14120F] font-bold'
              : 'bg-[#1A1713] text-[#F4EFE4]/70 hover:text-[#F4EFE4] border border-[#F4EFE4]/10'
          }`}
        >
          <span>Pending Review</span>
          {pendingCount > 0 && (
            <span className="px-1.5 py-0.2 bg-[#E4402A] text-[#F4EFE4] text-[10px] font-bold">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setFilter('approved')}
          className={`px-3 py-1.5 uppercase flex items-center gap-2 transition-colors cursor-pointer ${
            filter === 'approved'
              ? 'bg-[#FFC93C] text-[#14120F] font-bold'
              : 'bg-[#1A1713] text-[#F4EFE4]/70 hover:text-[#F4EFE4] border border-[#F4EFE4]/10'
          }`}
        >
          <span>Approved ({approvedCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setFilter('rejected')}
          className={`px-3 py-1.5 uppercase transition-colors cursor-pointer ${
            filter === 'rejected'
              ? 'bg-[#FFC93C] text-[#14120F] font-bold'
              : 'bg-[#1A1713] text-[#F4EFE4]/70 hover:text-[#F4EFE4] border border-[#F4EFE4]/10'
          }`}
        >
          Rejected ({items.filter((b) => b.status === 'rejected').length})
        </button>
      </div>

      {/* Blogs List */}
      {filteredItems.length === 0 ? (
        <div className="bg-[#1A1713] border border-dashed border-[#F4EFE4]/20 p-12 text-center">
          <BookOpen className="w-12 h-12 text-[#F4EFE4]/30 mx-auto mb-3" />
          <h3 className="font-['Anton'] text-xl uppercase text-[#F4EFE4] mb-1">
            No Blog Submissions Found
          </h3>
          <p className="text-xs font-mono text-[#F4EFE4]/60 max-w-sm mx-auto">
            {filter === 'pending'
              ? 'There are currently no submissions awaiting approval.'
              : 'No blog posts match this filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((blog) => {
            const isPending = blog.status === 'pending';
            const isApproved = blog.status === 'approved';

            return (
              <div
                key={blog.id}
                id={`admin-blog-${blog.id}`}
                className={`bg-[#1A1713] border-2 p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors ${
                  isPending
                    ? 'border-[#FFC93C] shadow-[4px_4px_0px_0px_#FFC93C]/30'
                    : isApproved
                    ? 'border-emerald-500/40'
                    : 'border-[#F4EFE4]/15 opacity-75'
                }`}
              >
                {/* Left side info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5 mb-2">
                    {/* Status Pill */}
                    {isPending && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#FFC93C] text-[#14120F] font-mono text-[10px] font-bold uppercase tracking-wider">
                        <Clock className="w-3 h-3" />
                        Pending Approval
                      </span>
                    )}
                    {isApproved && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-500 text-[#14120F] font-mono text-[10px] font-bold uppercase tracking-wider">
                        <CheckCircle2 className="w-3 h-3" />
                        Approved & Live
                      </span>
                    )}
                    {blog.status === 'rejected' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-red-900/50 text-red-300 font-mono text-[10px] font-bold uppercase tracking-wider border border-red-500/30">
                        <XCircle className="w-3 h-3" />
                        Rejected
                      </span>
                    )}

                    <span className="text-xs font-mono text-[#FFC93C] uppercase">
                      {blog.category || 'Community Voice'}
                    </span>

                    <span className="text-[11px] font-mono text-[#F4EFE4]/50">
                      Submitted: {new Date(blog.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-['Anton'] text-xl sm:text-2xl uppercase tracking-tight text-[#F4EFE4] mb-2 leading-snug">
                    {blog.title}
                  </h3>

                  {/* Publisher */}
                  <div className="flex items-center gap-2 text-xs font-mono text-[#F4EFE4]/80 mb-3">
                    <User className="w-3.5 h-3.5 text-[#FFC93C]" />
                    <span>
                      Publisher: <strong className="text-[#FFC93C]">{blog.publisherName}</strong>
                    </span>
                  </div>

                  {/* Preview excerpt */}
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
                  >
                    <Eye className="w-3.5 h-3.5 text-[#FFC93C]" />
                    <span>Read Post</span>
                  </button>

                  {/* Approve */}
                  {!isApproved && (
                    <button
                      type="button"
                      onClick={() => handleApprove(blog.id)}
                      disabled={updatingId === blog.id}
                      className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-[#14120F] font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      title="Approve for public display"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{updatingId === blog.id ? '...' : 'Approve'}</span>
                    </button>
                  )}

                  {/* Reject */}
                  {isPending && (
                    <button
                      type="button"
                      onClick={() => handleReject(blog.id)}
                      disabled={updatingId === blog.id}
                      className="px-3 py-2 bg-[#14120F] hover:bg-red-950/40 text-red-400 border border-red-500/30 font-mono text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      title="Reject submission"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  )}

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

      {/* Read Blog Modal in Admin */}
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
                      readingBlog.status === 'approved'
                        ? 'bg-emerald-500 text-[#14120F]'
                        : readingBlog.status === 'pending'
                        ? 'bg-[#FFC93C] text-[#14120F]'
                        : 'bg-red-900 text-red-200'
                    }`}
                  >
                    {readingBlog.status.toUpperCase()}
                  </span>
                  <span className="text-xs font-mono text-[#FFC93C] uppercase">
                    {readingBlog.category}
                  </span>
                </div>
                <h3 className="font-['Anton'] text-2xl sm:text-3xl uppercase tracking-tight text-[#F4EFE4]">
                  {readingBlog.title}
                </h3>
                <div className="flex items-center gap-3 text-xs font-mono text-[#F4EFE4]/70 mt-2">
                  <span>Author: <strong className="text-[#FFC93C]">{readingBlog.publisherName}</strong></span>
                  <span>&bull;</span>
                  <span>{new Date(readingBlog.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setReadingBlog(null)}
                className="p-1.5 text-[#F4EFE4]/60 hover:text-[#F4EFE4] cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto text-sm sm:text-base text-[#F4EFE4]/90 font-sans leading-relaxed whitespace-pre-wrap space-y-4 mb-6 bg-[#14120F] p-5 border border-[#F4EFE4]/10">
              {readingBlog.content}
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-[#F4EFE4]/15 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {readingBlog.status !== 'approved' && (
                  <button
                    type="button"
                    onClick={() => handleApprove(readingBlog.id)}
                    disabled={updatingId === readingBlog.id}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-[#14120F] font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve & Publish Live</span>
                  </button>
                )}

                {readingBlog.status === 'pending' && (
                  <button
                    type="button"
                    onClick={() => handleReject(readingBlog.id)}
                    disabled={updatingId === readingBlog.id}
                    className="px-4 py-2 bg-red-950/40 text-red-300 border border-red-500/30 font-mono text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    <span>Reject Post</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setReadingBlog(null)}
                className="px-5 py-2 bg-[#14120F] hover:bg-[#25211B] text-[#F4EFE4] border border-[#F4EFE4]/20 font-mono text-xs uppercase tracking-wider cursor-pointer"
              >
                Close Blog
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Write Official Admin Post Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div
            id="admin-create-blog-modal"
            className="bg-[#1A1713] text-[#F4EFE4] border-2 border-[#FFC93C] w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-[10px_10px_0px_0px_#FFC93C]"
          >
            <div className="flex items-center justify-between border-b border-[#F4EFE4]/15 pb-4 mb-6">
              <h3 className="font-['Anton'] text-2xl uppercase tracking-tight text-[#F4EFE4]">
                Publish Hub Article
              </h3>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="p-1.5 text-[#F4EFE4]/60 hover:text-[#F4EFE4] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOfficial} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#FFC93C] mb-1.5">
                  Blog Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Master Your Spit Snare and Acoustic Timing"
                  className="w-full px-3.5 py-2.5 bg-[#14120F] border border-[#F4EFE4]/20 text-[#F4EFE4] font-sans text-sm focus:border-[#FFC93C] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#FFC93C] mb-1.5">
                    Publisher's Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={publisherName}
                    onChange={(e) => setPublisherName(e.target.value)}
                    placeholder="e.g. Rohan Sub-Zero"
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
                    placeholder="e.g. Vocal Science, Cypher Guide"
                    className="w-full px-3.5 py-2.5 bg-[#14120F] border border-[#F4EFE4]/20 text-[#F4EFE4] font-sans text-sm focus:border-[#FFC93C] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#FFC93C] mb-1.5">
                  Blog Content *
                </label>
                <textarea
                  required
                  rows={8}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your article paragraphs here..."
                  className="w-full px-3.5 py-2.5 bg-[#14120F] border border-[#F4EFE4]/20 text-[#F4EFE4] font-sans text-sm focus:border-[#FFC93C] focus:outline-none"
                />
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
                  {submitting ? 'Publishing...' : 'Publish Article Live'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
