import React, { useState, useEffect } from 'react';
import { Utensils, Clock, Heart, ChevronRight, ShoppingCart, Loader2, Sparkles, X } from 'lucide-react';
import { motion } from 'motion/react';
import { Recipe, LabResult } from '../types';
import { getPersonalizedRecipes } from '../services/ai';
import { cn } from '../lib/utils';

interface NutritionPlanProps {
  labResult: LabResult;
}

export default function NutritionPlan({ labResult }: NutritionPlanProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    async function loadRecipes() {
      try {
        const data = await getPersonalizedRecipes(labResult);
        setRecipes(data);
      } catch (error) {
        console.error('Failed to load recipes:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadRecipes();
  }, [labResult]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="relative">
          <Loader2 className="animate-spin text-zinc-900" size={48} />
          <div className="absolute inset-0 signature-gradient opacity-20 blur-xl animate-pulse" />
        </div>
        <div className="text-center">
          <h3 className="font-bold text-zinc-900">Crafting Your Biology-First Menu</h3>
          <p className="text-sm text-zinc-400 font-medium">Analyzing markers to select optimal ingredients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 py-4">
      <div className="space-y-3">
        <h2 className="text-4xl font-extrabold text-zinc-900 tracking-tight">Food as Medicine</h2>
        <p className="text-[17px] text-zinc-400 font-medium leading-relaxed max-w-xl">
          Precision recipes engineered to optimize your specific biological markers.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {recipes.map((recipe, i) => (
          <motion.div
            key={recipe.id || i}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group bg-white border border-zinc-100 rounded-[3rem] overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-zinc-100 hover:border-zinc-200 transition-all duration-500 cursor-pointer"
            onClick={() => setSelectedRecipe(recipe)}
          >
            <div className="flex flex-col md:flex-row">
              <div className="md:w-[35%] h-64 md:h-auto relative overflow-hidden">
                <img 
                  src={recipe.image || `https://picsum.photos/seed/${recipe.title}/800/600`} 
                  alt={recipe.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-5 left-5 flex gap-2">
                  {recipe.tags?.slice(0, 2).map(tag => (
                    <span key={tag} className="px-3 py-1.5 bg-white/95 backdrop-blur-md rounded-xl text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-900 shadow-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="md:w-[65%] p-10 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-extrabold text-zinc-900 group-hover:signature-gradient-text transition-all duration-300 tracking-tight">{recipe.title}</h3>
                    <div className="flex items-center gap-6 mt-2 text-zinc-400 text-[11px] font-bold uppercase tracking-widest">
                      <span className="flex items-center gap-2"><Clock size={16} className="text-zinc-300" /> {recipe.prepTime || '25 min'}</span>
                      <span className="flex items-center gap-2"><Utensils size={16} className="text-zinc-300" /> {recipe.ingredients.length} Ingredients</span>
                    </div>
                  </div>
                  <button className="p-3 rounded-2xl bg-zinc-50 text-zinc-300 hover:text-red-500 hover:bg-red-50 transition-all">
                    <Heart size={22} />
                  </button>
                </div>

                <div className="space-y-4">
                  <p className="text-[15px] text-zinc-500 leading-relaxed font-medium line-clamp-2">{recipe.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {recipe.benefits.map((benefit, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-zinc-50 text-zinc-600 rounded-xl text-[11px] font-bold uppercase tracking-wider border border-zinc-100">
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <button className="flex items-center gap-2 text-sm font-extrabold text-zinc-900 hover:gap-3 transition-all">
                    View Protocol <ChevronRight size={18} className="text-zinc-300" />
                  </button>
                  <button className="flex items-center gap-3 px-6 py-4 bg-zinc-900 text-white rounded-2xl text-xs font-bold hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200">
                    <ShoppingCart size={16} /> Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-zinc-900/40 backdrop-blur-md">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[3rem] overflow-hidden flex flex-col shadow-2xl"
          >
            <div className="relative h-80">
              <img 
                src={selectedRecipe.image || `https://picsum.photos/seed/${selectedRecipe.title}/1200/800`} 
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
                <h3 className="text-4xl font-extrabold text-white tracking-tight">{selectedRecipe.title}</h3>
                <p className="text-white/80 mt-2 text-lg font-medium">{selectedRecipe.description}</p>
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
                    {selectedRecipe.ingredients.map((ing, i) => (
                      <li key={i} className="text-[15px] text-zinc-500 font-medium flex items-center gap-3 p-3 bg-zinc-50 rounded-2xl border border-zinc-100">
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
                    {selectedRecipe.instructions.map((step, i) => (
                      <li key={i} className="text-[15px] text-zinc-500 font-medium flex gap-4 leading-relaxed">
                        <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-zinc-900 text-white flex items-center justify-center text-xs font-bold">{i + 1}</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
