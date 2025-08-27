"use client";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { downloadProjectAsZip } from "@/lib/download-utils";

export function DownloadButton({ 
  html, 
  className 
}: { 
  html: string;
  className?: string;
}) {
  const handleDownloadProject = async () => {
    if (!html || html.trim() === '') {
      toast.error('No project to download. Generate some content first!');
      return;
    }
    
    try {
      const projectName = `localsite-project-${new Date().toISOString().split('T')[0]}`;
      await downloadProjectAsZip(html, projectName);
      toast.success('Project downloaded successfully! 📦');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download project. Please try again.');
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleDownloadProject}
      className={className}
    >
      <Download className="size-4 mr-1.5" />
      <span className="max-lg:hidden">Download ZIP</span>
    </Button>
  );
}