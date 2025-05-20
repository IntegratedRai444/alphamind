import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { ArrowLeft, RefreshCw, Send, Trash, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Agent, Message } from "@/types/agent";
import { clearAgentMemory, fetchAgent, fetchAgentMemory, getVoiceUrl, runTask } from "@/lib/api";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const AgentChat = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [enableVoice, setEnableVoice] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Load agent and message history
  useEffect(() => {
    const loadAgentData = async () => {
      if (!agentId) return;
      
      try {
        setLoading(true);
        // Fetch agent details
        const agentData = await fetchAgent(agentId);
        setAgent(agentData);
        
        // Enable voice by default if agent has voice configuration
        if (agentData.voice_provider && agentData.voice_id) {
          setEnableVoice(true);
        }
        
        // Fetch message history
        const memoryData = await fetchAgentMemory(agentId);
        setMessages(memoryData.memory);
      } catch (error) {
        console.error("Failed to load agent data:", error);
        toast.error("Failed to load agent data. Returning to home page.");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    
    loadAgentData();
  }, [agentId, navigate]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle audio playback when it changes
  useEffect(() => {
    if (audioRef.current && currentAudio) {
      audioRef.current.play().catch(error => {
        console.error("Failed to play audio:", error);
      });
    }
  }, [currentAudio]);

  const handleSendMessage = async () => {
    if (!prompt.trim() || !agentId || !agent) return;
    
    const userMessage: Message = {
      role: "user",
      content: prompt,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setPrompt("");
    setSendingMessage(true);
    
    try {
      const response = await runTask({
        agent_id: agentId,
        prompt: prompt.trim(),
        voice_output: enableVoice && !!agent.voice_provider,
        max_tokens: 1024,
        temperature: 0.7
      });
      
      const assistantMessage: Message = {
        role: "assistant",
        content: response.response,
        timestamp: response.timestamp
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Handle voice if available
      if (response.voice_url) {
        setCurrentAudio(getVoiceUrl(response.voice_url));
      }
      
    } catch (error) {
      console.error("Failed to get response:", error);
      toast.error("Failed to get a response from the agent.");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleClearMemory = async () => {
    if (!agentId) return;
    
    try {
      await clearAgentMemory(agentId);
      // Keep only system messages
      const systemMessages = messages.filter(msg => msg.role === "system");
      setMessages(systemMessages);
      toast.success("Conversation history cleared.");
    } catch (error) {
      console.error("Failed to clear memory:", error);
      toast.error("Failed to clear conversation history.");
    }
  };

  const getMessageClass = (role: string) => {
    switch (role) {
      case "user": return "message-user";
      case "assistant": return "message-assistant";
      case "system": return "message-system";
      default: return "";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loader"></span>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Alert variant="destructive">
          <AlertDescription>
            Agent not found. Please return to the home page and select a valid agent.
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => navigate("/")}>Return to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto h-screen flex flex-col p-4">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{agent.name}</h1>
          <p className="text-muted-foreground text-sm">{agent.role}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center space-x-2">
            <Switch 
              id="voice-mode" 
              checked={enableVoice} 
              onCheckedChange={setEnableVoice}
              disabled={!agent.voice_provider}
            />
            <Label htmlFor="voice-mode" className="flex items-center gap-1">
              <Volume2 className="h-4 w-4" />
              Voice
            </Label>
          </div>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Trash className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear Conversation History</AlertDialogTitle>
                <AlertDialogDescription>
                  This will clear all conversation history with this agent. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearMemory}>
                  Clear History
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="pb-0">
          <CardTitle className="text-lg font-medium">Chat</CardTitle>
          <CardDescription>
            {agent.llm_provider} / {agent.llm_model}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 p-0 overflow-hidden">
          <div className="agent-chat-container h-full">
            <div className="chat-message-container" ref={chatContainerRef}>
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <Avatar className="h-20 w-20 mb-4">
                    <div className="bg-primary text-white w-full h-full flex items-center justify-center text-2xl font-bold">
                      {agent.name.charAt(0).toUpperCase()}
                    </div>
                  </Avatar>
                  <p className="text-center max-w-md">
                    This is the beginning of your conversation with {agent.name}.
                    Start by sending a message below.
                  </p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div key={index} className={getMessageClass(message.role)}>
                    {message.content}
                  </div>
                ))
              )}
              
              {sendingMessage && (
                <div className={getMessageClass("assistant")}>
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Thinking...</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="chat-input-container">
              {currentAudio && (
                <div className="audio-player">
                  <Volume2 className="h-4 w-4" />
                  <audio 
                    ref={audioRef} 
                    controls 
                    src={currentAudio} 
                    className="w-full"
                  />
                </div>
              )}
              
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex gap-2 mt-2"
              >
                <Input
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Type your message..."
                  disabled={sendingMessage}
                />
                <Button 
                  type="submit" 
                  disabled={!prompt.trim() || sendingMessage}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentChat;
