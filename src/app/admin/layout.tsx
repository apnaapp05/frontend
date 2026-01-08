"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { 
  LayoutDashboard, Stethoscope, Building2, FileText, 
  Menu, X, LogOut, ShieldAlert, ShieldCheck, ChevronLeft, ChevronRight, Settings 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Approvals", href: "/admin/approvals", icon: ShieldAlert },
  { label: "Doctor Queue", href: "/admin/doctors", icon: Stethoscope },
  { label: "Hospital Queue", href: "/admin/organizations", icon: Building2 },
  { label: "Audit Logs", href: "/admin/audit", icon: FileText },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isSidebarOpen, setSidebarOpen] = useState(false); // Mobile Toggle
  const [isCollapsed, setIsCollapsed] = useState(false);   // Desktop Collapse
  const pathname = usePathname();

  // Auth Check
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token || role !== "admin") {
      router.push("/auth/admin/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/auth/role-selection");
  };

  return (
    <div className="flex min-h-screen w-full bg-slate-50 relative overflow-hidden font-sans">
      
      {/* 📱 Mobile Toggle (Floating) */}
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <Button 
          size="icon" 
          aria-label="Toggle Navigation Menu"
          className="h-10 w-10 rounded-full shadow-xl bg-slate-950 text-white hover:bg-slate-900 transition-all duration-300"
          onClick={() => setSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      {/* 🛡️ SIDEBAR */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-40 bg-slate-950 text-white shadow-2xl 
          transition-all duration-300 ease-in-out border-r border-white/5
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          lg:translate-x-0 lg:relative 
          ${isCollapsed ? "w-20" : "w-72"}
        `}
      >
        {/* Header / Brand */}
        <div className={`h-24 flex items-center ${isCollapsed ? "justify-center" : "px-8"} border-b border-white/10 relative`}>
          {isCollapsed ? (
            <ShieldCheck className="h-8 w-8 text-violet-500" />
          ) : (
            <div className="animate-in fade-in duration-300">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Super Admin <ShieldCheck className="h-5 w-5 text-violet-500" />
              </h1>
              <p className="text-[10px] text-violet-400 font-bold tracking-[0.2em] uppercase mt-1">System Control</p>
            </div>
          )}
          
          {/* Desktop Collapse Toggle (Updated Color) */}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-slate-700 transition-all hidden lg:flex z-50"
            title="Toggle Sidebar"
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>
        
        {/* Navigation Links */}
        <nav className="flex-1 py-6 space-y-2 px-3 overflow-y-auto custom-scrollbar">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 relative overflow-hidden
                  ${isActive 
                    ? "bg-gradient-to-r from-violet-600/20 to-transparent text-white shadow-[0_0_20px_rgba(109,40,217,0.15)] border-l-4 border-violet-500" 
                    : "text-slate-400 hover:text-white hover:bg-white/5 border-l-4 border-transparent"
                  }
                  ${isCollapsed ? "justify-center" : ""}
                `}
                title={isCollapsed ? item.label : ""}
              >
                <item.icon className={`h-5 w-5 transition-transform group-hover:scale-110 ${isActive ? "text-violet-400" : "text-slate-400 group-hover:text-violet-300"}`} />
                
                {!isCollapsed && (
                  <span className="text-sm font-medium tracking-wide animate-in fade-in duration-200">
                    {item.label}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
        
        {/* Footer: User Profile & Logout */}
        <div className="p-4 border-t border-white/10 bg-black/20">
           {!isCollapsed ? (
             <div className="space-y-4 animate-in fade-in duration-300">
                {/* Profile Card */}
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group">
                  <Avatar className="h-10 w-10 border-2 border-violet-500/30 group-hover:border-violet-400">
                    <AvatarFallback className="bg-violet-900 text-violet-200 font-bold">SA</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">Administrator</p>
                    <p className="text-xs text-slate-400 truncate">admin@alshifa.com</p>
                  </div>
                  <Settings className="h-4 w-4 text-slate-500 group-hover:text-white transition-colors" />
                </div>

                {/* Logout Button */}
                <button 
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 w-full py-2.5 text-xs font-bold text-red-400 hover:text-white hover:bg-red-500/20 rounded-lg transition-all border border-red-500/10 hover:border-red-500/50"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
             </div>
           ) : (
             <div className="flex flex-col items-center gap-4">
                <Avatar className="h-8 w-8 cursor-pointer hover:ring-2 ring-violet-500 transition-all">
                  <AvatarFallback className="bg-violet-900 text-xs text-violet-200">SA</AvatarFallback>
                </Avatar>
                <button onClick={handleLogout} className="text-slate-500 hover:text-red-400 transition-colors" title="Logout">
                  <LogOut className="h-5 w-5" />
                </button>
             </div>
           )}
        </div>
      </aside>

      {/* 📄 MAIN CONTENT AREA */}
      <main className="flex-1 h-screen overflow-y-auto bg-slate-50 transition-all duration-300">
         {/* Mobile Header Bar */}
         <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-end px-6 lg:hidden shrink-0 sticky top-0 z-20">
            <span className="font-bold text-slate-900 text-sm">Admin Console</span>
         </header>

         <div className="p-6 md:p-10 lg:p-12 max-w-7xl mx-auto pb-20">
            {children}
         </div>
      </main>
      
      {/* Mobile Overlay */}
      {isSidebarOpen && <div className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden animate-in fade-in" onClick={() => setSidebarOpen(false)} />}
    </div>
  );
}