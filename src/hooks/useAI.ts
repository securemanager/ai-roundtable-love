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
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'No response';
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
        model: 'claude-3-sonnet-20240229',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.content[0]?.text || 'No response';
  };

  const callGemini = async (prompt: string, apiKey: string): Promise<string> => {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.7,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.candidates[0]?.content?.parts[0]?.text || 'No response';
  };

  const callGrok = async (prompt: string, apiKey: string): Promise<string> => {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-beta',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`Grok API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'No response';
  };

  const callLlama = async (prompt: string, baseUrl: string): Promise<string> => {
    const response = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama2',
        prompt: prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.response || 'No response';
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
        case 'claude':
          if (!apiKeys.anthropic) throw new Error('Anthropic API key is missing');
          content = await callClaude(prompt, apiKeys.anthropic);
          break;
        case 'gemini':
          if (!apiKeys.google) throw new Error('Google AI API key is missing');
          content = await callGemini(prompt, apiKeys.google);
          break;
        case 'grok':
          if (!apiKeys.xai) throw new Error('xAI API key is missing');
          content = await callGrok(prompt, apiKeys.xai);
          break;
        case 'llama':
          if (!apiKeys.ollama) throw new Error('Ollama URL is missing');
          content = await callLlama(prompt, apiKeys.ollama);
          break;
        default:
          throw new Error(`Unknown model: ${modelId}`);
      }

      updateResponse(modelId, { content, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      updateResponse(modelId, { 
        error: errorMessage, 
        isLoading: false,
        content: ''
      });
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
        isLoading: false
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
    // Reset responses
    setResponses({});
    setChatgptResponse({
      modelId: 'chatgpt',
      content: '',
      isLoading: false
    });

    // Call all models in parallel
    const modelPromises = ['claude', 'gemini', 'grok', 'llama'].map(modelId => 
      callModel(modelId, prompt)
    );

    // Wait for all models to complete
    await Promise.allSettled(modelPromises);

    // Generate summary after all models complete
    setTimeout(() => {
      generateSummary(prompt, responses);
    }, 1000);
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