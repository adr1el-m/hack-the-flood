import React, { useMemo, useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';
import { fetchCsvProjects } from '../services/sumbong';
import { Filter } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function VisualsPage() {
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [year, setYear] = useState('');
  const [region, setRegion] = useState('');
  const [type, setType] = useState('');
  const [province, setProvince] = useState('');
  const [deo, setDeo] = useState('');
  const [district, setDistrict] = useState('');
  useEffect(() => {
    (async () => {
      const csv = await fetchCsvProjects();
      if (csv && csv.length) setProjects(csv);
    })();
  }, []);

  const classifyType = (p) => {
    const csv = (p.typeOfWork || '').toLowerCase();
    if (csv.includes('flood')) return 'Flood Mitigation';
    if (csv.includes('drainage')) return 'Drainage';
    if (csv.includes('slope')) return 'Slope Protection';
    if (csv.includes('river')) return 'River Control';
    if (csv.includes('pump')) return 'Pump';
    const d = (p.desc || '').toLowerCase();
    if (d.includes('flood')) return 'Flood Mitigation';
    if (d.includes('drainage')) return 'Drainage';
    if (d.includes('slope')) return 'Slope Protection';
    if (d.includes('river')) return 'River Control';
    if (d.includes('pump')) return 'Pump';
    return 'Others';
  };

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesSearch = searchTerm
        ? [p.desc, p.contractor, p.region, p.location].filter(Boolean).some(v => v.toLowerCase().includes(searchTerm.toLowerCase()))
        : true;
      const matchesYear = year ? new Date(p.date).getFullYear().toString() === year : true;
      const matchesRegion = region ? (p.region === region) : true;
      const matchesType = type ? (classifyType(p) === type) : true;
      return matchesSearch && matchesYear && matchesRegion && matchesType;
    });
  }, [projects, searchTerm, year, region, type]);

  const yearOptions = useMemo(() => {
    const set = new Set();
    projects.forEach(p => {
      const y = new Date(p.date).getFullYear();
      if (!isNaN(y)) set.add(y.toString());
    });
    return Array.from(set).sort((a, b) => parseInt(b) - parseInt(a));
  }, [projects]);

  const regionOptions = useMemo(() => {
    const set = new Set(projects.map(p => p.region).filter(Boolean));
    return Array.from(set).sort();
  }, [projects]);

  const typeOptions = ['Flood Mitigation', 'Drainage', 'Slope Protection', 'River Control', 'Pump', 'Others'];

  // Dynamic Data Calculations
  const stats = useMemo(() => {
    const totalProjects = filteredProjects.length;
    const totalCost = filteredProjects.reduce((sum, p) => sum + (p.cost || 0), 0);
    const uniqueContractors = new Set(filteredProjects.map(p => p.contractor)).size;

    const years = {};
    filteredProjects.forEach(p => {
      const y = new Date(p.date).getFullYear();
      if (!isNaN(y)) years[y] = (years[y] || 0) + 1;
    });

    const regions = {};
    filteredProjects.forEach(p => {
      if (p.region) regions[p.region] = (regions[p.region] || 0) + 1;
    });

    const types = { 'Flood Mitigation': 0, 'Drainage': 0, 'Slope Protection': 0, 'River Control': 0, 'Pump': 0, 'Others': 0 };
    filteredProjects.forEach(p => {
      const t = classifyType(p);
      types[t] = (types[t] || 0) + 1;
    });

    const contractors = {};
    filteredProjects.forEach(p => {
      if (p.contractor) contractors[p.contractor] = (contractors[p.contractor] || 0) + 1;
    });
    // Sort contractors by count desc
    const sortedContractors = Object.entries(contractors)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7);

    return {
      totalProjects,
      totalCost,
      uniqueContractors,
      years,
      regions,
      types,
      sortedContractors
    };
  }, [filteredProjects]);

  const projectsByYearData = {
    labels: Object.keys(stats.years),
    datasets: [
      {
        label: 'Projects',
        data: Object.values(stats.years),
        backgroundColor: '#0ea5e9',
        borderRadius: 4,
      },
    ],
  };

  const topRegionsData = {
    labels: Object.keys(stats.regions),
    datasets: [
      {
        data: Object.values(stats.regions),
        backgroundColor: ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899'],
      },
    ],
  };

  const typesOfWorkData = {
    labels: Object.keys(stats.types).filter(k => stats.types[k] > 0),
    datasets: [
      {
        data: Object.values(stats.types).filter(v => v > 0),
        backgroundColor: ['#007bff', '#00c853', '#ffc107', '#6f42c1', '#fd7e14', '#20c997'],
      },
    ],
  };

  const topContractorsData = {
    labels: stats.sortedContractors.map(([name]) => name.length > 15 ? name.substring(0, 15) + '...' : name),
    datasets: [
      {
        label: 'Projects',
        data: stats.sortedContractors.map(([, count]) => count),
        backgroundColor: '#f97316',
        borderRadius: 4,
        indexAxis: 'y',
      },
    ],
  };

  const formatCurrency = (val) => {
    if (val >= 1e9) return `₱${(val / 1e9).toFixed(1)}B`;
    if (val >= 1e6) return `₱${(val / 1e6).toFixed(1)}M`;
    return `₱${val.toLocaleString()}`;
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <aside className="lg:col-span-3">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-slate-800 font-bold">
              <Filter size={18} className="text-gov-blue" />
              Filters
            </div>
            <div className="space-y-3">
              <input 
                type="text" 
                placeholder="Projects, contractors, municipalities" 
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gov-blue"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div>
                <label className="block text-xs text-slate-500 mb-1">Infrastructure Year</label>
                <select 
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                >
                  <option value="">Select Year</option>
                  {yearOptions.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Region</label>
                <select 
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                >
                  <option value="">Select Region</option>
                  {regionOptions.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Province</label>
                <select 
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                >
                  <option value="">Select Province</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Type of Work</label>
                <select 
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="">Select Type of Work</option>
                  {typeOptions.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">District Engineering Office</label>
                <select 
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                  value={deo}
                  onChange={(e) => setDeo(e.target.value)}
                >
                  <option value="">Select DEO</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Legislative District</label>
                <select 
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                >
                  <option value="">Select Legislative District</option>
                </select>
              </div>
            </div>
          </div>
        </aside>
        <section className="lg:col-span-9 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-sm text-slate-500 font-medium mb-1">Total Projects</p>
              <h3 className="text-3xl font-bold text-blue-600">{stats.totalProjects}</h3>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-sm text-slate-500 font-medium mb-1">Total Contract Cost</p>
              <h3 className="text-3xl font-bold text-green-600">{formatCurrency(stats.totalCost)}</h3>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-sm text-slate-500 font-medium mb-1">Unique Contractors</p>
              <h3 className="text-3xl font-bold text-purple-600">{stats.uniqueContractors}</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                Projects by Year
              </h4>
              <div className="h-72">
                <Bar 
                  data={projectsByYearData} 
                  options={{ 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: { 
                      legend: { display: false },
                      tooltip: {
                        backgroundColor: 'white',
                        titleColor: '#1e293b',
                        bodyColor: '#3b82f6',
                        borderColor: '#e2e8f0',
                        borderWidth: 1,
                        displayColors: false,
                        callbacks: {
                          label: (ctx) => `Projects: ${ctx.raw}`
                        }
                      }
                    },
                    scales: { 
                      y: { 
                        beginAtZero: true, 
                        ticks: { stepSize: 900, color: '#64748b' },
                        grid: {
                          color: '#e2e8f0',
                          borderDash: [5, 5]
                        }
                      },
                      x: {
                        grid: { display: false },
                        ticks: { color: '#64748b' }
                      }
                    }
                  }} 
                />
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
                Top Regions
              </h4>
              <div className="h-72 flex justify-center">
                <Pie 
                  data={topRegionsData} 
                  options={{ 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'right' } }
                  }} 
                />
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-green-500 rounded-full"></span>
                Types of Work
              </h4>
              <div className="h-72 flex justify-center">
                <Doughnut 
                  data={typesOfWorkData} 
                  options={{ 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'right' } }
                  }} 
                />
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-orange-500 rounded-full"></span>
                Top Contractors
              </h4>
              <div className="h-72">
                <Bar 
                  data={topContractorsData} 
                  options={{ 
                    responsive: true, 
                    maintainAspectRatio: false,
                    indexAxis: 'y',
                    plugins: { legend: { display: false } },
                    scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } }
                  }} 
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
