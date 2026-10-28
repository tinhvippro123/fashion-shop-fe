export interface DashboardStats {
  totalRevenue: number;
  totalProfit: number;
  totalImportCost: number;
  revenueChange: number;
  newCustomers: number;
  customerChange: number;
  totalOrders: number;
  orderChange: number;
  onlineSales: number;
  onlineSalesChange: number;
  pendingOrders: number;
}

export interface RecentOrderSummary {
  id: string;
  orderCode: string;
  customerName: string;
  date: string;
  amount: number;
  status: string;
  avatarFallback: string;
}

export interface ChartData {
  name: string;
  total: number;
  profit?: number;
  orders?: number;
}

export interface CategoryShare {
  name: string;
  value: number;
  count: number;
}

export interface LowStockVariant {
  id: number;
  sku: string;
  price: number;
  costPrice: number;
  stock: number;
  colorName: string;
  size?: { id: number; name: string };
  productId: number;
  productName: string;
}

export interface DashboardResponse {
  stats: DashboardStats;
  recentOrders: RecentOrderSummary[];
  chartData: ChartData[];
  categorySales: CategoryShare[];
  lowStockVariants: LowStockVariant[];
}

export interface BestSellerItem {
  id: string;
  numericId: number;
  sku: string;
  name: string;
  category: string;
  sold: number;
  revenue: string;
  revenueRaw: number;
  trend: string;
}

