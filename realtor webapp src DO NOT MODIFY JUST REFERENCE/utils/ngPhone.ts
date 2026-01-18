export type NigerianPhoneValidationResult =
  | { valid: true; normalized: string }
  | { valid: false; normalized: null };

export const normalizeNigerianPhone = (input: string): string | null => {
  const raw = String(input ?? "").trim();
  if (!raw) return null;

  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;

  let normalized: string | null = null;

  if (digits.length === 11 && digits.startsWith("0")) {
    normalized = `+234${digits.slice(1)}`;
  } else if (digits.length === 13 && digits.startsWith("234")) {
    normalized = `+${digits}`;
  } else if (digits.length === 10) {
    normalized = `+234${digits}`;
  }

  if (!normalized) return null;
  if (!/^\+234\d{10}$/.test(normalized)) return null;
  return normalized;
};

export const validateNigerianPhone = (
  input: string
): NigerianPhoneValidationResult => {
  const normalized = normalizeNigerianPhone(input);
  if (!normalized) return { valid: false, normalized: null };
  return { valid: true, normalized };
};

