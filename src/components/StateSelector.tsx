'use client';

import React, { useState } from 'react';
import { FiDownload, FiCheckCircle } from 'react-icons/fi';
import { STATE_REGISTRY, downloadStateDocx } from '@/formatters/registry';
import type { ResumeData } from '@/lib/types';

interface StateSelectorProps {
  resumeData: ResumeData;
}

export default function StateSelector({ resumeData }: StateSelectorProps) {
  const [selected, setSelected] = useState('ohio');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  const handleDownload = async () => {
    setStatus('loading');
    try {
      await downloadStateDocx(selected, resumeData);
      setStatus('done');
      setTimeout(() => setStatus('idle'), 2000);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2500);
    }
  };

  const selectedMeta = STATE_REGISTRY.find(s => s.id === selected);

  return (
    <div className="bg-white rounded-2xl border-2 border-ocean-blue shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-ocean-dark to-ocean-blue px-6 py-4">
        <h3 className="text-white font-bold text-lg tracking-tight">Select State Format &amp; Download</h3>
        <p className="text-blue-200 text-sm mt-0.5">
          Choose the state-specific resume format, then export as Word (.docx)
        </p>
      </div>

      <div className="p-6">
        {/* State cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-6">
          {STATE_REGISTRY.map(state => {
            const isSel = selected === state.id;
            return (
              <button
                key={state.id}
                onClick={() => state.available && setSelected(state.id)}
                disabled={!state.available}
                className={`
                  relative rounded-xl p-4 text-center border-2 transition-all duration-150 select-none
                  ${isSel
                    ? 'border-ocean-blue bg-ocean-light shadow-md scale-[1.03]'
                    : state.available
                      ? 'border-gray-200 hover:border-ocean-blue hover:bg-blue-50 cursor-pointer'
                      : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-55'
                  }
                `}
              >
                <span className={`
                  absolute -top-2 -right-2 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full
                  ${state.available ? 'bg-green-500' : 'bg-gray-400'}
                `}>
                  {state.available ? 'Active' : 'Soon'}
                </span>

                <div className="text-2xl mb-1">{state.flag}</div>
                <div className={`text-lg font-bold ${isSel ? 'text-ocean-dark' : 'text-gray-700'}`}>
                  {state.abbreviation}
                </div>
                <div className={`text-xs mt-0.5 font-medium ${isSel ? 'text-ocean-blue' : 'text-gray-400'}`}>
                  {state.name}
                </div>
                <div className="text-[10px] text-gray-400 mt-1 leading-tight">{state.description}</div>

                {isSel && (
                  <div className="mt-2 flex justify-center">
                    <FiCheckCircle className="text-ocean-blue" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Download bar */}
        <div className={`
          flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4
          p-4 rounded-xl border transition-colors
          ${selectedMeta?.available
            ? 'bg-gradient-to-r from-ocean-light to-blue-50 border-ocean-blue'
            : 'bg-gray-50 border-gray-200'}
        `}>
          <div>
            <p className="font-semibold text-ocean-dark text-sm">
              {selectedMeta?.available
                ? `Ready: ${selectedMeta.name} format`
                : `${selectedMeta?.name ?? 'Selected state'} is coming soon`}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {selectedMeta?.available
                ? `${resumeData.name || 'Resume'}_${selectedMeta.abbreviation}.docx`
                : 'This format is under development.'}
            </p>
          </div>

          {selectedMeta?.available ? (
            <button
              onClick={handleDownload}
              disabled={status === 'loading'}
              className={`
                flex items-center gap-2 px-6 py-3 font-semibold rounded-xl transition-all shadow-md whitespace-nowrap text-sm
                ${status === 'done'
                  ? 'bg-green-500 text-white cursor-default'
                  : status === 'loading'
                    ? 'bg-ocean-blue text-white opacity-80 cursor-wait'
                    : status === 'error'
                      ? 'bg-red-500 text-white'
                      : 'bg-ocean-dark hover:bg-ocean-blue text-white hover:shadow-lg'
                }
              `}
            >
              {status === 'loading' ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : status === 'done' ? (
                <FiCheckCircle />
              ) : (
                <FiDownload />
              )}
              {status === 'loading' ? 'Building…'
                : status === 'done' ? 'Downloaded!'
                : status === 'error' ? 'Retry'
                : `Download ${selectedMeta.name} Format`}
            </button>
          ) : (
            <div className="flex items-center gap-2 px-5 py-3 bg-gray-200 text-gray-500 rounded-xl text-sm font-medium">
              Coming Soon
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
