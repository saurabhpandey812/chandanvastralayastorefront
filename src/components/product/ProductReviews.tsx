'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ImagePlus, Star, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { timeAgo } from '@/lib/format';
import { emptyBreakdown, type ReviewSummary } from '@/lib/reviewStats';
import {
  collapseSpaces,
  MAX_REVIEW_IMAGES,
  reviewCommentError,
  reviewRatingError,
} from '@/lib/validation';
import { useAuthStore } from '@/store/authStore';
import { useHydrated } from '@/store/hydrate';

export type PublicReview = {
  id: string;
  userName: string;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
  createdAt: string;
};

type Props = {
  productId: string;
  fallbackAverage: number;
  fallbackCount: number;
  onRated?: (summary: ReviewSummary) => void;
};

export default function ProductReviews({ productId, fallbackAverage, fallbackCount, onRated }: Props) {
  const pathname = usePathname();
  const hydrated = useHydrated((s) => s.hydrated);
  const user = useAuthStore((s) => s.user);
  const fileRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<PublicReview[]>([]);
  const [summary, setSummary] = useState<ReviewSummary>({
    average: fallbackAverage,
    count: 0,
    breakdown: emptyBreakdown(),
  });
  const [mine, setMine] = useState<PublicReview | null>(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);

  const displayAverage = summary.count ? summary.average : fallbackAverage;
  const displayCount = summary.count || fallbackCount;
  const bars = useMemo(
    () => [5, 4, 3, 2, 1].map((star) => summary.breakdown[star as 1 | 2 | 3 | 4 | 5] || 0),
    [summary]
  );
  const barTotal = Math.max(summary.count, 1);

  async function loadReviews() {
    const res = await api<{ items?: PublicReview[]; summary?: ReviewSummary }>(
      `/api/products/${encodeURIComponent(productId)}/reviews`
    );
    if (!res.ok) return;
    setItems(Array.isArray(res.data.items) ? res.data.items : []);
    if (res.data.summary) {
      setSummary(res.data.summary);
      onRated?.(res.data.summary);
    }
  }

  async function loadMine() {
    if (!user) {
      setMine(null);
      return;
    }
    const res = await api<{ review?: PublicReview | null }>(
      `/api/products/${encodeURIComponent(productId)}/reviews/me`
    );
    if (!res.ok) return;
    const review = res.data.review || null;
    setMine(review);
    if (review) {
      setRating(review.rating);
      setComment(review.comment || '');
      setImages(review.images || []);
    }
  }

  useEffect(() => {
    void loadReviews();
  }, [productId]);

  useEffect(() => {
    if (!hydrated) return;
    void loadMine();
  }, [hydrated, user?.id, productId]);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    const remaining = MAX_REVIEW_IMAGES - images.length;
    if (remaining <= 0) {
      setErrors((prev) => ({ ...prev, images: `You can add up to ${MAX_REVIEW_IMAGES} photos` }));
      return;
    }
    const body = new FormData();
    Array.from(fileList).slice(0, remaining).forEach((file) => body.append('files', file));
    setUploading(true);
    setErrors((prev) => ({ ...prev, images: '' }));
    try {
      const res = await fetch('/api/uploads/reviews', { method: 'POST', body });
      const data = (await res.json().catch(() => ({}))) as { urls?: string[]; error?: string };
      const urls = data.urls || [];
      if (!res.ok || !urls.length) {
        setErrors((prev) => ({ ...prev, images: data.error || 'Could not upload photos' }));
        return;
      }
      setImages((prev) => [...prev, ...urls].slice(0, MAX_REVIEW_IMAGES));
    } catch {
      setErrors((prev) => ({ ...prev, images: 'Could not upload photos' }));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    const ratingErr = reviewRatingError(rating);
    const commentErr = reviewCommentError(comment);
    if (ratingErr) next.rating = ratingErr;
    if (commentErr) next.comment = commentErr;
    setErrors(next);
    setFormError('');
    setSaved(false);
    if (Object.keys(next).length) return;

    setSaving(true);
    const res = await api<{ review?: PublicReview; summary?: ReviewSummary }>(
      `/api/products/${encodeURIComponent(productId)}/reviews`,
      {
        method: 'POST',
        body: JSON.stringify({
          rating,
          comment: collapseSpaces(comment),
          images,
        }),
      }
    );
    setSaving(false);
    if (!res.ok || !res.data.review) {
      setFormError(res.ok ? 'Could not save your review' : res.error);
      return;
    }
    setMine(res.data.review);
    setSaved(true);
    await loadReviews();
  }

  return (
    <div className="mt-8 pt-5 border-t border-[#d4d5d9]">
      <p className="text-[16px] font-bold uppercase tracking-wide mb-4">Ratings & Reviews</p>
      <div className="flex gap-8 items-start">
        <div className="text-center">
          <p className="text-[40px] font-extrabold leading-none flex items-center justify-center gap-1">
            {displayAverage.toFixed(1)}
            <Star size={22} className="fill-[#14958f] text-[#14958f]" />
          </p>
          <p className="text-[12px] text-[#535766] mt-2">
            {displayCount.toLocaleString('en-IN')} {summary.count ? 'Reviews' : 'Ratings'}
          </p>
        </div>
        <div className="flex-1 space-y-1.5">
          {[5, 4, 3, 2, 1].map((star, i) => (
            <div key={star} className="flex items-center gap-2 text-[12px] text-[#535766]">
              <span className="w-4">{star}</span>
              <Star size={10} />
              <div className="flex-1 h-1.5 bg-[#f5f5f6] rounded overflow-hidden">
                <div
                  className="h-full bg-[#14958f]"
                  style={{ width: `${Math.min(100, (bars[i] / barTotal) * 100)}%` }}
                />
              </div>
              <span className="w-10 text-right">{bars[i]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 border border-[#eaeaec] p-4">
        <p className="text-[14px] font-bold text-[#282c3f]">
          {mine ? 'Update your review' : 'Rate this product'}
        </p>
        {!hydrated ? (
          <p className="text-[13px] text-[#94969f] mt-2">Loading...</p>
        ) : !user ? (
          <p className="text-[13px] text-[#535766] mt-2">
            <Link href={`/login?next=${encodeURIComponent(pathname)}`} className="font-bold text-[#ff3f6c]">
              Log in
            </Link>{' '}
            to rate this product and write feedback.
          </p>
        ) : (
          <form onSubmit={onSubmit} noValidate className="mt-3 space-y-3">
            <div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = (hover || rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHover(star)}
                      onClick={() => {
                        setRating(star);
                        setErrors((prev) => ({ ...prev, rating: '' }));
                      }}
                      onMouseLeave={() => setHover(0)}
                      className="p-0.5"
                      aria-label={`${star} star`}
                    >
                      <Star
                        size={22}
                        className={active ? 'fill-[#ff3f6c] text-[#ff3f6c]' : 'text-[#d4d5d9]'}
                      />
                    </button>
                  );
                })}
              </div>
              {errors.rating && <p className="text-[12px] text-[#ff3f6c] mt-1">{errors.rating}</p>}
            </div>
            <label className="block">
              <span className="text-[12px] font-bold text-[#535766]">Your feedback</span>
              <textarea
                value={comment}
                onChange={(e) => {
                  setComment(e.target.value.slice(0, 800));
                  setErrors((prev) => ({ ...prev, comment: '' }));
                }}
                rows={3}
                maxLength={800}
                placeholder="Fit, fabric, colour — jo bhi useful ho likho"
                className="mt-1 w-full border border-[#d4d5d9] px-3 py-2 text-[14px] outline-none resize-y"
              />
              {errors.comment && <p className="text-[12px] text-[#ff3f6c] mt-1">{errors.comment}</p>}
            </label>
            <div>
              <span className="text-[12px] font-bold text-[#535766]">Add photos</span>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
              <button
                type="button"
                disabled={uploading || images.length >= MAX_REVIEW_IMAGES}
                onClick={() => fileRef.current?.click()}
                className="mt-1 h-10 px-3 border border-[#d4d5d9] text-[13px] font-bold inline-flex items-center gap-2 disabled:opacity-50"
              >
                <ImagePlus size={16} />
                {uploading ? 'Uploading...' : 'Upload photos'}
              </button>
              <p className="text-[11px] text-[#94969f] mt-1">JPG, PNG, WEBP · max {MAX_REVIEW_IMAGES} photos</p>
              {images.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {images.map((src) => (
                    <div key={src} className="relative h-16 w-16 border border-[#eaeaec] bg-[#f5f5f6]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImages((prev) => prev.filter((item) => item !== src))}
                        className="absolute right-0.5 top-0.5 bg-white/90 p-0.5"
                        aria-label="Remove photo"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {errors.images && <p className="text-[12px] text-[#ff3f6c] mt-1">{errors.images}</p>}
            </div>
            {formError && <p className="text-[13px] font-semibold text-[#ff3f6c]">{formError}</p>}
            {saved && <p className="text-[13px] font-semibold text-[#03a685]">Review save ho gayi.</p>}
            <button
              type="submit"
              disabled={saving || uploading}
              className="h-10 px-4 bg-[#ff3f6c] hover:bg-[#e63660] text-white text-[13px] font-bold uppercase tracking-wide disabled:opacity-50"
            >
              {saving ? 'Saving...' : mine ? 'Update review' : 'Submit review'}
            </button>
          </form>
        )}
      </div>

      <div className="mt-5 space-y-4">
        {items.length === 0 ? (
          <p className="text-[13px] text-[#94969f] pt-2">No customer reviews yet. Be the first to write one.</p>
        ) : (
          items.map((review) => (
            <div key={review.id} className="border-t border-[#eaeaec] pt-4">
              <p className="text-[13px] font-bold flex items-center gap-2">
                <span className="bg-[#14958f] text-white text-[11px] px-1.5 py-0.5 rounded-sm">
                  {review.rating.toFixed(1)} ★
                </span>
                {review.userName}
              </p>
              <p className="text-[13px] text-[#535766] mt-1">{review.comment}</p>
              {(review.images || []).length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {review.images!.map((src) => (
                    <div key={src} className="relative h-20 w-16 border border-[#eaeaec] bg-[#f5f5f6]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
              <p className="text-[11px] text-[#94969f] mt-2">{timeAgo(review.createdAt)}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
