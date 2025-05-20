
import React, { useState, useEffect } from 'react';
import { Bot, HelpCircle, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const AssistantHelper = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentTip, setCurrentTip] = useState(0);
  
  const tips = [
    "Welcome to the Agent Creation page! Here you can create various AI agents for different purposes.",
    "For automation tasks, Claude is recommended for complex reasoning and code generation.",
    "When creating chatbots, consider using a voice provider like ElevenLabs for a more engaging experience.",
    "You can customize your agent's system prompt to define its personality and specific capabilities.",
    "Need help? Click anywhere on this assistant card for more tips!"
  ];
  
  useEffect(() => {
    // Show assistant after a short delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleNextTip = () => {
    setCurrentTip((prev) => (prev + 1) % tips.length);
  };
  
  if (!isVisible) return null;
  
  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="border-primary shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              <span className="font-semibold">AI Assistant</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-6 w-6" 
              onClick={() => setIsVisible(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div 
            className="text-sm mb-2 min-h-[60px] cursor-pointer" 
            onClick={handleNextTip}
          >
            {tips[currentTip]}
          </div>
          
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <HelpCircle className="h-3 w-3" />
              Click for more tips
            </span>
            <span>{currentTip + 1}/{tips.length}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssistantHelper;
