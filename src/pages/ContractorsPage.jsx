import React, { useState, useMemo, useEffect } from 'react';
import { Search } from 'lucide-react';
import { fetchCsvProjects } from '../services/sumbong';

export default function ContractorsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [projects, setProjects] = useState([]);
  useEffect(() => {
    (async () => {
      const csv = await fetchCsvProjects();
      if (csv && csv.length) setProjects(csv);
    })();
  }, []);

  const contractors = useMemo(() => {
    const stats = {};
    
    projects.forEach(p => {
      const name = p.contractor || '';
      if (!name) return;
      if (!stats[name]) {
        stats[name] = { name, projects: 0, total: 0 };
      }
      stats[name].projects += 1;
      stats[name].total += (p.cost || 0);
    });

    return Object.values(stats).sort((a, b) => b.total - a.total);
  }, [projects]);

  const filteredContractors = contractors.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Search contractors..." 
          className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gov-blue"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContractors.map((c, idx) => (
          <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold text-lg">
                {c.name.charAt(0)}
              </div>
              <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded-full">
                {c.projects} Projects
              </span>
            </div>
            <h3 className="font-bold text-slate-800 mb-1 truncate" title={c.name}>{c.name}</h3>
            <p className="text-sm text-slate-500">Total Contracts: <span className="font-bold text-green-600">₱{(c.total / 1000000).toFixed(1)}M</span></p>
          </div>
        ))}
      </div>
    </div>
  );
}
