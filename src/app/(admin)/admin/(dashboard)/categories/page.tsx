"use client";

import {
  CategoryTable,
  CategoryFormModal,
  useCategories,
} from "@/features/admin-catalog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";

export default function CategoriesPage() {
  const { categories, isLoading, reload } = useCategories();

  const hiddenCategories = categories.filter((c) => !c.isActive);

  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Danh mục</h2>
          <p className="text-muted-foreground hidden sm:block">
            Quản lý các danh mục sản phẩm thời trang.
          </p>
        </div>
        <CategoryFormModal allCategories={categories} onSaved={reload} />
      </div>

      <Tabs defaultValue="active" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="active">
              Tất cả ({categories.length})
            </TabsTrigger>
            <TabsTrigger value="hidden">
              Đã ẩn ({hiddenCategories.length})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="active" className="mt-0">
          <CategoryTable
            categories={categories}
            isLoading={isLoading}
            viewStatus="Tất cả"
            onReload={reload}
          />
        </TabsContent>

        <TabsContent value="hidden" className="mt-0">
          <CategoryTable
            categories={categories}
            isLoading={isLoading}
            viewStatus="Đã ẩn"
            onReload={reload}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

