export async function fetchSumbongProjects() {
  try {
    const cacheKey = 'sumbong_projects_cache_v1';
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.ts < 24 * 60 * 60 * 1000) {
        return parsed.projects;
      }
    }

    const resp = await fetch('https://r.jina.ai/http://sumbongsapangulo.ph');
    if (!resp.ok) throw new Error('failed to fetch source');
    const text = await resp.text();

    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const projects = [];
    for (let i = 0; i < lines.length; i++) {
      const descLine = lines[i];
      if (!/^(Construction|Installation|Rehabilitation)/i.test(descLine)) continue;

      const regionLine = lines[i + 1] || '';
      const contractorLine = lines[i + 2] || '';
      const costLine = lines[i + 3] || '';
      const dateLine = lines[i + 4] || '';

      const costStr = (costLine.match(/[\d,]+(?:\.\d+)?/) || [null])[0];
      const dateStr = (dateLine.match(/\d{2}\/\d{2}\/\d{4}/) || [null])[0];

      if (!costStr || !dateStr) continue;

      const cost = parseFloat(costStr.replace(/,/g, ''));
      projects.push({
        desc: descLine,
        region: regionLine,
        contractor: contractorLine,
        cost,
        date: dateStr,
      });
    }

    localStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), projects }));
    return projects;
  } catch (e) {
    return [];
  }
}

export async function fetchCsvProjects() {
  try {
    const cacheKey = 'csv_projects_cache_v1';
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.ts < 6 * 60 * 60 * 1000) {
        return parsed.projects;
      }
    }

    // Try production path first, fallback to dev path if needed
    let url = '/flood-control-projects-contractors_2025-12-06.csv';
    let resp = await fetch(url);
    
    if (!resp.ok) {
      // Fallback for local development if public/ isn't served at root (rare in Vite but safe)
      url = new URL('../data/flood-control-projects-contractors_2025-12-06.csv', import.meta.url).href;
      resp = await fetch(url);
    }
    
    if (!resp.ok) throw new Error('failed to fetch csv');
    const text = await resp.text();

    function parseCsv(t) {
      const rows = [];
      let cur = [];
      let cell = '';
      let inQuotes = false;
      for (let i = 0; i < t.length; i++) {
        const ch = t[i];
        if (ch === '"') {
          if (inQuotes && t[i + 1] === '"') {
            cell += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (ch === ',' && !inQuotes) {
          cur.push(cell);
          cell = '';
        } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
          if (cell !== '' || cur.length > 0) {
            cur.push(cell);
            rows.push(cur);
            cur = [];
            cell = '';
          }
          if (ch === '\r' && t[i + 1] === '\n') i++;
        } else {
          cell += ch;
        }
      }
      if (cell !== '' || cur.length > 0) {
        cur.push(cell);
        rows.push(cur);
      }
      return rows;
    }

    const rows = parseCsv(text);
    if (!rows.length) return [];
    const header = rows[0];
    const idx = (name) => header.indexOf(name);
    const get = (row, name) => {
      const i = idx(name);
      if (i === -1) return '';
      const v = row[i] ?? '';
      return typeof v === 'string' ? v.trim() : v;
    };

    const toDateStr = (row) => {
      const actual = get(row, 'CompletionDateActual');
      if (actual) return actual;
      const orig = get(row, 'CompletionDateOriginal');
      if (orig) {
        const n = Number(orig);
        if (!isNaN(n)) return new Date(n).toISOString().slice(0, 10);
      }
      const start = get(row, 'StartDate');
      if (start) {
        const d = new Date(start);
        if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
      }
      return '';
    };

    const projects = rows.slice(1).map((row) => {
      const province = get(row, 'Province');
      const municipality = get(row, 'Municipality');
      const location = [municipality, province].filter(Boolean).join(', ');
      const costStr = get(row, 'ContractCost') || get(row, 'ABC') || '0';
      const cost = parseFloat(costStr.toString().replace(/,/g, '')) || 0;
      return {
        desc: get(row, 'ProjectComponentDescription') || get(row, 'ProjectDescription'),
        region: get(row, 'Region'),
        location,
        contractor: get(row, 'Contractor'),
        cost,
        date: toDateStr(row),
        typeOfWork: get(row, 'TypeofWork'),
        infraYear: get(row, 'InfraYear'),
        province: get(row, 'Province'),
        deo: get(row, 'DistrictEngineeringOffice') || get(row, 'ImplementingOffice'),
        legislativeDistrict: get(row, 'LegislativeDistrict'),
        latitude: get(row, 'Latitude'),
        longitude: get(row, 'Longitude'),
      };
    }).filter(p => p.desc);

    localStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), projects }));
    return projects;
  } catch (e) {
    return [];
  }
}
