import React, { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { Landmark, UploadCloud, Shield, Plus, Trash2, FolderOpen, PieChart, Table as TableIcon, Users, Map as MapIcon, MessageSquare } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { useAuth } from './AuthContext';
import { useReports } from './hooks';
import ReportView from './components/ReportView';
import ProjectSelector from './components/ProjectSelector';
import UserReports from './components/UserReports';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function App() {
  const navigate = useNavigate();
  const { t, toggleLanguage, language } = useLanguage();
  const { currentUser } = useAuth();
  const { reports, addReport, deleteReport, clearReports } = useReports();
  
  const [view, setView] = useState('home'); // home, select-project, report
  const [selectedProject, setSelectedProject] = useState(null);
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

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncStatus('status_encrypting');
    setSyncProgress(30);

    try {
      if (!currentUser) {
        setSyncStatus('Error: Please log in to upload');
        setTimeout(() => {
          setIsSyncing(false);
          setSyncProgress(0);
        }, 2000);
        return;
      }

      if (reports.length > 0) {
        setSyncStatus('status_uploading');
        setSyncProgress(70);

        const promises = reports.map(report => {
          const projectData = report.project || {};
          return addDoc(collection(db, 'reports'), {
            ...report,
            userId: currentUser.uid,
            authorName: currentUser.displayName || 'Anonymous Citizen',
            authorPhoto: currentUser.photoURL || null,
            imageUrl: report.image,
            title: projectData.desc || 'Community Report',
            location: projectData.location || 'Unknown Location',
            project: projectData, // Explicitly save project data
            status: 'Verified',
            votes: 0,
            createdAt: serverTimestamp()
          });
        });

        await Promise.all(promises);
      }

      setSyncStatus('status_verifying');
      setSyncProgress(90);
      
      setTimeout(() => {
        setSyncProgress(100);
        setSyncStatus('status_success');
        
        clearReports();
        
        setTimeout(() => {
          setIsSyncing(false);
          setSyncProgress(0);
          setSyncStatus('');
        }, 1500);
      }, 1000);

    } catch (error) {
      console.error("Sync failed", error);
      setSyncStatus(`Error: ${error.message}`);
    }
  };

  const uploadNow = async (report, projectData) => {
    setIsSyncing(true);
    setSyncStatus('status_encrypting');
    setSyncProgress(30);

    try {
      if (!currentUser) {
        setSyncStatus('Error: Please log in to upload');
        setTimeout(() => {
          setIsSyncing(false);
          setSyncProgress(0);
        }, 2000);
        return;
      }

      setSyncStatus('status_uploading');
      setSyncProgress(70);

      const project = projectData || {};
      await addDoc(collection(db, 'reports'), {
        ...report,
        userId: currentUser.uid,
        authorName: currentUser.displayName || 'Anonymous Citizen',
        authorPhoto: currentUser.photoURL || null,
        imageUrl: report.image,
        title: project.desc || 'Community Report',
        location: project.location || 'Unknown Location',
        project,
        status: 'Verified',
        votes: 0,
        createdAt: serverTimestamp()
      });

      setSyncStatus('status_verifying');
      setSyncProgress(90);

      setTimeout(() => {
        setSyncProgress(100);
        setSyncStatus('status_success');
        setTimeout(() => {
          setIsSyncing(false);
          setSyncProgress(0);
          setSyncStatus('');
        }, 1500);
      }, 1000);
    } catch (error) {
      console.error('Immediate upload failed', error);
      setSyncStatus(`Error: ${error.message}`);
    }
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
          {currentUser ? (
            <NavLink to="/profile" className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:bg-slate-50 px-2 py-1 rounded-lg transition-colors">
              <img 
                src={currentUser.photoURL || `https://ui-avatars.com/api/?name=${currentUser.displayName || 'User'}`} 
                className="w-8 h-8 rounded-full border border-slate-200"
                alt="Profile"
              />
              <span className="hidden sm:block">{currentUser.displayName?.split(' ')[0] || 'User'}</span>
            </NavLink>
          ) : (
            <>
              <NavLink to="/login" className="text-sm font-medium text-slate-600 hover:text-gov-blue px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                Login
              </NavLink>
              <NavLink to="/signup" className="text-sm font-bold text-white bg-gov-blue px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors">
                Sign Up
              </NavLink>
            </>
          )}
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto relative">
        {view === 'home' && (
          <div className="h-full flex items-center justify-center p-4">
            <button 
              onClick={() => setView('select-project')}
              className="px-6 py-4 bg-gov-blue text-white rounded-xl shadow-lg text-lg font-bold hover:bg-blue-700 active:scale-95 transition"
            >
              Submit a Report
            </button>
          </div>
        )}

        {view === 'select-project' && (
          <ProjectSelector 
            onSelect={(project) => {
              setSelectedProject(project);
              setView('report');
            }}
            onCancel={() => setView('home')}
          />
        )}

        {view === 'report' && (
          <ReportView 
            project={selectedProject}
            onClose={() => {
               setView('home');
               setSelectedProject(null);
            }} 
            onSave={(report) => {
              setView('home');
              uploadNow(report, selectedProject);
              setSelectedProject(null);
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

              {syncStatus.startsWith('Error') && (
                <button 
                  onClick={() => setIsSyncing(false)}
                  className="mt-4 text-sm text-slate-500 hover:text-slate-800 underline"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
