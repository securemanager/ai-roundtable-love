import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Settings } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
}

export const PromptInput: React.FC<PromptInputProps> = ({ onSubmit, isLoading }) => {
  const [prompt, setPrompt] = useState('');
  const { setIsSettingsOpen } = useSettings();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      onSubmit(prompt.trim());
      setPrompt('');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <div className="flex items-center gap-4">
        <form onSubmit={handleSubmit} className="flex-1 flex gap-2">
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask anything to compare AI models..."
            className="flex-1 bg-input border-border text-foreground"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            disabled={!prompt.trim() || isLoading}
            className="px-6"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsSettingsOpen(true)}
          className="border-border hover:bg-accent"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};