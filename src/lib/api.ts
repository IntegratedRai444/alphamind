
import { Agent, AgentMemory, CreateAgentRequest, TaskRequest, TaskResponse, VoiceResponse } from "@/types/agent";

export const API_BASE_URL = localStorage.getItem("mcpApiUrl") || "http://localhost:8000";

export const setApiBaseUrl = (url: string) => {
  localStorage.setItem("mcpApiUrl", url);
  window.location.reload();
};

// API Functions
export const fetchServerStatus = async (): Promise<{ status: string; name: string; version: string; }> => {
  const response = await fetch(`${API_BASE_URL}/`);
  if (!response.ok) {
    throw new Error(`Failed to fetch server status: ${response.statusText}`);
  }
  return response.json();
};

export const fetchAgents = async (): Promise<Agent[]> => {
  const response = await fetch(`${API_BASE_URL}/agents`);
  if (!response.ok) {
    throw new Error(`Failed to fetch agents: ${response.statusText}`);
  }
  return response.json();
};

export const fetchAgent = async (agentId: string): Promise<Agent> => {
  const response = await fetch(`${API_BASE_URL}/agents/${agentId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch agent: ${response.statusText}`);
  }
  return response.json();
};

export const createAgent = async (agentData: CreateAgentRequest): Promise<Agent> => {
  const response = await fetch(`${API_BASE_URL}/create_agent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(agentData),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(`Failed to create agent: ${errorData.detail || response.statusText}`);
  }
  
  return response.json();
};

export const deleteAgent = async (agentId: string): Promise<{ status: string; message: string }> => {
  const response = await fetch(`${API_BASE_URL}/agents/${agentId}`, {
    method: "DELETE",
  });
  
  if (!response.ok) {
    throw new Error(`Failed to delete agent: ${response.statusText}`);
  }
  
  return response.json();
};

export const fetchAgentMemory = async (agentId: string): Promise<AgentMemory> => {
  const response = await fetch(`${API_BASE_URL}/agents/${agentId}/memory`);
  if (!response.ok) {
    throw new Error(`Failed to fetch agent memory: ${response.statusText}`);
  }
  return response.json();
};

export const clearAgentMemory = async (agentId: string): Promise<{ status: string; message: string }> => {
  const response = await fetch(`${API_BASE_URL}/agents/${agentId}/clear_memory`, {
    method: "POST",
  });
  
  if (!response.ok) {
    throw new Error(`Failed to clear agent memory: ${response.statusText}`);
  }
  
  return response.json();
};

export const runTask = async (taskData: TaskRequest): Promise<TaskResponse> => {
  const response = await fetch(`${API_BASE_URL}/run_task`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(taskData),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(`Failed to run task: ${errorData.detail || response.statusText}`);
  }
  
  return response.json();
};

export const fetchAvailableVoices = async (provider: string): Promise<VoiceResponse> => {
  const response = await fetch(`${API_BASE_URL}/available_voices/${provider}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch voices: ${response.statusText}`);
  }
  return response.json();
};

export const getVoiceUrl = (voicePath: string): string => {
  if (!voicePath) return "";
  if (voicePath.startsWith("http")) return voicePath;
  return `${API_BASE_URL}${voicePath}`;
};
