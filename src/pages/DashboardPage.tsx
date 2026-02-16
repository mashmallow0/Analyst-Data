import React, { useState, useMemo, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Search,
  Download,
  Filter,
  BarChart3,
  Table,
  TrendingUp,
  Users,
  Calculator,
  FileSpreadsheet,
  Trash2,
  ChevronDown,
  Bookmark,
  BookmarkCheck,
  X,
} from 'lucide-react';
import { DataFile, AggregatedData } from '../types';
import { ExcelUploader } from '../components/ExcelUploader';

interface DashboardPageProps {
  files: DataFile[];
  activeFile: DataFile | null;
  onFilesAdd: (files: DataFile[]) => void;
  onClearAll: () => void;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#84cc16'];

export const DashboardPage: React.FC<DashboardPageProps> = ({
  files,
  activeFile,
  onFilesAdd,
  onClearAll,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [showAggregated, setShowAggregated] = useState(true);
  
  // Saved filters state
  const [savedFilters, setSavedFilters] = useState<Array<{ name: string; filters: Record<string, string>; searchTerm: string; id: string }>>(() => {
    const stored = localStorage.getItem('analyst-data-saved-filters');
    return stored ? JSON.parse(stored) : [];
  });
  const [showSaveFilterModal, setShowSaveFilterModal] = useState(false);
  const [newFilterName, setNewFilterName] = useState('');
  const [showLoadFilterDropdown, setShowLoadFilterDropdown] = useState(false);

  // Persist saved filters to localStorage
  useEffect(() => {
    localStorage.setItem('analyst-data-saved-filters', JSON.stringify(savedFilters));
  }, [savedFilters]);

  // Save current filter
  const handleSaveFilter = () => {
    if (!newFilterName.trim()) return;
    const newFilter = {
      id: Date.now().toString(),
      name: newFilterName.trim(),
      filters: { ...activeFilters },
      searchTerm,
    };
    setSavedFilters([...savedFilters, newFilter]);
    setNewFilterName('');
    setShowSaveFilterModal(false);
  };

  // Load saved filter
  const handleLoadFilter = (filter: typeof savedFilters[0]) => {
    setActiveFilters(filter.filters);
    setSearchTerm(filter.searchTerm);
    setShowLoadFilterDropdown(false);
  };

  // Delete saved filter
  const handleDeleteFilter = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedFilters(savedFilters.filter(f => f.id !== id));
  };

  // Clear all filters
  const handleClearFilters = () => {
    setActiveFilters({});
    setSearchTerm('');
  };
  
  const data = activeFile?.data || [];
  const columns = activeFile?.columns || [];
  const settings = activeFile?.settings || { filterColumns: [], groupByColumn: '', sumColumns: [], displayColumns: [] };
  const chartSettings = activeFile?.chartSettings || { type: 'bar', xAxisColumn: '', yAxisColumn: '', title: '' };

  // Aggregate data by group column
  const aggregatedData = useMemo(() => {
    if (!settings.groupByColumn || data.length === 0) return {};

    return data.reduce((acc: AggregatedData, row) => {
      const key = String(row[settings.groupByColumn] || 'Unknown');
      if (!acc[key]) {
        acc[key] = { count: 0 };
        settings.sumColumns.forEach(col => {
          acc[key][col] = 0;
        });
      }
      acc[key].count += 1;
      settings.sumColumns.forEach(col => {
        const val = Number(row[col]) || 0;
        acc[key][col] += val;
      });
      return acc;
    }, {});
  }, [data, settings]);

  // Filter and search data
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      for (const [col, value] of Object.entries(activeFilters)) {
        if (value && String(row[col] || '').toLowerCase() !== value.toLowerCase()) {
          return false;
        }
      }
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = Object.entries(row).some(([key, value]) => {
          if (!settings.filterColumns.includes(key)) return false;
          return String(value || '').toLowerCase().includes(searchLower);
        });
        if (!matchesSearch) return false;
      }
      return true;
    });
  }, [data, activeFilters, searchTerm, settings.filterColumns]);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (showAggregated && settings.groupByColumn) {
      return Object.entries(aggregatedData).map(([key, values]) => ({
        name: key,
        value: values[chartSettings.yAxisColumn] || 0,
        ...values,
      }));
    }
    return filteredData.map((row) => ({
      name: String(row[chartSettings.xAxisColumn] || ''),
      value: Number(row[chartSettings.yAxisColumn]) || 0,
      ...row,
    })).filter(d => d.name);
  }, [filteredData, aggregatedData, chartSettings, showAggregated, settings.groupByColumn]);

  // Stats
  const stats = useMemo(() => {
    const totalRows = data.length;
    const filteredCount = filteredData.length;
    const uniqueGroups = settings.groupByColumn
      ? new Set(data.map(row => row[settings.groupByColumn])).size
      : 0;
    const totalSum = settings.sumColumns.length > 0 && showAggregated && settings.groupByColumn
      ? Object.values(aggregatedData).reduce((sum, group) => {
          return sum + (group[settings.sumColumns[0]] || 0);
        }, 0)
      : filteredData.reduce((sum, row) => {
          return sum + (Number(row[settings.sumColumns[0]]) || 0);
        }, 0);

    return { totalRows, filteredCount, uniqueGroups, totalSum };
  }, [data, filteredData, aggregatedData, settings, showAggregated]);

  const exportToCSV = () => {
    const displayCols = settings.displayColumns.length > 0 ? settings.displayColumns : columns.map(c => c.name);
    const rows = showAggregated && settings.groupByColumn
      ? Object.entries(aggregatedData).map(([key, values]) => ({
          [settings.groupByColumn]: key,
          ...values,
        }))
      : filteredData;

    const csv = [
      displayCols.join(','),
      ...rows.map(row =>
        displayCols.map(col => `"${String(row[col] || '').replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = activeFile ? `${activeFile.name.replace('.xlsx', '').replace('.csv', '')}-export.csv` : 'export.csv';
    link.click();
  };

  if (files.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mx-auto mb-6 shadow-xl">
            <BarChart3 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Analyst Data</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload your Excel or CSV files to start analyzing your data with powerful filters, 
            aggregations, and beautiful charts.
          </p>
        </div>
        <ExcelUploader onFilesLoaded={onFilesAdd} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-primary-600" />
            </div>
            Dashboard
          </h1>
          {activeFile && (
            <p className="text-gray-500 mt-1 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              {activeFile.name}
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClearAll}
            className="btn-secondary text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </button>
          <button
            onClick={exportToCSV}
            className="btn-primary"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* File Upload Section */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Add More Files</h2>
          <span className="text-sm text-gray-500">{files.length} file{files.length !== 1 ? 's' : ''} loaded</span>
        </div>
        <ExcelUploader onFilesLoaded={onFilesAdd} />
      </div>

      {activeFile ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="card p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Table className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Rows</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalRows.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="card p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Filter className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Filtered</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.filteredCount.toLocaleString()}</p>
                </div>
              </div>
            </div>
            {settings.groupByColumn && (
              <div className="card p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Unique {settings.groupByColumn}</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.uniqueGroups.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}
            {settings.sumColumns.length > 0 && (
              <div className="card p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                    <Calculator className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total {settings.sumColumns[0]}</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalSum.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Search and Filters */}
          <div className="card mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search data..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                />
              </div>
              {settings.filterColumns.map((col) => (
                <select
                  key={col}
                  value={activeFilters[col] || ''}
                  onChange={(e) => setActiveFilters({ ...activeFilters, [col]: e.target.value })}
                  className="input lg:w-48"
                >
                  <option value="">All {col}</option>
                  {Array.from(new Set(data.map(row => row[col]))).filter(Boolean).map((val) => (
                    <option key={String(val)} value={String(val)}>{String(val)}</option>
                  ))}
                </select>
              ))}
            
              {/* Save/Load Filter Buttons */}
              <div className="flex gap-2 lg:ml-auto">
                <button
                  onClick={() => setShowSaveFilterModal(true)}
                  className="btn-secondary text-sm flex items-center gap-1"
                  title="Save current filter"
                >
                  <Bookmark className="w-4 h-4" />
                  Save
                </button>
                
                {savedFilters.length > 0 && (
                  <div className="relative">
                    <button
                      onClick={() => setShowLoadFilterDropdown(!showLoadFilterDropdown)}
                      className="btn-secondary text-sm flex items-center gap-1"
                    >
                      <BookmarkCheck className="w-4 h-4" />
                      Load
                      <ChevronDown className={`w-3 h-3 transition-transform ${showLoadFilterDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {showLoadFilterDropdown && (
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-64 overflow-y-auto">
                        <div className="p-2 border-b border-gray-100">
                          <span className="text-xs font-medium text-gray-500">Saved Filters ({savedFilters.length})</span>
                        </div>
                        {savedFilters.map((filter) => (
                          <div
                            key={filter.id}
                            onClick={() => handleLoadFilter(filter)}
                            className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{filter.name}</p>
                              <p className="text-xs text-gray-500">
                                {Object.keys(filter.filters).filter(k => filter.filters[k]).length} filters
                                {filter.searchTerm && ` • "${filter.searchTerm}"`}
                              </p>
                            </div>
                            <button
                              onClick={(e) => handleDeleteFilter(filter.id, e)}
                              className="p-1 text-gray-400 hover:text-red-500 ml-2"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                {(Object.keys(activeFilters).some(k => activeFilters[k]) || searchTerm) && (
                  <button
                    onClick={handleClearFilters}
                    className="btn-secondary text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                    Clear
                  </button>
                )}
              </div>
            </div>
            {settings.groupByColumn && (
              <label className="flex items-center gap-2 mt-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showAggregated}
                  onChange={(e) => setShowAggregated(e.target.checked)}
                  className="w-5 h-5 text-primary-600 rounded"
                />
                <span className="text-sm text-gray-700">
                  Show aggregated data by {settings.groupByColumn}
                </span>
              </label>
            )}
          </div>

          {/* Charts */}
          {chartData.length > 0 && chartSettings.xAxisColumn && chartSettings.yAxisColumn && (
            <div className="card mb-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">{chartSettings.title || 'Chart'}</h2>
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  {chartSettings.type === 'bar' ? (
                    <BarChart data={chartData.slice(0, 20)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  ) : chartSettings.type === 'line' ? (
                    <LineChart data={chartData.slice(0, 20)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
                    </LineChart>
                  ) : (
                    <PieChart>
                      <Pie
                        data={chartData.slice(0, 8)}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {chartData.slice(0, 8).map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Data Table */}
          <div className="card overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <Table className="w-5 h-5 text-gray-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Data Table</h2>
            </div>
            <div className="overflow-x-auto -mx-6">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {(settings.displayColumns.length > 0 ? settings.displayColumns : columns.map(c => c.name)).map((col) => (
                      <th
                        key={col}
                        className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {(showAggregated && settings.groupByColumn
                    ? Object.entries(aggregatedData).map(([key, values]) => ({
                        [settings.groupByColumn]: key,
                        ...values,
                      }))
                    : filteredData
                  ).slice(0, 100).map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      {(settings.displayColumns.length > 0 ? settings.displayColumns : columns.map(c => c.name)).map((col) => (
                        <td key={col} className="px-6 py-3 text-sm text-gray-900 whitespace-nowrap">
                          {typeof row[col] === 'number' 
                            ? row[col].toLocaleString() 
                            : String(row[col] || '-')
                          }
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-sm text-gray-500 text-center">
              Showing {Math.min(100, showAggregated && settings.groupByColumn 
                ? Object.keys(aggregatedData).length 
                : filteredData.length
              )} of {(showAggregated && settings.groupByColumn 
                ? Object.keys(aggregatedData).length 
                : filteredData.length
              ).toLocaleString()} rows
            </div>
          </div>
        </>
      ) : (
        <div className="card text-center py-16">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <FileSpreadsheet className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No active file selected</h3>
          <p className="text-gray-500 mt-2">Go to Files page to select a file, or upload a new one above</p>
        </div>
      )}

      {/* Save Filter Modal */}
      {showSaveFilterModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Save Filter</h3>
            <p className="text-sm text-gray-600 mb-4">
              Save current filter settings for future use.
            </p>
            <input
              type="text"
              placeholder='Filter name (e.g. "Q1 Sales Report")'
              value={newFilterName}
              onChange={(e) => setNewFilterName(e.target.value)}
              className="input w-full mb-4"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveFilter();
                if (e.key === 'Escape') setShowSaveFilterModal(false);
              }}
            />
            <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
              <p className="font-medium text-gray-700 mb-1">Current filter:</p>
              <ul className="text-gray-600 space-y-1">
                {searchTerm && <li>Search: "{searchTerm}"</li>}
                {Object.entries(activeFilters)
                  .filter(([_, val]) => val)
                  .map(([col, val]) => (
                    <li key={col}>{col}: {val}</li>
                  ))}
                {!searchTerm && Object.keys(activeFilters).filter(k => activeFilters[k]).length === 0 && (
                  <li className="text-gray-400">No active filters</li>
                )}
              </ul>
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowSaveFilterModal(false);
                  setNewFilterName('');
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveFilter}
                disabled={!newFilterName.trim()}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Filter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};