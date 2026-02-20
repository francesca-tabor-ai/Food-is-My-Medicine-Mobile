import type { Recipe, DayPlan, WeekPlan } from '../types';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getWeekDates(): { date: string; dayLabel: string }[] {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay());
  const out: { date: string; dayLabel: string }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    out.push({
      date: d.toISOString().slice(0, 10),
      dayLabel: DAY_LABELS[d.getDay()],
    });
  }
  return out;
}

/** Build a 7-day meal plan by rotating the given recipes across breakfast, lunch, dinner. */
export function buildWeekPlan(recipes: Recipe[]): WeekPlan {
  const days = getWeekDates();
  const slots: ('breakfast' | 'lunch' | 'dinner')[] = ['breakfast', 'lunch', 'dinner'];
  let recipeIndex = 0;

  return days.map(({ date, dayLabel }): DayPlan => {
    const day: DayPlan = { date, dayLabel };
    for (const slot of slots) {
      if (recipes.length > 0) {
        day[slot] = recipes[recipeIndex % recipes.length];
        recipeIndex++;
      }
    }
    return day;
  });
}
