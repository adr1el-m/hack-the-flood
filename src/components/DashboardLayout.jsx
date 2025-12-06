import React from 'react';
import { NavLink } from 'react-router-dom';
import { PieChart, Table as TableIcon, Users, Map as MapIcon, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

export default function DashboardLayout({ children }) {
  const { t } = useLanguage();

  const navItems = [
    { path: '/dashboard/visual', icon: <PieChart size={18} />, label: 'Visual' },
    { path: '/dashboard/table', icon: <TableIcon size={18} />, label: 'Table' },
    { path: '/dashboard/contractors', icon: <Users size={18} />, label: 'Contractors' },
    { path: '/dashboard/map', icon: <MapIcon size={18} />, label: 'Map' },
  ];

  return (
    <div className="min-h-screen bg-gov-bg flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <NavLink to="/" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
            <ArrowLeft size={20} />
          </NavLink>
          <div>
            <h2 className="font-bold text-slate-800 text-sm md:text-base">{t('transparency_title')}</h2>
            <p className="text-[10px] text-slate-500">Data Source: CSV export</p>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-slate-200 px-4 sticky top-[61px] z-10 overflow-x-auto hide-scrollbar">
        <div className="flex gap-6">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-2 pb-3 pt-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-gov-blue text-gov-blue'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-200'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Page Content */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
