import { toEnglishDigits } from "@/lib/digits";

export { toEnglishDigits } from "@/lib/digits";

export function normalizePhone(value: string) {
  const digits = toEnglishDigits(value).replace(/\D/g, "");
  if (!digits) return "";

  let normalized = digits;
  if (normalized.startsWith("0098")) normalized = `0${normalized.slice(4)}`;
  if (normalized.startsWith("98") && normalized.length === 12) {
    normalized = `0${normalized.slice(2)}`;
  }
  if (normalized.startsWith("9") && normalized.length === 10) {
    normalized = `0${normalized}`;
  }

  return normalized;
}

export function isValidIranPhone(value: string) {
  return /^09\d{9}$/.test(normalizePhone(value));
}

export function extractPhoneFromIdentity(
  username?: string | null,
  email?: string | null,
) {
  const normalizedUsername = username ? normalizePhone(username) : "";
  if (isValidIranPhone(normalizedUsername)) return normalizedUsername;

  if (email && email.endsWith("@otp.local")) {
    const candidate = normalizePhone(email.replace(/@otp\.local$/, ""));
    if (isValidIranPhone(candidate)) return candidate;
  }

  return null;
}
