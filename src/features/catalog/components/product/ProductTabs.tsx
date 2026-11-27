"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ProductDetail,
  ProductReviewItem,
} from "@/features/catalog/types/product";
import { useAuthStore } from "@/features/users/stores/auth.store";
import { apiFetch } from "@/shared/lib/api";
import { toast } from "react-toastify";
import { CheckCircle2, Info, Lock } from "lucide-react";

interface ProductTabsProps {
  product: ProductDetail;
  reviews: ProductReviewItem[];
  onReviewAdded: (review: ProductReviewItem) => void;
}

const EDITORIAL_CONTENT_CLASSES =
  "w-full max-w-full overflow-x-hidden break-words [overflow-wrap:anywhere] text-[#333] text-[14px] leading-[1.8] font-normal [&_p]:mb-2.5 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_li]:mb-1.5 [&_strong]:font-semibold [&_strong]:text-[#111] [&_*]:!max-w-full [&_*]:!whitespace-normal";

function sanitizeEditorialHtml(raw: string): string {
  return raw
    .replace(/&nbsp;/gi, " ")
    .replace(/\u00A0/g, " ")
    .replace(/<pre[^>]*>/gi, "<p>")
    .replace(/<\/pre>/gi, "</p>")
    .replace(/style\s*=\s*"([^"]*)"/gi, (_, styles: string) => {
      const cleaned = styles
        .split(";")
        .map((rule) => rule.trim())
        .filter(
          (rule) =>
            rule &&
            !/^(white-space|width|min-width|max-width|word-break|overflow|display|position|left|right|margin-left|margin-right)\s*:/i.test(
              rule
            )
        )
        .join("; ");
      return cleaned ? `style="${cleaned}"` : "";
    })
    .replace(/(<p[^>]*>\s*(?:<br\s*\/?>)?\s*<\/p>\s*){2,}/gi, "<p><br /></p>");
}

function formatRawDescription(desc?: string): string {
  if (!desc || !desc.trim()) return "<p>Đang cập nhật thông tin sản phẩm...</p>";

  // Preserve structured HTML entered via RichTextEditor (Quill) or clean seed HTML
  if (/<(p|div|ul|ol|li|h[1-6]|br)\b/i.test(desc)) {
    return sanitizeEditorialHtml(desc);
  }

  // Plain-text fallback: preserve line breaks cleanly
  const normalized = desc.replace(/\u00A0/g, " ").trim();
  if (normalized.includes("\n")) {
    return normalized
      .split(/\r?\n+/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => `<p>${line}</p>`)
      .join("\n");
  }

  return `<p>${normalized}</p>`;
}

export default function ProductTabs({
  product,
  reviews,
  onReviewAdded,
}: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<
    "intro" | "detail" | "preserve" | "reviews"
  >("intro");
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const { isAuthenticated } = useAuthStore();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [eligibility, setEligibility] = useState<{
    canReview: boolean;
    purchased: boolean;
    reviewed: boolean;
    reason?: string | null;
  } | null>(null);
  const [loadingEligibility, setLoadingEligibility] = useState(false);

  useEffect(() => {
    if (activeTab === "reviews" && isAuthenticated && product?.id) {
      setLoadingEligibility(true);
      apiFetch<{
        canReview: boolean;
        purchased: boolean;
        reviewed: boolean;
        reason?: string | null;
      }>(`/catalog/products/${product.id}/review-eligibility`)
        .then((data) => setEligibility(data))
        .catch(() => setEligibility(null))
        .finally(() => setLoadingEligibility(false));
    }
  }, [activeTab, isAuthenticated, product?.id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.info("Vui lòng đăng nhập để gửi đánh giá sản phẩm.");
      return;
    }
    if (!comment.trim()) {
      toast.error("Vui lòng nhập nội dung đánh giá sản phẩm.");
      return;
    }
    if (comment.trim().length < 5) {
      toast.error("Nội dung đánh giá cần tối thiểu 5 ký tự.");
      return;
    }
    if (comment.trim().length > 500) {
      toast.error("Nội dung đánh giá không vượt quá 500 ký tự.");
      return;
    }
    setSubmitting(true);
    try {
      const created = await apiFetch<ProductReviewItem>(
        `/catalog/products/${product.id}/reviews`,
        {
          method: "POST",
          body: JSON.stringify({ rating, comment: comment.trim() }),
        }
      );
      onReviewAdded(created);
      setComment("");
      setRating(5);
      setEligibility({
        canReview: false,
        purchased: true,
        reviewed: true,
        reason: "ALREADY_REVIEWED",
      });
      toast.success("Gửi đánh giá sản phẩm thành công!");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-[32px]">
      <ul className="flex flex-wrap gap-[24px] border-b border-[#f0f0f0] mb-[24px] list-none p-0">
        <li>
          <button
            onClick={() => setActiveTab("intro")}
            className={`pb-[8px] text-[13px] font-bold uppercase transition-colors cursor-pointer ${
              activeTab === "intro"
                ? "text-[#222] border-b-2 border-[#000]"
                : "text-[#6c757d] hover:text-[#222] border-b-2 border-transparent"
            }`}
          >
            Giới thiệu
          </button>
        </li>
        <li>
          <button
            onClick={() => setActiveTab("detail")}
            className={`pb-[8px] text-[13px] font-bold uppercase transition-colors cursor-pointer ${
              activeTab === "detail"
                ? "text-[#222] border-b-2 border-[#000]"
                : "text-[#6c757d] hover:text-[#222] border-b-2 border-transparent"
            }`}
          >
            Chi tiết sản phẩm
          </button>
        </li>
        <li>
          <button
            onClick={() => setActiveTab("preserve")}
            className={`pb-[8px] text-[13px] font-bold uppercase transition-colors cursor-pointer ${
              activeTab === "preserve"
                ? "text-[#222] border-b-2 border-[#000]"
                : "text-[#6c757d] hover:text-[#222] border-b-2 border-transparent"
            }`}
          >
            Bảo quản
          </button>
        </li>
        <li>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`pb-[8px] text-[13px] font-bold uppercase transition-colors cursor-pointer ${
              activeTab === "reviews"
                ? "text-[#222] border-b-2 border-[#000]"
                : "text-[#6c757d] hover:text-[#222] border-b-2 border-transparent"
            }`}
          >
            Đánh giá ({reviews.length})
          </button>
        </li>
      </ul>

      <div className="tab-content w-full max-w-full overflow-x-hidden">
        {activeTab === "intro" && (
          <div className="animate-fadeIn">
            <div
              className={`relative overflow-hidden transition-all duration-300 ease-in-out ${
                isDescExpanded ? "max-h-none" : "max-h-[180px]"
              }`}
            >
              <div
                className={EDITORIAL_CONTENT_CLASSES}
                dangerouslySetInnerHTML={{
                  __html: formatRawDescription(product.description),
                }}
              />
              {!isDescExpanded && (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white to-transparent" />
              )}
            </div>

            <div className="text-center mt-[16px] relative">
              <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-[#eee] -z-10"></div>
              <button
                onClick={() => setIsDescExpanded(!isDescExpanded)}
                className="bg-white border border-[#eee] rounded-full w-[30px] h-[30px] flex items-center justify-center mx-auto hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <i
                  className={`fas fa-chevron-${
                    isDescExpanded ? "up" : "down"
                  } text-[#666] text-[12px]`}
                ></i>
              </button>
            </div>
          </div>
        )}

        {activeTab === "detail" && (
          <div className="text-[#6c757d] text-[14px] leading-[1.8] animate-fadeIn space-y-2">
            {product.material && (
              <p>
                <strong>Chất liệu:</strong> {product.material}
              </p>
            )}
            <p>
              <strong>Dòng sản phẩm:</strong> {product.category?.name || "LUXE Fashion"}
            </p>
            <p>
              <strong>Thương hiệu:</strong> {product.brand || "LUXE Fashion"}
            </p>
            <p>
              <strong>Mã sản phẩm:</strong> {product.sku || `SP-${product.id}`}
            </p>
            <p>
              <strong>Màu sắc có sẵn:</strong>{" "}
              {product.productColors.map((c) => c.color.name).join(", ")}
            </p>
          </div>
        )}

        {activeTab === "preserve" && (
          <div className="w-full max-w-full overflow-x-hidden animate-fadeIn">
            {product.careInstructions ? (
              product.careInstructions.includes("<") ? (
                <div
                  className={EDITORIAL_CONTENT_CLASSES}
                  dangerouslySetInnerHTML={{
                    __html: sanitizeEditorialHtml(product.careInstructions),
                  }}
                />
              ) : (
                <div className="whitespace-pre-line break-words [overflow-wrap:anywhere] text-[#333] text-[14px] leading-[1.8]">
                  {product.careInstructions.replace(/\u00A0/g, " ")}
                </div>
              )
            ) : (
              <div className="text-[#555] text-[14px] leading-[1.8] space-y-2">
                <p>
                  - Khuyến khích giặt tay với nước lạnh hoặc giặt máy ở chế độ nhẹ để
                  giữ phom dáng chuẩn.
                </p>
                <p>
                  - Không sử dụng chất tẩy rửa mạnh; phơi ở nơi thoáng mát, tránh ánh
                  nắng trực tiếp.
                </p>
                <p>- Ủi ở nhiệt độ thấp dưới 110 độ C.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="animate-fadeIn space-y-6">
            {!isAuthenticated ? (
              <div className="border border-[#e5e5e5] border-l-2 border-l-[#222] p-4 rounded-[4px] bg-[#fafafa] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-[13px] text-[#444] flex items-center gap-2.5">
                  <Lock className="w-4 h-4 text-[#555] shrink-0" strokeWidth={1.6} />
                  <span>Vui lòng đăng nhập để gửi đánh giá cho sản phẩm này.</span>
                </div>
                <Link
                  href="/login"
                  className="bg-[#222] text-white px-4 py-2 text-[12px] font-bold uppercase rounded-tl-[10px] rounded-br-[10px] hover:bg-black transition-colors shrink-0 text-center"
                >
                  Đăng nhập ngay
                </Link>
              </div>
            ) : loadingEligibility ? (
              <div className="border border-[#e5e5e5] p-4 rounded-[4px] bg-[#fafafa] text-[13px] text-[#666] flex items-center gap-2">
                <i className="fas fa-spinner fa-spin"></i>
                <span>Đang kiểm tra quyền đánh giá sản phẩm...</span>
              </div>
            ) : eligibility?.reviewed ? (
              <div className="border border-[#e5e5e5] border-l-2 border-l-[#222] bg-[#fafafa] text-[#333] p-4 rounded-[4px] text-[13px] flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#222] mt-0.5 shrink-0" strokeWidth={1.75} />
                <div>
                  <strong className="font-semibold text-[#111] block mb-0.5">
                    Bạn đã gửi đánh giá cho sản phẩm này
                  </strong>
                  <span className="text-[#555]">
                    Cảm ơn phản hồi của bạn đã giúp LUXE nâng cao chất lượng sản phẩm.
                  </span>
                </div>
              </div>
            ) : !eligibility?.purchased ? (
              <div className="border border-[#e5e5e5] border-l-2 border-l-[#222] bg-[#fafafa] text-[#333] p-4 rounded-[4px] text-[13px] flex items-start gap-2.5">
                <Info className="w-4 h-4 text-[#222] mt-0.5 shrink-0" strokeWidth={1.75} />
                <div>
                  <strong className="font-semibold text-[#111] block mb-0.5">
                    Quyền đánh giá dành riêng cho khách hàng đã mua sản phẩm
                  </strong>
                  <span className="text-[#555]">
                    Chỉ những khách hàng{" "}
                    <strong className="text-[#222] font-medium">
                      đã mua và nhận hàng thành công
                    </strong>{" "}
                    sản phẩm này mới có thể viết đánh giá.
                  </span>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSubmitReview}
                className="border border-[#e7e8e9] p-4 rounded-[8px] bg-[#f8f9fa]"
              >
                <div className="font-semibold text-[14px] text-[#222] mb-2 flex items-center gap-2">
                  <i className="fas fa-badge-check text-emerald-600"></i>
                  <span>Đã mua hàng thành công • Gửi đánh giá của bạn</span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[13px] text-[#6c6d70]">Số sao:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="text-[18px] text-[#ffc107] bg-transparent border-none cursor-pointer"
                    >
                      <i
                        className={
                          star <= rating ? "fas fa-star" : "far fa-star"
                        }
                      ></i>
                    </button>
                  ))}
                </div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value.slice(0, 500))}
                  minLength={5}
                  maxLength={500}
                  rows={3}
                  required
                  placeholder="Chia sẻ cảm nhận thực tế về chất liệu, đường may và kiểu dáng sản phẩm (5 - 500 ký tự)..."
                  className="w-full border border-[#ddd] rounded-[4px] p-3 text-[13px] bg-white outline-none focus:border-[#222] mb-1.5"
                />
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] text-[#888]">
                    {comment.length}/500 ký tự
                  </span>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#222] text-white px-5 py-2 text-[13px] font-bold uppercase rounded-tl-[12px] rounded-br-[12px] hover:bg-black transition-colors cursor-pointer"
                >
                  {submitting ? "Đang gửi..." : "Gửi đánh giá"}
                </button>
              </form>
            )}

            {reviews.length === 0 ? (
              <div className="text-[#6c757d] text-[14px]">
                Chưa có đánh giá nào cho sản phẩm này.
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="border-b border-[#eee] pb-4 last:border-b-0"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-[14px] text-[#222]">
                        {rev.customerName}
                      </span>
                      <span className="text-[12px] text-[#999]">
                        {rev.createdAt}
                      </span>
                    </div>
                    <div className="text-[#ffc107] text-[12px] mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <i
                          key={i}
                          className={
                            i < rev.rating ? "fas fa-star" : "far fa-star"
                          }
                        ></i>
                      ))}
                    </div>
                    <p className="text-[14px] text-[#333] mb-2">{rev.comment}</p>
                    {rev.reply && (
                      <div className="bg-[#f8f9fa] border-l-2 border-[#222] pl-3 py-2 text-[13px] text-[#555]">
                        <strong className="text-[#222]">LUXE Phản hồi:</strong>{" "}
                        {rev.reply}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

