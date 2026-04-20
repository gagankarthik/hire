Here's a complete `README.md` file that serves as an **AI prompt** for Claude Code to build your resume parser system with the Ohio format you provided.

```markdown
# Resume Parser & Multi-State Export System

## Project Overview

Build a **Next.js 14+** application that allows users to upload a resume (PDF/DOCX), extract structured data using OpenAI LLM, edit the extracted information, select a state format (starting with Ohio), and export as Word document (.docx) only.

## Tech Stack Required

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **UI Library**: React 18+
- **Styling**: Tailwind CSS + Shadcn/ui components
- **File Upload**: react-dropzone
- **PDF Parsing**: pdf-parse
- **DOCX Parsing**: mammoth
- **LLM Integration**: OpenAI API (GPT-4o-mini recommended for cost efficiency)
- **DOCX Generation**: docx + file-saver
- **Icons**: lucide-react or react-icons
- **Form Validation**: Zod
- **State Management**: React hooks (useState, useEffect, useContext)

## Core Features

### 1. Resume Upload & Parsing
- Support PDF and DOCX file uploads (max 10MB)
- Extract text content from uploaded files
- Send extracted text to OpenAI API for structured data extraction
- Display token usage and cost analytics after parsing

### 2. Resume Data Structure (Output from OpenAI)

The LLM should extract the following JSON structure:

```typescript
interface ResumeData {
  // Token usage tracking
  tokenStats?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    cost: number;
    model: string;
  };
  
  // Candidate Information
  name: string;
  title: string;
  requisitionNumber?: string;
  
  // Professional Summary
  professionalSummary: string[];  // Array of bullet points
  
  // Employment History
  employmentHistory: EmploymentEntry[];
  
  // Education
  education: EducationEntry[];
  
  // Certifications
  certifications: Certification[];
  
  // Technical Skills (legacy flat format)
  technicalSkills?: Record<string, string | string[]>;
  
  // Technical Skills (nested categories)
  skillCategories?: SkillCategory[];
  
  // Additional sections (optional)
  summarySections?: SummarySection[];
  subsections?: SummarySection[];
}

interface EmploymentEntry {
  companyName: string;
  roleName: string;
  location?: string;
  workPeriod: string;  // e.g., "Jan 2020 - Present"
  department?: string;
  subRole?: string;
  description?: string;
  responsibilities: string[];
  keyTechnologies?: string;
  projects?: Project[];
  subsections?: Subsection[];
}

interface Project {
  projectName?: string;
  title?: string;
  name?: string;
  projectTitle?: string;
  projectLocation?: string;
  workPeriod?: string;
  projectResponsibilities: string[];
  keyTechnologies?: string;
}

interface EducationEntry {
  degree: string;           // e.g., "Bachelor of Science"
  areaOfStudy: string;      // e.g., "Computer Science"
  school: string;           // Institution name
  location: string;         // City, State or City, Country
  date: string;             // Graduation date (MM/YY)
  wasAwarded: boolean;      // Whether degree was completed
}

interface Certification {
  name: string;
  issuedBy: string;
  dateObtained: string;     // MM/YY format
  certificationNumber?: string;
  expirationDate?: string;  // MM/YY format, if applicable
}

interface SkillCategory {
  categoryName: string;
  skills: string[];
  subCategories?: SubCategory[];
}

interface SubCategory {
  name: string;
  skills: string[];
}

interface SummarySection {
  title?: string;
  content: string[];
}

interface Subsection {
  title?: string;
  content: string[];
}
```

### 3. OpenAI Prompt for Resume Parsing

Use this system prompt for OpenAI:

```
You are a resume parsing expert. Extract structured information from the resume text into the exact JSON format specified. Follow these rules:

1. EMPLOYMENT HISTORY:
   - Extract each job as a separate employment entry
   - If a job has multiple projects, list them in the projects array
   - Project names should NOT include date ranges or location information
   - Responsibilities should be individual bullet points (array of strings)
   - Work period format: "MMM YYYY - MMM YYYY" or "MMM YYYY - Present"
   - Location: Extract city and state/country (will be formatted later)

2. EDUCATION:
   - Extract degree, area of study, school, location, date
   - Set wasAwarded to true unless explicitly stated as incomplete
   - Sort by degree level (Associate < Bachelor < Master < Doctorate)

3. CERTIFICATIONS:
   - Extract name, issuing body, date obtained
   - Include certification number and expiration date if present

4. TECHNICAL SKILLS:
   - Support both flat format (technicalSkills object) and nested categories (skillCategories array)
   - Group related skills under appropriate category names

5. PROFESSIONAL SUMMARY:
   - Extract as array of bullet points
   - Split multi-sentence items when they contain inline bullets (•)

6. TOKEN TRACKING:
   - Return token usage information separately

Use GPT-4o-mini for cost efficiency (approx $0.0005-0.001 per resume)
```

### 4. Ohio State Format (DOCX Generation)

The Ohio format is already implemented in the `GeneratedResume` component provided. Key Ohio-specific rules:

- **Education Table**: 6-column table with specific column widths
- **Certifications Table**: 5-column table with specific column widths
- **Employment History**: Right-aligned tab stops for company/date and role/location
- **Project Display**: "Project N:" prefix only when multiple projects exist
- **Location Formatting**: 
  - India → "India" only
  - USA → State abbreviation (e.g., "OH")
  - Other countries → Full location string
- **Bullet Points**: Symbol font bullets (•) with hanging indent
- **Fonts**: Times New Roman for headers, Calibri 11pt for body
- **Colors**: #1F497D (ocean blue) for headers

### 5. Editable Resume Interface

After parsing, users should be able to edit all extracted fields:

- **Inline editing** for text fields (name, title, requisition number)
- **Add/remove/edit** employment history entries
- **Add/remove/edit** projects within each job
- **Add/remove/edit** education entries
- **Add/remove/edit** certifications
- **Add/remove/edit** professional summary bullets
- **Add/remove/edit** technical skills categories
- **Live preview** that updates as user edits

### 6. State Selection & Export

- Dropdown showing available states (initially only "Ohio")
- Future states (California, Texas, New York) can be added by creating new formatters
- **Export only to Word (.docx)** - no PDF or CSV for this version
- Download button triggers DOCX generation using the docx library

## Project Structure

```
resume-parser-app/
├── app/
│   ├── api/
│   │   ├── parse-resume/
│   │   │   └── route.ts          # POST: upload + OpenAI parsing
│   │   ├── available-states/
│   │   │   └── route.ts          # GET: list available state formatters
│   │   └── export/
│   │       └── route.ts          # POST: generate DOCX (optional)
│   ├── page.tsx                   # Main application page
│   ├── layout.tsx                 # Root layout with fonts
│   └── globals.css                # Tailwind imports
├── components/
│   ├── ui/                        # Shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── textarea.tsx
│   │   ├── select.tsx
│   │   ├── dialog.tsx
│   │   ├── tabs.tsx
│   │   └── toast.tsx
│   ├── states/
│   │   ├── ohio/
│   │   │   └── formatter.tsx      # Ohio format component (provided)
│   │   ├── california/            # Future
│   │   └── texas/                 # Future
│   ├── ResumeUploader.tsx         # Drag-drop file upload
│   ├── ResumeEditor.tsx           # Editable form for resume data
│   ├── EmploymentEditor.tsx       # Edit employment entries
│   ├── EducationEditor.tsx        # Edit education entries
│   ├── CertificationEditor.tsx    # Edit certifications
│   ├── SkillsEditor.tsx           # Edit technical skills
│   ├── StateSelector.tsx          # Dropdown for state selection
│   ├── ExportButton.tsx           # Download DOCX button
│   ├── TokenDisplay.tsx           # Show token usage/cost
│   └── GeneratedResume.tsx        # Ohio format preview (provided)
├── lib/
│   ├── openai-parser.ts           # OpenAI API integration
│   ├── pdf-extractor.ts           # pdf-parse wrapper
│   ├── docx-extractor.ts          # mammoth wrapper
│   ├── state-dispatcher.ts        # Dynamic state loader
│   ├── docx-generator.ts          # DOCX generation helper
│   ├── validators.ts              # Zod schemas
│   └── types.ts                   # TypeScript interfaces
├── hooks/
│   ├── useResumeParser.ts         # Parse mutation hook
│   ├── useResumeEditor.ts         # Edit state management
│   └── useExport.ts               # Export mutation hook
├── public/                        # Static assets
├── .env.local                     # Environment variables
├── tailwind.config.js             # Tailwind config with Shadcn
├── next.config.js                 # Next.js config
├── package.json                   # Dependencies
└── README.md                      # This file
```

## Environment Variables

Create `.env.local`:

```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini  # or gpt-4o for higher accuracy
NEXT_PUBLIC_APP_URL=http://localhost:3000
MAX_FILE_SIZE_MB=10
```

## Implementation Steps for Claude Code

### Step 1: Project Setup
```bash
npx create-next-app@latest resume-parser-app --typescript --tailwind --app
cd resume-parser-app
npm install pdf-parse mammoth openai zod react-dropzone lucide-react
npm install docx file-saver
npm install @radix-ui/react-dialog @radix-ui/react-select @radix-ui/react-tabs
npm install -D @types/file-saver
```

### Step 2: Configure Shadcn/ui
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input textarea select dialog tabs toast
```

### Step 3: Implement File Upload & Text Extraction

Create `lib/pdf-extractor.ts`:
```typescript
import pdf from 'pdf-parse';

export async function extractPDFText(buffer: Buffer): Promise<string> {
  const data = await pdf(buffer);
  return data.text;
}
```

Create `lib/docx-extractor.ts`:
```typescript
import mammoth from 'mammoth';

export async function extractDOCXText(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}
```

### Step 4: Implement OpenAI Parser

Create `lib/openai-parser.ts` with the system prompt above. Include token usage tracking:

```typescript
const response = await openai.chat.completions.create({
  model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  messages: [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: `Parse this resume:\n\n${extractedText}` }
  ],
  response_format: { type: 'json_object' },
  temperature: 0.1,
});

const cost = calculateCost(
  response.usage.prompt_tokens,
  response.usage.completion_tokens,
  model
);
```

### Step 5: Implement API Route for Parsing

Create `app/api/parse-resume/route.ts`:
- Accept multipart/form-data with file
- Validate file type (PDF/DOCX)
- Extract text based on file type
- Call OpenAI parser
- Return JSON with resume data + token stats

### Step 6: Implement the Ohio Format Component

Use the `GeneratedResume` component provided in the prompt. Key functions to include:

- `formatEmploymentLocation()` - Formats location to Ohio standards
- `formatProjectTitle()` - Adds "Project N:" prefix for multiple projects
- `sortEducation()` - Sorts by degree level
- `normalizeMonthAbbr()` - Standardizes month abbreviations
- `splitBulletItems()` - Splits inline bullets into separate items
- `createEducationTable()` - DOCX table generation
- `createCertificationsTable()` - DOCX table generation
- `createEmploymentHistory()` - DOCX employment section
- `createTechnicalSkills()` - DOCX skills section
- `handleDownloadWord()` - Main export function

### Step 7: Implement Editable Resume Editor

Create `components/ResumeEditor.tsx` with:
- Form sections for each data category
- Add/remove buttons for arrays (employment, education, certifications)
- Inline editing with debounced updates
- Live preview synchronization

### Step 8: Implement Main Page

Create `app/page.tsx` with workflow:
1. Upload section (drag-drop or click)
2. Loading state while parsing
3. Token usage display after parsing
4. Tabbed interface: Edit | Preview
5. State selector dropdown
6. Export button (calls the Ohio formatter's handleDownloadWord)

### Step 9: Implement State Dispatcher

Create `lib/state-dispatcher.ts`:
```typescript
export async function getAvailableStates(): Promise<string[]> {
  // Read components/states/ directory
  // Return ['ohio', ...] based on existing folders
}

export async function loadStateFormatter(state: string) {
  // Dynamically import the state's formatter component
  return await import(`@/components/states/${state}/formatter`);
}
```

### Step 10: Add Styling

Tailwind configuration with Ohio colors:
```javascript
// tailwind.config.js
colors: {
  'ocean-dark': '#1F497D',
  'ocean-blue': '#0b6cb5',
  'ocean-light': '#e8f0fe',
}
```

## Key Ohio Format Requirements (from provided code)

The provided `GeneratedResume` component already implements:

1. **Location Formatting**:
   - India detection via state names list
   - US state abbreviation mapping (full name → 2-letter)
   - Returns "India" or state code (e.g., "OH")

2. **Project Title Formatting**:
   - Removes "Project N:" prefixes from raw data
   - Removes embedded date ranges
   - Removes location from name when redundant
   - Adds "Project N:" prefix ONLY when multiple projects exist

3. **Education Sorting**:
   - Degree rank: AA/AS (1) < BA/BS (2) < MA/MS/MBA (3) < PhD (4)

4. **Bullet Point Handling**:
   - Strips leading bullet characters
   - Splits inline "•" separators into individual bullets

5. **DOCX Generation Options**:
   - Column widths: Education (1653,1901,2684,1712,1524,1316)
   - Column widths: Certifications (3417,2424,1834,1644,1471)
   - Page margins: 720 twips all sides
   - Right tab stop at 10800 twips

## Error Handling Requirements

- File size validation (>10MB shows error)
- File type validation (only PDF/DOCX)
- OpenAI API errors (show user-friendly message)
- Empty extraction fallback (manual entry option)
- Network errors with retry option

## Performance Requirements

- Show loading states for all async operations
- Debounce editor updates (300ms) before preview refresh
- Lazy load state formatters (only load Ohio when selected)
- Implement request cancellation for file uploads

## Future Extensibility

To add a new state (e.g., California):
1. Create `components/states/california/formatter.tsx`
2. Implement the same interface as Ohio
3. System auto-detects and shows in dropdown
4. No changes to core logic required

## Deliverables

Claude Code must produce:
1. Complete working Next.js application with all files
2. All components properly typed with TypeScript
3. Proper error handling and loading states
4. Responsive design (desktop-first, mobile-friendly)
5. Working Word document export matching Ohio format exactly
6. Token usage display showing cost per resume

## Testing Requirements

Provide a sample resume.txt file for testing that includes:
- Multiple jobs with multiple projects
- Education entries with various degree levels
- Certifications with expiration dates
- Technical skills in nested categories
- Professional summary with inline bullets

## Example Usage Flow

1. User clicks upload, selects `John_Doe_Resume.pdf`
2. System extracts text (500ms)
3. OpenAI processes and returns structured JSON (2-3 seconds)
4. Token display shows: Input: 2,345 | Output: 1,234 | Cost: $0.0008
5. User reviews extracted data in Edit tab
6. User fixes any mis-extracted fields
7. User clicks Preview tab to see Ohio format
8. User selects "Ohio" from state dropdown
9. User clicks "Download Word" button
10. Browser downloads `John_Doe_Resume.docx` with Ohio formatting

## Notes for Claude Code

- The Ohio format component is already provided in full - integrate it as `components/GeneratedResume.tsx`
- Focus on building the upload, parsing, editing, and export orchestration
- Use the provided code as the Ohio formatter - do not modify its core logic
- Ensure all imports and dependencies match the provided component's requirements
- The component uses `lucide icons` - install `lucide-icons` package
- The component expects `resumeData` prop with the exact structure defined above

---

**Build this complete system. Start with Ohio as the only state, but structure it for easy addition of more states later.**
```

This README provides everything Claude Code needs to build your complete resume parser system with the Ohio format you provided.