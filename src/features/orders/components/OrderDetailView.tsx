"use client";

import Link from "next/link";
import { BackButton } from "@/shared/ui/back-button";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Separator } from "@/shared/ui/separator";
import {
  Printer,
  MapPin,
  User,
  Mail,
  Phone,
  Clock,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  Truck,
  Package,
  PackageCheck,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { cn } from "@/shared/utils/utils";
import { OrderStatus } from "@/features/orders/types/order.admin";
import { useOrderDetail } from "@/features/orders/hooks/useOrderDetail";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { resolveImageUrl } from "@/shared/utils/format";

export function OrderDetailView({ orderId }: { orderId: string }) {
  const { order, isLoading, updateStatus } = useOrderDetail(orderId);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (isLoading) {
    return (
      <div className="flex justify-center p-8 text-muted-foreground">
        Đang tải chi tiết đơn hàng...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex justify-center p-8 text-muted-foreground">
        Không tìm thấy đơn hàng
      </div>
    );
  }

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
        return "Đang giao hàng";
      case "COMPLETED":
        return "Đã hoàn thành";
      case "CANCELLED":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const handleTransition = async (
    nextStatus: OrderStatus,
    successMsg: string
  ) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await updateStatus(nextStatus);
      toast.success(successMsg);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Cập nhật trạng thái thất bại"
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
      await updateStatus("CANCELLED", cancelReason);
      toast.success(
        `Đã hủy đơn hàng #${order.id} và hoàn trả tồn kho! Lý do: ${cancelReason}`
      );
      setCancelDialog(false);
      setCancelReason("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể hủy đơn");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold tracking-tight">
                Đơn hàng #{order.id}
              </h2>
              <Badge
                variant="default"
                className={cn(getStatusColor(order.status), "border-none ml-2")}
              >
                {getStatusText(order.status)}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm mt-1 flex items-center gap-1">
              <Clock className="h-3 w-3" /> Ngày đặt: {order.date}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {order.status === "PENDING" && (
            <>
              <Button
                variant="outline"
                disabled={submitting}
                onClick={() => {
                  setCancelReason("");
                  setCancelDialog(true);
                }}
                className="text-red-600 border-red-200 hover:bg-red-50 shadow-sm"
              >
                <XCircle className="mr-2 h-4 w-4" /> Hủy đơn
              </Button>
              <Button
                variant="default"
                disabled={submitting}
                onClick={() =>
                  handleTransition(
                    "PROCESSING",
                    `Đã xác nhận đơn hàng #${order.id}! Đã chuyển sang Đang chuẩn bị.`
                  )
                }
                className="shadow-sm"
              >
                <CheckCircle className="mr-2 h-4 w-4" /> Duyệt đơn
              </Button>
            </>
          )}

          {order.status === "PROCESSING" && (
            <>
              <Button
                variant="outline"
                disabled={submitting}
                onClick={() => {
                  setCancelReason("");
                  setCancelDialog(true);
                }}
                className="text-red-600 border-red-200 hover:bg-red-50 shadow-sm"
              >
                <XCircle className="mr-2 h-4 w-4" /> Hủy đơn
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  toast.info(`Đang tạo phiếu in cho đơn hàng ${order.id}...`);
                  setTimeout(() => window.print(), 400);
                }}
                className="shadow-sm"
              >
                <Printer className="mr-2 h-4 w-4" /> In phiếu giao hàng
              </Button>
              <Button
                variant="default"
                disabled={submitting}
                onClick={() =>
                  handleTransition(
                    "SHIPPING",
                    `Đã bàn giao đơn hàng #${order.id} cho Shipper! Đã chuyển sang Đang giao.`
                  )
                }
                className="shadow-sm"
              >
                <Truck className="mr-2 h-4 w-4" /> Bàn giao Shipper
              </Button>
            </>
          )}

          {order.status === "SHIPPING" && (
            <>
              <Button
                variant="outline"
                disabled={submitting}
                className="shadow-sm text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => {
                  setCancelReason("Giao hàng thất bại - Hoàn kho");
                  setCancelDialog(true);
                }}
              >
                <AlertTriangle className="mr-2 h-4 w-4" /> Giao thất bại
              </Button>
              <Button
                variant="default"
                disabled={submitting}
                className="shadow-sm"
                onClick={() =>
                  handleTransition(
                    "COMPLETED",
                    `Đã cập nhật trạng thái Hoàn Thành cho đơn #${order.id}!`
                  )
                }
              >
                <CheckCircle className="mr-2 h-4 w-4" /> Xác nhận Đã giao
              </Button>
            </>
          )}

          {order.status === "COMPLETED" && (
            <Button
              variant="outline"
              onClick={() => {
                toast.info(`Đang tạo hóa đơn cho đơn hàng ${order.id}...`);
                setTimeout(() => window.print(), 400);
              }}
              className="shadow-sm"
            >
              <Printer className="mr-2 h-4 w-4" /> In hóa đơn
            </Button>
          )}
        </div>
      </div>

      {order.status === "CANCELLED" && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 flex gap-3 items-start">
          <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
          <div>
            <h4 className="text-red-800 font-medium">
              Đơn hàng đã bị hủy và đã hoàn trả tồn kho
            </h4>
            <div className="flex flex-col gap-0.5 mt-1">
              <p className="text-red-600 text-sm">
                Lý do: {order.cancelReason || "Khách hàng / Quản trị viên hủy"}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {/* Cột trái: Chi tiết sản phẩm và tổng tiền */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Sản phẩm đã đặt</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                {order.items?.map((item) => (
                  <div key={item.id}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="relative w-14 aspect-2/3 rounded-md overflow-hidden bg-muted shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={resolveImageUrl(item.image)}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {item.variantInfo}
                          </p>
                          <p className="text-sm font-medium mt-1">
                            {item.quantity} x{" "}
                            {Number(item.price || 0).toLocaleString("vi-VN")}đ
                          </p>
                        </div>
                      </div>
                      <div className="font-bold">
                        {(Number(item.price || 0) * item.quantity).toLocaleString(
                          "vi-VN"
                        )}
                        đ
                      </div>
                    </div>
                    <Separator className="my-4" />
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tạm tính:</span>
                  <span className="font-medium">
                    {Number(order.subtotal || 0).toLocaleString("vi-VN")}đ
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Phí vận chuyển:</span>
                  <span className="font-medium">
                    {Number(order.shippingFee || 0).toLocaleString("vi-VN")}đ
                  </span>
                </div>
                {order.appliedPromotions && order.appliedPromotions.length > 0 ? (
                  order.appliedPromotions.map((promo) => (
                    <div
                      key={promo.id}
                      className="flex justify-between text-sm items-center"
                    >
                      <span className="text-muted-foreground flex items-center gap-1">
                        Giảm giá{" "}
                        <Badge
                          variant="outline"
                          className="h-5 px-1.5 text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200"
                        >
                          {promo.code}
                        </Badge>
                      </span>
                      <span className="font-medium text-emerald-600">
                        -{Number(promo.discountAmount || 0).toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Giảm giá:</span>
                    <span className="font-medium text-foreground">
                      -{Number(order.discount || 0).toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                )}
                <Separator className="my-1" />
                <div className="flex justify-between">
                  <span className="font-bold text-base">Tổng cộng:</span>
                  <span className="font-bold text-lg">{order.total}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cột phải: Thông tin khách hàng & Giao hàng */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Khách hàng</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-muted h-10 w-10 rounded-full flex items-center justify-center shrink-0">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {order.customer?.name || order.customerName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.customer?.type || "Thành viên"}
                    </p>
                  </div>
                </div>
                <Link
                  href={
                    order.customer?.id
                      ? `/admin/customers/${order.customer.id}`
                      : "/admin/customers"
                  }
                >
                  <Button variant="outline" size="sm">
                    {order.customer?.id ? "Chi tiết khách hàng" : "DS Khách hàng"}
                  </Button>
                </Link>
              </div>
              <Separator />
              <div className="grid gap-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span className="truncate">
                    {order.customer?.email || order.customerEmail}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4 shrink-0" />
                  <span>
                    {order.customer?.phone || order.customerPhone || "-"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Địa chỉ giao hàng</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 text-sm text-muted-foreground">
              <div className="flex gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <span>{order.shipping?.address || "-"}</span>
              </div>
              <div className="flex gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <span>{order.payment}</span>
              </div>
              {order.note && (
                <>
                  <Separator />
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-foreground">
                      Ghi chú khách hàng
                    </span>
                    <span>{order.note}</span>
                  </div>
                </>
              )}
              <Separator />
              <div className="flex flex-col gap-1">
                <span className="font-medium text-foreground">
                  Đơn vị vận chuyển
                </span>
                <span>{order.shipping?.method || "Giao Hàng Tiết Kiệm"}</span>
                <span className="text-muted-foreground">
                  Mã vận đơn: {order.shipping?.code || `GHTK-${order.id}`}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lịch sử hành trình</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-6 mt-2 relative">
                <div className="absolute top-2 bottom-2 left-2.75 w-0.5 bg-muted z-0"></div>

                <div className="flex gap-4 relative z-10">
                  <div className="bg-card rounded-full p-0.5">
                    <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                  </div>
                  <div className="pt-1 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">
                        Đơn hàng đã được tạo
                      </h4>
                      <span className="text-xs text-muted-foreground font-mono">
                        {order.createdAt || order.date}
                      </span>
                    </div>
                  </div>
                </div>

                {order.status !== "PENDING" && order.status !== "CANCELLED" && (
                  <div className="flex gap-4 relative z-10">
                    <div className="bg-card rounded-full p-0.5">
                      <Package className="h-6 w-6 text-blue-500" />
                    </div>
                    <div className="pt-1 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">Đang chuẩn bị hàng</h4>
                        <span className="text-xs text-muted-foreground font-mono">
                          {order.confirmedAt || order.date}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Kho đã xác nhận và đóng gói sản phẩm
                      </p>
                    </div>
                  </div>
                )}

                {(order.status === "SHIPPING" ||
                  order.status === "COMPLETED") && (
                  <div className="flex gap-4 relative z-10">
                    <div className="bg-card rounded-full p-0.5">
                      <Truck className="h-6 w-6 text-amber-500" />
                    </div>
                    <div className="pt-1 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">
                          Đã giao cho Đơn vị vận chuyển
                        </h4>
                        <span className="text-xs text-muted-foreground font-mono">
                          {order.shippingAt || order.updatedAt || order.date}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Đang trên đường giao đến địa chỉ khách hàng
                      </p>
                    </div>
                  </div>
                )}

                {order.status === "COMPLETED" && (
                  <div className="flex gap-4 relative z-10">
                    <div className="bg-card rounded-full p-0.5">
                      <PackageCheck className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div className="pt-1 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">
                          Giao hàng thành công
                        </h4>
                        <span className="text-xs text-muted-foreground font-mono">
                          {order.completedAt || order.updatedAt || order.date}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Khách đã nhận hàng và thanh toán hoàn tất
                      </p>
                    </div>
                  </div>
                )}

                {order.status === "CANCELLED" && (
                  <div className="flex gap-4 relative z-10">
                    <div className="bg-card rounded-full p-0.5">
                      <AlertTriangle className="h-6 w-6 text-red-500" />
                    </div>
                    <div className="pt-1 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm text-red-600">
                          Đơn hàng đã bị hủy
                        </h4>
                        <span className="text-xs text-muted-foreground font-mono">
                          {order.cancelledAt || order.updatedAt || order.date}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Lý do: {order.cancelReason || "Không xác định"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialog} onOpenChange={setCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hủy đơn hàng #{order.id}</DialogTitle>
            <DialogDescription>
              Hành động này sẽ hoàn trả số lượng tồn kho sản phẩm. Vui lòng ghi
              rõ lý do hủy đơn.
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
    </div>
  );
}

