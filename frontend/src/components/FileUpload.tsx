import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface FileUploadProps {
  onUpload: (file: File) => void;
  isLoading: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUpload, isLoading }) => {
  const [error, setError] = useState<string | null>(null);

  // TODO: Implement the file upload component
  // The component should:
  // 1. Accept file drops and clicks
  // 2. Validate files (e.g., file type, size)
  // 3. Show drag/drop visual feedback
  // 4. Display errors if any
  // 5. Call onUpload when a valid file is selected

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setError(null);

      // Validate files
      if (acceptedFiles.length === 0) {
        return;
      }

      const file = acceptedFiles[0];

      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size exceeds 10MB limit');
        return;
      }

      // Check file type (PDF, DOCX, TXT)
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
      ];

      if (!allowedTypes.includes(file.type)) {
        setError(
          'Unsupported file type. Please upload PDF, DOCX, or TXT files.'
        );
        return;
      }

      // Call the onUpload callback
      onUpload(file);
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        ['.docx'],
      'text/plain': ['.txt'],
    },
    disabled: isLoading,
    multiple: false,
  });

  return (
    <div className="w-full max-w-lg mx-auto">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-primary-400'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center justify-center space-y-4">
          <svg
            className={`w-12 h-12 ${
              isDragActive ? 'text-primary-500' : 'text-gray-400'
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>

          <div className="space-y-1">
            <p className="text-lg font-medium text-gray-700">
              {isDragActive
                ? 'Drop the file here'
                : 'Drag and drop your document'}
            </p>
            <p className="text-sm text-gray-500">
              {isLoading
                ? 'Processing...'
                : 'Supported formats: PDF, DOCX, TXT (max 10MB)'}
            </p>
            {!isLoading && (
              <p className="text-sm font-medium text-primary-600 mt-2">
                or <span className="underline">browse files</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-3 text-sm text-red-500 text-center">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
