import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  ThumbsUp, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  User, 
  Building, 
  ShieldCheck, 
  ArrowRight,
  Flame,
  Calendar,
  Layers,
  FileText,
  Users,
  ShieldAlert,
  Lock
} from 'lucide-react';
import WorkOrderModal from './WorkOrderModal';

export default function IssueDetailModal({ issue, isOpen, onClose, onUpvote, onVerifyClick, onResolveClick }) {
  const [showWorkOrder, setShowWorkOrder] = useState(false);
  if (!isOpen || !issue) return null;

  const isResolved = issue.status === 'Resolved';
  const isConfirmed = issue.status === 'Citizen Confirmed' || !!issue.citizenVerification?.verified;

  return (
    <div className="fixed inset-0 z-[999] overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-6 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-sky-500/20 text-sky-300 border border-sky-400/30">
              {issue.category}
            </span>
            <span className="text-xs font-mono text-slate-400">
              ID: #{issue._id.slice(-6)}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${
              issue.status === 'Resolved' ? 'bg-sky-500 text-white' :
              issue.status === 'Citizen Confirmed' ? 'bg-emerald-500 text-white' :
              'bg-slate-800 text-slate-200'
            }`}>
              {issue.status}
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Title & Description */}
          <div>
            <h2 className="text-xl font-bold text-slate-900">{issue.title}</h2>
            <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1.5">
              <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{issue.address}</span>
              <span>·</span>
              <span className="font-semibold text-slate-700">{issue.ward}</span>
              <span>·</span>
              <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {issue.municipality || `${issue.city || 'Alandi'} Municipal Council`}
              </span>
            </div>
            {/* Voice Input & Translation Breakdown */}
            {issue.originalVoiceText && (
              <div className="mt-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    Citizen Spoken Voice Note ({issue.detectedLanguage || 'Marathi'}):
                  </span>
                  <p className="text-xs text-slate-900 font-medium italic mt-0.5 bg-white p-2.5 rounded-lg border border-slate-200">
                    "{issue.originalVoiceText}"
                  </p>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-sky-700 block">
                    AI Translated English Description:
                  </span>
                  <p className="text-xs text-slate-800 font-medium mt-0.5 bg-sky-50/60 p-2.5 rounded-lg border border-sky-100">
                    {issue.translatedEnglishText || issue.description}
                  </p>
                </div>

                {issue.aiAnalysis?.smartRoutingReason && (
                  <div className="text-[11px] text-slate-600 pt-1 border-t border-slate-200">
                    <span className="font-semibold text-slate-800">Routing Decision: </span>
                    {issue.aiAnalysis.smartRoutingReason}
                  </div>
                )}
              </div>
            )}

            {!issue.originalVoiceText && issue.description && (
              <p className="text-sm text-slate-700 mt-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                {issue.description}
              </p>
            )}
          </div>

          {/* Photo Gallery: Before vs After (If resolved) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Photographic Evidence {issue.resolutionProof?.afterImageUrl ? '(Before vs After)' : ''}
            </label>

            {issue.resolutionProof?.afterImageUrl ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Before Photo */}
                <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-900 relative">
                  <img 
                    src={issue.imageUrl} 
                    alt="Before Problem" 
                    className="w-full h-56 object-cover" 
                    onError={(e) => { e.target.src = '/issues/garbage-1.jpg'; }}
                  />
                  <div className="absolute top-2 left-2 px-2.5 py-1 bg-rose-600/90 text-white text-xs font-bold rounded shadow backdrop-blur-sm">
                    BEFORE (Reported Defect)
                  </div>
                </div>

                {/* After Photo */}
                <div className="rounded-xl overflow-hidden border-2 border-emerald-500 bg-slate-900 relative">
                  <img 
                    src={issue.resolutionProof.afterImageUrl} 
                    alt="After Resolution" 
                    className="w-full h-56 object-cover" 
                    onError={(e) => { e.target.src = '/issues/resolved-infrastructure-1.jpg'; }}
                  />
                  <div className="absolute top-2 left-2 px-2.5 py-1 bg-emerald-600/90 text-white text-xs font-bold rounded shadow backdrop-blur-sm">
                    AFTER (Department Fix)
                  </div>
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 text-emerald-300 text-[11px] font-mono font-bold rounded">
                    AI Match: {issue.resolutionProof.aiVerificationScore}%
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-900 max-h-72 flex items-center justify-center">
                <img 
                  src={issue.imageUrl} 
                  alt={issue.title} 
                  className="w-full h-72 object-cover" 
                  onError={(e) => { e.target.src = '/issues/garbage-1.jpg'; }}
                />
              </div>
            )}
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 block">Priority Rating</span>
              <div className="mt-1 font-mono font-bold text-slate-900 text-lg">
                {issue.priorityScore}/100
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 block">Assessed Severity</span>
              <div className="flex items-center space-x-1.5 mt-1">
                <span className="text-lg font-bold text-slate-900">{issue.severity}/5</span>
                <span className="text-[11px] font-semibold text-rose-700">({issue.hazardLevel})</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 block">Citizens Affected</span>
              <div className="flex items-center space-x-1.5 mt-1">
                <ThumbsUp className="w-4 h-4 text-slate-600" />
                <span className="text-lg font-bold text-slate-900">{issue.upvoteCount || 1}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 block">Target SLA</span>
              <div className="flex items-center space-x-1.5 mt-1">
                <Clock className="w-4 h-4 text-slate-600" />
                <span className="text-xs font-bold text-slate-900">
                  {issue.aiAnalysis?.estimatedTurnaroundHours || 24} Hours
                </span>
              </div>
            </div>
          </div>

          {/* Assigned Department Info */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500">Assigned Municipal Division</span>
                <div className="text-sm font-bold text-slate-900">{issue.department}</div>
                {issue.assignedWorker?.name && (
                  <div className="text-xs text-slate-600 mt-0.5">
                    Field Unit: <span className="font-semibold text-slate-800">{issue.assignedWorker.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Technical Survey Assessment */}
          {issue.aiAnalysis && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 mb-1.5">
                <Sparkles className="w-4 h-4 text-slate-600" />
                <span>Technical Survey Assessment</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {issue.aiAnalysis.aiSummary}
              </p>
              {issue.aiAnalysis.detectedHazards && issue.aiAnalysis.detectedHazards.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {issue.aiAnalysis.detectedHazards.map((h, i) => (
                    <span key={i} className="px-2 py-0.5 bg-rose-50 text-rose-800 text-[10px] font-semibold rounded-md border border-rose-200">
                      {h}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Multi-Citizen Reporter Clustering Section */}
          {(issue.reportersCount > 1 || (issue.coReporters && issue.coReporters.length > 0)) && (
            <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs font-bold text-amber-950">
                  <Users className="w-4 h-4 text-amber-700" />
                  <span>Reported by {issue.reportersCount || (issue.coReporters?.length + 1)} Citizens</span>
                </div>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                  Aggregated Civic Issue
                </span>
              </div>
              <p className="text-xs text-amber-900 leading-relaxed">
                Multiple citizens reported this exact problem. FixMyArea aggregated all reports into this single high-priority ticket to prevent duplicate municipal dispatch.
              </p>
              
              <div className="space-y-1.5 pt-1">
                <div className="p-2.5 rounded-lg bg-white border border-amber-200/80 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                    <span className="font-bold text-slate-800 truncate">{issue.reportedBy?.name || 'Original Reporter'}</span>
                    <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded font-medium shrink-0">First Reporter</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono shrink-0">
                    {new Date(issue.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </div>

                {issue.coReporters?.map((rep, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-white border border-amber-200/80 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                      <span className="font-bold text-slate-800 truncate">{rep.name || 'Co-Reporter'}</span>
                      <span className="text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded font-medium shrink-0">Confirmed Same Issue</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono shrink-0">
                      {new Date(rep.reportedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Master Consolidated Incident Reports (Slide 4 requirement) */}
          {issue.isMaster && issue.linkedReports && issue.linkedReports.length > 0 && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 mb-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>Consolidated Citizen Reports ({issue.linkedReports.length} Merged Duplicates)</span>
              </div>
              <p className="text-xs text-slate-600 mb-3">
                Multiple citizens reported this same physical issue. The system consolidated them into 1 master dispatch so authorities act on the real ground problem once.
              </p>
              <div className="space-y-2">
                {issue.linkedReports.map((report) => (
                  <div key={report._id} className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800">{report.title}</span>
                    <span className="text-[11px] text-slate-400">Report #{report._id.slice(-4)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lifecycle Timeline */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
              Lifecycle Journey & Audit Trail
            </label>
            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {issue.timeline?.map((step, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-sky-600 ring-4 ring-white"></div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-900">{step.status}</span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{step.comment}</p>
                    <span className="text-[10px] text-sky-700 font-medium">By: {step.updatedBy}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Action Bar */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onUpvote(issue._id)}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition shadow-sm active:scale-95"
            >
              <ThumbsUp className="w-4 h-4 text-sky-600" />
              <span>Endorse ({issue.upvoteCount || 1})</span>
            </button>

            {isConfirmed ? (
              <button
                onClick={() => setShowWorkOrder(true)}
                className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-800 transition active:scale-95 shadow-2xs"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                <span>Completion Certificate</span>
              </button>
            ) : (
              <div 
                title="Completion certificate is generated only after work is done on the ground and verified by the citizen."
                className="flex items-center space-x-1.5 px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium text-slate-500 select-none cursor-default"
              >
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Certificate: Locked Until Citizen Sign-off</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {isResolved && (
              <button
                onClick={() => {
                  onClose();
                  onVerifyClick(issue);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center space-x-1.5 active:scale-95 transition"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Verify Resolution</span>
              </button>
            )}

            {!isResolved && !isConfirmed && onResolveClick && (
              <button
                onClick={() => {
                  onClose();
                  onResolveClick(issue);
                }}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow transition active:scale-95"
              >
                Department: Submit Fix Proof
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Printable Work Order Modal */}
      <WorkOrderModal
        issue={issue}
        isOpen={showWorkOrder}
        onClose={() => setShowWorkOrder(false)}
      />
    </div>
  );
}

