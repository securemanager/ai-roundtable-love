import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useSettings } from '@/contexts/SettingsContext';

export const SettingsPanel: React.FC = () => {
  const { apiKeys, updateApiKey, isSettingsOpen, setIsSettingsOpen } = useSettings();

  const modelConfigs = [
    { key: 'openai' as const, label: 'OpenAI API Key', placeholder: 'sk-...' },
    { key: 'anthropic' as const, label: 'Anthropic API Key', placeholder: 'sk-ant-...' },
    { key: 'google' as const, label: 'Google AI API Key', placeholder: 'AI...' },
    { key: 'deepseek' as const, label: 'DeepSeek API Key', placeholder: 'sk-...' },
    { key: 'ollama' as const, label: 'Ollama URL', placeholder: 'http://localhost:11434' }
  ];

  return (
    <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
      <SheetContent className="bg-card border-border">
        <SheetHeader>
          <SheetTitle className="text-foreground">API Settings</SheetTitle>
          <SheetDescription className="text-muted-foreground">
            Enter your API keys to enable AI model responses. Keys are stored locally in your browser.
          </SheetDescription>
        </SheetHeader>
        
        <div className="space-y-6 mt-6">
          {modelConfigs.map(({ key, label, placeholder }) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={key} className="text-foreground font-medium">
                {label}
              </Label>
              <Input
                id={key}
                type="password"
                value={apiKeys[key]}
                onChange={(e) => updateApiKey(key, e.target.value)}
                placeholder={placeholder}
                className="bg-input border-border text-foreground"
              />
            </div>
          ))}
          
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Your API keys are stored locally and never sent to our servers. 
              They are only used to make direct API calls to the respective AI services.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};