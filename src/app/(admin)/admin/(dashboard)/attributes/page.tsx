import { Metadata } from "next";
import { AttributesManagement } from "@/features/admin-catalog/components/AttributesManagement";

export const metadata: Metadata = {
  title: "Quản lý Màu sắc & Kích thước | LUXE Admin",
  description: "Quản lý bảng mã màu sắc và danh mục kích cỡ chuẩn cho toàn hệ thống LUXE.",
};

export default function AttributesPage() {
  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      <AttributesManagement />
    </div>
  );
}

