'use client';

import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUploadCloud, FiFile, FiAlertCircle } from 'react-icons/fi';

interface ResumeUploaderProps {
  onUpload: (file: File) => void;
  isLoading?: boolean;
  error?: string | null;
}

const MAX_MB = 10;
const ACCEPTED_TYPES = { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] };

export default function ResumeUploader({ onUpload, isLoading = false, error }: ResumeUploaderProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) onUpload(acceptedFiles[0]);
    },
    [onUpload],
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxFiles: 1,
    maxSize: MAX_MB * 1024 * 1024,
    disabled: isLoading,
  });

  const rejectionError = fileRejections[0]?.errors[0]?.message;
  const displayError = error ?? rejectionError;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200
          ${isDragActive ? 'border-ocean-blue bg-ocean-light scale-[1.01]' : 'border-gray-300 hover:border-ocean-blue hover:bg-gray-50'}
          ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}
          ${displayError ? 'border-red-400 bg-red-50' : ''}
        `}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center space-y-4">
          {displayError ? (
            <FiAlertCircle className="w-14 h-14 text-red-400" />
          ) : (
            <FiUploadCloud
              className={`w-14 h-14 transition-colors ${isDragActive ? 'text-ocean-blue' : 'text-gray-400'}`}
            />
          )}

          {displayError ? (
            <div>
              <p className="text-lg font-semibold text-red-600">Upload failed</p>
              <p className="text-sm text-red-500 mt-1">{displayError}</p>
            </div>
          ) : isDragActive ? (
            <p className="text-lg font-semibold text-ocean-blue">Drop your resume here</p>
          ) : (
            <div>
              <p className="text-lg font-semibold text-gray-700">
                Drag &amp; drop your resume, or <span className="text-ocean-blue underline">browse</span>
              </p>
              <p className="text-sm text-gray-500 mt-2">Supports PDF and DOCX — max {MAX_MB} MB</p>
            </div>
          )}

          <div className="flex items-center space-x-4 mt-2">
            {['PDF', 'DOCX'].map(type => (
              <div key={type} className="flex items-center space-x-1 bg-gray-100 rounded-lg px-3 py-1">
                <FiFile className="text-gray-500 text-sm" />
                <span className="text-xs font-medium text-gray-600">{type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
