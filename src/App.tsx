import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { DashboardPage } from './pages/DashboardPage';
import { SettingsPage } from './pages/SettingsPage';
import { ChartSettingsPage } from './pages/ChartSettingsPage';
import { DataRow, ColumnConfig, Settings, ChartSettings } from './types';

function App() {
  const [data, setData] = useState<DataRow[]>([]);
  const [columns, setColumns] = useState<ColumnConfig[]>([]);
  
  const [settings, setSettings] = useState<Settings>({
    filterColumns: [],
    groupByColumn: '',
    sumColumns: [],
    displayColumns: [],
  });

  const [chartSettings, setChartSettings] = useState<ChartSettings>({
    type: 'bar',
    xAxisColumn: '',
    yAxisColumn: '',
    title: 'Data Analysis',
  });

  const handleDataLoaded = (newData: DataRow[], newColumns: ColumnConfig[]) => {
    setData(newData);
    setColumns(newColumns);
    
    // Auto-configure settings based on data
    const textColumns = newColumns.filter(c => c.type === 'text').map(c => c.name);
    const numberColumns = newColumns.filter(c => c.type === 'number').map(c => c.name);
    const allColumnNames = newColumns.map(c => c.name);

    setSettings({
      filterColumns: textColumns.slice(0, 2),
      groupByColumn: textColumns[0] || '',
      sumColumns: numberColumns.slice(0, 1),
      displayColumns: allColumnNames,
    });

    setChartSettings({
      type: 'bar',
      xAxisColumn: textColumns[0] || '',
      yAxisColumn: numberColumns[0] || '',
      title: `${numberColumns[0] || 'Value'} by ${textColumns[0] || 'Category'}`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <Routes>
          <Route
            path="/"
            element={
              <DashboardPage
                data={data}
                columns={columns}
                settings={settings}
                chartSettings={chartSettings}
                onDataLoaded={handleDataLoaded}
              />
            }
          />
          <Route
            path="/settings"
            element={
              <SettingsPage
                columns={columns}
                settings={settings}
                onSettingsChange={setSettings}
              />
            }
          />
          <Route
            path="/chart-settings"
            element={
              <ChartSettingsPage
                columns={columns}
                chartSettings={chartSettings}
                onChartSettingsChange={setChartSettings}
              />
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;