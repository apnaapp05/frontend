"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { 
  FileText, Calendar, User, Search, Loader2, History 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get("/admin/audit-logs");
        setLogs(res.data);
      } catch (e) {
        console.error("Failed to load logs", e);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(l => 
    l.details.toLowerCase().includes(search.toLowerCase()) || 
    l.action.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Audit Trail <span className="text-violet-600 text-3xl">.</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            System-wide activity log for compliance and security.
          </p>
        </div>
        
        <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input 
                placeholder="Search logs..." 
                className="pl-10 bg-slate-50 border-slate-200 focus:ring-violet-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>
      </div>

      {/* Logs Table */}
      <Card className="shadow-sm border border-slate-200 overflow-hidden bg-white">
        <CardContent className="p-0">
          {loading ? (
             <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Loader2 className="h-10 w-10 animate-spin mb-4 text-violet-600" />
                <p>Retrieving History...</p>
             </div>
          ) : (
             <Table>
               <TableHeader className="bg-slate-50">
                 <TableRow>
                   <TableHead className="font-bold text-slate-500 w-[180px]">Timestamp</TableHead>
                   <TableHead className="font-bold text-slate-500">Administrator</TableHead>
                   <TableHead className="font-bold text-slate-500">Action Type</TableHead>
                   <TableHead className="font-bold text-slate-500">Details</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {filteredLogs.length > 0 ? filteredLogs.map((log) => (
                   <TableRow key={log.id} className="hover:bg-slate-50/50">
                     <TableCell className="font-mono text-xs text-slate-500">
                        {format(new Date(log.timestamp), "MMM d, yyyy HH:mm")}
                     </TableCell>
                     <TableCell>
                        <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-violet-100 flex items-center justify-center text-[10px] font-bold text-violet-700">
                                {log.admin_name.substring(0,2).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-slate-700">{log.admin_name}</span>
                        </div>
                     </TableCell>
                     <TableCell>
                        <Badge variant="outline" className={`
                            font-bold border-0 
                            ${log.action.includes('APPROVE') ? 'bg-emerald-50 text-emerald-700' : ''}
                            ${log.action.includes('REJECT') ? 'bg-red-50 text-red-700' : ''}
                        `}>
                            {log.action.replace('_', ' ')}
                        </Badge>
                     </TableCell>
                     <TableCell className="text-sm text-slate-600">
                        {log.details}
                     </TableCell>
                   </TableRow>
                 )) : (
                   <TableRow>
                     <TableCell colSpan={4} className="text-center py-16 text-slate-400">
                        <History className="h-10 w-10 mx-auto mb-2 opacity-20" />
                        No logs found matching "{search}"
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