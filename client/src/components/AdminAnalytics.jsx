import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Layers, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  AlertCircle, 
  Building2, 
  ShieldCheck,
  Award,
  Flame
} from 'lucide-react';
import { getAnalyticsStats } from '../services/api';

export default function AdminAnalytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await getAnalyticsStats();
      if (res.success) {
        setStats(res.stats);
      }
    } catch (e) {
      console.error('Error fetching analytics:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
        <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm font-semibold text-slate-600">Aggregating Municipal Civic Analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-sky-950 p-6 rounded-2xl text-white shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-sky-500/20 text-sky-300 rounded-md border border-sky-400/30">
            Municipal Oversight
          </span>
          <h2 className="text-xl font-bold mt-2">Executive Civic Governance & Redundancy Reduction</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Real-time intelligence measuring physical issue resolution, duplicate complaint clustering, and citizen ground verification.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10 text-center">
          <span className="text-[11px] uppercase tracking-wider text-sky-200 font-bold block">
            Redundancy Reduced
          </span>
          <span className="text-2xl font-bold font-mono text-emerald-300">
            {stats.redundancyReductionRate}%
          </span>
          <span className="text-[10px] text-slate-300 block">
            Duplicate noise filtered
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Card 1: Total Reports */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Citizen Reports</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-900">{stats.totalReports}</span>
            <AlertCircle className="w-5 h-5 text-sky-600" />
          </div>
          <span className="text-[11px] text-slate-500 block">Total raw complaints submitted</span>
        </div>

        {/* Card 2: Distinct Master Issues */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Master Ground Issues</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-indigo-600">{stats.masterIssues}</span>
            <Layers className="w-5 h-5 text-indigo-600" />
          </div>
          <span className="text-[11px] text-indigo-700 font-semibold block">
            {stats.duplicateReportsLinked} duplicate complaints consolidated
          </span>
        </div>

        {/* Card 3: SLA Compliance */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">SLA Compliance</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-emerald-600">{stats.slaComplianceRate}%</span>
            <Clock className="w-5 h-5 text-emerald-600" />
          </div>
          <span className="text-[11px] text-slate-500 block">Resolved within target deadline</span>
        </div>

        {/* Card 4: Citizen Verification Rate */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Citizen Confirmed</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-emerald-600">{stats.citizenSatisfactionRate}%</span>
            <Award className="w-5 h-5 text-emerald-600" />
          </div>
          <span className="text-[11px] text-slate-500 block">Verified fixed by citizen closing loop</span>
        </div>

      </div>

      {/* Department Leaderboard & Category Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Department Leaderboard */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-sky-600" />
              <span>Department Resolution Leaderboard</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">Real-time</span>
          </div>

          <div className="space-y-3">
            {stats.departmentStats?.map((dept, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-900">{dept.department}</span>
                  <span className="text-emerald-700 font-mono">{dept.resolutionRate || 75}% Resolved</span>
                </div>

                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, dept.resolutionRate || 75)}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Total Tickets: {dept.total}</span>
                  <span>Avg Priority: {dept.avgPriority}/100</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Breakdown & Ward Hotspots */}
        <div className="space-y-6">
          
          {/* Categories */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              <span>Category Volume Breakdown</span>
            </h3>

            <div className="space-y-3">
              {stats.categoryStats?.map((cat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{cat._id}</span>
                    <span className="font-mono font-bold text-slate-900">{cat.count}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-sky-600 h-full rounded-full"
                      style={{ width: `${Math.min(100, (cat.count / (stats.totalReports || 1)) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ward Hotspot Tracker */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>Active Ward Hotspots</span>
            </h3>

            <div className="grid grid-cols-2 gap-2">
              {stats.wardStats?.map((ward, idx) => (
                <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <div className="font-bold text-slate-900">{ward._id}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {ward.count} open · {ward.urgentCount} high priority
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

