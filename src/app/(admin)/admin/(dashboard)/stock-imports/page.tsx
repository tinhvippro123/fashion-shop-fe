"use client";

import { Suspense } from "react";
import { StockImportManager } from "@/features/admin-catalog";

export default function StockImportsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-muted-foreground">
          Đang tải dữ liệu nhập kho...
        </div>
      }
    >
      <StockImportManager />
    </Suspense>
  );
}

