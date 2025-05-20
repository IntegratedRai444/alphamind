
import React, { useState, useEffect } from 'react';
import { Bot, HelpCircle, X, Server, MessageCircle, Code, Wand2, Mic } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useLocation } from "react-router-dom";
import { CLAUDE_API_KEY, ELEVENLABS_API_KEY, setClaudeApiKey, setElevenLabsApiKey } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AssistantHelper = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentTip, setCurrentTip] = useState(0);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [apiKey, setApiKey] = useState(CLAUDE_API_KEY);
  const [elevenLabsKey, setElevenLabsKey] = useState(ELEVENLABS_API_KEY);
  const [activeApiTab, setActiveApiTab] = useState<"claude" | "elevenlabs">("claude");
  const location = useLocation();
  
  // Tips based on the current route
  const homeTips = [
    "Welcome to the Advanced MCP Dashboard! Here you can create and manage your AI agents powered by Claude and OpenAI.",
    "Start by connecting to your MCP Server using the Settings button in the top right corner.",
    "To create your first AI agent, click on the 'Create Agent' button and select a template.",
    "Claude is recommended for automation tasks due to its excellent reasoning capabilities.",
    "For chatbots that require voice, ElevenLabs provides high-quality voice synthesis options."
  ];
  
  const createAgentTips = [
    "Welcome to the Agent Creation page! Here you can create various AI agents for different purposes.",
    "Start by selecting a template that matches your needs, or customize an agent from scratch.",
    "For automation tasks, Claude is recommended for complex reasoning and code generation.",
    "When creating chatbots, consider using a voice provider like ElevenLabs for a more engaging experience.",
    "You can customize your agent's system prompt to define its personality and specific capabilities."
  ];
  
  const chatTips = [
    "You're now chatting with your AI agent! Type a message to start the conversation.",
    "If you've configured a voice provider, you can hear your agent's responses by clicking the speaker icon.",
    "Your chat history is stored with the agent, so you can continue conversations later.",
    "You can create multiple agents with different personalities and capabilities to help with various tasks.",
    "The agent will respond based on its system prompt and the models you've selected."
  ];
  
  // Select tips based on current route
  const getTipsForRoute = () => {
    if (location.pathname.includes('/agent/')) {
      return chatTips;
    } else if (location.pathname.includes('/create-agent')) {
      return createAgentTips;
    } else {
      return homeTips;
    }
  };
  
  const tips = getTipsForRoute();
  
  useEffect(() => {
    // Show assistant after a short delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1500);
    
    // Reset current tip when route changes
    setCurrentTip(0);
    
    return () => clearTimeout(timer);
  }, [location.pathname]);
  
  const handleNextTip = () => {
    setCurrentTip((prev) => (prev + 1) % tips.length);
  };
  
  const handleConnectToServer = () => {
    setShowApiKeyDialog(true);
  };
  
  const handleSaveApiKeys = () => {
    if (activeApiTab === "claude") {
      setClaudeApiKey(apiKey);
      toast.success("Claude API Key saved successfully!", {
        description: "Your API key has been saved and will be used for all agent interactions",
        duration: 5000
      });
    } else {
      setElevenLabsApiKey(elevenLabsKey);
      toast.success("ElevenLabs API Key saved successfully!", {
        description: "Your API key has been saved and will be used for voice synthesis",
        duration: 5000
      });
    }
    
    setShowApiKeyDialog(false);
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
            className="text-sm mb-3 min-h-[60px] cursor-pointer" 
            onClick={handleNextTip}
          >
            {tips[currentTip]}
          </div>
          
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 flex items-center gap-2"
                onClick={handleConnectToServer}
              >
                <Server className="h-4 w-4" />
                Connect to Claude
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 flex items-center gap-2"
                onClick={() => {
                  setActiveApiTab("elevenlabs");
                  setShowApiKeyDialog(true);
                }}
              >
                <Mic className="h-4 w-4" />
                Set Voice API
              </Button>
            </div>
            
            <div className="flex justify-between items-center text-xs text-muted-foreground mt-2">
              <span className="flex items-center gap-1">
                <HelpCircle className="h-3 w-3" />
                Click for more tips
              </span>
              <span>{currentTip + 1}/{tips.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
        <DialogContent>
          <Tabs value={activeApiTab} onValueChange={(value) => setActiveApiTab(value as "claude" | "elevenlabs")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="claude">
                <Server className="h-4 w-4 mr-2" /> Claude API
              </TabsTrigger>
              <TabsTrigger value="elevenlabs">
                <Mic className="h-4 w-4 mr-2" /> Voice API
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="claude">
              <DialogHeader>
                <DialogTitle>Connect to Claude</DialogTitle>
                <DialogDescription>
                  Enter your Anthropic Claude API key to use with your agents.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="apiKey">Claude API Key</Label>
                  <Input
                    id="apiKey"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-ant-api03-..."
                    type="password"
                  />
                  <p className="text-xs text-gray-500">
                    Your API key is stored locally in your browser and is only sent to the MCP server.
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="elevenlabs">
              <DialogHeader>
                <DialogTitle>Set ElevenLabs Voice API</DialogTitle>
                <DialogDescription>
                  Enter your ElevenLabs API key to enable voice synthesis for your agents.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="elevenLabsKey">ElevenLabs API Key</Label>
                  <Input
                    id="elevenLabsKey"
                    value={elevenLabsKey}
                    onChange={(e) => setElevenLabsKey(e.target.value)}
                    placeholder="sk_..."
                    type="password"
                  />
                  <p className="text-xs text-gray-500">
                    Your API key is stored locally in your browser and is used for voice synthesis.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApiKeyDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveApiKeys}>
              Save API Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssistantHelper;
