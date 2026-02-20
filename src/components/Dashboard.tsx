import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Activity, TrendingUp, AlertTriangle, CheckCircle2, Calendar } from 'lucide-react';
import { LabResult, LabMarker } from '../types';
import { cn } from '../lib/utils';

interface DashboardProps {
  labResult: LabResult;
}

export default function Dashboard({ labResult }: DashboardProps) {
  const data = labResult.markers.map(m => ({
    name: m.name,
    value: m.value,
    status: m.status
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'high': return '#ef4444';
      case 'low': return '#3b82f6';
      default: return '#10b981';
    }
  };

  const criticalMarkers = labResult.markers.filter(m => m.status !== 'normal');

  return (
    <div className="space-y-10 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-extrabold text-zinc-900 tracking-tight">Biological Audit</h2>
          <p className="text-[17px] text-zinc-400 mt-2 font-medium">Snapshot from {labResult.date}</p>
        </div>
        <div className="flex items-center gap-3 px-5 py-2.5 bg-zinc-900 text-white rounded-2xl text-xs font-bold shadow-xl shadow-zinc-200">
          <Activity size={16} className="text-emerald-400" />
          Biological Age: 32
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Metabolic Health", val: "Optimal", icon: TrendingUp, color: "text-emerald-500" },
          { label: "Nutrient Status", val: "Action Required", icon: AlertTriangle, color: "text-amber-500" },
          { label: "Inflammation", val: "Low", icon: CheckCircle2, color: "text-emerald-500" }
        ].map((stat, i) => (
          <div key={i} className="p-8 bg-white border border-zinc-100 rounded-[2.5rem] shadow-sm space-y-2 group hover:border-zinc-200 transition-all">
            <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-widest">{stat.label}</p>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-extrabold text-zinc-900 tracking-tight">{stat.val}</span>
              <stat.icon size={24} className={cn(stat.color, "mb-1 group-hover:scale-110 transition-transform")} />
            </div>
          </div>
        ))}
      </div>

      <div className="p-10 bg-white border border-zinc-100 rounded-[3rem] shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 signature-gradient opacity-[0.02] blur-3xl -mr-32 -mt-32" />
        <h3 className="text-[15px] font-bold text-zinc-900 mb-10 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
          Marker Distribution
        </h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 40, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f4f4f5" />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: '#a1a1aa', fontWeight: 600 }}
                width={120}
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', padding: '12px 16px' }}
              />
              <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={24}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-[15px] font-bold text-zinc-900 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
          Critical Insights
        </h3>
        <div className="grid grid-cols-1 gap-4">
          {criticalMarkers.map((marker, i) => (
            <div key={i} className="p-8 bg-zinc-50/50 border border-zinc-100 rounded-[2.5rem] flex items-start gap-6 group hover:bg-white hover:border-zinc-200 transition-all">
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm transition-transform group-hover:scale-105",
                marker.status === 'high' ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-500"
              )}>
                <Activity size={28} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-extrabold text-zinc-900 tracking-tight">{marker.name}</h4>
                  <span className={cn(
                    "text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest",
                    marker.status === 'high' ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                  )}>
                    {marker.status}
                  </span>
                </div>
                <p className="text-[15px] text-zinc-500 leading-relaxed font-medium">
                  {marker.description || `Your ${marker.name} is ${marker.status}. We've adjusted your nutrition plan to help bring this back to optimal range.`}
                </p>
                <div className="mt-5 flex items-center gap-6 text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                  <span className="flex items-center gap-2">
                    <TrendingUp size={16} className="text-zinc-300" />
                    Target: {marker.optimalRange}
                  </span>
                  <span className="flex items-center gap-2">
                    <Calendar size={16} className="text-zinc-300" />
                    Re-test: 90 Days
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
