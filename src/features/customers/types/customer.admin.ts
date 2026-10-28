export interface CustomerAddressItem {
  id: number;
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
  orders: number;
  totalOrders: number;
  totalSpent: string;
  totalSpentRaw?: number;
  tier: string;
  accountStatus: "ACTIVE" | "BANNED" | "UNVERIFIED" | string;
  joinedDate?: string;
  addresses?: CustomerAddressItem[];
  orderHistory?: CustomerOrderHistoryItem[];
}

