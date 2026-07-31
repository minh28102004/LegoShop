const VIETNAMESE_PHONE_PATTERN = /^(?:0[35789]\d{8}|02\d{8,9})$/;

export function normalizeVietnamesePhone(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const digits = trimmed.replace(/\D/g, "");
  const normalized = digits.startsWith("84") ? `0${digits.slice(2)}` : digits;

  return VIETNAMESE_PHONE_PATTERN.test(normalized) ? normalized : "";
}

export function isValidVietnamesePhone(value: string): boolean {
  return Boolean(normalizeVietnamesePhone(value));
}
