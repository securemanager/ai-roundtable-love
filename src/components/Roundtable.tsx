import React from 'react';
import { ModelCard } from './ModelCard';
import { AI_MODELS } from '@/types/ai';
import { AIResponse } from '@/types/ai';

interface RoundtableProps {
  responses: Record<string, AIResponse>;
  chatgptResponse: AIResponse;
  onRefresh: (modelId: string) => void;
}

export const Roundtable: React.FC<RoundtableProps> = ({ 
  responses, 
  chatgptResponse, 
  onRefresh 
}) => {
  const chatgptModel = {
    id: 'chatgpt',
    name: 'ChatGPT Summary',
    color: 'chatgpt',
    position: { x: '', y: '' }
  };

  return (
    <div className="roundtable-container">
      {/* Center card - ChatGPT Summary */}
      <ModelCard
        model={chatgptModel}
        response={chatgptResponse}
        onRefresh={onRefresh}
        isCenter={true}
      />
      
      {/* Surrounding model cards */}
      {AI_MODELS.map((model) => (
        <ModelCard
          key={model.id}
          model={model}
          response={responses[model.id] || { modelId: model.id, content: '', isLoading: false }}
          onRefresh={onRefresh}
        />
      ))}
    </div>
  );
};