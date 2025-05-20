
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Github, Instagram, Linkedin, Twitter } from "lucide-react";

const DeveloperCard = () => {
  const openLink = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
        <CardTitle>Created by Rishabh Kapoor</CardTitle>
        <CardDescription>AI & Software Developer</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <p className="text-sm text-gray-500 mb-4">
          Advanced MCP Server - Powering the next generation of AI agents and tools
        </p>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={() => openLink("https://x.com/Rishabhkap444")}
          >
            <Twitter className="h-4 w-4" />
            <span className="hidden sm:inline">Twitter</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={() => openLink("https://github.com/IntegratedRai444")}
          >
            <Github className="h-4 w-4" />
            <span className="hidden sm:inline">GitHub</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={() => openLink("https://www.linkedin.com/in/rishabh-kapoor-283548278")}
          >
            <Linkedin className="h-4 w-4" />
            <span className="hidden sm:inline">LinkedIn</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={() => openLink("https://www.instagram.com/rishabh_kapoor0444")}
          >
            <Instagram className="h-4 w-4" />
            <span className="hidden sm:inline">Instagram</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={() => openLink("https://www.threads.net/@rishabh_kapoor0444")}
          >
            <span className="text-sm">Threads</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeveloperCard;
