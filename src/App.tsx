import { useState, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { DashboardPage } from './pages/DashboardPage';
import { SettingsPage } from './pages/SettingsPage';
import { ChartSettingsPage } from './pages/ChartSettingsPage';
import { FileManagerPage } from './pages/FileManagerPage';
import { DataFile } from './types';

function App() {
  const [files, setFiles] = useState<DataFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);

  const activeFile = files.find(f => f.id === activeFileId) || null;

  const handleFilesAdd = useCallback((newFiles: DataFile[]) => {
    setFiles(prev => [...prev, ...newFiles]);
    // Set the first new file as active if no active file
    if (!activeFileId && newFiles.length > 0) {
      setActiveFileId(newFiles[0].id);
    }
  }, [activeFileId]);

  const handleFileSelect = useCallback((fileId: string) => {
    setActiveFileId(fileId);
  }, []);

  const handleFileDelete = useCallback((fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    if (activeFileId === fileId) {
      const remaining = files.filter(f => f.id !== fileId);
      setActiveFileId(remaining.length > 0 ? remaining[0].id : null);
    }
  }, [activeFileId, files]);

  const handleUpdateFileSettings = useCallback((fileId: string, settings: any) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, settings } : f
    ));
  }, []);

  const handleUpdateFileChartSettings = useCallback((fileId: string, chartSettings: any) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, chartSettings } : f
    ));
  }, []);

  const handleClearAll = useCallback(() => {
    if (confirm('Clear all files? This cannot be undone.')) {
      setFiles([]);
      setActiveFileId(null);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <Routes>
          <Route
            path="/"
            element={
              <DashboardPage
                files={files}
                activeFile={activeFile}
                onFilesAdd={handleFilesAdd}
                onClearAll={handleClearAll}
              />
            }
          />
          <Route
            path="/files"
            element={
              <FileManagerPage
                files={files}
                activeFileId={activeFileId}
                onFileSelect={handleFileSelect}
                onFileDelete={handleFileDelete}
                onFilesAdd={handleFilesAdd}
              />
            }
          />
          <Route
            path="/settings"
            element={
              <SettingsPage
                activeFile={activeFile}
                onSettingsChange={(settings) => 
                  activeFile && handleUpdateFileSettings(activeFile.id, settings)
                }
              />
            }
          />
          <Route
            path="/chart-settings"
            element={
              <ChartSettingsPage
                activeFile={activeFile}
                onChartSettingsChange={(chartSettings) => 
                  activeFile && handleUpdateFileChartSettings(activeFile.id, chartSettings)
                }
              />
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;