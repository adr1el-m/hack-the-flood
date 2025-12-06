import React, { useEffect, useState, useMemo } from 'react';
import { fetchCsvProjects } from '../services/sumbong';
import { Filter, Search, ArrowRight, AlertTriangle } from 'lucide-react';

export default function ProjectSelector({ onSelect, onCancel }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  // Filters
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filters, setFilters] = useState({
    year: '',
    region: '',
    province: '',
    typeOfWork: '',
    deo: '',
    legislativeDistrict: ''
  });

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1); // Reset page on search change
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setTimeout(async () => {
        const csv = await fetchCsvProjects();
        if (csv && csv.length) setProjects(csv);
        setLoading(false);
      }, 50);
    })();
  }, []);

  // Derive options
  const options = useMemo(() => {
    const extract = (key) => [...new Set(projects.map(p => p[key]).filter(Boolean))].sort();
    return {
      years: extract('infraYear'),
      regions: extract('region'),
      provinces: extract('province'),
      types: extract('typeOfWork'),
      deos: extract('deo'),
      legislativeDistricts: extract('legislativeDistrict')
    };
  }, [projects]);

  // Filter projects
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesSearch = !debouncedSearch || 
        p.desc?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        p.contractor?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        p.location?.toLowerCase().includes(debouncedSearch.toLowerCase());

      const matchesYear = !filters.year || p.infraYear === filters.year;
      const matchesRegion = !filters.region || p.region === filters.region;
      const matchesProvince = !filters.province || p.province === filters.province;
      const matchesType = !filters.typeOfWork || p.typeOfWork === filters.typeOfWork;
      const matchesDeo = !filters.deo || p.deo === filters.deo;
      const matchesLeg = !filters.legislativeDistrict || p.legislativeDistrict === filters.legislativeDistrict;

      return matchesSearch && matchesYear && matchesRegion && matchesProvince && matchesType && matchesDeo && matchesLeg;
    });
  }, [projects, debouncedSearch, filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  // Pagination Logic
  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);
  const paginatedProjects = filteredProjects.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <div className="fixed inset-0 bg-white z-40 flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-white shadow-sm z-20">
        <button onClick={onCancel} className="text-slate-500 hover:text-slate-800 text-sm font-medium px-2 py-1">
          Cancel
        </button>
        <h2 className="font-bold text-slate-800">Select Project to Report</h2>
        <div className="w-16"></div> {/* Spacer for center alignment */}
      </div>

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden relative">
        {/* Sidebar Filters (Collapsible on mobile maybe? For now stack) */}
        <div className="w-full lg:w-64 flex-shrink-0 bg-slate-50 border-r border-slate-200 p-4 overflow-y-auto custom-scrollbar lg:block hidden">
          <div className="flex items-center gap-2 mb-4 text-slate-800 font-bold">
            <Filter size={18} className="text-gov-blue" />
            <h3>Filters</h3>
          </div>

          <div className="space-y-4">
            {/* Search */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Search</label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Find project..."
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Dropdowns */}
            {[
              { label: 'Year', key: 'year', options: options.years },
              { label: 'Region', key: 'region', options: options.regions },
              { label: 'Province', key: 'province', options: options.provinces },
              { label: 'Type', key: 'typeOfWork', options: options.types },
            ].map((filter) => (
              <div key={filter.key}>
                <label className="block text-xs font-semibold text-slate-500 mb-1">{filter.label}</label>
                <select
                  value={filters[filter.key]}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="">All</option>
                  {filter.options.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Filter Toggle / Simple Search for Mobile */}
        <div className="lg:hidden p-4 bg-slate-50 border-b border-slate-200">
          <div className="relative">
             <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
             <input 
               type="text"
               value={searchInput}
               onChange={(e) => setSearchInput(e.target.value)}
               placeholder="Search projects..."
               className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
             />
           </div>
           <div className="mt-2 flex gap-2 overflow-x-auto hide-scrollbar">
              <select 
                className="bg-white border border-slate-200 text-xs rounded px-2 py-1"
                value={filters.region}
                onChange={(e) => handleFilterChange('region', e.target.value)}
              >
                <option value="">All Regions</option>
                {options.regions.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <select 
                className="bg-white border border-slate-200 text-xs rounded px-2 py-1"
                value={filters.year}
                onChange={(e) => handleFilterChange('year', e.target.value)}
              >
                <option value="">All Years</option>
                {options.years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
           </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto bg-white p-4">
          <div className="flex justify-between items-center mb-4">
             <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
               {loading ? 'Loading...' : `Found ${filteredProjects.length} Projects`}
             </span>
             
             {/* Pagination Controls */}
             {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 text-slate-600"
                >
                  &lt;
                </button>
                <span className="text-xs font-medium text-slate-600">
                  {page} / {totalPages}
                </span>
                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 text-slate-600"
                >
                  &gt;
                </button>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {loading ? (
               <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
                 <div className="w-6 h-6 border-2 border-slate-200 border-t-gov-blue rounded-full animate-spin"></div>
                 <span className="text-sm">Loading projects...</span>
               </div>
            ) : paginatedProjects.length === 0 ? (
               <div className="text-center py-20 text-slate-400">
                 <AlertTriangle size={32} className="mx-auto mb-2 opacity-50" />
                 <p>No projects found matching your search.</p>
               </div>
            ) : (
              paginatedProjects.map((p, idx) => (
                <div key={idx} className="border border-slate-200 rounded-xl p-4 hover:border-blue-300 transition-colors shadow-sm group">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-1.5 py-0.5 rounded">{p.infraYear}</span>
                        <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-1.5 py-0.5 rounded">{p.typeOfWork}</span>
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm leading-snug mb-1 line-clamp-2" title={p.desc}>
                        {p.desc}
                      </h4>
                      <div className="text-xs text-slate-500 mb-2 truncate">
                        {p.location} • {p.contractor}
                      </div>
                      <div className="font-mono text-xs font-bold text-slate-700">
                        ₱{p.cost.toLocaleString()}
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => onSelect(p)}
                      className="bg-gov-blue text-white p-2 rounded-lg shadow-sm hover:bg-blue-700 active:scale-95 transition-all flex-shrink-0 group-hover:shadow-md"
                    >
                      <ArrowRight size={20} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {!loading && paginatedProjects.length > 0 && (
            <div className="mt-6 text-center">
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="text-sm text-gov-blue font-bold disabled:opacity-0 hover:underline"
              >
                Load Next Page
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
