import React, { useState } from 'react';
import { PromptInput } from '@/components/PromptInput';
import { Roundtable } from '@/components/Roundtable';
import { SettingsPanel } from '@/components/SettingsPanel';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { useAI } from '@/hooks/useAI';

const IndexContent: React.FC = () => {
  const [currentPrompt, setCurrentPrompt] = useState('');
  const { responses, chatgptResponse, submitPrompt, refreshModel, isLoading } = useAI();

  const handleSubmit = async (prompt: string) => {
    setCurrentPrompt(prompt);
    await submitPrompt(prompt);
  };

  const handleRefresh = (modelId: string) => {
    if (currentPrompt) {
      refreshModel(modelId, currentPrompt);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gradient mb-4">
            AI Roundtable
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Compare responses from multiple AI models in one place. 
            Get diverse perspectives and find the best answers.
          </p>
        </div>

        {/* Prompt Input */}
        <PromptInput onSubmit={handleSubmit} isLoading={isLoading} />

        {/* Roundtable Layout */}
        <div className="mt-12">
          <Roundtable
            responses={responses}
            chatgptResponse={chatgptResponse}
            onRefresh={handleRefresh}
          />
        </div>

        {/* Settings Panel */}
        <SettingsPanel />
      </div>
    </div>
  );
};

const Index: React.FC = () => {
  return (
    <SettingsProvider>
      <IndexContent />
    </SettingsProvider>
  );
};

export default Index;
