'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FiDownload, FiX, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { STATE_REGISTRY, downloadStateDocx } from '@/formatters/registry';
import type { ResumeData } from '@/lib/types';

interface StateDownloadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  resumeData: ResumeData;
}

export default function StateDownloadDialog({ isOpen, onClose, resumeData }: StateDownloadDialogProps) {
  const [selected, setSelected] = useState('ohio');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Reset state when dialog reopens
  useEffect(() => {
    if (isOpen) { setStatus('idle'); setErrorMsg(''); setSelected('ohio'); }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const handleDownload = useCallback(async () => {
    setStatus('loading');
    setErrorMsg('');
    try {
      await downloadStateDocx(selected, resumeData);
      setStatus('done');
      setTimeout(onClose, 1200); // auto-close after brief success flash
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Download failed.');
      setStatus('error');
    }
  }, [selected, resumeData, onClose]);

  if (!isOpen) return null;

  const selectedMeta = STATE_REGISTRY.find(s => s.id === selected);
  const fileName = `${resumeData.name || 'Resume'}_${selectedMeta?.abbreviation ?? 'OH'}.docx`;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl animate-slide-up overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-ocean-dark to-ocean-blue px-6 py-5 flex items-start justify-between">
            <div>
              <h2 className="text-white text-xl font-bold">Download Resume</h2>
              <p className="text-blue-200 text-sm mt-0.5">
                Select the state format, then download as Word (.docx)
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors mt-0.5 p-1 rounded-lg hover:bg-white/10"
            >
              <FiX className="text-xl" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* State grid */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {STATE_REGISTRY.map(state => {
                const isSel = selected === state.id;
                return (
                  <button
                    key={state.id}
                    onClick={() => state.available && setSelected(state.id)}
                    disabled={!state.available}
                    className={`
                      relative rounded-xl p-3 text-center border-2 transition-all duration-150 select-none
                      ${isSel
                        ? 'border-ocean-blue bg-ocean-light shadow-md scale-[1.04]'
                        : state.available
                          ? 'border-gray-200 hover:border-ocean-blue hover:bg-blue-50 cursor-pointer'
                          : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-55'
                      }
                    `}
                  >
                    {/* Badge */}
                    <span className={`
                      absolute -top-2 -right-2 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full
                      ${state.available ? 'bg-green-500' : 'bg-gray-400'}
                    `}>
                      {state.available ? 'Active' : 'Soon'}
                    </span>

                    <div className="text-xl mb-1">{state.flag}</div>
                    <div className={`text-base font-bold leading-tight ${isSel ? 'text-ocean-dark' : 'text-gray-700'}`}>
                      {state.abbreviation}
                    </div>
                    <div className={`text-[11px] mt-0.5 ${isSel ? 'text-ocean-blue font-semibold' : 'text-gray-400'}`}>
                      {state.name}
                    </div>

                    {isSel && (
                      <div className="mt-1.5 flex justify-center">
                        <FiCheckCircle className="text-ocean-blue text-sm" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected state info bar */}
            {selectedMeta && (
              <div className={`
                rounded-xl px-4 py-3 flex items-center gap-3 text-sm border
                ${selectedMeta.available
                  ? 'bg-ocean-light border-ocean-blue'
                  : 'bg-gray-50 border-gray-200'}
              `}>
                <span className="text-2xl">{selectedMeta.flag}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ocean-dark truncate">
                    {selectedMeta.name} Format
                    {selectedMeta.available && <span className="ml-2 text-green-600 text-xs font-normal">● Available</span>}
                  </p>
                  <p className="text-gray-500 text-xs mt-0.5 truncate">
                    {selectedMeta.available ? `Output file: ${fileName}` : selectedMeta.description}
                  </p>
                </div>
              </div>
            )}

            {/* Error message */}
            {status === 'error' && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                <FiAlertCircle className="flex-shrink-0" />
                {errorMsg}
              </div>
            )}

            {/* Action row */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <button
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-300 hover:border-gray-400 rounded-xl transition-colors"
              >
                Cancel
              </button>

              {selectedMeta?.available ? (
                <button
                  onClick={handleDownload}
                  disabled={status === 'loading' || status === 'done'}
                  className={`
                    flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md
                    ${status === 'done'
                      ? 'bg-green-500 text-white cursor-default'
                      : status === 'loading'
                        ? 'bg-ocean-blue text-white opacity-80 cursor-wait'
                        : 'bg-ocean-dark hover:bg-ocean-blue text-white hover:shadow-lg'
                    }
                  `}
                >
                  {status === 'loading' && (
                    <svg className="animate-spin h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                  )}
                  {status === 'done' && <FiCheckCircle className="text-base flex-shrink-0" />}
                  {status === 'idle' && <FiDownload className="text-base flex-shrink-0" />}
                  {status === 'loading' ? 'Building DOCX…' : status === 'done' ? 'Downloaded!' : `Download ${selectedMeta.name} Format`}
                </button>
              ) : (
                <div className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-400 rounded-xl text-sm font-medium">
                  <FiClock />
                  {selectedMeta?.name} Coming Soon
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
