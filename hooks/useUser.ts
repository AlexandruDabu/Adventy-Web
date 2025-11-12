import { useState, useCallback } from "react";
import { userRepository, type User } from "@/repositories/userRepository";

export const useUser = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveEmail = useCallback(
    async (
      email: string,
      answers?: Record<string, any>
    ): Promise<User | null> => {
      setLoading(true);
      setError(null);

      try {
        const user = await userRepository.saveEmail(email, answers);
        if (!user) {
          setError("Failed to save email");
        }
        return user;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateUserPaid = useCallback(
    async (
      email: string,
      calendarTemplateId: string,
      isGift: boolean = false
    ): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        const success = await userRepository.updateUserPaid(
          email,
          calendarTemplateId,
          isGift
        );
        if (!success) {
          setError("Failed to update payment status");
        }
        return success;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const checkIfUserPaid = useCallback(
    async (email: string): Promise<{ exists: boolean; paid: boolean }> => {
      setLoading(true);
      setError(null);

      try {
        return await userRepository.checkIfUserPaid(email);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        return { exists: false, paid: false };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getUserFromLocalStorage = useCallback((): User | null => {
    return userRepository.getUserFromLocalStorage();
  }, []);

  const createGiftRecipient = useCallback(
    async (
      email: string,
      calendarTemplateId: string,
      answers?: Record<string, any>
    ): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        const success = await userRepository.createGiftRecipient(
          email,
          calendarTemplateId,
          answers
        );
        if (!success) {
          setError("Failed to create gift recipient");
        }
        return success;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearLocalStorage = useCallback((): void => {
    userRepository.clearLocalStorage();
  }, []);

  return {
    loading,
    error,
    saveEmail,
    updateUserPaid,
    checkIfUserPaid,
    createGiftRecipient,
    getUserFromLocalStorage,
    clearLocalStorage,
  };
};
