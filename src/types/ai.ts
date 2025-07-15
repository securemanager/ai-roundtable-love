export interface AIModel {
  id: string;
  name: string;
  color: string;
  position: { x: string; y: string };
}

export interface AIResponse {
  modelId: string;
  content: string;
  isLoading: boolean;
  error?: string;
}

export interface APIKeys {
  openai: string;
  anthropic: string;
  google: string;
  deepseek: string;
  ollama: string;
}

export const AI_MODELS: AIModel[] = [
  {
    id: 'openai',
    name: 'ChatGPT',
    color: 'chatgpt',
    position: { x: 'left-0', y: 'top-0' }
  },
  {
    id: 'claude',
    name: 'Claude',
    color: 'claude',
    position: { x: 'right-0', y: 'top-0' }
  },
  {
    id: 'gemini', 
    name: 'Gemini',
    color: 'gemini',
    position: { x: 'left-0', y: 'bottom-0' }
  },
  {
    id: 'deepseek',
    name: 'DeepSeek', 
    color: 'deepseek',
    position: { x: 'right-0', y: 'bottom-0' }
  },
  {
    id: 'llama',
    name: 'LLaMA',
    color: 'llama', 
    position: { x: 'left-1/2', y: 'bottom-0 transform -translate-x-1/2' }
  }
];