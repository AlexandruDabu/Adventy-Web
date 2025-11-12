/**
 * Stripe Repository
 * Handles all Stripe-related API calls
 */

export type PaymentIntentData = {
  amount: number;
  email: string;
  calendarTemplateId: string;
  friendEmail?: string;
  answers?: Record<string, any>;
};

export type PaymentIntentResponse = {
  clientSecret: string;
  paymentIntentId: string;
};

export type CheckoutSessionData = {
  priceId: string;
  email: string;
  calendarTemplateId: string;
};

export type CheckoutSessionResponse = {
  sessionId: string;
  url: string;
};

export const stripeRepository = {
  /**
   * Create a Stripe PaymentIntent for embedded checkout
   */
  async createPaymentIntent(
    data: PaymentIntentData
  ): Promise<PaymentIntentResponse | null> {
    try {
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        console.error("Failed to create payment intent:", response.statusText);
        return null;
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error in createPaymentIntent:", error);
      return null;
    }
  },

  /**
   * Create a Stripe checkout session
   */
  async createCheckoutSession(
    data: CheckoutSessionData
  ): Promise<CheckoutSessionResponse | null> {
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        console.error(
          "Failed to create checkout session:",
          response.statusText
        );
        return null;
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error in createCheckoutSession:", error);
      return null;
    }
  },

  /**
   * Redirect to Stripe checkout
   */
  redirectToCheckout(checkoutUrl: string): void {
    if (typeof window !== "undefined") {
      window.location.href = checkoutUrl;
    }
  },
};
