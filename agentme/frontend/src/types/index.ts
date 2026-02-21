export interface Config {
  telegram_bot_token?: string;
  model_provider: string;
  model_api_key?: string;
  model_name: string;
  base_url?: string;
  extra_settings?: Record<string, string>;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  files?: string[];
  timestamp: number;
}

export interface ChatSession {
  id: string;
  name: string;
  created_at: number;
  messages: Message[];
}

export interface PicoclawStatus {
  installed: boolean;
  running: boolean;
  configDir: string;
  workspace: string;
}

export interface Skill {
  name: string;
  description?: string;
  installed?: boolean;
}
