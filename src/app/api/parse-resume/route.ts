import { NextRequest } from 'next/server';
import { extractPDFText } from '@/lib/pdf-extractor';
import { extractDOCXText } from '@/lib/docx-extractor';
import { parseResumeWithOpenAI } from '@/lib/openai-parser';

const MAX_BYTES = parseInt(process.env.MAX_FILE_SIZE_MB ?? '10') * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return Response.json({ error: 'No file provided.' }, { status: 400 });
    }

    if (file.size > MAX_BYTES) {
      return Response.json(
        { error: `File too large. Maximum size is ${process.env.MAX_FILE_SIZE_MB ?? 10} MB.` },
        { status: 400 },
      );
    }

    const fileName = file.name.toLowerCase();
    const isPDF = fileName.endsWith('.pdf');
    const isDOCX = fileName.endsWith('.docx');

    if (!isPDF && !isDOCX) {
      return Response.json(
        { error: 'Invalid file type. Only PDF and DOCX files are supported.' },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    let text: string;
    if (isPDF) {
      text = await extractPDFText(buffer);
    } else {
      text = await extractDOCXText(buffer);
    }

    if (!text || text.trim().length < 50) {
      return Response.json(
        { error: 'Could not extract readable text from the file. Please try a different file.' },
        { status: 400 },
      );
    }

    const resumeData = await parseResumeWithOpenAI(text);
    return Response.json(resumeData);
  } catch (err) {
    console.error('[parse-resume]', err);
    const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
    return Response.json({ error: message }, { status: 500 });
  }
}
