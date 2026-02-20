import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Upload, 
  ChefHat, 
  Settings, 
  Menu, 
  X,
  Dna,
  HeartPulse
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Chat from './components/Chat';
import LabUpload from './components/LabUpload';
import Dashboard from './components/Dashboard';
import MealPlan from './components/MealPlan';
import { LabResult } from './types';
import { cn } from './lib/utils';

type Tab = 'chat' | 'upload' | 'dashboard' | 'nutrition';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [labResult, setLabResult] = useState<LabResult | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleUploadSuccess = (result: LabResult) => {
    setLabResult(result);
    setActiveTab('dashboard');
  };

  const navItems = [
    { id: 'chat', label: 'AI Coach', icon: MessageSquare },
    { id: 'upload', label: 'Lab Upload', icon: Upload },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, disabled: !labResult },
    { id: 'nutrition', label: 'Meal Plan', icon: ChefHat, disabled: !labResult },
  ];

  return (
    <div className="flex h-screen bg-white text-zinc-900 overflow-hidden font-sans">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-zinc-100 p-8">
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="w-12 h-12 rounded-2xl signature-gradient flex items-center justify-center text-white shadow-lg shadow-emerald-100/50">
            <HeartPulse size={28} />
          </div>
          <h1 className="text-xl font-extrabold leading-tight tracking-tighter text-zinc-900">
            Food is My<br /><span className="signature-gradient-text">Medicine</span>
          </h1>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              disabled={item.disabled}
              onClick={() => setActiveTab(item.id as Tab)}
              className={cn(
                "w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[15px] font-semibold transition-all duration-200",
                activeTab === item.id 
                  ? "bg-zinc-50 text-zinc-900 shadow-sm" 
                  : "text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50/50",
                item.disabled && "opacity-20 cursor-not-allowed grayscale"
              )}
            >
              <item.icon size={22} className={cn(activeTab === item.id ? "text-zinc-900" : "text-zinc-400")} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="pt-8 border-t border-zinc-100">
          <button className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[15px] font-semibold text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50/50 transition-all">
            <Settings size={22} />
            Settings
          </button>
          <div className="mt-8 p-6 bg-zinc-900 rounded-[2rem] text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 signature-gradient opacity-20 blur-3xl -mr-16 -mt-16 group-hover:opacity-30 transition-opacity" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <Dna size={18} className="text-emerald-400" />
                <span className="text-[11px] font-bold uppercase tracking-[0.15em] opacity-50">Intelligence Pro</span>
              </div>
              <p className="text-sm font-medium leading-relaxed opacity-90">
                Unlock deep DNA analysis and real-time glucose tracking.
              </p>
              <button className="mt-5 w-full py-3 bg-white text-zinc-900 hover:bg-zinc-100 rounded-xl text-xs font-bold transition-all shadow-xl shadow-black/20">
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-zinc-200 z-40 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
            <HeartPulse size={18} />
          </div>
          <span className="font-bold text-sm">Food is My Medicine</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-zinc-500"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="fixed inset-0 z-30 bg-white p-6 pt-20 md:hidden"
          >
            <nav className="space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  disabled={item.disabled}
                  onClick={() => {
                    setActiveTab(item.id as Tab);
                    setIsSidebarOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-lg font-semibold transition-all",
                    activeTab === item.id 
                      ? "bg-emerald-50 text-emerald-700" 
                      : "text-zinc-500",
                    item.disabled && "opacity-40"
                  )}
                >
                  <item.icon size={24} />
                  {item.label}
                </button>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden pt-16 md:pt-0">
        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
          <div className="max-w-4xl mx-auto h-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                {activeTab === 'chat' && <Chat />}
                {activeTab === 'upload' && <LabUpload onUploadSuccess={handleUploadSuccess} />}
                {activeTab === 'dashboard' && labResult && <Dashboard labResult={labResult} />}
                {activeTab === 'nutrition' && labResult && <MealPlan labResult={labResult} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
