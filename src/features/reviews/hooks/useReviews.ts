"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/shared/lib/api";
import { Review } from "../types/review.types";

export function useReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiFetch<Review[]>("/admin/reviews");
      setReviews(data || []);
    } catch {
      setReviews([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const toggleVisibility = useCallback(async (reviewId: string) => {
    const updated = await apiFetch<Review>(
      `/admin/reviews/${reviewId}/visibility`,
      { method: "PUT" }
    );
    setReviews((prev) => prev.map((r) => (r.id === reviewId ? updated : r)));
    return updated;
  }, []);

  return { reviews, setReviews, isLoading, reload, toggleVisibility };
}

