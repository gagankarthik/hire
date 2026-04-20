'use client';

import React from 'react';
import type {
  ResumeData, EmploymentEntry, Project, EducationEntry,
  Certification, SkillCategory,
} from '@/lib/types';

interface ResumeEditorProps {
  resumeData: ResumeData;
  onChange: (data: ResumeData) => void;
}

// ── tiny helpers ──────────────────────────────────────────────────────────────

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-blue focus:border-transparent ${props.className ?? ''}`}
  />
);

const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    rows={3}
    {...props}
    className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-blue focus:border-transparent resize-y ${props.className ?? ''}`}
  />
);

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">{children}</label>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-base font-bold text-ocean-dark border-b border-ocean-blue pb-1 mb-4">{children}</h3>
);

const AddBtn = ({ onClick, label }: { onClick: () => void; label: string }) => (
  <button
    type="button"
    onClick={onClick}
    className="mt-2 text-xs font-medium text-ocean-blue hover:text-ocean-dark flex items-center space-x-1"
  >
    <span className="text-lg leading-none">+</span>
    <span>{label}</span>
  </button>
);

const RemoveBtn = ({ onClick }: { onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="text-red-400 hover:text-red-600 text-xs font-medium ml-2"
    title="Remove"
  >
    ✕ Remove
  </button>
);

// ── sub-sections ──────────────────────────────────────────────────────────────

function ArrayStringEditor({
  label,
  items,
  onChange,
  placeholder,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}) {
  const update = (i: number, val: string) => {
    const next = [...items];
    next[i] = val;
    onChange(next);
  };
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, '']);

  return (
    <div className="mb-3">
      <Label>{label}</Label>
      {items.map((item, i) => (
        <div key={i} className="flex items-start mb-1 gap-1">
          <Textarea
            rows={2}
            value={item}
            placeholder={placeholder}
            onChange={e => update(i, e.target.value)}
          />
          <button type="button" onClick={() => remove(i)} className="mt-1 text-red-400 hover:text-red-600 text-lg leading-none flex-shrink-0">×</button>
        </div>
      ))}
      <AddBtn onClick={add} label={`Add ${label}`} />
    </div>
  );
}

function ProjectEditor({
  projects,
  onChange,
}: {
  projects: Project[];
  onChange: (projects: Project[]) => void;
}) {
  const update = (i: number, partial: Partial<Project>) => {
    const next = [...projects];
    next[i] = { ...next[i], ...partial };
    onChange(next);
  };
  const remove = (i: number) => onChange(projects.filter((_, idx) => idx !== i));
  const add = () =>
    onChange([...projects, { projectName: '', projectLocation: '', projectResponsibilities: [], keyTechnologies: '' }]);

  return (
    <div className="mb-3">
      <Label>Projects</Label>
      {projects.map((proj, i) => (
        <div key={i} className="border border-blue-100 rounded-lg p-3 mb-3 bg-blue-50">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-blue-700">Project {i + 1}</span>
            <RemoveBtn onClick={() => remove(i)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
            <div>
              <Label>Project Name</Label>
              <Input value={proj.projectName ?? ''} onChange={e => update(i, { projectName: e.target.value })} />
            </div>
            <div>
              <Label>Project Location</Label>
              <Input value={proj.projectLocation ?? ''} onChange={e => update(i, { projectLocation: e.target.value })} />
            </div>
          </div>
          <div className="mb-2">
            <Label>Key Technologies</Label>
            <Input
              value={proj.keyTechnologies ?? ''}
              placeholder="React, Node.js, PostgreSQL"
              onChange={e => update(i, { keyTechnologies: e.target.value })}
            />
          </div>
          <ArrayStringEditor
            label="Project Responsibilities"
            items={proj.projectResponsibilities ?? []}
            onChange={resp => update(i, { projectResponsibilities: resp })}
            placeholder="Describe a responsibility…"
          />
        </div>
      ))}
      <AddBtn onClick={add} label="Add Project" />
    </div>
  );
}

function JobEditor({
  jobs,
  onChange,
}: {
  jobs: EmploymentEntry[];
  onChange: (jobs: EmploymentEntry[]) => void;
}) {
  const update = (i: number, partial: Partial<EmploymentEntry>) => {
    const next = [...jobs];
    next[i] = { ...next[i], ...partial };
    onChange(next);
  };
  const remove = (i: number) => onChange(jobs.filter((_, idx) => idx !== i));
  const add = () =>
    onChange([
      ...jobs,
      {
        companyName: '', roleName: '', location: '', workPeriod: '',
        department: '', responsibilities: [], keyTechnologies: '', projects: [],
      },
    ]);

  return (
    <div>
      {jobs.map((job, i) => (
        <details key={i} className="mb-4 border border-gray-200 rounded-xl overflow-hidden">
          <summary className="bg-gray-50 px-4 py-3 cursor-pointer font-medium text-gray-800 flex justify-between items-center">
            <span>{job.companyName || `Job ${i + 1}`} — {job.roleName || 'Role'}</span>
            <RemoveBtn onClick={() => remove(i)} />
          </summary>
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Company Name</Label>
                <Input value={job.companyName} onChange={e => update(i, { companyName: e.target.value })} />
              </div>
              <div>
                <Label>Role / Job Title</Label>
                <Input value={job.roleName} onChange={e => update(i, { roleName: e.target.value })} />
              </div>
              <div>
                <Label>Work Period</Label>
                <Input value={job.workPeriod} placeholder="Jan 2020 - Present" onChange={e => update(i, { workPeriod: e.target.value })} />
              </div>
              <div>
                <Label>Location</Label>
                <Input value={job.location ?? ''} placeholder="Columbus, OH" onChange={e => update(i, { location: e.target.value })} />
              </div>
              <div>
                <Label>Department / Sub-Role</Label>
                <Input value={job.department ?? ''} onChange={e => update(i, { department: e.target.value })} />
              </div>
              <div>
                <Label>Key Technologies</Label>
                <Input value={job.keyTechnologies ?? ''} placeholder="Java, Spring Boot, AWS" onChange={e => update(i, { keyTechnologies: e.target.value })} />
              </div>
            </div>
            <ArrayStringEditor
              label="Responsibilities"
              items={job.responsibilities ?? []}
              onChange={r => update(i, { responsibilities: r })}
              placeholder="Describe a responsibility…"
            />
            <ProjectEditor
              projects={job.projects ?? []}
              onChange={p => update(i, { projects: p })}
            />
          </div>
        </details>
      ))}
      <AddBtn onClick={add} label="Add Job" />
    </div>
  );
}

function EducationEditor({
  education,
  onChange,
}: {
  education: EducationEntry[];
  onChange: (education: EducationEntry[]) => void;
}) {
  const update = (i: number, partial: Partial<EducationEntry>) => {
    const next = [...education];
    next[i] = { ...next[i], ...partial };
    onChange(next);
  };
  const remove = (i: number) => onChange(education.filter((_, idx) => idx !== i));
  const add = () =>
    onChange([...education, { degree: '', areaOfStudy: '', school: '', location: '', date: '', wasAwarded: true }]);

  return (
    <div>
      {education.map((edu, i) => (
        <div key={i} className="border border-gray-200 rounded-xl p-4 mb-3">
          <div className="flex justify-between mb-2">
            <span className="text-xs font-bold text-gray-600">Education {i + 1}</span>
            <RemoveBtn onClick={() => remove(i)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label>Degree</Label>
              <Input value={edu.degree} placeholder="Bachelor of Science" onChange={e => update(i, { degree: e.target.value })} />
            </div>
            <div>
              <Label>Area of Study</Label>
              <Input value={edu.areaOfStudy} placeholder="Computer Science" onChange={e => update(i, { areaOfStudy: e.target.value })} />
            </div>
            <div>
              <Label>School / University</Label>
              <Input value={edu.school} onChange={e => update(i, { school: e.target.value })} />
            </div>
            <div>
              <Label>Location</Label>
              <Input value={edu.location} placeholder="Columbus, OH" onChange={e => update(i, { location: e.target.value })} />
            </div>
            <div>
              <Label>Date (MM/YY)</Label>
              <Input value={edu.date} placeholder="05/23" onChange={e => update(i, { date: e.target.value })} />
            </div>
            <div className="flex items-center space-x-2 pt-5">
              <input
                type="checkbox"
                id={`awarded-${i}`}
                checked={edu.wasAwarded}
                onChange={e => update(i, { wasAwarded: e.target.checked })}
                className="w-4 h-4 accent-ocean-blue"
              />
              <label htmlFor={`awarded-${i}`} className="text-sm text-gray-700">Degree Awarded</label>
            </div>
          </div>
        </div>
      ))}
      <AddBtn onClick={add} label="Add Education" />
    </div>
  );
}

function CertificationEditor({
  certifications,
  onChange,
}: {
  certifications: Certification[];
  onChange: (certifications: Certification[]) => void;
}) {
  const update = (i: number, partial: Partial<Certification>) => {
    const next = [...certifications];
    next[i] = { ...next[i], ...partial };
    onChange(next);
  };
  const remove = (i: number) => onChange(certifications.filter((_, idx) => idx !== i));
  const add = () =>
    onChange([...certifications, { name: '', issuedBy: '', dateObtained: '', certificationNumber: '', expirationDate: '' }]);

  return (
    <div>
      {certifications.map((cert, i) => (
        <div key={i} className="border border-gray-200 rounded-xl p-4 mb-3">
          <div className="flex justify-between mb-2">
            <span className="text-xs font-bold text-gray-600">Certification {i + 1}</span>
            <RemoveBtn onClick={() => remove(i)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <Label>Certification Name</Label>
              <Input value={cert.name} onChange={e => update(i, { name: e.target.value })} />
            </div>
            <div>
              <Label>Issued By</Label>
              <Input value={cert.issuedBy} onChange={e => update(i, { issuedBy: e.target.value })} />
            </div>
            <div>
              <Label>Date Obtained (MM/YY)</Label>
              <Input value={cert.dateObtained} placeholder="06/22" onChange={e => update(i, { dateObtained: e.target.value })} />
            </div>
            <div>
              <Label>Certification Number</Label>
              <Input value={cert.certificationNumber ?? ''} onChange={e => update(i, { certificationNumber: e.target.value })} />
            </div>
            <div>
              <Label>Expiration Date (MM/YY)</Label>
              <Input value={cert.expirationDate ?? ''} placeholder="06/25 (or N/A)" onChange={e => update(i, { expirationDate: e.target.value })} />
            </div>
          </div>
        </div>
      ))}
      <AddBtn onClick={add} label="Add Certification" />
    </div>
  );
}

function SkillsEditor({
  skillCategories,
  onChange,
}: {
  skillCategories: SkillCategory[];
  onChange: (cats: SkillCategory[]) => void;
}) {
  const updateCat = (i: number, partial: Partial<SkillCategory>) => {
    const next = [...skillCategories];
    next[i] = { ...next[i], ...partial };
    onChange(next);
  };
  const removeCat = (i: number) => onChange(skillCategories.filter((_, idx) => idx !== i));
  const addCat = () => onChange([...skillCategories, { categoryName: '', skills: [], subCategories: [] }]);

  return (
    <div>
      {skillCategories.map((cat, i) => (
        <div key={i} className="border border-gray-200 rounded-xl p-4 mb-3">
          <div className="flex justify-between mb-2">
            <span className="text-xs font-bold text-gray-600">Category {i + 1}</span>
            <RemoveBtn onClick={() => removeCat(i)} />
          </div>
          <div className="mb-2">
            <Label>Category Name</Label>
            <Input value={cat.categoryName} placeholder="Programming Languages" onChange={e => updateCat(i, { categoryName: e.target.value })} />
          </div>
          <div>
            <Label>Skills (comma-separated)</Label>
            <Textarea
              rows={2}
              value={Array.isArray(cat.skills) ? cat.skills.join(', ') : cat.skills}
              placeholder="Python, JavaScript, TypeScript"
              onChange={e => updateCat(i, { skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
            />
          </div>
        </div>
      ))}
      <AddBtn onClick={addCat} label="Add Skill Category" />
    </div>
  );
}

// ── Main ResumeEditor component ───────────────────────────────────────────────

export default function ResumeEditor({ resumeData, onChange }: ResumeEditorProps) {
  const set = <K extends keyof ResumeData>(key: K, value: ResumeData[K]) =>
    onChange({ ...resumeData, [key]: value });

  return (
    <div className="space-y-8">
      {/* Basic Info */}
      <section>
        <SectionTitle>Basic Information</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Full Name</Label>
            <Input value={resumeData.name} onChange={e => set('name', e.target.value)} placeholder="John Doe" />
          </div>
          <div>
            <Label>Title / Role</Label>
            <Input value={resumeData.title} onChange={e => set('title', e.target.value)} placeholder="Senior Software Engineer" />
          </div>
          <div className="md:col-span-2">
            <Label>Requisition Number (optional)</Label>
            <Input
              value={resumeData.requisitionNumber ?? ''}
              onChange={e => set('requisitionNumber', e.target.value)}
              placeholder="Leave blank if not applicable"
            />
          </div>
        </div>
      </section>

      {/* Professional Summary */}
      <section>
        <SectionTitle>Professional Summary</SectionTitle>
        <ArrayStringEditor
          label="Summary Bullets"
          items={resumeData.professionalSummary ?? []}
          onChange={v => set('professionalSummary', v)}
          placeholder="Experienced software engineer with 5+ years…"
        />
      </section>

      {/* Employment History */}
      <section>
        <SectionTitle>Employment History</SectionTitle>
        <JobEditor
          jobs={resumeData.employmentHistory ?? []}
          onChange={v => set('employmentHistory', v)}
        />
      </section>

      {/* Education */}
      <section>
        <SectionTitle>Education</SectionTitle>
        <EducationEditor
          education={resumeData.education ?? []}
          onChange={v => set('education', v)}
        />
      </section>

      {/* Certifications */}
      <section>
        <SectionTitle>Certifications</SectionTitle>
        <CertificationEditor
          certifications={resumeData.certifications ?? []}
          onChange={v => set('certifications', v)}
        />
      </section>

      {/* Technical Skills */}
      <section>
        <SectionTitle>Technical Skills</SectionTitle>
        <SkillsEditor
          skillCategories={resumeData.skillCategories ?? []}
          onChange={v => set('skillCategories', v)}
        />
      </section>
    </div>
  );
}
