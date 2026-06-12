import React, { useEffect } from 'react';
import AppRoutes from './routes/AppRoutes';

function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem('ems-theme') || 'slate';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--theme-bg)] text-[var(--theme-text)] transition-colors duration-300">
      <AppRoutes />
    </div>
  );
}

export default App;
