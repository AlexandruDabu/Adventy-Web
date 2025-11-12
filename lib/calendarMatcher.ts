/**
 * Calendar Template Matcher
 * Maps user answers to the most suitable calendar template
 */

export type CalendarTemplate = {
  id: string;
  type: string;
  name: string;
  description: string;
};

export const CALENDAR_TEMPLATES: CalendarTemplate[] = [
  {
    id: "01d538ee-7a4d-48c9-a7ae-ca1efe484a31",
    type: "home_gym",
    name: "Home Gym",
    description: "Home workout routines and fitness tips",
  },
  {
    id: "0a94e00e-1310-4029-aed9-03bf675eb4e1",
    type: "gym",
    name: "Gym",
    description: "Structured gym workouts and training plans",
  },
  {
    id: "1d981773-a5ff-4b52-ab67-4d8b3039c8c2",
    type: "culinary_recipes",
    name: "Culinary Recipes",
    description: "Delicious recipes and cooking adventures",
  },
  {
    id: "4de71739-72ea-4ddc-bc50-20e6cb87a925",
    type: "love_letters",
    name: "Love Letters",
    description: "Heartfelt messages and meaningful connections",
  },
  {
    id: "765e8dd6-1ba5-4494-b014-eb60eeb72d7b",
    type: "quotes",
    name: "Quotes",
    description: "Daily inspiration and words of wisdom",
  },
  {
    id: "7ad90753-d1b5-41b1-97cf-8be399dcb23b",
    type: "songs",
    name: "Songs",
    description: "Curated music and festive melodies",
  },
  {
    id: "b933eb5f-41cb-4549-a609-792c44c70f97",
    type: "friends",
    name: "Friends",
    description: "Social activities and bonding experiences",
  },
];

/**
 * Mapping of answers to calendar template types
 * Each answer can map to multiple template types (weighted equally)
 */
const ANSWER_TO_TEMPLATE_MAP: Record<string, string[]> = {
  // Question 1: Holiday Priority
  family: ["friends", "love_letters"],
  fitness: ["gym", "home_gym"],
  creativity: ["quotes", "songs"],
  food: ["culinary_recipes"],

  // Question 2: Morning Mood
  energetic: ["gym", "home_gym"],
  peaceful: ["quotes", "love_letters"],
  hungry: ["culinary_recipes"],
  inspired: ["quotes", "songs"],

  // Question 3: Daily Motivation
  physical: ["gym", "home_gym"],
  musical: ["songs"],
  culinary: ["culinary_recipes"],
  words: ["quotes", "love_letters"],

  // Question 4: Celebration Style
  active: ["gym", "home_gym", "friends"],
  cozy: ["songs", "love_letters"],
  feast: ["culinary_recipes"],
  meaningful: ["love_letters", "quotes", "friends"],

  // Question 5: Ideal Gift
  music: ["songs"],
  recipes: ["culinary_recipes"],

  // Question 6: Daily Rhythm
  structured: ["gym", "home_gym"],
  flexible: ["quotes", "songs"],
  spontaneous: ["friends", "songs"],
  balanced: ["culinary_recipes", "quotes"],

  // Question 7: Personal Values
  health: ["gym", "home_gym"],
  connection: ["friends", "love_letters"],
  achievement: ["gym", "home_gym", "quotes"],
};

export type UserAnswers = {
  christmasPriority?: string;
  morningRoutine?: string;
  motivation?: string;
  celebrationStyle?: string;
  idealGift?: string;
  dailyRhythm?: string;
  personalValues?: string;
};

/**
 * Calculate the best calendar template based on user answers
 */
export function calculateBestTemplate(answers: UserAnswers): CalendarTemplate {
  // Count occurrences of each template type
  const templateCounts: Record<string, number> = {};

  // Process all answers
  Object.values(answers).forEach((answer) => {
    if (!answer) return;

    const mappedTemplates = ANSWER_TO_TEMPLATE_MAP[answer];
    if (mappedTemplates) {
      mappedTemplates.forEach((templateType) => {
        templateCounts[templateType] = (templateCounts[templateType] || 0) + 1;
      });
    }
  });

  // Find the template(s) with the highest count
  const maxCount = Math.max(...Object.values(templateCounts));
  const topTemplates = Object.keys(templateCounts).filter(
    (type) => templateCounts[type] === maxCount
  );

  // If there's a tie, randomly select one
  const selectedType =
    topTemplates[Math.floor(Math.random() * topTemplates.length)];

  // Find and return the template object
  const template = CALENDAR_TEMPLATES.find((t) => t.type === selectedType);

  // Fallback to quotes if something goes wrong
  return template || CALENDAR_TEMPLATES[4]; // quotes as default
}

/**
 * Get template by ID
 */
export function getTemplateById(id: string): CalendarTemplate | null {
  return CALENDAR_TEMPLATES.find((t) => t.id === id) || null;
}

/**
 * Get template by type
 */
export function getTemplateByType(type: string): CalendarTemplate | null {
  return CALENDAR_TEMPLATES.find((t) => t.type === type) || null;
}
