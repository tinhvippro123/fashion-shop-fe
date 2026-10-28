"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BackButton } from "@/shared/ui/back-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { Send, CheckCircle2, Clock } from "lucide-react";
import { RichTextEditor } from "@/shared/ui/rich-text-editor";
import { toast } from "sonner";
import { apiFetch } from "@/shared/lib/api";
import { Contact } from "@/features/content";

export default function ContactDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyHtml, setReplyHtml] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    apiFetch<Contact>(`/admin/contacts/${id}`)
      .then((res) => {
        setContact(res);
        if (res.reply) {
          setReplyHtml(res.reply);
        }
      })
      .catch(() => setContact(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Đang tải chi tiết liên hệ...
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Không tìm thấy liên hệ #{id}
      </div>
    );
  }

  const handleSendReply = async () => {
    const plain = replyHtml.replace(/<[^>]*>/g, "").trim();
    if (!plain) {
      toast.error("Vui lòng nhập nội dung phản hồi");
      return;
    }
    setSubmitting(true);
    try {
      const updated = await apiFetch<Contact>(`/admin/contacts/${contact.id}/reply`, {
        method: "PUT",
        body: JSON.stringify({ reply: plain }),
      });
      setContact(updated);
      toast.success("Đã gửi phản hồi liên hệ cho khách hàng!");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Gửi phản hồi thất bại"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const isResolved = contact.rawStatus === "REPLIED";

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full pb-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BackButton />
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Chi tiết liên hệ
          </h2>
        </div>
        <div>
          {isResolved ? (
            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none gap-1.5 px-3 py-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Đã phản hồi
            </Badge>
          ) : (
            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none gap-1.5 px-3 py-1">
              <Clock className="w-3.5 h-3.5" /> Chờ phản hồi
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0 pb-4 border-b">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback className="bg-muted text-foreground font-bold">
                    {contact.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-0.5">
                  <CardTitle className="text-base font-bold leading-tight">
                    {contact.subject}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {contact.name} &lt;{contact.email}&gt;
                  </p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">
                {contact.date}
              </span>
            </CardHeader>
            <CardContent className="pt-6 flex flex-col gap-4">
              <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
                {contact.message}
              </p>

              {contact.reply && (
                <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
                  <p className="text-xs font-bold text-emerald-800 uppercase mb-1">
                    Phản hồi của Quản trị viên
                  </p>
                  <p className="text-sm text-emerald-900 whitespace-pre-wrap">
                    {contact.reply}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-3 bg-muted/30 rounded-t-xl border-b">
              <CardTitle className="text-sm font-semibold">
                Gửi phản hồi tới khách hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex flex-col">
              <div className="[&_.ql-container]:border-x-0 [&_.ql-container]:border-b-0 [&_.ql-toolbar]:border-x-0 [&_.ql-toolbar]:border-t-0 [&_.ql-toolbar]:border-b">
                <RichTextEditor
                  value={replyHtml}
                  onChange={setReplyHtml}
                  placeholder="Nhập nội dung phản hồi cho khách hàng..."
                  editorClassName="min-h-[150px]"
                />
              </div>
              <div className="flex items-center justify-end p-4 border-t bg-muted/30 rounded-b-xl">
                <Button disabled={submitting} onClick={handleSendReply}>
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
                Thông tin người gửi
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div>
                <span className="text-xs text-muted-foreground block mb-1">
                  Tên khách hàng
                </span>
                <span className="text-sm font-medium text-foreground">
                  {contact.name}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block mb-1">
                  Email
                </span>
                <span className="text-sm font-medium text-blue-600">
                  {contact.email}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block mb-1">
                  Số điện thoại
                </span>
                <span className="text-sm font-medium text-foreground">
                  {contact.phone || "Chưa cung cấp"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-bold uppercase text-muted-foreground tracking-wider">
                Chi tiết Yêu cầu
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div>
                <span className="text-xs text-muted-foreground block mb-1">
                  Mã liên hệ
                </span>
                <span className="text-sm font-mono text-foreground">
                  #TKT-{contact.id}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block mb-1">
                  Thời gian gửi
                </span>
                <span className="text-sm font-medium text-foreground">
                  {contact.date}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block mb-1">
                  Trạng thái
                </span>
                <Badge variant="outline" className="bg-muted font-normal">
                  {contact.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

