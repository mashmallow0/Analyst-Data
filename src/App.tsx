import { useState, useCallback, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { DashboardPage } from './pages/DashboardPage';
import { SettingsPage } from './pages/SettingsPage';
import { ChartSettingsPage } from './pages/ChartSettingsPage';
import { FileManagerPage } from './pages/FileManagerPage';
import { LoginPage } from './pages/LoginPage';
import { DataFile } from './types';

// Check if user is authenticated
const isAuthenticated = (): boolean => {
  const auth = localStorage.getItem('analyst-data-auth');
  if (!auth) return false;
  try {
    const authData = JSON.parse(auth);
    return authData.isAuthenticated === true;
  } catch {
    return false;
  }
};

// Protected Route wrapper component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
};

function App() {
  const [files, setFiles] = useState<DataFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState<boolean>(isAuthenticated());

  // Check auth status on mount and when localStorage changes
  useEffect(() => {
    const checkAuth = () => {
      setAuthenticated(isAuthenticated());
    };
    
    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const handleLogin = useCallback(() => {
    setAuthenticated(true);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('analyst-data-auth');
    setAuthenticated(false);
    setFiles([]);
    setActiveFileId(null);
  }, []);

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
      {authenticated && <Header onLogout={handleLogout} />}
      <main>
        <Routes>
          <Route
            path="/login"
            element={
              authenticated ? (
                <Navigate to="/" replace />
              ) : (
                <LoginPage onLogin={handleLogin} />
              )
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardPage
                  files={files}
                  activeFile={activeFile}
                  onFilesAdd={handleFilesAdd}
                  onClearAll={handleClearAll}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/files"
            element={
              <ProtectedRoute>
                <FileManagerPage
                  files={files}
                  activeFileId={activeFileId}
                  onFileSelect={handleFileSelect}
                  onFileDelete={handleFileDelete}
                  onFilesAdd={handleFilesAdd}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage
                  activeFile={activeFile}
                  onSettingsChange={(settings) => 
                    activeFile && handleUpdateFileSettings(activeFile.id, settings)
                  }
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chart-settings"
            element={
              <ProtectedRoute>
                <ChartSettingsPage
                  activeFile={activeFile}
                  onChartSettingsChange={(chartSettings) => 
                    activeFile && handleUpdateFileChartSettings(activeFile.id, chartSettings)
                  }
                />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
