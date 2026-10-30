"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/shared/ui/button";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  Eye,
  EyeOff,
  Send,
  Star,
  CheckCircle2,
  Trash2,
  MessageSquareReply,
} from "lucide-react";
import { BackButton } from "@/shared/ui/back-button";
import { RichTextEditor } from "@/shared/ui/rich-text-editor";
import { toast } from "sonner";
import { apiFetch } from "@/shared/lib/api";
import { Review } from "@/features/reviews";

export default function ReviewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [review, setReview] = useState<Review | null>(null);
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const [replyHtml, setReplyHtml] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const loading = loadedId !== id;

  useEffect(() => {
    let active = true;
    apiFetch<Review[]>("/admin/reviews")
      .then((list) => {
        if (!active) return;
        const found = (list || []).find((r) => String(r.id) === String(id));
        setReview(found || null);
        if (found?.reply) {
          setReplyHtml(found.reply);
        }
      })
      .catch(() => {
        if (active) setReview(null);
      })
      .finally(() => {
        if (active) setLoadedId(id);
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Đang tải chi tiết đánh giá...
      </div>
    );
  }

  if (!review) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Không tìm thấy đánh giá #{id}
      </div>
    );
  }

  const statusValue = review.isHidden ? "hidden" : "visible";

  const handleChangeVisibility = async (val: string) => {
    const wantHidden = val === "hidden";
    if (wantHidden === review.isHidden) return;
    try {
      const updated = await apiFetch<Review>(
        `/admin/reviews/${review.id}/visibility`,
        { method: "PUT" }
      );
      setReview(updated);
      toast.success(
        updated.isHidden
          ? "Đã ẩn đánh giá khỏi trang sản phẩm"
          : "Đã hiển thị lại đánh giá"
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Không thể cập nhật trạng thái"
      );
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Bạn có chắc chắn muốn xóa vĩnh viễn đánh giá này? Hành động này không thể hoàn tác."
      )
    )
      return;
    try {
      await apiFetch(`/admin/reviews/${review.id}`, { method: "DELETE" });
      toast.success("Đã xóa đánh giá thành công!");
      router.push("/admin/reviews");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Không thể xóa đánh giá"
      );
    }
  };

  const handleSendReply = async () => {
    const plain = replyHtml.replace(/<[^>]*>/g, "").trim();
    if (!plain) {
      toast.error("Vui lòng nhập nội dung phản hồi");
      return;
    }
    setSubmitting(true);
    try {
      const updated = await apiFetch<Review>(
        `/admin/reviews/${review.id}/reply`,
        {
          method: "PUT",
          body: JSON.stringify({ reply: plain }),
        }
      );
      setReview(updated);
      toast.success("Đã gửi phản hồi công khai thành công!");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Gửi phản hồi thất bại"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full pb-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2 sm:mb-0">
        <div className="flex items-center gap-2 sm:gap-4">
          <BackButton />
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Chi tiết đánh giá
          </h2>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto mt-1 sm:mt-0">
          <Select
            value={statusValue}
            onValueChange={(v) => v && handleChangeVisibility(String(v))}
          >
            <SelectTrigger className="w-full sm:w-[180px] bg-card">
              <SelectValue placeholder="Trạng thái">
                {statusValue === "visible" ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <Eye className="w-4 h-4" /> Hiển thị
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <EyeOff className="w-4 h-4" /> Ẩn đánh giá
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="visible">
                <div className="flex items-center gap-2 text-green-600">
                  <Eye className="w-4 h-4" /> Hiển thị
                </div>
              </SelectItem>
              <SelectItem value="hidden">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <EyeOff className="w-4 h-4" /> Ẩn đánh giá
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            className="text-red-600 border-red-200 hover:bg-red-50 shadow-sm"
            onClick={handleDelete}
          >
            <Trash2 className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Xóa đánh giá</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-muted text-foreground font-bold">
                    {review.customerName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base font-bold">
                    {review.customerName}
                  </CardTitle>
                  <div className="flex text-yellow-400 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating ? "fill-current" : "text-zinc-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <span className="text-xs text-muted-foreground font-medium">
                {review.createdAt}
              </span>
            </CardHeader>
            <CardContent className="pt-6 flex flex-col gap-4">
              <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
                {review.comment}
              </p>

              {review.reply && (
                <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                  <MessageSquareReply className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-emerald-800 uppercase mb-1">
                      Phản hồi từ LUXE Fashion
                    </p>
                    <p className="text-sm text-emerald-900">{review.reply}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm border">
            <CardHeader className="py-4 border-b bg-muted/10">
              <CardTitle className="text-base font-bold">
                Phản hồi công khai
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex flex-col gap-4">
              <RichTextEditor
                value={replyHtml}
                onChange={setReplyHtml}
                placeholder="Nhập nội dung phản hồi của shop (sẽ hiển thị công khai trên trang chi tiết sản phẩm)..."
                editorClassName="min-h-[150px]"
              />
              <div className="flex items-center justify-between pt-2">
                <div className="text-sm text-muted-foreground">
                  Phản hồi sẽ xuất hiện dưới đánh giá của khách hàng.
                </div>
                <Button
                  disabled={submitting}
                  onClick={handleSendReply}
                  className="bg-blue-500 hover:bg-blue-600 text-white rounded-md px-6"
                >
                  {submitting ? "Đang gửi..." : "Gửi phản hồi"}
                  <Send className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-bold uppercase text-muted-foreground tracking-wider">
                Thông tin Sản phẩm
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <Link
                  href={`/admin/products/${review.productId}/edit`}
                  className="text-sm font-bold text-blue-600 hover:underline"
                >
                  {review.productName}
                </Link>
                <span className="text-xs text-muted-foreground">
                  Mã sản phẩm: #{review.productId}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-bold uppercase text-muted-foreground tracking-wider">
                Khách hàng đánh giá
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Khách hàng thành viên</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-muted-foreground">Số điện thoại</span>
                <span className="font-medium">{review.customerPhone}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

