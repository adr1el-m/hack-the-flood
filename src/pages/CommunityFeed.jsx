import React, { useEffect, useMemo, useState } from 'react';
import { ArrowUp, MessageSquare, Share2, AlertTriangle } from 'lucide-react';
import { getFirestore, collection, query, where, orderBy, onSnapshot, doc, runTransaction, updateDoc, arrayUnion, getDoc, serverTimestamp } from 'firebase/firestore';
import { firebaseApp } from '../firebase';
import { useAuth } from '../AuthContext';

export default function CommunityFeed() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState('demo');
  const [openComments, setOpenComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile] = useState(null);

  const demoVotesKey = 'subaybay_demo_votes_feed';
  const [demoVotes, setDemoVotes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(demoVotesKey) || '{}');
    } catch {
      return {};
    }
  });

  const hasKeys = Boolean(import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_PROJECT_ID);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!hasKeys) {
      setMode('demo');
      setItems([]); 
      setLoading(false);
      return;
    }
    
    try {
      const db = getFirestore(firebaseApp);
      setMode('firestore');
      
      // Simplified query to avoid index issues initially
      // We will sort client-side if needed to prevent WSOD from missing indexes
      const q = query(collection(db, 'reports'), where('status', '==', 'Verified'));
      
      const unsub = onSnapshot(q, (snap) => {
        try {
          const list = snap.docs.map(d => {
            const data = d.data();
            return {
              id: d.id,
              title: data.title || 'Community Report',
              location: data.location || 'Unknown Location',
              imageUrl: data.imageUrl || null,
              authorName: data.authorName || 'Anonymous',
              authorPhoto: data.authorPhoto || null,
              sentiment: data.sentiment || '',
              votes: typeof data.votes === 'number' ? data.votes : 0,
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
              project: data.project || null,
              userId: data.userId || null,
              comments: Array.isArray(data.comments) ? data.comments : []
            };
          });
          
          const sorted = list.sort((a, b) => (b.votes || 0) - (a.votes || 0));
          setItems(sorted);
          setLoading(false);
        } catch (err) {
          console.error("Error processing snapshot:", err);
          setError("Failed to process data.");
          setLoading(false);
        }
      }, (err) => {
        console.error("Firestore error:", err);
        // If permission denied or index missing, fallback safely
        setError(err.message);
        setLoading(false);
      });
      
      return () => unsub();
    } catch (err) {
      console.error("Setup error:", err);
      setError(err.message);
      setLoading(false);
    }
  }, [hasKeys]);

  const timeAgo = (ts) => {
    try {
      const base = ts instanceof Date ? ts.getTime() : (typeof ts === 'number' ? ts : Date.now());
      const diff = Math.floor((Date.now() - base) / 1000);
      if (diff < 60) return `${diff}s ago`;
      const m = Math.floor(diff / 60);
      if (m < 60) return `${m}m ago`;
      const h = Math.floor(m / 60);
      if (h < 24) return `${h}h ago`;
      const d = Math.floor(h / 24);
      return `${d}d ago`;
    } catch {
      return 'just now';
    }
  };

  const openProfileFor = async (item) => {
    try {
      if (!item.userId) {
        setProfile({ displayName: item.authorName, photoURL: item.authorPhoto, reputation: 0, role: 'citizen' });
        setProfileOpen(true);
        return;
      }
      const db = getFirestore(firebaseApp);
      const snap = await getDoc(doc(db, 'users', item.userId));
      if (snap.exists()) {
        setProfile(snap.data());
      } else {
        setProfile({ displayName: item.authorName, photoURL: item.authorPhoto, reputation: 0, role: 'citizen' });
      }
      setProfileOpen(true);
    } catch {
      setProfile({ displayName: item.authorName, photoURL: item.authorPhoto, reputation: 0, role: 'citizen' });
      setProfileOpen(true);
    }
  };

  const upvote = async (id) => {
    // Check local storage for existing vote
    const votedKey = `voted_${id}`;
    if (localStorage.getItem(votedKey)) {
      return; // Already voted
    }

    if (mode === 'demo') {
      const current = (demoVotes[id] || 0) + 1;
      const nextMap = { ...demoVotes, [id]: current };
      setDemoVotes(nextMap);
      localStorage.setItem(demoVotesKey, JSON.stringify(nextMap));
      localStorage.setItem(votedKey, 'true'); // Mark locally as voted
      setItems(prev => prev.map(it => it.id === id ? { ...it, votes: current } : it));
      return;
    }
    try {
      const db = getFirestore(firebaseApp);
      await runTransaction(db, async (tx) => {
        const ref = doc(db, 'reports', id);
        const snap = await tx.get(ref);
        if (!snap.exists()) return;
        
        const data = snap.data();
        const next = (data.votes || 0) + 1;
        tx.update(ref, { votes: next });
      });
      
      localStorage.setItem(votedKey, 'true'); // Mark locally as voted on success
    } catch (e) {
      console.error("Upvote failed", e);
    }
  };

  const addComment = async (id) => {
    const text = (commentInputs[id] || '').trim();
    if (!text) return;
    if (mode === 'demo') {
      setItems(prev => prev.map(it => it.id === id ? { ...it, comments: [...(it.comments || []), { authorName: 'You', authorPhoto: null, text, createdAt: new Date() }] } : it));
      setCommentInputs(prev => ({ ...prev, [id]: '' }));
      return;
    }
    if (!currentUser) return;
    try {
      const db = getFirestore(firebaseApp);
      const ref = doc(db, 'reports', id);
      await updateDoc(ref, { comments: arrayUnion({ userId: currentUser.uid, authorName: currentUser.displayName || 'Anonymous', authorPhoto: currentUser.photoURL || null, text, createdAt: serverTimestamp() }) });
      setCommentInputs(prev => ({ ...prev, [id]: '' }));
    } catch (e) {
      console.error('Add comment failed', e);
    }
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
          <button 
            onClick={() => upvote(item.id)} 
            className={`w-8 h-8 rounded bg-white border text-slate-600 hover:text-gov-blue hover:border-gov-blue transition ${
              localStorage.getItem(`voted_${item.id}`) ? 'text-gov-blue border-gov-blue bg-blue-50' : 'border-slate-200'
            }`}
          >
            <ArrowUp size={16} />
          </button>
          <div className={`text-sm font-bold ${localStorage.getItem(`voted_${item.id}`) ? 'text-gov-blue' : 'text-slate-700'}`}>
            {item.votes || 0}
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            {item.project && (
               <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 font-bold truncate max-w-[150px]">
                 🏗️ {item.project.contractor || 'Project'}
               </span>
            )}
          </div>
          
          <div className="text-xs text-slate-500 mb-2 flex flex-wrap items-center gap-1">
            {item.authorPhoto && <img src={item.authorPhoto} className="w-4 h-4 rounded-full object-cover cursor-pointer" alt="" onClick={() => openProfileFor(item)} />}
            <span className="font-medium cursor-pointer" onClick={() => openProfileFor(item)}>{item.authorName || 'Anonymous'}</span>
            <span>•</span>
            <span className="truncate max-w-[200px]">{item.location || 'Unknown Location'}</span>
            <span>•</span>
            <span>{timeAgo(item.createdAt)}</span>
          </div>

          <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight">{item.title || 'Community Report'}</h3>
          
          {item.sentiment && (
             <div className="bg-slate-50 p-3 rounded-lg mb-3 border-l-2 border-gov-blue">
               <p className="text-sm text-slate-700 italic">"{item.sentiment}"</p>
             </div>
          )}

          <div className="rounded-lg overflow-hidden border border-slate-200 mb-3 bg-slate-100">
            {item.imageUrl ? (
              <img 
                src={item.imageUrl} 
                className="w-full h-64 object-cover" 
                alt="Report evidence" 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://placehold.co/600x400?text=Image+Error';
                }}
              />
            ) : (
              <div className="h-32 flex items-center justify-center text-slate-400 text-sm">
                No image provided
              </div>
            )}
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
            <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
              {item.comments && item.comments.length > 0 ? item.comments.map((c, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    {c.authorPhoto && <img src={c.authorPhoto} className="w-4 h-4 rounded-full object-cover" alt="" />}
                    <span className="font-bold text-slate-700 text-xs">{c.authorName || 'Citizen'}</span>
                  </div>
                  <div className="text-slate-700 text-sm">{c.text}</div>
                </div>
              )) : (
                <div className="text-xs text-slate-500">No comments yet.</div>
              )}
              <div className="flex items-center gap-2">
                <input
                  value={commentInputs[item.id] || ''}
                  onChange={(e) => setCommentInputs(prev => ({ ...prev, [item.id]: e.target.value }))}
                  placeholder="Write a comment"
                  className="flex-1 p-2 border border-slate-300 rounded-lg text-sm"
                />
                <button
                  onClick={() => addComment(item.id)}
                  disabled={(!currentUser && mode !== 'demo') || !(commentInputs[item.id] || '').trim()}
                  className="px-3 py-2 bg-gov-blue text-white rounded-lg text-sm disabled:opacity-50"
                >
                  Post
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )), [items, openComments, demoVotes]);

  return (
    <div className="min-h-screen bg-gov-bg">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-gov-blue rounded-full animate-spin"></div>
            <span className="ml-3 text-sm text-slate-600">Loading SubaybayPH...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-center">
            <AlertTriangle className="mx-auto text-red-500 mb-2" size={24} />
            <h3 className="font-bold text-red-800">Unable to load feed</h3>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
           <div className="text-center py-10 text-slate-500">
             <p>No reports found yet. Be the first to report!</p>
           </div>
        )}

        {!loading && (
          <div className="space-y-4">
            {cards}
          </div>
        )}
      </div>
      {profileOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm text-center">
            <img src={profile?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.displayName || 'Citizen')}`} className="w-16 h-16 rounded-full border border-slate-200 mx-auto mb-2 object-cover" alt="" />
            <h3 className="text-lg font-bold text-slate-800">{profile?.displayName || 'Citizen'}</h3>
            {typeof profile?.reputation === 'number' && (
              <p className="text-xs text-slate-500">Reputation: {profile.reputation}</p>
            )}
            <div className="mt-4">
              <button onClick={() => setProfileOpen(false)} className="text-sm text-slate-600 hover:text-slate-900">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
