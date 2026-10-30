"use client";

import Link from "next/link";
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
  Filter,
  ShoppingBag,
  CheckCircle,
  XCircle,
  Truck,
  Eye,
  MoreHorizontal,
  Printer,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { cn } from "@/shared/utils/utils";
import { Order, OrderStatus } from "@/features/orders/types/order.admin";
import { TableSkeleton } from "@/shared/ui/table-skeleton";
import { EmptyState } from "@/shared/ui/empty-state";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/shared/ui/dialog";
import { Checkbox } from "@/shared/ui/checkbox";

interface OrderTableActionsProps {
  order: Order;
  onQuickStatus: (order: Order, nextStatus: OrderStatus) => void;
  onOpenCancel: (ids: string[]) => void;
}

function OrderTableActions({
  order,
  onQuickStatus,
  onOpenCancel,
}: OrderTableActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8">
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          render={
            <Link
              href={`/admin/orders/${order.id}`}
              className="w-full cursor-pointer"
            />
          }
        >
          <Eye className="h-4 w-4 mr-2" /> Xem chi tiết
        </DropdownMenuItem>

        {order.status === "PENDING" && (
          <DropdownMenuItem
            onClick={() => onQuickStatus(order, "PROCESSING")}
            className="text-blue-600 cursor-pointer"
          >
            <CheckCircle className="h-4 w-4 mr-2" /> Duyệt đơn
          </DropdownMenuItem>
        )}

        {order.status === "PROCESSING" && (
          <DropdownMenuItem
            onClick={() => onQuickStatus(order, "SHIPPING")}
            className="text-purple-600 cursor-pointer"
          >
            <Truck className="h-4 w-4 mr-2" /> Giao vận chuyển
          </DropdownMenuItem>
        )}

        {order.status === "SHIPPING" && (
          <DropdownMenuItem
            onClick={() => onQuickStatus(order, "COMPLETED")}
            className="text-green-600 cursor-pointer"
          >
            <CheckCircle className="h-4 w-4 mr-2" /> Đã giao hàng
          </DropdownMenuItem>
        )}

        {(order.status === "PROCESSING" || order.status === "COMPLETED") && (
          <DropdownMenuItem
            onClick={() => {
              toast.info(`Đang tạo hóa đơn cho đơn hàng ${order.id}...`);
              setTimeout(() => window.print(), 400);
            }}
            className="cursor-pointer text-blue-600"
          >
            <Printer className="h-4 w-4 mr-2" /> In hóa đơn
          </DropdownMenuItem>
        )}

        {(order.status === "PENDING" || order.status === "PROCESSING") && (
          <DropdownMenuItem
            onClick={() => onOpenCancel([order.id])}
            className="text-red-600 cursor-pointer"
          >
            <XCircle className="h-4 w-4 mr-2" /> Hủy đơn
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface OrderTableProps {
  orders: Order[];
  isLoading: boolean;
  onUpdateStatus: (
    idOrCode: string,
    status: OrderStatus,
    reason?: string
  ) => Promise<Order>;
  viewStatus?: OrderStatus;
}

export function OrderTable({
  orders,
  isLoading,
  onUpdateStatus,
  viewStatus,
}: OrderTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const urlSearch = searchParams.get("search");
  const [searchEdit, setSearchEdit] = useState<{
    forUrlSearch: string | null;
    value: string;
  } | null>(null);
  const searchQuery =
    searchEdit && searchEdit.forUrlSearch === urlSearch
      ? searchEdit.value
      : urlSearch ?? "";
  const setSearchQuery = (value: string) =>
    setSearchEdit({ forUrlSearch: urlSearch, value });
  const [submitting, setSubmitting] = useState(false);

  const filteredOrders = orders.filter((o) => {
    if (viewStatus && (viewStatus as string) !== "ALL" && o.status !== viewStatus) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      return (
        o.id.toLowerCase().includes(q) ||
        o.orderCode.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        (o.customerEmail || "").toLowerCase().includes(q) ||
        (o.customerPhone || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const toggleSelectAll = () => {
    if (
      selectedIds.length === filteredOrders.length &&
      filteredOrders.length > 0
    ) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredOrders.map((o) => o.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-100 text-amber-700 hover:bg-amber-200";
      case "PROCESSING":
        return "bg-blue-100 text-blue-700 hover:bg-blue-200";
      case "SHIPPING":
        return "bg-purple-100 text-purple-700 hover:bg-purple-200";
      case "COMPLETED":
        return "bg-green-100 text-green-700 hover:bg-green-200";
      case "CANCELLED":
        return "bg-red-100 text-red-700 hover:bg-red-200";
      default:
        return "bg-muted text-foreground";
    }
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case "PENDING":
        return "Chờ xác nhận";
      case "PROCESSING":
        return "Đang chuẩn bị";
      case "SHIPPING":
        return "Đang giao";
      case "COMPLETED":
        return "Đã giao thành công";
      case "CANCELLED":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const handleQuickStatus = async (order: Order, nextStatus: OrderStatus) => {
    try {
      await onUpdateStatus(order.id, nextStatus);
      toast.success(
        `Đã cập nhật đơn hàng #${order.id} sang "${getStatusText(nextStatus)}"!`
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Không thể cập nhật trạng thái đơn"
      );
    }
  };

  const handleBulkTransition = async (nextStatus: OrderStatus) => {
    if (selectedIds.length === 0 || submitting) return;
    setSubmitting(true);
    try {
      await Promise.all(selectedIds.map((id) => onUpdateStatus(id, nextStatus)));
      toast.success(
        `Đã chuyển ${selectedIds.length} đơn hàng sang "${getStatusText(
          nextStatus
        )}"!`
      );
      setSelectedIds([]);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Cập nhật hàng loạt thất bại"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      toast.error("Vui lòng chọn hoặc nhập lý do hủy đơn!");
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    try {
      await Promise.all(
        selectedIds.map((id) => onUpdateStatus(id, "CANCELLED", cancelReason))
      );
      toast.success(
        `Đã hủy ${selectedIds.length} đơn hàng và hoàn lại tồn kho!`
      );
      setCancelDialog(false);
      setSelectedIds([]);
      setCancelReason("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Hủy đơn thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  const openCancelDialog = (ids: string[]) => {
    setSelectedIds(ids);
    setCancelReason("");
    setCancelDialog(true);
  };

  return (
    <>
      <div
        className={cn(
          "rounded-md border bg-card overflow-hidden transition-all duration-300",
          selectedIds.length > 0 ? "mb-24" : ""
        )}
      >
        <div className="flex items-center gap-4 p-4 border-b">
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Tìm kiếm mã đơn, khách hàng..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {searchQuery && (
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                <Filter className="mr-2 h-4 w-4" /> Xóa lọc
              </Button>
            )}
          </div>
        </div>

        {!isLoading && filteredOrders.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="Chưa có đơn hàng nào"
            description="Không tìm thấy đơn hàng phù hợp với bộ lọc hiện tại."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {(viewStatus === "PENDING" ||
                  viewStatus === "PROCESSING" ||
                  viewStatus === "SHIPPING") && (
                  <TableHead className="w-[50px]">
                    <div className="flex items-center justify-center">
                      <Checkbox
                        checked={
                          selectedIds.length === filteredOrders.length &&
                          filteredOrders.length > 0
                        }
                        onCheckedChange={toggleSelectAll}
                        disabled={filteredOrders.length === 0}
                      />
                    </div>
                  </TableHead>
                )}
                <TableHead>Mã đơn</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Ngày đặt</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thanh toán</TableHead>
                <TableHead>Tổng tiền</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableSkeleton columns={8} />
              ) : (
                filteredOrders.map((order) => (
                  <TableRow
                    key={order.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => router.push(`/admin/orders/${order.id}`)}
                  >
                    {(viewStatus === "PENDING" ||
                      viewStatus === "PROCESSING" ||
                      viewStatus === "SHIPPING") && (
                      <TableCell className="w-[50px]">
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelect(order.id);
                          }}
                          className="flex items-center justify-center p-2"
                        >
                          <Checkbox
                            checked={selectedIds.includes(order.id)}
                            onCheckedChange={() => toggleSelect(order.id)}
                          />
                        </div>
                      </TableCell>
                    )}
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{order.customerName}</span>
                        <span className="text-xs text-muted-foreground">
                          {order.customerEmail}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell>
                      <Badge
                        variant="default"
                        className={cn(getStatusColor(order.status), "border-none")}
                      >
                        {getStatusText(order.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn(order.paymentBg, "border-none text-xs")}
                      >
                        {order.payment}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{order.total}</TableCell>
                    <TableCell
                      className="text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <OrderTableActions
                        order={order}
                        onQuickStatus={handleQuickStatus}
                        onOpenCancel={openCancelDialog}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={cancelDialog} onOpenChange={setCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hủy {selectedIds.length} đơn hàng</DialogTitle>
            <DialogDescription>
              Hành động này sẽ hoàn trả số lượng tồn kho của các sản phẩm trong
              đơn. Vui lòng chọn hoặc ghi rõ lý do hủy đơn.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 flex flex-col gap-3">
            <label className="text-sm font-medium">Chọn lý do hủy đơn *</label>
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge
                variant={
                  cancelReason === "Khách yêu cầu hủy" ? "default" : "outline"
                }
                className="cursor-pointer"
                onClick={() => setCancelReason("Khách yêu cầu hủy")}
              >
                Khách yêu cầu hủy
              </Badge>
              <Badge
                variant={
                  cancelReason === "Hết hàng / Lỗi giá" ? "default" : "outline"
                }
                className="cursor-pointer"
                onClick={() => setCancelReason("Hết hàng / Lỗi giá")}
              >
                Hết hàng / Lỗi giá
              </Badge>
              <Badge
                variant={
                  cancelReason === "Nghi ngờ gian lận / Spam"
                    ? "default"
                    : "destructive"
                }
                className="cursor-pointer"
                onClick={() => setCancelReason("Nghi ngờ gian lận / Spam")}
              >
                Nghi ngờ gian lận / Spam
              </Badge>
            </div>
            <Input
              placeholder="Hoặc nhập lý do khác..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialog(false)}>
              Đóng
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={submitting}
            >
              {submitting ? "Đang xử lý..." : "Xác nhận hủy"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              {viewStatus === "PENDING" && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={submitting}
                    className="text-emerald-400 hover:text-emerald-300 hover:bg-background/10"
                    onClick={() => handleBulkTransition("PROCESSING")}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" /> Duyệt hàng loạt
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={submitting}
                    className="text-red-400 hover:text-red-300 hover:bg-background/10"
                    onClick={() => openCancelDialog(selectedIds)}
                  >
                    <XCircle className="mr-2 h-4 w-4" /> Hủy hàng loạt
                  </Button>
                </>
              )}

              {viewStatus === "PROCESSING" && (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={submitting}
                  className="text-blue-400 hover:text-blue-300 hover:bg-background/10"
                  onClick={() => handleBulkTransition("SHIPPING")}
                >
                  <Truck className="mr-2 h-4 w-4" /> Giao Shipper hàng loạt
                </Button>
              )}

              {viewStatus === "SHIPPING" && (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={submitting}
                  className="text-emerald-400 hover:text-emerald-300 hover:bg-background/10"
                  onClick={() => handleBulkTransition("COMPLETED")}
                >
                  <CheckCircle className="mr-2 h-4 w-4" /> Hoàn thành hàng loạt
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 ml-2 hover:bg-background/10"
                onClick={() => setSelectedIds([])}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Bỏ chọn</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

