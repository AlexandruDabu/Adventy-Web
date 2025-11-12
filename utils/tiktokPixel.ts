/**
 * TikTok Pixel utility for sending events
 */

import { hashEmail, hashPhone, hashExternalId } from "./hashUtils";

// Extend Window interface to include TikTok Analytics Object
declare global {
  interface Window {
    ttq?: {
      track: (eventName: string, data?: Record<string, any>) => void;
      page: () => void;
      identify: (data?: Record<string, any>) => void;
      // Add other methods as needed
    };
  }
}

/**
 * TikTok Pixel Event Content Structure
 */
export interface TikTokEventContent {
  content_id: string; // ID of the product
  content_type: "product" | "product_group"; // Either product or product_group
  content_name: string; // The name of the page or product
}

/**
 * TikTok Pixel Event Data Structure
 */
export interface TikTokEventData {
  contents?: TikTokEventContent[];
  value?: number; // Value of the order or items sold
  currency?: string; // The 4217 currency code (e.g., "USD")
  description?: string;
  query?: string;
  search_string?: string;
}

/**
 * Standard TikTok Pixel events
 */
export enum TikTokEvent {
  // Page Events
  PAGE_VIEW = "PageView",

  // E-commerce Events
  VIEW_CONTENT = "ViewContent",
  ADD_TO_CART = "AddToCart",
  INITIATE_CHECKOUT = "InitiateCheckout",
  ADD_PAYMENT_INFO = "AddPaymentInfo",
  COMPLETE_PAYMENT = "CompletePayment",
  PLACE_AN_ORDER = "PlaceAnOrder",

  // Lead Events
  SUBMIT_FORM = "SubmitForm",
  COMPLETE_REGISTRATION = "CompleteRegistration",

  // General Events
  CLICK_BUTTON = "ClickButton",
  CONTACT = "Contact",
  DOWNLOAD = "Download",
  SEARCH = "Search",
  SUBSCRIBE = "Subscribe",
  PURCHASE = "Purchase",
}

/**
 * Send an event to TikTok Pixel
 *
 * @param eventName - The name of the event to track (use TikTokEvent enum or custom string)
 * @param eventData - Optional data object with event properties
 *
 * @example
 * ```typescript
 * // Standard event
 * sendEvent(TikTokEvent.ADD_TO_CART, {
 *   contents: [{
 *     content_id: '123',
 *     content_type: 'product',
 *     content_name: 'Advent Calendar'
 *   }],
 *   value: 29.99,
 *   currency: 'USD'
 * });
 *
 * // Custom event
 * sendEvent('CustomEvent', { customParam: 'value' });
 * ```
 */
export function sendEvent(
  eventName: string | TikTokEvent,
  eventData?: TikTokEventData | Record<string, any>
): void {
  if (typeof window === "undefined") {
    console.warn("TikTok Pixel: Cannot send event on server side");
    return;
  }

  if (!window.ttq) {
    console.warn("TikTok Pixel: ttq is not initialized yet");
    return;
  }

  try {
    if (eventData) {
      window.ttq.track(eventName, eventData);
      console.log(
        `TikTok Pixel: Event "${eventName}" sent with data:`,
        eventData
      );
    } else {
      window.ttq.track(eventName);
      console.log(`TikTok Pixel: Event "${eventName}" sent`);
    }
  } catch (error) {
    console.error("TikTok Pixel: Error sending event", error);
  }
}

/**
 * Send a page view event to TikTok Pixel
 * This is automatically called when the pixel loads, but can be called manually for SPA navigation
 */
export function sendPageView(): void {
  if (typeof window === "undefined") {
    console.warn("TikTok Pixel: Cannot send page view on server side");
    return;
  }

  if (!window.ttq) {
    console.warn("TikTok Pixel: ttq is not initialized yet");
    return;
  }

  try {
    window.ttq.page();
    console.log("TikTok Pixel: Page view sent");
  } catch (error) {
    console.error("TikTok Pixel: Error sending page view", error);
  }
}

/**
 * Identify a user with TikTok Pixel (with automatic PII hashing)
 *
 * @param userData - User data object (email, phone_number, external_id, etc.)
 * @param userData.email - Email address (will be automatically hashed)
 * @param userData.phone_number - Phone number with country code (will be automatically hashed)
 * @param userData.external_id - External ID like user ID or loyalty ID (will be automatically hashed)
 *
 * @example
 * ```typescript
 * // Will automatically hash the PII data
 * await identifyUser({
 *   email: 'user@example.com',
 *   phone_number: '+1234567890',
 *   external_id: 'user123'
 * });
 * ```
 */
export async function identifyUser(userData: {
  email?: string;
  phone_number?: string;
  external_id?: string;
}): Promise<void> {
  if (typeof window === "undefined") {
    console.warn("TikTok Pixel: Cannot identify user on server side");
    return;
  }

  if (!window.ttq) {
    console.warn("TikTok Pixel: ttq is not initialized yet");
    return;
  }

  try {
    const hashedData: Record<string, string> = {};

    // Hash email if provided
    if (userData.email) {
      hashedData.email = await hashEmail(userData.email);
    }

    // Hash phone number if provided
    if (userData.phone_number) {
      hashedData.phone_number = await hashPhone(userData.phone_number);
    }

    // Hash external ID if provided
    if (userData.external_id) {
      hashedData.external_id = await hashExternalId(userData.external_id);
    }

    window.ttq.identify(hashedData);
    console.log("TikTok Pixel: User identified with hashed data");
  } catch (error) {
    console.error("TikTok Pixel: Error identifying user", error);
  }
}

/**
 * Send an e-commerce event with proper content structure
 *
 * @param eventName - The name of the event
 * @param productId - Product ID
 * @param productName - Product name
 * @param value - Order value
 * @param currency - Currency code (default: USD)
 * @param additionalData - Additional event data
 */
export function sendEcommerceEvent(
  eventName: TikTokEvent,
  productId: string,
  productName: string,
  value: number,
  currency: string = "USD",
  additionalData?: Record<string, any>
): void {
  const eventData: TikTokEventData = {
    contents: [
      {
        content_id: productId,
        content_type: "product",
        content_name: productName,
      },
    ],
    value,
    currency,
    ...additionalData,
  };

  sendEvent(eventName, eventData);
}
