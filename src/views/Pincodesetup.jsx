import React, { useState, useEffect, useRef } from 'react';

const BASE_URL = 'http://localhost:5000/api';

const PincodeSetup = () => {
  const [zones, setZones] = useState([]);
  const [rows, setRows] = useState([]);
  const [loadingZones, setLoadingZones] = useState(false);
  const [loadingPincodes, setLoadingPincodes] = useState(false);
  const [saving, setSaving] = useState(false);

  const [filterZone, setFilterZone] = useState('');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const [addForm, setAddForm] = useState({ code: '', city: '', state: '', lat: '', lng: '' });
  const [editRow, setEditRow] = useState(null);   // stores _id
  const [editForm, setEditForm] = useState({});
  const [deleteId, setDeleteId] = useState(null);
  const fileInputRef = useRef(null);

  const [toast, setToast] = useState(null); // { msg, type }

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Fetch zones ──────────────────────────────────────────
  useEffect(() => {
    const fetchZones = async () => {
      try {
        setLoadingZones(true);
        const res = await fetch(`${BASE_URL}/zones`);
        const data = await res.json();
        if (data.success) setZones(data.data);
      } catch (err) {
        console.error('Error fetching zones:', err);
      } finally {
        setLoadingZones(false);
      }
    };
    fetchZones();
  }, []);

  // ── Fetch pincodes ───────────────────────────────────────
  const fetchPincodes = async () => {
    try {
      setLoadingPincodes(true);
      const res = await fetch(`${BASE_URL}/pincodes`);
      const data = await res.json();
      if (data.success) setRows(data.data);
    } catch (err) {
      console.error('Error fetching pincodes:', err);
    } finally {
      setLoadingPincodes(false);
    }
  };

  useEffect(() => { fetchPincodes(); }, []);

  // ── Zone selection helper (auto-fill lat/lng) ────────────
  const handleZoneSelect = (zoneName, formSetter) => {
    const selectedZone = zones.find((z) => z.name === zoneName);
    let lat = '', lng = '';
    if (selectedZone?.coordinates?.length) {
      const total = selectedZone.coordinates.length;
      lat = (selectedZone.coordinates.reduce((s, c) => s + c.lat, 0) / total).toFixed(6);
      lng = (selectedZone.coordinates.reduce((s, c) => s + c.lng, 0) / total).toFixed(6);
    }
    formSetter((f) => ({
      ...f,
      state: zoneName,
      zone_id: selectedZone?._id || '',
      lat,
      lng
    }));
  };

  // ── Filter ───────────────────────────────────────────────
  const filtered = rows.filter((r) => {
    const normalize = (s) => (s || '').toLowerCase().trim().replace(/e$/, '');
    // Check zone_id.name first, then fall back to r.state
    const rowZoneName = r.zone_id?.name || r.state || '';
    const matchZone = filterZone ? normalize(rowZoneName) === normalize(filterZone) : true;

    const s = search.toLowerCase();
    const matchSearch = search
      ? r.city?.toLowerCase().includes(s) || r.code?.includes(s) || r.state?.toLowerCase().includes(s)
      : true;
    return matchZone && matchSearch;
  });

  // ── Pagination ──────────────────────────────────────────
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedRows = filtered.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterZone, search]);

  // ── CREATE ───────────────────────────────────────────────
  const handleAdd = async () => {
    const { code, city, state, lat, lng } = addForm;
    if (!code || !lat || !lng) {
      showToast('Pincode, Latitude and Longitude are required', 'error');
      return;
    }
    try {
      setSaving(true);
      const res = await fetch(`${BASE_URL}/pincodes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, city, state, zone_id: addForm.zone_id, country: 'India', lat, lng }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Pincode created successfully!');
        setAddForm({ code: '', city: '', state: '', lat: '', lng: '' });
        fetchPincodes();
      } else {
        showToast(data.message || 'Failed to create pincode', 'error');
      }
    } catch (err) {
      console.error('Error creating pincode:', err);
      showToast('Network error. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── OPEN EDIT ────────────────────────────────────────────
  const openEdit = (row) => {
    setEditRow(row._id);
    setEditForm({
      code: row.code || '',
      city: row.city || '',
      state: row.zone_id?.name || row.state || '',
      zone_id: row.zone_id?._id || row.zone_id || '',
      country: row.country || 'India',
      lat: row.location?.coordinates?.[1]?.toString() || '',
      lng: row.location?.coordinates?.[0]?.toString() || '',
      status: row.status || 'Active',
    });
  };

  // ── UPDATE ───────────────────────────────────────────────
  const handleEditSave = async () => {
    const { code, city, state, country, lat, lng, status } = editForm;
    try {
      setSaving(true);
      const res = await fetch(`${BASE_URL}/pincodes/${editRow}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, city, state, zone_id: editForm.zone_id, country, lat, lng, status }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Pincode updated successfully!');
        setEditRow(null);
        fetchPincodes();
      } else {
        showToast(data.message || 'Failed to update pincode', 'error');
      }
    } catch (err) {
      console.error('Error updating pincode:', err);
      showToast('Network error. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── DELETE ───────────────────────────────────────────────
  const handleDelete = async () => {
    try {
      setSaving(true);
      const res = await fetch(`${BASE_URL}/pincodes/${deleteId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Pincode deleted successfully!');
        setDeleteId(null);
        fetchPincodes();
      } else {
        showToast(data.message || 'Failed to delete pincode', 'error');
      }
    } catch (err) {
      console.error('Error deleting pincode:', err);
      showToast('Network error. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── CSV Export ───────────────────────────────────────────
  const handleExportCSV = () => {
    const headers = ['Sl No', 'Pincode', 'Area', 'Zone/District', 'Status'];
    const csvRows = [
      headers.join(','),
      ...filtered.map((r, i) =>
        [`#${i + 1}`, r.code, `"${r.city || ''}"`, `"${r.state || ''}"`, r.status || ''].join(',')
      ),
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pincodes.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── CSV Import ───────────────────────────────────────────
  const handleImportCSV = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const csvData = event.target.result;
      const lines = csvData.split('\n');
      if (lines.length < 2) {
        showToast('CSV file is empty or invalid', 'error');
        return;
      }

      // Simple CSV parser
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const pincodes = [];

      const stateIdx = headers.findIndex(h => h.includes('state'));

      for (let i = 1; i < lines.length; i++) {
        const currentLine = lines[i].split(',');
        if (currentLine.length < 3) continue;

        // 🔍 Auto-filter for Kerala if state column exists
        if (stateIdx !== -1) {
          const stateValue = currentLine[stateIdx]?.trim().replace(/^"|"$/g, '').toUpperCase();
          if (stateValue && stateValue !== 'KERALA') continue;
        }

        const pincodeObj = {};
        currentLine.forEach((cell, idx) => {
  const header = headers[idx];
  const value = cell.trim().replace(/^"|"$/g, '');

  if (!value) return;

  // PINCODE
  if (header.includes('pincode') || header.includes('code') || header === 'pin') {
    pincodeObj.code = value;
  }

  // OFFICE NAME → AREA NAME
 else if (header.includes('officename')) {
  const cleaned = value.replace(/\s+(BO|PO|HO|SO)$/i, '').trim();
  if (cleaned && !['BO', 'PO', 'HO', 'SO'].includes(cleaned.toUpperCase())) {
    pincodeObj.city = cleaned;
  } else {
    pincodeObj.city = value.trim();
  }
}

  // DISTRICT → ZONE
  else if (header.includes('district')) {
    pincodeObj.zone = value;
  }

  // STATE
  else if (header.includes('state')) {
    pincodeObj.state = value;
  }

  // LAT
  else if (header.includes('lat')) {
    pincodeObj.lat = value;
  }

  // LNG
  else if (header.includes('lon') || header.includes('lng')) {
    pincodeObj.lng = value;
  }
});


        if (pincodeObj.code && pincodeObj.lat && pincodeObj.lng) {
          pincodes.push(pincodeObj);
        }
      }

      if (pincodes.length === 0) {
        showToast('No valid pincodes found in CSV. Ensure headers: pincode, area, zone, lat, lng', 'error');
        return;
      }

      // Send to backend in chunks to avoid "Request Entity Too Large" / Timeout
      try {
        setSaving(true);
        const CHUNK_SIZE = 500;
        let successCount = 0;

        for (let i = 0; i < pincodes.length; i += CHUNK_SIZE) {
          const chunk = pincodes.slice(i, i + CHUNK_SIZE);
          const res = await fetch(`${BASE_URL}/pincodes/bulk`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pincodes: chunk }),
          });
          const data = await res.json();
          if (data.success) {
            // Some pincodes in the chunk might have been successful
            const count = data.message.match(/\d+/) ? parseInt(data.message.match(/\d+/)[0]) : chunk.length;
            successCount += count;
          }
        }

        showToast(`Import Processed! Successfully uploaded approximately ${successCount} pincodes.`);
        fetchPincodes();
      } catch (err) {
        console.error('Error importing pincodes:', err);
        showToast('Network error during import', 'error');
      } finally {
        setSaving(false);
        e.target.value = ''; // Reset file input
      }
    };
    reader.readAsText(file);
  };


  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .fg { display: flex; flex-direction: column; gap: 6px; width: 100%; }
        .fl { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #8a8f9e; }
        .fi {
          width: 100%; padding: 12px 14px;
          border: 1.5px solid #e8eaf0; border-radius: 10px;
          font-family: 'DM Sans', sans-serif; font-size: 14px; color: #1a1d2e;
          background: #fff; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s; -webkit-appearance: none; appearance: none;
        }
        .fi:focus { border-color: #e53935; box-shadow: 0 0 0 3px rgba(229,57,53,0.08); }
        .fi::placeholder { color: #bcc0cc; }
        .fi[readonly] { background: #f8f9fc; color: #6b7080; }
        .fsel {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238a8f9e' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 14px center; cursor: pointer;
        }

        .card { background:#fff; border-radius:16px; padding:28px 32px; box-shadow:0 1px 4px rgba(0,0,0,0.05),0 4px 24px rgba(0,0,0,0.04); border:1px solid #f0f2f7; }
        .card-title { font-size:15px; font-weight:700; color:#1a1d2e; margin-bottom:24px; display:flex; align-items:center; gap:10px; }
        .card-title::before { content:''; display:block; width:4px; height:18px; background:linear-gradient(180deg,#e53935,#c62828); border-radius:2px; }

        .btn { border:none; border-radius:9px; cursor:pointer; font-family:'DM Sans',sans-serif; font-weight:600; transition:all 0.15s; }
        .btn:disabled { opacity:0.6; cursor:not-allowed; transform:none !important; }
        .btn-red { background:linear-gradient(135deg,#e53935,#c62828); color:#fff; padding:12px 32px; font-size:14px; box-shadow:0 4px 14px rgba(229,57,53,0.3); }
        .btn-red:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 6px 20px rgba(229,57,53,0.4); }
        .btn-green { background:#2e7d32; color:#fff; padding:10px 18px; font-size:13px; }
        .btn-green:hover { background:#1b5e20; }
        .btn-csv-export { background:linear-gradient(135deg,#e53935,#c62828); color:#fff; padding:10px 18px; font-size:13px; }
        .btn-ghost { background:transparent; border:1.5px solid #e8eaf0; color:#6b7080; padding:10px 22px; font-size:13px; }
        .btn-ghost:hover { background:#f8f9fc; }

        .badge { display:inline-block; padding:4px 10px; border-radius:20px; font-size:11px; font-weight:600; letter-spacing:0.04em; }
        .badge-active { background:#e8f5e9; color:#2e7d32; }
        .badge-inactive { background:#fce4ec; color:#c62828; }
        .zone-chip { background:#f0f2f7; padding:3px 10px; border-radius:6px; font-size:12px; font-weight:600; color:#4a5169; }

        .act-btn { background:none; border:none; cursor:pointer; font-family:'DM Sans',sans-serif; font-size:12.5px; font-weight:600; padding:5px 10px; border-radius:6px; transition:background 0.15s; }
        .act-edit { color:#e53935; }
        .act-edit:hover { background:#fef2f2; }
        .act-del { color:#9ca3b0; margin-left:2px; }
        .act-del:hover { background:#f5f6fa; color:#c62828; }

        tr:hover td { background:#fafbff; }
        .search-wrap { position:relative; flex:1; min-width:180px; }
        .search-input { width:100%; padding:10px 14px 10px 36px; border:1.5px solid #e8eaf0; border-radius:8px; font-family:'DM Sans',sans-serif; font-size:13px; outline:none; transition:border-color 0.2s; }
        .search-input:focus { border-color:#e53935; }
        .search-ico { position:absolute; left:12px; top:50%; transform:translateY(-50%); color:#8a8f9e; font-size:14px; pointer-events:none; }

        .table-wrap { overflow-x:auto; border-radius:10px; border:1px solid #f0f2f7; }
        table { width:100%; border-collapse:collapse; font-size:13.5px; }
        thead tr { background:#f8f9fc; }
        th { padding:13px 18px; text-align:left; font-size:11px; font-weight:700; letter-spacing:0.07em; text-transform:uppercase; color:#8a8f9e; white-space:nowrap; border-bottom:1px solid #f0f2f7; }
        td { padding:13px 18px; color:#2d3142; border-bottom:1px solid #f5f6fa; transition:background 0.1s; }
        tbody tr:last-child td { border-bottom:none; }

        .overlay { position:fixed; inset:0; background:rgba(10,12,30,0.45); backdrop-filter:blur(4px); z-index:1000; display:flex; align-items:center; justify-content:center; animation:fadeIn 0.18s ease; }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        .modal { background:#fff; border-radius:20px; padding:32px; width:100%; max-width:500px; box-shadow:0 24px 64px rgba(0,0,0,0.18); animation:slideUp 0.22s ease; position:relative; }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .modal-close { position:absolute; top:18px; right:18px; background:#f5f6fa; border:none; cursor:pointer; color:#6b7080; font-size:16px; width:32px; height:32px; display:flex; align-items:center; justify-content:center; border-radius:8px; transition:all 0.15s; font-family:'DM Sans',sans-serif; }
        .modal-close:hover { background:#ffe4e4; color:#c62828; }
        .del-modal { max-width:360px; text-align:center; padding:40px 32px; }

        /* Toast */
        .toast { position:fixed; top:28px; right:32px; z-index:9999; padding:14px 22px; border-radius:12px; font-family:'DM Sans',sans-serif; font-size:14px; font-weight:600; box-shadow:0 8px 32px rgba(0,0,0,0.15); animation:slideUp 0.22s ease; display:flex; align-items:center; gap:10px; }
        .toast-success { background:#1b5e20; color:#fff; }
        .toast-error { background:#c62828; color:#fff; }

        /* Spinner */
        .spinner { display:inline-block; width:14px; height:14px; border:2px solid rgba(255,255,255,0.4); border-top-color:#fff; border-radius:50%; animation:spin 0.6s linear infinite; }
        @keyframes spin { to { transform:rotate(360deg); } }

        /* Loading skeleton */
        .skeleton { background:linear-gradient(90deg,#f0f2f7 25%,#e8eaf0 50%,#f0f2f7 75%); background-size:200% 100%; animation:shimmer 1.4s infinite; border-radius:6px; height:16px; }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
      `}</style>

      {/* Toast */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          <span>{toast.type === 'success' ? '✓' : '✕'}</span>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1a1d2e', letterSpacing: '-0.02em', fontFamily: "'DM Sans', sans-serif" }}>
          Pincode Management
        </h1>
        <p style={{ fontSize: 13.5, color: '#8a8f9e', marginTop: 4, fontFamily: "'DM Sans', sans-serif" }}>
          Manage delivery zones and area pincodes
        </p>
      </div>

      {/* ── ADD CARD ─────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-title">Add New Pincode</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          <div style={{ display: 'flex', gap: 18 }}>
            <div className="fg">
              <label className="fl">Pincode *</label>
              <input
                className="fi"
                placeholder="e.g. 670001"
                value={addForm.code}
                onChange={(e) => setAddForm((f) => ({ ...f, code: e.target.value }))}
                style={{ fontFamily: "'DM Mono', monospace", letterSpacing: '0.05em' }}
              />
            </div>
            <div className="fg">
              <label className="fl">State / Country</label>
              <input className="fi" value="Kerala, India" readOnly />
            </div>
          </div>

          <div className="fg">
            <label className="fl">Area / Locality</label>
            <input
              className="fi"
              placeholder="Enter area or locality name"
              value={addForm.city}
              onChange={(e) => setAddForm((f) => ({ ...f, city: e.target.value }))}
            />
          </div>

          <div style={{ display: 'flex', gap: 18 }}>
            <div className="fg">
              <label className="fl">Zone / District</label>
              <select
                className="fi fsel"
                value={addForm.state}
                onChange={(e) => handleZoneSelect(e.target.value, setAddForm)}
                disabled={loadingZones}
              >
                <option value="">Select a zone...</option>
                {zones.map((zone) => (
                  <option key={zone._id} value={zone.name}>{zone.name}</option>
                ))}
              </select>
            </div>
            <div className="fg" style={{ visibility: 'hidden' }}>
              <label className="fl">_</label>
              <div className="fi" />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 18 }}>
            <div className="fg">
              <label className="fl">Longitude *</label>
              <input
                className="fi"
                placeholder="e.g. 74.9876"
                value={addForm.lng}
                onChange={(e) => setAddForm((f) => ({ ...f, lng: e.target.value }))}
                style={{ fontFamily: "'DM Mono', monospace" }}
              />
            </div>
            <div className="fg">
              <label className="fl">Latitude *</label>
              <input
                className="fi"
                placeholder="e.g. 12.4996"
                value={addForm.lat}
                onChange={(e) => setAddForm((f) => ({ ...f, lat: e.target.value }))}
                style={{ fontFamily: "'DM Mono', monospace" }}
              />
            </div>
          </div>
        </div>

        <div style={{ marginTop: 28, display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-red" onClick={handleAdd} disabled={saving}>
            {saving ? <><span className="spinner" style={{ marginRight: 8 }} />Saving...</> : 'Save Pincode'}
          </button>
        </div>
      </div>

      {/* ── TABLE CARD ───────────────────────────────────── */}
      <div className="card">
        <div className="card-title">Pincode Directory</div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
          <select
            className="fi fsel"
            value={filterZone}
            onChange={(e) => setFilterZone(e.target.value)}
            style={{ width: 170, padding: '10px 14px' }}
          >
            <option value="">All Zones</option>
            {zones.map((zone) => (
              <option key={zone._id} value={zone.name}>{zone.name}</option>
            ))}
          </select>

          <div className="search-wrap">
            <span className="search-ico">🔍</span>
            <input
              className="search-input"
              placeholder="Search area or pincode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept=".csv"
              onChange={handleFileChange}
            />
            <button className="btn btn-green" onClick={handleImportCSV} disabled={saving}>
              {saving ? 'Uploading...' : '↑ Import CSV'}
            </button>
            <button className="btn btn-csv-export" onClick={handleExportCSV}>↓ Export CSV</button>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Sl No</th>
                <th>Pincode</th>
                <th>Area</th>
                <th>Zone / District</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loadingPincodes ? (
                [1, 2, 3].map((n) => (
                  <tr key={n}>
                    {[1, 2, 3, 4, 5, 6].map((c) => (
                      <td key={c}><div className="skeleton" style={{ width: c === 6 ? 80 : '80%' }} /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: '#8a8f9e', padding: 40 }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
                    No records found
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row, i) => (
                  <tr key={row._id}>
                    <td style={{ color: '#8a8f9e', fontWeight: 600, fontFamily: "'DM Mono', monospace" }}>#{startIdx + i + 1}</td>
                    <td style={{ fontFamily: "'DM Mono', monospace", fontWeight: 500 }}>{row.code}</td>
                    <td>{row.city}</td>
                    <td><span className="zone-chip">{row.zone_id?.name || row.state}</span></td>
                    <td>
                      <span className={`badge ${row.status === 'Active' ? 'badge-active' : 'badge-inactive'}`}>
                        {row.status || 'Active'}
                      </span>
                    </td>
                    <td>
                      <button className="act-btn act-edit" onClick={() => openEdit(row)}>✏ Edit</button>
                      <button className="act-btn act-del" onClick={() => setDeleteId(row._id)}>🗑 Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loadingPincodes && filtered.length > 0 && (
          <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ fontSize: 12.5, color: '#8a8f9e', fontFamily: "'DM Sans', sans-serif" }}>
              Showing {startIdx + 1}–{Math.min(startIdx + ITEMS_PER_PAGE, filtered.length)} of {filtered.length} pincodes
            </div>
            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{
                    padding: '6px 12px', fontSize: 13, fontWeight: 600, border: '1px solid #e0e3ed',
                    borderRadius: 8, background: currentPage === 1 ? '#f4f5fa' : '#fff',
                    color: currentPage === 1 ? '#c0c4d0' : '#1a1d2e', cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    fontFamily: "'DM Sans', sans-serif", transition: 'all .15s'
                  }}
                >
                  ← Prev
                </button>

                {Array.from({ length: totalPages }, (_, idx) => idx + 1)
                  .filter((pg) => pg === 1 || pg === totalPages || Math.abs(pg - currentPage) <= 1)
                  .reduce((acc, pg, i, arr) => {
                    if (i > 0 && pg - arr[i - 1] > 1) acc.push('...');
                    acc.push(pg);
                    return acc;
                  }, [])
                  .map((pg, idx) =>
                    pg === '...' ? (
                      <span key={`dot-${idx}`} style={{ padding: '0 4px', color: '#8a8f9e', fontSize: 13 }}>…</span>
                    ) : (
                      <button
                        key={pg}
                        onClick={() => setCurrentPage(pg)}
                        style={{
                          width: 34, height: 34, fontSize: 13, fontWeight: currentPage === pg ? 700 : 500,
                          border: currentPage === pg ? '1.5px solid #e53935' : '1px solid #e0e3ed',
                          borderRadius: 8, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                          background: currentPage === pg ? 'linear-gradient(135deg,#fff5f5,#fff0f0)' : '#fff',
                          color: currentPage === pg ? '#e53935' : '#1a1d2e', transition: 'all .15s'
                        }}
                      >
                        {pg}
                      </button>
                    )
                  )}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '6px 12px', fontSize: 13, fontWeight: 600, border: '1px solid #e0e3ed',
                    borderRadius: 8, background: currentPage === totalPages ? '#f4f5fa' : '#fff',
                    color: currentPage === totalPages ? '#c0c4d0' : '#1a1d2e', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    fontFamily: "'DM Sans', sans-serif", transition: 'all .15s'
                  }}
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        )}
        {!loadingPincodes && filtered.length === 0 && rows.length > 0 && (
          <div style={{ marginTop: 14, fontSize: 12.5, color: '#8a8f9e', fontFamily: "'DM Sans', sans-serif" }}>
            No matching pincodes found
          </div>
        )}
      </div>

      {/* ── EDIT MODAL ─────────────────────────────────── */}
      {editRow !== null && (
        <div className="overlay" onClick={(e) => e.target === e.currentTarget && setEditRow(null)}>
          <div className="modal">
            <button className="modal-close" onClick={() => setEditRow(null)}>✕</button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <div style={{ width: 4, height: 20, background: 'linear-gradient(180deg,#e53935,#c62828)', borderRadius: 2 }} />
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#1a1d2e', fontFamily: "'DM Sans', sans-serif" }}>Edit Pincode</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', gap: 14 }}>
                <div className="fg">
                  <label className="fl">Pincode</label>
                  <input
                    className="fi"
                    value={editForm.code}
                    onChange={(e) => setEditForm((f) => ({ ...f, code: e.target.value }))}
                    style={{ fontFamily: "'DM Mono', monospace", letterSpacing: '0.05em' }}
                  />
                </div>
                <div className="fg">
                  <label className="fl">State / Country</label>
                  <input className="fi" value="Kerala, India" readOnly />
                </div>
              </div>

              <div className="fg">
                <label className="fl">Area / Locality</label>
                <input
                  className="fi"
                  value={editForm.city}
                  onChange={(e) => setEditForm((f) => ({ ...f, city: e.target.value }))}
                />
              </div>

              <div style={{ display: 'flex', gap: 14 }}>
                <div className="fg">
                  <label className="fl">Zone / District</label>
                  <select
                    className="fi fsel"
                    value={editForm.state}
                    onChange={(e) => handleZoneSelect(e.target.value, setEditForm)}
                  >
                    <option value="">Select a zone...</option>
                    {zones.map((zone) => (
                      <option key={zone._id} value={zone.name}>{zone.name}</option>
                    ))}
                  </select>
                </div>
                <div className="fg">
                  <label className="fl">Status</label>
                  <select
                    className="fi fsel"
                    value={editForm.status}
                    onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 14 }}>
                <div className="fg">
                  <label className="fl">Longitude</label>
                  <input
                    className="fi"
                    value={editForm.lng}
                    onChange={(e) => setEditForm((f) => ({ ...f, lng: e.target.value }))}
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  />
                </div>
                <div className="fg">
                  <label className="fl">Latitude</label>
                  <input
                    className="fi"
                    value={editForm.lat}
                    onChange={(e) => setEditForm((f) => ({ ...f, lat: e.target.value }))}
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 26 }}>
              <button className="btn btn-ghost" onClick={() => setEditRow(null)}>Cancel</button>
              <button className="btn btn-red" onClick={handleEditSave} disabled={saving}>
                {saving ? <><span className="spinner" style={{ marginRight: 8 }} />Saving...</> : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE MODAL ───────────────────────────────── */}
      {deleteId !== null && (
        <div className="overlay" onClick={(e) => e.target === e.currentTarget && setDeleteId(null)}>
          <div className="modal del-modal">
            <div style={{ fontSize: 44, marginBottom: 14 }}>🗑️</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#1a1d2e', fontFamily: "'DM Sans', sans-serif", marginBottom: 8 }}>
              Delete Pincode?
            </div>
            <div style={{ fontSize: 13.5, color: '#8a8f9e', fontFamily: "'DM Sans', sans-serif", marginBottom: 28, lineHeight: 1.6 }}>
              This action cannot be undone. The pincode will be permanently removed from the directory.
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button className="btn btn-ghost" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn btn-red" style={{ padding: '10px 28px' }} onClick={handleDelete} disabled={saving}>
                {saving ? <><span className="spinner" style={{ marginRight: 8 }} />Deleting...</> : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  page: {
    padding: '36px 40px',
    background: '#f4f5fa',
    minHeight: '100vh',
    fontFamily: "'DM Sans', sans-serif",
  },
};

export default PincodeSetup;