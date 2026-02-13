import React, { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { DataRow, ColumnConfig, DataFile, Settings, ChartSettings } from '../types';
import { FileSpreadsheet, Check, FilePlus, X } from 'lucide-react';

interface ExcelUploaderProps {
  onFilesLoaded: (files: DataFile[]) => void;
  existingFiles: DataFile[];
}

export const ExcelUploader: React.FC<ExcelUploaderProps> = ({ onFilesLoaded, existingFiles }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<{ name: string; status: 'uploading' | 'done' | 'error'; error?: string }[]>([]);

  const processFile = useCallback((file: File): Promise<DataFile> => {
    return new Promise((resolve, reject) => {
      const validExtensions = ['.xlsx', '.xls', '.csv'];
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      
      if (!validExtensions.includes(fileExtension)) {
        reject(new Error('Invalid file format. Please upload Excel or CSV files only.'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][];

          if (jsonData.length < 2) {
            reject(new Error('File appears to be empty or invalid'));
            return;
          }

          const headers = jsonData[0] as string[];
          const rows = jsonData.slice(1);

          const columns: ColumnConfig[] = headers.map((header, index) => {
            const sampleValues = rows.slice(0, 10).map(row => row[index]);
            const isNumeric = sampleValues.every(v => v === undefined || v === null || v === '' || !isNaN(Number(v)));
            return {
              name: header || `Column ${index + 1}`,
              type: isNumeric ? 'number' : 'text'
            };
          });

          const dataRows: DataRow[] = rows.map(row => {
            const obj: DataRow = {};
            headers.forEach((header, index) => {
              const colName = header || `Column ${index + 1}`;
              const value = row[index];
              obj[colName] = value === undefined || value === null ? null : value;
            });
            return obj;
          }).filter(row => Object.values(row).some(v => v !== null));

          const textColumns = columns.filter(c => c.type === 'text').map(c => c.name);
          const numberColumns = columns.filter(c => c.type === 'number').map(c => c.name);
          const allColumnNames = columns.map(c => c.name);

          const defaultSettings: Settings = {
            filterColumns: textColumns.slice(0, 2),
            groupByColumn: textColumns[0] || '',
            sumColumns: numberColumns.slice(0, 1),
            displayColumns: allColumnNames,
          };

          const defaultChartSettings: ChartSettings = {
            type: 'bar',
            xAxisColumn: textColumns[0] || '',
            yAxisColumn: numberColumns[0] || '',
            title: `${numberColumns[0] || 'Value'} by ${textColumns[0] || 'Category'}`,
          };

          const dataFile: DataFile = {
            id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: file.name,
            data: dataRows,
            columns,
            uploadedAt: new Date(),
            settings: defaultSettings,
            chartSettings: defaultChartSettings,
          };

          resolve(dataFile);
        } catch (err) {
          reject(new Error('Error parsing file. Please check the file format.'));
        }
      };
      reader.onerror = () => reject(new Error('Error reading file'));
      reader.readAsBinaryString(file);
    });
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    setUploadingFiles(files.map(f => ({ name: f.name, status: 'uploading' as const })));

    const newFiles: DataFile[] = [];
    const updatedUploading: { name: string; status: 'uploading' | 'done' | 'error'; error?: string }[] = 
      [...files.map(f => ({ name: f.name, status: 'uploading' as const }))];

    for (let i = 0; i < files.length; i++) {
      try {
        const dataFile = await processFile(files[i]);
        newFiles.push(dataFile);
        updatedUploading[i].status = 'done';
      } catch (error) {
        updatedUploading[i].status = 'error';
        updatedUploading[i].error = error instanceof Error ? error.message : 'Unknown error';
      }
      setUploadingFiles([...updatedUploading]);
    }

    if (newFiles.length > 0) {
      onFilesLoaded([...existingFiles, ...newFiles]);
    }

    // Clear uploading status after 3 seconds
    setTimeout(() => setUploadingFiles([]), 3000);
  }, [existingFiles, onFilesLoaded, processFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingFiles(files.map(f => ({ name: f.name, status: 'uploading' as const })));

    const newFiles: DataFile[] = [];
    const updatedUploading: { name: string; status: 'uploading' | 'done' | 'error'; error?: string }[] = 
      [...files.map(f => ({ name: f.name, status: 'uploading' as const }))];

    for (let i = 0; i < files.length; i++) {
      try {
        const dataFile = await processFile(files[i]);
        newFiles.push(dataFile);
        updatedUploading[i].status = 'done';
      } catch (error) {
        updatedUploading[i].status = 'error';
        updatedUploading[i].error = error instanceof Error ? error.message : 'Unknown error';
      }
      setUploadingFiles([...updatedUploading]);
    }

    if (newFiles.length > 0) {
      onFilesLoaded([...existingFiles, ...newFiles]);
    }

    setTimeout(() => setUploadingFiles([]), 3000);
  }, [existingFiles, onFilesLoaded, processFile]);

  return (
    <div className="w-full">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 cursor-pointer
          ${isDragging 
            ? 'border-primary-500 bg-primary-50 scale-[1.02]' 
            : 'border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50'
          }
        `}
      >
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          multiple
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
            <FilePlus className="w-8 h-8 text-primary-600" />
          </div>
          <div>
            <p className="text-lg font-medium text-gray-900">Drop multiple Excel files here</p>
            <p className="text-sm text-gray-500 mt-1">or click to browse</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400 mt-2">
            <FileSpreadsheet className="w-4 h-4" />
            <span>Supports .xlsx, .xls, .csv · Upload multiple files at once</span>
          </div>
        </div>
      </div>

      {uploadingFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          {uploadingFiles.map((file, idx) => (
            <div key={idx} className={`p-3 rounded-lg flex items-center gap-3 ${
              file.status === 'done' ? 'bg-green-50 text-green-700' :
              file.status === 'error' ? 'bg-red-50 text-red-700' :
              'bg-blue-50 text-blue-700'
            }`}>
              {file.status === 'done' && <Check className="w-5 h-5" />}
              {file.status === 'error' && <X className="w-5 h-5" />}
              {file.status === 'uploading' && <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />}
              <span className="text-sm font-medium">{file.name}</span>
              {file.error && <span className="text-xs ml-auto">{file.error}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};