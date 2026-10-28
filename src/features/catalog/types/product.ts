export interface ProductImage {
  id?: number;
  imageUrl: string;
  displayOrder?: number;
}

export interface ProductVariant {
  id: number;
  sku?: string;
  price?: number;
  costPrice?: number;
  size: {
    id?: number;
    name: string;
    sortOrder?: number;
  };
  stock: number;
}

export interface ProductColor {
  id: number;
  isActive: boolean;
  color: {
    id?: number;
    name: string;
    hexCode: string;
  };
  images: ProductImage[];
  variants: ProductVariant[];
}

export interface ProductDetail {
  id: number;
  name: string;
  slug?: string;
  sku?: string;
  brand?: string;
  basePrice: number;
  effectivePrice?: number;
  discountPercent?: number;
  description: string;
  isNew?: boolean;
  isBestSeller?: boolean;
  isActive?: boolean;
  totalStock?: number;
  sold?: number;
  rating?: number;
  reviewCount?: number;
  category: {
    id?: number;
    name: string;
    slug: string;
    parent?: {
      id?: number;
      name: string;
      slug: string;
    };
  };
  productColors: ProductColor[];
}

export interface ProductReviewItem {
  id: string;
  numericId?: number;
  productId: string;
  productName: string;
  customerName: string;
  customerPhone?: string;
  rating: number;
  comment: string;
  reply?: string;
  isHidden?: boolean;
  createdAt: string;
}

