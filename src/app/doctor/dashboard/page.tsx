// FILE: src/app/doctor/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, DollarSign, Calendar, Package, PlayCircle, CheckCircle2, 
  Clock, AlertTriangle, RefreshCcw, Stethoscope, ChevronRight 
} from "lucide-react";
// FIX: Named imports from the new api.ts
import { DoctorAPI, AuthAPI } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function DoctorDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [inventoryCount, setInventoryCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Join Organization State
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [joinForm, setJoinForm] = useState({
    hospital_id: "",
    specialization: "",
    license_number: ""
  });

  const fetchDashboard = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/doctor/login");
      return;
    }

    try {
      setLoading(true);
      // Parallel Data Fetching
      const [dashboardRes, inventoryRes] = await Promise.all([
        DoctorAPI.getDashboardStats().catch(err => {
           console.error("Dashboard Stats Error:", err);
           return { data: { account_status: "pending" } }; // Fallback
        }),
        DoctorAPI.getInventory().catch(() => ({ data: [] }))
      ]);

      setStats(dashboardRes.data);
      setInventoryCount(inventoryRes.data.length || 0);
      
      // If no profile, fetch hospitals for the join form
      // Uses the legacy public endpoint or auth endpoint
      if (dashboardRes.data.account_status === "no_profile") {
         // Using AuthAPI as defined in your API file
         const hospRes = await AuthAPI.getPublicHospitals().catch(() => ({ data: [] }));
         setHospitals(hospRes.data);
      }

    } catch (error) {
      console.error("Failed to fetch dashboard", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleJoin = async () => {
    if(!joinForm.hospital_id || !joinForm.specialization || !joinForm.license_number) {
      alert("Please fill all fields");
      return;
    }
    try {
      setLoading(true);
      await DoctorAPI.joinOrganization({
        hospital_id: parseInt(joinForm.hospital_id),
        specialization: joinForm.specialization,
        license_number: joinForm.license_number
      });
      alert("Request Sent! Please wait for approval.");
      fetchDashboard();
    } catch (error) {
      alert("Failed to send request. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (apptId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if(!confirm("Mark as complete? This will generate a bill.")) return;
    try {
      const res = await DoctorAPI.completeAppointment(apptId);
      // Backend returns { details: string[] }
      alert(res.data.details ? res.data.details.join("\n") : "Completed successfully");
      fetchDashboard(); 
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to complete");
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <RefreshCcw className="h-10 w-10 animate-spin text-emerald-600" />
        <p className="text-emerald-800 font-medium">Loading Medical Core...</p>
      </div>
    </div>
  );

  // --- VIEW 1: NO PROFILE (Onboarding) ---
  if (stats?.account_status === "no_profile") {
    return (
      <div className="max-w-2xl mx-auto space-y-6 mt-10 p-6">
        <Card className="border-l-4 border-l-yellow-500 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <AlertTriangle className="h-6 w-6" /> Action Required: Join Organization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-600">You must be linked to a Hospital to start practicing.</p>
            <div className="space-y-4 bg-slate-50 p-6 rounded-lg border border-slate-100">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Select Hospital</label>
                <select 
                  className="w-full h-10 rounded-md border border-slate-300 px-3 bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  onChange={(e) => setJoinForm({...joinForm, hospital_id: e.target.value})}
                >
                  <option value="">-- Choose Hospital --</option>
                  {hospitals.map((h: any) => (
                    <option key={h.id} value={h.id}>{h.name} ({h.location || "Main"})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Specialization</label>
                  <div className="relative">
                     <Stethoscope className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                     <Input 
                        className="pl-10" 
                        placeholder="e.g. Orthodontist" 
                        value={joinForm.specialization}
                        onChange={(e) => setJoinForm({...joinForm, specialization: e.target.value})}
                     />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">License No.</label>
                  <Input 
                      placeholder="e.g. PMDC-12345" 
                      value={joinForm.license_number}
                      onChange={(e) => setJoinForm({...joinForm, license_number: e.target.value})}
                   />
                </div>
              </div>
              <Button onClick={handleJoin} className="w-full bg-emerald-600 hover:bg-emerald-700 mt-2 text-white">
                Submit Join Request
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- VIEW 2: PENDING APPROVAL ---
  if (stats?.account_status === "pending") {
    return (
      <div className="max-w-md mx-auto mt-20 text-center space-y-6 p-8 bg-white rounded-2xl shadow-lg border border-slate-100">
        <div className="h-20 w-20 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
          <Clock className="h-10 w-10" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Verification Pending</h1>
          <p className="text-slate-500 mt-2">Your request is being reviewed by the hospital admin.<br/>Please check back later.</p>
        </div>
        <Button variant="outline" onClick={fetchDashboard} className="gap-2 w-full">
          <RefreshCcw className="h-4 w-4" /> Check Status
        </Button>
      </div>
    );
  }

  // --- VIEW 3: ACTIVE DASHBOARD ---
  return (
    <div className="space-y-8 p-4 md:p-8 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Medical Dashboard</h1>
          <p className="text-slate-500">Welcome back, Dr. {stats?.doctor_name || "Doctor"}</p>
        </div>
        <Button variant="ghost" onClick={fetchDashboard} className="gap-2 text-emerald-600 hover:bg-emerald-50">
          <RefreshCcw className="h-4 w-4" /> Refresh
        </Button>
      </div>
      
      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KPICard 
          title="Appointments" 
          value={stats?.today_count || 0} 
          subtitle="Scheduled Today" 
          icon={Calendar} 
          color="blue"
          onClick={() => router.push("/doctor/schedule")} 
        />
        <KPICard 
          title="My Patients" 
          value={stats?.total_patients || 0} 
          subtitle="Total Records" 
          icon={Users} 
          color="purple"
          onClick={() => router.push("/doctor/patients")} 
        />
        <KPICard 
          title="Revenue" 
          value={`$${stats?.revenue || 0}`} 
          subtitle="This Month" 
          icon={DollarSign} 
          color="emerald"
          onClick={() => router.push("/doctor/finance")} 
        />
        <KPICard 
          title="Inventory" 
          value={inventoryCount} 
          subtitle="Items in Stock" 
          icon={Package} 
          color="orange"
          onClick={() => router.push("/doctor/inventory")} 
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        
        {/* Today's Schedule */}
        <Card className="col-span-4 shadow-sm bg-white border border-slate-200">
          <CardHeader className="border-b border-slate-100 bg-white">
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <Clock className="h-5 w-5 text-emerald-600" /> Today's Schedule
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => router.push("/doctor/schedule")}>View Calendar <ChevronRight className="h-4 w-4 ml-1"/></Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {(!stats?.appointments || stats.appointments.length === 0) ? (
                <div className="p-12 text-center text-slate-400 flex flex-col items-center">
                  <Calendar className="h-12 w-12 text-slate-200 mb-3" />
                  <p>No appointments scheduled for today.</p>
                </div>
              ) : (
                stats.appointments.map((appt: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm border ${
                        appt.status === 'completed' 
                          ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                          : 'bg-blue-50 text-blue-600 border-blue-100'
                      }`}>
                        {appt.patient_name ? appt.patient_name.charAt(0) : 'P'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{appt.patient_name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{appt.treatment || "Consultation"}</span>
                          <span className="text-xs font-mono font-medium text-slate-600">{appt.time}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      {appt.status === "completed" ? (
                        <span className="flex items-center text-emerald-600 text-xs font-bold bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> DONE
                        </span>
                      ) : (
                        <Button 
                          size="sm" 
                          className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm h-8 text-xs"
                          onClick={(e) => handleComplete(appt.id, e)}
                        >
                          <PlayCircle className="w-3 h-3 mr-1.5" /> Start
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* AI Assistant Panel */}
        <Card className="col-span-3 bg-gradient-to-br from-indigo-50 via-white to-purple-50 border border-indigo-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Stethoscope className="h-32 w-32 text-indigo-900" />
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-900">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
              </span>
              Smart Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 relative z-10">
              <div className="p-4 bg-white/60 backdrop-blur rounded-xl border border-indigo-100 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-xs font-bold text-indigo-800 uppercase tracking-wide mb-1">Queue Status</p>
                <p className="text-sm text-slate-700">
                  You have <strong>{stats?.today_count || 0} patients</strong> today. 
                  Estimated finish time: <strong>5:00 PM</strong>.
                </p>
              </div>
              
              <div className="p-4 bg-white/60 backdrop-blur rounded-xl border border-orange-100 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-xs font-bold text-orange-800 uppercase tracking-wide mb-1">Inventory Check</p>
                <p className="text-sm text-slate-700">
                  {inventoryCount < 10 
                    ? "⚠️ Low stock detected on essential items. Please check inventory." 
                    : "✅ Stock levels are healthy for today's procedures."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

// Helper Component for KPI Cards
function KPICard({ title, value, subtitle, icon: Icon, color, onClick }: any) {
  const colorMap: any = {
    blue: "text-blue-600 bg-blue-50 border-blue-100 hover:border-blue-300",
    purple: "text-purple-600 bg-purple-50 border-purple-100 hover:border-purple-300",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100 hover:border-emerald-300",
    orange: "text-orange-600 bg-orange-50 border-orange-100 hover:border-orange-300",
  };

  return (
    <Card 
      onClick={onClick}
      className={`border-l-4 shadow-sm hover:shadow-lg transition-all cursor-pointer group bg-white ${colorMap[color].split(' ').pop()} border-l-${color}-500`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-500 group-hover:text-slate-800">{title}</CardTitle>
        <Icon className={`h-4 w-4 transition-transform group-hover:scale-110 ${colorMap[color].split(' ')[0]}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        <p className="text-xs text-slate-400 mt-1 group-hover:text-slate-500">{subtitle}</p>
      </CardContent>
    </Card>
  );
}