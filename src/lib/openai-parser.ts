import OpenAI from 'openai';
import type { ResumeData } from './types';

const SYSTEM_PROMPT = `You are a resume parsing expert. Extract structured information from the resume text into the exact JSON format below. Return ONLY valid JSON — no markdown, no code blocks, no explanation.

{
  "name": "Full candidate name",
  "title": "Current or most recent job title",
  "requisitionNumber": "",
  "professionalSummary": ["Bullet 1", "Bullet 2"],
  "employmentHistory": [
    {
      "companyName": "Company Name",
      "roleName": "Job Title",
      "location": "City, State",
      "workPeriod": "MMM YYYY - MMM YYYY",
      "department": "",
      "subRole": "",
      "description": "",
      "responsibilities": ["Responsibility 1"],
      "keyTechnologies": "Tech1, Tech2",
      "projects": [
        {
          "projectName": "Clean project name without dates or location",
          "projectLocation": "",
          "workPeriod": "",
          "projectResponsibilities": ["Responsibility 1"],
          "keyTechnologies": "Tech1, Tech2"
        }
      ],
      "subsections": []
    }
  ],
  "education": [
    {
      "degree": "Bachelor of Science",
      "areaOfStudy": "Computer Science",
      "school": "University Name",
      "location": "City, State",
      "date": "MM/YY",
      "wasAwarded": true
    }
  ],
  "certifications": [
    {
      "name": "Certification Name",
      "issuedBy": "Issuing Organization",
      "dateObtained": "MM/YY",
      "certificationNumber": "",
      "expirationDate": ""
    }
  ],
  "skillCategories": [
    {
      "categoryName": "Category Name",
      "skills": ["Skill1", "Skill2"],
      "subCategories": []
    }
  ],
  "summarySections": []
}

Rules:
1. Work period: "MMM YYYY - MMM YYYY" or "MMM YYYY - Present"
2. Project names must NOT include date ranges or location text
3. wasAwarded = true unless degree is explicitly stated as incomplete
4. Split professionalSummary on inline "•" separators into separate array items
5. Return all fields even if empty (empty string or empty array)
6. If no certifications exist, return empty array
7. Group technical skills into logical skillCategories`;

function calculateCost(promptTokens: number, completionTokens: number, model: string): number {
  const pricing: Record<string, { input: number; output: number }> = {
    'gpt-4o-mini': { input: 0.15, output: 0.60 },
    'gpt-4o': { input: 3.00, output: 10.00 },
    'gpt-4': { input: 30.00, output: 60.00 },
  };
  const p = pricing[model] ?? pricing['gpt-4o-mini'];
  return (promptTokens * p.input + completionTokens * p.output) / 1_000_000;
}

export async function parseResumeWithOpenAI(text: string): Promise<ResumeData> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';

  const response = await openai.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Parse this resume:\n\n${text}` },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.1,
  });

  const promptTokens = response.usage?.prompt_tokens ?? 0;
  const completionTokens = response.usage?.completion_tokens ?? 0;
  const totalTokens = response.usage?.total_tokens ?? 0;
  const cost = calculateCost(promptTokens, completionTokens, model);

  const rawData = JSON.parse(response.choices[0].message.content ?? '{}') as Partial<ResumeData>;

  return {
    name: '',
    title: '',
    professionalSummary: [],
    employmentHistory: [],
    education: [],
    certifications: [],
    ...rawData,
    tokenStats: { promptTokens, completionTokens, totalTokens, cost, model },
  };
}
