'use client';

import React, { useState } from 'react';
import { FiDownload, FiClock, FiCheckCircle } from 'react-icons/fi';

interface StateOption {
  id: string;
  label: string;
  fullName: string;
  available: boolean;
  flag: string;
  description: string;
}

const STATES: StateOption[] = [
  {
    id: 'ohio',
    label: 'OH',
    fullName: 'Ohio',
    available: true,
    flag: '🏛',
    description: 'VectorVMS · 6-col education table',
  },
  {
    id: 'california',
    label: 'CA',
    fullName: 'California',
    available: false,
    flag: '🌴',
    description: 'Coming soon',
  },
  {
    id: 'texas',
    label: 'TX',
    fullName: 'Texas',
    available: false,
    flag: '⭐',
    description: 'Coming soon',
  },
  {
    id: 'new-york',
    label: 'NY',
    fullName: 'New York',
    available: false,
    flag: '🗽',
    description: 'Coming soon',
  },
  {
    id: 'illinois',
    label: 'IL',
    fullName: 'Illinois',
    available: false,
    flag: '🌆',
    description: 'Coming soon',
  },
];

interface StateSelectorProps {
  candidateName?: string;
}

export default function StateSelector({ candidateName }: StateSelectorProps) {
  const [selected, setSelected] = useState<string>('ohio');
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = () => {
    if (selected !== 'ohio') return;
    setIsDownloading(true);
    // Dispatch the event that GeneratedResume listens to
    window.dispatchEvent(new Event('triggerResumeDownload'));
    // Reset after a short delay (actual generation is async inside GeneratedResume)
    setTimeout(() => setIsDownloading(false), 3500);
  };

  const selectedState = STATES.find(s => s.id === selected);

  return (
    <div className="bg-white rounded-2xl border-2 border-ocean-blue shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-ocean-dark to-ocean-blue px-6 py-4">
        <h3 className="text-white font-bold text-lg tracking-tight">Select State Format &amp; Download</h3>
        <p className="text-blue-200 text-sm mt-0.5">
          Choose the state-specific resume format, then download as Word (.docx)
        </p>
      </div>

      {/* State cards */}
      <div className="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-6">
          {STATES.map(state => {
            const isSelected = selected === state.id;
            return (
              <button
                key={state.id}
                onClick={() => state.available && setSelected(state.id)}
                disabled={!state.available}
                className={`
                  relative rounded-xl p-4 text-center border-2 transition-all duration-150
                  ${isSelected
                    ? 'border-ocean-blue bg-ocean-light shadow-md scale-[1.03]'
                    : state.available
                      ? 'border-gray-200 hover:border-ocean-blue hover:bg-blue-50 cursor-pointer'
                      : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
                  }
                `}
              >
                {/* Available badge */}
                {state.available && (
                  <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    Active
                  </span>
                )}
                {!state.available && (
                  <span className="absolute -top-2 -right-2 bg-gray-400 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    Soon
                  </span>
                )}

                <div className="text-2xl mb-1">{state.flag}</div>
                <div className={`text-lg font-bold ${isSelected ? 'text-ocean-dark' : 'text-gray-700'}`}>
                  {state.label}
                </div>
                <div className={`text-xs font-medium ${isSelected ? 'text-ocean-blue' : 'text-gray-500'}`}>
                  {state.fullName}
                </div>
                <div className="text-[10px] text-gray-400 mt-1 leading-tight">{state.description}</div>

                {isSelected && (
                  <div className="mt-2 flex justify-center">
                    <FiCheckCircle className="text-ocean-blue text-base" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Download bar */}
        <div className={`
          flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4
          p-4 rounded-xl border
          ${selectedState?.available
            ? 'bg-gradient-to-r from-ocean-light to-blue-50 border-ocean-blue'
            : 'bg-gray-50 border-gray-200'
          }
        `}>
          <div>
            <p className="font-semibold text-ocean-dark text-sm">
              {selectedState?.available
                ? `Ready to download: ${selectedState.fullName} format`
                : `${selectedState?.fullName ?? 'Selected state'} format is coming soon`
              }
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {selectedState?.available
                ? `File: ${candidateName ? `${candidateName}.docx` : 'Resume.docx'} — Ohio VectorVMS standard`
                : 'This state format is under development. Check back later.'
              }
            </p>
          </div>

          {selectedState?.available ? (
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex items-center gap-2 px-6 py-3 bg-ocean-dark hover:bg-ocean-blue disabled:opacity-60 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg whitespace-nowrap"
            >
              {isDownloading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Building DOCX…
                </>
              ) : (
                <>
                  <FiDownload className="text-lg" />
                  Download {selectedState.fullName} Format
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-2 px-5 py-3 bg-gray-200 text-gray-500 font-medium rounded-xl text-sm whitespace-nowrap">
              <FiClock />
              Coming Soon
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
