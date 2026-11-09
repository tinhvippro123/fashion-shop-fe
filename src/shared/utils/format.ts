export const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN").format(Math.round(price || 0)) + "đ";
};

export const resolveImageUrl = (
  url?: string | null,
  fallback = "/uploads/03321697-61dc-4f30-8da7-d25085a78741.webp"
) => {
  if (!url) return fallback;
  const normalized = url
    .replace(/^\/?uploads\/ivy\//, "/uploads/products/")
    .replace(/^ivy\//, "products/");
  if (normalized.startsWith("http") || normalized.startsWith("/")) return normalized;
  return `/uploads/${normalized}`;
};

