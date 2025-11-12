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
    async (email: string, calendarTemplateId: string): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        const success = await userRepository.updateUserPaid(
          email,
          calendarTemplateId
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

  const clearLocalStorage = useCallback((): void => {
    userRepository.clearLocalStorage();
  }, []);

  return {
    loading,
    error,
    saveEmail,
    updateUserPaid,
    checkIfUserPaid,
    getUserFromLocalStorage,
    clearLocalStorage,
  };
};
