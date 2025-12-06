import React, { useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { ArrowLeft, PieChart, Table as TableIcon } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const floodProjects = [
  { desc: "Construction of Flood Mitigation Structure along Agusan River (Dankias Section) Package 1", loc: "Butuan City, Agusan Del Norte", contractor: "ME 3 CONSTRUCTION", cost: 137272357.59, date: "2025-05-30", region: "Caraga" },
  { desc: "Construction of Bank Protection, Lower Agusan River, Barangay Golden Ribbon", loc: "Butuan City, Agusan Del Norte", contractor: "RAMISES CONSTRUCTION", cost: 96158174.50, date: "2025-05-30", region: "Caraga" },
  { desc: "Construction of Flood Mitigation Structure along Orani River", loc: "Orani, Bataan", contractor: "ORANI CONSTRUCTION AND SUPPLY", cost: 48999998.54, date: "2025-05-28", region: "Region III" },
  { desc: "Construction of Flood Control Dike along Kabacan River", loc: "Magpet, Cotabato", contractor: "MAER SUMMIT KONSTRUKT CO.", cost: 96017492.67, date: "2025-05-27", region: "Region XII" },
  { desc: "Construction of Drainage Structure, Barangay Sacsac", loc: "Consolacion, Cebu", contractor: "XLA CONSTRUCTION", cost: 4939190.15, date: "2025-05-27", region: "Region VII" },
  { desc: "Construction of River Control Structure, Bucayao River, Managpi Section", loc: "Calapan City, Oriental Mindoro", contractor: "CEFF TRADING & ENGINEERING", cost: 19299949.90, date: "2025-05-27", region: "MIMAROPA" },
  { desc: "Construction of Drainage System, Mag-Asawang Tubig RIS", loc: "Naujan, Oriental Mindoro", contractor: "CEFF TRADING / JUWAWI CORP", cost: 14699999.28, date: "2025-05-26", region: "MIMAROPA" },
  { desc: "Construction of Flood Mitigation Structure along Cagayan de Oro City-Dominorog-Camp Kibaritan Rd", loc: "Talakag, Bukidnon", contractor: "VEN RAY CONSTRUCTION", cost: 96500000.00, date: "2025-05-23", region: "Region X" },
  { desc: "Construction of Flood Mitigation Structure along Pampanga River, Barangay Pagas", loc: "Cabanatuan City, Nueva Ecija", contractor: "CELSO C. FERRER CONSTRUCTION", cost: 95052371.10, date: "2025-05-23", region: "Region III" },
  { desc: "Construction of Slope Protection Structure along Buenavista Creek", loc: "Tarlac City, Tarlac", contractor: "BIG BERTHA CONSTRUCTION", cost: 14229719.67, date: "2025-05-22", region: "Region III" },
  { desc: "Installation of Booster Pump at Estero de San Miguel, Package 1b", loc: "Manila City", contractor: "EIGHT J'S / GENECOR", cost: 94675499.87, date: "2025-05-22", region: "NCR" }
];

export default function TransparencyBoard({ onBack }) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('visual');

  // Process Data
  const totalCost = floodProjects.reduce((acc, curr) => acc + curr.cost, 0);
  const uniqueContractors = new Set(floodProjects.map(p => p.contractor)).size;

  // Region Chart Data
  const regionCounts = {};
  floodProjects.forEach(p => { regionCounts[p.region] = (regionCounts[p.region] || 0) + p.cost; });
  
  const regionChartData = {
    labels: Object.keys(regionCounts),
    datasets: [{
      label: 'Total Cost (PHP)',
      data: Object.values(regionCounts),
      backgroundColor: '#3b82f6',
      borderRadius: 4
    }]
  };

  // Contractor Chart Data
  const contractorCosts = {};
  floodProjects.forEach(p => { contractorCosts[p.contractor] = (contractorCosts[p.contractor] || 0) + p.cost; });
  const sortedContractors = Object.entries(contractorCosts).sort((a,b) => b[1] - a[1]).slice(0, 5);
  
  const contractorChartData = {
    labels: sortedContractors.map(c => c[0].length > 15 ? c[0].substring(0, 15) + '...' : c[0]),
    datasets: [{
      data: sortedContractors.map(c => c[1]),
      backgroundColor: ['#1e3a8a', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe']
    }]
  };

  return (
    <div className="fixed inset-0 bg-gov-bg z-30 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-3 bg-white">
        <button onClick={onBack} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="font-bold text-slate-800 text-sm">{t('transparency_title')}</h2>
          <p className="text-[10px] text-slate-500">Data Source: sumbongsapangulo.ph</p>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="flex-1 overflow-y-auto p-4">
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs text-slate-500 font-medium uppercase mb-1">{t('total_projects')}</p>
            <h3 className="text-2xl font-bold text-slate-800">{floodProjects.length}</h3>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs text-slate-500 font-medium uppercase mb-1">{t('total_contract_cost')}</p>
            <h3 className="text-xl font-bold text-green-600">₱{(totalCost / 1000000).toFixed(1)}M</h3>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs text-slate-500 font-medium uppercase mb-1">{t('unique_contractors')}</p>
            <h3 className="text-2xl font-bold text-blue-600">{uniqueContractors}</h3>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 mb-4 gap-4">
          <button 
            className={`pb-2 text-sm font-medium transition-colors flex items-center gap-1 ${activeTab === 'visual' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 border-transparent'}`}
            onClick={() => setActiveTab('visual')}
          >
            <PieChart size={16} /> {t('visual')}
          </button>
          <button 
            className={`pb-2 text-sm font-medium transition-colors flex items-center gap-1 ${activeTab === 'table' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 border-transparent'}`}
            onClick={() => setActiveTab('table')}
          >
            <TableIcon size={16} /> {t('table')}
          </button>
        </div>

        {/* Visual Tab Content */}
        {activeTab === 'visual' && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <h4 className="font-bold text-slate-800 text-sm mb-4">{t('cost_by_region')}</h4>
              <div className="h-64">
                <Bar 
                  data={regionChartData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true, ticks: { callback: (val) => '₱' + (val/1000000) + 'M' } } }
                  }} 
                />
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <h4 className="font-bold text-slate-800 text-sm mb-4">{t('projects_by_contractor')}</h4>
              <div className="h-64 flex justify-center">
                <Doughnut 
                  data={contractorChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom' } }
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Table Tab Content */}
        {activeTab === 'table' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                  <tr>
                    <th className="p-3 whitespace-nowrap">{t('project_desc')}</th>
                    <th className="p-3 whitespace-nowrap">{t('location')}</th>
                    <th className="p-3 whitespace-nowrap">{t('contractor')}</th>
                    <th className="p-3 whitespace-nowrap text-right">{t('cost')}</th>
                    <th className="p-3 whitespace-nowrap text-right">{t('date')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {floodProjects.map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3">
                        <div className="font-semibold text-slate-800 truncate max-w-[200px]" title={p.desc}>{p.desc}</div>
                        <div className="text-xs text-slate-500 md:hidden">{p.region}</div>
                      </td>
                      <td className="p-3 text-slate-600">
                        <div className="text-xs font-bold bg-slate-100 px-2 py-1 rounded w-fit mb-1">{p.region}</div>
                        {p.loc}
                      </td>
                      <td className="p-3 text-slate-600 text-xs font-mono">{p.contractor}</td>
                      <td className="p-3 text-right font-bold text-slate-700">₱{p.cost.toLocaleString()}</td>
                      <td className="p-3 text-right text-xs text-slate-500">{p.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}