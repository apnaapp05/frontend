"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";
import { 
  Users, Building2, Stethoscope, IndianRupee, 
  ArrowUpRight, AlertCircle, Loader2, ShieldCheck, Activity 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Real Stats from Backend
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/admin/dashboard/stats");
        setStats(res.data);
      } catch (e) {
        console.error("Failed to load dashboard stats", e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-violet-600">
        <Loader2 className="h-12 w-12 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Loading System Metrics...</p>
      </div>
    );
  }

  // Calculate Total Pending
  const totalPending = (stats?.action_items?.pending_doctors || 0) + (stats?.action_items?.pending_hospitals || 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            System Overview <span className="text-violet-600 text-4xl">.</span>
          </h1>
          <p className="text-slate-500 mt-1">Real-time metrics across the Al-Shifa Ecosystem.</p>
        </div>
        <div className="bg-violet-50 text-violet-700 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow-sm border border-violet-100">
           <Activity className="h-4 w-4 animate-pulse" /> System Status: ONLINE
        </div>
      </div>

      {/* 1. KPI Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        
        {/* Revenue Card */}
        <Card className="border-slate-200 shadow-sm hover:shadow-xl hover:shadow-violet-900/5 transition-all group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wide">Total Revenue</CardTitle>
            <div className="h-8 w-8 rounded-full bg-violet-100 flex items-center justify-center group-hover:bg-violet-600 transition-colors">
               <IndianRupee className="h-4 w-4 text-violet-600 group-hover:text-white transition-colors" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900 mt-2">
              ₹{stats?.financials?.revenue?.toLocaleString() || "0"}
            </div>
            <p className="text-xs text-slate-500 flex items-center mt-2 font-medium">
              <span className="text-emerald-600 flex items-center bg-emerald-50 px-1.5 py-0.5 rounded mr-2">
                <ArrowUpRight className="h-3 w-3 mr-1" /> +12%
              </span>
              from last month
            </p>
          </CardContent>
        </Card>

        {/* Doctors Card */}
        <Card className="border-slate-200 shadow-sm hover:shadow-xl hover:shadow-violet-900/5 transition-all group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wide">Active Doctors</CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
               <Stethoscope className="h-4 w-4 text-blue-600 group-hover:text-white transition-colors" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900 mt-2">
               {stats?.total_users?.doctors || 0}
            </div>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              Across <span className="text-slate-900 font-bold">{stats?.total_users?.hospitals || 0}</span> Organizations
            </p>
          </CardContent>
        </Card>

        {/* Patients Card */}
        <Card className="border-slate-200 shadow-sm hover:shadow-xl hover:shadow-violet-900/5 transition-all group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wide">Total Patients</CardTitle>
            <div className="h-8 w-8 rounded-full bg-pink-50 flex items-center justify-center group-hover:bg-pink-600 transition-colors">
               <Users className="h-4 w-4 text-pink-600 group-hover:text-white transition-colors" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900 mt-2">
               {stats?.total_users?.patients || 0}
            </div>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              {stats?.financials?.appointments || 0} Completed Visits
            </p>
          </CardContent>
        </Card>

        {/* Pending Actions Card */}
        <Card className={`border-slate-200 shadow-sm transition-all ${totalPending > 0 ? 'bg-amber-50/50 border-amber-200 ring-1 ring-amber-200' : 'hover:shadow-xl'}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wide">Pending Approvals</CardTitle>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${totalPending > 0 ? 'bg-amber-100' : 'bg-slate-100'}`}>
               <AlertCircle className={`h-4 w-4 ${totalPending > 0 ? 'text-amber-600' : 'text-slate-400'}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900 mt-2">
              {totalPending}
            </div>
            <div className="flex gap-2 mt-4">
               {totalPending > 0 ? (
                 <Link href="/admin/approvals" className="w-full">
                   <Button size="sm" className="w-full bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/20 font-bold">
                      Review Queue
                   </Button>
                 </Link>
               ) : (
                 <div className="text-xs text-slate-400 font-medium flex items-center">
                    <ShieldCheck className="h-3 w-3 mr-1 text-emerald-500" /> All caught up!
                 </div>
               )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. Quick Actions / Context */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-4 border-slate-200 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-900">Recent System Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-sm border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
               <ShieldCheck className="h-10 w-10 mb-3 text-slate-300" />
               <p>No critical system alerts generated in the last 24h.</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1 lg:col-span-3 border-0 shadow-lg bg-slate-900 text-white relative overflow-hidden">
          {/* Decorative Background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600 rounded-full blur-[80px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>

          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-violet-400" /> AI Neural Core
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="space-y-6">
              <div className="flex justify-between text-sm border-b border-white/10 pb-2">
                <span className="text-slate-400">Model Status</span>
                <span className="text-emerald-400 font-mono font-bold tracking-wider">ONLINE</span>
              </div>
              <div className="flex justify-between text-sm border-b border-white/10 pb-2">
                <span className="text-slate-400">Vector Memory Usage</span>
                <span className="text-white font-mono">14.2 MB</span>
              </div>
              
              <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-400">
                      <span>Processing Load</span>
                      <span>Low</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                     <div className="bg-violet-500 h-full w-[15%] animate-pulse"></div>
                  </div>
              </div>

              <div className="bg-white/5 p-3 rounded-lg border border-white/5 text-xs text-slate-400">
                 System is running optimally. Agents are ready for processing appointment and diagnostic requests.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}