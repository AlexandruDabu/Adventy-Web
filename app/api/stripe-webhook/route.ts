import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/utils/supabase/client";

const stripe = new Stripe(process.env.NEXT_STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover",
});

const webhookSecret = process.env.NEXT_STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  // Handle the event
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    // Get metadata from the payment intent
    const email = paymentIntent.metadata?.email;
    const calendarTemplateId = paymentIntent.metadata?.calendar_template_id;
    const friendEmail = paymentIntent.metadata?.friend_email;
    const answersStr = paymentIntent.metadata?.answers;

    if (email && calendarTemplateId) {
      try {
        const supabase = createClient();
        let answers = null;

        if (answersStr) {
          try {
            answers = JSON.parse(answersStr);
          } catch (e) {
            console.error("Failed to parse answers:", e);
          }
        }

        // Update buyer as paid
        const { error } = await supabase
          .from("emails")
          .update({
            paid: true,
            calendar_template_id: calendarTemplateId,
          })
          .eq("email", email);

        if (error) {
          console.error("Error updating user in Supabase:", error);
        } else {
          console.log("✅ User marked as paid via webhook:", email);
        }

        // If this is a gift purchase, create entry for friend
        if (friendEmail && friendEmail.length > 0) {
          const { error: friendError } = await supabase.from("emails").upsert(
            {
              email: friendEmail,
              paid: true,
              calendar_template_id: calendarTemplateId,
              answers: answers,
              gift: true,
            },
            {
              onConflict: "email",
            }
          );

          if (friendError) {
            console.error("Error creating friend entry:", friendError);
          } else {
            console.log("✅ Gift calendar created for friend:", friendEmail);
          }
        }
      } catch (error) {
        console.error("Error processing webhook:", error);
      }
    }
  }

  // Also handle checkout.session.completed for backward compatibility
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const email = session.metadata?.email;
    const calendarTemplateId = session.metadata?.calendar_template_id;

    if (email && calendarTemplateId) {
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from("emails")
          .update({
            paid: true,
            calendar_template_id: calendarTemplateId,
          })
          .eq("email", email);

        if (error) {
          console.error("Error updating user in Supabase:", error);
        } else {
          console.log("✅ User marked as paid via webhook:", email);
        }
      } catch (error) {
        console.error("Error processing webhook:", error);
      }
    }
  }

  return NextResponse.json({ received: true });
}
