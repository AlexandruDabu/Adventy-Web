/**
 * Utility functions for hashing PII data for TikTok Pixel
 */

/**
 * Hash a string using SHA-256
 * @param value - The string to hash
 * @returns Promise with the hashed string in hexadecimal format
 */
export async function sha256Hash(value: string): Promise<string> {
  if (typeof window === "undefined") {
    // Server-side fallback (though these should be called client-side)
    return "";
  }

  if (!value || value.trim() === "") {
    return "";
  }

  try {
    // Normalize the value (lowercase and trim)
    const normalizedValue = value.toLowerCase().trim();

    // Encode the string as UTF-8
    const encoder = new TextEncoder();
    const data = encoder.encode(normalizedValue);

    // Hash using SHA-256
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);

    // Convert to hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");

    return hashHex;
  } catch (error) {
    console.error("Error hashing value:", error);
    return "";
  }
}

/**
 * Hash an email address for TikTok Pixel
 * @param email - The email address to hash
 * @returns Promise with the hashed email
 */
export async function hashEmail(email: string): Promise<string> {
  return sha256Hash(email);
}

/**
 * Hash a phone number for TikTok Pixel
 * @param phone - The phone number to hash (should include country code, e.g., +1234567890)
 * @returns Promise with the hashed phone number
 */
export async function hashPhone(phone: string): Promise<string> {
  // Remove all non-digit characters except the leading +
  const cleanPhone = phone.replace(/[^\d+]/g, "");
  return sha256Hash(cleanPhone);
}

/**
 * Hash an external ID for TikTok Pixel
 * @param externalId - The external ID to hash (e.g., user ID, loyalty ID)
 * @returns Promise with the hashed external ID
 */
export async function hashExternalId(externalId: string): Promise<string> {
  return sha256Hash(externalId);
}
