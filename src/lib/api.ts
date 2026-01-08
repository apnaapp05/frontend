// FILE: src/lib/api.ts
import axios from "axios";

// ==============================================================================
// 1. CORE CONFIGURATION
// ==============================================================================
// Ensure this matches your FastAPI backend URL (usually port 8000)
const API_URL = "http://localhost:8000"; 

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Auto-attach JWT Token from LocalStorage
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response Interceptor: Handle 401 (Unauthorized) globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Session expired or unauthorized.");
      // Optional: Logic to clear token or redirect to login can be enabled here
      // if (typeof window !== "undefined") window.location.href = "/auth/role-selection";
    }
    return Promise.reject(error);
  }
);

// ==============================================================================
// 2. AUTHENTICATION API
// ==============================================================================
export const AuthAPI = {
  login: async (email: string, password: string) => {
    // Backend expects OAuth2PasswordRequestForm (Form Data)
    const formData = new FormData();
    formData.append("username", email);
    formData.append("password", password);
    
    return api.post("/auth/login", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
  },
  
  register: async (userData: any) => {
    // Backend expects JSON body for UserCreate schema
    return api.post("/auth/register", userData);
  },

  getMe: async () => api.get("/auth/me"),

  // Required for HospitalSelect component during signup
  getPublicHospitals: async () => api.get("/auth/hospitals"),
};

// ==============================================================================
// 3. AI AGENT API
// ==============================================================================
export const AgentAPI = {
  // Main chat endpoint interacting with the new Router (backend/agents/router.py)
  sendMessage: async (query: string, context: any = {}, role: string = "patient") => {
    // Points to the new Router: /api/agent/chat
    const response = await api.post("/api/agent/chat", {
      message: query,
      user_id: "1", // Replace with real user ID from auth context in production
      user_role: role,
      context: context,
      agent_type: null // Router decides the agent
    });
    return response.data;
  },

  // Helper for specific booking actions
  bookSlot: async (slotId: string, patientId: string) => {
    const response = await api.post("/api/agent/chat", {
      message: `Book slot ${slotId}`,
      user_id: patientId,
      user_role: "patient",
      agent_type: "appointment",
      context: { slot_id: slotId, intent: "book" }
    });
    return response.data;
  },

  askDoctorAssistant: async (query: string) => {
    const response = await api.post("/api/agent/chat", {
      message: query,
      user_id: "doc_1", // Replace with real doctor ID context
      user_role: "doctor",
      agent_type: null // Let router decide (inventory, revenue, or medical)
    });
    return response.data;
  }
};

// ==============================================================================
// 4. DOCTOR API
// ==============================================================================
export const DoctorAPI = {
  getDashboardStats: async () => api.get("/doctor/dashboard"),
  getPatients: async () => api.get("/doctor/patients"),
  getInventory: async () => api.get("/doctor/inventory"), 
  
  // Specific agent chat for doctors
  chatWithAgent: async (payload: { agent_type: string; user_query: string; role: string }) => {
    return api.post("/api/agent/chat", {
      message: payload.user_query,
      user_role: payload.role,
      user_id: "doc_1", // Replace with dynamic ID
      agent_type: payload.agent_type
    });
  },

  completeAppointment: async (id: number) => api.post(`/doctor/appointments/${id}/complete`),
  joinOrganization: async (data: any) => api.post("/doctor/join", data),

  // MERGED: Essential for updating Profile/Schedule config (from Ver A)
  updateConfig: async (config: {
    slot_duration: number;
    break_duration: number;
    work_start: string;
    work_end: string;
  }) => {
    return api.put("/doctor/config", config);
  },
  
  // Legacy support (from Ver A)
  getInventoryMemory: async () => api.get("/agent/memory/inventory")
};

// ==============================================================================
// 5. ADMIN & ORG APIs
// ==============================================================================
export const AdminAPI = {
  getStats: async () => api.get("/admin/stats"),
  getPending: async () => api.get("/admin/approvals"), 
  approveUser: async (id: string, type: string) => api.post(`/admin/approve/${id}?type=${type}`)
};

export const OrganizationAPI = {
  getStats: async () => api.get("/organization/stats"),
  getDoctors: async () => api.get("/organization/doctors"),
};

export const PatientAPI = {
  getMyAppointments: async () => api.get("/patient/appointments"),
  getRecords: async () => api.get("/patient/records"),
};

// Export default for generic use
export default api;