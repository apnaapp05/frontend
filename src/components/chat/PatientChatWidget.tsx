// FILE: src/components/chat/PatientChatWidget.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, CalendarCheck, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AgentAPI } from "@/lib/api"; 

// Types for Chat
interface Message {
  id: string;
  sender: "user" | "agent";
  text: string;
  data?: any; // For Slots, Buttons, etc.
  type?: "text" | "error" | "slots" | "emergency";
}

export default function PatientChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: "init", sender: "agent", text: "Hello! I'm your Dental Co-Pilot. I can help you book appointments or check your records. How can I help?" }
  ]);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim()) return;

    // 1. Add User Message
    const userMsg: Message = { id: Date.now().toString(), sender: "user", text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      // 2. Call Backend API (Real AI)
      // Note: We don't pass a user_id here as the backend extracts it from the JWT token if logged in
      // or uses a temporary session.
      const response = await AgentAPI.sendMessage(textToSend);
      
      // 3. Process Agent Response
      const agentMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "agent",
        text: response.response_text,
        data: response.data,
        type: response.ui_component === "emergency_banner" ? "emergency" : "text"
      };
      
      setMessages(prev => [...prev, agentMsg]);
      
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        sender: "agent", 
        text: "I'm having trouble reaching the clinic server. Please check your connection.",
        type: "error"
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSlotClick = (slotId: string, time: string) => {
    handleSend(`Book slot ${slotId} at ${time}`);
  };

  return (
    <>
      {/* Floating Launcher */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 h-14 w-14 rounded-full bg-blue-600 text-white shadow-xl flex items-center justify-center transition-transform hover:scale-110 z-50 ${isOpen ? 'hidden' : 'flex'}`}
      >
        <MessageCircle className="h-7 w-7" />
        {/* Notification Dot */}
        <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full border-2 border-white"></span>
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-6 right-6 w-96 h-[600px] max-h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 z-50 font-sans"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex justify-between items-center text-white shadow-md">
              <div className="flex items-center space-x-3">
                <div className="h-2.5 w-2.5 rounded-full bg-green-400 animate-pulse ring-2 ring-white/20" />
                <div>
                  <h3 className="font-bold text-sm">Dental Co-Pilot</h3>
                  <p className="text-[10px] text-blue-100 opacity-90">AI-Powered Assistant</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50" ref={scrollRef}>
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  
                  {/* Avatar for Agent */}
                  {msg.sender === "agent" && (
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-2 shrink-0 border border-blue-200">
                      <MessageCircle className="h-4 w-4 text-blue-600" />
                    </div>
                  )}

                  <div className={`max-w-[80%] rounded-2xl p-3 text-sm shadow-sm ${
                    msg.sender === "user" 
                      ? "bg-blue-600 text-white rounded-br-none" 
                      : msg.type === "emergency" 
                        ? "bg-red-50 text-red-800 border border-red-200 rounded-bl-none"
                        : "bg-white text-slate-700 border border-slate-200 rounded-bl-none"
                  }`}>
                    
                    {/* Emergency Banner */}
                    {msg.type === "emergency" && (
                      <div className="flex items-center gap-2 mb-2 font-bold text-red-600">
                        <AlertTriangle className="h-4 w-4" /> EMERGENCY ALERT
                      </div>
                    )}

                    <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
                    
                    {/* Render Smart Slots (Agent Action) */}
                    {msg.data?.available_slots && msg.data.available_slots.length > 0 && (
                      <div className="mt-3 space-y-2 animate-in fade-in slide-in-from-bottom-2">
                        <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">Available Slots:</p>
                        <div className="grid grid-cols-2 gap-2">
                           {msg.data.available_slots.map((slot: any) => (
                             <button 
                               key={slot.id || slot.start} 
                               onClick={() => handleSlotClick(slot.id, slot.start)}
                               className="text-xs flex items-center justify-center gap-1 bg-indigo-50 text-indigo-700 py-2 px-3 rounded-lg hover:bg-indigo-600 hover:text-white border border-indigo-200 transition-all font-medium"
                             >
                               <CalendarCheck className="h-3 w-3" />
                               {slot.start}
                             </button>
                           ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center mr-2 shrink-0" />
                  <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm border border-slate-100 flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
                    <span className="text-xs text-slate-400">Thinking...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask about appointments, records..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
              />
              <button 
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                className="p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-transform active:scale-95"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}