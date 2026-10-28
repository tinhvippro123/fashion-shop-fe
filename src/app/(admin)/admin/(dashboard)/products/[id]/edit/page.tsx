"use client";

import { use } from "react";
import { ProductForm } from "@/features/admin-catalog";

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolved = use(params);
  return <ProductForm mode="edit" productId={resolved.id} />;
}

