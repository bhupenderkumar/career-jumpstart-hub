import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UploadIcon, FileTextIcon, EditIcon, SaveIcon, XIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as pdfjsLib from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.3.31/build/pdf.worker.mjs';

interface ResumeUploadProps {
  onResumeUpdate: (resumeData: string) => void;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({ onResumeUpdate }) => {
  const [uploadedResume, setUploadedResume] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [editableResume, setEditableResume] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Load saved resume on component mount
  React.useEffect(() => {
    const savedResume = localStorage.getItem("userBaseResume");
    if (savedResume) {
      setUploadedResume(savedResume);
      onResumeUpdate(savedResume);
    }
  }, [onResumeUpdate]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        // Load the PDF document
        const loadingTask = pdfjsLib.getDocument(arrayBuffer);
        const pdfDocument = await loadingTask.promise;

        // Get the text content from each page
        let pdfText = "";
        for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
          const page = await pdfDocument.getPage(pageNum);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map(item => {
            if ('str' in item) {
              return item.str;
            } else {
              return '';
            }
          }).join(" ");
          pdfText += pageText + "\n";
        }

        setUploadedResume(pdfText);
        localStorage.setItem("userBaseResume", pdfText);
        onResumeUpdate(pdfText);
        toast({
          title: "Resume Uploaded",
          description: "Your resume has been successfully uploaded and saved.",
        });
      } else {
        const text = await file.text();
        setUploadedResume(text);
        localStorage.setItem("userBaseResume", text);
        onResumeUpdate(text);
        toast({
          title: "Resume Uploaded",
          description: "Your resume has been successfully uploaded and saved.",
        });
      }
    } catch (error) {
      console.error("Error reading file:", error);
      console.log("Attempting to use Hugging Face as a fallback");
      try {
        // Use Hugging Face Inference API as a fallback
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(
          "https://api-inference.huggingface.co/models/PaddlePaddle/LayoutLMv3",
          {
            headers: { Authorization: "Bearer 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" },
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error(`Hugging Face API failed with status ${response.status}`);
        }

        const result = await response.json();
        const hfText = result.map((item) => item.words.join(" ")).join("\\n");

        setUploadedResume(hfText);
        localStorage.setItem("userBaseResume", hfText);
        onResumeUpdate(hfText);
        toast({
          title: "Resume Uploaded (Hugging Face)",
          description:
            "Your resume has been successfully uploaded and saved using Hugging Face.",
        });
      } catch (hfError) {
        console.error("Error using Hugging Face API:", hfError);
        toast({
          title: "Upload Error",
          description:
            "Failed to read the uploaded file using both Gemini and Hugging Face. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleEdit = () => {
    setEditableResume(uploadedResume);
    setIsEditing(true);
  };

  const handleSave = () => {
    setUploadedResume(editableResume);
    localStorage.setItem("userBaseResume", editableResume);
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

  const handleClearResume = () => {
    setUploadedResume("");
    setEditableResume("");
    setIsEditing(false);
    localStorage.removeItem("userBaseResume");
    onResumeUpdate("");
    
    toast({
      title: "Resume Cleared",
      description: "Your resume has been removed from storage.",
    });
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileTextIcon className="w-5 h-5" />
          Your Base Resume
        </CardTitle>
        <CardDescription>
          Upload your current resume to personalize AI-generated resumes for each job application
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!uploadedResume && !isEditing ? (
          <div className="space-y-4">
            <div 
              className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Click to upload your resume (TXT format)
              </p>
              <Button variant="outline" size="sm">
                Choose File
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.doc,.docx,.pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        ) : isEditing ? (
          <div className="space-y-4">
            <Label htmlFor="editResume">Edit Your Resume</Label>
            <Textarea
              id="editResume"
              value={editableResume}
              onChange={(e) => setEditableResume(e.target.value)}
              className="min-h-[200px]"
              placeholder="Enter your resume details here..."
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
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-muted/30 max-h-[200px] overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm">{uploadedResume}</pre>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleEdit} variant="outline" size="sm">
                <EditIcon className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button onClick={handleClearResume} variant="outline" size="sm">
                <XIcon className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResumeUpload;
