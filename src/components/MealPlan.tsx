import React, { useState, useEffect } from 'react';
import {
  Utensils,
  Clock,
  ChevronRight,
  Loader2,
  Sun,
  CloudSun,
  Moon,
  X,
  Calendar,
  ChefHat,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Recipe, LabResult } from '../types';
import { getPersonalizedRecipes } from '../services/ai';
import { buildWeekPlan } from '../lib/mealPlan';
import { cn } from '../lib/utils';

interface MealPlanProps {
  labResult: LabResult;
}

const SLOT_CONFIG: { key: 'breakfast' | 'lunch' | 'dinner'; label: string; icon: typeof Sun }[] = [
  { key: 'breakfast', label: 'Breakfast', icon: Sun },
  { key: 'lunch', label: 'Lunch', icon: CloudSun },
  { key: 'dinner', label: 'Dinner', icon: Moon },
];

export default function MealPlan({ labResult }: MealPlanProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [weekPlan, setWeekPlan] = useState(buildWeekPlan([]));

  useEffect(() => {
    async function load() {
      try {
        const data = await getPersonalizedRecipes(labResult);
        setRecipes(data);
        setWeekPlan(buildWeekPlan(data));
      } catch (error) {
        console.error('Failed to load meal plan:', error);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [labResult]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="relative">
          <Loader2 className="animate-spin text-zinc-900" size={48} />
          <div className="absolute inset-0 signature-gradient opacity-20 blur-xl animate-pulse" />
        </div>
        <div className="text-center">
          <h3 className="font-bold text-zinc-900">Building your meal plan</h3>
          <p className="text-sm text-zinc-400 font-medium">
            Picking recipes that match your biology...
          </p>
        </div>
      </div>
    );
  }

  const hasRecipes = recipes.length > 0;

  return (
    <div className="space-y-10 py-4">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="text-4xl font-extrabold text-zinc-900 tracking-tight">Meal plan</h2>
          <p className="text-[17px] text-zinc-400 font-medium mt-2">
            This week’s meals, tailored to your lab results.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[13px] font-semibold text-zinc-500">
          <Calendar size={18} />
          {weekPlan[0]?.date} → {weekPlan[6]?.date}
        </div>
      </div>

      {!hasRecipes ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-[3rem] border border-zinc-100 bg-zinc-50/50 text-center">
          <div className="w-16 h-16 rounded-2xl bg-zinc-200 flex items-center justify-center text-zinc-400 mb-4">
            <ChefHat size={32} />
          </div>
          <p className="text-zinc-600 font-semibold">No recipes generated yet</p>
          <p className="text-zinc-400 text-sm mt-1 max-w-sm">
            We couldn’t build a meal plan from your labs. Try the AI Coach for suggestions.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto -mx-2 pb-2">
            <div className="flex gap-4 min-w-max">
              {weekPlan.map((day, dayIndex) => (
                <motion.div
                  key={day.date}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: dayIndex * 0.05 }}
                  className="w-[280px] flex-shrink-0 bg-white border border-zinc-100 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md hover:border-zinc-200 transition-all"
                >
                  <div className="px-5 py-4 border-b border-zinc-100 bg-zinc-50/50">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                      {day.dayLabel}
                    </p>
                    <p className="text-sm font-semibold text-zinc-700">{day.date}</p>
                  </div>
                  <div className="p-4 space-y-3">
                    {SLOT_CONFIG.map(({ key, label, icon: Icon }) => {
                      const recipe = day[key];
                      return (
                        <div
                          key={key}
                          className={cn(
                            'rounded-2xl border transition-all cursor-pointer',
                            recipe
                              ? 'border-zinc-100 hover:border-zinc-200 hover:shadow-sm bg-white'
                              : 'border-dashed border-zinc-200 bg-zinc-50/30'
                          )}
                          onClick={() => recipe && setSelectedRecipe(recipe)}
                        >
                          {recipe ? (
                            <div className="p-4 relative">
                              <div className="flex items-center gap-2 mb-2">
                                <Icon size={14} className="text-zinc-400 flex-shrink-0" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                                  {label}
                                </span>
                              </div>
                              <p className="text-sm font-bold text-zinc-900 line-clamp-2 leading-snug pr-6">
                                {recipe.title}
                              </p>
                              {recipe.prepTime && (
                                <p className="flex items-center gap-1 mt-1.5 text-[11px] text-zinc-400 font-medium">
                                  <Clock size={12} /> {recipe.prepTime}
                                </p>
                              )}
                              <ChevronRight
                                size={16}
                                className="absolute top-3 right-3 text-zinc-300"
                              />
                            </div>
                          ) : (
                            <div className="p-4 flex items-center gap-2 text-zinc-400">
                              <Icon size={14} />
                              <span className="text-xs font-medium">{label} — Add recipe</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <h3 className="text-[15px] font-bold text-zinc-900 flex items-center gap-2 mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
              This week’s recipes
            </h3>
            <div className="flex flex-wrap gap-3">
              {recipes.map((recipe, i) => (
                <button
                  key={recipe.id || i}
                  onClick={() => setSelectedRecipe(recipe)}
                  className="flex items-center gap-3 px-5 py-3 bg-white border border-zinc-100 rounded-2xl text-left hover:border-zinc-200 hover:shadow-sm transition-all group"
                >
                  <img
                    src={recipe.image || `https://picsum.photos/seed/${recipe.title}/80/80`}
                    alt=""
                    className="w-12 h-12 rounded-xl object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <p className="text-sm font-bold text-zinc-900 group-hover:signature-gradient-text transition-all">
                      {recipe.title}
                    </p>
                    <p className="text-[11px] text-zinc-400 font-medium">
                      {recipe.prepTime || '—'} · {recipe.ingredients?.length ?? 0} ingredients
                    </p>
                  </div>
                  <ChevronRight size={18} className="text-zinc-300 ml-1" />
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Recipe detail modal */}
      {selectedRecipe && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-zinc-900/40 backdrop-blur-md"
          onClick={() => setSelectedRecipe(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[3rem] overflow-hidden flex flex-col shadow-2xl"
          >
            <div className="relative h-80">
              <img
                src={
                  selectedRecipe.image ||
                  `https://picsum.photos/seed/${selectedRecipe.title}/1200/800`
                }
                alt={selectedRecipe.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <button
                onClick={() => setSelectedRecipe(null)}
                className="absolute top-6 right-6 w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white hover:bg-white/30 transition-all"
              >
                <X size={24} />
              </button>
              <div className="absolute bottom-8 left-8 right-8">
                <h3 className="text-4xl font-extrabold text-white tracking-tight">
                  {selectedRecipe.title}
                </h3>
                <p className="text-white/80 mt-2 text-lg font-medium">
                  {selectedRecipe.description}
                </p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-12 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <h4 className="text-lg font-extrabold text-zinc-900 flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
                    Ingredients
                  </h4>
                  <ul className="space-y-3">
                    {(selectedRecipe.ingredients || []).map((ing, i) => (
                      <li
                        key={i}
                        className="text-[15px] text-zinc-500 font-medium flex items-center gap-3 p-3 bg-zinc-50 rounded-2xl border border-zinc-100"
                      >
                        <div className="w-2 h-2 rounded-full signature-gradient" /> {ing}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-6">
                  <h4 className="text-lg font-extrabold text-zinc-900 flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
                    Instructions
                  </h4>
                  <ol className="space-y-4">
                    {(selectedRecipe.instructions || []).map((step, i) => (
                      <li
                        key={i}
                        className="text-[15px] text-zinc-500 font-medium flex gap-4 leading-relaxed"
                      >
                        <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-zinc-900 text-white flex items-center justify-center text-xs font-bold">
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
              {(selectedRecipe.benefits?.length ?? 0) > 0 && (
                <div className="flex flex-wrap gap-2 pt-4">
                  {selectedRecipe.benefits.map((benefit, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-100"
                    >
                      {benefit}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
