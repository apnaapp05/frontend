"use client";
import React, { useState } from 'react';
import AgentChat from '@/components/agent-chat';

export default function DoctorDashboard() {
  const [activeAgent, setActiveAgent] = useState('medical');

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Clinical Command Center</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex gap-2 mb-4">
            {['medical', 'inventory', 'revenue'].map(id => (
              <button key={id} onClick={() => setActiveAgent(id)}
                className={`px-4 py-2 rounded-lg font-medium capitalize ${activeAgent === id ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600'}`}>
                {id} Agent
              </button>
            ))}
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 h-[600px] overflow-hidden">
             <AgentChat key={activeAgent} agentType={activeAgent} />
          </div>
        </div>
        <div className="space-y-6">
           <div className="bg-white p-6 rounded-2xl shadow-sm">
              <h3 className="font-bold text-slate-600 mb-4">Quick Stats</h3>
              <p>Appointments Today: <span className="text-emerald-600 font-bold">8</span></p>
           </div>
        </div>
      </div>
    </div>
  );
}
