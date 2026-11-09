import React, { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';

export default function MobileRestrictionModal() {
  const [isMobile, setIsMobile] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const isMobileWidth = window.innerWidth < 768;
      const isMobileUA = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(isMobileWidth || isMobileUA);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // If not mobile, do not render
  if (!isMobile) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[99999] bg-[#FAF7F2] text-slate-900 flex flex-col justify-between p-6 sm:p-10 select-none overflow-hidden font-['-apple-system',BlinkMacSystemFont,'SF_Pro_Display','Plus_Jakarta_Sans',sans-serif]">
      
      {/* Warm Ambient Halo Lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] bg-gradient-to-tr from-amber-200/35 via-emerald-100/30 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[320px] h-[320px] bg-amber-100/40 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar with Brand Logo */}
      <div className="relative z-10 flex items-center justify-start pt-2">
        <img 
          src="/logo-full.png" 
          alt="FixMyArea" 
          className="h-8 sm:h-9 w-auto object-contain" 
        />
      </div>

      {/* Center Showcase */}
      <div className="relative z-10 max-w-sm mx-auto text-center space-y-7 my-auto py-4">
        
        {/* Smartphone Coming Soon Illustration */}
        <div className="relative flex justify-center items-center">
          <div className="relative">
            {/* Soft subtle glow */}
            <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none scale-90" />
            
            <img 
              src="/mobile-coming-soon.png" 
              alt="Coming Soon to Mobile" 
              className="relative w-48 sm:w-56 h-auto object-contain mx-auto drop-shadow-xl" 
            />
          </div>
        </div>

        {/* Clean Headline & Copy */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-tight">
            Not available yet on phones.
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            FixMyArea for mobile is under development and will be available soon.
          </p>
        </div>

        {/* Primary Action Button */}
        <div className="pt-2">
          <button
            onClick={handleCopyLink}
            className="w-full py-3.5 px-5 rounded-2xl bg-slate-900 hover:bg-black text-white font-semibold text-xs sm:text-sm transition-all active:scale-95 shadow-xl shadow-slate-900/15 flex items-center justify-center space-x-2 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Link Copied to Clipboard</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-300" />
                <span>Copy Link to Open on Desktop</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* Footer Info */}
      <div className="relative z-10 text-center text-[11px] text-slate-400 pb-2">
        Please visit on your Mac, PC, or iPad
      </div>

    </div>
  );
}

