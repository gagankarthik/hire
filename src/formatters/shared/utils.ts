import type { EducationEntry, Project } from '@/lib/types';

// ── String helpers ────────────────────────────────────────────────────────────

export const escapeRegExp = (value = '') =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Strip any leading bullet character so we never end up with double bullets. */
export const stripBullet = (text = '') =>
  text.replace(/^[\u2022\u25CF\u25E6\u2023\u2043\u2219\u00B7\u25CB\u25AA\u25B8\-\u2013\u2014*]\s*/, '').trim();

/** Normalise partial/variant month abbreviations to standard 3-letter form. */
export const normalizeMonthAbbr = (dateStr = '') => {
  if (!dateStr || typeof dateStr !== 'string') return dateStr;
  const map: Record<string, string> = {
    january: 'Jan', february: 'Feb', march: 'Mar', april: 'Apr',
    june: 'Jun', july: 'Jul', august: 'Aug',
    september: 'Sep', october: 'Oct', november: 'Nov', december: 'Dec',
    sept: 'Sep', octo: 'Oct',
  };
  return dateStr.replace(
    /\b(january|february|march|april|june|july|august|september|october|november|december|sept|octo)\b/gi,
    m => map[m.toLowerCase()] ?? m,
  );
};

/** Split a string on inline "•" separators into individual items. */
export const splitBulletItems = (text = ''): string[] => {
  if (!text || typeof text !== 'string') return [text];
  if (!text.includes('\u2022') && !text.includes(' • ')) return [text];
  return text.split(/\s*[•\u2022]\s*/).map(s => s.trim()).filter(Boolean);
};

// ── Degree sorting ────────────────────────────────────────────────────────────

export const normalizeDegree = (degree = '') =>
  degree.toUpperCase().replace(/\./g, '').replace(/\s+/g, ' ').trim();

export const degreeRank = (degree = ''): number => {
  const normalized = normalizeDegree(degree);
  const compact = normalized.replace(/\s+/g, '');
  if (/\b(AA|AS|ASSOCIATE)\b/.test(normalized)) return 1;
  if (/\b(BA|BS|BSC|BACHELOR|BE)\b/.test(normalized) || /BTECH/.test(compact)) return 2;
  if (/\b(MA|MS|MBA|MASTER)\b/.test(normalized) || /MTECH/.test(compact)) return 3;
  if (/\b(PHD|DOCTOR|DOCTORATE|DOCTORAL|DOCTOROL)\b/.test(normalized) || /PHD/.test(compact)) return 4;
  return 5;
};

export const sortEducation = (education: EducationEntry[] = []) =>
  education
    .map((edu, index) => ({ edu, index, rank: degreeRank(edu.degree) }))
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .map(({ edu }) => edu);

// ── Location helpers ──────────────────────────────────────────────────────────

export const INDIA_STATES = new Set([
  'andhra pradesh','arunachal pradesh','assam','bihar','chhattisgarh',
  'goa','gujarat','haryana','himachal pradesh','jharkhand','karnataka',
  'kerala','madhya pradesh','maharashtra','manipur','meghalaya',
  'mizoram','nagaland','odisha','orissa','punjab','rajasthan',
  'sikkim','tamil nadu','telangana','tripura','uttar pradesh',
  'uttarakhand','uttaranchal','west bengal',
  'delhi','ncr','chandigarh','puducherry','pondicherry',
  'jammu and kashmir','ladakh','lakshadweep',
]);

export const US_STATE_ABBREVS = new Set([
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC',
]);

export const US_STATE_NAME_MAP: Record<string, string> = {
  'Alabama':'AL','Alaska':'AK','Arizona':'AZ','Arkansas':'AR','California':'CA',
  'Colorado':'CO','Connecticut':'CT','Delaware':'DE','Florida':'FL','Georgia':'GA',
  'Hawaii':'HI','Idaho':'ID','Illinois':'IL','Indiana':'IN','Iowa':'IA',
  'Kansas':'KS','Kentucky':'KY','Louisiana':'LA','Maine':'ME','Maryland':'MD',
  'Massachusetts':'MA','Michigan':'MI','Minnesota':'MN','Mississippi':'MS',
  'Missouri':'MO','Montana':'MT','Nebraska':'NE','Nevada':'NV',
  'New Hampshire':'NH','New Jersey':'NJ','New Mexico':'NM','New York':'NY',
  'North Carolina':'NC','North Dakota':'ND','Ohio':'OH','Oklahoma':'OK',
  'Oregon':'OR','Pennsylvania':'PA','Rhode Island':'RI','South Carolina':'SC',
  'South Dakota':'SD','Tennessee':'TN','Texas':'TX','Utah':'UT','Vermont':'VT',
  'Virginia':'VA','Washington':'WA','West Virginia':'WV','Wisconsin':'WI',
  'Wyoming':'WY','District of Columbia':'DC',
};

export const resolveUSStateAbbrev = (segment = ''): string | null => {
  const upper = segment.trim().toUpperCase();
  if (US_STATE_ABBREVS.has(upper)) return upper;
  const lc = segment.trim().toLowerCase();
  const found = Object.entries(US_STATE_NAME_MAP).find(([name]) => name.toLowerCase() === lc);
  return found ? found[1] : null;
};

export const formatEmploymentLocation = (locationString = ''): string => {
  const normalized = (typeof locationString === 'string' ? locationString : '').replace(/\s+/g, ' ').trim();
  if (!normalized) return '';
  const parts = normalized.split(',').map(p => p.trim()).filter(Boolean);
  if (parts.some(p => /\bindia\b/i.test(p)) || parts.some(p => INDIA_STATES.has(p.toLowerCase()))) return 'India';
  for (const part of parts) {
    if (/^\d+$/.test(part)) continue;
    const abbrev = resolveUSStateAbbrev(part);
    if (abbrev) return abbrev;
  }
  if (parts.some(p => /\b(united states of america|united states|usa|u\.s\.a\.|u\.s\.)\b/i.test(p))) return 'United States';
  return normalized;
};

export const getEducationCountry = (location = ''): string => {
  const normalized = (typeof location === 'string' ? location : '').replace(/\s+/g, ' ').trim();
  if (!normalized) return '';
  const parts = normalized.split(',').map(p => p.trim()).filter(Boolean);
  if (parts.some(p => /\bindia\b/i.test(p))) return 'India';
  for (const part of parts) {
    if (/^\d+$/.test(part)) continue;
    const abbrev = resolveUSStateAbbrev(part);
    if (abbrev) return abbrev;
  }
  if (parts.some(p => /\b(united states of america|united states|usa|u\.s\.a?\.)\b/i.test(p))) return 'United States';
  return parts[parts.length - 1] ?? normalized;
};

// ── Project title ─────────────────────────────────────────────────────────────

const MONTH_PATTERN =
  '(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)';

export const formatProjectTitle = (
  project: Project & { projectLocation?: string },
  index: number,
  totalProjects: number,
): string => {
  const rawName =
    (typeof project.projectName === 'string' && project.projectName) ||
    (typeof project.title === 'string' && project.title) ||
    (typeof project.name === 'string' && project.name) ||
    (typeof project.projectTitle === 'string' && project.projectTitle) ||
    '';
  const rawLocation = typeof project.projectLocation === 'string' ? project.projectLocation : '';
  let cleanName = rawName.replace(/\s+/g, ' ').trim();

  cleanName = cleanName.replace(/^\s*project\s*\d*\s*[:\-–—]\s*/i, '');
  cleanName = cleanName.replace(/^\s*project\s*\d+\s+/i, '');

  const dateLikePatterns = [
    new RegExp(`\\(?\\b${MONTH_PATTERN}\\.?\\s+\\d{4}\\s*[-–—]\\s*(?:${MONTH_PATTERN}\\.?\\s+\\d{4}|present|current|till\\s*date)\\b\\)?`, 'gi'),
    /\(?\b\d{4}\s*[-–—]\s*(?:\d{4}|present|current)\b\)?/gi,
    /\(?\b(?:0?[1-9]|1[0-2])\s*[/-]\s*\d{2,4}\s*[-–—]\s*(?:0?[1-9]|1[0-2])\s*[/-]\s*\d{2,4}\b\)?/gi,
  ];
  dateLikePatterns.forEach(p => { cleanName = cleanName.replace(p, ' '); });

  const location = rawLocation.replace(/\s+/g, ' ').trim();
  if (location) {
    cleanName = cleanName.replace(new RegExp(`\\s*[-–—,:|]?\\s*${escapeRegExp(location)}\\s*`, 'ig'), ' ');
    const flexible = location.split(',').map(p => p.trim()).filter(Boolean).map(p => escapeRegExp(p)).join('\\s*,\\s*');
    if (flexible) cleanName = cleanName.replace(new RegExp(`\\s*[-–—,:|]?\\s*${flexible}\\s*`, 'ig'), ' ');
  }

  cleanName = cleanName
    .replace(/[([]\s*[)\]]/g, ' ')
    .replace(/\s*[-–—,:|]\s*[-–—,:|]\s*/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .replace(/^[-–—,:|()\s]+|[-–—,:|()\s]+$/g, '')
    .trim();

  const baseName = cleanName || (rawName.trim().length > 0 ? rawName.trim().slice(0, 60) : 'Project');
  return totalProjects > 1 ? `Project ${index + 1}: ${baseName}` : baseName;
};
