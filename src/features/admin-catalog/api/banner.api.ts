import { apiFetch } from "@/shared/lib/api";
import {
  BannerItem,
  BannerPosition,
  CreateBannerPayload,
  UpdateBannerPayload,
} from "../types/banner.admin";

export async function getPublicBanners(
  position?: BannerPosition
): Promise<BannerItem[]> {
  const url = position ? `/banners?position=${position}` : "/banners";
  const data = await apiFetch<BannerItem[]>(url);
  return data || [];
}

export async function getAdminBanners(): Promise<BannerItem[]> {
  const data = await apiFetch<BannerItem[]>("/admin/banners");
  return data || [];
}

export async function createAdminBanner(
  payload: CreateBannerPayload
): Promise<BannerItem> {
  return apiFetch<BannerItem>("/admin/banners", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAdminBanner(
  id: number,
  payload: UpdateBannerPayload
): Promise<BannerItem> {
  return apiFetch<BannerItem>(`/admin/banners/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function toggleBannerStatus(id: number): Promise<BannerItem> {
  return apiFetch<BannerItem>(`/admin/banners/${id}/status`, {
    method: "PATCH",
  });
}

export async function deleteAdminBanner(id: number): Promise<void> {
  return apiFetch<void>(`/admin/banners/${id}`, {
    method: "DELETE",
  });
}
