"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import { apiFetch } from "@/shared/lib/api";
import { resolveImageUrl } from "@/shared/utils/format";

interface ProductReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    productId: number;
    name: string;
    image?: string;
    colorName?: string;
    sizeName?: string;
    variantInfo?: string;
  } | null;
  onReviewSuccess?: (productId: number) => void;
}

const RATING_LABELS: Record<number, { text: string; color: string }> = {
  1: { text: "Rất không hài lòng", color: "text-red-500" },
  2: { text: "Không hài lòng", color: "text-orange-500" },
  3: { text: "Bình thường", color: "text-amber-500" },
  4: { text: "Hài lòng", color: "text-lime-600" },
  5: { text: "Rất tuyệt vời!", color: "text-emerald-600" },
};

export default function ProductReviewModal({
  isOpen,
  onClose,
  product,
  onReviewSuccess,
}: ProductReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);

  useEffect(() => {
    if (!isOpen || !product?.productId) {
      setRating(5);
      setHoverRating(0);
      setComment("");
      setAlreadyReviewed(false);
      return;
    }

    let active = true;
    setChecking(true);
    apiFetch<{ canReview: boolean; reviewed: boolean }>(
      `/catalog/products/${product.productId}/review-eligibility`
    )
      .then((res) => {
        if (!active) return;
        if (res.reviewed) {
          setAlreadyReviewed(true);
        } else {
          setAlreadyReviewed(false);
        }
      })
      .catch(() => {
        // If error, allow form submission attempt
        if (active) setAlreadyReviewed(false);
      })
      .finally(() => {
        if (active) setChecking(false);
      });

    return () => {
      active = false;
    };
  }, [isOpen, product?.productId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, submitting, onClose]);

  if (!isOpen || !product) return null;

  const currentActiveRating = hoverRating || rating;
  const ratingInfo = RATING_LABELS[currentActiveRating] || RATING_LABELS[5];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!comment.trim()) {
      toast.error("Vui lòng nhập nội dung đánh giá sản phẩm");
      return;
    }

    if (comment.trim().length < 5) {
      toast.error("Nội dung đánh giá cần tối thiểu 5 ký tự");
      return;
    }

    setSubmitting(true);
    try {
      await apiFetch(`/catalog/products/${product.productId}/reviews`, {
        method: "POST",
        body: JSON.stringify({
          rating,
          comment: comment.trim(),
        }),
      });

      toast.success("Cảm ơn bạn đã gửi đánh giá cho sản phẩm!");
      if (onReviewSuccess) {
        onReviewSuccess(product.productId);
      }
      onClose();
    } catch (err) {
      toast.error((err as Error).message || "Không thể gửi đánh giá lúc này");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-fade-in cursor-pointer"
      onClick={() => {
        if (!submitting) onClose();
      }}
    >
      <div
        className="relative w-full max-w-[500px] bg-white rounded-[16px] shadow-2xl overflow-hidden border border-[#eaeaea] cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#111] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <i className="fas fa-star text-amber-400 text-[16px]"></i>
            <h3 className="font-bold text-[15px] uppercase tracking-wider text-white m-0">
              Đánh giá sản phẩm
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors text-sm cursor-pointer disabled:opacity-50"
            title="Đóng"
          >
            ✕
          </button>
        </div>

        {/* Product preview */}
        <div className="p-5 border-b border-[#f0f0f0] bg-[#fafafa] flex items-center gap-3.5">
          <div className="relative w-[56px] h-[72px] rounded-[6px] overflow-hidden bg-white border border-[#eaeaea] shrink-0">
            <Image
              src={resolveImageUrl(product.image)}
              alt={product.name}
              fill
              className="object-cover"
              sizes="56px"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-bold text-[14px] text-[#222] truncate">
              {product.name}
            </div>
            <div className="text-[12px] text-[#777] mt-0.5">
              {product.variantInfo ||
                [product.colorName, product.sizeName]
                  .filter(Boolean)
                  .join(" - ")}
            </div>
          </div>
        </div>

        {/* Body content */}
        {checking ? (
          <div className="py-12 text-center text-[#777] text-[14px]">
            <i className="fas fa-spinner fa-spin mr-2"></i> Đang tải thông tin...
          </div>
        ) : alreadyReviewed ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xl mx-auto">
              ✓
            </div>
            <div className="font-bold text-[16px] text-[#222]">
              Bạn đã đánh giá sản phẩm này
            </div>
            <p className="text-[13px] text-[#666] max-w-[340px] mx-auto">
              Cảm ơn bạn đã đóng góp ý kiến để giúp LUXE Fashion nâng cao chất lượng sản phẩm & dịch vụ!
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-[#222] hover:bg-[#000] text-white text-[13px] font-semibold rounded-[8px] transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Star Rating Section */}
            <div className="text-center">
              <label className="block text-[13px] font-semibold text-[#555] uppercase tracking-wide mb-2">
                Chất lượng sản phẩm
              </label>
              <div className="flex items-center justify-center gap-2 my-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-115 cursor-pointer outline-none focus:outline-none"
                    aria-label={`${star} sao`}
                  >
                    <i
                      className={`${
                        star <= currentActiveRating
                          ? "fas fa-star text-amber-400 drop-shadow-[0_1px_2px_rgba(251,191,36,0.5)]"
                          : "far fa-star text-[#d1d5db]"
                      } text-[28px] transition-colors`}
                    />
                  </button>
                ))}
              </div>
              <div className={`text-[13px] font-bold mt-1.5 transition-colors ${ratingInfo.color}`}>
                {ratingInfo.text}
              </div>
            </div>

            {/* Comment Section */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[12px] font-bold text-[#444] uppercase tracking-wide">
                  Cảm nhận của bạn về sản phẩm
                </label>
                <span className="text-[11px] text-[#888]">
                  {comment.length}/500 ký tự
                </span>
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value.slice(0, 500))}
                placeholder="Hãy chia sẻ cảm nhận của bạn về chất liệu vải, độ chuẩn form dáng, đường may..."
                rows={4}
                required
                className="w-full px-3.5 py-2.5 border border-[#d1d5db] rounded-[10px] text-[13.5px] text-[#222] placeholder:text-[#9ca3af] focus:outline-none focus:border-[#222] focus:ring-1 focus:ring-[#222] transition-all resize-none"
              />
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-5 py-2.5 border border-[#d1d5db] hover:bg-[#f3f4f6] text-[#4b5563] text-[13px] font-semibold rounded-[8px] transition-colors cursor-pointer disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-[#111] hover:bg-[#000] text-white text-[13px] font-bold uppercase rounded-[8px] shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Đang gửi...</span>
                  </>
                ) : (
                  <span>Gửi đánh giá</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

