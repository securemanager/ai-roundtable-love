import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, RefreshCw, AlertCircle } from 'lucide-react';
import { AIModel, AIResponse } from '@/types/ai';
import { useToast } from '@/hooks/use-toast';

interface ModelCardProps {
  model: AIModel;
  response: AIResponse;
  onRefresh: (modelId: string) => void;
  isCenter?: boolean;
}

export const ModelCard: React.FC<ModelCardProps> = ({ 
  model, 
  response, 
  onRefresh, 
  isCenter = false 
}) => {
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(response.content);
      toast({
        title: "Copied!",
        description: `${model.name} response copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const getCardClasses = () => {
    const baseClasses = isCenter 
      ? "center-card animate-scale-in" 
      : `model-card card-${model.color} animate-fade-in-up ${model.position.x} ${model.position.y}`;
    
    return baseClasses;
  };

  return (
    <Card className={getCardClasses()}>
      <CardHeader className="pb-3">
        <CardTitle className={`text-lg font-semibold text-${model.color} flex items-center justify-between`}>
          {model.name}
          {!isCenter && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRefresh(model.id)}
              disabled={response.isLoading}
              className="h-6 w-6"
            >
              <RefreshCw className={`w-3 h-3 ${response.isLoading ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {response.error ? (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-destructive" />
            <div className="text-sm text-destructive">
              <p className="font-medium">Error</p>
              <p>{response.error}</p>
            </div>
          </div>
        ) : response.isLoading ? (
          <div className="space-y-2">
            <div className="animate-pulse">
              <div className="h-3 bg-muted rounded w-full mb-2"></div>
              <div className="h-3 bg-muted rounded w-4/5 mb-2"></div>
              <div className="h-3 bg-muted rounded w-3/5"></div>
            </div>
          </div>
        ) : response.content ? (
          <>
            <div className="text-sm text-foreground leading-relaxed max-h-32 overflow-y-auto">
              {response.content}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="w-full border-border hover:bg-accent"
            >
              <Copy className="w-3 h-3 mr-2" />
              Copy
            </Button>
          </>
        ) : (
          <div className="text-sm text-muted-foreground text-center py-4">
            {isCenter ? "Send a prompt to see the summary" : "Waiting for response..."}
          </div>
        )}
      </CardContent>
    </Card>
  );
};