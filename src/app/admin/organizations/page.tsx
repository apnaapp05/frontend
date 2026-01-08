"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { 
  Building2, CheckCircle, XCircle, Search, MapPin, 
  Loader2, ExternalLink, ShieldAlert 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function HospitalQueuePage() {
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  // 1. Fetch Pending Hospitals
  const fetchQueue = async () => {
    try {
      const res = await api.get("/admin/hospitals/pending");
      setHospitals(res.data);
    } catch (e) {
      console.error("Failed to load queue", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQueue(); }, []);

  // 2. Handle Action (Approve/Reject)
  const handleAction = async (id: string, action: "approve" | "reject") => {
    setProcessing(id);
    try {
      await api.post(`/admin/verify/hospital/${id}?action=${action}`);
      // Remove from list locally for instant feedback
      setHospitals(prev => prev.filter(h => h.id !== id));
      alert(`Hospital ${action}d successfully.`);
    } catch (e) {
      alert("Action failed.");
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Hospital Queue <span className="text-violet-600 text-3xl">.</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">Verify organization credentials before onboarding.</p>
        </div>
        <div className="bg-violet-50 text-violet-700 px-4 py-2 rounded-lg font-bold text-sm">
           {hospitals.length} Pending
        </div>
      </div>

      {/* Queue Table */}
      <Card className="shadow-sm border border-slate-200 overflow-hidden bg-white">
        <CardContent className="p-0">
          {loading ? (
             <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Loader2 className="h-10 w-10 animate-spin mb-4 text-violet-600" />
                <p>Loading Queue...</p>
             </div>
          ) : (
             <Table>
               <TableHeader className="bg-slate-50">
                 <TableRow>
                   <TableHead className="font-bold text-slate-500">Organization</TableHead>
                   <TableHead className="font-bold text-slate-500">Location</TableHead>
                   <TableHead className="font-bold text-slate-500">License</TableHead>
                   <TableHead className="font-bold text-slate-500">Contact</TableHead>
                   <TableHead className="font-bold text-slate-500 text-right">Actions</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {hospitals.length > 0 ? hospitals.map((h) => (
                   <TableRow key={h.id} className="hover:bg-slate-50/50">
                     <TableCell>
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 bg-violet-100 text-violet-600 border border-violet-200">
                                <AvatarFallback className="font-bold">{h.name.substring(0,2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="font-bold text-slate-900">{h.name}</div>
                                <div className="text-xs text-slate-500">ID: {h.id.slice(0,8)}...</div>
                            </div>
                        </div>
                     </TableCell>
                     <TableCell>
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                            <MapPin className="h-3 w-3 text-slate-400" /> {h.location}
                        </div>
                     </TableCell>
                     <TableCell>
                        <Badge variant="outline" className="font-mono bg-slate-50">{h.license_number || "N/A"}</Badge>
                     </TableCell>
                     <TableCell className="text-sm text-slate-600">
                        {h.contact_email}
                     </TableCell>
                     <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                            <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-red-600 hover:bg-red-50 border-red-200"
                                onClick={() => handleAction(h.id, "reject")}
                                disabled={processing === h.id}
                            >
                                {processing === h.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4 mr-1" />}
                                Reject
                            </Button>
                            <Button 
                                size="sm" 
                                className="bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-600/20"
                                onClick={() => handleAction(h.id, "approve")}
                                disabled={processing === h.id}
                            >
                                {processing === h.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                                Approve
                            </Button>
                        </div>
                     </TableCell>
                   </TableRow>
                 )) : (
                   <TableRow>
                     <TableCell colSpan={5} className="text-center py-16 text-slate-400">
                        <ShieldAlert className="h-10 w-10 mx-auto mb-2 opacity-20" />
                        No pending hospital approvals.
                     </TableCell>
                   </TableRow>
                 )}
               </TableBody>
             </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}