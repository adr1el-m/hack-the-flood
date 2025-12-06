import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { ArrowLeft, User, LogOut, Shield } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { doc, onSnapshot, collection, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import UserReports from '../components/UserReports';

export default function ProfilePage() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [reputation, setReputation] = useState(0);
  const { t } = useLanguage();

  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, 'reports'), where('userId', '==', currentUser.uid));
    const unsub = onSnapshot(q, (snap) => {
      let totalVotes = 0;
      snap.docs.forEach(d => {
        const v = d.data().votes;
        totalVotes += typeof v === 'number' ? v : 0;
      });
      setReputation(totalVotes * 10);
    });
    return () => unsub();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  if (!currentUser) {
    // Redirect or show message
    return (
      <div className="min-h-screen bg-gov-bg flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-slate-500 mb-4">{t('redirect_login')}</p>
          {/* Auto-redirect effect could be better here, but manual link is safe fallback */}
          <NavLink to="/login" className="text-gov-blue font-bold hover:underline">{t('go_to_login')}</NavLink>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <NavLink to="/" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
            <ArrowLeft size={20} />
          </NavLink>
          <div>
            <h2 className="font-bold text-slate-800 text-sm md:text-base">{t('my_profile')}</h2>
          </div>
        </div>
      </nav>

      <div className="flex-1 p-4 max-w-3xl mx-auto w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
          <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
          <div className="px-6 pb-6">
            <div className="relative flex justify-between items-end -mt-12 mb-4">
              <img 
                src={currentUser.photoURL || `https://ui-avatars.com/api/?name=${currentUser.displayName || 'User'}`} 
                className="w-24 h-24 rounded-full border-4 border-white shadow-md bg-slate-200 object-cover"
                alt="Profile"
              />
            </div>
            
            <h1 className="text-2xl font-bold text-slate-900">{currentUser.displayName || 'Citizen'}</h1>
            <p className="text-slate-500 text-sm mb-6">{currentUser.email}</p>

            <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 text-center mb-6">
              <div className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">{t('reputation_score')}</div>
              <div className="text-5xl font-extrabold text-gov-blue mb-2">{reputation}</div>
              <p className="text-sm text-slate-600">{t('credibility_points')}</p>
            </div>

            {/* My Reports Section */}
            <div className="mb-6">
              <h3 className="font-bold text-slate-800 mb-3">{t('my_report_history')}</h3>
              <UserReports />
            </div>

            <div className="flex flex-col gap-3">
              <button className="w-full py-3 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors">
                 <Shield size={18} /> {t('verified_citizen_badge')}
              </button>
              
              <button 
                onClick={handleLogout}
                className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
              >
                <LogOut size={18} /> {t('logout')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
