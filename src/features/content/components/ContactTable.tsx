"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Search, MoreHorizontal, Eye, Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { useContacts } from "@/features/content/hooks/useContacts";
import { Contact } from "@/features/content/types/contact.admin";
import { TableSkeleton } from "@/shared/ui/table-skeleton";

function ContactTableActions({ contact }: { contact: Contact }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted outline-none">
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          render={
            <Link
              href={`/admin/contacts/${contact.id}`}
              className="w-full cursor-pointer"
            />
          }
        >
          <Eye className="mr-2 h-4 w-4" /> Xem & Phản hồi
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ContactTable() {
  const router = useRouter();
  const { contacts, isLoading } = useContacts();
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = contacts.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.subject.toLowerCase().includes(q)
    );
  });

  const isUnread = (status: string) =>
    status === "Mới" || status === "Chưa đọc";

  return (
    <div className="rounded-md border bg-card overflow-hidden">
      <div className="flex items-center gap-4 p-4 border-b">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Tìm kiếm liên hệ..."
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

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Khách hàng</TableHead>
              <TableHead>Chủ đề</TableHead>
              <TableHead>Ngày gửi</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeleton columns={5} />
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-10 text-muted-foreground"
                >
                  Chưa có tin nhắn liên hệ nào.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((contact) => (
                <TableRow
                  key={contact.id}
                  onClick={() => router.push(`/admin/contacts/${contact.id}`)}
                  className={`cursor-pointer hover:bg-muted/50 transition-colors ${
                    isUnread(contact.status) ? "bg-muted/30 font-medium" : ""
                  }`}
                >
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{contact.name}</span>
                      <span className="text-sm text-muted-foreground font-normal">
                        {contact.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{contact.subject}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {contact.date}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        isUnread(contact.status)
                          ? "bg-blue-100 text-blue-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {contact.status}
                    </span>
                  </TableCell>
                  <TableCell
                    className="text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ContactTableActions contact={contact} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile List View */}
      <div className="md:hidden flex flex-col">
        {filtered.map((contact) => (
          <div
            key={contact.id}
            onClick={() => router.push(`/admin/contacts/${contact.id}`)}
            className={`flex flex-col gap-2 p-4 border-b last:border-0 relative cursor-pointer ${
              isUnread(contact.status) ? "bg-muted/40" : ""
            }`}
          >
            <div className="flex flex-col pr-8">
              <span className="text-sm font-bold text-foreground">
                {contact.name}
              </span>
              <span className="text-xs text-muted-foreground mb-1">
                {contact.email}
              </span>
              <span className="text-sm leading-tight text-foreground">
                {contact.subject}
              </span>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-muted-foreground">
                  {contact.date}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    isUnread(contact.status)
                      ? "bg-blue-100 text-blue-800"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {contact.status}
                </span>
              </div>
            </div>
            <div
              className="absolute top-3 right-2"
              onClick={(e) => e.stopPropagation()}
            >
              <ContactTableActions contact={contact} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

