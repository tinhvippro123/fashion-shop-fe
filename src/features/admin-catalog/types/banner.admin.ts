export type BannerPosition = "HERO" | "FEATURED";

export interface BannerItem {
  id: number;
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  targetUrl?: string | null;
  position: BannerPosition;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBannerPayload {
  title: string;
  subtitle?: string;
  imageUrl: string;
  targetUrl?: string;
  position: BannerPosition;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateBannerPayload {
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  targetUrl?: string;
  position?: BannerPosition;
  sortOrder?: number;
  isActive?: boolean;
}
