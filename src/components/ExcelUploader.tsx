import React, { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { DataRow, ColumnConfig } from '../types';
import { Upload, FileSpreadsheet, Check, AlertCircle } from 'lucide-react';

interface ExcelUploaderProps {
  onDataLoaded: (data: DataRow[], columns: ColumnConfig[]) => void;
}

export const ExcelUploader: React.FC<ExcelUploaderProps> = ({ onDataLoaded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string>('');

  const processFile = useCallback((file: File) => {
    setError('');
    
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
      setError('Please upload an Excel file (.xlsx, .xls) or CSV file');
      return;
    }

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][];

        if (jsonData.length < 2) {
          setError('File appears to be empty or invalid');
          return;
        }

        const headers = jsonData[0] as string[];
        const rows = jsonData.slice(1);

        // Detect column types
        const columns: ColumnConfig[] = headers.map((header, index) => {
          const sampleValues = rows.slice(0, 10).map(row => row[index]);
          const isNumeric = sampleValues.every(v => v === undefined || v === null || v === '' || !isNaN(Number(v)));
          return {
            name: header || `Column ${index + 1}`,
            type: isNumeric ? 'number' : 'text'
          };
        });

        // Convert to DataRow format
        const dataRows: DataRow[] = rows.map(row => {
          const obj: DataRow = {};
          headers.forEach((header, index) => {
            const colName = header || `Column ${index + 1}`;
            const value = row[index];
            obj[colName] = value === undefined || value === null ? null : value;
          });
          return obj;
        }).filter(row => Object.values(row).some(v => v !== null));

        onDataLoaded(dataRows, columns);
      } catch (err) {
        setError('Error parsing file. Please check the file format.');
        console.error(err);
      }
    };
    reader.readAsBinaryString(file);
  }, [onDataLoaded]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

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
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="flex flex-col items-center gap-4">
          {fileName ? (
            <>
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900">{fileName}</p>
                <p className="text-sm text-gray-500">Click or drag to replace</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                <Upload className="w-8 h-8 text-primary-600" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900">Drop your Excel file here</p>
                <p className="text-sm text-gray-500 mt-1">or click to browse</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400 mt-2">
                <FileSpreadsheet className="w-4 h-4" />
                <span>Supports .xlsx, .xls, .csv</span>
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};