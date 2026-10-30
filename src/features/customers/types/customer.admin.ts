export interface CustomerAddressItem {
  id: number;
  recipientName?: string;
  isDefault: boolean;
  address: string;
  phone: string;
}

export interface CustomerOrderHistoryItem {
  id: string;
  date: string;
  status: string;
  total: string;
  items: number;
}

export interface Customer {
  id: string;
  numericId: number;
  name: string;
  email: string;
  phone: string;
  gender?: string;
  dateOfBirth?: string;
  orders: number;
  totalOrders: number;
  totalSpent: string;
  totalSpentRaw?: number;
  tier: string;
  accountStatus: "ACTIVE" | "BANNED" | string;
  joinedDate?: string;
  addresses?: CustomerAddressItem[];
  orderHistory?: CustomerOrderHistoryItem[];
}

