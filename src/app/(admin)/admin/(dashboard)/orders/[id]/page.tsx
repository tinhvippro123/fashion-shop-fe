"use client";

import { use } from "react";
import { OrderDetailView } from "@/features/orders";

export default function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  return <OrderDetailView orderId={resolvedParams.id} />;
}

