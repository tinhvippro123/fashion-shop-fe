import { z } from "zod";

export const CategorySchema = z.object({
  name: z.string().min(1, "Tên danh mục không được để trống").max(255),
  slug: z.string().min(1, "Slug không được để trống").max(255),
  parentId: z.string().optional(),
  active: z.boolean(),
});

export type TCategoryPayload = z.infer<typeof CategorySchema>;

