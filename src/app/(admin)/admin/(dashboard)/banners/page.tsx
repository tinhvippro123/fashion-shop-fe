import { Metadata } from "next";
import { BannerManagement } from "@/features/admin-catalog/components/BannerManagement";

export const metadata: Metadata = {
  title: "Quản lý Banner & Trang chủ | LUXE Admin",
  description: "Quản lý các banner slider đầu trang và danh mục nổi bật hiển thị trên storefront của LUXE.",
};

export default function BannersPage() {
  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      <BannerManagement />
    </div>
  );
}

