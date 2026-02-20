import React from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Beaker,
  Target,
} from 'lucide-react';
import { LabResult, LabMarker } from '../types';
import { cn } from '../lib/utils';

interface DashboardProps {
  labResult: LabResult;
}

// Infer category from marker name for summary cards
const METABOLIC_KEYWORDS = ['glucose', 'cholesterol', 'hdl', 'ldl', 'triglyceride', 'a1c', 'hba1c', 'insulin'];
const NUTRIENT_KEYWORDS = ['iron', 'ferritin', 'b12', 'vitamin d', 'folate', 'magnesium', 'zinc', 'calcium'];
const INFLAMMATION_KEYWORDS = ['crp', 'hs-crp', 'homocysteine', 'esr'];

function getSummaryFromMarkers(labResult: LabResult) {
  const markers = labResult.markers;
  const total = markers.length;
  const normal = markers.filter((m) => m.status === 'normal').length;
  const high = markers.filter((m) => m.status === 'high').length;
  const low = markers.filter((m) => m.status === 'low').length;

  const metabolic = markers.filter((m) =>
    METABOLIC_KEYWORDS.some((k) => m.name.toLowerCase().includes(k))
  );
  const nutrient = markers.filter((m) =>
    NUTRIENT_KEYWORDS.some((k) => m.name.toLowerCase().includes(k))
  );
  const inflammation = markers.filter((m) =>
    INFLAMMATION_KEYWORDS.some((k) => m.name.toLowerCase().includes(k))
  );

  const scorePct = total ? Math.round((normal / total) * 100) : 0;
  const metabolicStatus =
    metabolic.length === 0
      ? '—'
      : metabolic.every((m) => m.status === 'normal')
        ? 'Optimal'
        : metabolic.some((m) => m.status === 'high' || m.status === 'low')
          ? 'Action needed'
          : 'Good';
  const nutrientStatus =
    nutrient.length === 0
      ? '—'
      : nutrient.every((m) => m.status === 'normal')
        ? 'Optimal'
        : nutrient.some((m) => m.status === 'low')
          ? 'Action needed'
          : 'Good';
  const inflammationStatus =
    inflammation.length === 0
      ? '—'
      : inflammation.every((m) => m.status === 'normal' || m.status === 'low')
        ? 'Low'
        : inflammation.some((m) => m.status === 'high')
          ? 'Elevated'
          : 'Normal';

  return {
    total,
    normal,
    high,
    low,
    scorePct,
    metabolicStatus,
    nutrientStatus,
    inflammationStatus,
  };
}

export default function Dashboard({ labResult }: DashboardProps) {
  const summary = getSummaryFromMarkers(labResult);
  const data = labResult.markers.map((m) => ({
    name: m.name,
    value: m.value,
    status: m.status,
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'high':
        return '#ef4444';
      case 'low':
        return '#3b82f6';
      default:
        return '#10b981';
    }
  };

  const criticalMarkers = labResult.markers.filter((m) => m.status !== 'normal');

  if (labResult.markers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <div className="w-20 h-20 rounded-3xl signature-gradient flex items-center justify-center text-white shadow-xl mb-6">
          <Beaker size={40} />
        </div>
        <h2 className="text-2xl font-extrabold text-zinc-900 tracking-tight">No markers yet</h2>
        <p className="text-zinc-500 mt-2 max-w-sm font-medium">
          Upload a lab report from the Lab Upload tab to see your biological audit and insights here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10 py-4">
      {/* Header + score */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h2 className="text-4xl font-extrabold text-zinc-900 tracking-tight">Biological Audit</h2>
          <p className="text-[17px] text-zinc-400 mt-2 font-medium">
            Snapshot from {labResult.date || 'your latest labs'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-5 py-2.5 bg-zinc-900 text-white rounded-2xl text-xs font-bold shadow-xl shadow-zinc-200">
            <Target size={16} className="text-emerald-400" />
            {summary.scorePct}% in range
          </div>
          <div className="flex items-center gap-3 px-5 py-2.5 bg-zinc-50 border border-zinc-100 rounded-2xl text-xs font-semibold text-zinc-600">
            <Activity size={16} className="text-zinc-400" />
            {labResult.markers.length} markers
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            label: 'Metabolic Health',
            val: summary.metabolicStatus,
            icon: TrendingUp,
            color:
              summary.metabolicStatus === 'Optimal' || summary.metabolicStatus === 'Good'
                ? 'text-emerald-500'
                : 'text-amber-500',
          },
          {
            label: 'Nutrient Status',
            val: summary.nutrientStatus,
            icon:
              summary.nutrientStatus === 'Action needed' ? AlertTriangle : CheckCircle2,
            color:
              summary.nutrientStatus === 'Optimal' || summary.nutrientStatus === 'Good'
                ? 'text-emerald-500'
                : 'text-amber-500',
          },
          {
            label: 'Inflammation',
            val: summary.inflammationStatus,
            icon:
              summary.inflammationStatus === 'Elevated' ? TrendingDown : CheckCircle2,
            color:
              summary.inflammationStatus === 'Low' || summary.inflammationStatus === 'Normal'
                ? 'text-emerald-500'
                : 'text-red-500',
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="p-8 bg-white border border-zinc-100 rounded-[2.5rem] shadow-sm space-y-2 group hover:border-zinc-200 transition-all"
          >
            <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-widest">
              {stat.label}
            </p>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-extrabold text-zinc-900 tracking-tight">
                {stat.val}
              </span>
              <stat.icon
                size={24}
                className={cn(stat.color, 'mb-1 group-hover:scale-110 transition-transform')}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Marker distribution chart */}
      <div className="p-10 bg-white border border-zinc-100 rounded-[3rem] shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 signature-gradient opacity-[0.02] blur-3xl -mr-32 -mt-32" />
        <h3 className="text-[15px] font-bold text-zinc-900 mb-10 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
          Marker distribution
        </h3>
        <div className="h-72 w-full min-h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 40, right: 20 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={true}
                vertical={false}
                stroke="#f4f4f5"
              />
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
                contentStyle={{
                  borderRadius: '20px',
                  border: 'none',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                  padding: '12px 16px',
                }}
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

      {/* Critical insights */}
      <div className="space-y-6">
        <h3 className="text-[15px] font-bold text-zinc-900 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
          Critical insights
        </h3>
        {criticalMarkers.length === 0 ? (
          <div className="p-10 bg-emerald-50/50 border border-emerald-100 rounded-[2.5rem] text-center">
            <CheckCircle2 size={40} className="text-emerald-500 mx-auto mb-3" />
            <p className="text-emerald-800 font-semibold">All markers in range</p>
            <p className="text-emerald-600/80 text-sm mt-1 font-medium">
              Keep up your current nutrition and lifestyle habits.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {criticalMarkers.map((marker, i) => (
              <MarkerCard key={i} marker={marker} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MarkerCard({ marker }: { marker: LabMarker }) {
  return (
    <div className="p-8 bg-zinc-50/50 border border-zinc-100 rounded-[2.5rem] flex items-start gap-6 group hover:bg-white hover:border-zinc-200 transition-all">
      <div
        className={cn(
          'w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm transition-transform group-hover:scale-105',
          marker.status === 'high' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'
        )}
      >
        <Activity size={28} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <h4 className="text-lg font-extrabold text-zinc-900 tracking-tight">{marker.name}</h4>
          <span
            className={cn(
              'text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest',
              marker.status === 'high' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
            )}
          >
            {marker.status}
          </span>
          <span className="text-sm font-semibold text-zinc-500">
            {marker.value} {marker.unit}
          </span>
        </div>
        <p className="text-[15px] text-zinc-500 leading-relaxed font-medium">
          {marker.description ||
            `Your ${marker.name} is ${marker.status}. We've adjusted your nutrition plan to help bring this back to optimal range.`}
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-6 text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
          <span className="flex items-center gap-2">
            <TrendingUp size={16} className="text-zinc-300" />
            Target: {marker.optimalRange || '—'}
          </span>
          <span className="flex items-center gap-2">
            <Calendar size={16} className="text-zinc-300" />
            Re-test: 90 days
          </span>
        </div>
      </div>
    </div>
  );
}
