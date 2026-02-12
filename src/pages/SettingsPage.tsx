import React from 'react';
import { Settings, Filter, Group, Calculator, Eye } from 'lucide-react';
import { ColumnConfig, Settings as SettingsType } from '../types';

interface SettingsPageProps {
  columns: ColumnConfig[];
  settings: SettingsType;
  onSettingsChange: (settings: SettingsType) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  columns,
  settings,
  onSettingsChange,
}) => {
  const toggleFilterColumn = (columnName: string) => {
    const newFilterColumns = settings.filterColumns.includes(columnName)
      ? settings.filterColumns.filter(c => c !== columnName)
      : [...settings.filterColumns, columnName];
    onSettingsChange({ ...settings, filterColumns: newFilterColumns });
  };

  const toggleSumColumn = (columnName: string) => {
    const newSumColumns = settings.sumColumns.includes(columnName)
      ? settings.sumColumns.filter(c => c !== columnName)
      : [...settings.sumColumns, columnName];
    onSettingsChange({ ...settings, sumColumns: newSumColumns });
  };

  const toggleDisplayColumn = (columnName: string) => {
    const newDisplayColumns = settings.displayColumns.includes(columnName)
      ? settings.displayColumns.filter(c => c !== columnName)
      : [...settings.displayColumns, columnName];
    onSettingsChange({ ...settings, displayColumns: newDisplayColumns });
  };

  const numberColumns = columns.filter(c => c.type === 'number');

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
            <Settings className="w-6 h-6 text-primary-600" />
          </div>
          Settings
        </h1>
        <p className="text-gray-600 mt-2">Configure how your data is analyzed and displayed</p>
      </div>

      {columns.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Settings className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No data loaded</h3>
          <p className="text-gray-500 mt-2">Please upload an Excel file first to configure settings</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {/* Filter Columns */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Filter className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Filter Columns</h2>
                <p className="text-sm text-gray-500">Select columns that can be used for filtering data</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {columns.map((col) => (
                <label
                  key={col.name}
                  className={`
                    flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all
                    ${settings.filterColumns.includes(col.name)
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    checked={settings.filterColumns.includes(col.name)}
                    onChange={() => toggleFilterColumn(col.name)}
                    className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">{col.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Group By Column */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Group className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Group By Column</h2>
                <p className="text-sm text-gray-500">Select the column to group data by (e.g., person name, category)</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {columns.map((col) => (
                <label
                  key={col.name}
                  className={`
                    flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all
                    ${settings.groupByColumn === col.name
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="groupBy"
                    checked={settings.groupByColumn === col.name}
                    onChange={() => onSettingsChange({ ...settings, groupByColumn: col.name })}
                    className="w-5 h-5 text-purple-600"
                  />
                  <span className="text-sm font-medium text-gray-700">{col.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Sum Columns */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Calculator className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Sum Columns</h2>
                <p className="text-sm text-gray-500">Select numeric columns to sum when grouping data</p>
              </div>
            </div>
            {numberColumns.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {numberColumns.map((col) => (
                  <label
                    key={col.name}
                    className={`
                      flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all
                      ${settings.sumColumns.includes(col.name)
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                      }
                    `}
                  >
                    <input
                      type="checkbox"
                      checked={settings.sumColumns.includes(col.name)}
                      onChange={() => toggleSumColumn(col.name)}
                      className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                    />
                    <span className="text-sm font-medium text-gray-700">{col.name}</span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No numeric columns detected in your data</p>
            )}
          </div>

          {/* Display Columns */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Eye className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Display Columns</h2>
                <p className="text-sm text-gray-500">Select columns to show in the data table</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {columns.map((col) => (
                <label
                  key={col.name}
                  className={`
                    flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all
                    ${settings.displayColumns.includes(col.name)
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    checked={settings.displayColumns.includes(col.name)}
                    onChange={() => toggleDisplayColumn(col.name)}
                    className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm font-medium text-gray-700">{col.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};