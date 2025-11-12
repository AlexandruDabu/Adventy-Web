import { createClient } from "@/utils/supabase/client";

export type User = {
  id?: number;
  email: string;
  paid: boolean;
  gift?: boolean;
  created_at?: string;
  answers?: Record<string, any>;
  calendar_template_id?: string;
};

export const userRepository = {
  /**
   * Save user email to Supabase and localStorage
   */
  async saveEmail(
    email: string,
    answers?: Record<string, any>
  ): Promise<User | null> {
    try {
      const supabase = createClient();

      // Insert or update user in Supabase
      const { data, error } = await supabase
        .from("emails")
        .upsert(
          {
            email,
            paid: false,
            answers: answers || null,
          },
          {
            onConflict: "email",
            ignoreDuplicates: false,
          }
        )
        .select()
        .single();

      if (error) {
        console.error("Error saving email:", error);
        return null;
      }

      // Save to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("user_email", email);
        if (data) {
          localStorage.setItem("user_data", JSON.stringify(data));
        }
      }

      return data as User;
    } catch (error) {
      console.error("Error in saveEmail:", error);
      return null;
    }
  },

  /**
   * Update user paid status after purchase and set calendar template
   */
  async updateUserPaid(
    email: string,
    calendarTemplateId: string,
    isGift: boolean = false
  ): Promise<boolean> {
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("emails")
        .update({
          paid: true,
          gift: isGift,
          calendar_template_id: calendarTemplateId,
        })
        .eq("email", email);

      if (error) {
        console.error("Error updating paid status:", error);
        return false;
      }

      // Update localStorage
      if (typeof window !== "undefined") {
        const userData = localStorage.getItem("user_data");
        if (userData) {
          const parsed = JSON.parse(userData);
          parsed.paid = true;
          parsed.gift = isGift;
          parsed.calendar_template_id = calendarTemplateId;
          localStorage.setItem("user_data", JSON.stringify(parsed));
        }
      }

      return true;
    } catch (error) {
      console.error("Error in updateUserPaid:", error);
      return false;
    }
  },

  /**
   * Check if user exists and has paid
   */
  async checkIfUserPaid(
    email: string
  ): Promise<{ exists: boolean; paid: boolean }> {
    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("emails")
        .select("*")
        .eq("email", email)
        .single();

      if (error || !data) {
        return { exists: false, paid: false };
      }

      return { exists: true, paid: data.paid || false };
    } catch (error) {
      console.error("Error in checkIfUserPaid:", error);
      return { exists: false, paid: false };
    }
  },

  /**
   * Get user from localStorage
   */
  getUserFromLocalStorage(): User | null {
    if (typeof window === "undefined") return null;

    const userData = localStorage.getItem("user_data");
    if (!userData) return null;

    try {
      return JSON.parse(userData) as User;
    } catch {
      return null;
    }
  },

  /**
   * Create or update a gift recipient
   */
  async createGiftRecipient(
    email: string,
    calendarTemplateId: string,
    answers?: Record<string, any>
  ): Promise<boolean> {
    try {
      const supabase = createClient();

      // First, check if the user exists
      const { data: existingUser, error: selectError } = await supabase
        .from("emails")
        .select("*")
        .eq("email", email)
        .single();

      if (selectError && selectError.code !== "PGRST116") {
        // PGRST116 is "not found" error, which is fine
        console.error("Error checking for existing user:", selectError);
        return false;
      }

      if (existingUser) {
        // User exists, update them
        const { error: updateError } = await supabase
          .from("emails")
          .update({
            paid: true,
            gift: true,
            calendar_template_id: calendarTemplateId,
            answers: answers || null,
          })
          .eq("email", email);

        if (updateError) {
          console.error("Error updating gift recipient:", updateError);
          return false;
        }
      } else {
        // User doesn't exist, create them
        const { error: insertError } = await supabase.from("emails").insert({
          email,
          paid: true,
          gift: true,
          calendar_template_id: calendarTemplateId,
          answers: answers || null,
        });

        if (insertError) {
          console.error("Error creating gift recipient:", insertError);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error("Error in createGiftRecipient:", error);
      return false;
    }
  },

  /**
   * Clear user data from localStorage
   */
  clearLocalStorage(): void {
    if (typeof window === "undefined") return;

    localStorage.removeItem("user_email");
    localStorage.removeItem("user_data");
  },
};
