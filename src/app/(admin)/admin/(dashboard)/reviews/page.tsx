"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { ReviewTable, useReviews } from "@/features/reviews";

export default function ReviewsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const { reviews, isLoading, toggleVisibility } = useReviews();

  const allReviews = reviews;
  const visibleReviews = reviews.filter((r) => !r.isHidden);
  const hiddenReviews = reviews.filter((r) => r.isHidden);

  let displayedReviews = allReviews;
  if (activeTab === "visible") displayedReviews = visibleReviews;
  if (activeTab === "hidden") displayedReviews = hiddenReviews;

  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Đánh giá sản phẩm
          </h2>
          <p className="text-muted-foreground hidden sm:block">
            Quản lý và kiểm duyệt đánh giá từ khách hàng.
          </p>
        </div>
      </div>

      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={(v) => setActiveTab(String(v))}
        className="w-full"
      >
        <div className="flex items-center justify-between mb-4">
          <TabsList className="bg-muted/50 border">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              Tất cả ({allReviews.length})
            </TabsTrigger>
            <TabsTrigger
              value="visible"
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-emerald-700"
            >
              Đang hiển thị ({visibleReviews.length})
            </TabsTrigger>
            <TabsTrigger
              value="hidden"
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-muted-foreground"
            >
              Đã ẩn ({hiddenReviews.length})
            </TabsTrigger>
          </TabsList>
        </div>

        <ReviewTable
          reviews={displayedReviews}
          onToggleVisibility={toggleVisibility}
          isLoading={isLoading}
        />
      </Tabs>
    </div>
  );
}

