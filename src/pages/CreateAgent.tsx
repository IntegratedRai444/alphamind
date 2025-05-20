import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createAgent, fetchAvailableVoices, CLAUDE_API_KEY, ELEVENLABS_API_KEY } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Bot, BotIcon, Brain, Code, Globe, MessageCircle, Mic, RefreshCw, Wand2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateAgentRequest } from "@/types/agent";
import AssistantHelper from "@/components/AssistantHelper";
import DeveloperCard from "@/components/DeveloperCard";

// Agent template types
type AgentTemplate = {
  name: string;
  role: string;
  icon: React.ReactNode;
  description: string;
  systemPrompt: string;
  category: string;
  recommendedModel: "claude" | "openai";
  recommendedVoice: boolean;
};

const CreateAgent = () => {
  const navigate = useNavigate();
  
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [llmProvider, setLlmProvider] = useState<"claude" | "openai">("claude");
  const [llmModel, setLlmModel] = useState("");
  const [voiceProvider, setVoiceProvider] = useState<"" | "elevenlabs" | "openai">("");
  const [voiceId, setVoiceId] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<AgentTemplate | null>(null);
  const [activeTab, setActiveTab] = useState("templates");
  const [apiKeyPromptShown, setApiKeyPromptShown] = useState(false);
  
  // Template categories
  const categories = [
    { id: "automation", name: "Automation", icon: <Code className="h-5 w-5" /> },
    { id: "assistant", name: "AI Assistant", icon: <Bot className="h-5 w-5" /> },
    { id: "chatbot", name: "Chatbots", icon: <MessageCircle className="h-5 w-5" /> },
    { id: "creative", name: "Creative", icon: <Wand2 className="h-5 w-5" /> },
  ];

  // Agent templates
  const agentTemplates: AgentTemplate[] = [
    {
      name: "Automation Assistant",
      role: "Automation Expert",
      icon: <RefreshCw className="h-5 w-5" />,
      description: "Create an agent specialized in task automation and workflow optimization",
      systemPrompt: "You are an AI assistant specialized in helping users automate tasks and optimize workflows. You can provide guidance on automating repetitive tasks, suggest workflow improvements, and help with creating automation scripts when needed. Your expertise includes understanding process inefficiencies and recommending the best automation tools.",
      category: "automation",
      recommendedModel: "claude",
      recommendedVoice: false,
    },
    {
      name: "Code Generator",
      role: "Programming Assistant",
      icon: <Code className="h-5 w-5" />,
      description: "Generate well-structured, documented code in various programming languages",
      systemPrompt: "You are a programming assistant that specializes in generating clean, well-documented, and efficient code. You can write code in multiple programming languages and explain your approach. When generating code, you should follow best practices for the language, provide comments where necessary, and offer explanations of how the code works.",
      category: "automation",
      recommendedModel: "claude",
      recommendedVoice: false,
    },
    {
      name: "Personal Assistant",
      role: "Personal AI Assistant",
      icon: <Bot className="h-5 w-5" />,
      description: "General purpose personal assistant for everyday tasks and questions",
      systemPrompt: "You are a helpful, friendly personal assistant. Your goal is to help the user with everyday tasks, answer questions, provide information, and assist with planning and organization. You should be conversational, proactive, and attentive to the user's needs.",
      category: "assistant",
      recommendedModel: "claude",
      recommendedVoice: true,
    },
    {
      name: "Research Assistant",
      role: "Research Specialist",
      icon: <Brain className="h-5 w-5" />,
      description: "Help with conducting research, summarizing information, and analyzing data",
      systemPrompt: "You are a research assistant AI specialized in helping users find information, analyze data, summarize content, and explore topics in depth. You should present information in an organized way, cite sources when possible, and help users understand complex topics through clear explanations.",
      category: "assistant",
      recommendedModel: "claude",
      recommendedVoice: false,
    },
    {
      name: "Customer Support Bot",
      role: "Customer Service Agent",
      icon: <MessageCircle className="h-5 w-5" />,
      description: "Friendly chatbot designed to handle customer inquiries and support",
      systemPrompt: "You are a customer support chatbot. Your goal is to provide helpful, friendly assistance to customers. You should answer questions about products or services, help troubleshoot issues, and provide a positive customer experience. When you don't know an answer, acknowledge it and suggest how the customer can get further help.",
      category: "chatbot",
      recommendedModel: "openai",
      recommendedVoice: true,
    },
    {
      name: "Multilingual Chatbot",
      role: "Language Translator & Assistant",
      icon: <Globe className="h-5 w-5" />,
      description: "Chat assistant capable of communicating in multiple languages",
      systemPrompt: "You are a multilingual chatbot capable of communicating fluently in many languages. You can detect the language the user is typing in and respond in the same language. You can also translate text between languages when requested. Your goal is to break down language barriers and facilitate communication.",
      category: "chatbot",
      recommendedModel: "claude",
      recommendedVoice: true,
    },
    {
      name: "Creative Writing Assistant",
      role: "Creative Writer",
      icon: <Wand2 className="h-5 w-5" />,
      description: "Help with creative writing, story development, and content creation",
      systemPrompt: "You are a creative writing assistant. You can help generate creative content, develop story ideas, provide feedback on writing, and assist with the creative process. Your style should be imaginative and adaptable to different genres and tones. You should encourage creativity while providing constructive guidance.",
      category: "creative",
      recommendedModel: "claude",
      recommendedVoice: false,
    },
    {
      name: "Voice Narrator",
      role: "Storytelling Voice",
      icon: <Mic className="h-5 w-5" />,
      description: "An agent designed specifically for voice narration and audio content",
      systemPrompt: "You are a voice narration specialist. Your responses should be crafted for pleasant audio delivery with appropriate pacing, clear pronunciation, and engaging tone. You excel at storytelling, narration, and creating content meant to be heard rather than read. Use natural language patterns and avoid complex structures that might be difficult to follow when spoken.",
      category: "creative",
      recommendedModel: "openai",
      recommendedVoice: true,
    }
  ];
  
  const { data: claudeVoices, isLoading: isLoadingClaudeVoices } = useQuery({
    queryKey: ["elevenlabs-voices"],
    queryFn: () => fetchAvailableVoices("elevenlabs"),
    enabled: voiceProvider === "elevenlabs" && ELEVENLABS_API_KEY !== "",
  });
  
  const { data: openaiVoices, isLoading: isLoadingOpenAiVoices } = useQuery({
    queryKey: ["openai-voices"],
    queryFn: () => fetchAvailableVoices("openai"),
    enabled: voiceProvider === "openai",
  });
  
  const createAgentMutation = useMutation({
    mutationFn: createAgent,
    onSuccess: (data) => {
      toast.success(`Agent "${data.name}" created successfully!`);
      navigate(`/agent/${data.agent_id}`);
    },
    onError: (error) => {
      toast.error(`Failed to create agent: ${error.message}`);
    },
  });
  
  // Check if API keys are set
  useEffect(() => {
    if (!CLAUDE_API_KEY && !apiKeyPromptShown) {
      toast.warning("Claude API key not set", {
        description: "Please set your Claude API key in the AI Assistant panel",
        duration: 5000,
      });
      setApiKeyPromptShown(true);
    }
  }, [apiKeyPromptShown]);
  
  const handleTemplateSelect = (template: AgentTemplate) => {
    setSelectedTemplate(template);
    setName(template.name);
    setRole(template.role);
    setSystemPrompt(template.systemPrompt);
    setLlmProvider(template.recommendedModel);
    
    // Set default model based on provider
    if (template.recommendedModel === "claude") {
      setLlmModel("claude-3-opus-20240229");
    } else {
      setLlmModel("gpt-4-turbo-preview");
    }
    
    // Set voice if recommended
    if (template.recommendedVoice) {
      setVoiceProvider(template.recommendedModel === "claude" ? "elevenlabs" : "openai");
    } else {
      setVoiceProvider("");
      setVoiceId("");
    }
    
    setActiveTab("customize");
  };
  
  const handleCreateAgent = async () => {
    if (!name) {
      toast.error("Please enter an agent name");
      return;
    }
    
    if (!role) {
      toast.error("Please enter an agent role");
      return;
    }
    
    if (!llmProvider) {
      toast.error("Please select an LLM provider");
      return;
    }
    
    if (!llmModel) {
      toast.error("Please select an LLM model");
      return;
    }
    
    // Check if Claude API key is set when using Claude
    if (llmProvider === "claude" && !CLAUDE_API_KEY) {
      toast.error("Claude API key is not set", {
        description: "Please set your Claude API key in the AI Assistant panel",
      });
      return;
    }
    
    // Check if ElevenLabs API key is set when using ElevenLabs voice
    if (voiceProvider === "elevenlabs" && !ELEVENLABS_API_KEY) {
      toast.error("ElevenLabs API key is not set", {
        description: "Please set your ElevenLabs API key in the AI Assistant panel",
      });
      return;
    }
    
    const agentData: CreateAgentRequest = {
      name,
      role,
      llm_provider: llmProvider,
      llm_model: llmModel,
      system_prompt: systemPrompt || undefined,
      voice_provider: voiceProvider || undefined,
      voice_id: voiceId || undefined,
    };
    
    createAgentMutation.mutate(agentData);
  };
  
  const getFilteredTemplates = (category: string) => {
    return agentTemplates.filter(template => template.category === category);
  };

  // Fixed type error by providing a correct handler for onValueChange
  const handleVoiceProviderChange = (value: string) => {
    // Type assertion to ensure value matches the state type
    setVoiceProvider(value as "" | "elevenlabs" | "openai");
    
    // Reset voice ID when provider changes
    setVoiceId("");
    
    // Check if ElevenLabs API key is set when selecting that provider
    if (value === "elevenlabs" && !ELEVENLABS_API_KEY) {
      toast.warning("ElevenLabs API key not set", {
        description: "Please set your ElevenLabs API key in the AI Assistant panel",
        duration: 5000,
      });
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Button 
        variant="outline" 
        size="sm" 
        className="mb-4" 
        onClick={() => navigate("/")}
      >
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
      </Button>
      
      <h1 className="text-3xl font-bold mb-2">Create New AI Agent</h1>
      <p className="text-gray-500 mb-8">Configure your AI agent for specific tasks and capabilities</p>
      
      <Tabs 
        defaultValue="templates" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="templates">
            <Bot className="h-4 w-4 mr-2" /> Choose Template
          </TabsTrigger>
          <TabsTrigger value="customize">
            <BotIcon className="h-4 w-4 mr-2" /> Customize Agent
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Card key={category.id} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 pb-2">
                  <div className="flex items-center gap-2">
                    {category.icon}
                    <CardTitle>{category.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {getFilteredTemplates(category.id).map((template) => (
                      <div 
                        key={template.name}
                        className="flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={() => handleTemplateSelect(template)}
                      >
                        <div className="rounded-full bg-primary/10 p-2">
                          {template.icon}
                        </div>
                        <div>
                          <h3 className="font-medium">{template.name}</h3>
                          <p className="text-sm text-gray-500">{template.description}</p>
                          <div className="flex gap-2 mt-1">
                            <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full">
                              {template.recommendedModel === "claude" ? "Claude" : "OpenAI"}
                            </span>
                            {template.recommendedVoice && (
                              <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-0.5 rounded-full">
                                Voice Enabled
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="customize">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Agent Configuration</CardTitle>
                  <CardDescription>
                    Define your agent's basic information and capabilities
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Agent Name</Label>
                    <Input 
                      id="name" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      placeholder="E.g., Research Assistant"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="role">Agent Role</Label>
                    <Input 
                      id="role" 
                      value={role} 
                      onChange={(e) => setRole(e.target.value)} 
                      placeholder="E.g., Research Specialist"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="llm-provider">LLM Provider</Label>
                    <RadioGroup 
                      value={llmProvider} 
                      onValueChange={(value) => setLlmProvider(value as "claude" | "openai")}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="claude" id="claude" />
                        <Label htmlFor="claude">Claude (Recommended for automation)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="openai" id="openai" />
                        <Label htmlFor="openai">OpenAI</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="llm-model">LLM Model</Label>
                    <Select value={llmModel} onValueChange={setLlmModel}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        {llmProvider === "claude" ? (
                          <>
                            <SelectItem value="claude-3-opus-20240229">Claude 3 Opus (Most powerful)</SelectItem>
                            <SelectItem value="claude-3-sonnet-20240229">Claude 3 Sonnet (Balanced)</SelectItem>
                            <SelectItem value="claude-3-haiku-20240307">Claude 3 Haiku (Fastest)</SelectItem>
                          </>
                        ) : (
                          <>
                            <SelectItem value="gpt-4-turbo-preview">GPT-4 Turbo (Most powerful)</SelectItem>
                            <SelectItem value="gpt-4">GPT-4</SelectItem>
                            <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo (Fastest)</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Agent Capabilities</CardTitle>
                  <CardDescription>
                    Define your agent's personality and voice capabilities
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="system-prompt">System Prompt</Label>
                    <Textarea 
                      id="system-prompt" 
                      value={systemPrompt} 
                      onChange={(e) => setSystemPrompt(e.target.value)}
                      placeholder="Define your agent's personality, role, and behavior..."
                      className="min-h-[150px]"
                    />
                    <p className="text-xs text-gray-500">
                      This defines your agent's personality, capabilities, and constraints.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="voice-provider">Voice Provider (Optional)</Label>
                    <Select 
                      value={voiceProvider} 
                      onValueChange={handleVoiceProviderChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="No voice" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No voice</SelectItem>
                        <SelectItem value="elevenlabs">ElevenLabs</SelectItem>
                        <SelectItem value="openai">OpenAI</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {voiceProvider && (
                    <div className="space-y-2">
                      <Label htmlFor="voice-id">Voice</Label>
                      <Select 
                        value={voiceId} 
                        onValueChange={setVoiceId} 
                        disabled={isLoadingClaudeVoices || isLoadingOpenAiVoices}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select voice" />
                        </SelectTrigger>
                        <SelectContent>
                          {voiceProvider === "elevenlabs" ? (
                            claudeVoices?.voices?.map(voice => (
                              <SelectItem key={voice.voice_id} value={voice.voice_id}>
                                {voice.name}
                              </SelectItem>
                            ))
                          ) : (
                            openaiVoices?.voices?.map(voice => (
                              <SelectItem key={voice.voice_id} value={voice.voice_id}>
                                {voice.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500">
                        {isLoadingClaudeVoices || isLoadingOpenAiVoices ? 
                          "Loading available voices..." : 
                          "Select a voice for your agent's responses"
                        }
                      </p>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={handleCreateAgent}
                    disabled={createAgentMutation.isPending}
                    className="w-full"
                  >
                    {createAgentMutation.isPending ? "Creating..." : "Create Agent"}
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Developer Card */}
              <DeveloperCard />
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Assistant Helper */}
      <AssistantHelper />
    </div>
  );
};

export default CreateAgent;
