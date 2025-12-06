import React, { useEffect, useMemo, useState } from 'react';
import { ArrowUp, MessageSquare, Share2 } from 'lucide-react';
import { getFirestore, collection, query, where, orderBy, onSnapshot, doc, runTransaction } from 'firebase/firestore';
import { firebaseApp } from '../firebase';

export default function CommunityFeed() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('demo');
  const [openComments, setOpenComments] = useState({});

  const demoVotesKey = 'subaybay_demo_votes_feed';
  const [demoVotes, setDemoVotes] = useState(() => JSON.parse(localStorage.getItem(demoVotesKey) || '{}'));

  const hasKeys = Boolean(import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_PROJECT_ID);

  useEffect(() => {
    if (!hasKeys) {
      setMode('demo');
      const demo = [
        { id: 'demo-1', title: 'Ghost Dike Project on Roxas Ave', location: 'Barangay San Isidro', imageUrl: 'https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?q=80&w=1200&auto=format&fit=crop', votes: 42, createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3 },
        { id: 'demo-2', title: 'Drainage promised, still flooding every week', location: 'Barangay Mabini', imageUrl: 'https://images.unsplash.com/photo-1528419364575-4c1ee429e4b3?q=80&w=1200&auto=format&fit=crop', votes: 19, createdAt: Date.now() - 1000 * 60 * 60 * 20 },
        { id: 'demo-3', title: 'Contractor left site, zero progress', location: 'Barangay Sta. Lucia', imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1200&auto=format&fit=crop', votes: 7, createdAt: Date.now() - 1000 * 60 * 60 * 5 },
      ].sort((a, b) => (b.votes || 0) - (a.votes || 0));
      setItems(demo);
      setLoading(false);
      return;
    }
    try {
      const db = getFirestore(firebaseApp);
      setMode('firestore');
      let q;
      try {
        q = query(collection(db, 'reports'), where('status', '==', 'Verified'), orderBy('votes', 'desc'));
      } catch {
        q = query(collection(db, 'reports'), where('status', '==', 'Verified'));
      }
      const unsub = onSnapshot(q, (snap) => {
        const list = snap.docs.map(d => ({
          id: d.id,
          title: d.data().title,
          location: d.data().location,
          imageUrl: d.data().imageUrl,
          votes: d.data().votes || 0,
          createdAt: d.data().createdAt?.toDate?.() || new Date(),
        }));
        const sorted = list.sort((a, b) => (b.votes || 0) - (a.votes || 0));
        setItems(sorted);
        setLoading(false);
      }, (err) => {
        console.error("Firestore error:", err);
        setMode('demo');
        const demo = [
          { id: 'demo-1', title: 'Ghost Dike Project on Roxas Ave', location: 'Barangay San Isidro', imageUrl: 'https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?q=80&w=1200&auto=format&fit=crop', votes: 42, createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3 },
          { id: 'demo-2', title: 'Drainage promised, still flooding every week', location: 'Barangay Mabini', imageUrl: 'https://images.unsplash.com/photo-1528419364575-4c1ee429e4b3?q=80&w=1200&auto=format&fit=crop', votes: 19, createdAt: Date.now() - 1000 * 60 * 60 * 20 },
          { id: 'demo-3', title: 'Contractor left site, zero progress', location: 'Barangay Sta. Lucia', imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1200&auto=format&fit=crop', votes: 7, createdAt: Date.now() - 1000 * 60 * 60 * 5 },
        ].sort((a, b) => (b.votes || 0) - (a.votes || 0));
        setItems(demo);
        setLoading(false);
      });
      return () => unsub();
    } catch {
      setMode('demo');
      const demo = [
        { id: 'demo-1', title: 'Ghost Dike Project on Roxas Ave', location: 'Barangay San Isidro', imageUrl: 'https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?q=80&w=1200&auto=format&fit=crop', votes: 42, createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3 },
        { id: 'demo-2', title: 'Drainage promised, still flooding every week', location: 'Barangay Mabini', imageUrl: 'https://images.unsplash.com/photo-1528419364575-4c1ee429e4b3?q=80&w=1200&auto=format&fit=crop', votes: 19, createdAt: Date.now() - 1000 * 60 * 60 * 20 },
        { id: 'demo-3', title: 'Contractor left site, zero progress', location: 'Barangay Sta. Lucia', imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1200&auto=format&fit=crop', votes: 7, createdAt: Date.now() - 1000 * 60 * 60 * 5 },
      ].sort((a, b) => (b.votes || 0) - (a.votes || 0));
      setItems(demo);
      setLoading(false);
    }
  }, [hasKeys]);

  const timeAgo = (ts) => {
    const base = ts instanceof Date ? ts.getTime() : (typeof ts === 'number' ? ts : Date.now());
    const diff = Math.floor((Date.now() - base) / 1000);
    if (diff < 60) return `${diff}s ago`;
    const m = Math.floor(diff / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    return `${d}d ago`;
  };

  const upvote = async (id) => {
    if (mode === 'demo') {
      const current = (demoVotes[id] || 0) + 1;
      const nextMap = { ...demoVotes, [id]: current };
      setDemoVotes(nextMap);
      localStorage.setItem(demoVotesKey, JSON.stringify(nextMap));
      setItems(prev => prev.map(it => it.id === id ? { ...it, votes: current } : it));
      return;
    }
    try {
      const db = getFirestore(firebaseApp);
      await runTransaction(db, async (tx) => {
        const ref = doc(db, 'reports', id);
        const snap = await tx.get(ref);
        const next = (snap.data()?.votes || 0) + 1;
        tx.update(ref, { votes: next });
      });
    } catch {}
  };

  const share = async (title) => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title, text: title, url }); } catch {}
    } else {
      try { await navigator.clipboard.writeText(url); } catch {}
    }
  };

  const cards = useMemo(() => items.map(item => (
    <div key={item.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="grid grid-cols-[52px_1fr]">
        <div className="bg-slate-50 border-r border-slate-200 flex flex-col items-center justify-center py-4 gap-2">
          <button onClick={() => upvote(item.id)} className="w-8 h-8 rounded bg-white border border-slate-200 text-slate-600 hover:text-gov-blue hover:border-gov-blue transition">
            <ArrowUp size={16} />
          </button>
          <div className="text-sm font-bold text-slate-700">{item.votes || 0}</div>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 font-bold">✅ Verified by NGO</span>
          </div>
          <div className="text-xs text-slate-500 mb-2">Posted by Anonymous • {item.location || 'Unknown Location'} • {timeAgo(item.createdAt)}</div>
          <h3 className="text-lg font-bold text-slate-900 mb-3">{item.title || 'Untitled'}</h3>
          <div className="rounded-lg overflow-hidden border border-slate-200 mb-3">
            <img src={item.imageUrl || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1200&auto=format&fit=crop'} className="w-full h-64 object-cover" alt="Report evidence" />
          </div>
          <div className="flex items-center justify-between">
            <button onClick={() => setOpenComments(prev => ({ ...prev, [item.id]: !prev[item.id] }))} className="text-sm text-slate-600 hover:text-gov-blue font-medium flex items-center gap-1">
              <MessageSquare size={16} />
              <span>Comments</span>
            </button>
            <button onClick={() => share(item.title)} className="text-sm text-slate-600 hover:text-gov-blue font-medium flex items-center gap-1">
              <Share2 size={16} />
              <span>Share</span>
            </button>
          </div>
          {openComments[item.id] && (
            <div className="mt-3 space-y-2">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm">Resident: I walk past here every day, nothing has changed!</div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm">Volunteer: We checked records, delays look suspicious.</div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm">Engineer: DPWH promised completion last quarter.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )), [items, openComments]);

  return (
    <div className="min-h-screen bg-gov-bg">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-gov-blue rounded-full animate-spin"></div>
            <span className="ml-3 text-sm text-slate-600">Loading SubaybayPH...</span>
          </div>
        )}
        {!loading && (
          <div className="space-y-4">
            {cards}
          </div>
        )}
      </div>
    </div>
  );
}

