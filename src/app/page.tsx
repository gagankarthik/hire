'use client';

import React, { useState, useCallback, useEffect } from 'react';
import ResumeUploader from '@/components/ResumeUploader';
import ResumeEditor from '@/components/ResumeEditor';
import GeneratedResume from '@/components/GeneratedResume';
import StateSelector from '@/components/StateSelector';
import type { ResumeData } from '@/lib/types';

type Step = 'upload' | 'processing' | 'edit';

const EMPTY_RESUME: ResumeData = {
  name: '', title: '', requisitionNumber: '',
  professionalSummary: [], employmentHistory: [],
  education: [], certifications: [], skillCategories: [],
};

// ── Processing stages shown during AI parsing ──────────────────────────────
const STAGES = [
  { id: 0, icon: '📄', label: 'Reading file',        detail: 'Extracting raw text from your document…',          ms: 0    },
  { id: 1, icon: '🔍', label: 'Parsing content',     detail: 'Identifying sections — experience, education…',    ms: 2000 },
  { id: 2, icon: '🤖', label: 'AI analyzing',        detail: 'GPT-4o-mini is structuring your resume data…',     ms: 5000 },
  { id: 3, icon: '⚙️', label: 'Formatting output',  detail: 'Preparing Ohio-format fields and tables…',         ms: 11000 },
];

function ProcessingScreen({ fileName }: { fileName: string }) {
  const [stageIndex, setStageIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  // Advance stages on a timer
  useEffect(() => {
    const timers = STAGES.slice(1).map(s =>
      setTimeout(() => setStageIndex(s.id), s.ms),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  // Elapsed seconds counter
  useEffect(() => {
    const id = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const current = STAGES[stageIndex];

  return (
    <div className="flex flex-col items-center py-20 space-y-10">
      {/* Central animated icon */}
      <div className="relative flex items-center justify-center w-28 h-28">
        {/* Outer pulse ring */}
        <div className="absolute inset-0 rounded-full bg-ocean-light animate-ping opacity-40" />
        {/* Spinning border */}
        <div className="absolute inset-0 rounded-full border-4 border-ocean-blue border-t-transparent animate-spin" />
        {/* Static inner ring */}
        <div className="absolute inset-2 rounded-full border-2 border-blue-100" />
        {/* Stage icon */}
        <span className="text-4xl select-none z-10">{current.icon}</span>
      </div>

      {/* Stage label + detail */}
      <div className="text-center space-y-2 animate-slide-up" key={stageIndex}>
        <p className="text-2xl font-bold text-ocean-dark">{current.label}…</p>
        <p className="text-gray-500 text-sm max-w-sm">{current.detail}</p>
        <p className="text-gray-400 text-xs">{fileName}</p>
      </div>

      {/* Stage progress dots */}
      <div className="flex items-center gap-3">
        {STAGES.map(s => (
          <div key={s.id} className="flex flex-col items-center gap-1">
            <div
              className={`w-3 h-3 rounded-full transition-all duration-500 ${
                s.id < stageIndex
                  ? 'bg-green-500 scale-90'
                  : s.id === stageIndex
                    ? 'bg-ocean-blue scale-125 ring-4 ring-ocean-light'
                    : 'bg-gray-200'
              }`}
            />
            <span className={`text-[10px] font-medium whitespace-nowrap ${
              s.id === stageIndex ? 'text-ocean-blue' : s.id < stageIndex ? 'text-green-500' : 'text-gray-300'
            }`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Elapsed + tip */}
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="text-xs text-gray-400">
          ⏱ {elapsed}s elapsed · typically 10–20s
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-xs text-amber-700 max-w-xs">
          💡 AI is carefully extracting every job, project, and skill — worth the wait!
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function Home() {
  const [step, setStep] = useState<Step>('upload');
  const [resumeData, setResumeData] = useState<ResumeData>(EMPTY_RESUME);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [fileName, setFileName] = useState('');

  const handleUpload = useCallback(async (file: File) => {
    setError(null);
    setFileName(file.name);
    setStep('processing');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/parse-resume', { method: 'POST', body: formData });
      const data = await res.json() as ResumeData & { error?: string };

      if (!res.ok || data.error) {
        throw new Error(data.error ?? 'Parsing failed. Please try again.');
      }

      setResumeData(data);
      setStep('edit');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      setStep('upload');
    }
  }, []);

  const handleReset = () => {
    setStep('upload');
    setResumeData(EMPTY_RESUME);
    setError(null);
    setFileName('');
    setActiveTab('edit');
  };

  const stepLabels: Record<Step, string> = {
    upload: '1. Upload',
    processing: '2. Processing',
    edit: '3. Edit & Export',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-ocean-dark text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Resume Parser</h1>
            <p className="text-blue-200 text-sm">AI-Powered · State Format Export · DOCX</p>
          </div>
          {step === 'edit' && (
            <button
              onClick={handleReset}
              className="text-sm text-blue-200 hover:text-white border border-blue-400 hover:border-white rounded-lg px-4 py-2 transition-colors"
            >
              ← Upload New
            </button>
          )}
        </div>
      </header>

      {/* Step breadcrumb */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center space-x-2 text-sm">
          {(Object.keys(stepLabels) as Step[]).map((s, i) => {
            const isActive = s === step;
            const isDone = (step === 'processing' && s === 'upload') || (step === 'edit' && s !== 'edit');
            return (
              <React.Fragment key={s}>
                {i > 0 && <span className="text-gray-300 mx-1">›</span>}
                <span className={`font-medium ${isActive ? 'text-ocean-blue' : isDone ? 'text-green-600' : 'text-gray-400'}`}>
                  {isDone ? '✓ ' : ''}{stepLabels[s]}
                </span>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 pb-16">

        {/* ── Upload ── */}
        {step === 'upload' && (
          <div className="flex flex-col items-center py-16 space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-ocean-dark mb-3">Upload Your Resume</h2>
              <p className="text-gray-600 max-w-md">
                Upload a PDF or DOCX resume. AI extracts every detail and formats it for your chosen state.
              </p>
            </div>
            <ResumeUploader onUpload={handleUpload} error={error} />
            {error && (
              <div className="w-full max-w-2xl bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
                <strong>Error:</strong> {error}
              </div>
            )}
          </div>
        )}

        {/* ── Processing ── */}
        {step === 'processing' && <ProcessingScreen fileName={fileName} />}

        {/* ── Edit & Export ── */}
        {step === 'edit' && (
          <div className="space-y-6">
            {/* Tab bar */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl w-fit">
              {(['edit', 'preview'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === tab
                      ? 'bg-white text-ocean-dark shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {tab === 'edit' ? '✏️ Edit Data' : '👁 Preview'}
                </button>
              ))}
            </div>

            {/* Token stats */}
            {resumeData.tokenStats && (
              <div className="flex flex-wrap gap-3">
                {[
                  { label: 'Input Tokens', value: resumeData.tokenStats.promptTokens.toLocaleString() },
                  { label: 'Output Tokens', value: resumeData.tokenStats.completionTokens.toLocaleString() },
                  { label: 'Model', value: resumeData.tokenStats.model },
                  { label: 'Cost', value: `$${resumeData.tokenStats.cost.toFixed(6)}`, green: true },
                ].map(({ label, value, green }) => (
                  <div key={label} className="bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
                    <span className="text-xs text-gray-500">{label}: </span>
                    <span className={`text-sm font-semibold ${green ? 'text-green-600' : 'text-ocean-dark'}`}>{value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Edit tab content */}
            {activeTab === 'edit' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
                <ResumeEditor resumeData={resumeData} onChange={setResumeData} />
              </div>
            )}

            {/*
              Preview tab — GeneratedResume stays mounted even when hidden
              so its triggerResumeDownload event listener remains active.
            */}
            <div className={activeTab === 'preview' ? '' : 'hidden'}>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <GeneratedResume resumeData={resumeData} previewMode />
              </div>
            </div>

            {/* ── State selector & Download (always visible in edit step) ── */}
            <StateSelector candidateName={resumeData.name || undefined} />
          </div>
        )}
      </main>
    </div>
  );
}
