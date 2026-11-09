import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { 
  Flame, 
  MapPin, 
  Layers, 
  Filter, 
  ThumbsUp, 
  ArrowRight,
  ShieldAlert,
  Search,
  Crosshair,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  Eye,
  Building2,
  Navigation
} from 'lucide-react';

// Custom Pin Icon Generator
const createCustomMarker = (category, severity, status, isSelected = false) => {
  let color = '#0284c7';
  if (category === 'Roads & Potholes') color = '#f59e0b';
  else if (category === 'Solid Waste & Garbage') color = '#10b981';
  else if (category === 'Water Supply & Drainage') color = '#3b82f6';
  else if (category === 'Streetlights & Electricity') color = '#ea580c';

  if (status === 'Citizen Confirmed') color = '#059669';
  if (status === 'Resolved') color = '#0284c7';

  const isCritical = severity >= 5;

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: ${isSelected ? '46px' : '38px'};
        height: ${isSelected ? '46px' : '38px'};
        background: white;
        border-radius: 50%;
        box-shadow: 0 4px 14px rgba(0,0,0,0.35);
        border: ${isSelected ? '4px' : '3px'} solid ${color};
        padding: 4px;
        transition: all 0.2s ease-in-out;
        ${isCritical ? 'animation: markerPulse 1.8s infinite;' : ''}
      ">
        <img src="/logo-icon.png" alt="pin" style="width: 100%; height: 100%; object-fit: contain;" />
        ${isCritical ? `<div style="position: absolute; top: -4px; right: -4px; width: 12px; height: 12px; background: #ef4444; border-radius: 50%; border: 2px solid white;"></div>` : ''}
      </div>
    `,
    iconSize: isSelected ? [46, 46] : [36, 36],
    iconAnchor: isSelected ? [23, 46] : [18, 36],
    popupAnchor: [0, -36]
  });
};

// Smooth Map Re-centering & Flying Controller
function MapController({ flyTarget }) {
  const map = useMap();
  useEffect(() => {
    if (flyTarget && flyTarget[0] && flyTarget[1]) {
      map.flyTo(flyTarget, 16, { duration: 1.2 });
    }
  }, [flyTarget, map]);
  return null;
}

// Map Click Listener to let citizens drop a pin anywhere to report
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    }
  });
  return null;
}

export default function CivicMap({ issues, onSelectIssue, onUpvote, onOpenReport }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mapLayer, setMapLayer] = useState('street'); // 'street' | 'satellite'
  const [userLocation, setUserLocation] = useState(null);
  const [flyTarget, setFlyTarget] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [selectedPinIssue, setSelectedPinIssue] = useState(null);
  
  // Dropped pin by citizen clicking map
  const [droppedPin, setDroppedPin] = useState(null);
  const [droppedAddress, setDroppedAddress] = useState('');
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);

  // Filter issues based on category, status, and search query
  const filteredIssues = issues.filter(issue => {
    const matchesCat = selectedCategory === 'All' || issue.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || issue.status === selectedStatus;
    const matchesSearch = !searchQuery.trim() || 
      (issue.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (issue.address || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (issue.category || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesStatus && matchesSearch && issue.location?.coordinates;
  });

  // Calculate default center (Alandi/Pune or first issue)
  const defaultCenter = filteredIssues.length > 0
    ? [filteredIssues[0].location.coordinates[1], filteredIssues[0].location.coordinates[0]]
    : [18.6772, 73.8981];

  // GPS Locate Citizen
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(coords);
        setFlyTarget(coords);
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation notice:', err.message);
        setIsLocating(false);
        setFlyTarget([18.6772, 73.8981]);
      },
      { enableHighAccuracy: true, timeout: 7000 }
    );
  };

  // Handle citizen clicking anywhere on the map
  const handleMapClick = async (latlng) => {
    const lat = latlng.lat;
    const lng = latlng.lng;
    setDroppedPin({ lat, lng });
    setIsResolvingAddress(true);
    setDroppedAddress('Pinning exact street location...');

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      const data = await res.json();
      if (data && data.display_name) {
        const parts = data.display_name.split(',').slice(0, 3).join(', ');
        setDroppedAddress(parts || data.display_name);
      } else {
        setDroppedAddress(`Near Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);
      }
    } catch (e) {
      setDroppedAddress(`Pinned Location (Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)})`);
    } finally {
      setIsResolvingAddress(false);
    }
  };

  return (
    <div className="w-full flex flex-col space-y-2.5 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Centered Instruction Outside the Map */}
      <div className="w-full text-center py-0.5">
        <p className="text-xs sm:text-sm font-medium text-slate-600">
          Click anywhere on the map to <span className="font-bold text-emerald-700">drop a pin and report an issue</span>
        </p>
      </div>

      <div className="relative isolate z-0 w-full h-[calc(100vh-10rem)] min-h-[580px] rounded-3xl overflow-hidden border border-slate-200 shadow-xl bg-slate-900">
      
      {/* =========================================================================
          TOP CITIZEN ACTION TOOLBAR (Search + Locate + Map Mode + New Report)
          ========================================================================= */}
      <div className="absolute top-4 left-4 right-4 z-[500] pointer-events-none flex flex-wrap items-center justify-between gap-2.5">
        
        {/* Left Control Group */}
        <div className="pointer-events-auto flex flex-wrap items-center gap-2 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl shadow-lg border border-slate-200/80">
          
          {/* Toggle Sidebar Button */}
          <button
            type="button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition cursor-pointer"
            title={isSidebarOpen ? "Collapse issue drawer" : "Open issue drawer"}
          >
            {isSidebarOpen ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isSidebarOpen ? 'Hide Drawer' : 'View Complaints'}</span>
            <span className="px-1.5 py-0.2 bg-emerald-600 text-white rounded-md text-[10px] font-mono">
              {filteredIssues.length}
            </span>
          </button>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search street, area..."
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-36 sm:w-52 transition"
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

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs font-semibold bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer"
          >
            <option value="All">All Categories</option>
            <option value="Roads & Potholes">Roads & Potholes</option>
            <option value="Solid Waste & Garbage">Solid Waste & Garbage</option>
            <option value="Water Supply & Drainage">Water Supply & Drainage</option>
            <option value="Streetlights & Electricity">Streetlights & Electricity</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="hidden sm:block text-xs font-semibold bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Reported">Reported (Pending)</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Citizen Confirmed">Citizen Confirmed</option>
          </select>

        </div>

        {/* Right Action Group (Locate Me + Satellite Toggle) */}
        <div className="pointer-events-auto flex items-center space-x-2">
          
          {/* Locate Me Button */}
          <button
            type="button"
            onClick={handleLocateMe}
            disabled={isLocating}
            className="p-2.5 bg-white/95 hover:bg-white text-slate-700 hover:text-emerald-700 rounded-2xl shadow-lg border border-slate-200 transition cursor-pointer active:scale-95 flex items-center space-x-1.5 text-xs font-bold"
            title="Locate my GPS position on map"
          >
            <Crosshair className={`w-4 h-4 text-emerald-600 ${isLocating ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">Locate Me</span>
          </button>

          {/* Satellite vs Street Imagery Mode */}
          <button
            type="button"
            onClick={() => setMapLayer(mapLayer === 'street' ? 'satellite' : 'street')}
            className={`px-3 py-2 rounded-2xl shadow-lg border text-xs font-bold transition cursor-pointer active:scale-95 flex items-center space-x-1.5 ${
              mapLayer === 'satellite'
                ? 'bg-slate-900 text-white border-slate-700'
                : 'bg-white/95 hover:bg-white text-slate-700 border-slate-200'
            }`}
            title="Toggle between street map and high-resolution satellite imagery"
          >
            <Layers className="w-3.5 h-3.5 text-sky-500" />
            <span className="hidden sm:inline">{mapLayer === 'satellite' ? 'Satellite View' : 'Street Map'}</span>
          </button>

        </div>
      </div>

      {/* =========================================================================
          COLLAPSIBLE CITIZEN ISSUE EXPLORER DRAWER (Left Side)
          ========================================================================= */}
      {isSidebarOpen && (
        <div className="absolute left-4 top-20 bottom-4 z-[450] w-80 sm:w-96 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-slide-right">
          
          {/* Drawer Header */}
          <div className="p-3.5 border-b border-slate-200/80 bg-slate-50/70 flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Civic Complaints in View
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Tap any ticket to focus on map or endorse resolution.
              </p>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Category Chips */}
          <div className="p-2 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[11px]">
            {['All', 'Roads & Potholes', 'Solid Waste & Garbage', 'Water Supply & Drainage', 'Streetlights & Electricity'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === 'All' ? 'All' : cat.split('&')[0].trim()}
              </button>
            ))}
          </div>

          {/* Issues Scrollable List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-2">
            {filteredIssues.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <MapPin className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-semibold">No complaints found matching this filter.</p>
                <p className="text-[11px] text-slate-400">Click anywhere on the map to report an issue here!</p>
              </div>
            ) : (
              filteredIssues.map((issue) => {
                const isSelected = selectedPinIssue?._id === issue._id;
                const priority = issue.priorityScore || 50;
                const citizenCount = Array.isArray(issue.upvotes) ? Math.max(issue.upvotes.length, 1) : (Number(issue.upvoteCount) || 1);

                return (
                  <div
                    key={issue._id}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50/70 border-emerald-300 shadow-xs ring-1 ring-emerald-400'
                        : 'bg-white hover:bg-slate-50 border-slate-200/80'
                    }`}
                    onClick={() => {
                      setSelectedPinIssue(issue);
                      setFlyTarget([issue.location.coordinates[1], issue.location.coordinates[0]]);
                    }}
                  >
                    <div className="flex items-start gap-2.5">
                      {/* Photo Thumbnail */}
                      {issue.imageUrl ? (
                        <img
                          src={issue.imageUrl}
                          alt={issue.title}
                          className="w-14 h-14 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                          <MapPin className="w-5 h-5" />
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] font-bold text-slate-500">
                            FMA-{issue._id.slice(-4).toUpperCase()}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            issue.status === 'Resolved' || issue.status === 'Citizen Confirmed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : issue.status === 'In Progress'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {issue.status}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-slate-900 truncate leading-snug">
                          {issue.title}
                        </h4>

                        <p className="text-[10px] text-slate-500 truncate">
                          {issue.address}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Action Strip on Card */}
                    <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100 text-[11px]">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpvote && onUpvote(issue._id);
                        }}
                        className="flex items-center space-x-1 text-slate-600 hover:text-emerald-700 font-bold bg-slate-100 hover:bg-emerald-50 px-2 py-1 rounded-lg transition"
                        title="I also see this problem! Endorse complaint to increase priority"
                      >
                        <ThumbsUp className="w-3 h-3 text-emerald-600" />
                        <span>{citizenCount} Endorsed</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectIssue && onSelectIssue(issue);
                        }}
                        className="flex items-center space-x-1 text-emerald-700 hover:text-emerald-800 font-bold hover:underline"
                      >
                        <span>Details</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                  </div>
                );
              })
            )}
          </div>

          {/* Drawer Footer CTA */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 text-center">
            <button
              onClick={() => onOpenReport && onOpenReport(null)}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span>Report a New Issue Here</span>
            </button>
          </div>

        </div>
      )}

      {/* =========================================================================
          INTERACTIVE DROPPED PIN BAR (Appears when citizen clicks anywhere on map)
          ========================================================================= */}
      {droppedPin && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[600] bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-3 animate-scale-up max-w-lg w-[92%] sm:w-auto">
          <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl shrink-0">
            <MapPin className="w-5 h-5 text-emerald-700" />
          </div>

          <div className="flex-1 min-w-0 text-center sm:text-left">
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
              📍 Selected Pin Location
            </span>
            <p className="text-xs font-bold text-slate-900 truncate">
              {droppedAddress || 'Fetching street details...'}
            </p>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
              Coordinates: {droppedPin.lat.toFixed(4)}, {droppedPin.lng.toFixed(4)}
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <button
              type="button"
              onClick={() => {
                onOpenReport && onOpenReport({ lat: droppedPin.lat, lng: droppedPin.lng });
                setDroppedPin(null);
              }}
              className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition active:scale-95 cursor-pointer flex items-center justify-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Report Issue at Pin</span>
            </button>

            <button
              type="button"
              onClick={() => setDroppedPin(null)}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              title="Clear selected pin"
            >
              <X className="w-4 h-4" />
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
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <MapController flyTarget={flyTarget} />
        <MapClickHandler onMapClick={handleMapClick} />

        {/* Dynamic Tile Layer (Standard Street Map vs High-Res Satellite) */}
        {mapLayer === 'satellite' ? (
          <TileLayer
            attribution='&copy; <a href="https://www.esri.com/">Esri</a> &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        ) : (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        )}

        {/* Citizen's Real-time GPS Location Beacon */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={L.divIcon({
              className: 'user-location-marker',
              html: `
                <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
                  <div style="position: absolute; width: 28px; height: 28px; background: #3b82f6; border-radius: 50%; opacity: 0.35; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
                  <div style="width: 14px; height: 14px; background: #2563eb; border: 2.5px solid white; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.4);"></div>
                </div>
              `,
              iconSize: [28, 28],
              iconAnchor: [14, 14]
            })}
          >
            <Popup>
              <div className="text-xs font-bold text-slate-900 p-1">
                📍 You Are Here
              </div>
            </Popup>
          </Marker>
        )}

        {/* Citizen Dropped Pin Marker */}
        {droppedPin && (
          <Marker
            position={[droppedPin.lat, droppedPin.lng]}
            icon={L.divIcon({
              className: 'dropped-pin-marker',
              html: `
                <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; animation: bounce 1s infinite;">
                  <div style="width: 32px; height: 32px; background: #10b981; border: 3px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; box-shadow: 0 4px 12px rgba(0,0,0,0.4);">
                    ＋
                  </div>
                </div>
              `,
              iconSize: [36, 36],
              iconAnchor: [18, 36]
            })}
          />
        )}

        {/* Issue Pins */}
        {filteredIssues.map((issue) => {
          const lat = issue.location.coordinates[1];
          const lng = issue.location.coordinates[0];
          const isSelected = selectedPinIssue?._id === issue._id;
          const citizenCount = Array.isArray(issue.upvotes) ? Math.max(issue.upvotes.length, 1) : (Number(issue.upvoteCount) || 1);

          return (
            <Marker
              key={issue._id}
              position={[lat, lng]}
              icon={createCustomMarker(issue.category, issue.severity, issue.status, isSelected)}
              eventHandlers={{
                click: () => setSelectedPinIssue(issue)
              }}
            >
              <Popup className="custom-popup" maxWidth={260}>
                <div className="p-1 space-y-2 text-slate-800">
                  {issue.imageUrl && (
                    <img
                      src={issue.imageUrl}
                      alt={issue.title}
                      className="w-full h-28 object-cover rounded-xl border border-slate-200"
                    />
                  )}
                  
                  <div>
                    <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-500">
                      <span>{issue.category}</span>
                      <span className="font-mono text-slate-700">FMA-{issue._id.slice(-4).toUpperCase()}</span>
                    </div>

                    <h4 className="font-bold text-xs text-slate-900 leading-tight mt-0.5">
                      {issue.title}
                    </h4>

                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                      {issue.address}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-100">
                    <span className="font-mono font-bold text-amber-600 flex items-center space-x-1">
                      <Flame className="w-3.5 h-3.5 text-amber-500" />
                      <span>Score {issue.priorityScore || 50}</span>
                    </span>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      issue.status === 'Resolved' || issue.status === 'Citizen Confirmed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : issue.status === 'In Progress'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {issue.status}
                    </span>
                  </div>

                  {/* Citizen Quick Actions inside Pin Popup */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => onUpvote && onUpvote(issue._id)}
                      className="py-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-lg text-xs font-bold text-center transition flex items-center justify-center space-x-1 cursor-pointer"
                    >
                      <ThumbsUp className="w-3 h-3 text-emerald-600" />
                      <span>{citizenCount} Endorse</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onSelectIssue && onSelectIssue(issue)}
                      className="py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold text-center transition flex items-center justify-center space-x-1 cursor-pointer shadow-xs"
                    >
                      <span>Full Ticket</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  </div>
);
}
