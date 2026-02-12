# 📊 Analyst Data

A beautiful, modern web application for analyzing Excel and CSV data with powerful filters, aggregations, and interactive charts.

![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-blue)

## ✨ Features

- 📤 **Drag & Drop Upload** - Support for .xlsx, .xls, and .csv files
- 🔍 **Smart Search & Filter** - Search and filter by any column
- 📊 **Interactive Charts** - Bar, Line, and Pie charts with Recharts
- 🧮 **Data Aggregation** - Auto-sum values grouped by any column
- ⚙️ **Flexible Settings** - Configure filters, grouping, and display columns
- 🎨 **Beautiful UI** - Modern design with Tailwind CSS
- 📱 **Responsive** - Works on desktop and mobile

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/mashmallow0/Analyst-Data.git
cd Analyst-Data

# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:5173 to view the app.

## 📖 How to Use

1. **Upload Data** - Drag and drop your Excel or CSV file on the home page
2. **Configure Settings** - Go to Settings to choose:
   - Filter columns for searching
   - Group-by column (e.g., person name)
   - Sum columns for aggregation
   - Display columns for the table
3. **Customize Charts** - Go to Chart Settings to set:
   - Chart type (Bar, Line, Pie)
   - X and Y axis columns
   - Chart title
4. **Analyze** - View your data in the Dashboard with:
   - Real-time search and filters
   - Interactive charts
   - Aggregated totals
   - Export to CSV

## 🛠️ Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **SheetJS (xlsx)** - Excel parsing
- **Recharts** - Data visualization
- **React Router** - Navigation
- **Lucide React** - Icons

## 📁 Project Structure

```
src/
├── components/
│   ├── ExcelUploader.tsx    # File upload component
│   └── Header.tsx           # Navigation header
├── pages/
│   ├── DashboardPage.tsx    # Main dashboard with charts & table
│   ├── SettingsPage.tsx     # Data configuration settings
│   └── ChartSettingsPage.tsx # Chart customization
├── types/
│   └── index.ts             # TypeScript interfaces
├── App.tsx                  # Main app component
└── main.tsx                 # Entry point
```

## 📝 License

MIT

---

Built with ❤️ by Luna