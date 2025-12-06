import React, { useEffect, useState, useMemo } from 'react';
import { fetchCsvProjects } from '../services/sumbong';
import { Filter, Search } from 'lucide-react';

export default function TablePage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 50;

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
      // Use setTimeout to allow UI to render loading state before heavy parsing
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
    setPage(1); // Reset page on filter change
  };

  // Pagination Logic
  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);
  const paginatedProjects = filteredProjects.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)]">
      {/* Sidebar Filters */}
      <div className="w-full lg:w-64 flex-shrink-0 bg-white rounded-xl border border-slate-200 shadow-sm p-4 h-fit lg:h-full flex flex-col">
        <div className="flex items-center gap-2 mb-4 text-slate-800 font-bold flex-shrink-0">
          <Filter size={20} className="text-gov-blue" />
          <h3>Filters</h3>
        </div>

        <div className="space-y-4 overflow-y-auto flex-1 pr-1 custom-scrollbar">
          {/* Search */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Search Projects</label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Projects, contractors..."
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Dropdowns */}
          {[
            { label: 'Year', key: 'year', options: options.years },
            { label: 'Region', key: 'region', options: options.regions },
            { label: 'Province', key: 'province', options: options.provinces },
            { label: 'Type of Work', key: 'typeOfWork', options: options.types },
            { label: 'District Engineering Office', key: 'deo', options: options.deos },
            { label: 'Legislative District', key: 'legislativeDistrict', options: options.legislativeDistricts },
          ].map((filter) => (
            <div key={filter.key}>
              <label className="block text-xs font-semibold text-slate-500 mb-1">{filter.label}</label>
              <select
                value={filters[filter.key]}
                onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              >
                <option value="">Select {filter.label}</option>
                {filter.options.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          ))}
          
          {/* Reset Button */}
          <button 
            onClick={() => {
              setSearchInput('');
              setFilters({
                year: '',
                region: '',
                province: '',
                typeOfWork: '',
                deo: '',
                legislativeDistrict: ''
              });
            }}
            className="w-full py-2 text-sm text-slate-500 hover:text-gov-blue hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-200"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 flex-shrink-0">
          <h3 className="font-bold text-slate-700">Project List</h3>
          <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
            <span>
              Showing {filteredProjects.length} records
            </span>
            {totalPages > 1 && (
              <div className="flex items-center gap-1 ml-2">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1 rounded hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  &lt;
                </button>
                <span className="text-slate-700">Page {page} of {totalPages}</span>
                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1 rounded hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  &gt;
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white text-slate-500 font-medium border-b border-slate-200 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="p-4 whitespace-nowrap bg-slate-50">Project Description</th>
                <th className="p-4 whitespace-nowrap bg-slate-50">Location</th>
                <th className="p-4 whitespace-nowrap bg-slate-50">Contractor</th>
                <th className="p-4 whitespace-nowrap text-right bg-slate-50">Cost (PHP)</th>
                <th className="p-4 whitespace-nowrap text-right bg-slate-50">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                 <tr><td colSpan="5" className="p-8 text-center text-slate-500">Loading data...</td></tr>
              ) : filteredProjects.length === 0 ? (
                 <tr><td colSpan="5" className="p-8 text-center text-slate-500">No projects found matching filters.</td></tr>
              ) : (
                paginatedProjects.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-slate-800 truncate max-w-[300px]" title={p.desc}>{p.desc}</div>
                      <div className="flex gap-2 mt-1">
                         {p.infraYear && <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded border border-blue-100">{p.infraYear}</span>}
                         {p.typeOfWork && <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded border border-slate-200">{p.typeOfWork}</span>}
                      </div>
                    </td>
                    <td className="p-4 text-slate-600">
                      <div className="text-xs font-bold bg-slate-100 px-2 py-1 rounded w-fit mb-1">{p.region}</div>
                      {p.location || ''}
                    </td>
                    <td className="p-4 text-slate-600 text-xs font-mono font-bold">{p.contractor}</td>
                    <td className="p-4 text-right font-bold text-slate-700">₱{p.cost.toLocaleString()}</td>
                    <td className="p-4 text-right text-xs text-slate-500 whitespace-nowrap">{p.date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
