"use client";

import { useState, useRef, useEffect } from "react";
import api from "@/lib/api";
import { 
  Bot, Send, User, Sparkles, AlertCircle, 
  Package, DollarSign, Calendar, FileText, Activity, Loader2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Message Type Definition
type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  agentUsed?: string;
  timestamp: Date;
};

const AGENTS = [
  { id: "auto", label: "Auto-Detect Intent", icon: Sparkles, color: "text-emerald-500" },
  { id: "inventory", label: "Inventory Specialist", icon: Package, color: "text-amber-500" },
  { id: "revenue", label: "Revenue Analyst", icon: DollarSign, color: "text-green-600" },
  { id: "appointment", label: "Scheduling Assistant", icon: Calendar, color: "text-blue-500" },
  { id: "medical", label: "Medical Research", icon: Activity, color: "text-red-500" },
];

export default function DoctorAgentPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello Dr. I am your Clinical AI Assistant. You can ask me about **Inventory Levels**, **Revenue Reports**, or **Patient Schedules**.",
      agentUsed: "system",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState("auto");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // 🟢 REAL API CALL (No Mock)
      const res = await api.post("/doctor/agents/chat", {
        query: userMsg.content,
        agent_type: selectedAgent === "auto" ? null : selectedAgent
      });

      const data = res.data; // Expecting { status, response_text, agent_used }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response_text || "I processed your request but returned no text.",
        agentUsed: data.agent_used,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMsg]);

    } catch (e) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "⚠️ I'm having trouble connecting to the Neural Core. Please try again.",
        agentUsed: "error",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col font-sans animate-in fade-in duration-500">
      
      {/* 🟢 HEADER / AGENT SELECTOR */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-t-2xl border border-slate-200 shadow-sm z-10">
        <div className="flex items-center gap-3 mb-4 md:mb-0">
           <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center border border-emerald-200">
              <Bot className="h-6 w-6 text-emerald-700" />
           </div>
           <div>
              <h1 className="text-lg font-black text-slate-900 leading-tight">AI Command Center</h1>
              <div className="flex items-center gap-1.5">
                 <span className="relative flex h-2 w-2">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                 </span>
                 <span className="text-xs font-medium text-emerald-600">Neural Network Active</span>
              </div>
           </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs font-bold text-slate-400 uppercase hidden md:block">Active Agent:</span>
            <Select value={selectedAgent} onValueChange={setSelectedAgent}>
              <SelectTrigger className="w-full md:w-[220px] h-9 border-slate-200 bg-slate-50 focus:ring-emerald-500">
                <SelectValue placeholder="Select Agent" />
              </SelectTrigger>
              <SelectContent>
                {AGENTS.map(agent => (
                   <SelectItem key={agent.id} value={agent.id}>
                      <div className="flex items-center gap-2">
                         <agent.icon className={`h-4 w-4 ${agent.color}`} />
                         <span>{agent.label}</span>
                      </div>
                   </SelectItem>
                ))}
              </SelectContent>
            </Select>
        </div>
      </div>

      {/* 🟢 CHAT AREA */}
      <Card className="flex-1 bg-slate-50 border-x border-b border-slate-200 rounded-b-2xl rounded-t-none shadow-inner overflow-hidden flex flex-col relative">
        
        {/* Messages Scroll View */}
        <div 
            ref={scrollRef} 
            className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth"
        >
           {messages.map((msg) => (
             <div 
               key={msg.id} 
               className={cn(
                 "flex gap-4 max-w-[85%]",
                 msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
               )}
             >
                {/* Avatar */}
                <Avatar className={cn(
                  "h-8 w-8 mt-1 border", 
                  msg.role === "user" ? "border-slate-200" : "border-emerald-200 bg-white"
                )}>
                  {msg.role === "user" ? (
                    <AvatarFallback className="bg-slate-900 text-white">DR</AvatarFallback>
                  ) : (
                    <div className="h-full w-full bg-emerald-50 flex items-center justify-center">
                       <Bot className="h-4 w-4 text-emerald-600" />
                    </div>
                  )}
                </Avatar>

                {/* Bubble */}
                <div className="flex flex-col gap-1">
                   <div className={cn(
                     "p-4 rounded-2xl shadow-sm text-sm leading-relaxed whitespace-pre-wrap",
                     msg.role === "user" 
                       ? "bg-slate-900 text-white rounded-tr-none" 
                       : "bg-white text-slate-700 border border-slate-100 rounded-tl-none"
                   )}>
                      {msg.role === "assistant" && msg.agentUsed && msg.agentUsed !== "system" && (
                         <Badge variant="outline" className="mb-2 bg-slate-50 text-[10px] font-bold text-slate-400 border-slate-200 uppercase tracking-wider">
                            {AGENTS.find(a => a.id === msg.agentUsed)?.label || msg.agentUsed} Output
                         </Badge>
                      )}
                      
                      {/* Basic Markdown Rendering (Bold/Newlines) */}
                      {msg.content.split('\n').map((line, i) => (
                         <p key={i} className="min-h-[1.2em]">
                           {line.split('**').map((chunk, j) => 
                             j % 2 === 1 ? <strong key={j} className="font-black text-emerald-700">{chunk}</strong> : chunk
                           )}
                         </p>
                      ))}
                   </div>
                   <span className="text-[10px] text-slate-400 font-medium px-1">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </span>
                </div>
             </div>
           ))}

           {loading && (
             <div className="flex gap-4 mr-auto max-w-[85%]">
                <Avatar className="h-8 w-8 mt-1 border border-emerald-200 bg-white">
                    <div className="h-full w-full bg-emerald-50 flex items-center justify-center">
                       <Bot className="h-4 w-4 text-emerald-600" />
                    </div>
                </Avatar>
                <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex items-center gap-2">
                   <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                   <span className="text-xs text-slate-400 font-medium">Processing Request...</span>
                </div>
             </div>
           )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-100 flex items-end gap-2">
            <div className="relative flex-1">
              <Input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about inventory, revenue, or schedule..." 
                className="pr-12 py-6 bg-slate-50 border-slate-200 focus:ring-emerald-500 rounded-xl"
                disabled={loading}
              />
              <div className="absolute right-3 top-3.5">
                 {loading ? <Loader2 className="h-5 w-5 animate-spin text-emerald-500" /> : <Sparkles className="h-5 w-5 text-slate-400" />}
              </div>
            </div>
            <Button 
              onClick={handleSend} 
              disabled={loading || !input.trim()}
              className="h-12 w-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 flex-shrink-0"
            >
              <Send className="h-5 w-5 text-white" />
            </Button>
        </div>

      </Card>
    </div>
  );
}