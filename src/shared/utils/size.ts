export const FASHION_SIZE_ORDER: Record<string, number> = {
  "XXS": 1,
  "XS": 2,
  "S": 3,
  "M": 4,
  "L": 5,
  "XL": 6,
  "XXL": 7,
  "2XL": 7,
  "3XL": 8,
  "4XL": 9,
  "5XL": 10,
  "FREESIZE": 99,
  "FREE SIZE": 99,
  "ONE SIZE": 99,
};

export function isSizeAttribute(attributeName?: string | null): boolean {
  if (!attributeName) return false;
  const lower = attributeName.trim().toLowerCase();
  return (
    lower.includes("size") ||
    lower.includes("kích") ||
    lower.includes("kich") ||
    lower.includes("cỡ") ||
    lower.includes("co")
  );
}

export function getSizeSortOrder(sizeName?: string | null): number {
  if (!sizeName) return 999;
  const trimmed = sizeName.trim().toUpperCase();
  if (FASHION_SIZE_ORDER[trimmed] !== undefined) {
    return FASHION_SIZE_ORDER[trimmed];
  }
  const num = parseInt(trimmed, 10);
  if (!isNaN(num)) {
    return 100 + num;
  }
  return 500;
}

