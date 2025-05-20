
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createAgent, fetchAvailableVoices } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Brain, Info } from "lucide-react";
import { toast } from "sonner";
import { CreateAgentRequest, Voice } from "@/types/agent";

const formSchema = z.object({
  name: z.string().min(1, "Agent name is required"),
  role: z.string().min(1, "Role description is required"),
  llm_provider: z.enum(["claude", "openai"]),
  llm_model: z.string().min(1, "Model is required"),
  system_prompt: z.string().optional(),
  voice_provider: z.enum(["elevenlabs", "openai"]).optional().nullable(),
  voice_id: z.string().optional().nullable(),
});

const CreateAgent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loadingVoices, setLoadingVoices] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      role: "",
      llm_provider: "claude",
      llm_model: "claude-3-opus-20240229",
      system_prompt: "",
      voice_provider: null,
      voice_id: null,
    },
  });

  const llm_provider = form.watch("llm_provider");
  const voice_provider = form.watch("voice_provider");

  const handleVoiceProviderChange = async (value: string) => {
    if (!value) {
      setVoices([]);
      form.setValue("voice_id", null);
      return;
    }

    setLoadingVoices(true);
    try {
      const voicesData = await fetchAvailableVoices(value as "elevenlabs" | "openai");
      setVoices(voicesData.voices);
      // Set default voice if available
      if (voicesData.voices.length > 0) {
        form.setValue("voice_id", voicesData.voices[0].voice_id);
      }
    } catch (error) {
      console.error("Failed to fetch voices:", error);
      toast.error("Failed to fetch available voices. Please check your API keys.");
      setVoices([]);
    } finally {
      setLoadingVoices(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      // Prepare request data
      const agentData: CreateAgentRequest = {
        name: values.name,
        role: values.role,
        llm_provider: values.llm_provider,
        llm_model: values.llm_model,
        system_prompt: values.system_prompt || undefined,
        voice_provider: values.voice_provider || undefined,
        voice_id: values.voice_id || undefined,
      };

      // Create the agent
      const newAgent = await createAgent(agentData);
      toast.success(`Agent "${values.name}" created successfully!`);
      navigate(`/agent/${newAgent.agent_id}`);
    } catch (error) {
      console.error("Failed to create agent:", error);
      toast.error("Failed to create agent. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="icon" onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Create New Agent</h1>
      </div>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6" />
            Agent Configuration
          </CardTitle>
          <CardDescription>
            Configure your AI agent with a name, role, and preferred model
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Agent Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Research Assistant" {...field} />
                      </FormControl>
                      <FormDescription>
                        A descriptive name for your agent
                      </FormDescription>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role Description</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Helps with research tasks" {...field} />
                      </FormControl>
                      <FormDescription>
                        Brief description of this agent's purpose
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="llm_provider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LLM Provider</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select LLM provider" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="claude">Anthropic Claude</SelectItem>
                          <SelectItem value="openai">OpenAI</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The AI service to use for this agent
                      </FormDescription>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="llm_model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select model" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {llm_provider === "claude" ? (
                            <>
                              <SelectItem value="claude-3-opus-20240229">Claude 3 Opus</SelectItem>
                              <SelectItem value="claude-3-sonnet-20240229">Claude 3 Sonnet</SelectItem>
                              <SelectItem value="claude-3-haiku-20240307">Claude 3 Haiku</SelectItem>
                            </>
                          ) : (
                            <>
                              <SelectItem value="gpt-4-turbo-preview">GPT-4 Turbo</SelectItem>
                              <SelectItem value="gpt-4">GPT-4</SelectItem>
                              <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The specific model to use for this agent
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="system_prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>System Prompt (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="You are a helpful assistant..." 
                        className="min-h-32"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Instructions that define the agent's behavior and capabilities
                    </FormDescription>
                  </FormItem>
                )}
              />

              <div className="bg-muted p-4 rounded-lg flex gap-3">
                <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium mb-1">Voice Configuration (Optional)</h4>
                  <p className="text-sm text-gray-500">
                    You can enable voice output for this agent. Make sure you have the appropriate API keys configured in your MCP Server.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="voice_provider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Voice Provider (Optional)</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value || null);
                          handleVoiceProviderChange(value);
                        }}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="No voice output" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">No voice output</SelectItem>
                          <SelectItem value="elevenlabs">ElevenLabs</SelectItem>
                          <SelectItem value="openai">OpenAI</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select a voice service or none
                      </FormDescription>
                    </FormItem>
                  )}
                />
                
                {voice_provider && (
                  <FormField
                    control={form.control}
                    name="voice_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Voice</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value || ""}
                          disabled={loadingVoices || voices.length === 0}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={loadingVoices ? "Loading voices..." : "Select voice"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {voices.map((voice) => (
                              <SelectItem key={voice.voice_id} value={voice.voice_id}>
                                {voice.name}
                              </SelectItem>
                            ))}
                            {voices.length === 0 && !loadingVoices && (
                              <SelectItem value="" disabled>
                                No voices available
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          {loadingVoices ? "Loading available voices..." : "Select the voice for this agent"}
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <CardFooter className="px-0 pt-4">
                <div className="flex gap-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate("/")}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="w-32" disabled={loading}>
                    {loading ? <span className="animate-pulse">Creating...</span> : "Create Agent"}
                  </Button>
                </div>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateAgent;
