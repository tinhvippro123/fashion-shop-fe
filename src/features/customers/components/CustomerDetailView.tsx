"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { BackButton } from "@/shared/ui/back-button";
import {
  MapPin,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  CreditCard,
  Star,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui/tabs";
import { useCustomerDetail } from "../hooks/useCustomers";
import { apiFetch } from "@/shared/lib/api";

interface CustomerReviewItem {
  id: string;
  productId: string;
  productName: string;
  customerName: string;
  rating: number;
  comment: string;
  isHidden: boolean;
  createdAt: string;
}

export function CustomerDetailView({ customerId }: { customerId: string }) {
  const { customer, isLoading } = useCustomerDetail(customerId);
  const [customerReviews, setCustomerReviews] = useState<CustomerReviewItem[]>(
    []
  );

  useEffect(() => {
    if (!customer) return;
    apiFetch<CustomerReviewItem[]>("/admin/reviews")
      .then((all) => {
        setCustomerReviews(
          (all || []).filter((r) => r.customerName === customer.name)
        );
      })
      .catch(() => setCustomerReviews([]));
  }, [customer]);

  if (isLoading) {
    return (
      <div className="flex justify-center p-8 text-muted-foreground">
        Đang tải chi tiết khách hàng...
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex justify-center p-8 text-muted-foreground">
        Không tìm thấy khách hàng
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-2">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Chi tiết Khách hàng
            </h2>
            <p className="text-muted-foreground">
              Xem hồ sơ và lịch sử mua hàng
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột trái: Profile & Address */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center pb-6 border-b">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {customer.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-bold mb-1">{customer.name}</h3>
                <div className="flex items-center gap-2">
                  <Badge
                    className={
                      customer.accountStatus === "BANNED"
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "bg-emerald-500 hover:bg-emerald-600 text-white"
                    }
                  >
                    {customer.accountStatus === "BANNED"
                      ? "Bị khóa"
                      : "Đang hoạt động"}
                  </Badge>
                  <Badge variant="secondary">{customer.tier}</Badge>
                </div>
              </div>

              <div className="py-6 flex flex-col gap-4">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{customer.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{customer.phone}</span>
                </div>
                {customer.gender && (
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-muted-foreground">Giới tính:</span>
                    <span>
                      {customer.gender === "FEMALE"
                        ? "Nữ"
                        : customer.gender === "MALE"
                        ? "Nam"
                        : "Khác"}
                    </span>
                  </div>
                )}
                {customer.dateOfBirth && (
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-muted-foreground">Ngày sinh:</span>
                    <span>{customer.dateOfBirth}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Tham gia: {customer.joinedDate || "N/A"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sổ địa chỉ</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {!customer.addresses || customer.addresses.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Khách hàng chưa lưu địa chỉ giao hàng nào.
                </p>
              ) : (
                customer.addresses.map((addr) => (
                  <div key={addr.id} className="p-3 border rounded-md relative">
                    {addr.isDefault && (
                      <Badge
                        variant="outline"
                        className="absolute top-2 right-2 text-[10px]"
                      >
                        Mặc định
                      </Badge>
                    )}
                    <p className="text-sm font-semibold mb-1">
                      {addr.recipientName || customer.name} - {addr.phone}
                    </p>
                    <div className="flex items-start gap-2 text-sm text-muted-foreground mt-2">
                      <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                      <span>{addr.address}</span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Cột phải: Thống kê & Đơn hàng */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4 sm:p-6 flex items-center gap-4">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6 text-foreground" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                    Tổng số đơn
                  </p>
                  <h3 className="text-xl sm:text-2xl font-bold">
                    {customer.totalOrders}
                  </h3>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 sm:p-6 flex items-center gap-4">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                    Tổng chi tiêu
                  </p>
                  <h3
                    className="text-xl sm:text-2xl font-bold truncate"
                    title={customer.totalSpent}
                  >
                    {customer.totalSpent}
                  </h3>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="orders" className="flex-1 flex flex-col">
            <TabsList className="w-full justify-start bg-transparent border-b rounded-none p-0 h-auto gap-6 mb-6">
              <TabsTrigger
                value="orders"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-2 px-0"
              >
                Lịch sử đặt hàng ({customer.orderHistory?.length || 0})
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-2 px-0"
              >
                Lịch sử đánh giá ({customerReviews.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="orders"
              className="m-0 focus-visible:outline-none"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Lịch sử đặt hàng</CardTitle>
                  <CardDescription>
                    Các đơn hàng gần đây của khách hàng này.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!customer.orderHistory ||
                  customer.orderHistory.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-6 text-center">
                      Khách hàng chưa có đơn hàng nào.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Mã đơn</TableHead>
                            <TableHead>Ngày đặt</TableHead>
                            <TableHead>Số mặt hàng</TableHead>
                            <TableHead>Tổng tiền</TableHead>
                            <TableHead className="text-right">
                              Trạng thái
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {customer.orderHistory.map((order) => (
                            <TableRow key={order.id}>
                              <TableCell className="font-medium text-blue-600">
                                <Link
                                  href={`/admin/orders/${order.id}`}
                                  className="hover:underline"
                                >
                                  #{order.id}
                                </Link>
                              </TableCell>
                              <TableCell>{order.date}</TableCell>
                              <TableCell>{order.items}</TableCell>
                              <TableCell className="font-semibold">
                                {order.total}
                              </TableCell>
                              <TableCell className="text-right">
                                <Badge
                                  variant="outline"
                                  className="bg-muted border-border font-normal"
                                >
                                  {order.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent
              value="reviews"
              className="m-0 focus-visible:outline-none flex flex-col gap-4"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Lịch sử đánh giá</CardTitle>
                  <CardDescription>
                    Tất cả các đánh giá sản phẩm của khách hàng này.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {customerReviews.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-6 text-center">
                      Khách hàng chưa viết đánh giá nào.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {customerReviews.map((rev) => (
                        <div
                          key={rev.id}
                          className="flex flex-col gap-3 p-4 border rounded-lg bg-muted/30"
                        >
                          <div className="flex justify-between items-start">
                            <Link
                              href={`/admin/products/${rev.productId}/edit`}
                              className="font-bold text-blue-600 hover:underline"
                            >
                              {rev.productName}
                            </Link>
                            <span className="text-xs text-muted-foreground">
                              {rev.createdAt}
                            </span>
                          </div>
                          <div className="flex text-yellow-400">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < rev.rating
                                    ? "fill-current"
                                    : "text-zinc-300"
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-sm text-foreground">
                            {rev.comment}
                          </p>
                          <div className="flex gap-2">
                            <Badge
                              variant="outline"
                              className={
                                rev.isHidden
                                  ? "bg-muted text-muted-foreground"
                                  : "bg-green-100 text-green-700 border-none font-normal"
                              }
                            >
                              {rev.isHidden ? "Đã ẩn" : "Đang hiển thị"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

