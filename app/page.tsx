"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Question1 } from "@/components/questions/question-1";
import { Question2 } from "@/components/questions/question-2";
import { Question3 } from "@/components/questions/question-3";
import { Question4 } from "@/components/questions/question-4";
import { Question5 } from "@/components/questions/question-5";
import { Question6 } from "@/components/questions/question-6";
import { Question7 } from "@/components/questions/question-7";
import { EmailCollectionScreen } from "@/components/email-collection-screen";
import { AnalyzerScreen } from "@/components/analyzer-screen";
import { PaywallScreen } from "@/components/paywall-screen";
import { CountdownScreen } from "@/components/countdown-screen";
import { useUser } from "@/hooks/useUser";
import { calculateBestTemplate } from "@/lib/calendarMatcher";

export type UserAnswers = {
  christmasPriority?: string;
  morningRoutine?: string;
  motivation?: string;
  celebrationStyle?: string;
  idealGift?: string;
  dailyRhythm?: string;
  personalValues?: string;
  email?: string;
};

function HomeContent() {
  const searchParams = useSearchParams();
  const paymentSuccess = searchParams.get("payment_success");

  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<UserAnswers>({});
  const [calendarTemplateId, setCalendarTemplateId] = useState<string | null>(
    null
  );
  const { saveEmail, updateUserPaid, getUserFromLocalStorage } = useUser();

  // Handle payment success - show countdown screen
  useEffect(() => {
    if (paymentSuccess === "true") {
      const user = getUserFromLocalStorage();
      if (user?.email) {
        setAnswers((prev) => ({ ...prev, email: user.email }));
        if (user.calendar_template_id) {
          setCalendarTemplateId(user.calendar_template_id);
          // Update user as paid in Supabase
          updateUserPaid(user.email, user.calendar_template_id);
        }
        setCurrentStep(11); // Show countdown screen
      }
    }
  }, [paymentSuccess, getUserFromLocalStorage, updateUserPaid]);

  const handleAnswer = (question: keyof UserAnswers, answer: string) => {
    setAnswers((prev) => ({ ...prev, [question]: answer }));

    // Move to next step after a brief moment
    setTimeout(() => {
      setCurrentStep((prev) => prev + 1);
    }, 300);
  };

  const handleEmailSubmit = async (email: string) => {
    setAnswers((prev) => ({ ...prev, email }));

    // Calculate the best calendar template based on answers
    const template = calculateBestTemplate(answers);
    setCalendarTemplateId(template.id);

    console.log("🎄 Calculated Calendar Template:", template);

    // Save email and answers to Supabase and localStorage
    await saveEmail(email, answers);

    setTimeout(() => {
      setCurrentStep((prev) => prev + 1);
    }, 300);
  };

  return (
    <main className='min-h-screen'>
      {currentStep === 1 && (
        <Question1
          onAnswer={(answer) => handleAnswer("christmasPriority", answer)}
        />
      )}
      {currentStep === 2 && (
        <Question2
          onAnswer={(answer) => handleAnswer("morningRoutine", answer)}
        />
      )}
      {currentStep === 3 && (
        <Question3 onAnswer={(answer) => handleAnswer("motivation", answer)} />
      )}
      {currentStep === 4 && (
        <Question4
          onAnswer={(answer) => handleAnswer("celebrationStyle", answer)}
        />
      )}
      {currentStep === 5 && (
        <Question5 onAnswer={(answer) => handleAnswer("idealGift", answer)} />
      )}
      {currentStep === 6 && (
        <Question6 onAnswer={(answer) => handleAnswer("dailyRhythm", answer)} />
      )}
      {currentStep === 7 && (
        <Question7
          onAnswer={(answer) => handleAnswer("personalValues", answer)}
        />
      )}
      {currentStep === 8 && (
        <EmailCollectionScreen
          onSubmit={handleEmailSubmit}
          currentStep={8}
          totalSteps={8}
        />
      )}
      {currentStep === 9 && (
        <AnalyzerScreen
          answers={answers}
          onComplete={() => setCurrentStep(10)}
        />
      )}
      {currentStep === 10 && answers.email && calendarTemplateId && (
        <PaywallScreen
          userEmail={answers.email}
          calendarTemplateId={calendarTemplateId}
          answers={answers}
        />
      )}
      {currentStep === 11 && (
        <CountdownScreen userEmail={answers.email || ""} />
      )}
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className='min-h-screen' />}>
      <HomeContent />
    </Suspense>
  );
}
