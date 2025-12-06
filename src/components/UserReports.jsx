import React, { useEffect, useState } from 'react';
import { getFirestore, collection, query, where, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { firebaseApp } from '../firebase';
import { useAuth } from '../AuthContext';
import { Trash2, MapPin, Calendar, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

export default function UserReports() {
  const { currentUser } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const { t } = useLanguage();

  useEffect(() => {
    if (!currentUser) {
      setReports([]);
      setLoading(false);
      return;
    }

    const db = getFirestore(firebaseApp);
    // Note: requires index on userId + createdAt desc. 
    // Fallback to client-side sort if index missing to prevent crash.
    const q = query(
      collection(db, 'reports'), 
      where('userId', '==', currentUser.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate() || new Date()
      }));
      // Sort client-side to be safe against missing composite indexes
      list.sort((a, b) => b.createdAt - a.createdAt);
      setReports(list);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching user reports:", err);
      setLoading(false);
    });

    return () => unsub();
  }, [currentUser]);

  const handleDelete = async (id) => {
    if (!confirm(t('confirm_delete_permanent'))) return;
    
    setDeletingId(id);
    try {
      const db = getFirestore(firebaseApp);
      await deleteDoc(doc(db, 'reports', id));
    } catch (error) {
      console.error("Error deleting report:", error);
      alert("Failed to delete report: " + error.message);
    } finally {
      setDeletingId(null);
    }
  };

  if (!currentUser) return null;

  if (loading) {
    return <div className="py-4 text-center text-slate-500 text-sm">{t('loading_your_reports')}</div>;
  }

  if (reports.length === 0) {
    return (
      <div className="bg-slate-50 rounded-xl p-6 text-center border border-slate-200 border-dashed">
        <p className="text-slate-500 text-sm">{t('no_reports_submitted')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reports.map(report => (
        <div key={report.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col sm:flex-row">
          <div className="h-32 sm:h-auto sm:w-32 bg-slate-200 flex-shrink-0 relative">
            {report.imageUrl ? (
              <img src={report.imageUrl} className="w-full h-full object-cover" alt="Report" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <AlertTriangle size={24} />
              </div>
            )}
            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-0.5 rounded text-[10px] font-bold text-slate-700 shadow-sm sm:hidden">
              {report.status}
            </div>
          </div>
          
          <div className="p-4 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-slate-800 line-clamp-1 mb-1" title={report.title}>
                  {report.title || 'Community Report'}
                </h4>
                <span className={`hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                  report.status === 'Verified' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {report.status}
                </span>
              </div>
              
              <div className="flex flex-col gap-1 text-xs text-slate-500 mb-3">
                <div className="flex items-center gap-1">
                  <MapPin size={12} />
                  <span className="truncate max-w-[200px]">{report.location || t('unknown')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar size={12} />
                  <span>{report.createdAt.toLocaleDateString()}</span>
                </div>
              </div>

              {report.project && (
                <div className="bg-blue-50 text-blue-700 text-xs px-2 py-1.5 rounded border border-blue-100 mb-3">
                  🏗️ {report.project.contractor}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button 
                onClick={() => handleDelete(report.id)}
                disabled={deletingId === report.id}
                className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors disabled:opacity-50"
              >
                {deletingId === report.id ? t('deleting') : (
                  <>
                    <Trash2 size={14} /> {t('delete')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
