"use client";

import Link from "next/link";
import { buttonVariants } from "@/shared/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/shared/utils/utils";
import { ProductTable, useProducts } from "@/features/admin-catalog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";

export default function ProductsPage() {
  const { products, isLoading, setProductActiveState } = useProducts();

  const allProducts = products;
  const activeProducts = products.filter((p) => p.isActive && p.stock > 0);
  const outOfStockProducts = products.filter((p) => p.isActive && p.stock === 0);
  const hiddenProducts = products.filter((p) => !p.isActive);

  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Sản phẩm</h2>
          <p className="text-muted-foreground hidden sm:block">
            Quản lý kho hàng và các mặt hàng thời trang.
          </p>
        </div>
        <Link
          href="/admin/products/create"
          className={cn(buttonVariants({ variant: "default" }))}
        >
          <Plus className="mr-2 h-4 w-4" /> Thêm sản phẩm
        </Link>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList className="bg-muted/50 border flex-wrap h-auto">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              Tất cả ({allProducts.length})
            </TabsTrigger>
            <TabsTrigger
              value="active"
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-emerald-700"
            >
              Đang bán ({activeProducts.length})
            </TabsTrigger>
            <TabsTrigger
              value="out_of_stock"
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-amber-700"
            >
              Hết hàng ({outOfStockProducts.length})
            </TabsTrigger>
            <TabsTrigger
              value="hidden"
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-muted-foreground"
            >
              Đã ẩn ({hiddenProducts.length})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="mt-0">
          <ProductTable
            products={allProducts}
            onToggleProductActive={setProductActiveState}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="active" className="mt-0">
          <ProductTable
            products={activeProducts}
            onToggleProductActive={setProductActiveState}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="out_of_stock" className="mt-0">
          <ProductTable
            products={outOfStockProducts}
            onToggleProductActive={setProductActiveState}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="hidden" className="mt-0">
          <ProductTable
            products={hiddenProducts}
            onToggleProductActive={setProductActiveState}
            isLoading={isLoading}
            viewStatus="Đã ẩn"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

