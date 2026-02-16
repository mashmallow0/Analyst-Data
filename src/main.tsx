import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'

// Error logging for debugging
window.addEventListener('error', (e) => {
  console.error('Global error:', e.error);
  document.body.innerHTML = `<div style="padding: 20px; font-family: sans-serif;">
    <h2>Error Loading App</h2>
    <pre style="background: #f5f5f5; padding: 10px; overflow: auto;">${e.error?.stack || e.error || 'Unknown error'}</pre>
    <p>Please check console for details (F12)</p>
  </div>`;
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)