export const VN_PHONE_REGEX = /^0[35789]\d{8}$/;
export const VN_PHONE_ERROR =
  "Số điện thoại phải gồm đúng 10 chữ số (đầu số 03, 05, 07, 08 hoặc 09)";

export const VN_NAME_REGEX = /^[\p{L}\p{M}\s'.-]+$/u;
export const VN_NAME_MIN_LENGTH = 2;
export const VN_NAME_MAX_LENGTH = 50;
export const VN_NAME_ERROR =
  "Họ và tên phải từ 2 đến 50 ký tự và chỉ chứa chữ cái";

export const MAX_CART_ITEM_QTY = 50;

export const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
export const EMAIL_MAX_LENGTH = 100;

export const PASSWORD_MIN_LENGTH = 6;
export const PASSWORD_MAX_LENGTH = 32;
export const PASSWORD_ERROR =
  "Mật khẩu phải từ 6 đến 32 ký tự và không được chứa khoảng trắng";

export const OTP_REGEX = /^\d{6}$/;
export const HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
export const COLOR_NAME_REGEX = /^[\p{L}\p{M}0-9\s/-]+$/u;
export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const SKU_REGEX = /^[A-Za-z0-9_-]+$/;
export const SIZE_NAME_REGEX = /^[A-Za-z0-9/_-]+(?:\s[A-Za-z0-9/_-]+)*$/;
export const ORDER_CODE_REGEX = /^[A-Za-z0-9-]+$/;
export const CARD_HOLDER_REGEX = /^[A-Z\s]+$/;

export const BIRTH_DATE_ERROR =
  "Ngày sinh không hợp lệ (độ tuổi hợp lệ từ 13 đến 100 tuổi)";

function formatLocalDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Độ tuổi tối đa: 100 tuổi (tính theo giờ địa phương YYYY-MM-DD).
 */
export function getMinBirthDateString(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 100);
  return formatLocalDate(d);
}

/**
 * Độ tuổi tối thiểu: 13 tuổi (tính theo giờ địa phương YYYY-MM-DD).
 */
export function getMaxBirthDateString(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 13);
  return formatLocalDate(d);
}

export function sanitizeVnPhone(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, 10);
}

export function sanitizeOtp(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, 6);
}

export function toAsciiSkuToken(raw: string): string {
  if (!raw) return "";
  return raw
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "D")
    .toUpperCase()
    .replace(/[^A-Z0-9_-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");
}

export function isValidVnPhone(phone: string): boolean {
  return VN_PHONE_REGEX.test(phone.trim());
}

export function normalizeVnName(raw: string): string {
  return raw.normalize("NFC").trim().replace(/\s+/g, " ");
}

export function isValidVnName(name: string): boolean {
  const normalized = normalizeVnName(name);
  if (
    normalized.length < VN_NAME_MIN_LENGTH ||
    normalized.length > VN_NAME_MAX_LENGTH
  ) {
    return false;
  }
  return /\p{L}/u.test(normalized) && VN_NAME_REGEX.test(normalized);
}

export function isValidColorName(name: string): boolean {
  const normalized = name.normalize("NFC").trim().replace(/\s+/g, " ");
  if (normalized.length < 2 || normalized.length > 30) {
    return false;
  }
  return /\p{L}/u.test(normalized) && COLOR_NAME_REGEX.test(normalized);
}

export function isValidCardIssueDate(issueDate: string): boolean {
  const match = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(issueDate.trim());
  if (!match) return false;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  return year < currentYear || (year === currentYear && month <= currentMonth);
}

export function isValidEmail(email: string): boolean {
  const trimmed = email.trim();
  return trimmed.length <= EMAIL_MAX_LENGTH && EMAIL_REGEX.test(trimmed);
}

export function isValidPassword(password: string): boolean {
  return (
    password.length >= PASSWORD_MIN_LENGTH &&
    password.length <= PASSWORD_MAX_LENGTH &&
    !/\s/.test(password)
  );
}

export function isValidOtp(otp: string): boolean {
  return OTP_REGEX.test(otp.trim());
}

export function isValidBirthDate(dateStr: string): boolean {
  if (!dateStr) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  return dateStr >= getMinBirthDateString() && dateStr <= getMaxBirthDateString();
}

export function isValidHexColor(hex: string): boolean {
  return HEX_COLOR_REGEX.test(hex.trim());
}

export function isValidSafeUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return true;
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return true;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}
