import { useState, useEffect } from 'react';

export const useReports = () => {
  const [reports, setReports] = useState(() => {
    const saved = localStorage.getItem('bk_reports');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('bk_reports', JSON.stringify(reports));
  }, [reports]);

  const addReport = (report) => {
    setReports(prev => [...prev, report]);
  };

  const deleteReport = (id) => {
    setReports(prev => prev.filter(r => r.id !== id));
  };

  const clearReports = () => {
    setReports([]);
  };

  return { reports, addReport, deleteReport, clearReports };
};