import React from 'react';
import { 
  MapPin, 
  ThumbsUp, 
  Clock, 
  AlertTriangle, 
  Sparkles, 
  CheckCircle, 
  Flame, 
  Layers, 
  ArrowRight,
  ShieldAlert,
  Users
} from 'lucide-react';

export default function IssueCard({ issue, onSelect, onUpvote, onVerifyClick }) {
  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'Roads & Potholes':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Solid Waste & Garbage':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Water Supply & Drainage':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Streetlights & Electricity':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-purple-100 text-purple-800 border-purple-200';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Reported':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'Verified':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'In Progress':
        return 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse';
      case 'Resolved':
        return 'bg-sky-50 text-sky-700 border-sky-300 ring-2 ring-sky-400/30';
      case 'Citizen Confirmed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold';
      case 'Reopened':
        return 'bg-rose-50 text-rose-700 border-rose-300 font-bold';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const isResolvedPendingCitizen = issue.status === 'Resolved';

  return (
    <div className={`bg-white rounded-2xl border transition-all duration-200 hover:shadow-lg overflow-hidden flex flex-col justify-between ${
      isResolvedPendingCitizen 
        ? 'border-sky-300 ring-1 ring-sky-300 bg-gradient-to-b from-sky-50/30 to-white' 
        : 'border-slate-200 hover:border-slate-300'
    }`}>
      
      {/* Top Banner & Image */}
      <div>
        <div className="relative h-48 bg-slate-900 overflow-hidden cursor-pointer group" onClick={() => onSelect(issue)}>
          <img
            src={issue.imageUrl}
            alt={issue.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80';
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/30"></div>

          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border backdrop-blur-md shadow-sm ${getCategoryColor(issue.category)}`}>
              {issue.category}
            </span>

            <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border backdrop-blur-md shadow-sm ${getStatusBadge(issue.status)}`}>
              {issue.status}
            </span>
          </div>

          {/* Bottom Floating Info over Image */}
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
            <div className="flex items-center space-x-2 text-xs">
              <span className="flex items-center space-x-1 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md font-mono text-[11px] font-semibold text-slate-100 border border-white/20">
                <span>Priority {issue.priorityScore}/100</span>
              </span>

              {(issue.isMaster || issue.reportersCount > 1) && (
                <span className="flex items-center space-x-1 px-2 py-0.5 rounded-md bg-amber-900/90 backdrop-blur-md text-[11px] font-semibold text-amber-200 border border-amber-400/30">
                  <Users className="w-3 h-3" />
                  <span>{issue.reportersCount || (issue.linkedReportCount + 1)} Citizens</span>
                </span>
              )}
            </div>

            <div className="text-[11px] text-slate-300 bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
              {issue.city ? `${issue.city} · ${issue.ward}` : issue.ward}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 space-y-3">
          
          {/* Title & Description */}
          <div>
            <h3 
              onClick={() => onSelect(issue)} 
              className="font-bold text-slate-900 text-sm leading-snug hover:text-sky-700 transition cursor-pointer line-clamp-1"
            >
              {issue.title}
            </h3>
            <p className="text-xs text-slate-600 mt-1 line-clamp-2">
              {issue.description || 'Civic infrastructure defect requiring attention.'}
            </p>
          </div>

          {/* Department & Voice Tag */}
          <div className="flex items-center justify-between text-[11px] pt-0.5">
            <span className="font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              {issue.department || 'Roads & Infrastructure'}
            </span>
            {issue.originalVoiceText && (
              <span className="text-[11px] font-medium text-slate-500">
                Voice ({issue.detectedLanguage || 'Marathi'})
              </span>
            )}
          </div>

          {/* Address */}
          <div className="flex items-start space-x-1.5 text-xs text-slate-600">
            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
            <span className="line-clamp-1">{issue.address}</span>
          </div>

          {/* Inspection Assessment Snippet */}
          {issue.aiAnalysis && (
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start space-x-2 text-xs">
              <div className="text-[11px] text-slate-700 leading-tight">
                <span className="font-semibold text-slate-900">Inspection Note: </span>
                {issue.aiAnalysis.aiSummary || `Severity ${issue.severity}/5 (${issue.hazardLevel} hazard)`}
              </div>
            </div>
          )}

          {/* If Resolved, Citizen Verification Banner */}
          {isResolvedPendingCitizen && (
            <div className="p-3 bg-sky-50 rounded-xl border border-sky-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-sky-950 flex items-center space-x-1">
                  <CheckCircle className="w-3.5 h-3.5 text-sky-700" />
                  <span>Repair Work Submitted</span>
                </span>
                <span className="text-[11px] text-sky-800 block mt-0.5">
                  Verify ground resolution to confirm closure
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onVerifyClick(issue);
                }}
                className="px-3 py-1.5 bg-sky-700 hover:bg-sky-800 text-white rounded-lg text-xs font-semibold shadow-xs transition active:scale-95"
              >
                Verify Work
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-4 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs">
        
        {/* Upvote / Endorse Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onUpvote(issue._id);
          }}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition active:scale-95 shadow-2xs"
        >
          <ThumbsUp className="w-3.5 h-3.5 text-slate-600" />
          <span>{issue.upvoteCount || 1}</span>
          <span className="hidden sm:inline font-normal text-slate-500">endorsed</span>
        </button>

        {/* View Details */}
        <button
          onClick={() => onSelect(issue)}
          className="flex items-center space-x-1 text-slate-600 hover:text-sky-600 font-semibold group transition"
        >
          <span>Timeline</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
        </button>

      </div>

    </div>
  );
}

