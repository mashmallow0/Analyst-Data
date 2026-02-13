import React from 'react';
import { FolderOpen, Trash2, FileSpreadsheet, Calendar, Database, Check, AlertCircle } from 'lucide-react';
import { DataFile } from '../types';

interface FileManagerPageProps {
  files: DataFile[];
  activeFileId: string | null;
  onFileSelect: (fileId: string) => void;
  onFileDelete: (fileId: string) => void;
  onFilesAdd: (files: DataFile[]) => void;
}

export const FileManagerPage: React.FC<FileManagerPageProps> = ({
  files,
  activeFileId,
  onFileSelect,
  onFileDelete,
}) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
            <FolderOpen className="w-6 h-6 text-primary-600" />
          </div>
          File Manager
        </h1>
        <p className="text-gray-600 mt-2">Manage your uploaded data files</p>
      </div>

      {files.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <FileSpreadsheet className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No files uploaded yet</h3>
          <p className="text-gray-500 mt-2">Go to the Dashboard to upload your first Excel file</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">{files.length} file{files.length !== 1 ? 's' : ''} uploaded</p>
          </div>

          {files.map((file) => (
            <div
              key={file.id}
              className={`
                card p-4 transition-all cursor-pointer
                ${activeFileId === file.id 
                  ? 'ring-2 ring-primary-500 bg-primary-50/50' 
                  : 'hover:shadow-md'
                }
              `}
              onClick={() => onFileSelect(file.id)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                  <FileSpreadsheet className="w-6 h-6 text-green-600" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-gray-900 truncate">{file.name}</h3>
                    {activeFileId === file.id && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-100 text-primary-700 text-xs font-medium">
                        <Check className="w-3 h-3" />
                        Active
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Database className="w-4 h-4" />
                      {formatNumber(file.data.length)} rows
                    </span>
                    <span className="flex items-center gap-1">
                      <FileSpreadsheet className="w-4 h-4" />
                      {file.columns.length} columns
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(file.uploadedAt)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Delete "${file.name}"? This action cannot be undone.`)) {
                      onFileDelete(file.id);
                    }
                  }}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete file"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900">💡 Tip: Switch between files</p>
            <p className="text-sm text-blue-700 mt-1">
              Click on any file to make it active. The Dashboard will show data from the active file. 
              You can upload multiple files from different sources and switch between them anytime.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};