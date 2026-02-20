import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, User, Bot, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { Message } from '../types';
import { generateChatResponse } from '../services/ai';
import { cn } from '../lib/utils';

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: "Hello! I'm your Food is My Medicine coach. How can I help you optimize your health today? You can tell me about your goals or upload a lab report to get started.",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      text: input,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const chatHistory = messages.map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      }));
      chatHistory.push({ role: 'user', parts: [{ text: input }] });

      const responseText = await generateChatResponse(chatHistory);
      
      const botMessage: Message = {
        role: 'model',
        text: responseText || "I'm sorry, I couldn't process that. Could you try again?",
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-[2.5rem] shadow-sm border border-zinc-100 overflow-hidden">
      <div className="px-8 py-6 border-b border-zinc-50 bg-zinc-50/30 flex items-center gap-4">
        <div className="w-10 h-10 rounded-2xl signature-gradient flex items-center justify-center text-white shadow-sm">
          <Bot size={22} />
        </div>
        <div>
          <h2 className="text-[15px] font-bold text-zinc-900">AI Health Coach</h2>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-xs font-medium text-zinc-400">Always Active</p>
          </div>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-8 space-y-6 scroll-smooth"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={msg.timestamp + i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex gap-4 max-w-[85%]",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <div className={cn(
                "w-9 h-9 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-sm",
                msg.role === 'user' ? "bg-zinc-900 text-white" : "bg-white border border-zinc-100 text-zinc-400"
              )}>
                {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
              </div>
              <div className={cn(
                "px-5 py-4 rounded-[1.5rem] text-[15px] leading-relaxed",
                msg.role === 'user' 
                  ? "bg-zinc-900 text-white rounded-tr-none shadow-lg shadow-zinc-200" 
                  : "bg-zinc-50 text-zinc-800 rounded-tl-none border border-zinc-100"
              )}>
                <div className="markdown-body">
                  <Markdown>{msg.text}</Markdown>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <div className="flex gap-4 mr-auto">
            <div className="w-9 h-9 rounded-2xl bg-white border border-zinc-100 flex items-center justify-center text-zinc-300">
              <Loader2 size={18} className="animate-spin" />
            </div>
            <div className="px-5 py-4 rounded-[1.5rem] bg-zinc-50 text-zinc-400 text-[15px] italic rounded-tl-none border border-zinc-100">
              Analyzing biology...
            </div>
          </div>
        )}
      </div>

      <div className="p-8 border-t border-zinc-50">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything about your health..."
            className="w-full pl-6 pr-28 py-5 bg-zinc-50 border border-zinc-100 rounded-2xl text-[15px] focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all placeholder:text-zinc-400"
          />
          <div className="absolute right-3 flex items-center gap-2">
            <button className="p-2.5 text-zinc-400 hover:text-zinc-900 transition-colors">
              <Mic size={22} />
            </button>
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="p-2.5 bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 disabled:opacity-20 disabled:hover:bg-zinc-900 transition-all shadow-lg shadow-zinc-200"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
