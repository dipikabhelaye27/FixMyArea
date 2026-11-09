import React, { useState } from 'react';
import { 
  X, 
  Search, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  User,
  Building2
} from 'lucide-react';

export default function TrackGrievanceModal({ isOpen, onClose, issues, onSelectIssue }) {
  const [query, setQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  if (!isOpen) return null;

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const clean = query.trim().toLowerCase();
    const found = issues.find(i => 
      i._id.toLowerCase().includes(clean) ||
      i.title.toLowerCase().includes(clean) ||
      (i.reportedBy?.phone && i.reportedBy.phone.includes(clean)) ||
      i.address.toLowerCase().includes(clean)
    );

    setSearchResult(found || null);
    setHasSearched(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-6">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Search className="w-5 h-5 text-sky-400" />
            <div>
              <h3 className="font-bold text-sm text-white">Track Grievance Status</h3>
              <p className="text-[11px] text-slate-400">Alandi Municipal Council Citizen Redressal</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Body */}
        <div className="p-6 space-y-4">
          <form onSubmit={handleSearch} className="space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Enter Ticket Reference ID or Street Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. 6aee... or Pradakshina Road or Charholi"
                  className="w-full pl-3 pr-24 py-2.5 bg-slate-50 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1.5 px-3 py-1.5 bg-sky-700 hover:bg-sky-800 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  Search
                </button>
              </div>
            </div>
          </form>

          {/* Quick sample chips */}
          <div className="flex items-center space-x-2 text-[11px] text-slate-500">
            <span>Recent in Alandi:</span>
            {issues.slice(0, 2).map((i) => (
              <button
                key={i._id}
                type="button"
                onClick={() => {
                  setQuery(i._id.slice(-6));
                  setSearchResult(i);
                  setHasSearched(true);
                }}
                className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-mono text-[10px]"
              >
                #{i._id.slice(-6)}
              </button>
            ))}
          </div>

          {/* Search Result Card */}
          {hasSearched && (
            searchResult ? (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500">
                    Ticket Ref: #{searchResult._id.slice(-8).toUpperCase()}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    searchResult.status === 'Resolved' ? 'bg-sky-100 text-sky-800' :
                    searchResult.status === 'Citizen Confirmed' ? 'bg-emerald-100 text-emerald-800' :
                    searchResult.status === 'In Progress' ? 'bg-amber-100 text-amber-800' :
                    'bg-slate-200 text-slate-800'
                  }`}>
                    {searchResult.status}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-xs text-slate-900 leading-snug">
                    {searchResult.title}
                  </h4>
                  <p className="text-[11px] text-slate-600 flex items-center space-x-1 mt-1">
                    <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                    <span>{searchResult.address}</span>
                  </p>
                </div>

                <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-[11px] space-y-1">
                  <div className="flex justify-between text-slate-600">
                    <span>Department:</span>
                    <span className="font-semibold text-slate-800">{searchResult.department}</span>
                  </div>
                  {searchResult.assignedWorker?.name && (
                    <div className="flex justify-between text-slate-600">
                      <span>Field Crew:</span>
                      <span className="font-semibold text-slate-800">{searchResult.assignedWorker.name}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>Target SLA:</span>
                    <span className="font-semibold text-slate-800">
                      {searchResult.aiAnalysis?.estimatedTurnaroundHours || 24} Hours
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSelectIssue(searchResult);
                  }}
                  className="w-full py-2 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition"
                >
                  <span>View Complete Resolution Timeline</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1">
                <AlertCircle className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                <span className="font-bold text-xs text-slate-700 block">No matching ticket found</span>
                <span className="text-[11px] text-slate-500">
                  Please verify the ticket reference number or street name.
                </span>
              </div>
            )
          )}

        </div>

      </div>
    </div>
  );
}

