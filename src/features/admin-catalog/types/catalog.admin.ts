export interface AdminOptionDto {
  name: string;
  values: string[];
}

export interface AdminVariantPayloadDto {
  id?: number;
  sku: string;
  price: number;
  costPrice?: number;
  stock: number;
  options: Record<string, string>;
  image?: string;
}

export interface RawProductResponseDto {
  id: number;
  name: string;
  slug: string;
  sku: string;
  brand: string;
  basePrice: number;
  effectivePrice: number;
  formattedPrice: string;
  discountPercent: number;
  description?: string;
  material?: string;
  careInstructions?: string;
  isNew: boolean;
  isBestSeller: boolean;
  isActive: boolean;
  totalStock: number;
  sold: number;
  rating: number;
  reviewCount: number;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  productColors?: Array<{
    id?: number;
    isActive?: boolean;
    color?: {
      id?: number;
      name?: string;
      hexCode?: string;
    };
    images?: Array<{
      id?: number;
      imageUrl: string;
      displayOrder?: number;
    }>;
  }>;
  images: string[];
  colorImages?: Record<string, string[]>;
  options: AdminOptionDto[];
  adminVariants: AdminVariantPayloadDto[];
}

export interface AdminProduct {
  id: string;
  numericId: number;
  name: string;
  sku: string;
  brand: string;
  category: string;
  categorySlug: string;
  price: string;
  basePrice: number;
  discountPercent?: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  stock: number;
  sold: number;
  rating: number;
  reviewCount: number;
  isActive: boolean;
  image?: string;
  description?: string;
}

export interface AdminCategory {
  id: string;
  numericId: number;
  parentId?: number | null;
  parentName?: string | null;
  name: string;
  slug: string;
  description?: string;
  productCount: number;
  status: string;
  isActive: boolean;
}

export interface IOptionSuggestions {
  names: string[];
  values: Record<string, string[]>;
}

export interface ImportVariantOption {
  id: number;
  sku: string;
  price: number;
  costPrice: number;
  stock: number;
  size?: { id: number; name: string };
  colorName: string;
  hexCode?: string;
  productId: number;
  productName: string;
  imageUrl?: string;
}

export interface StockImportItemDto {
  id: number;
  variantId: number;
  sku: string;
  productName: string;
  colorName: string;
  sizeName: string;
  quantity: number;
  unitCost: number;
  subtotal: number;
  currentStock: number;
}

export interface StockImportResponseDto {
  id: number;
  importCode: string;
  supplierName: string;
  note?: string;
  totalCost: number;
  formattedTotalCost: string;
  createdByEmail: string;
  createdAt: string;
  totalQuantity: number;
  itemCount: number;
  items: StockImportItemDto[];
}

export function getCategoryFullPath(
  cat: AdminCategory,
  allCategories: AdminCategory[]
): string {
  const parts: string[] = [cat.name];
  let curr = cat;
  const visited = new Set<string>();

  while (curr.parentId && !visited.has(String(curr.id))) {
    visited.add(String(curr.id));
    const parent = allCategories.find(
      (c) => String(c.id) === String(curr.parentId) || String(c.numericId) === String(curr.parentId)
    );
    if (!parent) break;
    parts.unshift(parent.name);
    curr = parent;
  }

  return parts.join(" › ");
}

