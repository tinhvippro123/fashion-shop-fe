import { z } from "zod";

export const ProductOptionSchema = z.object({
  name: z.string().min(1, "Tên thuộc tính không được trống"),
  values: z.array(z.string()).min(1, "Phải có ít nhất 1 giá trị"),
});

export const ProductVariantSchema = z.object({
  id: z.number().optional(),
  sku: z.string().min(1, "SKU không được trống"),
  price: z.number().min(0, "Giá không hợp lệ"),
  costPrice: z.number().min(0).optional(),
  stock: z.number().min(0, "Tồn kho không hợp lệ"),
  options: z.record(z.string(), z.string()),
  image: z.string().optional(),
});

export const ProductSchema = z.object({
  name: z.string().min(1, "Tên sản phẩm không được để trống").max(255),
  description: z.string().optional(),
  price: z.number().min(0, "Giá không được âm"),
  discountPercent: z
    .number()
    .min(0, "% giảm giá không hợp lệ")
    .max(100, "% giảm giá tối đa 100%")
    .optional(),
  isNew: z.boolean().optional(),
  isBestSeller: z.boolean().optional(),
  sku: z.string().optional(),
  stock: z.number().min(0, "Số lượng không hợp lệ"),
  category: z.string().min(1, "Vui lòng chọn danh mục"),
  brand: z.string().optional(),
  images: z.array(z.string()).optional(),
  options: z.array(ProductOptionSchema).optional(),
  variants: z.array(ProductVariantSchema).optional(),
  status: z.enum(["draft", "published"]),
});

export type TProductPayload = z.infer<typeof ProductSchema>;
export type TProductOption = z.infer<typeof ProductOptionSchema>;
export type TProductVariant = z.infer<typeof ProductVariantSchema>;

