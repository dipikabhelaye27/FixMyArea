import React from 'react';
import { 
  Home, 
  MapPin, 
  Users, 
  Info, 
  Plus, 
  Lock, 
  LogOut, 
  LayoutDashboard,
  Eye,
  Shield,
  Activity,
  Building2
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  onOpenReport, 
  currentUser,
  onLogout
}) {
  const isOfficerOrAdmin = !!currentUser;
  const isAuthorityTerminal = activeTab === 'authority';

  // DEDICATED AUTHORITY / MUNICIPAL HEADER (Clean, Professional, Cohesive with the App)
  if (isAuthorityTerminal) {
    const departmentName = currentUser?.department && currentUser.department !== 'All' 
      ? currentUser.department 
      : 'All Departments';

    return (
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[72px]">
            
            {/* Left: Brand + Official Authority Portal Badge */}
            <div className="flex items-center space-x-3">
              <div 
                className="flex items-center space-x-2.5 cursor-pointer" 
                onClick={() => setActiveTab('authority')}
              >
                <img 
                  src="/logo-full.png" 
                  alt="FixMyArea" 
                  className="h-10 w-auto object-contain" 
                />
                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200">
                  Authority Portal
                </span>
              </div>
            </div>

            {/* Center: Department Indicator */}
            <div className="hidden md:flex items-center space-x-2 text-xs">
              <span className="text-slate-400 font-medium">Managing:</span>
              <span className="font-bold text-slate-800 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/80">
                {departmentName}
              </span>
            </div>

            {/* Right: Officer Profile + Public View Switch + Sign Out */}
            <div className="flex items-center space-x-3 shrink-0">
              
              {/* Officer Profile Card */}
              {currentUser && (
                <div className="flex items-center space-x-2.5 pl-3 pr-2 py-1 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                    {currentUser.name ? currentUser.name.charAt(0) : 'O'}
                  </div>
                  <div className="text-left text-xs hidden sm:block">
                    <div className="font-bold text-slate-900 leading-tight">{currentUser.name}</div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      {currentUser.role === 'admin' ? 'Chief Officer' : currentUser.department}
                    </div>
                  </div>
                </div>
              )}

              {/* Switch to Public Site */}
              <button
                onClick={() => setActiveTab('feed')}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs transition active:scale-95"
                title="View public resident site"
              >
                <Eye className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Citizen View</span>
              </button>

              {/* Sign Out Button */}
              {isOfficerOrAdmin && (
                <button
                  onClick={onLogout}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 hover:border-rose-200 transition active:scale-95"
                  title="Sign out of municipal terminal"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              )}

            </div>

          </div>
        </div>
      </header>
    );
  }

  // STANDARD PUBLIC CITIZEN NAVBAR (When on Home, Community, About Us, Map)
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">
          
          {/* Left: Prominently Highlighted FixMyArea Logo */}
          <div 
            className="flex items-center space-x-2.5 cursor-pointer group shrink-0 select-none transition-transform duration-200 hover:scale-102" 
            onClick={() => setActiveTab('feed')}
          >
            <img 
              src="/logo-full.png" 
              alt="FixMyArea" 
              className="h-10 sm:h-11 w-auto object-contain drop-shadow-xs transition duration-200 group-hover:drop-shadow-sm" 
            />
          </div>

          {/* Center: Highlighted & Elevated Floating Island Navigation */}
          <nav className="hidden md:flex items-center p-1.5 bg-slate-100/95 backdrop-blur-md rounded-full border border-slate-200/80 shadow-xs gap-1">
            
            {/* 1. Home */}
            <button
              onClick={() => setActiveTab('feed')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                activeTab === 'feed'
                  ? 'bg-white text-slate-900 shadow-xs font-bold ring-1 ring-slate-200/80'
                  : 'text-slate-600 hover:text-emerald-700 hover:bg-white hover:shadow-2xs active:scale-95'
              }`}
            >
              <Home className={`w-4 h-4 transition-colors duration-200 shrink-0 ${activeTab === 'feed' ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>Home</span>
            </button>

            {/* 2. Community */}
            <button
              onClick={() => setActiveTab('community')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                activeTab === 'community'
                  ? 'bg-white text-emerald-900 shadow-xs font-bold ring-1 ring-slate-200/80'
                  : 'text-slate-600 hover:text-emerald-700 hover:bg-white hover:shadow-2xs active:scale-95'
              }`}
            >
              <Users className={`w-4 h-4 transition-colors duration-200 shrink-0 ${activeTab === 'community' ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>Community</span>
            </button>

            {/* 3. About Us */}
            <button
              onClick={() => setActiveTab('about')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                activeTab === 'about'
                  ? 'bg-white text-slate-900 shadow-xs font-bold ring-1 ring-slate-200/80'
                  : 'text-slate-600 hover:text-emerald-700 hover:bg-white hover:shadow-2xs active:scale-95'
              }`}
            >
              <Info className={`w-4 h-4 transition-colors duration-200 shrink-0 ${activeTab === 'about' ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>About Us</span>
            </button>

            {/* 4. Live Civic Map */}
            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                activeTab === 'map'
                  ? 'bg-white text-slate-900 shadow-xs font-bold ring-1 ring-slate-200/80'
                  : 'text-slate-600 hover:text-emerald-700 hover:bg-white hover:shadow-2xs active:scale-95'
              }`}
            >
              <MapPin className={`w-4 h-4 transition-colors duration-200 shrink-0 ${activeTab === 'map' ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>Live Civic Map</span>
            </button>

            {/* If Officer Logged In: Terminal Access */}

          </nav>

          {/* Right Action: Clean Proportioned Buttons */}
          <div className="flex items-center space-x-3 shrink-0">
            
            {/* Primary Action Button */}
            <button
              onClick={onOpenReport}
              className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs sm:text-sm font-bold shadow-xs hover:shadow-sm hover:scale-102 transition-all duration-150 active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>Report Issue</span>
            </button>

            {/* Authority Authentication Portal Button */}
            {isOfficerOrAdmin ? (
              <div className="flex items-center space-x-2.5 pl-2.5 border-l border-slate-200">
                <button
                  onClick={() => setActiveTab('authority')}
                  className="hidden lg:flex items-center space-x-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-bold transition shadow-xs cursor-pointer whitespace-nowrap"
                >
                  <LayoutDashboard className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{currentUser?.role === 'admin' ? 'Admin Terminal' : `${(currentUser?.department || 'Dept').split('&')[0].trim()} Terminal`}</span>
                </button>

                <button
                  onClick={onLogout}
                  title="Sign out of municipal terminal"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActiveTab('login')}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold border transition-all duration-150 hover:scale-102 active:scale-95 cursor-pointer whitespace-nowrap ${
                  activeTab === 'login'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs font-bold'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-2xs hover:border-slate-300'
                }`}
              >
                <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="hidden sm:inline">Authority Portal</span>
                <span className="sm:hidden">Login</span>
              </button>
            )}

          </div>

        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden border-t border-slate-100 py-1.5 space-x-1 justify-around text-xs">
          <button
            onClick={() => setActiveTab('feed')}
            className={`px-3 py-1 rounded-full font-semibold transition ${activeTab === 'feed' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600'}`}
          >
            Home
          </button>
          <button
            onClick={() => setActiveTab('community')}
            className={`px-3 py-1 rounded-full font-semibold transition ${activeTab === 'community' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600'}`}
          >
            Community
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`px-3 py-1 rounded-full font-semibold transition ${activeTab === 'about' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600'}`}
          >
            About Us
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`px-3 py-1 rounded-full font-semibold transition ${activeTab === 'map' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600'}`}
          >
            Map
          </button>
          {isOfficerOrAdmin && (
            <button
              onClick={() => setActiveTab('authority')}
              className={`px-3 py-1 rounded-full font-semibold transition ${activeTab === 'authority' ? 'bg-emerald-600 text-white font-bold' : 'text-emerald-700'}`}
            >
              Terminal
            </button>
          )}
        </div>

      </div>
    </header>
  );
}
