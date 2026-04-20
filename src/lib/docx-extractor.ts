import mammoth from 'mammoth';

export async function extractDOCXText(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}
