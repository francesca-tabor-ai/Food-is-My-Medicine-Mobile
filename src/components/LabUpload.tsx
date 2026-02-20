import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, Camera } from 'lucide-react';
import { motion } from 'motion/react';
import { analyzeLabResults } from '../services/ai';
import { LabResult } from '../types';
import { cn } from '../lib/utils';

interface LabUploadProps {
  onUploadSuccess: (result: LabResult) => void;
}

export default function LabUpload({ onUploadSuccess }: LabUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSimulateUpload = async () => {
    setIsAnalyzing(true);
    setError(null);
    
    const sampleText = `
      Patient: John Doe
      Date: 2024-05-15
      
      Markers:
      - Total Cholesterol: 240 mg/dL (High)
      - LDL Cholesterol: 165 mg/dL (High)
      - HDL Cholesterol: 45 mg/dL (Normal)
      - Triglycerides: 180 mg/dL (High)
      - Vitamin D: 18 ng/mL (Low)
      - Iron (Ferritin): 25 ng/mL (Normal-Low)
      - HbA1c: 5.8% (Pre-diabetic)
    `;

    try {
      const result = await analyzeLabResults(sampleText);
      onUploadSuccess(result);
    } catch (err) {
      setError('Failed to analyze the report. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-10 py-8">
      <div className="text-center space-y-3">
        <h2 className="text-4xl font-extrabold text-zinc-900 tracking-tight">Upload Biology</h2>
        <p className="text-zinc-400 text-[17px] max-w-md mx-auto leading-relaxed">
          Our AI analyzes your blood test results to build your invisible health infrastructure.
        </p>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleSimulateUpload(); }}
        className={cn(
          "relative border border-zinc-100 rounded-[3rem] p-16 transition-all duration-500 flex flex-col items-center justify-center gap-6 cursor-pointer overflow-hidden group",
          isDragging ? "bg-zinc-50 border-zinc-300" : "bg-white hover:bg-zinc-50/50 hover:border-zinc-200 shadow-sm hover:shadow-xl hover:shadow-zinc-100",
          isAnalyzing && "pointer-events-none opacity-60"
        )}
        onClick={handleSimulateUpload}
      >
        <div className="absolute inset-0 signature-gradient opacity-0 group-hover:opacity-[0.03] transition-opacity" />
        
        <div className={cn(
          "w-24 h-24 rounded-[2rem] flex items-center justify-center transition-all duration-500",
          isAnalyzing ? "bg-zinc-900 text-white" : "bg-zinc-50 text-zinc-400 group-hover:bg-zinc-900 group-hover:text-white group-hover:scale-110"
        )}>
          {isAnalyzing ? <Loader2 className="animate-spin" size={40} /> : <Upload size={40} />}
        </div>
        
        <div className="text-center relative z-10">
          <p className="text-xl font-bold text-zinc-900">
            {isAnalyzing ? "Decrypting Lab Data..." : "Drop your report here"}
          </p>
          <p className="text-sm text-zinc-400 mt-2 font-medium">
            PDF, JPG, or PNG • Max 20MB
          </p>
        </div>

        <div className="flex gap-4 mt-4 relative z-10">
          <button className="flex items-center gap-3 px-6 py-4 bg-white border border-zinc-100 rounded-2xl text-[15px] font-bold text-zinc-900 hover:bg-zinc-50 transition-all shadow-sm">
            <Camera size={20} />
            Take Photo
          </button>
          <button className="flex items-center gap-3 px-6 py-4 bg-zinc-900 text-white rounded-2xl text-[15px] font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200">
            <FileText size={20} />
            Choose File
          </button>
        </div>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-5 bg-red-50 border border-red-100 rounded-3xl flex items-center gap-4 text-red-700 text-[15px] font-medium"
        >
          <AlertCircle size={22} className="flex-shrink-0" />
          <p>{error}</p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { title: "Nutrient Mapping", desc: "Identify critical deficiencies instantly." },
          { title: "Metabolic Optimization", desc: "Adjust markers for peak performance." },
          { title: "Precision Ingredients", desc: "Get a list of foods your body needs." },
          { title: "Disease Prevention", desc: "Track long-term health trajectories." }
        ].map((item, i) => (
          <div key={i} className="p-6 bg-zinc-50/50 border border-zinc-100 rounded-[2rem] flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-white border border-zinc-100 flex items-center justify-center text-emerald-500 shadow-sm">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h4 className="font-bold text-zinc-900 text-sm">{item.title}</h4>
              <p className="text-xs text-zinc-400 mt-1 font-medium">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
