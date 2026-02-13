import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EditIcon, SaveIcon, XIcon } from 'lucide-react';
import { calculateATSScore, parseResumeContent, type ATSScore } from '@/utils/unifiedATSGenerator';
import { cn } from '@/lib/utils';

interface EditableResumeRendererProps {
  content: string;
  onChange?: (newContent: string) => void;
  showATSScore?: boolean;
  className?: string;
}

/**
 * Editable Resume Renderer
 *
 * Two modes:
 * - View mode: renders the structured resume (same style as ResumeRenderer)
 * - Edit mode: plain-text editor (textarea) so the user can safely edit without
 *   contentEditable fragility.  On save we call onChange with the new text.
 */
const EditableResumeRenderer: React.FC<EditableResumeRendererProps> = ({
  content,
  onChange,
  showATSScore = true,
  className,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(content);
  const [atsScore, setAtsScore] = useState<ATSScore | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Compute ATS score
  useEffect(() => {
    if (showATSScore && editedText) {
      setAtsScore(calculateATSScore(editedText));
    }
  }, [editedText, showATSScore]);

  // Sync when parent content changes (e.g. re-generate)
  useEffect(() => {
    if (!isEditing) setEditedText(content);
  }, [content, isEditing]);

  // Auto-focus textarea on edit start
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(0, 0);
    }
  }, [isEditing]);

  const handleSave = useCallback(() => {
    onChange?.(editedText);
    setIsEditing(false);
  }, [editedText, onChange]);

  const handleCancel = useCallback(() => {
    setEditedText(content);
    setIsEditing(false);
  }, [content]);

  // ── Render structured view ──
  const renderViewMode = () => {
    const resume = parseResumeContent(editedText);

    const contactParts: string[] = [];
    if (resume.contact.email) contactParts.push(resume.contact.email);
    if (resume.contact.phone) contactParts.push(resume.contact.phone);
    if (resume.contact.location) contactParts.push(resume.contact.location);
    if (resume.contact.linkedin) contactParts.push(resume.contact.linkedin);
    if (resume.contact.github) contactParts.push(resume.contact.github);
    if (resume.contact.portfolio) contactParts.push(resume.contact.portfolio);
    contactParts.push(...resume.contact.other);

    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="text-center pb-3 border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-900">{resume.name || 'Your Name'}</h1>
          {resume.title && <p className="text-sm text-gray-500 mt-0.5">{resume.title}</p>}
          {contactParts.length > 0 && (
            <p className="text-xs text-gray-400 mt-1">{contactParts.join('  |  ')}</p>
          )}
        </div>

        {/* Summary */}
        {resume.summary.length > 0 && (
          <SectionView title="Professional Summary">
            <p className="text-sm text-gray-700 leading-relaxed">{resume.summary.join(' ')}</p>
          </SectionView>
        )}

        {/* Skills */}
        {resume.skills.length > 0 && (
          <SectionView title="Technical Skills">
            {resume.skills.map((g, i) => (
              <div key={i} className="text-sm">
                {g.category && <span className="font-semibold text-gray-800">{g.category}: </span>}
                <span className="text-gray-600">{g.items.join(', ')}</span>
              </div>
            ))}
          </SectionView>
        )}

        {/* Experience */}
        {resume.experience.length > 0 && (
          <SectionView title="Professional Experience">
            <div className="relative space-y-0">
              {resume.experience.map((job, i) => (
                <div key={i} className="relative pl-4 pb-4 last:pb-0 group">
                  {/* Timeline */}
                  {i < resume.experience.length - 1 && (
                    <div className="absolute left-[5px] top-3 bottom-0 w-px bg-gradient-to-b from-blue-300 to-blue-100" />
                  )}
                  <div className="absolute left-0 top-[7px] w-[11px] h-[11px] rounded-full border-2 border-blue-400 bg-white group-hover:bg-blue-50 transition-colors" />

                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                    <span className="font-semibold text-gray-900 text-sm">{job.title}</span>
                    {job.dates && (
                      <span className="inline-flex items-center text-[11px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                        {job.dates}
                      </span>
                    )}
                  </div>
                  {job.company && (
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                      <svg className="w-3 h-3 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="italic">{job.company}</span>
                    </p>
                  )}
                  {job.bullets.length > 0 && (
                    <ul className="mt-1.5 space-y-1">
                      {job.bullets.map((b, bi) => (
                        <li key={bi} className="flex gap-2 text-sm text-gray-700 leading-relaxed">
                          <span className="text-blue-400 mt-[7px] w-1.5 h-1.5 rounded-full bg-blue-300 flex-shrink-0" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </SectionView>
        )}

        {/* Education */}
        {resume.education.length > 0 && (
          <SectionView title="Education">
            {resume.education.map((edu, i) => (
              <div key={i} className="mb-2">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                  <span className="font-semibold text-gray-900 text-sm">{edu.degree}</span>
                  {edu.dates && (
                    <span className="inline-flex items-center text-[11px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                      {edu.dates}
                    </span>
                  )}
                </div>
                {edu.school && (
                  <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                    <svg className="w-3 h-3 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path d="M12 14l9-5-9-5-9 5 9 5z" />
                      <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                    </svg>
                    <span className="italic">{edu.school}</span>
                  </p>
                )}
              </div>
            ))}
          </SectionView>
        )}

        {/* Certifications */}
        {resume.certifications.length > 0 && (
          <SectionView title="Certifications">
            <ul className="space-y-0.5">
              {resume.certifications.map((c, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-700">
                  <span className="text-blue-400 mt-[7px] w-1.5 h-1.5 rounded-full bg-blue-300 flex-shrink-0" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </SectionView>
        )}

        {/* Projects */}
        {resume.projects.length > 0 && (
          <SectionView title="Key Projects">
            {resume.projects.map((p, i) => (
              <div key={i} className="mb-2 rounded-md border border-gray-100 bg-gray-50/50 px-3 py-2">
                <span className="font-semibold text-gray-900 text-sm">{p.name}</span>
                {p.description && <p className="text-sm text-gray-600 mt-0.5">{p.description}</p>}
                {p.bullets.length > 0 && (
                  <ul className="mt-1 space-y-0.5">
                    {p.bullets.map((b, bi) => (
                      <li key={bi} className="flex gap-2 text-sm text-gray-700">
                        <span className="text-blue-400 mt-[7px] w-1.5 h-1.5 rounded-full bg-blue-300 flex-shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </SectionView>
        )}

        {/* Additional */}
        {resume.additional.length > 0 && (
          <SectionView title="Additional Information">
            <ul className="space-y-0.5">
              {resume.additional.map((a, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-700">
                  <span className="text-blue-400 mt-1.5 text-[6px] flex-shrink-0">&#9679;</span>
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </SectionView>
        )}
      </div>
    );
  };

  return (
    <div className={cn('relative', className)}>
      {/* ATS Score Badge */}
      {showATSScore && atsScore && (
        <div className="absolute top-2 right-2 z-10">
          <Badge
            className={cn(
              'text-xs font-bold',
              atsScore.overall >= 80 ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
              atsScore.overall >= 60 ? 'bg-amber-100 text-amber-700 border-amber-200' :
              'bg-red-100 text-red-700 border-red-200',
            )}
          >
            ATS: {atsScore.overall}%
          </Badge>
        </div>
      )}

      {/* Toolbar */}
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
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <SaveIcon className="w-4 h-4 mr-1" />
              Save
            </Button>
            <Button variant="outline" size="sm" onClick={handleCancel} className="text-gray-600">
              <XIcon className="w-4 h-4 mr-1" />
              Cancel
            </Button>
            <span className="text-xs text-gray-400 ml-auto">Edit the plain text below, then save.</span>
          </>
        )}
      </div>

      {/* Content */}
      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={editedText}
          onChange={(e) => setEditedText(e.target.value)}
          className={cn(
            'w-full min-h-[500px] p-4 border rounded-lg bg-white font-mono text-sm leading-relaxed',
            'focus:outline-none focus:ring-2 focus:ring-blue-200 resize-y',
          )}
          spellCheck={false}
        />
      ) : (
        <div className="p-4 bg-white border rounded-lg min-h-[400px]">
          {renderViewMode()}
        </div>
      )}

      {isEditing && (
        <p className="mt-2 text-xs text-blue-600 bg-blue-50 rounded p-2">
          <strong>Tip:</strong> Use standard section headers like <em>PROFESSIONAL EXPERIENCE</em>, <em>TECHNICAL SKILLS</em>, <em>EDUCATION</em>.
          Separate bullet points with <code>-</code> or <code>•</code>. Use <code>|</code> to separate job title, company, and dates.
        </p>
      )}
    </div>
  );
};

// Sub-component for section rendering inside editable view
const SectionView: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div>
    <h3 className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1.5 pb-1 border-b border-blue-100">
      {title}
    </h3>
    {children}
  </div>
);

export default EditableResumeRenderer;
