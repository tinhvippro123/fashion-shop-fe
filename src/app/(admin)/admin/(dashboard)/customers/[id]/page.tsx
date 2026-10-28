"use client";

import { use } from "react";
import { CustomerDetailView } from "@/features/customers";

export default function CustomerDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  return <CustomerDetailView customerId={resolvedParams.id} />;
}

