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

interface ProductTabsProps {
  product: ProductDetail;
  reviews: ProductReviewItem[];
  onReviewAdded: (review: ProductReviewItem) => void;
}

function formatRawDescription(desc?: string): string {
  if (!desc) return "<p>Đang cập nhật thông tin sản phẩm...</p>";

  // If already clean multi-paragraph HTML from IVY with model specs, use it
  if (desc.includes("<p>") && (desc.includes("<strong>Chiều cao") || desc.includes("<strong>Thông tin mẫu"))) {
    return desc
      .replace(/<ul[^>]*>/gi, "")
      .replace(/<\/ul>/gi, "")
      .replace(/<li[^>]*>/gi, "<p class='mb-3 text-[#333] leading-relaxed'>- ")
      .replace(/<\/li>/gi, "</p>");
  }

  let text = desc.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  let noteInfo = "";
  let modelInfo = "";

  const noteIdx = text.search(/Lưu ý\s*:/i);
  if (noteIdx !== -1) {
    noteInfo = text.substring(noteIdx).replace(/^Lưu ý\s*:\s*/i, "").trim();
    text = text.substring(0, noteIdx).trim();
  }

  const modelIdx = text.search(/Thông tin (?:người )?mẫu\s*:/i);
  if (modelIdx !== -1) {
    modelInfo = text.substring(modelIdx).replace(/^Thông tin (?:người )?mẫu\s*:\s*/i, "").trim();
    text = text.substring(0, modelIdx).trim();
  }

  // Split description paragraphs by ' - ' or '- '
  const bullets = text
    .split(/\s*-\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  let html = "";
  for (const b of bullets) {
    html += `<p class="mb-3 text-[#333] leading-relaxed">- ${b}</p>\n`;
  }

  if (modelInfo) {
    html += `<p class="font-bold text-[#111] mt-5 mb-2.5 text-[14px]">Thông tin mẫu:</p>\n`;
    const height = (modelInfo.match(/Chiều cao[^:]*:\s*([0-9\s]+(?:cm|m)?)/i) || [])[1];
    const weight = (modelInfo.match(/Cân nặng[^:]*:\s*([0-9\s]+(?:kg)?)/i) || [])[1];
    const measurements = (modelInfo.match(/Số đo[^:]*:\s*([0-9\s\-]+(?:cm)?)/i) || [])[1];
    const size = (modelInfo.match(/Mẫu mặc[^:]*:\s*([^\n\r,]+)/i) || [])[1];

    if (height) html += `<p class="mb-2 text-[#333]"><strong>Chiều cao: </strong>${height.trim()}</p>\n`;
    if (weight) html += `<p class="mb-2 text-[#333]"><strong>Cân nặng: </strong>${weight.trim()}</p>\n`;
    if (measurements) html += `<p class="mb-2 text-[#333]"><strong>Số đo 3 vòng: </strong>${measurements.trim()}</p>\n`;
    if (size) html += `<p class="mb-2 text-[#333]"><strong>Mẫu mặc size: </strong>${size.trim()}</p>\n`;

    if (!height && !weight && !measurements && !size) {
      html += `<p class="mb-2 text-[#333]">${modelInfo}</p>\n`;
    }
  }

  if (noteInfo) {
    html += `<p class="mt-4 text-[#555] leading-relaxed text-[13px]">Lưu ý: ${noteInfo}</p>\n`;
  }

  return html || `<p>${desc}</p>`;
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
    if (!comment.trim()) return;
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

      <div className="tab-content">
        {activeTab === "intro" && (
          <div className="animate-fadeIn">
            <div
              className={`relative overflow-hidden transition-all duration-300 ease-in-out ${
                isDescExpanded ? "max-h-[1000px]" : "max-h-[150px]"
              }`}
            >
              <div
                className="text-[#333] text-[14px] leading-[1.8] font-normal [&>p]:mb-3.5 [&>p>strong]:font-bold [&>p>strong]:text-[#111]"
                dangerouslySetInnerHTML={{
                  __html: formatRawDescription(product.description),
                }}
              />
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
          <div className="text-[#6c757d] text-[14px] leading-[1.8] animate-fadeIn space-y-2">
            {product.careInstructions ? (
              product.careInstructions.includes("<") ? (
                <div
                  className="prose prose-sm max-w-none text-[#6c757d]"
                  dangerouslySetInnerHTML={{ __html: product.careInstructions }}
                />
              ) : (
                <div className="whitespace-pre-line">
                  {product.careInstructions}
                </div>
              )
            ) : (
              <>
                <p>
                  - Khuyến khích giặt tay với nước lạnh hoặc giặt máy ở chế độ nhẹ để
                  giữ phom dáng chuẩn.
                </p>
                <p>
                  - Không sử dụng chất tẩy rửa mạnh; phơi ở nơi thoáng mát, tránh ánh
                  nắng trực tiếp.
                </p>
                <p>- Ủi ở nhiệt độ thấp dưới 110 độ C.</p>
              </>
            )}
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="animate-fadeIn space-y-6">
            {!isAuthenticated ? (
              <div className="border border-[#e7e8e9] p-4 rounded-[8px] bg-[#f8f9fa] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-[13px] text-[#555] flex items-center gap-2">
                  <i className="fas fa-lock text-[#888]"></i>
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
              <div className="border border-[#e7e8e9] p-4 rounded-[8px] bg-[#f8f9fa] text-[13px] text-[#777] flex items-center gap-2">
                <i className="fas fa-spinner fa-spin"></i>
                <span>Đang kiểm tra quyền đánh giá sản phẩm...</span>
              </div>
            ) : eligibility?.reviewed ? (
              <div className="border border-emerald-200 bg-emerald-50 text-emerald-800 p-4 rounded-[8px] text-[13px] flex items-start gap-2.5">
                <i className="fas fa-check-circle text-[16px] text-emerald-600 mt-0.5 shrink-0"></i>
                <div>
                  <strong className="font-semibold block mb-0.5">Bạn đã gửi đánh giá cho sản phẩm này</strong>
                  <span>Cảm ơn những phản hồi quý báu của bạn đã giúp cộng đồng và LUXE nâng cao chất lượng sản phẩm!</span>
                </div>
              </div>
            ) : !eligibility?.purchased ? (
              <div className="border border-amber-200 bg-amber-50 text-amber-800 p-4 rounded-[8px] text-[13px] flex items-start gap-2.5">
                <i className="fas fa-shield-alt text-[16px] text-amber-600 mt-0.5 shrink-0"></i>
                <div>
                  <strong className="font-semibold block mb-0.5">Quyền đánh giá dành riêng cho người mua hàng</strong>
                  <span>Để đảm bảo tính khách quan và trải nghiệm thực tế, chỉ những khách hàng <strong>đã mua và nhận hàng thành công</strong> sản phẩm này mới có thể viết đánh giá.</span>
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
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  required
                  placeholder="Chia sẻ cảm nhận thực tế về chất liệu, đường may và kiểu dáng sản phẩm..."
                  className="w-full border border-[#ddd] rounded-[4px] p-3 text-[13px] bg-white outline-none focus:border-[#222] mb-3"
                />
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

