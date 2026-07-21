const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

/** Convert Persian/Arabic-Indic digits to ASCII English digits. */
export function toEnglishDigits(value: string) {
  return value.replace(/[۰-۹٠-٩]/g, (digit) => {
    const persianIndex = PERSIAN_DIGITS.indexOf(digit);
    if (persianIndex >= 0) return String(persianIndex);
    const arabicIndex = "٠١٢٣٤٥٦٧٨٩".indexOf(digit);
    return arabicIndex >= 0 ? String(arabicIndex) : digit;
  });
}

/** Convert ASCII digits to Persian digits for UI display. */
export function toPersianDigits(value: string) {
  return value.replace(/\d/g, (digit) => PERSIAN_DIGITS[Number(digit)] ?? digit);
}

/** Strip non-digits and normalize any Persian digits to English. */
export function extractEnglishDigits(value: string) {
  return toEnglishDigits(value).replace(/\D/g, "");
}

/** Keep only digits (English canonical) for OTP state/API payloads. */
export function sanitizeOtpInput(value: string, maxLength = 4) {
  return extractEnglishDigits(value).slice(0, maxLength);
}

/** Persian display string for OTP/code inputs stored in English. */
export function formatOtpForDisplay(value: string) {
  return toPersianDigits(value);
}

/** English digits ready for backend OTP verification. */
export function otpForBackend(value: string) {
  return sanitizeOtpInput(value);
}

/** Detect phone-like input (English or Persian digits). */
export function looksLikePhoneInput(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return false;

  return (
    trimmed.startsWith("09") ||
    trimmed.startsWith("9") ||
    trimmed.startsWith("98") ||
    trimmed.startsWith("۰۹") ||
    trimmed.startsWith("۹") ||
    /^[۰-۹]/.test(trimmed)
  );
}
