import { z } from "zod";

export const VoucherSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3, "Mã Voucher phải có ít nhất 3 ký tự")
      .max(20, "Mã Voucher không vượt quá 20 ký tự")
      .regex(
        /^[A-Z0-9_-]+$/,
        "Mã Voucher chỉ chứa chữ in hoa, số, dấu gạch dưới hoặc gạch ngang"
      ),
    discountType: z.enum(["vnd", "percent"]),
    discount: z.coerce
      .number()
      .int("Mức giảm phải là số nguyên")
      .min(1, "Mức giảm phải lớn hơn 0")
      .max(50000000, "Mức giảm tối đa 50.000.000đ"),
    maxDiscount: z.coerce
      .number()
      .int("Mức giảm tối đa phải là số nguyên")
      .min(0, "Mức giảm tối đa không được âm")
      .max(50000000, "Mức giảm tối đa không vượt quá 50.000.000đ")
      .optional(),
    minOrder: z.coerce
      .number()
      .int("Đơn tối thiểu phải là số nguyên")
      .min(0, "Đơn tối thiểu không được âm")
      .max(100000000, "Đơn tối thiểu tối đa 100.000.000đ")
      .default(0),
    quantity: z.coerce
      .number()
      .int("Số lượng phải là số nguyên")
      .min(1, "Số lượng phải lớn hơn 0")
      .max(100000, "Số lượng tối đa là 100.000"),
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
      if (data.discountType === "vnd" && data.discount < 1000) {
        return false;
      }
      return true;
    },
    {
      message: "Mức giảm theo tiền mặt tối thiểu là 1.000đ",
      path: ["discount"],
    }
  )
  .refine(
    (data) => {
      if (data.discountType === "percent" && (!data.maxDiscount || data.maxDiscount < 1000)) {
        return false;
      }
      return true;
    },
    {
      message: "Vui lòng nhập mức giảm tối đa từ 1.000đ trở lên",
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

