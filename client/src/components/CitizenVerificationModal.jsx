import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Star, 
  Sparkles, 
  ShieldCheck, 
  RefreshCw, 
  Loader2 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { submitCitizenVerification } from '../services/api';

export default function CitizenVerificationModal({ issue, isOpen, onClose, onSuccess }) {
  const [confirmed, setConfirmed] = useState(true);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !issue) return null;

  const handleAction = async (isConfirm) => {
    try {
      setIsSubmitting(true);
      const res = await submitCitizenVerification(issue._id, {
        confirmed: isConfirm,
        comment: comment || (isConfirm ? 'Issue visually confirmed as resolved.' : 'Issue is still not fixed on ground.'),
        rating: isConfirm ? rating : 1,
        citizenName: 'Citizen Verifier'
      });

      if (res.success) {
        if (isConfirm) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
        onSuccess(res.issue);
        onClose();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Verification submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-6">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-700 via-teal-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 p-1 flex items-center justify-center border border-white/20">
              <img src="/logo-icon.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 className="font-bold text-base">Was it Actually Fixed? — Citizen Verification</h3>
              <p className="text-xs text-emerald-100">FixMyArea Ground Truth & Accountability Loop</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          <div>
            <h4 className="font-bold text-slate-900 text-sm">{issue.title}</h4>
            <p className="text-xs text-slate-500 mt-0.5">{issue.address}</p>
          </div>

          {/* Before vs After Side-by-Side Comparison */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Before vs After Verification
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* BEFORE */}
              <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-900 relative">
                <img src={issue.imageUrl} alt="Before" className="w-full h-44 object-cover" />
                <span className="absolute top-2 left-2 px-2 py-0.5 bg-rose-600/90 text-white text-[10px] font-bold rounded">
                  BEFORE (Issue)
                </span>
              </div>

              {/* AFTER */}
              <div className="rounded-xl overflow-hidden border-2 border-emerald-500 bg-slate-900 relative">
                <img 
                  src={issue.resolutionProof?.afterImageUrl || issue.imageUrl} 
                  alt="After" 
                  className="w-full h-44 object-cover" 
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 bg-emerald-600/90 text-white text-[10px] font-bold rounded">
                  AFTER (Department Proof)
                </span>
              </div>

            </div>
          </div>

          {/* Visual Audit Result */}
          {issue.resolutionProof?.aiVerificationNotes && (
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start space-x-2.5">
              <div className="text-xs text-emerald-950">
                <span className="font-bold">Visual Verification Audit ({issue.resolutionProof.aiVerificationScore}% Confidence): </span>
                <span>{issue.resolutionProof.aiVerificationNotes}</span>
              </div>
            </div>
          )}

          {/* Department Notes */}
          {issue.resolutionProof?.resolutionNotes && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-700 block mb-1">
                Field Officer Notes ({issue.resolutionProof.resolvedBy || 'Department'}):
              </span>
              <p className="text-slate-600 italic">"{issue.resolutionProof.resolutionNotes}"</p>
            </div>
          )}

          {/* Star Rating */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Rate Resolution Quality (1 - 5)
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 text-amber-500 hover:scale-105 transition"
                >
                  <Star className={`w-5 h-5 ${star <= rating ? 'fill-amber-400 text-amber-500' : 'text-slate-200'}`} />
                </button>
              ))}
              <span className="text-xs font-semibold text-slate-600 ml-2">
                {rating === 5 ? 'Excellent Work' : rating >= 3 ? 'Satisfactory' : 'Unsatisfactory'}
              </span>
            </div>
          </div>

          {/* Citizen Comment / Dispute Reason */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Your Feedback / Ground Verification Remarks
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
              placeholder="E.g., Road is smooth and properly patched now, thank you! OR: The garbage was only partially cleared..."
              className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Action Choice Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            
            {/* Reopen Button */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleAction(false)}
              className="w-full px-4 py-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className="w-4 h-4 text-rose-600" />
              <span>Not Fixed (Reopen Issue)</span>
            </button>

            {/* Confirm Fixed Button */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleAction(true)}
              className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/25 flex items-center justify-center space-x-2 transition active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-white" />
              )}
              <span>Yes, Confirm Fixed & Close</span>
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}

