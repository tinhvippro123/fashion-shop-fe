"use client";

import { ContactTable } from "@/features/content";

export default function ContactsPage() {
  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Liên hệ</h2>
          <p className="text-muted-foreground hidden sm:block">
            Quản lý tin nhắn liên hệ từ khách hàng.
          </p>
        </div>
      </div>

      <ContactTable />
    </div>
  );
}

