export interface Voucher {
  id: string;
  numericId: number;
  code: string;
  name: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT" | string;
  discountValue: number;
  minOrderValueRaw: number;
  maxDiscountAmount?: number | null;
  startDate?: string;
  endDate?: string;
  usageLimit?: number | null;
  usedCount: number;
  rawStatus: string;
  discountAmount: string;
  minOrderValue: string;
  quantity: string;
  status: "Đang diễn ra" | "Sắp diễn ra" | "Đã kết thúc" | "Đã hủy" | string;
  duration: string;
  endedReason?: string;
}

