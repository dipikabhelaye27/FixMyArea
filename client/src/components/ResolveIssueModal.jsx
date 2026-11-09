import React, { useState } from 'react';
import { 
  X, 
  UploadCloud, 
  CheckCircle2, 
  Sparkles, 
  Loader2, 
  ShieldCheck, 
  Camera 
} from 'lucide-react';
import { resolveIssueWithProof } from '../services/api';

export default function ResolveIssueModal({ issue, isOpen, onClose, onSuccess }) {
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [notes, setNotes] = useState('');
  const [officerName, setOfficerName] = useState('Er. Field Supervisor');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !issue) return null;

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!photo) {
      alert('Please upload an After Resolution photo to substantiate completion.');
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('afterImage', photo);
      formData.append('resolutionNotes', notes || 'Issue repaired and verified by municipal crew.');
      formData.append('officerName', officerName);

      const res = await resolveIssueWithProof(issue._id, formData);
      if (res.success) {
        onSuccess(res.issue);
        onClose();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Resolution submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-6">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-sky-400" />
            <div>
              <h3 className="font-bold text-base">Department: Submit Proof of Resolution</h3>
              <p className="text-xs text-slate-300">Issue #{issue._id.slice(-6)} · {issue.category}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Target Issue</span>
            <h4 className="font-bold text-slate-900 text-sm mt-0.5">{issue.title}</h4>
            <p className="text-xs text-slate-500">{issue.address}</p>
          </div>

          {/* Upload After Photo */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Resolution "After" Proof Photo (Required)
            </label>

            {photoPreview ? (
              <div className="relative rounded-xl overflow-hidden border-2 border-emerald-400 bg-slate-950 h-52 flex items-center justify-center group">
                <img src={photoPreview} alt="After Preview" className="w-full h-52 object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <label className="cursor-pointer px-3 py-1.5 bg-white text-slate-900 text-xs font-bold rounded-lg shadow">
                    Change After Photo
                    <input type="file" accept="image/*" onChange={handlePhotoSelect} className="hidden" />
                  </label>
                </div>
                <div className="absolute bottom-2 left-2 px-2.5 py-1 bg-emerald-900/90 text-emerald-200 text-[11px] font-semibold rounded-md flex items-center space-x-1 backdrop-blur-sm">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span>Gemini AI will cross-verify with original complaint image</span>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/40 transition rounded-xl p-6 cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2">
                  <Camera className="w-5 h-5" />
                </div>
                <span className="text-sm font-bold text-emerald-950">Upload Completed Work Photo</span>
                <span className="text-xs text-slate-500 mt-1">Show repaired road, cleaned spot, fixed lamp</span>
                <input type="file" accept="image/*" onChange={handlePhotoSelect} className="hidden" />
              </label>
            )}
          </div>

          {/* Resolution Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Field Work Description
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="E.g., Bitumen patch rolled and leveled; debris cleared and transported to recycling station..."
              className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Officer Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Officer / Supervisor Sign-off
            </label>
            <input
              type="text"
              value={officerName}
              onChange={(e) => setOfficerName(e.target.value)}
              className="w-full p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end space-x-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center space-x-2 transition active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>AI Verifying Resolution...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  <span>Submit Fix with AI Audit</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

