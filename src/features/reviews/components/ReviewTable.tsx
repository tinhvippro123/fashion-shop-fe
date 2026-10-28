"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Checkbox } from "@/shared/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { TableSkeleton } from "@/shared/ui/table-skeleton";
import { Badge } from "@/shared/ui/badge";
import {
  MoreHorizontal,
  Search,
  Filter,
  X,
  Star,
  EyeOff,
  Eye,
  MessageSquareReply,
  FileText,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { cn } from "@/shared/utils/utils";
import { Review } from "../types/review.types";

interface ReviewTableActionsProps {
  review: Review;
  onViewDetails: (id: string) => void;
  onToggleHide: (review: Review) => void;
}

function ReviewTableActions({
  review,
  onViewDetails,
  onToggleHide,
}: ReviewTableActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted outline-none">
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(review.id);
          }}
        >
          <FileText className="mr-2 h-4 w-4" />
          {review.isHidden || review.reply ? "Xem chi tiết" : "Xem & Phản hồi"}
        </DropdownMenuItem>

        {review.isHidden ? (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onToggleHide(review);
            }}
            className="text-emerald-600"
          >
            <Eye className="mr-2 h-4 w-4" /> Hiển thị lại
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onToggleHide(review);
            }}
            className="text-amber-600"
          >
            <EyeOff className="mr-2 h-4 w-4" /> Ẩn đánh giá
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface ReviewTableProps {
  reviews: Review[];
  onToggleVisibility: (reviewId: string) => Promise<Review>;
  isLoading?: boolean;
  viewStatus?: "Tất cả" | "Đã ẩn";
}

export function ReviewTable({
  reviews,
  onToggleVisibility,
  isLoading = false,
  viewStatus = "Tất cả",
}: ReviewTableProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredReviews = reviews.filter((r) => {
    if (viewStatus === "Đã ẩn" && !r.isHidden) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      return (
        r.productName.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        (r.customerPhone || "").toLowerCase().includes(q) ||
        r.comment.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const toggleSelectAll = () => {
    if (
      selectedIds.length === filteredReviews.length &&
      filteredReviews.length > 0
    ) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredReviews.map((r) => r.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleToggleHide = async (review: Review) => {
    const action = review.isHidden ? "hiển thị" : "ẩn";
    try {
      await onToggleVisibility(review.id);
      toast.success(`Đã ${action} đánh giá của ${review.customerName}!`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Không thể đổi trạng thái đánh giá"
      );
    }
  };

  const handleBulkVisibility = async (targetHidden: boolean) => {
    const targets = reviews.filter(
      (r) => selectedIds.includes(r.id) && r.isHidden !== targetHidden
    );
    if (targets.length === 0) {
      setSelectedIds([]);
      return;
    }
    try {
      await Promise.all(targets.map((r) => onToggleVisibility(r.id)));
      toast.success(
        `Đã ${targetHidden ? "ẩn" : "hiển thị"} ${targets.length} đánh giá thành công!`
      );
      setSelectedIds([]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Thao tác thất bại");
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={cn(
          "h-4 w-4",
          index < rating ? "fill-amber-400 text-amber-400" : "fill-muted text-muted"
        )}
      />
    ));
  };

  const selectedReviews = reviews.filter((r) => selectedIds.includes(r.id));
  const hasVisible = selectedReviews.some((r) => !r.isHidden);
  const hasHidden = selectedReviews.some((r) => r.isHidden);

  return (
    <>
      <div
        className={cn(
          "rounded-md border bg-card overflow-hidden transition-all duration-300",
          selectedIds.length > 0 ? "mb-24" : ""
        )}
      >
        <div className="flex items-center justify-between gap-4 p-4 border-b">
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Tìm kiếm đánh giá, khách hàng..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {searchQuery && (
              <Button
                variant="outline"
                className="shrink-0"
                onClick={() => setSearchQuery("")}
              >
                <Filter className="mr-2 h-4 w-4" /> Xóa lọc
              </Button>
            )}
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <div className="flex items-center justify-center">
                  <Checkbox
                    checked={
                      filteredReviews.length > 0 &&
                      selectedIds.length === filteredReviews.length
                    }
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all"
                  />
                </div>
              </TableHead>
              <TableHead>Sản phẩm</TableHead>
              <TableHead>Khách hàng</TableHead>
              <TableHead className="w-[120px]">Đánh giá</TableHead>
              <TableHead className="max-w-[300px]">Nội dung</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Phản hồi</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeleton columns={8} />
            ) : filteredReviews.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-10 text-muted-foreground"
                >
                  Không tìm thấy đánh giá nào
                </TableCell>
              </TableRow>
            ) : (
              filteredReviews.map((review) => {
                const isRisk = review.rating <= 2;
                return (
                  <TableRow
                    key={review.id}
                    className={cn(
                      "cursor-pointer hover:bg-muted/50 transition-colors",
                      selectedIds.includes(review.id) && "bg-muted/50",
                      isRisk &&
                        !review.isHidden &&
                        "bg-red-50/50 hover:bg-red-50/80",
                      review.isHidden && "opacity-60"
                    )}
                    onClick={() => router.push(`/admin/reviews/${review.id}`)}
                  >
                    <TableCell
                      className="text-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelect(review.id);
                      }}
                    >
                      <div
                        className="flex items-center justify-center p-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={selectedIds.includes(review.id)}
                          onCheckedChange={() => toggleSelect(review.id)}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium line-clamp-1">
                        {review.productName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{review.customerName}</div>
                      <div className="text-xs text-muted-foreground">
                        {review.customerPhone}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-0.5">
                        {renderStars(review.rating)}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[300px]">
                      <p className="text-sm line-clamp-2">{review.comment}</p>
                      {review.reply && (
                        <div className="mt-1 flex items-start gap-1 text-xs text-emerald-700 bg-emerald-50 p-1.5 rounded-sm">
                          <MessageSquareReply className="h-3 w-3 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">
                            Shop: {review.reply}
                          </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {review.isHidden ? (
                        <Badge
                          variant="secondary"
                          className="bg-muted text-muted-foreground"
                        >
                          Đã ẩn
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-emerald-700 border-emerald-200 bg-emerald-50"
                        >
                          Đang hiển thị
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {review.reply ? (
                        <Badge
                          variant="outline"
                          className="text-emerald-700 border-emerald-200 bg-emerald-50"
                        >
                          Đã trả lời
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-orange-600 border-orange-200 bg-orange-50"
                        >
                          Chưa trả lời
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell
                      className="text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ReviewTableActions
                        review={review}
                        onViewDetails={(id) =>
                          router.push(`/admin/reviews/${id}`)
                        }
                        onToggleHide={handleToggleHide}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {selectedIds.length > 0 && (
        <div
          style={{ bottom: "24px" }}
          className="fixed left-1/2 -translate-x-1/2 lg:ml-32 z-50 transition-all duration-300"
        >
          <div className="flex items-center gap-4 bg-foreground text-background px-4 py-3 rounded-full shadow-lg border border-border">
            <span className="text-sm font-medium px-2 border-r border-background/20">
              Đã chọn{" "}
              <strong className="text-blue-400">{selectedIds.length}</strong>
            </span>
            <div className="flex items-center gap-2">
              {hasHidden && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleBulkVisibility(false)}
                  className="text-emerald-400 hover:text-emerald-300 hover:bg-background/10"
                >
                  <Eye className="h-4 w-4 mr-2" /> Hiển thị
                </Button>
              )}
              {hasVisible && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleBulkVisibility(true)}
                  className="text-amber-400 hover:text-amber-300 hover:bg-background/10"
                >
                  <EyeOff className="h-4 w-4 mr-2" /> Ẩn
                </Button>
              )}
            </div>
            <div className="pl-2 border-l border-background/20">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedIds([])}
                className="h-8 w-8 rounded-full hover:bg-background/10 text-background"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

