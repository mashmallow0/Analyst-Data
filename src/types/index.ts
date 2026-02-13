export interface DataRow {
  [key: string]: string | number | null;
}

export interface ColumnConfig {
  name: string;
  type: 'text' | 'number' | 'date';
}

export interface Settings {
  filterColumns: string[];
  groupByColumn: string;
  sumColumns: string[];
  displayColumns: string[];
}

export interface ChartSettings {
  type: 'bar' | 'pie' | 'line';
  xAxisColumn: string;
  yAxisColumn: string;
  title: string;
}

export interface AggregatedData {
  [key: string]: {
    [sumColumn: string]: number;
    count: number;
  };
}

export interface DataFile {
  id: string;
  name: string;
  data: DataRow[];
  columns: ColumnConfig[];
  uploadedAt: Date;
  settings: Settings;
  chartSettings: ChartSettings;
}

export interface AppState {
  files: DataFile[];
  activeFileId: string | null;
}