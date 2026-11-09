import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import IssueCard from './components/IssueCard';
import IssueDetailModal from './components/IssueDetailModal';
import ReportIssueModal from './components/ReportIssueModal';
import CitizenVerificationModal from './components/CitizenVerificationModal';
import ResolveIssueModal from './components/ResolveIssueModal';
import LoginPage from './components/LoginPage';
import CivicMap from './components/CivicMap';
import CommunityFeed from './components/CommunityFeed';
import AboutUs from './components/AboutUs';
import AuthorityDashboard from './components/AuthorityDashboard';
import Footer from './components/Footer';
import WhyChooseUs from './components/WhyChooseUs';
import CommunityStats from './components/CommunityStats';
import MobileRestrictionModal from './components/MobileRestrictionModal';

import { getIssues, upvoteIssue } from './services/api';
import socket from './services/socket';
import { 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  Layers,
  ArrowUpDown,
  Lock,
  ShieldCheck,
  Building2,
  MapPin,
  Mic,
  Camera,
  ArrowRight,
  ChevronDown,
  Volume2,
  Users
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Roads & Potholes',
  'Solid Waste & Garbage',
  'Water Supply & Drainage',
  'Streetlights & Electricity',
  'Public Infrastructure'
];

export default function App() {
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' (Home) | 'map' | 'community' | 'about' | 'authority' | 'login'
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('fixmyarea_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    localStorage.setItem('fixmyarea_user', JSON.stringify(user));
    setActiveTab('authority');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('fixmyarea_user');
    setActiveTab('feed');
  };

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('priority'); // 'priority' | 'recent' | 'upvotes'

  // Modals
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportInitialCoords, setReportInitialCoords] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [verifyingIssue, setVerifyingIssue] = useState(null);
  const [resolvingIssue, setResolvingIssue] = useState(null);

  // Initial Load
  useEffect(() => {
    fetchIssuesList();
  }, [selectedCategory, selectedStatus, sortBy]);

  // Real-Time Socket Events
  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('issue:created', (newIssue) => {
      setIssues((prev) => [newIssue, ...prev.filter(i => i._id !== newIssue._id)]);
    });

    socket.on('issue:upvoted', ({ issueId, upvoteCount, priorityScore }) => {
      setIssues((prev) =>
        prev.map((i) =>
          i._id === issueId ? { ...i, upvoteCount, priorityScore } : i
        )
      );
      if (selectedIssue && selectedIssue._id === issueId) {
        setSelectedIssue((prev) => ({ ...prev, upvoteCount, priorityScore }));
      }
    });

    socket.on('issue:status_updated', (updated) => {
      setIssues((prev) => prev.map((i) => (i._id === updated._id ? updated : i)));
      if (selectedIssue && selectedIssue._id === updated._id) setSelectedIssue(updated);
    });

    socket.on('issue:resolved', (resolved) => {
      setIssues((prev) => prev.map((i) => (i._id === resolved._id ? resolved : i)));
      if (selectedIssue && selectedIssue._id === resolved._id) setSelectedIssue(resolved);
    });

    socket.on('issue:verified', (verified) => {
      setIssues((prev) => prev.map((i) => (i._id === verified._id ? verified : i)));
      if (selectedIssue && selectedIssue._id === verified._id) setSelectedIssue(verified);
    });

    socket.on('issue:updated', (updated) => {
      setIssues((prev) => prev.map((i) => (i._id === updated._id ? updated : i)));
      if (selectedIssue && selectedIssue._id === updated._id) setSelectedIssue(updated);
    });

    socket.on('issue:merged', ({ issue }) => {
      if (issue) {
        setIssues((prev) => prev.map((i) => (i._id === issue._id ? issue : i)));
        if (selectedIssue && selectedIssue._id === issue._id) setSelectedIssue(issue);
      }
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('issue:created');
      socket.off('issue:upvoted');
      socket.off('issue:status_updated');
      socket.off('issue:resolved');
      socket.off('issue:verified');
      socket.off('issue:updated');
      socket.off('issue:merged');
    };
  }, [selectedIssue]);

  const fetchIssuesList = async () => {
    try {
      setLoading(true);
      const params = {
        category: selectedCategory,
        status: selectedStatus,
        sortBy,
        search: searchQuery
      };
      const res = await getIssues(params);
      if (res.success) {
        setIssues(res.issues);
      }
    } catch (e) {
      console.error('Failed to load issues:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (issueId) => {
    try {
      const res = await upvoteIssue(issueId, `cit-${Date.now()}`);
      if (res.success) {
        setIssues((prev) =>
          prev.map((i) =>
            i._id === issueId
              ? { ...i, upvoteCount: res.upvoteCount, priorityScore: res.priorityScore }
              : i
          )
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Could not upvote');
    }
  };

  const scrollToWhyUs = () => {
    const el = document.getElementById('why-choose-us');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Filtered issues for search query
  const displayedIssues = issues.filter((i) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      i.title.toLowerCase().includes(q) ||
      i.address.toLowerCase().includes(q) ||
      i.category.toLowerCase().includes(q) ||
      (i.department && i.department.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-[#FBFBFD] flex flex-col font-['Plus_Jakarta_Sans',sans-serif] text-slate-800">
      
      {/* Top Header Navigation: Only on citizen pages, not on full-screen authority dashboard */}
      {activeTab !== 'authority' && activeTab !== 'login' && (
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenReport={() => setIsReportModalOpen(true)}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        
        {/* DEDICATED LOGIN PAGE (NON-SCROLLABLE FULL SCREEN) */}
        {activeTab === 'login' && (
          <LoginPage
            onLoginSuccess={handleLoginSuccess}
            onCancel={() => setActiveTab('feed')}
          />
        )}

        {/* 1. HOME TAB: FULL SCREEN HERO + SCROLL DOWN FOR GRIEVANCE FEED */}
        {activeTab === 'feed' && (
          <div className="relative overflow-hidden">
            
            {/* AESTHETIC BACKGROUND UI EFFECTS */}
            {/* 1. Top Ambient Spotlight Beam */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-gradient-to-b from-emerald-500/12 via-teal-400/6 to-transparent blur-3xl pointer-events-none -z-10"></div>

            {/* 2. Architectural Civic Grid with Vignette Mask */}
            <div className="absolute inset-0 bg-civic-grid mask-radial-faded pointer-events-none -z-10 opacity-70"></div>

            {/* 3. Fluid Animated Aurora Blobs */}
            <div className="absolute -top-16 left-1/4 -translate-x-1/2 w-[580px] h-[580px] rounded-full bg-gradient-to-tr from-emerald-400/20 via-teal-300/15 to-transparent blur-[130px] pointer-events-none -z-10 animate-blob-1"></div>
            <div className="absolute top-12 right-6 w-[540px] h-[540px] rounded-full bg-gradient-to-bl from-teal-400/25 via-emerald-300/20 to-transparent blur-[140px] pointer-events-none -z-10 animate-blob-2"></div>
            <div className="absolute -bottom-12 left-10 w-[440px] h-[440px] rounded-full bg-gradient-to-tr from-sky-400/15 to-emerald-300/15 blur-[120px] pointer-events-none -z-10 animate-blob-3"></div>

            {/* FULL-VIEWPORT HERO SECTION (Screen 1 Entirely) */}
            <section className="min-h-[calc(100vh-72px)] flex flex-col justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 relative">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center flex-1 my-auto">
                
                {/* Left Column (Headline + Subtitle + Action Buttons) */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* Main Headline */}
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-black text-slate-900 tracking-tight leading-[1.12]">
                    Report any civic issue.{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700">
                      AI routes it to your local authority.
                    </span>
                  </h1>

                  {/* Subtitle */}
                  <p className="text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed font-normal max-w-xl">
                    From asphalt road craters and overflowing garbage to water leaks and dark streetlights. Simply take a photo and describe the problem in your voice — FixMyArea automatically pinpoints your coordinates, routes the complaint to the responsible municipal department in your area, and verifies ground resolution.
                  </p>

                  {/* CTA Buttons (Report a Civic Problem, Community, About Us) */}
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => setIsReportModalOpen(true)}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Report a Civic Problem</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('community')}
                      className="px-5 py-3 bg-white/90 hover:bg-white text-slate-800 font-semibold rounded-2xl text-xs sm:text-sm border border-slate-200/90 shadow-2xs hover:border-slate-300 hover:shadow-xs hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center space-x-2 backdrop-blur-md"
                    >
                      <Users className="w-4 h-4 text-emerald-600" />
                      <span>Community</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('about')}
                      className="group inline-flex items-center space-x-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-emerald-700 transition-colors py-2 px-1 cursor-pointer"
                    >
                      <span className="group-hover:underline underline-offset-4">About Us</span>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                    </button>
                  </div>

                </div>

                {/* Right Column: Hero Artwork with Concentric Radar Wave Backdrop */}
                <div className="lg:col-span-5 flex items-center justify-center relative">
                  
                  {/* Concentric Geometric Radar Waves */}
                  <div className="absolute w-[430px] h-[430px] rounded-full border border-emerald-500/20 animate-radar-ripple pointer-events-none -z-10"></div>
                  <div className="absolute w-[540px] h-[540px] rounded-full border border-teal-500/10 pointer-events-none -z-10"></div>
                  <div className="absolute w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none -z-10"></div>

                  {/* The Artwork */}
                  <img
                    src="/hero-illustration.png"
                    alt="FixMyArea Citizen Civic Issue Reporting"
                    className="w-full max-w-[340px] sm:max-w-[390px] lg:max-w-[440px] max-h-[480px] lg:max-h-[520px] h-auto object-contain drop-shadow-2xl select-none transition-transform duration-300 hover:scale-[1.02]"
                  />

                </div>

              </div>

              {/* Bottom Scroll Prompt */}
              <div className="py-4 text-center cursor-pointer transition hover:opacity-80" onClick={scrollToWhyUs}>
                <span className="text-xs font-semibold text-slate-400 flex items-center justify-center space-x-1">
                  <span>Scroll to explore platform impact</span>
                  <ChevronDown className="w-4 h-4 animate-bounce text-emerald-600" />
                </span>
              </div>

            </section>

            {/* WHY CHOOSE FIXMYAREA SHOWCASE (Custom layout based on design reference) */}
            <div id="why-choose-us">
              <WhyChooseUs 
                onOpenReport={() => setIsReportModalOpen(true)}
                setActiveTab={setActiveTab}
              />
            </div>

            {/* COMMUNITY STATISTICS SHOWCASE */}
            <section id="stats-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
              <CommunityStats issues={issues} setActiveTab={setActiveTab} />
            </section>

          </div>
        )}

        {/* 2. LIVE CIVIC MAP TAB */}
        {activeTab === 'map' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <CivicMap
              issues={issues}
              onSelectIssue={(i) => setSelectedIssue(i)}
              onUpvote={handleUpvote}
              onOpenReport={(coords) => {
                if (coords) setReportInitialCoords(coords);
                setIsReportModalOpen(true);
              }}
            />
          </div>
        )}

        {/* 3. COMMUNITY FEED TAB (Like Instagram for Civic Impact Validation) */}
        {activeTab === 'community' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <CommunityFeed
              issues={issues}
              onSelectIssue={(i) => setSelectedIssue(i)}
              onUpvote={handleUpvote}
              onOpenReport={() => setIsReportModalOpen(true)}
            />
          </div>
        )}

        {/* 4. ABOUT US TAB */}
        {activeTab === 'about' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <AboutUs onGetStarted={() => setIsReportModalOpen(true)} />
          </div>
        )}

        {/* 5. AUTHORITY TERMINAL TAB (FULL SCREEN BESPOKE PORTAL) */}
        {activeTab === 'authority' && (
          <div className="w-full min-h-screen">
            {!currentUser ? (
              <div className="max-w-lg mx-auto px-4 py-16">
                <div className="bg-white rounded-3xl p-10 sm:p-12 border border-slate-200/80 shadow-xl text-center space-y-5">
                  <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center mx-auto shadow-md">
                    <Building2 className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 rounded-full border border-slate-200">
                      Municipal Operations Restricted
                    </span>
                    <h2 className="text-2xl font-extrabold text-slate-900 mt-3">Authority Sign In Required</h2>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                    The Authority Portal is reserved for municipal engineers and department officers to dispatch repair crews, manage turnaround SLAs, and submit photographic proof of completion.
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => setActiveTab('login')}
                      className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition active:scale-95 shadow-md"
                    >
                      Go to Authority Login
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <AuthorityDashboard
                issues={issues}
                onSelectIssue={(i) => setSelectedIssue(i)}
                onResolveClick={(i) => setResolvingIssue(i)}
                onRefresh={fetchIssuesList}
                currentUser={currentUser}
                onExitToPublic={() => setActiveTab('feed')}
                onLogout={handleLogout}
              />
            )}
          </div>
        )}

        {/* Global Public Footer (shown on public tabs: Home, Community, Map, About) */}
        {activeTab !== 'authority' && (
          <Footer 
            setActiveTab={setActiveTab} 
            onOpenReport={() => setIsReportModalOpen(true)} 
          />
        )}

      </main>

      {/* MODALS */}
      <ReportIssueModal
        isOpen={isReportModalOpen}
        onClose={() => {
          setIsReportModalOpen(false);
          setReportInitialCoords(null);
        }}
        initialCoords={reportInitialCoords}
        onSuccess={() => fetchIssuesList()}
      />

      <IssueDetailModal
        issue={selectedIssue}
        isOpen={!!selectedIssue}
        onClose={() => setSelectedIssue(null)}
        onUpvote={handleUpvote}
        onVerifyClick={(i) => {
          setSelectedIssue(null);
          setVerifyingIssue(i);
        }}
      />

      <CitizenVerificationModal
        issue={verifyingIssue}
        isOpen={!!verifyingIssue}
        onClose={() => setVerifyingIssue(null)}
        onSuccess={() => fetchIssuesList()}
      />

      <ResolveIssueModal
        issue={resolvingIssue}
        isOpen={!!resolvingIssue}
        onClose={() => setResolvingIssue(null)}
        onSuccess={() => fetchIssuesList()}
        currentUser={currentUser}
      />

      {/* Apple-Style Mobile Experience Restriction Screen */}
      <MobileRestrictionModal />

    </div>
  );
}
