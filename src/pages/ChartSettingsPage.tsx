import React from 'react';
import { PieChart, BarChart3, TrendingUp, Type, Hash } from 'lucide-react';
import { DataFile } from '../types';

interface ChartSettingsPageProps {
  activeFile: DataFile | null;
  onChartSettingsChange: (chartSettings: DataFile['chartSettings']) => void;
}

export const ChartSettingsPage: React.FC<ChartSettingsPageProps> = ({
  activeFile,
  onChartSettingsChange,
}) => {
  const columns = activeFile?.columns || [];
  const chartSettings = activeFile?.chartSettings || { type: 'bar', xAxisColumn: '', yAxisColumn: '', title: '' };

  const chartTypes = [
    { value: 'bar', label: 'Bar Chart', icon: BarChart3, color: 'blue' },
    { value: 'pie', label: 'Pie Chart', icon: PieChart, color: 'purple' },
    { value: 'line', label: 'Line Chart', icon: TrendingUp, color: 'green' },
  ] as const;

  const numberColumns = columns.filter(c => c.type === 'number');
  const allColumns = columns;

  if (!activeFile) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <PieChart className="w-6 h-6 text-purple-600" />
            </div>
            Chart Settings
          </h1>
        </div>
        <div className="card text-center py-16">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <PieChart className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No file selected</h3>
          <p className="text-gray-500 mt-2">Please select a file from the Files page to configure chart settings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
            <PieChart className="w-6 h-6 text-purple-600" />
          </div>
          Chart Settings
        </h1>
        <p className="text-gray-600 mt-2">Configure charts for: <span className="font-medium text-purple-600">{activeFile.name}</span></p>
      </div>

      <div className="grid gap-6">
        {/* Chart Type */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Chart Type</h2>
              <p className="text-sm text-gray-500">Choose the type of chart to display</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {chartTypes.map(({ value, label, icon: Icon, color }) => (
              <label
                key={value}
                className={`
                  flex flex-col items-center gap-3 p-6 rounded-xl border-2 cursor-pointer transition-all
                  ${chartSettings.type === value
                    ? `border-${color}-500 bg-${color}-50`
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                  }
                `}
              >
                <input
                  type="radio"
                  name="chartType"
                  value={value}
                  checked={chartSettings.type === value}
                  onChange={(e) => onChartSettingsChange({ ...chartSettings, type: e.target.value as typeof chartSettings.type })}
                  className="sr-only"
                />
                <Icon className={`w-8 h-8 ${chartSettings.type === value ? `text-${color}-600` : 'text-gray-400'}`} />
                <span className={`font-medium ${chartSettings.type === value ? `text-${color}-700` : 'text-gray-600'}`}>
                  {label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Chart Title */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center">
              <Type className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Chart Title</h2>
              <p className="text-sm text-gray-500">Give your chart a meaningful title</p>
            </div>
          </div>
          <input
            type="text"
            value={chartSettings.title}
            onChange={(e) => onChartSettingsChange({ ...chartSettings, title: e.target.value })}
            placeholder="e.g., Sales by Region, Monthly Revenue"
            className="input max-w-md"
          />
        </div>

        {/* Axis Configuration */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* X-Axis */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                <Hash className="w-5 h-5 text-cyan-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">X-Axis (Categories)</h2>
                <p className="text-sm text-gray-500">Column for chart categories/labels</p>
              </div>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {allColumns.map((col) => (
                <label
                  key={col.name}
                  className={`
                    flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all
                    ${chartSettings.xAxisColumn === col.name
                      ? 'border-cyan-500 bg-cyan-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="xAxis"
                    checked={chartSettings.xAxisColumn === col.name}
                    onChange={() => onChartSettingsChange({ ...chartSettings, xAxisColumn: col.name })}
                    className="w-5 h-5 text-cyan-600"
                  />
                  <span className="text-sm font-medium text-gray-700">{col.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Y-Axis */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center">
                <Hash className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Y-Axis (Values)</h2>
                <p className="text-sm text-gray-500">Numeric column for chart values</p>
              </div>
            </div>
            {numberColumns.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {numberColumns.map((col) => (
                  <label
                    key={col.name}
                    className={`
                      flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all
                      ${chartSettings.yAxisColumn === col.name
                        ? 'border-rose-500 bg-rose-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="yAxis"
                      checked={chartSettings.yAxisColumn === col.name}
                      onChange={() => onChartSettingsChange({ ...chartSettings, yAxisColumn: col.name })}
                      className="w-5 h-5 text-rose-600"
                    />
                    <span className="text-sm font-medium text-gray-700">{col.name}</span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No numeric columns available for Y-axis</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};