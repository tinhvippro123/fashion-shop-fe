import { z } from "zod";
import { SLUG_REGEX } from "@/shared/utils/validation";

export const CategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Tên danh mục phải có ít nhất 2 ký tự")
    .max(60, "Tên danh mục không vượt quá 60 ký tự"),
  slug: z
    .string()
    .trim()
    .min(2, "Đường dẫn (slug) phải có ít nhất 2 ký tự")
    .max(80, "Đường dẫn (slug) không vượt quá 80 ký tự")
    .regex(
      SLUG_REGEX,
      "Slug chỉ gồm chữ thường không dấu, số và dấu gạch ngang (VD: ao-so-mi-nu)"
    ),
  parentId: z.string().optional(),
  active: z.boolean(),
});

export type TCategoryPayload = z.infer<typeof CategorySchema>;

