import React, { useState, useMemo, useEffect } from 'react';
import { Search, ChevronRight, ExternalLink, BarChart3, FolderOpen, DollarSign } from 'lucide-react';
import { fetchCsvProjects } from '../services/sumbong';

export default function ContractorsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContractor, setSelectedContractor] = useState(null);
  
  // Search & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setTimeout(async () => {
        const csv = await fetchCsvProjects();
        if (csv && csv.length) {
          setProjects(csv);
          // Auto-select first contractor if not selected
          // But waiting for data processing first
        }
        setLoading(false);
      }, 50);
    })();
  }, []);

  const contractors = useMemo(() => {
    const stats = {};
    projects.forEach(p => {
      const name = p.contractor || 'Unknown Contractor';
      if (!stats[name]) {
        stats[name] = { 
          name, 
          count: 0, 
          totalCost: 0,
          projects: []
        };
      }
      stats[name].count += 1;
      stats[name].totalCost += (p.cost || 0);
      stats[name].projects.push(p);
    });
    return Object.values(stats).sort((a, b) => b.totalCost - a.totalCost);
  }, [projects]);

  const filteredContractors = useMemo(() => {
    return contractors.filter(c => 
      c.name.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [contractors, debouncedSearch]);

  // Select first contractor by default when list loads
  useEffect(() => {
    if (!selectedContractor && filteredContractors.length > 0) {
      setSelectedContractor(filteredContractors[0]);
    }
  }, [filteredContractors, selectedContractor]);

  // Stats for selected contractor
  const selectedStats = useMemo(() => {
    if (!selectedContractor) return null;
    const avg = selectedContractor.totalCost / selectedContractor.count;
    return {
      totalProjects: selectedContractor.count,
      totalCost: selectedContractor.totalCost,
      avgCost: avg
    };
  }, [selectedContractor]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)]">
      {/* Sidebar List */}
      <div className="w-full lg:w-80 flex-shrink-0 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
             <UsersIcon size={20} className="text-gov-blue" /> Contractors
          </h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search contractors..." 
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-sm">Loading contractors...</div>
          ) : filteredContractors.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No contractors found.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredContractors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setSelectedContractor(c)}
                  className={`w-full text-left p-4 hover:bg-slate-50 transition-colors flex justify-between items-center group ${
                    selectedContractor?.name === c.name ? 'bg-blue-50 border-l-4 border-gov-blue' : 'border-l-4 border-transparent'
                  }`}
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <h4 className={`font-bold text-xs md:text-sm truncate mb-1 ${
                      selectedContractor?.name === c.name ? 'text-gov-blue' : 'text-slate-700'
                    }`}>
                      {c.name}
                    </h4>
                    <span className="text-[10px] text-slate-500 font-medium">
                      ₱{(c.totalCost / 1000000).toLocaleString()}M Total
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">
                      {c.count}
                    </span>
                    <ChevronRight size={14} className="text-slate-400 group-hover:text-slate-600" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        {selectedContractor ? (
          <>
            {/* Header Stats */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-bold text-slate-800 leading-tight">
                  Projects by {selectedContractor.name}
                </h2>
                <button className="text-sm text-gov-blue font-bold flex items-center gap-1 hover:underline">
                  <ExternalLink size={14} /> Export Data
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard 
                  label="Total Projects" 
                  value={selectedStats.totalProjects} 
                  icon={<FolderOpen size={20} className="text-blue-600" />}
                  bg="bg-blue-50"
                  text="text-blue-700"
                />
                <StatCard 
                  label="Total Contract Cost" 
                  value={`₱${selectedStats.totalCost.toLocaleString()}`} 
                  icon={<DollarSign size={20} className="text-green-600" />}
                  bg="bg-green-50"
                  text="text-green-700"
                />
                <StatCard 
                  label="Average Project Cost" 
                  value={`₱${selectedStats.avgCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} 
                  icon={<BarChart3 size={20} className="text-purple-600" />}
                  bg="bg-purple-50"
                  text="text-purple-700"
                />
              </div>
            </div>

            {/* Project Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex-1 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-200 bg-slate-50">
                <h3 className="font-bold text-slate-700 text-sm">Project List</h3>
              </div>
              <div className="flex-1 overflow-auto custom-scrollbar">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white text-slate-500 font-medium border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                    <tr>
                      <th className="p-4 whitespace-nowrap">Project Description</th>
                      <th className="p-4 whitespace-nowrap">Year</th>
                      <th className="p-4 whitespace-nowrap">Location</th>
                      <th className="p-4 whitespace-nowrap">Type of Work</th>
                      <th className="p-4 whitespace-nowrap text-right">Contract Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedContractor.projects.map((p, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 max-w-xs">
                          <div className="font-semibold text-slate-800 line-clamp-2" title={p.desc}>{p.desc}</div>
                        </td>
                        <td className="p-4 whitespace-nowrap text-slate-600">{p.infraYear || '-'}</td>
                        <td className="p-4 whitespace-nowrap text-slate-600">
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-700">{p.province || p.region}</span>
                            <span className="text-xs">{p.location?.split(',')[0]}</span>
                          </div>
                        </td>
                        <td className="p-4 whitespace-nowrap text-slate-600 max-w-[150px] truncate" title={p.typeOfWork}>
                          {p.typeOfWork || '-'}
                        </td>
                        <td className="p-4 whitespace-nowrap text-right font-mono font-bold text-slate-700">
                          ₱{p.cost.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            Select a contractor to view details
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, bg, text }) {
  return (
    <div className={`${bg} rounded-xl p-4 border border-transparent`}>
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-white rounded-lg shadow-sm">{icon}</div>
        <span className={`text-xs font-bold uppercase tracking-wider ${text} opacity-80`}>{label}</span>
      </div>
      <div className={`text-xl md:text-2xl font-bold ${text}`}>
        {value}
      </div>
    </div>
  );
}

function UsersIcon({ size, className }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  );
}
