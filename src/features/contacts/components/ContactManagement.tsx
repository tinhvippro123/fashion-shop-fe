"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { apiFetch, apiRequestWithMeta } from "@/shared/lib/api";
import { ContactMessageDto } from "../types/contact.types";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { StatusBadge } from "@/shared/ui/status-badge";
import { TableSkeleton } from "@/shared/ui/table-skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import {
  Mail,
  MessageSquareReply,
  Search,
  Send,
  Trash2,
  Phone,
  Clock,
  CheckCircle2,
} from "lucide-react";

function formatDateTime(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ContactManagement() {
  const [contacts, setContacts] = useState<ContactMessageDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ALL" | "NEW" | "REPLIED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedContact, setSelectedContact] =
    useState<ContactMessageDto | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const [deletingContact, setDeletingContact] =
    useState<ContactMessageDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let active = true;
    apiFetch<ContactMessageDto[]>("/admin/contacts")
      .then((data) => {
        if (active) setContacts(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (active) {
          toast.error(
            err instanceof Error
              ? err.message
              : "Không thể tải danh sách liên hệ"
          );
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const counts = useMemo(() => {
    const pending = contacts.filter((c) => c.status === "NEW").length;
    const replied = contacts.filter((c) => c.status === "REPLIED").length;
    return { all: contacts.length, pending, replied };
  }, [contacts]);

  const filteredContacts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return contacts.filter((item) => {
      if (activeTab !== "ALL" && item.status !== activeTab) return false;
      if (!q) return true;
      return (
        item.fullName.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q) ||
        (item.phone || "").toLowerCase().includes(q) ||
        item.subject.toLowerCase().includes(q) ||
        item.message.toLowerCase().includes(q)
      );
    });
  }, [contacts, activeTab, searchQuery]);

  const openDetailDialog = (contact: ContactMessageDto) => {
    setSelectedContact(contact);
    setReplyText(contact.adminReply || "");
  };

  const handleSendReply = async () => {
    if (!selectedContact) return;
    if (replyText.trim().length < 2 || replyText.trim().length > 1500) {
      toast.error("Nội dung phản hồi phải từ 2 đến 1500 ký tự");
      return;
    }

    setIsSubmittingReply(true);
    try {
      const { data: updated, message } =
        await apiRequestWithMeta<ContactMessageDto>(
          `/admin/contacts/${selectedContact.id}/reply`,
          {
            method: "POST",
            body: JSON.stringify({ reply: replyText.trim() }),
          }
        );

      setContacts((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
      setSelectedContact(updated);
      toast.success(message || "Đã gửi phản hồi qua email cho khách hàng");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Không thể gửi phản hồi"
      );
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingContact) return;
    setIsDeleting(true);
    try {
      await apiFetch(`/admin/contacts/${deletingContact.id}`, {
        method: "DELETE",
      });
      setContacts((prev) => prev.filter((c) => c.id !== deletingContact.id));
      if (selectedContact?.id === deletingContact.id) {
        setSelectedContact(null);
      }
      toast.success("Đã xóa yêu cầu liên hệ");
      setDeletingContact(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể xóa liên hệ");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Liên hệ & Hỗ trợ khách hàng
          </h2>
          <p className="text-sm text-muted-foreground hidden sm:block">
            Tiếp nhận thắc mắc từ trang Liên hệ và gửi phản hồi trực tiếp qua email khách hàng.
          </p>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "ALL" | "NEW" | "REPLIED")}
        className="w-full"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <TabsList className="bg-muted/50 border self-start">
            <TabsTrigger
              value="ALL"
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              Tất cả ({counts.all})
            </TabsTrigger>
            <TabsTrigger
              value="NEW"
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              Chờ xử lý ({counts.pending})
            </TabsTrigger>
            <TabsTrigger
              value="REPLIED"
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              Đã phản hồi ({counts.replied})
            </TabsTrigger>
          </TabsList>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tên, email, chủ đề..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-card"
            />
          </div>
        </div>

        <div className="rounded-lg border bg-card">
          {isLoading ? (
            <div className="p-4">
              <TableSkeleton rows={5} columns={5} />
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="py-16 px-4 text-center text-muted-foreground space-y-2">
              <Mail className="h-8 w-8 mx-auto opacity-40" />
              <p className="text-sm font-medium text-foreground">
                Chưa có yêu cầu liên hệ nào
              </p>
              <p className="text-xs">
                Các tin nhắn khách gửi từ trang /contact sẽ hiển thị tại đây.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[180px]">Khách hàng</TableHead>
                  <TableHead className="min-w-[260px]">
                    Chủ đề & Nội dung
                  </TableHead>
                  <TableHead className="w-[140px]">Trạng thái</TableHead>
                  <TableHead className="w-[155px]">Thời gian gửi</TableHead>
                  <TableHead className="w-[150px] text-right">
                    Thao tác
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.map((item) => (
                  <TableRow
                    key={item.id}
                    className="cursor-pointer hover:bg-muted/40"
                    onClick={() => openDetailDialog(item)}
                  >
                    <TableCell>
                      <div className="font-medium text-sm text-foreground">
                        {item.fullName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {item.email}
                      </div>
                      {item.phone && (
                        <div className="text-xs text-muted-foreground">
                          {item.phone}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-sm text-foreground line-clamp-1">
                        {item.subject}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {item.message}
                      </p>
                    </TableCell>
                    <TableCell>
                      {item.status === "REPLIED" ? (
                        <StatusBadge tone="success" size="sm">
                          Đã phản hồi
                        </StatusBadge>
                      ) : (
                        <StatusBadge tone="warning" size="sm">
                          Chờ xử lý
                        </StatusBadge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDateTime(item.createdAt)}
                    </TableCell>
                    <TableCell
                      className="text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          type="button"
                          size="sm"
                          variant={item.status === "NEW" ? "default" : "outline"}
                          className="h-8 text-xs gap-1.5"
                          onClick={() => openDetailDialog(item)}
                        >
                          <MessageSquareReply className="h-3.5 w-3.5" />
                          {item.status === "NEW" ? "Phản hồi" : "Xem"}
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDeletingContact(item)}
                          title="Xóa yêu cầu này"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </Tabs>

      {/* View & Reply Dialog */}
      <Dialog
        open={Boolean(selectedContact)}
        onOpenChange={(open) => {
          if (!open) setSelectedContact(null);
        }}
      >
        <DialogContent className="sm:max-w-xl">
          {selectedContact && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between gap-2 pr-6">
                  <DialogTitle className="text-lg">
                    {selectedContact.subject}
                  </DialogTitle>
                  {selectedContact.status === "REPLIED" ? (
                    <StatusBadge tone="success" size="sm">
                      Đã phản hồi
                    </StatusBadge>
                  ) : (
                    <StatusBadge tone="warning" size="sm">
                      Chờ xử lý
                    </StatusBadge>
                  )}
                </div>
                <DialogDescription className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs">
                  <span className="font-medium text-foreground">
                    {selectedContact.fullName}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" />
                    {selectedContact.email}
                  </span>
                  {selectedContact.phone && (
                    <span className="inline-flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" />
                      {selectedContact.phone}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {formatDateTime(selectedContact.createdAt)}
                  </span>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="rounded-md border bg-muted/40 p-3.5 text-sm leading-relaxed whitespace-pre-wrap break-words">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Nội dung khách hàng gửi
                  </div>
                  {selectedContact.message}
                </div>

                {selectedContact.status === "REPLIED" &&
                  selectedContact.repliedAt && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      <span>
                        Đã gửi email phản hồi lúc{" "}
                        {formatDateTime(selectedContact.repliedAt)} (bạn có thể
                        gửi cập nhật lại nếu cần).
                      </span>
                    </div>
                  )}

                <div className="space-y-1.5">
                  <label
                    htmlFor="admin-contact-reply"
                    className="text-xs font-medium text-foreground block"
                  >
                    Nội dung phản hồi gửi tới{" "}
                    <span className="font-semibold">
                      {selectedContact.email}
                    </span>
                  </label>
                  <textarea
                    id="admin-contact-reply"
                    rows={5}
                    maxLength={1500}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Nhập câu trả lời hỗ trợ khách hàng..."
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
                  />
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedContact(null)}
                  disabled={isSubmittingReply}
                >
                  Đóng
                </Button>
                <Button
                  type="button"
                  className="gap-2"
                  onClick={handleSendReply}
                  disabled={isSubmittingReply || !replyText.trim()}
                >
                  <Send className="h-4 w-4" />
                  {isSubmittingReply
                    ? "Đang gửi..."
                    : selectedContact.status === "REPLIED"
                    ? "Gửi lại phản hồi qua Email"
                    : "Gửi phản hồi qua Email"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(deletingContact)}
        onOpenChange={(open) => {
          if (!open) setDeletingContact(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa liên hệ</DialogTitle>
            <DialogDescription className="pt-1">
              Bạn có chắc muốn xóa yêu cầu liên hệ từ{" "}
              <strong className="text-foreground">
                {deletingContact?.fullName}
              </strong>
              ? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeletingContact(null)}
              disabled={isDeleting}
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Đang xóa..." : "Xóa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
