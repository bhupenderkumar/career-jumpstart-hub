import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  EditIcon, 
  SaveIcon, 
  XIcon, 
  Bold, 
  Italic, 
  List, 
  Undo2, 
  Redo2,
  Type,
  AlignLeft,
  AlignCenter
} from 'lucide-react';
import { calculateATSScore, type ATSScore } from '@/utils/atsResumeGenerator';
import { cn } from '@/lib/utils';

interface EditableResumeRendererProps {
  content: string;
  onChange?: (newContent: string) => void;
  showATSScore?: boolean;
  className?: string;
}

/**
 * WYSIWYG Editable Resume Renderer
 * 
 * Features:
 * - Click to edit any section
 * - Inline formatting toolbar
 * - Real-time content sync
 * - ATS score updates on edit
 */
const EditableResumeRenderer: React.FC<EditableResumeRendererProps> = ({
  content,
  onChange,
  showATSScore = true,
  className
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [atsScore, setAtsScore] = useState<ATSScore | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const [selectionActive, setSelectionActive] = useState(false);

  // Calculate ATS score
  useEffect(() => {
    if (showATSScore && editedContent) {
      const score = calculateATSScore(editedContent);
      setAtsScore(score);
    }
  }, [editedContent, showATSScore]);

  // Sync content when prop changes
  useEffect(() => {
    if (!isEditing) {
      setEditedContent(content);
    }
  }, [content, isEditing]);

  // Convert plain text to editable HTML
  const contentToHTML = (text: string): string => {
    const lines = text.split('\n');
    let html = '';
    let inSection = false;
    let sectionType = '';

    const sectionPatterns = {
      header: /^(professional summary|summary|profile|objective|about)/i,
      skills: /^(technical skills|skills|core competencies|expertise)/i,
      experience: /^(professional experience|work experience|experience|employment)/i,
      education: /^(education|academic)/i,
      certifications: /^(certifications?|licenses?)/i,
      projects: /^(projects|key projects)/i,
    };

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Empty line
      if (!trimmedLine) {
        html += '<br/>';
        continue;
      }

      // Check for section headers
      let isHeader = false;
      for (const [type, pattern] of Object.entries(sectionPatterns)) {
        if (pattern.test(trimmedLine)) {
          html += `<h2 class="resume-section-header" data-section="${type}">${trimmedLine}</h2>`;
          sectionType = type;
          inSection = true;
          isHeader = true;
          break;
        }
      }
      if (isHeader) continue;

      // Name (first major line, typically)
      if (!inSection && trimmedLine.length < 60 && trimmedLine === trimmedLine.toUpperCase() && !trimmedLine.includes('@')) {
        html += `<h1 class="resume-name">${trimmedLine}</h1>`;
        continue;
      }

      // Bullet points
      if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-') || trimmedLine.startsWith('*')) {
        html += `<li class="resume-bullet">${trimmedLine.replace(/^[•\-*]\s*/, '')}</li>`;
        continue;
      }

      // Job entries (Title | Company | Dates)
      if (trimmedLine.includes('|') && sectionType === 'experience') {
        html += `<div class="resume-job-entry">${trimmedLine}</div>`;
        continue;
      }

      // Contact line
      if (trimmedLine.includes('@') || trimmedLine.includes('linkedin') || trimmedLine.includes('github')) {
        html += `<div class="resume-contact">${trimmedLine}</div>`;
        continue;
      }

      // Regular paragraph
      html += `<p class="resume-paragraph">${trimmedLine}</p>`;
    }

    return html;
  };

  // Convert HTML back to plain text
  const htmlToContent = (html: string): string => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    let text = '';
    
    const processNode = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        text += node.textContent;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        const tagName = element.tagName.toLowerCase();

        // Add newlines before certain elements
        if (['h1', 'h2', 'div', 'p', 'li', 'br'].includes(tagName)) {
          if (text && !text.endsWith('\n')) {
            text += '\n';
          }
        }

        // Add bullet for list items
        if (tagName === 'li') {
          text += '• ';
        }

        // Process children
        for (const child of Array.from(node.childNodes)) {
          processNode(child);
        }

        // Add newline after block elements
        if (['h1', 'h2', 'div', 'p'].includes(tagName)) {
          if (!text.endsWith('\n')) {
            text += '\n';
          }
        }
      }
    };

    processNode(tempDiv);
    
    // Clean up excessive newlines
    return text.replace(/\n{3,}/g, '\n\n').trim();
  };

  // Handle content changes
  const handleContentChange = useCallback(() => {
    if (editorRef.current) {
      const newContent = htmlToContent(editorRef.current.innerHTML);
      setEditedContent(newContent);
    }
  }, []);

  // Save changes
  const handleSave = useCallback(() => {
    if (onChange) {
      onChange(editedContent);
    }
    setIsEditing(false);
  }, [editedContent, onChange]);

  // Cancel editing
  const handleCancel = useCallback(() => {
    setEditedContent(content);
    setIsEditing(false);
  }, [content]);

  // Formatting commands
  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    handleContentChange();
  };

  // Check if selection is active
  const handleSelectionChange = useCallback(() => {
    const selection = window.getSelection();
    setSelectionActive(!!selection && !selection.isCollapsed);
  }, []);

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [handleSelectionChange]);

  // Render formatted resume for view mode
  const renderViewMode = () => {
    const lines = editedContent.split('\n');
    const elements: React.ReactNode[] = [];
    let currentSection = '';
    let bulletGroup: string[] = [];

    const flushBullets = () => {
      if (bulletGroup.length > 0) {
        elements.push(
          <ul key={`bullets-${elements.length}`} className="list-none space-y-1 ml-0">
            {bulletGroup.map((bullet, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-blue-500 mt-1.5 text-xs">●</span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        );
        bulletGroup = [];
      }
    };

    const sectionPatterns: { [key: string]: RegExp } = {
      summary: /^(professional summary|summary|profile|objective|about)/i,
      skills: /^(technical skills|skills|core competencies|expertise)/i,
      experience: /^(professional experience|work experience|experience|employment)/i,
      education: /^(education|academic)/i,
      certifications: /^(certifications?|licenses?)/i,
      projects: /^(projects|key projects)/i,
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) {
        flushBullets();
        continue;
      }

      // Check for section headers
      let isHeader = false;
      for (const [section, pattern] of Object.entries(sectionPatterns)) {
        if (pattern.test(line)) {
          flushBullets();
          currentSection = section;
          elements.push(
            <h2 key={`section-${i}`} className="text-sm font-bold text-blue-600 uppercase tracking-wide border-b border-blue-200 pb-1 mt-4 mb-2">
              {line}
            </h2>
          );
          isHeader = true;
          break;
        }
      }
      if (isHeader) continue;

      // Name
      if (i === 0 || (line.length < 50 && line === line.toUpperCase() && !line.includes('@') && !currentSection)) {
        flushBullets();
        elements.push(
          <h1 key={`name-${i}`} className="text-xl font-bold text-gray-900 text-center mb-1">
            {line}
          </h1>
        );
        continue;
      }

      // Bullet points
      if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
        bulletGroup.push(line.replace(/^[•\-*]\s*/, ''));
        continue;
      }

      // Job entries
      if (line.includes('|') && currentSection === 'experience') {
        flushBullets();
        const parts = line.split('|').map(p => p.trim());
        elements.push(
          <div key={`job-${i}`} className="mt-3 mb-1">
            <div className="flex justify-between items-baseline">
              <span className="font-semibold text-gray-900 text-sm">{parts[0]}</span>
              <span className="text-xs text-gray-500">{parts[parts.length - 1]}</span>
            </div>
            {parts[1] && <div className="text-xs text-gray-600">{parts[1]}</div>}
          </div>
        );
        continue;
      }

      // Education entries
      if (line.includes('|') && currentSection === 'education') {
        flushBullets();
        const parts = line.split('|').map(p => p.trim());
        elements.push(
          <div key={`edu-${i}`} className="mt-2">
            <div className="font-semibold text-gray-900 text-sm">{parts[0]}</div>
            {parts[1] && <div className="text-xs text-gray-600">{parts.slice(1).join(' | ')}</div>}
          </div>
        );
        continue;
      }

      // Contact info
      if (line.includes('@') || line.includes('linkedin') || line.includes('github') || line.includes('|')) {
        flushBullets();
        if (!currentSection) {
          elements.push(
            <div key={`contact-${i}`} className="text-xs text-gray-500 text-center mb-3">
              {line}
            </div>
          );
          continue;
        }
      }

      // Skills line
      if (currentSection === 'skills' && line.includes(':')) {
        flushBullets();
        const [category, skills] = line.split(':');
        elements.push(
          <div key={`skills-${i}`} className="text-sm mb-1">
            <span className="font-medium text-gray-700">{category}:</span>
            <span className="text-gray-600">{skills}</span>
          </div>
        );
        continue;
      }

      // Regular paragraph
      flushBullets();
      elements.push(
        <p key={`para-${i}`} className="text-sm text-gray-700 mb-2">
          {line}
        </p>
      );
    }

    flushBullets();
    return elements;
  };

  return (
    <div className={cn("relative", className)}>
      {/* ATS Score Badge */}
      {showATSScore && atsScore && (
        <div className="absolute top-2 right-2 z-10">
          <Badge 
            className={cn(
              "text-xs font-bold",
              atsScore.overall >= 80 ? "bg-green-100 text-green-700 border-green-200" :
              atsScore.overall >= 60 ? "bg-yellow-100 text-yellow-700 border-yellow-200" :
              "bg-red-100 text-red-700 border-red-200"
            )}
          >
            ATS: {atsScore.overall}%
          </Badge>
        </div>
      )}

      {/* Edit Mode Toggle */}
      <div className="flex items-center gap-2 mb-3">
        {!isEditing ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            <EditIcon className="w-4 h-4 mr-1" />
            Edit Resume
          </Button>
        ) : (
          <>
            <Button
              variant="default"
              size="sm"
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <SaveIcon className="w-4 h-4 mr-1" />
              Save Changes
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              className="text-gray-600"
            >
              <XIcon className="w-4 h-4 mr-1" />
              Cancel
            </Button>
          </>
        )}
      </div>

      {/* Formatting Toolbar (visible in edit mode) */}
      {isEditing && (
        <div className="flex items-center gap-1 p-2 bg-gray-50 border rounded-t-lg mb-0 sticky top-0 z-20">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => execCommand('bold')}
            className="h-8 w-8 p-0"
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => execCommand('italic')}
            className="h-8 w-8 p-0"
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </Button>
          <div className="w-px h-6 bg-gray-300 mx-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => execCommand('insertUnorderedList')}
            className="h-8 w-8 p-0"
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </Button>
          <div className="w-px h-6 bg-gray-300 mx-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => execCommand('justifyLeft')}
            className="h-8 w-8 p-0"
            title="Align Left"
          >
            <AlignLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => execCommand('justifyCenter')}
            className="h-8 w-8 p-0"
            title="Align Center"
          >
            <AlignCenter className="w-4 h-4" />
          </Button>
          <div className="w-px h-6 bg-gray-300 mx-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => execCommand('undo')}
            className="h-8 w-8 p-0"
            title="Undo"
          >
            <Undo2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => execCommand('redo')}
            className="h-8 w-8 p-0"
            title="Redo"
          >
            <Redo2 className="w-4 h-4" />
          </Button>
          <div className="flex-1" />
          <span className="text-xs text-gray-500">
            Click anywhere to edit
          </span>
        </div>
      )}

      {/* Content Area */}
      {isEditing ? (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleContentChange}
          onBlur={handleContentChange}
          className={cn(
            "min-h-[400px] p-4 border rounded-b-lg bg-white",
            "focus:outline-none focus:ring-2 focus:ring-blue-200",
            "prose prose-sm max-w-none",
            "[&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-center [&_h1]:text-gray-900 [&_h1]:mb-2",
            "[&_h2]:text-sm [&_h2]:font-bold [&_h2]:text-blue-600 [&_h2]:uppercase [&_h2]:tracking-wide [&_h2]:border-b [&_h2]:border-blue-200 [&_h2]:pb-1 [&_h2]:mt-4 [&_h2]:mb-2",
            "[&_.resume-job-entry]:mt-2 [&_.resume-job-entry]:font-medium",
            "[&_.resume-contact]:text-xs [&_.resume-contact]:text-gray-500 [&_.resume-contact]:text-center",
            "[&_.resume-bullet]:ml-4 [&_.resume-bullet]:text-sm",
            "[&_.resume-paragraph]:text-sm [&_.resume-paragraph]:text-gray-700",
            "[&_li]:ml-4 [&_li]:text-sm [&_li]:text-gray-700",
            "[&_p]:mb-1 [&_p]:text-sm"
          )}
          dangerouslySetInnerHTML={{ __html: contentToHTML(editedContent) }}
        />
      ) : (
        <div className="p-4 bg-white border rounded-lg min-h-[400px]">
          {renderViewMode()}
        </div>
      )}

      {/* Edit Mode Hint */}
      {isEditing && (
        <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
          <strong>Tip:</strong> Select text to format. Press Enter for new line. Changes are auto-saved when you click "Save Changes".
        </div>
      )}
    </div>
  );
};

export default EditableResumeRenderer;
