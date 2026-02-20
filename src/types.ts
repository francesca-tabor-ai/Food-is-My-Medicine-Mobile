export type UserProfile = {
  name: string;
  age?: number;
  goals: string[];
  conditions: string[];
  dietaryPreferences: string[];
};

export type LabMarker = {
  name: string;
  value: number;
  unit: string;
  status: 'low' | 'normal' | 'high';
  optimalRange: string;
  description: string;
};

export type LabResult = {
  id: string;
  date: string;
  markers: LabMarker[];
};

export type Recipe = {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTime: string;
  tags: string[];
  image: string;
  benefits: string[]; // Why this is good for the user's specific markers
};

export type Message = {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
};

export type MealSlot = 'breakfast' | 'lunch' | 'dinner';

export type DayPlan = {
  date: string; // YYYY-MM-DD
  dayLabel: string; // Mon, Tue, ...
  breakfast?: Recipe;
  lunch?: Recipe;
  dinner?: Recipe;
};

export type WeekPlan = DayPlan[];
