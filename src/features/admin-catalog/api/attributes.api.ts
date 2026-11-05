import { apiFetch } from "@/shared/lib/api";
import { AdminColor, AdminSize } from "../types/attributes.admin";

export async function getAdminColors(): Promise<AdminColor[]> {
  const data = await apiFetch<AdminColor[]>("/admin/colors");
  return data || [];
}

export async function createAdminColor(payload: {
  name: string;
  hexCode?: string;
}): Promise<AdminColor> {
  return apiFetch<AdminColor>("/admin/colors", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAdminColor(
  id: number,
  payload: { name?: string; hexCode?: string }
): Promise<AdminColor> {
  return apiFetch<AdminColor>(`/admin/colors/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminColor(id: number): Promise<void> {
  return apiFetch<void>(`/admin/colors/${id}`, {
    method: "DELETE",
  });
}

export async function getAdminSizes(): Promise<AdminSize[]> {
  const data = await apiFetch<AdminSize[]>("/admin/sizes");
  return data || [];
}

export async function createAdminSize(payload: {
  name: string;
  sortOrder?: number;
}): Promise<AdminSize> {
  return apiFetch<AdminSize>("/admin/sizes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAdminSize(
  id: number,
  payload: { name?: string; sortOrder?: number }
): Promise<AdminSize> {
  return apiFetch<AdminSize>(`/admin/sizes/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminSize(id: number): Promise<void> {
  return apiFetch<void>(`/admin/sizes/${id}`, {
    method: "DELETE",
  });
}

