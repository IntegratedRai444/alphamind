
export interface Agent {
  agent_id: string;
  name: string;
  role: string;
  llm_provider: string;
  llm_model: string;
  created_at: string;
  system_prompt?: string;
  voice_provider?: string;
  voice_id?: string;
  metadata: Record<string, any>;
}

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

export interface AgentMemory {
  agent_id: string;
  memory: Message[];
}

export interface CreateAgentRequest {
  name: string;
  role: string;
  llm_provider: "claude" | "openai";
  llm_model?: string;
  system_prompt?: string;
  voice_provider?: "elevenlabs" | "openai";
  voice_id?: string;
  metadata?: Record<string, any>;
}

export interface TaskRequest {
  agent_id: string;
  prompt: string;
  voice_output: boolean;
  stream?: boolean;
  max_tokens?: number;
  temperature?: number;
  context_window?: number;
}

export interface TaskResponse {
  agent_id: string;
  prompt: string;
  response: string;
  voice_url?: string;
  timestamp: string;
  metadata: Record<string, any>;
}

export interface Voice {
  voice_id: string;
  name: string;
}

export interface VoiceResponse {
  provider: string;
  voices: Voice[];
}
