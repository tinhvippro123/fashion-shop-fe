import { z } from "zod";
import { SKU_REGEX } from "@/shared/utils/validation";

export const ProductOptionSchema = z.object({
  name: z
    .string()
    .trim()
    .max(30, "Tên thuộc tính tối đa 30 ký tự"),
  values: z.array(z.string().trim().min(1)),
});

export const ProductVariantSchema = z.object({
  id: z.number().optional(),
  sku: z
    .string()
    .trim()
    .min(1, "SKU không được trống")
    .max(40, "SKU không vượt quá 40 ký tự")
    .regex(
      SKU_REGEX,
      "SKU chỉ chứa chữ không dấu, số, dấu gạch ngang hoặc gạch dưới"
    ),
  price: z
    .number()
    .int("Giá bán phải là số nguyên VNĐ")
    .min(0, "Giá bán không được âm")
    .max(100000000, "Giá bán tối đa 100.000.000đ"),
  costPrice: z
    .number()
    .min(0, "Giá vốn không được âm")
    .max(100000000, "Giá vốn tối đa 100.000.000đ")
    .optional(),
  stock: z
    .number()
    .int("Tồn kho phải là số nguyên")
    .min(0, "Tồn kho không được âm")
    .max(10000, "Tồn kho tối đa 10.000"),
  options: z.record(z.string(), z.string()),
  image: z.string().optional(),
});

export const ProductSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Tên sản phẩm phải có ít nhất 2 ký tự")
      .max(100, "Tên sản phẩm không vượt quá 100 ký tự"),
    description: z.string().max(5000, "Mô tả không vượt quá 5000 ký tự").optional(),
    price: z
      .number()
      .int("Giá bán phải là số nguyên VNĐ")
      .min(0, "Giá bán không được âm")
      .max(100000000, "Giá bán tối đa 100.000.000đ"),
    discountPercent: z
      .number()
      .int("% giảm giá phải là số nguyên")
      .min(0, "% giảm giá không được âm")
      .max(90, "% giảm giá tối đa 90%")
      .optional(),
    isNew: z.boolean().optional(),
    isBestSeller: z.boolean().optional(),
    sku: z
      .string()
      .trim()
      .max(25, "Mã SKU gốc không vượt quá 25 ký tự")
      .refine((v) => !v || SKU_REGEX.test(v), {
        message: "Mã SKU chỉ chứa chữ không dấu, số, dấu gạch ngang hoặc gạch dưới",
      })
      .optional(),
    stock: z
      .number()
      .int("Tồn kho phải là số nguyên")
      .min(0, "Số lượng không được âm")
      .max(10000, "Số lượng tối đa 10.000"),
    category: z.string().min(1, "Vui lòng chọn danh mục"),
    brand: z.string().max(50, "Nhãn hiệu tối đa 50 ký tự").optional(),
    material: z.string().max(150, "Chất liệu tối đa 150 ký tự").optional(),
    careInstructions: z
      .string()
      .max(500, "Hướng dẫn bảo quản tối đa 500 ký tự")
      .optional(),
    images: z.array(z.string()).optional(),
    colorImages: z.record(z.string(), z.array(z.string())).optional(),
    options: z.array(ProductOptionSchema).optional(),
    variants: z.array(ProductVariantSchema).optional(),
    status: z.enum(["draft", "published"]),
  })
  .superRefine((data, ctx) => {
    if (data.status === "published") {
      if (!data.price || data.price < 1000) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["price"],
          message: "Giá bán tối thiểu 1.000đ khi đăng bán (hoặc chọn Lưu nháp)",
        });
      }
      (data.variants || []).forEach((v, idx) => {
        const effectiveVariantPrice = v.price > 0 ? v.price : data.price;
        if (!effectiveVariantPrice || effectiveVariantPrice < 1000) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["variants", idx, "price"],
            message: "Giá biến thể tối thiểu 1.000đ",
          });
        }
      });
    }
  });

export type TProductPayload = z.infer<typeof ProductSchema>;
export type TProductOption = z.infer<typeof ProductOptionSchema>;
export type TProductVariant = z.infer<typeof ProductVariantSchema>;
