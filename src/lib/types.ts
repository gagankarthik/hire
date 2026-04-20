export interface TokenStats {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost: number;
  model: string;
}

export interface Subsection {
  title?: string;
  content: string[];
}

export interface SummarySection {
  title?: string;
  content: string[];
}

export interface Project {
  projectName?: string;
  title?: string;
  name?: string;
  projectTitle?: string;
  projectLocation?: string;
  workPeriod?: string;
  projectResponsibilities: string[];
  keyTechnologies?: string;
}

export interface EmploymentEntry {
  companyName: string;
  roleName: string;
  location?: string;
  workPeriod: string;
  department?: string;
  subRole?: string;
  description?: string;
  responsibilities: string[];
  keyTechnologies?: string;
  projects?: Project[];
  subsections?: Subsection[];
}

export interface EducationEntry {
  degree: string;
  areaOfStudy: string;
  school: string;
  location: string;
  date: string;
  wasAwarded: boolean;
}

export interface Certification {
  name: string;
  issuedBy: string;
  dateObtained: string;
  certificationNumber?: string;
  expirationDate?: string;
}

export interface SubCategory {
  name: string;
  skills: string[];
}

export interface SkillCategory {
  categoryName: string;
  skills: string[];
  subCategories?: SubCategory[];
}

export interface ResumeData {
  tokenStats?: TokenStats;
  name: string;
  title: string;
  requisitionNumber?: string;
  professionalSummary: string[];
  employmentHistory: EmploymentEntry[];
  education: EducationEntry[];
  certifications: Certification[];
  technicalSkills?: Record<string, string | string[]>;
  skillCategories?: SkillCategory[];
  summarySections?: SummarySection[];
  subsections?: SummarySection[];
}
