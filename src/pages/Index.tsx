
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Brain, Settings, Plus, Server, Bot } from "lucide-react";
import { useEffect, useState } from "react";
import { API_BASE_URL, fetchAgents, fetchServerStatus, setApiBaseUrl } from "@/lib/api";
import { Agent } from "@/types/agent";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ThreeDScene from "@/components/ThreeDScene";
import AssistantHelper from "@/components/AssistantHelper";
import DeveloperCard from "@/components/DeveloperCard";

const Index = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [serverInfo, setServerInfo] = useState<{ status: string; name: string; version: string } | null>(null);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [apiUrl, setApiUrl] = useState(API_BASE_URL);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch server status
        const serverStatus = await fetchServerStatus();
        setServerInfo(serverStatus);
        
        // Fetch agents
        const agentsData = await fetchAgents();
        setAgents(agentsData);
      } catch (error) {
        console.error("Failed to load data:", error);
        toast.error("Failed to connect to MCP Server. Please check your API URL in settings.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleViewAgent = (agentId: string) => {
    navigate(`/agent/${agentId}`);
  };

  const handleCreateAgent = () => {
    navigate("/create-agent");
  };

  const handleSaveSettings = () => {
    setApiBaseUrl(apiUrl);
    setShowSettingsDialog(false);
    toast.success("API URL updated! Reconnecting to server...");
    // Reload data with new API URL
    setLoading(true);
    const loadData = async () => {
      try {
        const serverStatus = await fetchServerStatus();
        setServerInfo(serverStatus);
        const agentsData = await fetchAgents();
        setAgents(agentsData);
        toast.success(`Connected to ${serverStatus.name} v${serverStatus.version}`);
      } catch (error) {
        console.error("Failed to load data:", error);
        toast.error("Failed to connect to MCP Server. Please check your API URL.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Advanced MCP Dashboard</h1>
          <p className="text-gray-500">
            {serverInfo ? (
              `Connected to ${serverInfo.name} v${serverInfo.version}`
            ) : (
              "Connecting to server..."
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowSettingsDialog(true)} variant="outline" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
          <Button onClick={handleCreateAgent}>
            <Plus className="h-5 w-5 mr-2" /> Create Agent
          </Button>
        </div>
      </div>

      {/* 3D Hero Section */}
      <Card className="mb-8 overflow-hidden border-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
        <div className="flex flex-col lg:flex-row">
          <div className="p-8 lg:w-1/2 flex flex-col justify-center">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-transparent bg-clip-text">
              Advanced AI Agent Platform
            </h2>
            <p className="text-gray-500 mb-6 text-lg">
              Create powerful AI agents powered by Claude and OpenAI models with full customization of capabilities and integrations.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button onClick={handleCreateAgent} size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                <Bot className="h-5 w-5 mr-2" /> Create Your First Agent
              </Button>
              <Button onClick={() => setShowSettingsDialog(true)} variant="outline" size="lg">
                <Server className="h-5 w-5 mr-2" /> Configure Server
              </Button>
            </div>
          </div>
          <div className="lg:w-1/2">
            <ThreeDScene />
          </div>
        </div>
      </Card>

      {/* Developer Card */}
      <div className="mb-8">
        <DeveloperCard />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <span className="loader"></span>
        </div>
      ) : agents.length === 0 ? (
        <Card className="text-center p-10">
          <CardContent className="pt-10">
            <Brain className="h-20 w-20 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold mb-2">No Agents Found</h2>
            <p className="text-gray-500 mb-6">
              Create your first AI agent to get started with the Advanced MCP Server.
            </p>
            <Button onClick={handleCreateAgent} size="lg">
              <Plus className="h-5 w-5 mr-2" /> Create Your First Agent
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div>
          <h2 className="text-2xl font-bold mb-4">Your AI Agents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <Card key={agent.agent_id} className="agent-card hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>{agent.name}</CardTitle>
                  <CardDescription>{agent.role}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Model:</span>
                      <span className="text-sm text-gray-500">{agent.llm_model}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Provider:</span>
                      <span className="text-sm text-gray-500">{agent.llm_provider}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Voice:</span>
                      <span className="text-sm text-gray-500">
                        {agent.voice_provider ? `${agent.voice_provider} (${agent.voice_id})` : "None"}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={() => handleViewAgent(agent.agent_id)}
                  >
                    Chat with Agent
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Server Settings</DialogTitle>
            <DialogDescription>
              Configure the connection to your MCP Server
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="apiUrl">API Base URL</Label>
              <div className="flex gap-2 items-center">
                <Server className="h-4 w-4 text-gray-500" />
                <Input
                  id="apiUrl"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="http://localhost:8000"
                />
              </div>
              <p className="text-xs text-gray-500">
                Enter the URL of your MCP Server (e.g., http://localhost:8000 or your ngrok URL)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSettings}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assistant Helper */}
      <AssistantHelper />
    </div>
  );
};

export default Index;
