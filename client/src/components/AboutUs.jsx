import React from 'react';
import { 
  Building2, 
  MapPin, 
  Mic, 
  Layers, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  ArrowRight,
  Users,
  Compass
} from 'lucide-react';

export default function AboutUs({ onGetStarted }) {
  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-10 space-y-12">
      
      {/* Hero Intro */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>The FixMyArea Mission</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Unifying the Journey of a Civic Issue from{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
            Report to Real-World Fix
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Citizens don't experience civic problems in isolated government silos. Whether it is a pothole, uncollected garbage, broken streetlight, or a water leak — FixMyArea provides one effortless place to report, while autonomous AI manages the complexity behind the scenes.
        </p>
      </div>

      {/* The 3 Core Inefficiencies We Solve */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            01
          </div>
          <h3 className="text-base font-bold text-slate-900">Fragmented Systems</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Existing portals require citizens to know which department handles which issue, fill long bureaucratic dropdowns, and navigate complex forms.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            02
          </div>
          <h3 className="text-base font-bold text-slate-900">Duplicate Noise</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            15 citizens may report the same pothole over a week. Rather than 15 separate confusing tickets, our spatial engine consolidates them into 1 master issue.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            03
          </div>
          <h3 className="text-base font-bold text-slate-900">Unverified Closures</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Grievances are often marked "Resolved" on paper without real repair. FixMyArea requires Before & After photographic audit and citizen confirmation.
          </p>
        </div>
      </div>

      {/* The End-to-End Workflow */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-10 shadow-sm space-y-8">
        <div>
          <h2 className="text-xl font-bold text-slate-900">How FixMyArea Works</h2>
          <p className="text-xs text-slate-500 mt-1">From mobile capture to verified physical resolution</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex items-start space-x-3.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100/70 text-emerald-800 flex items-center justify-center shrink-0 font-bold text-xs">
              1
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Photo + Voice Note</h4>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                Citizens simply take a photo and speak in their local language (English, Marathi, Hindi). GPS automatically pins exact coordinates.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100/70 text-emerald-800 flex items-center justify-center shrink-0 font-bold text-xs">
              2
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">AI Multilingual Triage</h4>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                Google Gemini translates the voice note, analyzes visual hazard severity (1-5), and auto-routes the ticket to the responsible department.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100/70 text-emerald-800 flex items-center justify-center shrink-0 font-bold text-xs">
              3
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Geospatial Deduplication</h4>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                Within 100 meters, repeated reports are linked into one master ticket. Every endorsement increases priority for faster crew dispatch.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100/70 text-emerald-800 flex items-center justify-center shrink-0 font-bold text-xs">
              4
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Verified Ground Closure</h4>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                Municipal workers submit an AFTER photo. The AI compares Before vs After restoration, and citizens sign off on the fix before closure.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
          <div className="text-xs text-slate-500">
            Open civic platform for smart cities, municipal corporations, and resident welfare communities.
          </div>
          <button
            onClick={onGetStarted}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-95"
          >
            Report an Issue Now
          </button>
        </div>
      </div>

    </div>
  );
}

