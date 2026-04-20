/**
 * Central registry of all state formatters.
 *
 * To add a new state:
 *   1. Create  src/formatters/<state-id>/metadata.ts   (copy from any existing one)
 *   2. Create  src/formatters/<state-id>/generator.ts  (export generateXxxDocx + downloadXxxDocx)
 *   3. Add an entry below — set available: true and wire the generator import.
 */

import type { ResumeData } from '@/lib/types';
import { ohioMetadata } from './ohio/metadata';
import { californiaMetadata } from './california/metadata';
import { texasMetadata } from './texas/metadata';
import { newYorkMetadata } from './new-york/metadata';
import { illinoisMetadata } from './illinois/metadata';

export interface StateFormatterMeta {
  id: string;
  name: string;
  abbreviation: string;
  flag: string;
  available: boolean;
  description: string;
}

// ── All registered states (order controls display) ────────────────────────────
export const STATE_REGISTRY: StateFormatterMeta[] = [
  ohioMetadata,
  californiaMetadata,
  texasMetadata,
  newYorkMetadata,
  illinoisMetadata,
];

// ── Download dispatcher ───────────────────────────────────────────────────────

/**
 * Dynamically imports the correct generator and triggers a browser download.
 * Throws if the state is not available or has no generator.
 */
export async function downloadStateDocx(stateId: string, resumeData: ResumeData): Promise<void> {
  switch (stateId) {
    case 'ohio': {
      const { downloadOhioDocx } = await import('./ohio/generator');
      await downloadOhioDocx(resumeData);
      break;
    }
    // ── Add new states here as they become available ──────────────────────────
    // case 'california': {
    //   const { downloadCaliforniaDocx } = await import('./california/generator');
    //   await downloadCaliforniaDocx(resumeData);
    //   break;
    // }
    default:
      throw new Error(`No generator available for state: ${stateId}`);
  }
}
