"use client";

import { useRouter } from "next/navigation";
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
  Eye,
  Lock,
  Unlock,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/shared/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { useState } from "react";
import { toast } from "sonner";
import { Checkbox } from "@/shared/ui/checkbox";
import { Customer } from "@/features/customers/types/customer.admin";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/ui/dialog";
import { cn } from "@/shared/utils/utils";
import { TableSkeleton } from "@/shared/ui/table-skeleton";

interface CustomerTableActionsProps {
  cus: Customer;
  onToggleBan: (cus: Customer) => void;
}

function CustomerTableActions({
  cus,
  onToggleBan,
}: CustomerTableActionsProps) {
  const router = useRouter();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted outline-none">
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onClick={() => router.push(`/admin/customers/${cus.id}`)}
        >
          <Eye className="mr-2 h-4 w-4" /> Xem chi tiết
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {cus.accountStatus === "BANNED" ? (
          <DropdownMenuItem
            onClick={() => onToggleBan(cus)}
            className="text-emerald-600 font-medium cursor-pointer flex items-center"
          >
            <Unlock className="mr-2 h-4 w-4" /> Mở khóa
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onClick={() => onToggleBan(cus)}
            className="text-red-600 font-medium cursor-pointer flex items-center"
          >
            <Lock className="mr-2 h-4 w-4" /> Khóa tài khoản
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface CustomerTableProps {
  customers: Customer[];
  isLoading: boolean;
  onUpdateStatus: (
    customerId: string,
    status: "ACTIVE" | "BANNED"
  ) => Promise<Customer>;
  isBannedView?: boolean;
}

export function CustomerTable({
  customers,
  isLoading,
  onUpdateStatus,
  isBannedView = false,
}: CustomerTableProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [banCustomer, setBanCustomer] = useState<Customer | null>(null);
  const [banReason, setBanReason] = useState<string>("Boom hàng nhiều lần");

  const filteredCustomers = customers.filter((c) => {
    const statusMatch =
      c.accountStatus === "BANNED" ? isBannedView : !isBannedView;

    if (!statusMatch) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.phone || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const toggleSelectAll = () => {
    if (
      selectedIds.length === filteredCustomers.length &&
      filteredCustomers.length > 0
    ) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCustomers.map((c) => c.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleToggleBan = async (c: Customer) => {
    if (c.accountStatus === "BANNED") {
      try {
        await onUpdateStatus(c.id, "ACTIVE");
        toast.success(`Đã mở khóa tài khoản cho khách hàng "${c.name}"!`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Không thể mở khóa");
      }
    } else {
      setBanReason("Boom hàng nhiều lần");
      setBanCustomer(c);
    }
  };

  const confirmBan = async () => {
    if (!banCustomer) return;
    try {
      await onUpdateStatus(banCustomer.id, "BANNED");
      toast.success(
        `Đã khóa tài khoản "${banCustomer.name}" với lý do: ${banReason}`
      );
      setBanCustomer(null);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Không thể khóa tài khoản"
      );
    }
  };

  const handleBulkStatus = async (targetStatus: "ACTIVE" | "BANNED") => {
    try {
      await Promise.all(
        selectedIds.map((id) => onUpdateStatus(id, targetStatus))
      );
      toast.success(
        targetStatus === "ACTIVE"
          ? `Đã mở khóa ${selectedIds.length} khách hàng!`
          : `Đã khóa ${selectedIds.length} khách hàng!`
      );
      setSelectedIds([]);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Thao tác hàng loạt thất bại"
      );
    }
  };

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
                placeholder="Tìm kiếm tên, email, sđt..."
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

        {/* Desktop Table View */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <div className="flex items-center justify-center">
                    <Checkbox
                      checked={
                        filteredCustomers.length > 0 &&
                        selectedIds.length === filteredCustomers.length
                      }
                      onCheckedChange={toggleSelectAll}
                      aria-label="Select all"
                    />
                  </div>
                </TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Số điện thoại</TableHead>
                <TableHead>Đơn hàng</TableHead>
                <TableHead>Tổng chi tiêu</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Phân hạng</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableSkeleton columns={8} />
              ) : filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-10 text-muted-foreground"
                  >
                    Không tìm thấy khách hàng nào
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((cus) => (
                  <TableRow
                    key={cus.id}
                    className={cn(
                      selectedIds.includes(cus.id) ? "bg-muted/50" : "",
                      "cursor-pointer hover:bg-muted/50 transition-colors"
                    )}
                    onClick={() => router.push(`/admin/customers/${cus.id}`)}
                  >
                    <TableCell
                      className="text-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelect(cus.id);
                      }}
                    >
                      <div
                        className="flex items-center justify-center p-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={selectedIds.includes(cus.id)}
                          onCheckedChange={() => toggleSelect(cus.id)}
                          aria-label={`Select ${cus.name}`}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src="" alt={cus.name} />
                          <AvatarFallback className="bg-muted text-muted-foreground">
                            {cus.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium">{cus.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {cus.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{cus.phone}</TableCell>
                    <TableCell>{cus.orders}</TableCell>
                    <TableCell className="font-medium">
                      {cus.totalSpent}
                    </TableCell>
                    <TableCell>
                      {cus.accountStatus === "BANNED" ? (
                        <Badge variant="destructive" className="border-none">
                          Bị khóa
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none">
                          Hoạt động
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          cus.tier === "Kim cương" || cus.tier === "Vàng"
                            ? "default"
                            : "secondary"
                        }
                        className={
                          cus.tier === "Kim cương" || cus.tier === "Vàng"
                            ? "bg-amber-100 text-amber-700 hover:bg-amber-200 border-none"
                            : ""
                        }
                      >
                        {cus.tier}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className="text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <CustomerTableActions
                        cus={cus}
                        onToggleBan={handleToggleBan}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile List/Card View */}
        <div className="md:hidden flex flex-col gap-3 p-4">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              Đang tải...
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              Không tìm thấy khách hàng nào
            </div>
          ) : (
            filteredCustomers.map((cus) => (
              <div
                key={cus.id}
                className="flex flex-col gap-4 p-4 border rounded-lg relative cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => router.push(`/admin/customers/${cus.id}`)}
              >
                <div
                  className="absolute top-4 left-4 z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Checkbox
                    checked={selectedIds.includes(cus.id)}
                    onCheckedChange={() => toggleSelect(cus.id)}
                  />
                </div>
                <div className="flex items-center gap-3 pl-8 pr-8 pb-3">
                  <Avatar className="h-10 w-10 shrink-0 border">
                    <AvatarFallback className="bg-muted text-muted-foreground font-semibold">
                      {cus.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col flex-1">
                    <span className="font-bold text-foreground text-base leading-tight mb-0.5">
                      {cus.name}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      {cus.email}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
                      Điện thoại
                    </span>
                    <span className="font-medium text-sm">{cus.phone}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
                      Tổng chi tiêu
                    </span>
                    <span className="font-bold text-foreground text-sm">
                      {cus.totalSpent}
                    </span>
                  </div>
                </div>

                <div
                  className="absolute top-3 right-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <CustomerTableActions
                    cus={cus}
                    onToggleBan={handleToggleBan}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Floating Bulk Action Bar */}
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
              {isBannedView ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleBulkStatus("ACTIVE")}
                  className="text-emerald-400 hover:text-emerald-300 hover:bg-background/10"
                >
                  Mở khóa tất cả
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleBulkStatus("BANNED")}
                  className="text-red-500 hover:text-red-600 hover:bg-background/10"
                >
                  <Lock className="h-4 w-4 mr-2" /> Khóa tất cả
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

      {/* Ban Customer Dialog */}
      <Dialog
        open={!!banCustomer}
        onOpenChange={(open) => !open && setBanCustomer(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận khóa tài khoản</DialogTitle>
            <DialogDescription>
              Bạn đang thao tác khóa tài khoản của{" "}
              <strong>{banCustomer?.name}</strong>. Khách hàng sẽ không thể đăng
              nhập cho đến khi được mở khóa.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm font-medium mb-3">Vui lòng chọn lý do khóa:</p>
            <div className="flex flex-col gap-3">
              {[
                "Boom hàng nhiều lần",
                "Gian lận Voucher / Khuyến mãi",
                "Ngôn từ đả kích / Spam đánh giá",
                "Khác",
              ].map((reason) => (
                <label
                  key={reason}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="banReason"
                    value={reason}
                    checked={banReason === reason}
                    onChange={(e) => setBanReason(e.target.value)}
                  />
                  <span className="text-sm">{reason}</span>
                </label>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBanCustomer(null)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={confirmBan}>
              Khóa ngay
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

