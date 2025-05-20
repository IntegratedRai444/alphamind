
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CreateAgent from "./pages/CreateAgent";
import AgentChat from "./pages/AgentChat";
import { useEffect } from "react";
import { setClaudeApiKey, setElevenLabsApiKey } from "./lib/api";

const queryClient = new QueryClient();

const App = () => {
  // Initialize API keys when the app starts
  useEffect(() => {
    // Set Claude API key if not already set
    if (!localStorage.getItem("claudeApiKey")) {
      setClaudeApiKey("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");
    }
    
    // Set ElevenLabs API key if not already set
    if (!localStorage.getItem("elevenLabsApiKey")) {
      setElevenLabsApiKey("sk_323f1a6b9322c49799bee1c20f01b09532310794a474b567");
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/create-agent" element={<CreateAgent />} />
            <Route path="/agent/:agentId" element={<AgentChat />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
