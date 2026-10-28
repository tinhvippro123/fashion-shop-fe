"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Badge } from "@/shared/ui/badge";
import {
  Search,
  MoreHorizontal,
  Filter,
  Gift,
  Eye,
  Copy,
  Edit,
  Ban,
  Rocket,
  XCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/shared/utils/utils";
import { TableSkeleton } from "@/shared/ui/table-skeleton";
import { Voucher } from "@/features/promotions/types/promotion.admin";

interface VoucherTableActionsProps {
  voucher: Voucher;
  onAction?: (action: "view" | "edit" | "duplicate", id: string) => void;
  onCancel: (voucher: Voucher) => void;
  onEndEarly: (voucher: Voucher) => void;
  onStartNow: (voucher: Voucher) => void;
}

function VoucherTableActions({
  voucher,
  onAction,
  onCancel,
  onEndEarly,
  onStartNow,
}: VoucherTableActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted outline-none">
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onAction?.("view", voucher.id);
          }}
        >
          <Eye className="mr-2 h-4 w-4" /> Xem chi tiết
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onAction?.("duplicate", voucher.id);
          }}
        >
          <Copy className="mr-2 h-4 w-4" /> Sao chép mã
        </DropdownMenuItem>
        {voucher.status !== "Đã kết thúc" && voucher.status !== "Đã hủy" && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onAction?.("edit", voucher.id);
            }}
          >
            <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
          </DropdownMenuItem>
        )}
        {voucher.status === "Sắp diễn ra" && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onStartNow(voucher);
            }}
            className="text-blue-600"
          >
            <Rocket className="mr-2 h-4 w-4" /> Bắt đầu ngay
          </DropdownMenuItem>
        )}
        {voucher.status === "Đang diễn ra" && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onEndEarly(voucher);
            }}
            className="text-amber-600"
          >
            <Ban className="mr-2 h-4 w-4" /> Kết thúc sớm
          </DropdownMenuItem>
        )}
        {voucher.status !== "Đã kết thúc" && voucher.status !== "Đã hủy" && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onCancel(voucher);
            }}
            className="text-red-600"
          >
            <XCircle className="mr-2 h-4 w-4" /> Hủy bỏ mã
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface VoucherTableProps {
  vouchers: Voucher[];
  isLoading: boolean;
  onTriggerAction: (
    voucherId: string,
    action: "START_NOW" | "END_EARLY" | "CANCEL"
  ) => Promise<Voucher>;
  viewStatus?:
    | "Tất cả"
    | "Đang diễn ra"
    | "Sắp diễn ra"
    | "Đã kết thúc"
    | "Đã hủy";
  onAction?: (action: "view" | "edit" | "duplicate", id: string) => void;
}

export function VoucherTable({
  vouchers,
  isLoading,
  onTriggerAction,
  viewStatus = "Tất cả",
  onAction,
}: VoucherTableProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleEndEarly = async (voucher: Voucher) => {
    try {
      await onTriggerAction(voucher.id, "END_EARLY");
      toast.success(`Đã kết thúc sớm mã ${voucher.code}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Thao tác thất bại");
    }
  };

  const handleStartNow = async (voucher: Voucher) => {
    try {
      await onTriggerAction(voucher.id, "START_NOW");
      toast.success(`Đã kích hoạt ngay mã ${voucher.code}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Thao tác thất bại");
    }
  };

  const handleCancel = async (voucher: Voucher) => {
    if (
      window.confirm(
        `Bạn có chắc muốn hủy bỏ mã giảm giá "${voucher.code}"?`
      )
    ) {
      try {
        await onTriggerAction(voucher.id, "CANCEL");
        toast.success(`Đã hủy bỏ mã ${voucher.code}!`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Thao tác thất bại");
      }
    }
  };

  const filteredVouchers = vouchers.filter((v) => {
    if (viewStatus === "Tất cả" && v.status === "Đã hủy") return false;
    if (viewStatus !== "Tất cả" && v.status !== viewStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      return (
        v.code.toLowerCase().includes(q) ||
        (v.name || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const renderStatusBadge = (voucher: Voucher) => {
    if (voucher.status === "Đang diễn ra") {
      return (
        <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none">
          Đang diễn ra
        </Badge>
      );
    }
    if (voucher.status === "Sắp diễn ra") {
      return (
        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none">
          Sắp diễn ra
        </Badge>
      );
    }
    if (voucher.status === "Đã hủy") {
      return (
        <Badge className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200">
          Đã hủy
        </Badge>
      );
    }

    const [usedStr, totalStr] = voucher.quantity.split(" / ");
    const used = parseInt(usedStr || "0", 10);
    const total = parseInt(totalStr || "0", 10);

    if (total > 0 && used >= total) {
      return (
        <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-none">
          Hết lượt sử dụng
        </Badge>
      );
    }

    return (
      <Badge className="bg-zinc-100 text-zinc-600 hover:bg-zinc-200 border-none">
        Đã kết thúc
      </Badge>
    );
  };

  return (
    <div className="flex flex-col gap-6 relative">
      <div className="rounded-md border bg-card overflow-hidden transition-all duration-300">
        <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border-b sm:justify-between">
          <div className="flex items-center gap-2 w-full max-w-sm">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Tìm kiếm mã code..."
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

        {/* Desktop Table */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã Code</TableHead>
                <TableHead>Mức giảm</TableHead>
                <TableHead>Đơn tối thiểu</TableHead>
                <TableHead>Đã dùng / Tổng</TableHead>
                <TableHead>Khung thời gian</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableSkeleton columns={7} />
              ) : filteredVouchers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Gift className="h-10 w-10 mb-4 text-zinc-300" />
                      <p>
                        {viewStatus === "Đã hủy"
                          ? "Lịch sử hủy bỏ trống."
                          : "Không tìm thấy mã giảm giá nào"}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredVouchers.map((voucher) => (
                  <TableRow
                    key={voucher.id}
                    className={cn(
                      "hover:bg-muted/50 transition-colors cursor-pointer",
                      voucher.status === "Đã hủy" && "opacity-50"
                    )}
                    onClick={() => onAction && onAction("view", voucher.id)}
                  >
                    <TableCell>
                      <div className="flex items-center font-bold text-foreground bg-muted w-fit px-3 py-1 rounded-md border border-dashed border-zinc-300">
                        <Gift className="h-4 w-4 mr-2 text-muted-foreground" />
                        {voucher.code}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-red-600">
                      -{voucher.discountAmount}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {voucher.minOrderValue}
                    </TableCell>
                    <TableCell>{voucher.quantity}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-sm whitespace-nowrap">
                        <span className="text-foreground font-medium">
                          Từ: {voucher.duration.split(" - ")[0]}
                        </span>
                        {voucher.duration.split(" - ")[1] && (
                          <span className="text-red-600 font-medium">
                            Đến: {voucher.duration.split(" - ")[1]}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{renderStatusBadge(voucher)}</TableCell>
                    <TableCell
                      className="text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <VoucherTableActions
                        voucher={voucher}
                        onAction={onAction}
                        onCancel={handleCancel}
                        onEndEarly={handleEndEarly}
                        onStartNow={handleStartNow}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile List View */}
        <div className="md:hidden flex flex-col">
          {filteredVouchers.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-muted-foreground py-10 border-b">
              <Gift className="h-10 w-10 mb-4 text-zinc-300" />
              <p>Không tìm thấy mã giảm giá nào</p>
            </div>
          ) : (
            filteredVouchers.map((voucher) => (
              <div
                key={voucher.id}
                className={cn(
                  "flex flex-col gap-4 p-4 border-b last:border-0 hover:bg-muted/50 transition-colors relative cursor-pointer",
                  voucher.status === "Đã hủy" && "opacity-50"
                )}
                onClick={() => onAction && onAction("view", voucher.id)}
              >
                <div className="flex items-center justify-between pr-8">
                  <span className="font-bold text-foreground text-lg flex items-center bg-muted px-3 py-1 rounded-md border border-dashed border-zinc-300 w-fit">
                    <Gift className="h-4 w-4 mr-2 text-muted-foreground" />
                    {voucher.code}
                  </span>
                </div>
                <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                  <span>
                    Mức giảm:{" "}
                    <strong className="text-red-600">
                      -{voucher.discountAmount}
                    </strong>
                  </span>
                  <span>
                    Đơn tối thiểu: <strong>{voucher.minOrderValue}</strong>
                  </span>
                  <span>
                    Đã dùng: <strong>{voucher.quantity}</strong>
                  </span>
                </div>
                <div>{renderStatusBadge(voucher)}</div>
                <div
                  className="absolute top-4 right-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <VoucherTableActions
                    voucher={voucher}
                    onAction={onAction}
                    onCancel={handleCancel}
                    onEndEarly={handleEndEarly}
                    onStartNow={handleStartNow}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

