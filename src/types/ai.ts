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
    id: 'claude',
    name: 'Claude',
    color: 'claude',
    position: { x: 'left-0', y: 'top-0' }
  },
  {
    id: 'gemini', 
    name: 'Gemini',
    color: 'gemini',
    position: { x: 'right-0', y: 'top-0' }
  },
  {
    id: 'deepseek',
    name: 'DeepSeek', 
    color: 'deepseek',
    position: { x: 'left-0', y: 'bottom-0' }
  },
  {
    id: 'llama',
    name: 'LLaMA',
    color: 'llama', 
    position: { x: 'right-0', y: 'bottom-0' }
  }
];