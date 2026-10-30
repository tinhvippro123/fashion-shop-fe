import { z } from "zod";

export const VoucherSchema = z
  .object({
    code: z
      .string()
      .min(3, "Mã Voucher phải có ít nhất 3 ký tự")
      .max(50)
      .regex(
        /^[A-Z0-9_]+$/,
        "Mã Voucher chỉ chứa chữ in hoa, số và dấu gạch dưới"
      ),
    discountType: z.enum(["vnd", "percent"]),
    discount: z.coerce.number().min(1, "Mức giảm không hợp lệ"),
    maxDiscount: z.coerce
      .number()
      .min(0, "Mức giảm tối đa không hợp lệ")
      .optional(),
    minOrder: z.coerce.number().min(0, "Đơn tối thiểu không hợp lệ").default(0),
    quantity: z.coerce.number().min(1, "Số lượng phải lớn hơn 0"),
    isPublic: z.boolean().default(true),
    isActive: z.boolean().default(true),
    startDate: z.string().min(1, "Vui lòng chọn ngày bắt đầu"),
    endDate: z.string().min(1, "Vui lòng chọn ngày kết thúc"),
  })
  .refine(
    (data) => {
      if (data.discountType === "percent" && data.discount > 100) {
        return false;
      }
      return true;
    },
    {
      message: "Mức giảm theo phần trăm không được vượt quá 100%",
      path: ["discount"],
    }
  )
  .refine(
    (data) => {
      if (data.discountType === "percent" && !data.maxDiscount) {
        return false;
      }
      return true;
    },
    {
      message: "Vui lòng nhập mức giảm tối đa",
      path: ["maxDiscount"],
    }
  )
  .refine(
    (data) => {
      return new Date(data.endDate) >= new Date(data.startDate);
    },
    {
      message: "Ngày kết thúc phải sau ngày bắt đầu",
      path: ["endDate"],
    }
  );

export type TVoucherPayload = z.infer<typeof VoucherSchema>;

