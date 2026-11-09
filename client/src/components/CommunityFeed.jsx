import React, { useState } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MapPin, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  Building2, 
  ArrowRight,
  Flame,
  Award,
  TrendingUp,
  Plus,
  Play,
  Pause,
  Check,
  Send,
  SlidersHorizontal,
  ThumbsUp,
  User,
  Users,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { addCommentToIssue } from '../services/api';

// Helper to format comment timestamps professionally
function formatCommentTime(ts) {
  if (!ts) return 'Just now';
  const diffMs = Date.now() - new Date(ts).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function CommunityFeed({ issues, onSelectIssue, onUpvote, onOpenReport }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortMode, setSortMode] = useState('trending'); // 'trending' | 'recent' | 'needs_votes' | 'resolved'
  const [likedMap, setLikedMap] = useState({});
  const [playingAudioId, setPlayingAudioId] = useState(null);
  
  // Share notification state
  const [copiedId, setCopiedId] = useState(null);

  // Active expanded comments per issue
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [commentInputMap, setCommentInputMap] = useState({});
  const [localCommentsMap, setLocalCommentsMap] = useState({});
  const [isPostingComment, setIsPostingComment] = useState(false);

  // Instagram Story / Highlights Data
  const HIGHLIGHTS = [
    { id: 'all', label: 'All Updates', icon: Sparkles, count: issues.length, ring: 'from-amber-400 via-rose-500 to-purple-600' },
    { id: 'Roads & Potholes', label: 'Road Fixes', icon: Flame, count: issues.filter(i => i.category === 'Roads & Potholes').length, ring: 'from-orange-400 via-amber-500 to-red-500' },
    { id: 'Solid Waste & Garbage', label: 'Cleanups', icon: TrendingUp, count: issues.filter(i => i.category === 'Solid Waste & Garbage').length, ring: 'from-emerald-400 via-teal-500 to-cyan-500' },
    { id: 'Water Supply & Drainage', label: 'Water Works', icon: Building2, count: issues.filter(i => i.category === 'Water Supply & Drainage').length, ring: 'from-blue-400 via-indigo-500 to-sky-500' },
    { id: 'Streetlights & Electricity', label: 'Streetlights', icon: Award, count: issues.filter(i => i.category === 'Streetlights & Electricity').length, ring: 'from-yellow-400 via-orange-400 to-pink-500' },
  ];

  // Filtering & Sorting
  let feedIssues = issues.filter(i => {
    if (selectedCategory === 'All') return true;
    return i.category === selectedCategory;
  });

  if (sortMode === 'trending') {
    feedIssues.sort((a, b) => ((b.upvoteCount || 0) * 2 + (b.priorityScore || 0)) - ((a.upvoteCount || 0) * 2 + (a.priorityScore || 0)));
  } else if (sortMode === 'recent') {
    feedIssues.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  } else if (sortMode === 'needs_votes') {
    feedIssues = feedIssues.filter(i => i.status === 'Reported' || i.status === 'In Progress');
    feedIssues.sort((a, b) => (a.upvoteCount || 0) - (b.upvoteCount || 0));
  } else if (sortMode === 'resolved') {
    feedIssues = feedIssues.filter(i => i.status === 'Resolved' || i.status === 'Citizen Confirmed');
  }

  const handleLike = (id, e) => {
    e.stopPropagation();
    setLikedMap(prev => ({ ...prev, [id]: !prev[id] }));
    onUpvote(id);
  };

  // Working Share Function (Native Share API + Clipboard Fallback)
  const handleShare = async (issue, e) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/#issue-${issue._id}`;
    const shareData = {
      title: `FixMyArea - ${issue.title}`,
      text: `Civic issue reported: ${issue.title} at ${issue.address}. Validate to prioritize repair!`,
      url: shareUrl
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        // User dismissed share sheet or fallback
      }
    }

    // Clipboard fallback
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedId(issue._id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch (err) {
      alert(`Share link: ${shareUrl}`);
    }
  };

  // Toggle Comment Section for a post
  const toggleComments = (id, e) => {
    e.stopPropagation();
    setActiveCommentPostId(prev => prev === id ? null : id);
  };

  // Submit a working comment
  const handlePostComment = async (issueId) => {
    const text = commentInputMap[issueId];
    if (!text || !text.trim()) return;

    try {
      setIsPostingComment(true);
      const newComment = {
        _id: `temp-${Date.now()}`,
        author: 'Citizen',
        comment: text.trim(),
        timestamp: new Date().toISOString()
      };

      // Optimistic UI update
      setLocalCommentsMap(prev => ({
        ...prev,
        [issueId]: [...(prev[issueId] || []), newComment]
      }));
      setCommentInputMap(prev => ({ ...prev, [issueId]: '' }));

      // API call
      await addCommentToIssue(issueId, 'Citizen', text.trim());
    } catch (err) {
      console.warn('Comment post error:', err);
    } finally {
      setIsPostingComment(false);
    }
  };

  const toggleAudio = (id, e) => {
    e.stopPropagation();
    setPlayingAudioId(prev => prev === id ? null : id);
  };

  // Mock Active Citizens Leaderboard
  const LEADERBOARD = [
    { name: 'Vikram Joshi', ward: 'Ward 2', points: '14 reports filed', avatar: 'VJ', color: 'from-emerald-500 to-teal-500' },
    { name: 'Sneha Patil', ward: 'Ward 4', points: '9 resolutions verified', avatar: 'SP', color: 'from-blue-500 to-indigo-500' },
    { name: 'Rahul Deshmukh', ward: 'Ward 1', points: '7 reports filed', avatar: 'RD', color: 'from-purple-500 to-pink-500' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-2">
      
      {/* MAIN 2-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: INSTAGRAM-STYLE STORIES + FILTER + SCROLLING FEED (col-span-8) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* 1. INSTAGRAM STORY / HIGHLIGHTS BAR (Clean & Compact - No Left Clipping, No Emojis) */}
          <div className="flex items-center space-x-4 sm:space-x-5 overflow-x-auto px-3 py-2 scrollbar-none">
            {HIGHLIGHTS.map((story) => {
              const Icon = story.icon;
              const isSelected = (story.id === 'all' && selectedCategory === 'All') || selectedCategory === story.id;
              
              return (
                <button
                  key={story.id}
                  onClick={() => setSelectedCategory(story.id === 'all' ? 'All' : story.id)}
                  className="flex flex-col items-center space-y-1.5 shrink-0 group focus:outline-none"
                >
                  {/* Instagram Story Gradient Ring */}
                  <div className={`p-[2.5px] rounded-full bg-gradient-to-tr ${story.ring} transition-all duration-200 group-hover:scale-105 ${
                    isSelected ? 'scale-105 ring-2 ring-emerald-500 ring-offset-2' : ''
                  }`}>
                    <div className="p-0.5 bg-white rounded-full">
                      <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col items-center justify-center p-1 shadow-2xs group-hover:from-emerald-50 group-hover:to-teal-50 transition">
                        <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-slate-700 group-hover:text-emerald-700 transition" />
                        <span className="text-[10px] font-mono font-bold text-slate-800 mt-0.5">{story.count}</span>
                      </div>
                    </div>
                  </div>

                  <span className={`text-[11px] font-semibold whitespace-nowrap transition ${
                    isSelected ? 'text-slate-900 font-bold' : 'text-slate-500 group-hover:text-slate-800'
                  }`}>
                    {story.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 2. FILTER SECTION BAR (Order: Trending -> Recent -> Needs Votes -> Verified Fixed) */}
          <div className="flex items-center justify-between flex-wrap gap-3 bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center space-x-1.5 overflow-x-auto">
              <div className="flex items-center space-x-1 text-slate-400 pl-1 pr-2 border-r border-slate-200 shrink-0">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold text-slate-500">Filter:</span>
              </div>

              {/* 1. Trending */}
              <button
                onClick={() => setSortMode('trending')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                  sortMode === 'trending'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Trending</span>
              </button>

              {/* 2. Recent (Directly after Trending) */}
              <button
                onClick={() => setSortMode('recent')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                  sortMode === 'recent'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Recent</span>
              </button>

              {/* 3. Needs Votes */}
              <button
                onClick={() => setSortMode('needs_votes')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                  sortMode === 'needs_votes'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                <span>Needs Votes</span>
              </button>

              {/* 4. Verified Fixed */}
              <button
                onClick={() => setSortMode('resolved')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                  sortMode === 'resolved'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified Fixed</span>
              </button>
            </div>

            <span className="text-xs font-medium text-slate-400 pr-2">
              {feedIssues.length} issues in feed
            </span>
          </div>

          {/* 3. SCROLLING COMMUNITY POSTS FEED */}
          {feedIssues.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3 shadow-2xs">
              <div className="w-11 h-11 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">No issues found in this category</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Everything in this filter is currently addressed or verified.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {feedIssues.map((issue) => {
                const isLiked = likedMap[issue._id];
                const isResolved = issue.status === 'Resolved' || issue.status === 'Citizen Confirmed';
                const isAudioPlaying = playingAudioId === issue._id;
                const isCommentsOpen = activeCommentPostId === issue._id;
                
                // Existing comments from issue timeline + local comments
                const timelineComments = (issue.timeline || []).filter(t => t.comment && t.comment.trim());
                const localComments = localCommentsMap[issue._id] || [];
                const allComments = [...timelineComments, ...localComments];

                return (
                  <article 
                    key={issue._id} 
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all duration-200 hover:shadow-md"
                  >
                    
                    {/* Post Citizen Header */}
                    <div className="px-4 py-3 sm:px-4.5 sm:py-3.5 flex items-center justify-between border-b border-slate-100">
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-500 to-sky-400 text-white flex items-center justify-center font-bold text-xs shadow-2xs shrink-0">
                          {issue.reportedBy?.name ? issue.reportedBy.name.charAt(0) : 'C'}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                              {issue.reportedBy?.name || 'Local Citizen'}
                              {issue.reportersCount > 1 && (
                                <span className="text-emerald-700 font-extrabold ml-1">
                                  +{issue.reportersCount - 1} other citizens
                                </span>
                              )}
                            </h4>
                            {issue.reportersCount > 1 ? (
                              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-[10px] font-bold text-amber-900 shrink-0 inline-flex items-center space-x-1 border border-amber-200">
                                <Users className="w-3 h-3 text-amber-700" />
                                <span>{issue.reportersCount} Citizens Reported</span>
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-semibold text-slate-500 shrink-0">
                                Verified Resident
                              </span>
                            )}
                          </div>

                          <div className="flex items-center space-x-1 text-[11px] text-slate-500 mt-0.5 truncate">
                            <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                            <span className="truncate">{issue.address}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="shrink-0 pl-2">
                        {isResolved ? (
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Resolved</span>
                          </span>
                        ) : issue.status === 'In Progress' ? (
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                            <span>Crew On Site</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            <span>Under Review</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Edge-to-Edge Photo (Proper full fit framing) */}
                    <div 
                      className="relative aspect-[16/10] w-full bg-slate-950 overflow-hidden cursor-pointer group"
                      onClick={() => onSelectIssue(issue)}
                    >
                      <img
                        src={issue.imageUrl}
                        alt={issue.title}
                        className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80';
                        }}
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/25"></div>

                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                        <span className="px-3 py-1 rounded-xl bg-black/60 backdrop-blur-md text-white text-xs font-bold border border-white/20">
                          {issue.category}
                        </span>

                        <span className="px-3 py-1 rounded-xl bg-emerald-500/90 backdrop-blur-md text-white text-xs font-mono font-bold shadow-md">
                          Priority {issue.priorityScore}/100
                        </span>
                      </div>

                      <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
                        <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md font-medium text-slate-200 text-xs">
                          Assigned: {issue.department}
                        </span>
                        <span className="text-[11px] font-bold bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-white">
                          Tap to Inspect
                        </span>
                      </div>
                    </div>

                    {/* Post Content & Interaction Row */}
                    <div className="p-3.5 sm:p-4 space-y-3">
                      
                      {/* Social Action Interaction Row */}
                      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                        <div className="flex items-center space-x-2">
                          {/* Heart / Validate Button */}
                          <button
                            onClick={(e) => handleLike(issue._id, e)}
                            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-150 active:scale-95 ${
                              isLiked 
                                ? 'bg-rose-50 text-rose-600 border border-rose-200' 
                                : 'bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600'
                            }`}
                          >
                            <Heart className={`w-3.5 h-3.5 transition ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                            <span>Confirm Issue ({(issue.upvoteCount || 0) + (isLiked ? 1 : 0)})</span>
                          </button>

                          {/* Working Comment Toggle Button */}
                          <button
                            onClick={(e) => toggleComments(issue._id, e)}
                            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition ${
                              isCommentsOpen 
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                                : 'text-slate-600 hover:bg-slate-100'
                            }`}
                            title="Comments"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>{allComments.length > 0 ? allComments.length : 'Comment'}</span>
                          </button>

                          {/* Working Share Button with Instant Feedback */}
                          <button
                            onClick={(e) => handleShare(issue, e)}
                            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                              copiedId === issue._id 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold' 
                                : 'text-slate-600 hover:bg-slate-100'
                            }`}
                            title="Share issue link"
                          >
                            {copiedId === issue._id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Link Copied!</span>
                              </>
                            ) : (
                              <>
                                <Share2 className="w-3.5 h-3.5" />
                                <span>Share</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Full History Modal Link */}
                        <button
                          onClick={() => onSelectIssue(issue)}
                          className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1 group"
                        >
                          <span>Full History</span>
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
                        </button>
                      </div>

                      {/* Post Headline & Description */}
                      <div className="space-y-1">
                        <h3 
                          onClick={() => onSelectIssue(issue)}
                          className="font-extrabold text-slate-900 text-sm sm:text-base hover:text-emerald-700 cursor-pointer transition leading-snug"
                        >
                          {issue.title}
                        </h3>

                        {issue.description && (
                          <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 font-normal">
                            {issue.description}
                          </p>
                        )}
                      </div>

                      {/* Voice Note Waveform Bar */}
                      {issue.originalVoiceText && (
                        <div className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-50/70 to-teal-50/50 border border-emerald-100/90 flex items-center justify-between gap-3">
                          <div className="flex items-center space-x-2 min-w-0">
                            <button
                              onClick={(e) => toggleAudio(issue._id, e)}
                              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-2xs transition active:scale-95 ${
                                isAudioPlaying ? 'bg-slate-900 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              }`}
                            >
                              {isAudioPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                            </button>

                            <div className="min-w-0">
                              <div className="text-[10px] font-bold text-slate-900 flex items-center space-x-1.5">
                                <span>Spoken Voice Note ({issue.detectedLanguage || 'Local Voice'})</span>
                                <span className="text-[9px] text-emerald-700 font-semibold px-1 py-0.2 bg-emerald-200/50 rounded">
                                  Auto-Translated
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-700 italic truncate mt-0.5">
                                "{issue.originalVoiceText}"
                              </p>
                            </div>
                          </div>

                          <div className="hidden sm:flex items-center space-x-1 shrink-0">
                            {[14, 20, 10, 24, 16, 8, 22, 12, 18].map((h, i) => (
                              <span 
                                key={i} 
                                style={{ height: isAudioPlaying ? `${(i % 3 + 1) * 6 + 4}px` : `${h / 2}px` }} 
                                className={`w-0.5 rounded-full transition-all duration-200 ${
                                  isAudioPlaying ? 'bg-emerald-600 animate-pulse' : 'bg-emerald-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 4. EXPANDABLE PROFESSIONAL COMMENT DRAWER */}
                      {isCommentsOpen && (
                        <div className="pt-4 mt-2 border-t border-slate-100 space-y-3.5 animate-fade-in bg-slate-50/70 -mx-3.5 -mb-3.5 sm:-mx-4 sm:-mb-4 p-4 rounded-b-2xl border-x-0 border-b-0">
                          
                          {/* Thread Header */}
                          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                            <div className="flex items-center space-x-2">
                              <MessageCircle className="w-4 h-4 text-emerald-600" />
                              <span className="text-xs font-bold text-slate-800">
                                Discussion & Ground Updates
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-slate-200/80 text-[10px] font-bold text-slate-700">
                                {allComments.length}
                              </span>
                            </div>
                            <span className="text-[11px] font-medium text-slate-400">
                              Public civic record
                            </span>
                          </div>

                          {/* Existing Comments Thread */}
                          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                            {allComments.length === 0 ? (
                              <div className="py-6 px-4 text-center rounded-xl bg-white border border-slate-200/60 space-y-1">
                                <MessageCircle className="w-5 h-5 text-slate-300 mx-auto" />
                                <p className="text-xs font-semibold text-slate-700">No updates or comments yet</p>
                                <p className="text-[11px] text-slate-400">
                                  Have a ground update or question about this location? Post below.
                                </p>
                              </div>
                            ) : (
                              allComments.map((c, idx) => {
                                const authorName = c.updatedBy || c.author || 'Local Citizen';
                                const isOfficial = /engineer|municipal|officer|authority|department|dept|ward/i.test(authorName);
                                const avatarInitial = authorName.charAt(0).toUpperCase();

                                return (
                                  <div 
                                    key={idx} 
                                    className={`p-3 rounded-xl border text-xs space-y-1.5 transition ${
                                      isOfficial 
                                        ? 'bg-blue-50/80 border-blue-200/80' 
                                        : 'bg-white border-slate-200/80 shadow-2xs'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-2 min-w-0">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 text-white shadow-2xs ${
                                          isOfficial 
                                            ? 'bg-gradient-to-tr from-blue-600 to-indigo-600' 
                                            : 'bg-gradient-to-tr from-slate-600 to-slate-800'
                                        }`}>
                                          {avatarInitial}
                                        </div>
                                        
                                        <span className="font-bold text-slate-900 truncate">
                                          {authorName}
                                        </span>

                                        {isOfficial ? (
                                          <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 text-[9px] font-extrabold inline-flex items-center space-x-0.5 shrink-0">
                                            <ShieldCheck className="w-2.5 h-2.5" />
                                            <span>Official</span>
                                          </span>
                                        ) : (
                                          <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 text-[9px] font-semibold shrink-0">
                                            Resident
                                          </span>
                                        )}
                                      </div>

                                      <span className="text-slate-400 text-[10px] font-mono shrink-0">
                                        {formatCommentTime(c.timestamp)}
                                      </span>
                                    </div>

                                    <p className="text-slate-700 leading-relaxed font-normal pl-8">
                                      {c.comment}
                                    </p>
                                  </div>
                                );
                              })
                            )}
                          </div>

                          {/* Post a Comment Input Dock */}
                          <div className="pt-1">
                            <div className="flex items-center space-x-2 bg-white p-1.5 pl-3 rounded-xl border border-slate-200/90 shadow-2xs focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition">
                              <input
                                type="text"
                                value={commentInputMap[issue._id] || ''}
                                onChange={(e) => setCommentInputMap(prev => ({ ...prev, [issue._id]: e.target.value }))}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handlePostComment(issue._id);
                                  }
                                }}
                                placeholder="Add a verified update or comment..."
                                className="flex-1 text-xs text-slate-800 bg-transparent placeholder-slate-400 focus:outline-none"
                              />

                              <button
                                type="button"
                                onClick={() => handlePostComment(issue._id)}
                                disabled={isPostingComment || !(commentInputMap[issue._id] || '').trim()}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
                                  !(commentInputMap[issue._id] || '').trim() 
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs active:scale-95'
                                }`}
                              >
                                {isPostingComment ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <>
                                    <span>Post</span>
                                    <Send className="w-3 h-3 ml-0.5" />
                                  </>
                                )}
                              </button>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1 pl-1">
                              Press Enter to post · Updates are publicly visible to citizens and assigned municipal departments
                            </p>
                          </div>

                        </div>
                      )}

                    </div>

                  </article>
                );
              })}
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: STATIC / STICKY COMMUNITY SIDEBAR (lg:sticky lg:top-20 - NO SCROLL) */}
        <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-20 lg:self-start">
          
          {/* 1. MAKE AN IMPACT (Quick Report Box) */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white space-y-3 shadow-lg shadow-emerald-600/20">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-emerald-300" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">Make an Impact</span>
            </div>
            <h4 className="text-lg font-extrabold leading-snug">
              Notice a problem in your street?
            </h4>
            <p className="text-xs text-emerald-100/90 leading-relaxed">
              Take a quick photo and speak. AI will route your complaint to the responsible department in seconds.
            </p>
            <button
              onClick={onOpenReport}
              className="w-full py-2.5 bg-white hover:bg-emerald-50 text-slate-900 rounded-xl text-xs font-bold transition active:scale-95 shadow-sm flex items-center justify-center space-x-1.5"
            >
              <Plus className="w-4 h-4 text-emerald-600" />
              <span>Report an Issue Now</span>
            </button>
          </div>

          {/* 2. TOP ACTIVE CITIZENS LEADERBOARD (Directly after Make an Impact) */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Top Active Citizens
              </h4>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                This Month
              </span>
            </div>

            <div className="space-y-3">
              {LEADERBOARD.map((citizen, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className={`w-9 h-9 rounded-full bg-gradient-to-tr ${citizen.color} text-white flex items-center justify-center font-bold text-xs shadow-2xs`}>
                        {citizen.avatar}
                      </div>
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-slate-900 text-white text-[9px] font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                    </div>

                    <div>
                      <div className="text-xs font-bold text-slate-900">{citizen.name}</div>
                      <div className="text-[11px] text-slate-400">{citizen.ward}</div>
                    </div>
                  </div>

                  <span className="text-[11px] font-bold text-slate-700">
                    {citizen.points}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </aside>

      </div>

    </div>
  );
}