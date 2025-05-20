
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Github, Linkedin, Instagram, Twitter } from "lucide-react";

const DeveloperCard = () => {
  const handleOpenLink = (url: string) => {
    window.open(url, '_blank');
  };
  
  return (
    <Card className="w-full max-w-md mx-auto mt-8 mb-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-xl font-bold">Created by Rishabh Kapoor</CardTitle>
      </CardHeader>
      <CardContent className="text-center text-sm text-muted-foreground pb-2">
        <p>Full-stack developer & AI enthusiast</p>
        <p>Advanced MCP Server creator</p>
      </CardContent>
      <CardFooter className="flex justify-center gap-3 pt-2">
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full bg-white hover:bg-blue-100 dark:bg-gray-800 dark:hover:bg-gray-700"
          onClick={() => handleOpenLink("https://x.com/Rishabhkap444")}
        >
          <Twitter className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full bg-white hover:bg-blue-100 dark:bg-gray-800 dark:hover:bg-gray-700"
          onClick={() => handleOpenLink("https://github.com/IntegratedRai444")}
        >
          <Github className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full bg-white hover:bg-blue-100 dark:bg-gray-800 dark:hover:bg-gray-700"
          onClick={() => handleOpenLink("https://www.linkedin.com/in/rishabh-kapoor-283548278")}
        >
          <Linkedin className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full bg-white hover:bg-blue-100 dark:bg-gray-800 dark:hover:bg-gray-700"
          onClick={() => handleOpenLink("https://www.instagram.com/rishabh_kapoor0444")}
        >
          <Instagram className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full bg-white hover:bg-blue-100 dark:bg-gray-800 dark:hover:bg-gray-700"
          onClick={() => handleOpenLink("https://www.threads.net/@rishabh_kapoor0444")}
        >
          {/* Threads icon - using a custom SVG */}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 17.5a7.5 7.5 0 1 1 7.5-7.5 7.5 7.5 0 0 1-7.5 7.5z"></path>
            <path d="M12 6a4 4 0 1 0 4 4 4 4 0 0 0-4-4zm0 6a2 2 0 1 1 2-2 2 2 0 0 1-2 2z"></path>
          </svg>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DeveloperCard;
