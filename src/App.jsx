import React, { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { Landmark, UploadCloud, Shield, Plus, Trash2, FolderOpen, PieChart, Table as TableIcon, Users, Map as MapIcon, MessageSquare } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { useReports } from './hooks';
import ReportView from './components/ReportView';

export default function App() {
  const navigate = useNavigate();
  const { t, toggleLanguage, language } = useLanguage();
  const { reports, addReport, deleteReport, clearReports } = useReports();
  
  const [view, setView] = useState('home'); // home, report
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncStatus, setSyncStatus] = useState('');

  const navItems = [
    { path: '/dashboard/visual', icon: <PieChart size={18} />, label: 'Visual' },
    { path: '/dashboard/table', icon: <TableIcon size={18} />, label: 'Table' },
    { path: '/dashboard/contractors', icon: <Users size={18} />, label: 'Contractors' },
    { path: '/dashboard/map', icon: <MapIcon size={18} />, label: 'Map' },
    { path: '/community', icon: <MessageSquare size={18} />, label: 'Community' },
  ];

  const handleSync = () => {
    setIsSyncing(true);
    
    setTimeout(() => {
      setSyncStatus('status_encrypting');
      setSyncProgress(30);
    }, 500);

    setTimeout(() => {
      setSyncStatus('status_uploading');
      setSyncProgress(70);
    }, 1500);

    setTimeout(() => {
      setSyncStatus('status_verifying');
      setSyncProgress(90);
    }, 2500);

    setTimeout(() => {
      setSyncProgress(100);
      setSyncStatus('status_success');
      
      clearReports();
      
      setTimeout(() => {
        setIsSyncing(false);
        setSyncProgress(0);
        setSyncStatus('');
      }, 1500);
    }, 3500);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gov-bg">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 px-4 py-3 flex flex-col md:flex-row justify-between items-center z-20 shadow-sm gap-3">
        <div className="flex justify-between w-full md:w-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gov-blue rounded-lg flex items-center justify-center text-white">
              <Landmark size={18} />
            </div>
            <div>
              <h1 className="text-sm font-bold text-gov-blue leading-tight">SubaybayPH</h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">BetterGov PH</p>
            </div>
          </div>
          
          {/* Mobile-only Right Side Elements (Language/Status) moved here for better layout if needed, 
              but sticking to user request to put links in header. 
              Let's keep Lang/Status on the right for desktop, 
              and maybe below or beside for mobile. 
              Actually, let's make a clean single row if possible, or two rows.
          */}
        </div>

        {/* Nav Links */}
        <div className="flex items-center gap-4 overflow-x-auto max-w-full pb-1 md:pb-0 hide-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-1.5 text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'text-gov-blue'
                    : 'text-slate-500 hover:text-slate-800'
                }`
              }
            >
              {item.icon}
              <span className="hidden sm:inline">{item.label}</span>
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={toggleLanguage}
            className="text-xs font-bold text-slate-500 border border-slate-300 px-2 py-1 rounded hover:bg-slate-100 transition-colors"
          >
            {language === 'en' ? <span className="text-gov-blue">EN</span> : 'EN'} | {language === 'tl' ? <span className="text-gov-blue">TL</span> : 'TL'}
          </button>
          <div className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            Online
          </div>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-2 ml-2">
          <NavLink to="/login" className="text-sm font-medium text-slate-600 hover:text-gov-blue px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
            Login
          </NavLink>
          <NavLink to="/signup" className="text-sm font-bold text-white bg-gov-blue px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors">
            Sign Up
          </NavLink>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        {view === 'home' && (
          <div className="h-full flex flex-col p-4 max-w-md mx-auto">
            
            {/* Hero Section */}
            <div className="mb-6 mt-2">
              <h2 className="text-2xl font-bold text-slate-800">{t('hello')}</h2>
              <p className="text-slate-500 text-sm">{t('tagline')}</p>
            </div>

            {/* Stats / Queue Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-slate-700">{t('pending_reports')}</h3>
                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-full">{reports.length}</span>
              </div>
              
              <div className="space-y-3 min-h-[100px] max-h-[300px] overflow-y-auto">
                {reports.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                    <FolderOpen size={32} className="mb-2 opacity-50" />
                    <p className="text-sm">{t('no_pending')}</p>
                  </div>
                ) : (
                  reports.slice().reverse().map(report => (
                    <div key={report.id} className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm flex flex-col gap-2">
                      <div className="flex items-center gap-3">
                        <img src={report.image} className="w-12 h-12 object-cover rounded-md bg-slate-200" />
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-slate-800">Report #{report.id.toString().slice(-4)}</p>
                          <p className="text-xs text-slate-500">{report.timestamp}</p>
                        </div>
                        <button 
                          onClick={() => { if(confirm(t('confirm_delete'))) deleteReport(report.id) }}
                          className="text-slate-400 hover:text-red-500 p-2 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      {report.sentiment && (
                        <div className="bg-slate-50 p-2 rounded text-xs text-slate-600 italic border-l-2 border-gov-blue">
                          "{report.sentiment}"
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {reports.length > 0 && (
                <button 
                  onClick={handleSync}
                  className="mt-4 w-full py-3 bg-slate-800 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:bg-slate-900 transition-colors"
                >
                  <UploadCloud size={18} /> {t('upload_securely')}
                </button>
              )}
            </div>

            {/* Transparency Board Button */}
            <button 
              onClick={() => navigate('/dashboard/visual')}
              className="w-full mb-6 py-4 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center justify-between px-5 hover:bg-slate-50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Landmark size={20} />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-slate-800 text-sm">{t('transparency_title')}</h3>
                  <p className="text-xs text-slate-500">{t('transparency_desc')}</p>
                </div>
              </div>
            </button>

            {/* Information Card */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <div className="flex gap-3">
                <div className="text-blue-600 mt-1"><Shield size={18} /></div>
                <div>
                  <h4 className="font-semibold text-sm text-blue-900">{t('privacy_first')}</h4>
                  <p className="text-xs text-blue-700 mt-1">{t('privacy_desc')}</p>
                </div>
              </div>
            </div>

            {/* FAB */}
            <div className="fixed bottom-6 right-6 z-10">
              <button 
                onClick={() => setView('report')}
                className="w-14 h-14 bg-gov-blue rounded-full text-white flex items-center justify-center shadow-lg hover:bg-blue-800 transition-colors active:scale-95"
              >
                <Plus size={24} />
              </button>
            </div>
          </div>
        )}

        {view === 'report' && (
          <ReportView 
            onClose={() => setView('home')} 
            onSave={(report) => {
              addReport(report);
              setView('home');
            }}
          />
        )}

        {/* Sync Modal */}
        {isSyncing && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm text-center">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">{t('syncing_evidence')}</h3>
              <p className={`text-sm mb-6 ${syncStatus === 'status_success' ? 'text-green-600 font-bold' : 'text-slate-500'}`}>
                {syncStatus ? t(syncStatus) : t('status_connecting')}
              </p>
              
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-2">
                <div 
                  className="h-full bg-gov-blue transition-all duration-300 rounded-full"
                  style={{ width: `${syncProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
