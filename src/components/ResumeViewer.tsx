
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileTextIcon, DownloadIcon, EditIcon, SaveIcon, XIcon, SparklesIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';

interface ResumeViewerProps {
  resume: string;
  onResumeUpdate: (newResume: string) => void;
  onRegenerateResume: (editPrompt: string) => void;
  isGenerating: boolean;
}

const ResumeViewer: React.FC<ResumeViewerProps> = ({ 
  resume, 
  onResumeUpdate, 
  onRegenerateResume,
  isGenerating 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableResume, setEditableResume] = useState("");
  const [editPrompt, setEditPrompt] = useState("");
  const [showEditPrompt, setShowEditPrompt] = useState(false);
  const { toast } = useToast();

  const handleExportPDF = () => {
    if (!resume) {
      toast({
        title: "No Resume",
        description: "Please generate a resume first before exporting.",
        variant: "destructive",
      });
      return;
    }

    // Create a new jsPDF instance
    const pdf = new jsPDF();

    // Set the font size and family
    pdf.setFontSize(12);
    pdf.setFont('helvetica');

    // Split the resume text into lines
    const lines = resume.split('\n');

    // Set the starting Y position
    let y = 20;

    // Loop through the lines and add them to the PDF
    for (let i = 0; i < lines.length; i++) {
      // If the line is too long, split it into multiple lines
      const textLines = pdf.splitTextToSize(lines[i], 180);

      // Loop through the text lines and add them to the PDF
      for (let j = 0; j < textLines.length; j++) {
        // If the Y position is too low, add a new page
        if (y > 280) {
          pdf.addPage();
          y = 20;
        }

        // Add the text line to the PDF
        pdf.text(textLines[j], 20, y);

        // Increment the Y position
        y += 7;
      }
    }

    // Save the PDF
    pdf.save("ai-generated-resume.pdf");

    toast({
      title: "Resume Exported",
      description: "Your resume has been downloaded successfully as a PDF.",
    });
  };

  const handleEdit = () => {
    setEditableResume(resume);
    setIsEditing(true);
  };

  const handleSave = () => {
    onResumeUpdate(editableResume);
    setIsEditing(false);
    
    toast({
      title: "Resume Updated",
      description: "Your resume has been successfully updated.",
    });
  };

  const handleCancel = () => {
    setEditableResume("");
    setIsEditing(false);
  };

  const handleEditWithAI = () => {
    if (!editPrompt.trim()) {
      toast({
        title: "Edit Prompt Required",
        description: "Please enter what changes you'd like to make.",
        variant: "destructive",
      });
      return;
    }
    
    onRegenerateResume(editPrompt);
    setEditPrompt("");
    setShowEditPrompt(false);
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>Generated Resume</CardTitle>
        <CardDescription>
          Your AI-customized resume with editing and export options
        </CardDescription>
      </CardHeader>
      <CardContent>
        {resume ? (
          <div className="space-y-4">
            {isEditing ? (
              <div className="space-y-4">
                <Label htmlFor="editResume">Edit Resume</Label>
                <Textarea
                  id="editResume"
                  value={editableResume}
                  onChange={(e) => setEditableResume(e.target.value)}
                  className="min-h-[400px]"
                />
                <div className="flex gap-2">
                  <Button onClick={handleSave} size="sm">
                    <SaveIcon className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button onClick={handleCancel} variant="outline" size="sm">
                    <XIcon className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="h-[400px] border rounded-lg p-4 overflow-y-auto bg-background">
                  <pre className="whitespace-pre-wrap text-sm">{resume}</pre>
                </div>
                
                {showEditPrompt && (
                  <div className="space-y-2 p-4 border rounded-lg bg-muted/30">
                    <Label htmlFor="editPrompt">What changes would you like to make?</Label>
                    <Textarea
                      id="editPrompt"
                      value={editPrompt}
                      onChange={(e) => setEditPrompt(e.target.value)}
                      placeholder="e.g., 'Add more technical skills', 'Make it more concise', 'Focus on leadership experience'..."
                      className="min-h-[80px]"
                    />
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleEditWithAI} 
                        size="sm"
                        disabled={isGenerating || !editPrompt.trim()}
                      >
                        <SparklesIcon className="w-4 h-4 mr-2" />
                        {isGenerating ? "Updating..." : "Update with AI"}
                      </Button>
                      <Button 
                        onClick={() => setShowEditPrompt(false)} 
                        variant="outline" 
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2 flex-wrap">
                  <Button onClick={handleExportPDF} className="flex-1">
                    <DownloadIcon className="w-4 h-4 mr-2" />
                    Export as PDF
                  </Button>
                  <Button onClick={handleEdit} variant="outline" size="sm">
                    <EditIcon className="w-4 h-4 mr-2" />
                    Manual Edit
                  </Button>
                  <Button 
                    onClick={() => setShowEditPrompt(!showEditPrompt)} 
                    variant="outline" 
                    size="sm"
                    disabled={isGenerating}
                  >
                    <SparklesIcon className="w-4 h-4 mr-2" />
                    Edit with AI
                  </Button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="h-[400px] border-2 border-dashed border-border rounded-lg flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <FileTextIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Your generated resume will appear here</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResumeViewer;
