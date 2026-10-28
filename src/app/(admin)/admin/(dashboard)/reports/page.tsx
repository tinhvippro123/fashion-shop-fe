"use client";

import { ReportCharts } from "@/features/analytics";

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-6 pb-10 w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Báo cáo & Phân tích
          </h2>
          <p className="text-muted-foreground">
            Xem chi tiết doanh thu và hiệu quả kinh doanh.
          </p>
        </div>
      </div>

      <ReportCharts />
    </div>
  );
}

