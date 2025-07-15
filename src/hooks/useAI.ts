import { useState } from 'react';
import { AIResponse } from '@/types/ai';
import { useSettings } from '@/contexts/SettingsContext';

export const useAI = () => {
  const [responses, setResponses] = useState<Record<string, AIResponse>>({});
  const [chatgptResponse, setChatgptResponse] = useState<AIResponse>({
    modelId: 'chatgpt',
    content: '',
    isLoading: false
  });
  const { apiKeys } = useSettings();

  const callOpenAI = async (prompt: string, apiKey: string): Promise<string> => {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData?.error?.message || `OpenAI API returned ${response.status} ${response.statusText}`;
      throw new Error(`OpenAI Error: ${errorMessage}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'No response received';
  };

  const callClaude = async (prompt: string, apiKey: string): Promise<string> => {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData?.error?.message || `Claude API returned ${response.status} ${response.statusText}`;
      throw new Error(`Claude Error: ${errorMessage}`);
    }

    const data = await response.json();
    return data.content[0]?.text || 'No response received';
  };

  const callGemini = async (prompt: string, apiKey: string): Promise<string> => {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 500, temperature: 0.7 },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData?.error?.message || `Gemini API returned ${response.status} ${response.statusText}`;
      throw new Error(`Gemini Error: ${errorMessage}`);
    }

    const data = await response.json();
    return data.candidates[0]?.content?.parts[0]?.text || 'No response received';
  };

  const callDeepSeek = async (prompt: string, apiKey: string): Promise<string> => {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData?.error?.message || `DeepSeek API returned ${response.status} ${response.statusText}`;
      throw new Error(`DeepSeek Error: ${errorMessage}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'No response received';
  };

  const callLlama = async (prompt: string, baseUrl: string): Promise<string> => {
    const cleanUrl = baseUrl.replace(/\/$/, '');
    const response = await fetch(`${cleanUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'llama2', prompt, stream: false }),
    });

    if (!response.ok) {
      if (response.status === 0 || !response.status) {
        throw new Error('Ollama Error: Cannot connect to Ollama. Make sure Ollama is running and accessible.');
      }
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData?.error || `Ollama returned ${response.status} ${response.statusText}`;
      throw new Error(`Ollama Error: ${errorMessage}`);
    }

    const data = await response.json();
    return data.response || 'No response received';
  };

  const updateResponse = (modelId: string, update: Partial<AIResponse>) => {
    setResponses(prev => ({
      ...prev,
      [modelId]: {
        ...prev[modelId],
        ...update,
        modelId
      }
    }));
  };

  const callModel = async (modelId: string, prompt: string) => {
    updateResponse(modelId, { isLoading: true, error: undefined });

    try {
      let content = '';

      switch (modelId) {
        case 'openai':
          if (!apiKeys.openai) throw new Error('Missing API key for ChatGPT. Please add your OpenAI API key in Settings.');
          content = await callOpenAI(prompt, apiKeys.openai);
          break;
        case 'claude':
          if (!apiKeys.anthropic) throw new Error('Missing API key for Claude. Please add your Anthropic API key in Settings.');
          if (!apiKeys.anthropic.startsWith('sk-ant-')) throw new Error('Invalid Anthropic API key format. Key should start with "sk-ant-"');
          content = await callClaude(prompt, apiKeys.anthropic);
          break;
        case 'gemini':
          if (!apiKeys.google) throw new Error('Missing API key for Gemini. Please add your Google AI API key in Settings.');
          content = await callGemini(prompt, apiKeys.google);
          break;
        case 'deepseek':
          if (!apiKeys.deepseek) throw new Error('Missing API key for DeepSeek. Please add your DeepSeek API key in Settings.');
          content = await callDeepSeek(prompt, apiKeys.deepseek);
          break;
        case 'llama':
          if (!apiKeys.ollama) throw new Error('Missing Ollama URL. Please add your Ollama server URL in Settings.');
          content = await callLlama(prompt, apiKeys.ollama);
          break;
        default:
          throw new Error(`Unknown model: ${modelId}`);
      }

      updateResponse(modelId, { content, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      updateResponse(modelId, { error: errorMessage, isLoading: false, content: '' });
    }
  };

  const generateSummary = async (prompt: string, modelResponses: Record<string, AIResponse>) => {
    if (!apiKeys.openai) {
      setChatgptResponse({
        modelId: 'chatgpt',
        content: '',
        isLoading: false,
        error: 'OpenAI API key is missing'
      });
      return;
    }

    setChatgptResponse(prev => ({ ...prev, isLoading: true, error: undefined }));

    try {
      const validResponses = Object.entries(modelResponses)
        .filter(([_, response]) => response.content && !response.error)
        .map(([modelId, response]) => `${modelId.toUpperCase()}: ${response.content}`)
        .join('\n\n');

      if (!validResponses.trim()) {
        setChatgptResponse({
          modelId: 'chatgpt',
          content: '',
          isLoading: false,
          error: 'هیچ پاسخی از مدل‌های دیگر دریافت نشد، بنابراین خلاصه‌ای نمی‌توان ساخت.'
        });
        return;
      }

      const summaryPrompt = `
Original question: "${prompt}"

Here are responses from different AI models:
${validResponses}

Please provide a concise summary that synthesizes the key insights from these responses. Focus on the most important points and any notable differences or agreements between the models.
      `;

      const content = await callOpenAI(summaryPrompt, apiKeys.openai);
      setChatgptResponse({
        modelId: 'chatgpt',
        content,
        isLoading: false,
        error: undefined
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate summary';
      setChatgptResponse({
        modelId: 'chatgpt',
        content: '',
        isLoading: false,
        error: errorMessage
      });
    }
  };

  const submitPrompt = async (prompt: string) => {
    setResponses({});
    setChatgptResponse({ modelId: 'chatgpt', content: '', isLoading: false });

    const modelIds = ['openai', 'claude', 'gemini', 'deepseek', 'llama'];
    const promises = modelIds.map(async (modelId) => {
      try {
        await callModel(modelId, prompt);
      } catch (error) {
        console.error(`Error calling ${modelId}:`, error);
      }
    });

    await Promise.allSettled(promises);

    setTimeout(() => {
      setResponses(currentResponses => {
        generateSummary(prompt, currentResponses);
        return currentResponses;
      });
    }, 500);
  };

  const refreshModel = (modelId: string, prompt: string) => {
    if (modelId === 'chatgpt') {
      generateSummary(prompt, responses);
    } else {
      callModel(modelId, prompt);
    }
  };

  return {
    responses,
    chatgptResponse,
    submitPrompt,
    refreshModel,
    isLoading: Object.values(responses).some(r => r.isLoading) || chatgptResponse.isLoading
  };
};
