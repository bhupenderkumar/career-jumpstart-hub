import React, { useMemo } from 'react';
import { calculateATSScore, parseResumeContent, type ATSScore } from '@/utils/unifiedATSGenerator';

interface ResumeRendererProps {
  content?: string;
  className?: string;
  showATSScore?: boolean;
}

const scoreColor = (score: number): string => {
  if (score >= 80) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
  if (score >= 60) return 'text-amber-700 bg-amber-50 border-amber-200';
  return 'text-red-700 bg-red-50 border-red-200';
};

const scoreBadgeColor = (score: number): string => {
  if (score >= 80) return 'bg-emerald-100 text-emerald-800';
  if (score >= 60) return 'bg-amber-100 text-amber-800';
  return 'bg-red-100 text-red-800';
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div>
    <h3 className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2 pb-1.5 border-b border-blue-100">
      {title}
    </h3>
    {children}
  </div>
);

const ResumeRenderer: React.FC<ResumeRendererProps> = ({ content, className = '', showATSScore = false }) => {
  const { resume, atsScore } = useMemo(() => {
    if (!content) return { resume: null, atsScore: null };
    return {
      resume: parseResumeContent(content),
      atsScore: showATSScore ? calculateATSScore(content) : null,
    };
  }, [content, showATSScore]);

  if (!content || !resume) {
    return (
      <div className={`${className} flex flex-col items-center justify-center py-16 text-gray-400`}>
        <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-sm font-medium">No resume content</p>
        <p className="text-xs mt-1">Generate a resume to preview it here</p>
      </div>
    );
  }

  const contactParts: string[] = [];
  if (resume.contact.email) contactParts.push(resume.contact.email);
  if (resume.contact.phone) contactParts.push(resume.contact.phone);
  if (resume.contact.location) contactParts.push(resume.contact.location);
  if (resume.contact.linkedin) contactParts.push(resume.contact.linkedin);
  if (resume.contact.github) contactParts.push(resume.contact.github);
  if (resume.contact.portfolio) contactParts.push(resume.contact.portfolio);
  contactParts.push(...resume.contact.other);

  return (
    <div className={`resume-renderer ${className}`}>
      {/* ATS Score Panel */}
      {atsScore && (
        <div className={`mb-5 rounded-lg border p-4 ${scoreColor(atsScore.overall)}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-sm">ATS Compatibility Score</span>
            <span className={`text-lg font-bold px-3 py-0.5 rounded-full ${scoreBadgeColor(atsScore.overall)}`}>
              {atsScore.overall}%
            </span>
          </div>
          <div className="grid grid-cols-5 gap-2 text-xs mb-3">
            {[
              { label: 'Contact', val: atsScore.sections.contactInfo, max: 20 },
              { label: 'Skills', val: atsScore.sections.skills, max: 25 },
              { label: 'Experience', val: atsScore.sections.experience, max: 30 },
              { label: 'Education', val: atsScore.sections.education, max: 15 },
              { label: 'Format', val: atsScore.sections.formatting, max: 10 },
            ].map(({ label, val, max }) => (
              <div key={label} className="text-center rounded-md bg-white/60 p-1.5">
                <div className="font-medium">{label}</div>
                <div className="font-bold">{val}/{max}</div>
                <div className="mt-1 h-1 rounded-full bg-white/40 overflow-hidden">
                  <div className="h-full rounded-full bg-current opacity-40" style={{ width: `${(val / max) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
          {atsScore.suggestions.length > 0 && (
            <div className="pt-3 border-t border-current/10 text-xs space-y-1">
              <p className="font-medium mb-1">Suggestions:</p>
              {atsScore.suggestions.map((s, i) => (
                <p key={i} className="flex gap-1.5"><span className="opacity-60">-</span><span>{s}</span></p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Resume Document */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 bg-gradient-to-b from-slate-50 to-white border-b border-gray-100">
          <h1 className="text-2xl font-bold text-gray-900 text-center leading-tight">
            {resume.name || 'Your Name'}
          </h1>
          {resume.title && <p className="text-sm text-gray-500 text-center mt-1">{resume.title}</p>}
          {contactParts.length > 0 && (
            <div className="flex flex-wrap justify-center gap-x-2 gap-y-0.5 mt-2 text-xs text-gray-500">
              {contactParts.map((item, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span className="text-gray-300">|</span>}
                  <span>{item}</span>
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-5">
          {resume.summary.length > 0 && (
            <Section title="Professional Summary">
              <p className="text-sm text-gray-700 leading-relaxed">{resume.summary.join(' ')}</p>
            </Section>
          )}

          {resume.skills.length > 0 && (
            <Section title="Technical Skills">
              <div className="space-y-1.5">
                {resume.skills.map((group, i) => (
                  <div key={i} className="text-sm">
                    {group.category && <span className="font-semibold text-gray-800">{group.category}: </span>}
                    <span className="text-gray-600">{group.items.join(', ')}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {resume.experience.length > 0 && (
            <Section title="Professional Experience">
              <div className="relative space-y-0">
                {resume.experience.map((job, i) => (
                  <div key={i} className="relative pl-4 pb-5 last:pb-0 group">
                    {/* Timeline connector */}
                    {i < resume.experience.length - 1 && (
                      <div className="absolute left-[5px] top-3 bottom-0 w-px bg-gradient-to-b from-blue-300 to-blue-100" />
                    )}
                    {/* Timeline dot */}
                    <div className="absolute left-0 top-[7px] w-[11px] h-[11px] rounded-full border-2 border-blue-400 bg-white group-hover:bg-blue-50 transition-colors" />

                    {/* Job header */}
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                      <h4 className="font-semibold text-gray-900 text-sm leading-snug">{job.title}</h4>
                      {job.dates && (
                        <span className="inline-flex items-center text-[11px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                          {job.dates}
                        </span>
                      )}
                    </div>

                    {/* Company & location */}
                    {job.company && (
                      <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                        <svg className="w-3 h-3 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span className="italic">{job.company}{job.location ? ` \u2022 ${job.location}` : ''}</span>
                      </p>
                    )}

                    {/* Bullet points */}
                    {job.bullets.length > 0 && (
                      <ul className="mt-2 space-y-1.5">
                        {job.bullets.map((bullet, bi) => (
                          <li key={bi} className="flex gap-2 text-sm text-gray-700 leading-relaxed">
                            <span className="text-blue-400 mt-[7px] w-1.5 h-1.5 rounded-full bg-blue-300 flex-shrink-0" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {resume.education.length > 0 && (
            <Section title="Education">
              <div className="space-y-3">
                {resume.education.map((edu, i) => (
                  <div key={i}>
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                      <h4 className="font-semibold text-gray-900 text-sm">{edu.degree}</h4>
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
                    {edu.details.length > 0 && (
                      <ul className="mt-1 space-y-0.5">
                        {edu.details.map((d, di) => (
                          <li key={di} className="text-xs text-gray-600 flex gap-1.5">
                            <span className="text-gray-300">-</span><span>{d}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {resume.certifications.length > 0 && (
            <Section title="Certifications">
              <ul className="space-y-1">
                {resume.certifications.map((cert, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-700">
                    <span className="text-blue-400 mt-[7px] w-1.5 h-1.5 rounded-full bg-blue-300 flex-shrink-0" />
                    <span>{cert}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {resume.projects.length > 0 && (
            <Section title="Key Projects">
              <div className="grid gap-3">
                {resume.projects.map((proj, i) => (
                  <div key={i} className="rounded-md border border-gray-100 bg-gray-50/50 px-3 py-2.5">
                    <div className="flex items-baseline justify-between gap-2">
                      <h4 className="font-semibold text-gray-900 text-sm">{proj.name}</h4>
                    </div>
                    {proj.description && <p className="text-sm text-gray-600 mt-0.5">{proj.description}</p>}
                    {proj.technologies && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {proj.technologies.split(/[,;]/).map((t, ti) => (
                          <span key={ti} className="inline-block text-[10px] font-medium text-blue-700 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded">
                            {t.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                    {proj.bullets.length > 0 && (
                      <ul className="mt-1.5 space-y-0.5">
                        {proj.bullets.map((b, bi) => (
                          <li key={bi} className="flex gap-2 text-sm text-gray-700">
                            <span className="text-blue-400 mt-[7px] w-1.5 h-1.5 rounded-full bg-blue-300 flex-shrink-0" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {resume.additional.length > 0 && (
            <Section title="Additional Information">
              <ul className="space-y-1">
                {resume.additional.map((item, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-700">
                    <span className="text-blue-400 mt-1.5 text-[6px] leading-none flex-shrink-0">&#9679;</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {resume.summary.length === 0 && resume.skills.length === 0 &&
            resume.experience.length === 0 && resume.education.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">
                <p>No structured sections found.</p>
                <p className="mt-1 text-xs">Ensure your resume has sections like EXPERIENCE, SKILLS, EDUCATION.</p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ResumeRenderer;
