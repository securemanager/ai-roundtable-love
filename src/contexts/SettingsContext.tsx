import React, { createContext, useContext, useState, useEffect } from 'react';
import { APIKeys } from '@/types/ai';

interface SettingsContextType {
  apiKeys: APIKeys;
  updateApiKey: (model: keyof APIKeys, key: string) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKeys, setApiKeys] = useState<APIKeys>({
    openai: '',
    anthropic: '',
    google: '',
    deepseek: '',
    ollama: ''
  });

  // Load API keys from localStorage on mount
  useEffect(() => {
    const savedKeys = localStorage.getItem('ai-roundtable-keys');
    if (savedKeys) {
      try {
        setApiKeys(JSON.parse(savedKeys));
      } catch (error) {
        console.error('Failed to parse saved API keys:', error);
      }
    }
  }, []);

  // Save API keys to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('ai-roundtable-keys', JSON.stringify(apiKeys));
  }, [apiKeys]);

  const updateApiKey = (model: keyof APIKeys, key: string) => {
    setApiKeys(prev => ({
      ...prev,
      [model]: key
    }));
  };

  return (
    <SettingsContext.Provider value={{
      apiKeys,
      updateApiKey,
      isSettingsOpen,
      setIsSettingsOpen
    }}>
      {children}
    </SettingsContext.Provider>
  );
};