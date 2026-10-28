export interface Review {
  id: string;
  numericId?: number;
  productId: string;
  productName: string;
  customerName: string;
  customerPhone: string;
  rating: number;
  comment: string;
  reply?: string | null;
  isHidden: boolean;
  createdAt: string;
}

