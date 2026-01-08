"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { 
  Package, Search, AlertTriangle, CheckCircle2, 
  Filter, RefreshCcw, ArrowUpRight, Loader2 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function DoctorInventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // 1. Fetch Inventory Data
  const fetchInventory = async () => {
    try {
      const res = await api.get("/doctor/inventory");
      setItems(res.data);
    } catch (e) {
      console.error("Failed to load inventory", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchInventory();
  };

  // 2. Filter Logic
  // UPDATED: Backend model uses 'name' not 'item_name'
  const filteredItems = items.filter((item) =>
    (item.name || item.item_name || "").toLowerCase().includes(search.toLowerCase()) ||
    item.category?.toLowerCase().includes(search.toLowerCase())
  );

  // 3. Stats Calculation
  const totalItems = items.length;
  const lowStockCount = items.filter(i => i.quantity < (i.threshold_limit || 20)).length;
  const outOfStockCount = items.filter(i => i.quantity === 0).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Clinical Inventory <span className="text-emerald-600 text-3xl">.</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Monitor medical supplies and equipment levels.
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
           <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search supplies..." 
                className="pl-10 bg-slate-50 border-slate-200 focus:ring-emerald-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>
           <Button 
             size="icon" 
             variant="outline" 
             onClick={handleRefresh}
             className={`shrink-0 ${refreshing ? "animate-spin" : ""}`}
           >
             <RefreshCcw className="h-4 w-4 text-slate-600" />
           </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-emerald-500 shadow-sm bg-white">
          <CardContent className="p-6 flex items-center gap-4">
             <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center">
                <Package className="h-6 w-6 text-emerald-600" />
             </div>
             <div>
                <p className="text-sm font-medium text-slate-500">Total Items</p>
                <h3 className="text-2xl font-black text-slate-900">{totalItems}</h3>
             </div>
          </CardContent>
        </Card>

        <Card className={`border-l-4 shadow-sm bg-white ${lowStockCount > 0 ? "border-l-amber-500" : "border-l-slate-300"}`}>
          <CardContent className="p-6 flex items-center gap-4">
             <div className={`h-12 w-12 rounded-full flex items-center justify-center ${lowStockCount > 0 ? "bg-amber-50" : "bg-slate-50"}`}>
                <AlertTriangle className={`h-6 w-6 ${lowStockCount > 0 ? "text-amber-600" : "text-slate-400"}`} />
             </div>
             <div>
                <p className="text-sm font-medium text-slate-500">Low Stock Alerts</p>
                <h3 className="text-2xl font-black text-slate-900">{lowStockCount}</h3>
             </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-slate-300 shadow-sm bg-white">
          <CardContent className="p-6 flex items-center gap-4">
             <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center">
                <Filter className="h-6 w-6 text-slate-400" />
             </div>
             <div>
                <p className="text-sm font-medium text-slate-500">Categories</p>
                <h3 className="text-2xl font-black text-slate-900">--</h3>
             </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card className="shadow-sm border border-slate-200 overflow-hidden bg-white">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
               <Package className="h-5 w-5 text-emerald-600" /> Stock List
            </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
             <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Loader2 className="h-10 w-10 animate-spin mb-4 text-emerald-600" />
                <p>Loading Inventory...</p>
             </div>
          ) : (
             <div className="overflow-x-auto">
               <Table>
                 <TableHeader className="bg-slate-50">
                   <TableRow>
                     <TableHead className="font-bold text-slate-500">Item Name</TableHead>
                     <TableHead className="font-bold text-slate-500">Category</TableHead>
                     <TableHead className="font-bold text-slate-500 text-center">Quantity</TableHead>
                     <TableHead className="font-bold text-slate-500">Status</TableHead>
                     <TableHead className="font-bold text-slate-500 text-right">Action</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {filteredItems.length > 0 ? filteredItems.map((item) => (
                     <TableRow key={item.id} className="hover:bg-emerald-50/30 transition-colors group">
                       <TableCell className="font-bold text-slate-800">
                          {/* UPDATED property access */}
                          {item.name || item.item_name}
                       </TableCell>
                       <TableCell className="text-slate-500">
                          {item.category || "General"}
                       </TableCell>
                       <TableCell className="text-center">
                          <span className={`font-mono font-bold ${item.quantity < (item.threshold_limit || 20) ? "text-amber-600" : "text-slate-700"}`}>
                             {item.quantity}
                          </span>
                       </TableCell>
                       <TableCell>
                          {item.quantity === 0 ? (
                             <Badge variant="destructive">Out of Stock</Badge>
                          ) : item.quantity < (item.threshold_limit || 20) ? (
                             <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-0">Low Stock</Badge>
                          ) : (
                             <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0">
                                <CheckCircle2 className="h-3 w-3 mr-1" /> In Stock
                             </Badge>
                          )}
                       </TableCell>
                       <TableCell className="text-right">
                          <Button size="sm" variant="ghost" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                             Request <ArrowUpRight className="ml-1 h-3 w-3" />
                          </Button>
                       </TableCell>
                     </TableRow>
                   )) : (
                     <TableRow>
                       <TableCell colSpan={5} className="text-center py-16 text-slate-400">
                          No items found in inventory.
                       </TableCell>
                     </TableRow>
                   )}
                 </TableBody>
               </Table>
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}