import React from 'react';
import { 
  Sparkles, 
  Mic, 
  Building2, 
  Layers, 
  ShieldCheck, 
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export default function WhyChooseUs({ onOpenReport, setActiveTab }) {
  const features = [
    {
      id: 1,
      title: 'Multilingual Voice & Photo AI',
      description: 'Speak in Marathi, Hindi, or English or snap a photo. Gemini AI transcribes your audio, detects hazard severity, and formats the complaint automatically.',
      icon: Mic,
      tag: 'AI Powered'
    },
    {
      id: 2,
      title: 'Direct Municipal Dispatch',
      description: 'No physical visits or bureaucratic confusion. Issues are instantly geo-located and routed straight to the responsible engineer in PWD, SWM, Water, or Electricity.',
      icon: Building2,
      tag: 'Zero Red Tape'
    },
    {
      id: 3,
      title: 'Smart Co-Reporting & Upvoting',
      description: 'Multiple citizen reports within the same 15-meter radius are automatically merged into one master docket, amplifying neighborhood urgency without clutter.',
      icon: Layers,
      tag: 'Deduplicated'
    },
    {
      id: 4,
      title: 'Verified Photographic Proof',
      description: 'Field workers must submit timestamped before-and-after photos from the ground. Citizens review the fix and sign off before cases are closed.',
      icon: ShieldCheck,
      tag: 'Citizen Verified'
    }
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 select-none">
      
      {/* Outer Card with Light Theme matching FixMyArea aesthetic */}
      <div className="relative overflow-hidden bg-white rounded-3xl lg:rounded-[40px] border border-stone-200/80 shadow-xl shadow-stone-200/50">
        
        {/* Subtle Ambient Background Gradients for depth */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute -bottom-20 right-1/4 w-[450px] h-[450px] bg-teal-500/5 rounded-full blur-[120px] pointer-events-none"></div>

        {/* Soft Radiant Halo behind left text */}
        <div className="absolute top-1/4 left-1/6 w-80 h-80 bg-white/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* =========================================================================
            MATHEMATICALLY PRISTINE CIRCULAR CONVEX ARC (Vector Scaled Curve)
            Peaks precisely behind the circular badges without cutting text
            ========================================================================= */}
        <div className="absolute inset-0 pointer-events-none hidden lg:block overflow-hidden">
          <svg 
            className="w-full h-full" 
            viewBox="0 0 100 100" 
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="whyUsGradLight" x1="0%" y1="0%" x2="100%" y2="85%">
                <stop offset="0%" stopColor="#047857" />
                <stop offset="50%" stopColor="#059669" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
            <path 
              d="M 0,0 L 46,0 C 53,25 53,75 46,100 L 0,100 Z" 
              fill="url(#whyUsGradLight)" 
            />
          </svg>
        </div>

        {/* Mobile / Tablet Gradient Header */}
        <div className="absolute inset-x-0 top-0 h-[46%] bg-gradient-to-br from-emerald-700 via-teal-600 to-emerald-500 lg:hidden pointer-events-none rounded-b-[44px]"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px] items-stretch relative z-10">
          
          {/* =========================================================================
              LEFT COLUMN: CURVED HERO TYPOGRAPHY & CALL-TO-ACTION (Lush Emerald)
              ========================================================================= */}
          <div className="lg:col-span-6 p-8 sm:p-12 lg:p-14 flex flex-col justify-center space-y-8">
            
            {/* Center Bold Typography */}
            <div className="space-y-4 max-w-lg">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight uppercase leading-[1.08] drop-shadow-sm">
                Report Any Issue <br />
                To Fix Your <br />
                City Area <br />
                Effortlessly.
              </h2>
              <p className="text-xs sm:text-sm text-emerald-50/95 leading-relaxed font-medium">
                Traditional grievance helplines leave citizens in the dark. FixMyArea combines computer vision, voice recognition, and real-time SLA accountability so your civic issues get solved fast.
              </p>
            </div>

            {/* Bottom Button */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onOpenReport}
                className="px-6 py-3.5 bg-white hover:bg-emerald-50 text-emerald-950 font-black rounded-2xl text-xs sm:text-sm shadow-xl shadow-black/10 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center space-x-2 cursor-pointer border border-emerald-100"
              >
                <span>Report Issue Now</span>
                <ArrowRight className="w-4 h-4 text-emerald-600" />
              </button>
            </div>

          </div>

          {/* =========================================================================
              RIGHT COLUMN: 4 VERTICAL FEATURE CARDS (Light Theme with Slate Text)
              ========================================================================= */}
          <div className="lg:col-span-6 p-8 sm:p-12 lg:p-14 lg:pl-10 flex flex-col justify-center space-y-7 bg-white/40 lg:bg-transparent">
            
            {/* Connecting Vertical Guide Line in Light Theme */}
            <div className="absolute left-[38px] sm:left-[54px] lg:left-[51.5%] top-16 bottom-16 w-0.5 bg-gradient-to-b from-emerald-200 via-teal-200 to-emerald-100 pointer-events-none hidden sm:block"></div>

            {features.map((feature) => {
              const IconComponent = feature.icon;
              return (
                <div 
                  key={feature.id}
                  className="relative flex items-start space-x-4 sm:space-x-5 group transition-transform duration-200 hover:translate-x-1.5"
                >
                  {/* Floating Circular Icon Badge with Light Theme Styling */}
                  <div className="shrink-0 relative z-10">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white group-hover:bg-emerald-600 border-2 border-emerald-200 group-hover:border-emerald-500 shadow-md shadow-emerald-950/5 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                      <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 group-hover:text-white transition-colors" />
                    </div>
                  </div>

                  {/* Feature Content with High Contrast Dark Slate Text */}
                  <div className="space-y-1.5 pt-0.5 flex-1">
                    <div className="flex items-center space-x-2.5">
                      <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight group-hover:text-emerald-700 transition-colors">
                        {feature.title}
                      </h3>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                        {feature.tag}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}

          </div>

        </div>

      </div>

    </section>
  );
}