import React from 'react';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Printer, 
  X, 
  Flame, 
  ThumbsUp,
  ArrowLeft,
  ShieldAlert,
  Lock
} from 'lucide-react';

export default function WorkOrderModal({ issue, isOpen, onClose }) {
  if (!isOpen || !issue) return null;

  const isCitizenVerified = issue.status === 'Citizen Confirmed' || !!issue.citizenVerification?.verified;

  const handlePrint = () => {
    const certificateElem = document.getElementById('printable-certificate');
    if (!certificateElem) {
      window.print();
      return;
    }

    const printWindow = window.open('', '_blank', 'width=1020,height=920');
    if (!printWindow) {
      window.print();
      return;
    }

    // Clone and sanitize print content
    const cloned = certificateElem.cloneNode(true);
    cloned.querySelectorAll('.print\\:hidden').forEach(el => el.remove());
    const contentHtml = cloned.innerHTML;

    printWindow.document.open();
    printWindow.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Municipal Work Order & Completion Certificate - FMA-${(issue._id || '').slice(-8).toUpperCase()}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 14mm;
    }
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 0;
    }
    img {
      max-width: 100%;
      height: auto;
    }
    @media print {
      body {
        margin: 0;
        padding: 0;
      }
    }
  </style>
</head>
<body class="p-6 bg-white">
  <div class="max-w-[210mm] mx-auto space-y-6">
    ${contentHtml}
  </div>
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.focus();
        window.print();
      }, 500);
    };
  </script>
</body>
</html>`);
    printWindow.document.close();
  };

  if (!isCitizenVerified) {
    return (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-sm font-['Plus_Jakarta_Sans',sans-serif]">
        <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-scale-up">
          {/* Header */}
          <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer active:scale-95"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <div className="flex items-center space-x-2 pl-2 border-l border-white/20">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-xs sm:text-sm">Certificate Locked</h3>
              </div>
            </div>

            <button 
              onClick={onClose} 
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Locked Notice Body */}
          <div className="p-6 sm:p-8 space-y-5 text-center flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-inner">
              <Lock className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100/80 px-2.5 py-1 rounded-full border border-amber-300">
                Work Incomplete or Pending Verification
              </span>
              <h2 className="text-lg font-bold text-slate-900 pt-1">
                No Completion Certificate Generated
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed max-w-sm">
                Under statutory municipal charter rules, an official completion certificate cannot be generated while this grievance is still marked as <strong className="text-slate-800 font-bold">{issue.status}</strong>.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl w-full text-left text-xs space-y-1.5 text-slate-700">
              <p className="font-bold text-slate-900">Certificate unlocks only after:</p>
              <ul className="list-disc pl-4 space-y-1 text-slate-600 text-[11px]">
                <li>Physical repair work is completed on-site by municipal crew.</li>
                <li>Before and after photographic evidence is recorded.</li>
                <li>The reporting citizen inspects and confirms satisfaction.</li>
              </ul>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow transition active:scale-95"
            >
              Back to Grievance Details
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-sm font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Scrollable Modal Card */}
      <div className="relative w-full max-w-3xl max-h-[92vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-scale-up">
        
        {/* Fixed Header Bar with Single Back Button & Print/Save Action */}
        <div className="px-5 sm:px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <div className="hidden sm:flex items-center space-x-2 pl-2 border-l border-white/20">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              <h3 className="font-bold text-xs sm:text-sm">Official Work Order Certificate</h3>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition shadow cursor-pointer active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Save as PDF / Print</span>
            </button>
            <button 
              onClick={onClose} 
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Certificate Body (Native Smooth Scroll) */}
        <div className="p-6 sm:p-8 space-y-6 text-slate-900 font-sans overflow-y-auto flex-1 min-h-0" id="printable-certificate">
          
          {/* Official Letterhead */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src="/logo-full.png" 
                alt="FixMyArea Logo" 
                className="h-12 w-auto object-contain" 
              />
              <div className="pl-3 border-l-2 border-slate-300">
                <h1 className="text-base font-extrabold uppercase tracking-tight text-slate-900 leading-tight">
                  {issue.municipality || 'Municipal Council'}
                </h1>
                <p className="text-[11px] text-slate-500 font-medium">
                  Public Works & Quality Audit Directorate · {issue.district ? `${issue.district} District` : (issue.city || 'Civic Administration')}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Ticket Ref</span>
              <span className="text-sm font-mono font-bold text-slate-900">FMA-{issue._id.slice(-8).toUpperCase()}</span>
            </div>
          </div>

          {/* Certificate Title */}
          <div className="text-center py-2 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs font-extrabold uppercase tracking-widest text-slate-700 block">
              CIVIC GRIEVANCE COMPLETION & CITIZEN VERIFICATION CERTIFICATE
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Issued in accordance with Municipal Citizens Charter & Public Infrastructure Standards
            </p>
          </div>

          {/* Details Table */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl space-y-1.5 border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Grievance Overview</span>
              <div><span className="font-bold">Subject:</span> {issue.title}</div>
              <div><span className="font-bold">Category:</span> {issue.category} ({issue.subCategory || 'Standard'})</div>
              <div><span className="font-bold">Ward / Zone:</span> {issue.ward}</div>
              <div><span className="font-bold">Location:</span> {issue.address}</div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl space-y-1.5 border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Resolution Credentials</span>
              <div><span className="font-bold">Department:</span> {issue.department}</div>
              <div><span className="font-bold">Supervisor:</span> {issue.resolutionProof?.resolvedBy || 'Department Officer'}</div>
              <div><span className="font-bold">Citizens Endorsed:</span> {issue.upvoteCount || 1} Citizen(s) Affected</div>
              <div><span className="font-bold">Status:</span> <span className="font-bold text-emerald-700">{issue.status}</span></div>
            </div>
          </div>

          {/* Before vs After Visual Proof Grid */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Photographic Inspection Evidence (Before vs After)
            </span>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="h-44 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                  <img 
                    src={issue.imageUrl} 
                    alt="Before Fix" 
                    className="w-full h-full object-cover" 
                    onError={(e) => { e.target.src = '/issues/garbage-1.jpg'; }}
                  />
                </div>
                <div className="text-center p-1.5 bg-rose-50 border border-rose-200 rounded-lg text-[10px] font-bold text-rose-800">
                  BEFORE: Defect Reported by Citizen
                </div>
              </div>

              <div className="space-y-1">
                <div className="h-44 rounded-xl overflow-hidden bg-slate-100 border-2 border-emerald-500 shadow-sm">
                  {issue.resolutionProof?.afterImageUrl ? (
                    <img 
                      src={issue.resolutionProof.afterImageUrl} 
                      alt="After Resolution" 
                      className="w-full h-full object-cover" 
                      onError={(e) => { e.target.src = '/issues/resolved-infrastructure-1.jpg'; }}
                    />
                  ) : (
                    <img 
                      src={issue.imageUrl} 
                      alt="Current Condition" 
                      className="w-full h-full object-cover opacity-90" 
                      onError={(e) => { e.target.src = '/issues/resolved-infrastructure-1.jpg'; }}
                    />
                  )}
                </div>
                <div className="text-center p-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-[10px] font-bold text-emerald-800">
                  AFTER: Repair Executed by Municipal Crew
                </div>
              </div>
            </div>
          </div>

          {/* AI Verification Metric */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <div className="font-bold text-slate-800 flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Photographic Evidence Quality Audit</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Restoration work verified against original reported defect.
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Visual Restoration Confidence</span>
              <span className="text-sm font-black text-emerald-700">94%</span>
            </div>
          </div>

          {/* Citizen Verification Note */}
          {issue.citizenVerification && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
              <div className="font-bold text-emerald-900 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Citizen Ground Satisfaction Feedback</span>
              </div>
              <p className="text-slate-700 text-[11px] mt-1">
                Citizen confirmed the physical issue is resolved. Rating: <span className="font-bold text-slate-900">{issue.citizenVerification.rating || 5} / 5</span>
              </p>
              {issue.citizenVerification.comment && (
                <p className="text-slate-600 text-[11px] italic mt-0.5">
                  "{issue.citizenVerification.comment}"
                </p>
              )}
            </div>
          )}

          {/* Official Signatures Bar */}
          <div className="pt-6 border-t border-slate-300 grid grid-cols-3 gap-4 text-center text-xs">
            <div>
              <div className="h-10 border-b border-dashed border-slate-400 mb-1 flex items-end justify-center font-mono text-[11px] text-slate-400">
                [Digitally Certified]
              </div>
              <span className="font-bold text-slate-800 block">Automated Technical Triage</span>
              <span className="text-[10px] text-slate-500">FixMyArea Core System</span>
            </div>

            <div>
              <div className="h-10 border-b border-dashed border-slate-400 mb-1 flex items-end justify-center font-bold text-slate-700 text-[11px]">
                {issue.resolutionProof?.resolvedBy || 'Er. Field Officer'}
              </div>
              <span className="font-bold text-slate-800 block">Department Engineer</span>
              <span className="text-[10px] text-slate-500">{issue.department}</span>
            </div>

            <div>
              <div className="h-10 border-b border-dashed border-slate-400 mb-1 flex items-end justify-center font-mono text-[11px] text-emerald-600 font-bold">
                VERIFIED CLOSED
              </div>
              <span className="font-bold text-slate-800 block">Citizen Audit Closing</span>
              <span className="text-[10px] text-slate-500">FixMyArea Accountability Loop</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
