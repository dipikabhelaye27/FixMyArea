import React, { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  ShieldAlert, 
  Truck, 
  CheckCircle2, 
  Search, 
  Layers, 
  Navigation, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  ExternalLink, 
  Wrench, 
  MapPin, 
  RotateCcw,
  User,
  Phone,
  FileText,
  Loader2,
  Check
} from 'lucide-react';
import { updateIssueStatus } from '../services/api';

// Status & Pin Icons (matching the top status buttons)
const createOfficerMarker = (priority, status, assignedTo, isSelected = false) => {
  const isResolved = status === 'Resolved' || status === 'Citizen Confirmed';
  const isUrgent = !isResolved && priority >= 70;
  const isInProgress = !isResolved && status === 'In Progress';

  let color = '#f59e0b'; // Amber (Needs Team)
  let iconSvg = '';

  if (isUrgent) {
    color = '#ef4444'; // Red (Urgent)
    iconSvg = `
      <svg width="${isSelected ? '20' : '17'}" height="${isSelected ? '20' : '17'}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
        <path d="M12 8v4"/>
        <path d="M12 16h.01"/>
      </svg>
    `;
  } else if (isResolved) {
    color = '#10b981'; // Green (Completed)
    iconSvg = `
      <svg width="${isSelected ? '20' : '17'}" height="${isSelected ? '20' : '17'}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
        <path d="m9 12 2 2 4-4"/>
      </svg>
    `;
  } else if (isInProgress) {
    color = '#0284c7'; // Sky/Blue (Work in Progress)
    iconSvg = `
      <svg width="${isSelected ? '19' : '16'}" height="${isSelected ? '19' : '16'}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
      </svg>
    `;
  } else {
    color = '#f59e0b'; // Amber (Needs Team)
    iconSvg = `
      <svg width="${isSelected ? '19' : '16'}" height="${isSelected ? '19' : '16'}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
        <path d="M15 18H9"/>
        <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
        <circle cx="17" cy="18.5" r="2.5"/>
        <circle cx="7" cy="18.5" r="2.5"/>
      </svg>
    `;
  }

  const pinSize = isSelected ? 44 : 36;

  return L.divIcon({
    className: 'officer-marker-pin',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; width: ${pinSize}px; height: ${pinSize}px;">
        ${isUrgent ? `
          <div style="
            position: absolute;
            inset: -5px;
            border-radius: 50%;
            background: rgba(239, 68, 68, 0.4);
            animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
          "></div>
        ` : ''}
        <div style="
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: ${color};
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          transition: transform 0.2s ease;
          ${isSelected ? 'transform: scale(1.15);' : ''}
        ">
          ${iconSvg}
        </div>
      </div>
    `,
    iconSize: [pinSize, pinSize],
    iconAnchor: [pinSize / 2, pinSize / 2],
    popupAnchor: [0, -pinSize / 2]
  });
};

// Map Recenter & Fly Controller
function MapController({ targetCenter, targetZoom }) {
  const map = useMap();

  useEffect(() => {
    if (targetCenter) {
      map.flyTo(targetCenter, targetZoom || 16, {
        duration: 1.2,
        easeLinearity: 0.25
      });
    }
  }, [targetCenter, targetZoom, map]);

  return null;
}

export default function AuthorityJurisdictionMap({
  issues = [],
  officerDept = 'Roads & Infrastructure',
  isAdmin = false,
  currentUser = null,
  onSelectIssue,
  onResolveClick,
  onRefresh
}) {
  const [mapLayer, setMapLayer] = useState('street'); // 'street' | 'satellite'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'urgent' | 'unassigned' | 'in_progress' | 'resolved'
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [selectedIssueId, setSelectedIssueId] = useState(null);
  const [flyTarget, setFlyTarget] = useState(null);

  // Manage Work Sheet / Modal State
  const [managingIssue, setManagingIssue] = useState(null);
  const [formStatus, setFormStatus] = useState('In Progress');
  const [formWorkerName, setFormWorkerName] = useState('');
  const [formWorkerPhone, setFormWorkerPhone] = useState('');
  const [formComment, setFormComment] = useState('');
  const [isSavingWork, setIsSavingWork] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Compute default center from issues or fallback
  const defaultCenter = useMemo(() => {
    const valid = issues.filter(i => i.location?.coordinates && i.location.coordinates.length >= 2);
    if (valid.length > 0) {
      return [valid[0].location.coordinates[1], valid[0].location.coordinates[0]];
    }
    return [18.6775, 73.8967]; // Default Alandi center
  }, [issues]);

  // Operational metrics
  const metrics = useMemo(() => {
    const total = issues.length;
    const urgent = issues.filter(i => (i.priorityScore || 0) >= 70 && i.status !== 'Resolved' && i.status !== 'Citizen Confirmed').length;
    const unassigned = issues.filter(i => {
      const crew = i.assignedWorker?.name || i.assignedTo;
      const hasCrew = crew && crew !== 'Awaiting Crew' && crew !== 'Unassigned';
      return !hasCrew && i.status !== 'Resolved' && i.status !== 'Citizen Confirmed';
    }).length;
    const inProgress = issues.filter(i => i.status === 'In Progress').length;
    const resolved = issues.filter(i => i.status === 'Resolved' || i.status === 'Citizen Confirmed').length;
    return { total, urgent, unassigned, inProgress, resolved };
  }, [issues]);

  // Filtered issues
  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      if (filterType === 'urgent') {
        if ((issue.priorityScore || 0) < 70 || issue.status === 'Resolved' || issue.status === 'Citizen Confirmed') return false;
      } else if (filterType === 'unassigned') {
        const crew = issue.assignedWorker?.name || issue.assignedTo;
        const isAssigned = crew && crew !== 'Awaiting Crew' && crew !== 'Unassigned';
        if (isAssigned || issue.status === 'Resolved' || issue.status === 'Citizen Confirmed') return false;
      } else if (filterType === 'in_progress') {
        if (issue.status !== 'In Progress') return false;
      } else if (filterType === 'resolved') {
        if (issue.status !== 'Resolved' && issue.status !== 'Citizen Confirmed') return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = (issue.title || '').toLowerCase().includes(q);
        const locMatch = (issue.location?.address || '').toLowerCase().includes(q);
        const idMatch = (issue._id || '').toLowerCase().includes(q);
        const crew = issue.assignedWorker?.name || issue.assignedTo || '';
        const crewMatch = crew.toLowerCase().includes(q);
        if (!titleMatch && !locMatch && !idMatch && !crewMatch) return false;
      }

      return true;
    });
  }, [issues, filterType, searchQuery]);

  const handleFlyToIssue = (issue) => {
    if (!issue.location?.coordinates || issue.location.coordinates.length < 2) return;
    const [lng, lat] = issue.location.coordinates;
    setSelectedIssueId(issue._id);
    setFlyTarget([lat, lng]);
  };

  // Open the specialized Manage Work modal
  const handleOpenManageModal = (issue) => {
    setManagingIssue(issue);
    setFormStatus(issue.status === 'Reported' ? 'In Progress' : issue.status);
    setFormWorkerName(
      issue.assignedWorker?.name || 
      (issue.assignedTo && issue.assignedTo !== 'Awaiting Crew' ? issue.assignedTo : '')
    );
    setFormWorkerPhone(issue.assignedWorker?.phone || '');
    setFormComment('');
    setSaveSuccessMsg('');
  };

  // Save work updates (assign team, change status, add instruction)
  const handleSaveWork = async (e) => {
    e.preventDefault();
    if (!managingIssue) return;

    try {
      setIsSavingWork(true);
      await updateIssueStatus(managingIssue._id, {
        status: formStatus,
        workerName: formWorkerName.trim(),
        workerPhone: formWorkerPhone.trim(),
        officerName: currentUser?.name || 'Department Officer',
        comment: formComment.trim() || `Assigned to: ${formWorkerName.trim() || 'Field Team'} (${formStatus})`
      });

      setSaveSuccessMsg('Work saved and updated!');
      if (onRefresh) onRefresh();

      setTimeout(() => {
        setManagingIssue(null);
        setSaveSuccessMsg('');
      }, 1000);
    } catch (err) {
      console.error('Error updating work:', err);
      alert('Could not update work order. Please try again.');
    } finally {
      setIsSavingWork(false);
    }
  };

  // Suggested quick teams based on department
  const teamSuggestions = useMemo(() => {
    const dept = officerDept || '';
    if (dept.includes('Road')) {
      return [
        'Road Repair Team 1',
        'Pothole Quick Patch Squad',
        'Santosh Gaikwad (Road In-Charge)',
        'Asphalt Road Roller Unit'
      ];
    }
    if (dept.includes('Waste') || dept.includes('Sanitation')) {
      return [
        'Garbage Compactor Truck 4',
        'Morning Waste Collection Team',
        'Dr. Sunita Deshmukh Sanitation Squad',
        'Market Area Cleaning Team'
      ];
    }
    if (dept.includes('Water') || dept.includes('Sewer')) {
      return [
        'Water Pipeline Emergency Unit',
        'Drainage Jetting & Suction Team',
        'Leakage Repair Crew'
      ];
    }
    if (dept.includes('Electric') || dept.includes('Light')) {
      return [
        'Streetlight Electrician Unit',
        'Substation Emergency Team',
        'Wire & Pole Maintenance Crew'
      ];
    }
    return ['Field Response Team 1', 'Quick Action Unit'];
  }, [officerDept]);

  return (
    <div className="space-y-3 font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* =========================================================================
          TOP HEADER & STATUS COUNTERS (Simple, Human Words)
          ========================================================================= */}
      <div className="space-y-3">
        {/* Title & Human Subtitle */}
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
              <span>Local Area Complaints Map</span>
            </h2>
            <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 rounded-md border border-emerald-200">
              {isAdmin ? 'All Departments' : officerDept}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            View complaints on the map, assign repair teams, and track on-ground progress across your area.
          </p>
        </div>

        {/* Status Counters in One Clean Line Below */}
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-0.5">
          
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
              filterType === 'all' 
                ? 'bg-slate-900 text-white shadow-sm' 
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>All Complaints</span>
            <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
              filterType === 'all' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-700'
            }`}>
              {metrics.total}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilterType('urgent')}
            className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
              filterType === 'urgent' 
                ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/30' 
                : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
            }`}
            title="Complaints needing immediate response"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Urgent ({metrics.urgent})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterType('unassigned')}
            className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
              filterType === 'unassigned' 
                ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/30' 
                : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
            }`}
            title="Complaints not yet given to any team"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Needs Team ({metrics.unassigned})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterType('in_progress')}
            className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
              filterType === 'in_progress' 
                ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/30' 
                : 'bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Work in Progress ({metrics.inProgress})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterType('resolved')}
            className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
              filterType === 'resolved' 
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30' 
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Completed ({metrics.resolved})</span>
          </button>

        </div>
      </div>

      {/* =========================================================================
          MAIN MAP WORKSPACE (Map + Controls + Side Drawer)
          ========================================================================= */}
      <div className="relative isolate z-0 w-full h-[72vh] min-h-[580px] rounded-3xl overflow-hidden border border-slate-200 shadow-xl bg-slate-900">
        
        {/* Floating Top Control Bar */}
        <div className="absolute top-3.5 left-3.5 right-3.5 z-[500] pointer-events-none flex items-center justify-between gap-2.5">
          
          {/* Drawer Toggle + Search */}
          <div className="pointer-events-auto flex items-center gap-2 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl shadow-lg border border-slate-200">
            
            <button
              type="button"
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              {isDrawerOpen ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isDrawerOpen ? 'Hide Complaints' : 'Show Complaints'}</span>
              <span className="px-1.5 py-0.2 bg-emerald-600 text-white rounded text-[10px] font-mono">
                {filteredIssues.length}
              </span>
            </button>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by area, complaint number, or team..."
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-44 sm:w-60 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

          </div>

          {/* Right Action Tools: Satellite Toggle + Center on Area */}
          <div className="pointer-events-auto flex items-center space-x-2">
            
            {/* Center Map */}
            <button
              type="button"
              onClick={() => setFlyTarget(defaultCenter)}
              className="p-2.5 bg-white/95 hover:bg-white text-slate-700 hover:text-emerald-700 rounded-2xl shadow-lg border border-slate-200 text-xs font-bold transition cursor-pointer active:scale-95 flex items-center space-x-1.5"
              title="Center map on your area"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden md:inline">Center Map</span>
            </button>

            {/* Satellite Mode Toggle */}
            <button
              type="button"
              onClick={() => setMapLayer(mapLayer === 'street' ? 'satellite' : 'street')}
              className={`px-3 py-2 rounded-2xl shadow-lg border text-xs font-bold transition cursor-pointer active:scale-95 flex items-center space-x-1.5 ${
                mapLayer === 'satellite'
                  ? 'bg-slate-900 text-white border-slate-700'
                  : 'bg-white/95 hover:bg-white text-slate-700 border-slate-200'
              }`}
              title="Toggle between street view and satellite view"
            >
              <Layers className="w-3.5 h-3.5 text-sky-500" />
              <span className="hidden sm:inline">{mapLayer === 'satellite' ? 'Satellite View' : 'Street Map'}</span>
            </button>

          </div>
        </div>

        {/* Collapsible Complaints Side Drawer */}
        {isDrawerOpen && (
          <div className="absolute top-16 left-3.5 bottom-3.5 z-[500] w-80 sm:w-92 bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden transition-all">
            
            {/* Drawer Header */}
            <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div>
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                  <Truck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    {filterType === 'resolved' 
                      ? 'Completed Complaints' 
                      : filterType === 'in_progress' 
                      ? 'Work In Progress' 
                      : filterType === 'unassigned' 
                      ? 'Complaints Awaiting Team' 
                      : filterType === 'urgent' 
                      ? 'Urgent Complaints' 
                      : 'Area Complaints'}
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {filteredIssues.length} complaint{filteredIssues.length === 1 ? '' : 's'} in your area
                </p>
              </div>

              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Issue Cards */}
            <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
              {filteredIssues.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500/50 mx-auto" />
                  <p className="text-xs font-semibold">No complaints found</p>
                  <button
                    onClick={() => { setFilterType('all'); setSearchQuery(''); }}
                    className="text-[11px] text-emerald-700 font-bold hover:underline"
                  >
                    Show all complaints
                  </button>
                </div>
              ) : (
                filteredIssues.map((issue) => {
                  const isUrgent = (issue.priorityScore || 0) >= 70;
                  const isSelected = selectedIssueId === issue._id;
                  const isDone = issue.status === 'Resolved' || issue.status === 'Citizen Confirmed';
                  const crewName = issue.assignedWorker?.name || (issue.assignedTo && issue.assignedTo !== 'Awaiting Crew' ? issue.assignedTo : null);

                  return (
                    <div
                      key={issue._id}
                      onClick={() => handleFlyToIssue(issue)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer space-y-2 ${
                        isSelected
                          ? 'bg-emerald-50/80 border-emerald-400 shadow-md ring-2 ring-emerald-400/30'
                          : 'bg-white hover:bg-slate-50 border-slate-200/90 hover:border-slate-300 shadow-xs'
                      }`}
                    >
                      {/* Card Top: Number + Priority */}
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] font-extrabold text-slate-800">
                          #{issue._id.slice(-6).toUpperCase()}
                        </span>
                        
                        <div className="flex items-center space-x-1.5">
                          {isUrgent && (
                            <span className="px-1.5 py-0.5 bg-rose-100 text-rose-800 rounded font-bold text-[9px] uppercase tracking-wider flex items-center space-x-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse"></span>
                              <span>Urgent</span>
                            </span>
                          )}
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            isDone
                              ? 'bg-emerald-100 text-emerald-800'
                              : issue.status === 'In Progress'
                              ? 'bg-sky-100 text-sky-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {isDone ? 'Completed' : issue.status === 'In Progress' ? 'In Progress' : 'Needs Team'}
                          </span>
                        </div>
                      </div>

                      {/* Title & Location */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                          {issue.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{issue.location?.address || 'Area Location'}</span>
                        </p>
                      </div>

                      {/* Team Assignment & Action */}
                      <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 truncate max-w-[170px]">
                          {isDone ? (
                            <span className="font-semibold text-emerald-700 flex items-center space-x-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span className="truncate">{crewName ? `Fixed by ${crewName}` : 'Work Completed'}</span>
                            </span>
                          ) : crewName ? (
                            <span className="font-semibold text-slate-700 flex items-center space-x-1">
                              <Truck className="w-3 h-3 text-sky-600 shrink-0" />
                              <span className="truncate">{crewName}</span>
                            </span>
                          ) : (
                            <span className="text-amber-700 font-medium italic flex items-center space-x-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                              <span>Needs Team</span>
                            </span>
                          )}
                        </span>

                        {/* Manage Work / Record Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenManageModal(issue);
                          }}
                          className={`px-2.5 py-1 text-white text-[10px] font-bold rounded-lg transition active:scale-95 shadow-2xs flex items-center space-x-1 ${
                            isDone 
                              ? 'bg-emerald-700 hover:bg-emerald-800' 
                              : 'bg-slate-900 hover:bg-slate-800'
                          }`}
                        >
                          {isDone ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Work Record</span>
                            </>
                          ) : (
                            <>
                              <Wrench className="w-3 h-3" />
                              <span>Manage Work</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>{officerDept}</span>
              <button
                type="button"
                onClick={onRefresh}
                className="text-emerald-700 font-bold hover:underline"
              >
                Refresh
              </button>
            </div>

          </div>
        )}

        {/* =========================================================================
            LEAFLET MAP CONTAINER
            ========================================================================= */}
        <MapContainer 
          center={defaultCenter} 
          zoom={14} 
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          {mapLayer === 'satellite' ? (
            <TileLayer
              attribution='&copy; <a href="https://www.esri.com/">Esri</a> &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={19}
            />
          ) : (
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
            />
          )}

          <MapController targetCenter={flyTarget} />

          {/* Map Pins with Human Information */}
          {filteredIssues.map((issue) => {
            if (!issue.location?.coordinates || issue.location.coordinates.length < 2) return null;
            const [lng, lat] = issue.location.coordinates;
            const priority = issue.priorityScore || 50;
            const isSelected = selectedIssueId === issue._id;
            const markerIcon = createOfficerMarker(priority, issue.status, issue.assignedTo, isSelected);

            return (
              <Marker
                key={issue._id}
                position={[lat, lng]}
                icon={markerIcon}
                eventHandlers={{
                  click: () => {
                    setSelectedIssueId(issue._id);
                  }
                }}
              >
                <Popup className="officer-rich-popup" maxWidth={310}>
                  <div className="p-1 space-y-2 font-['Plus_Jakarta_Sans',sans-serif]">
                    
                    {/* Header + Priority */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                      <span className="font-mono text-xs font-black text-slate-900">
                        #{issue._id.slice(-6).toUpperCase()}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        priority >= 70 ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {priority >= 70 ? 'High Priority (Urgent)' : 'Standard Priority'}
                      </span>
                    </div>

                    {/* Image Preview */}
                    {issue.imageUrl && (
                      <div className="relative rounded-lg overflow-hidden h-24 bg-slate-100 border border-slate-200/80">
                        <img 
                          src={issue.imageUrl} 
                          alt={issue.title} 
                          className="w-full h-full object-cover" 
                          onError={(e) => { e.target.src = '/issues/garbage-1.jpg'; }}
                        />
                      </div>
                    )}

                    {/* Title & Address */}
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 leading-snug">
                        {issue.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                        {issue.location?.address}
                      </p>
                    </div>

                    {/* Team Assigned or Resolution Summary */}
                    {(() => {
                      const isDone = issue.status === 'Resolved' || issue.status === 'Citizen Confirmed';
                      const crewName = issue.assignedWorker?.name || (issue.assignedTo && issue.assignedTo !== 'Awaiting Crew' ? issue.assignedTo : null);

                      return (
                        <div className={`text-[11px] p-2 rounded-lg border ${
                          isDone ? 'bg-emerald-50/80 border-emerald-200' : 'bg-slate-50 border-slate-100'
                        }`}>
                          <span className={`block text-[9px] uppercase font-bold ${
                            isDone ? 'text-emerald-700' : 'text-slate-400'
                          }`}>
                            {isDone ? 'Ground Resolution Status' : 'Assigned Team'}
                          </span>
                          <span className={`font-semibold flex items-center space-x-1 mt-0.5 ${
                            isDone ? 'text-emerald-900' : 'text-slate-800'
                          }`}>
                            {isDone ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>{crewName ? `Completed by ${crewName}` : 'Work Completed & Verified'}</span>
                              </>
                            ) : crewName ? (
                              <>
                                <Truck className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                                <span>{crewName}</span>
                              </>
                            ) : (
                              <span className="text-amber-700 italic">Not yet assigned to a team</span>
                            )}
                          </span>
                        </div>
                      );
                    })()}

                    {/* Action Buttons for Officer */}
                    <div className="pt-1 flex flex-col space-y-1.5">
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenManageModal(issue)}
                          className={`w-full py-1.5 text-white rounded-lg text-[11px] font-bold transition flex items-center justify-center space-x-1 ${
                            issue.status === 'Resolved' || issue.status === 'Citizen Confirmed'
                              ? 'bg-emerald-700 hover:bg-emerald-800'
                              : 'bg-slate-900 hover:bg-slate-800'
                          }`}
                        >
                          {issue.status === 'Resolved' || issue.status === 'Citizen Confirmed' ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Work Record</span>
                            </>
                          ) : (
                            <>
                              <Wrench className="w-3 h-3" />
                              <span>Manage Work</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => onSelectIssue && onSelectIssue(issue)}
                          className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition flex items-center justify-center space-x-1"
                        >
                          <span>Full Complaint</span>
                        </button>
                      </div>

                      {/* Google Maps Directions */}
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-center text-[10px] text-slate-500 hover:text-slate-800 font-semibold flex items-center justify-center space-x-1 py-0.5"
                      >
                        <Navigation className="w-3 h-3 text-sky-600" />
                        <span>Get Directions in Google Maps</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>

                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

      </div>

      {/* =========================================================================
          REAL "MANAGE WORK" MODAL (Takes action on work instead of opening details)
          ========================================================================= */}
      {managingIssue && (
        <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-lg w-full border border-slate-100 space-y-4 animate-scale-up">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  managingIssue.status === 'Resolved' || managingIssue.status === 'Citizen Confirmed'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-900 text-white'
                }`}>
                  {managingIssue.status === 'Resolved' || managingIssue.status === 'Citizen Confirmed' ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Wrench className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    {managingIssue.status === 'Resolved' || managingIssue.status === 'Citizen Confirmed'
                      ? 'Work Completion Record'
                      : 'Manage Complaint Work'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {managingIssue.status === 'Resolved' || managingIssue.status === 'Citizen Confirmed'
                      ? 'Review ground repair proof, assigned crew, and completion status.'
                      : 'Assign a team, update progress, or add instructions for this work.'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setManagingIssue(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Target Issue Card */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-slate-700">
                  #{managingIssue._id.slice(-6).toUpperCase()}
                </span>
                <span className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                  managingIssue.status === 'Resolved' || managingIssue.status === 'Citizen Confirmed'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-200 text-slate-800'
                }`}>
                  {managingIssue.status === 'Resolved' || managingIssue.status === 'Citizen Confirmed' ? 'Completed' : managingIssue.category}
                </span>
              </div>
              <p className="font-bold text-slate-900 text-sm">{managingIssue.title}</p>
              <p className="text-slate-500 text-[11px] flex items-center space-x-1">
                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                <span>{managingIssue.location?.address || 'Area Location'}</span>
              </p>
            </div>

            {/* Completed Resolution Details Box */}
            {(managingIssue.status === 'Resolved' || managingIssue.status === 'Citizen Confirmed') && (
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-1.5 text-xs">
                <div className="flex items-center space-x-1.5 font-bold text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Physical Repair Completed on Ground</span>
                </div>
                <div className="text-slate-700 text-[11px] grid grid-cols-2 gap-2 pt-1 border-t border-emerald-200/60">
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Executed By</span>
                    <span className="font-semibold text-slate-800">
                      {managingIssue.assignedWorker?.name || managingIssue.resolutionProof?.resolvedBy || 'Ashok Ingle (Civil Repair Crew)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Status</span>
                    <span className="font-bold text-emerald-700">Completed & Verified</span>
                  </div>
                </div>
                {managingIssue.resolutionProof?.resolutionNotes && (
                  <p className="text-[11px] text-slate-600 italic pt-1">
                    "{managingIssue.resolutionProof.resolutionNotes}"
                  </p>
                )}
              </div>
            )}

            {/* Success Banner */}
            {saveSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="font-bold">{saveSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveWork} className="space-y-4">
              
              {/* 1. Status Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Update Work Progress *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormStatus('Reported')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center space-y-1 ${
                      formStatus === 'Reported'
                        ? 'bg-amber-50 border-amber-400 text-amber-900 ring-2 ring-amber-400/30'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Truck className="w-4 h-4 text-amber-600" />
                    <span>Needs Team</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormStatus('In Progress')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center space-y-1 ${
                      formStatus === 'In Progress'
                        ? 'bg-sky-50 border-sky-400 text-sky-900 ring-2 ring-sky-400/30'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Wrench className="w-4 h-4 text-sky-600" />
                    <span>In Progress</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormStatus('Resolved')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center space-y-1 ${
                      formStatus === 'Resolved'
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-900 ring-2 ring-emerald-400/30'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Completed</span>
                  </button>
                </div>
              </div>

              {/* 2. Assign Team / Worker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assign to Team or Worker Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="E.g. Road Repair Team 1 or Worker Name"
                    value={formWorkerName}
                    onChange={(e) => setFormWorkerName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                  />
                </div>

                {/* Quick Selection Chips */}
                <div className="pt-1.5 flex flex-wrap gap-1.5">
                  <span className="text-[10px] text-slate-400 font-bold self-center">Quick pick:</span>
                  {teamSuggestions.map((team) => (
                    <button
                      key={team}
                      type="button"
                      onClick={() => setFormWorkerName(team)}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[10px] font-semibold transition"
                    >
                      + {team}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Worker Phone (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Team Phone Number (Optional)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="E.g. +91 98200 XXXXX"
                    value={formWorkerPhone}
                    onChange={(e) => setFormWorkerPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                  />
                </div>
              </div>

              {/* 4. Officer Instructions */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Instructions for the Team (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="E.g. Please finish filling this patch before evening traffic."
                  value={formComment}
                  onChange={(e) => setFormComment(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setManagingIssue(null)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingWork || !formWorkerName.trim()}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm transition flex items-center space-x-1.5 cursor-pointer ${
                    isSavingWork || !formWorkerName.trim()
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-slate-900 hover:bg-slate-800 text-white active:scale-95'
                  }`}
                >
                  {isSavingWork ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Work...</span>
                    </>
                  ) : (
                    <span>Save Work Updates</span>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
