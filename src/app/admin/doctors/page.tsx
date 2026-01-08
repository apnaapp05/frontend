"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { 
  Stethoscope, CheckCircle, XCircle, Search, 
  Loader2, ShieldAlert, Mail, FileText 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";

export default function DoctorQueuePage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // 1. Fetch Pending Doctors
  const fetchQueue = async () => {
    try {
      const res = await api.get("/admin/doctors/pending");
      setDoctors(res.data);
    } catch (e) {
      console.error("Failed to load doctor queue", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQueue(); }, []);

  // 2. Handle Action (Approve/Reject)
  const handleAction = async (id: string, action: "approve" | "reject") => {
    setProcessing(id);
    try {
      await api.post(`/admin/verify/doctor/${id}?action=${action}`);
      
      // Update UI Instantly
      setDoctors(prev => prev.filter(d => d.id !== id));
      
      // Optional: Show specific success message based on action
      if (action === "approve") {
        // In a real app, use a Toast here
        console.log(`Doctor approved successfully.`);
      }
    } catch (e) {
      alert("Action failed. Please check console.");
      console.error(e);
    } finally {
      setProcessing(null);
    }
  };

  // 3. Filter Logic
  const filteredDoctors = doctors.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) || 
    d.email.toLowerCase().includes(search.toLowerCase()) ||
    d.license_number.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Doctor Verification <span className="text-violet-600 text-3xl">.</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">Review medical licenses and credentials.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="bg-violet-50 text-violet-700 px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap">
               {doctors.length} Pending
            </div>
            <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input 
                    placeholder="Search name or license..." 
                    className="pl-10 bg-slate-50 border-slate-200 focus:ring-violet-500"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
        </div>
      </div>

      {/* Queue Table */}
      <Card className="shadow-sm border border-slate-200 overflow-hidden bg-white">
        <CardContent className="p-0">
          {loading ? (
             <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Loader2 className="h-10 w-10 animate-spin mb-4 text-violet-600" />
                <p>Retrieving Applications...</p>
             </div>
          ) : (
             <Table>
               <TableHeader className="bg-slate-50">
                 <TableRow>
                   <TableHead className="font-bold text-slate-500">Applicant</TableHead>
                   <TableHead className="font-bold text-slate-500">License & Spec</TableHead>
                   <TableHead className="font-bold text-slate-500">Applied Date</TableHead>
                   <TableHead className="font-bold text-slate-500 text-right">Decision</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {filteredDoctors.length > 0 ? filteredDoctors.map((doc) => (
                   <TableRow key={doc.id} className="hover:bg-slate-50/50">
                     <TableCell>
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border border-violet-100">
                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${doc.name}`} />
                                <AvatarFallback className="bg-violet-100 text-violet-700 font-bold">
                                    {doc.name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="font-bold text-slate-900">{doc.name}</div>
                                <div className="text-xs text-slate-500 flex items-center gap-1">
                                    <Mail className="h-3 w-3" /> {doc.email}
                                </div>
                            </div>
                        </div>
                     </TableCell>
                     <TableCell>
                        <div className="space-y-1">
                            <Badge variant="outline" className="font-mono bg-slate-50 border-slate-200">
                                {doc.license_number}
                            </Badge>
                            <div className="text-xs font-medium text-slate-600 flex items-center gap-1">
                                <Stethoscope className="h-3 w-3 text-violet-500" /> {doc.specialization}
                            </div>
                        </div>
                     </TableCell>
                     <TableCell className="text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                             <FileText className="h-4 w-4 text-slate-400" />
                             {doc.joined_at ? format(new Date(doc.joined_at), "MMM d, yyyy") : "N/A"}
                        </div>
                     </TableCell>
                     <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                            <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-red-600 hover:bg-red-50 border-red-200 hover:border-red-300"
                                onClick={() => handleAction(doc.id, "reject")}
                                disabled={processing === doc.id}
                            >
                                {processing === doc.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4 mr-1" />}
                                Reject
                            </Button>
                            <Button 
                                size="sm" 
                                className="bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-600/20"
                                onClick={() => handleAction(doc.id, "approve")}
                                disabled={processing === doc.id}
                            >
                                {processing === doc.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                                Verify
                            </Button>
                        </div>
                     </TableCell>
                   </TableRow>
                 )) : (
                   <TableRow>
                     <TableCell colSpan={4} className="text-center py-16 text-slate-400">
                        <ShieldAlert className="h-10 w-10 mx-auto mb-2 opacity-20" />
                        No pending doctor applications.
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