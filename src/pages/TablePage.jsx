import React, { useEffect, useState } from 'react';
import { fetchCsvProjects } from '../services/sumbong';

export default function TablePage() {
  const [floodProjects, setFloodProjects] = useState([]);
  useEffect(() => {
    (async () => {
      const csv = await fetchCsvProjects();
      if (csv && csv.length) setFloodProjects(csv);
    })();
  }, []);
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
            <tr>
              <th className="p-4 whitespace-nowrap">Project Description</th>
              <th className="p-4 whitespace-nowrap">Location</th>
              <th className="p-4 whitespace-nowrap">Contractor</th>
              <th className="p-4 whitespace-nowrap text-right">Cost (PHP)</th>
              <th className="p-4 whitespace-nowrap text-right">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {floodProjects.map((p, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                <td className="p-4">
                  <div className="font-semibold text-slate-800 truncate max-w-[300px]" title={p.desc}>{p.desc}</div>
                  <div className="text-xs text-slate-500 md:hidden">{p.region}</div>
                </td>
                <td className="p-4 text-slate-600">
                  <div className="text-xs font-bold bg-slate-100 px-2 py-1 rounded w-fit mb-1">{p.region}</div>
                  {p.location || ''}
                </td>
                <td className="p-4 text-slate-600 text-xs font-mono font-bold">{p.contractor}</td>
                <td className="p-4 text-right font-bold text-slate-700">₱{p.cost.toLocaleString()}</td>
                <td className="p-4 text-right text-xs text-slate-500 whitespace-nowrap">{p.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
