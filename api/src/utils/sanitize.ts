/**
 * Strips HTML tags, dangerous characters, and trims whitespace.
 * Use on every user-supplied string before logging or emailing.
 */
export function sanitizeString(value: string, maxLength = 500): string {
  return value
    .trim()
    .replace(/<[^>]*>/g, '')          // strip HTML tags
    .replace(/[<>"'`]/g, '')          // strip remaining injection chars
    .slice(0, maxLength);
}

/**
 * Returns true if the value contains patterns associated with injection attacks.
 * Used as an early-exit check before processing.
 */
export function isSuspicious(value: string): boolean {
  const patterns = [
    /javascript\s*:/i,
    /on\w+\s*=/i,
    /<\s*script/i,
    /union\s+select/i,
    /insert\s+into/i,
    /drop\s+table/i,
    /exec\s*\(/i,
    /base64/i,
  ];
  return patterns.some(p => p.test(value));
}

/** Strips non-digit characters from a phone number for consistent rate-limit keying. */
export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '').slice(0, 15);
}

/** Lowercases and trims an email address for consistent rate-limit keying. */
export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}
