import {
  Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun,
  BorderStyle, AlignmentType, WidthType, ShadingType, VerticalAlign,
  LevelFormat, TabStopType, HeightRule, LineRuleType,
} from 'docx';
import { saveAs } from 'file-saver';
import type { ResumeData, EmploymentEntry } from '@/lib/types';
import {
  stripBullet, normalizeMonthAbbr, splitBulletItems,
  sortEducation, formatEmploymentLocation, getEducationCountry, formatProjectTitle,
} from '@/formatters/shared/utils';

// ── Table border preset ───────────────────────────────────────────────────────

const TABLE_BORDERS = {
  top:              { style: BorderStyle.SINGLE, size: 4, space: 0, color: 'auto' },
  bottom:           { style: BorderStyle.SINGLE, size: 4, space: 0, color: 'auto' },
  left:             { style: BorderStyle.SINGLE, size: 4, space: 0, color: 'auto' },
  right:            { style: BorderStyle.SINGLE, size: 4, space: 0, color: 'auto' },
  insideHorizontal: { style: BorderStyle.SINGLE, size: 4, space: 0, color: 'auto' },
  insideVertical:   { style: BorderStyle.SINGLE, size: 4, space: 0, color: 'auto' },
};

const TIGHT = { before: 0, after: 0, line: 240, lineRule: LineRuleType.AUTO };

// ── Education table ───────────────────────────────────────────────────────────

function buildEducationTable(resumeData: ResumeData): Table {
  const hdrCell = (width: number, runs: TextRun[]) => new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: { fill: 'D9D9D9', type: ShadingType.CLEAR },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: TIGHT, children: runs })],
  });

  const dataCell = (text: string | undefined) => new TableCell({
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: TIGHT,
      children: [new TextRun({ text: text || '-', font: 'Calibri', size: 22 })],
    })],
  });

  const sorted = sortEducation(resumeData.education ?? []);

  const dataRows = sorted.length > 0
    ? sorted.map(edu => new TableRow({
        height: { value: 58, rule: HeightRule.ATLEAST },
        cantSplit: true,
        children: [
          dataCell(edu.degree), dataCell(edu.areaOfStudy), dataCell(edu.school),
          dataCell(getEducationCountry(edu.location)),
          dataCell(edu.wasAwarded ? 'Yes' : 'No'),
          dataCell(edu.date),
        ],
      }))
    : [new TableRow({
        height: { value: 58, rule: HeightRule.ATLEAST },
        cantSplit: true,
        children: ['-', '-', '-', '-', '-', '-'].map(() => dataCell('-')),
      })];

  return new Table({
    alignment: AlignmentType.CENTER,
    columnWidths: [1653, 1901, 2684, 1712, 1524, 1316],
    borders: TABLE_BORDERS,
    width: { size: 0, type: WidthType.AUTO },
    rows: [
      new TableRow({
        tableHeader: true,
        children: [
          hdrCell(1653, [
            new TextRun({ text: 'Degree ', bold: true, font: 'Arial', size: 20 }),
            new TextRun({ text: '(AA/AS, BA/BS, BS/BTech/BE, MS/MTech/MBA/MA, PhD/Doctoral)', font: 'Arial', size: 20 }),
          ]),
          hdrCell(1901, [new TextRun({ text: 'Area of Study', bold: true, font: 'Arial', size: 20 })]),
          hdrCell(2684, [new TextRun({ text: 'School/College/University', bold: true, font: 'Arial', size: 20 })]),
          hdrCell(1712, [new TextRun({ text: 'Location', bold: true, font: 'Arial', size: 20 })]),
          hdrCell(1524, [
            new TextRun({ text: 'Was the degree awarded?', bold: true, font: 'Arial', size: 20 }),
            new TextRun({ text: ' (Yes/No)', font: 'Arial', size: 20 }),
          ]),
          hdrCell(1316, [
            new TextRun({ text: 'OPTIONAL: Date', bold: true, font: 'Arial', size: 20 }),
            new TextRun({ text: ' (MM/YY)', font: 'Arial', size: 20 }),
          ]),
        ],
      }),
      ...dataRows,
    ],
  });
}

// ── Certifications table ──────────────────────────────────────────────────────

function buildCertificationsTable(resumeData: ResumeData): Table {
  const hdrCell = (width: number, runs: TextRun[]) => new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: { fill: 'D9D9D9', type: ShadingType.CLEAR },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: TIGHT, children: runs })],
  });

  const dataCell = (text: string | undefined) => new TableCell({
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: TIGHT,
      children: [new TextRun({ text: text || '-', font: 'Calibri', size: 22 })],
    })],
  });

  const certs = resumeData.certifications ?? [];

  const dataRows = certs.length > 0
    ? certs.map(cert => new TableRow({
        height: { value: 58, rule: HeightRule.ATLEAST },
        cantSplit: true,
        children: [
          dataCell(cert.name), dataCell(cert.issuedBy), dataCell(cert.dateObtained),
          dataCell(cert.certificationNumber), dataCell(cert.expirationDate),
        ],
      }))
    : [new TableRow({
        height: { value: 58, rule: HeightRule.ATLEAST },
        cantSplit: true,
        children: ['-', '-', '-', '-', '-'].map(() => dataCell('-')),
      })];

  return new Table({
    alignment: AlignmentType.CENTER,
    columnWidths: [3417, 2424, 1834, 1644, 1471],
    borders: TABLE_BORDERS,
    width: { size: 0, type: WidthType.AUTO },
    rows: [
      new TableRow({
        tableHeader: true,
        children: [
          hdrCell(3417, [new TextRun({ text: 'Certification', bold: true, font: 'Arial', size: 20 })]),
          hdrCell(2424, [new TextRun({ text: 'Issued By', bold: true, font: 'Arial', size: 20 })]),
          hdrCell(1834, [
            new TextRun({ text: 'Date Obtained', bold: true, font: 'Arial', size: 20 }),
            new TextRun({ text: ' (MM/YY)', font: 'Arial', size: 20 }),
          ]),
          hdrCell(1644, [
            new TextRun({ text: 'Certification Number', bold: true, font: 'Arial', size: 20 }),
            new TextRun({ text: ' (If Applicable)', font: 'Arial', size: 20 }),
          ]),
          hdrCell(1471, [
            new TextRun({ text: 'Expiration Date', bold: true, font: 'Arial', size: 20 }),
            new TextRun({ text: ' (If Applicable)', font: 'Arial', size: 20 }),
          ]),
        ],
      }),
      ...dataRows,
    ],
  });
}

// ── Employment history ────────────────────────────────────────────────────────

function buildEmploymentHistory(resumeData: ResumeData): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  const bodySpacing = { after: 0, line: 240, lineRule: LineRuleType.AUTO };
  const RIGHT_TAB = { type: TabStopType.RIGHT, position: 10800 };

  const hdrRun = (text: string) => new TextRun({
    text, bold: true, boldComplexScript: true, size: 28, color: '1F497D', font: 'Times New Roman',
  });

  const bulletPara = (text: string) => new Paragraph({
    numbering: { reference: 'resumeBullet', level: 0 },
    alignment: AlignmentType.JUSTIFIED,
    spacing: bodySpacing,
    children: [new TextRun({ text: stripBullet(text), font: 'Calibri', size: 22, boldComplexScript: true })],
  });

  const hdrTabPara = (left: string, right: string, spaceBefore = 0) => new Paragraph({
    tabStops: [RIGHT_TAB],
    alignment: AlignmentType.JUSTIFIED,
    spacing: { ...bodySpacing, before: spaceBefore },
    children: [
      new TextRun({ text: left, bold: true, boldComplexScript: true, size: 28, color: '1F497D', font: 'Times New Roman' }),
      new TextRun({ text: '\t' }),
      new TextRun({ text: right, bold: true, boldComplexScript: true, size: 28, color: '1F497D', font: 'Times New Roman' }),
    ],
  });

  const jobs = resumeData.employmentHistory ?? [];
  if (jobs.length === 0) {
    paragraphs.push(new Paragraph({
      spacing: bodySpacing,
      children: [new TextRun({ text: 'No employment history', font: 'Calibri', size: 22 })],
    }));
    return paragraphs;
  }

  jobs.forEach((job: EmploymentEntry, index: number) => {
    try {
      const loc = formatEmploymentLocation(job.location ?? '');
      const dept = (job.department ?? job.subRole ?? '').trim();
      const period = normalizeMonthAbbr(job.workPeriod ?? '');

      paragraphs.push(hdrTabPara(job.companyName ?? 'Company', period, index > 0 ? 200 : 0));

      if (loc) {
        paragraphs.push(hdrTabPara(job.roleName ?? 'Role', loc));
      } else {
        paragraphs.push(new Paragraph({
          alignment: AlignmentType.JUSTIFIED, spacing: bodySpacing,
          children: [hdrRun(job.roleName ?? 'Role')],
        }));
      }

      if (dept) {
        paragraphs.push(new Paragraph({
          alignment: AlignmentType.JUSTIFIED, spacing: bodySpacing,
          children: [new TextRun({ text: dept, font: 'Calibri', size: 22 })],
        }));
      }

      if (job.responsibilities?.filter(r => r.trim()).length) {
        paragraphs.push(new Paragraph({
          alignment: AlignmentType.JUSTIFIED, spacing: bodySpacing,
          children: [new TextRun({ text: 'Responsibilities', bold: true, font: 'Calibri', size: 22 })],
        }));
        job.responsibilities.filter(r => r.trim()).forEach(r => paragraphs.push(bulletPara(r)));
      }

      if (job.projects?.length) {
        job.projects.forEach((project, pi) => {
          const title = formatProjectTitle(
            { ...project, projectLocation: project.projectLocation ?? job.location ?? '' },
            pi,
            job.projects!.length,
          );
          paragraphs.push(new Paragraph({
            alignment: AlignmentType.JUSTIFIED, spacing: bodySpacing,
            children: [new TextRun({ text: title, bold: true, font: 'Calibri', size: 22 })],
          }));
          if (project.projectResponsibilities?.length) {
            paragraphs.push(new Paragraph({
              alignment: AlignmentType.JUSTIFIED, spacing: bodySpacing,
              children: [new TextRun({ text: 'Responsibilities', bold: true, font: 'Calibri', size: 22 })],
            }));
            project.projectResponsibilities.filter(r => r.trim()).forEach(r => paragraphs.push(bulletPara(r)));
          }
          if (project.keyTechnologies) {
            paragraphs.push(new Paragraph({ spacing: bodySpacing, children: [] }));
            paragraphs.push(new Paragraph({
              alignment: AlignmentType.JUSTIFIED, spacing: bodySpacing,
              children: [
                new TextRun({ text: 'Key Technologies/Skills', bold: true, boldComplexScript: true, font: 'Calibri', size: 22 }),
                new TextRun({ text: ': ', font: 'Calibri', size: 22 }),
                new TextRun({ text: project.keyTechnologies, boldComplexScript: true, font: 'Calibri', size: 22 }),
              ],
            }));
          }
        });
      }

      job.subsections?.forEach(sub => {
        if (sub.title) {
          paragraphs.push(new Paragraph({
            alignment: AlignmentType.JUSTIFIED, spacing: bodySpacing,
            children: [new TextRun({ text: sub.title + ':', bold: true, font: 'Calibri', size: 22 })],
          }));
          sub.content?.filter(i => i.trim()).forEach(i => paragraphs.push(bulletPara(i)));
        }
      });

      if (job.keyTechnologies) {
        paragraphs.push(new Paragraph({ spacing: bodySpacing, children: [] }));
        paragraphs.push(new Paragraph({
          alignment: AlignmentType.JUSTIFIED, spacing: bodySpacing,
          children: [
            new TextRun({ text: 'Key Technologies/Skills', bold: true, boldComplexScript: true, font: 'Calibri', size: 22 }),
            new TextRun({ text: ': ', font: 'Calibri', size: 22 }),
            new TextRun({ text: job.keyTechnologies, boldComplexScript: true, font: 'Calibri', size: 22 }),
          ],
        }));
      }
    } catch (err) {
      console.warn('[Ohio generator] job', index, 'skipped:', err);
      paragraphs.push(new Paragraph({
        spacing: bodySpacing,
        children: [new TextRun({ text: `[${job.companyName ?? 'Employment entry'} could not be rendered]`, font: 'Calibri', size: 22 })],
      }));
    }
  });

  return paragraphs;
}

// ── Technical skills ──────────────────────────────────────────────────────────

function buildTechnicalSkills(resumeData: ResumeData): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  const sp = { after: 0, line: 240, lineRule: LineRuleType.AUTO };

  if (resumeData.technicalSkills && Object.keys(resumeData.technicalSkills).length > 0) {
    Object.entries(resumeData.technicalSkills).forEach(([cat, skills]) => {
      paragraphs.push(new Paragraph({
        alignment: AlignmentType.JUSTIFIED, spacing: sp,
        children: [
          new TextRun({ text: cat + ': ', bold: true, boldComplexScript: true, font: 'Calibri' }),
          new TextRun({ text: Array.isArray(skills) ? skills.join(', ') : skills, boldComplexScript: true, font: 'Calibri' }),
        ],
      }));
    });
  }

  if (resumeData.skillCategories?.length) {
    const normal: typeof resumeData.skillCategories = [];
    const flat: string[] = [];

    resumeData.skillCategories.forEach(cat => {
      const list = Array.isArray(cat.skills) ? cat.skills.filter(s => s?.trim()) : [];
      if (list.length === 0 && !cat.subCategories?.length) {
        flat.push(cat.categoryName ?? '');
      } else {
        normal.push({ ...cat, skills: list });
      }
    });

    if (flat.length > 0) normal.push({ categoryName: 'Other Technical Skills', skills: flat, subCategories: [] });

    normal.forEach(cat => {
      paragraphs.push(new Paragraph({
        alignment: AlignmentType.JUSTIFIED, spacing: sp,
        children: [
          new TextRun({ text: (cat.categoryName ?? 'Category') + ': ', bold: true, boldComplexScript: true, font: 'Calibri' }),
          new TextRun({
            text: Array.isArray(cat.skills) ? cat.skills.join(', ') : (cat.skills ?? ''),
            boldComplexScript: true, font: 'Calibri',
          }),
        ],
      }));
      cat.subCategories?.forEach(sub => {
        paragraphs.push(new Paragraph({
          alignment: AlignmentType.JUSTIFIED, spacing: sp, indent: { left: 350 },
          children: [
            new TextRun({ text: (sub.name ?? 'Subcategory') + ': ', bold: true, boldComplexScript: true, font: 'Calibri' }),
            new TextRun({
              text: Array.isArray(sub.skills) ? sub.skills.join(', ') : (sub.skills ?? ''),
              boldComplexScript: true, font: 'Calibri',
            }),
          ],
        }));
      });
    });
  }

  if (paragraphs.length === 0) {
    paragraphs.push(new Paragraph({
      alignment: AlignmentType.JUSTIFIED, spacing: sp,
      children: [new TextRun({ text: 'No skills provided', font: 'Calibri' })],
    }));
  }
  return paragraphs;
}

// ── Public entry point ────────────────────────────────────────────────────────

export async function generateOhioDocx(resumeData: ResumeData): Promise<Blob> {
  const ds = { after: 0, line: 240, lineRule: LineRuleType.AUTO };

  const sectionHdrRun = (text: string) =>
    new TextRun({ text, bold: true, size: 28, color: '1F497D', font: 'Times New Roman' });

  const sectionHdr = (text: string) => new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { after: 200, line: 276, lineRule: LineRuleType.AUTO },
    children: [sectionHdrRun(text)],
  });

  const tightHdr = (text: string) => new Paragraph({
    alignment: AlignmentType.JUSTIFIED, spacing: ds,
    children: [sectionHdrRun(text)],
  });

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: { ascii: 'Calibri', hAnsi: 'Calibri', eastAsia: 'Calibri', cs: 'Times New Roman' },
            size: 22,
          },
        },
      },
      paragraphStyles: [{
        id: 'ListParagraph', name: 'List Paragraph', basedOn: 'Normal', quickFormat: true,
        paragraph: { indent: { left: 360, hanging: 360 }, contextualSpacing: true },
      }],
    },
    numbering: {
      config: [{
        reference: 'resumeBullet',
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: '\uF0B7',
          alignment: AlignmentType.LEFT,
          style: {
            paragraph: { indent: { left: 360, hanging: 360 } },
            run: { font: 'Symbol' },
          },
        }],
      }],
    },
    sections: [{
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 720, right: 720, bottom: 720, left: 720, header: 288, footer: 288, gutter: 0 },
        },
      },
      children: [
        // Name
        new Paragraph({
          alignment: AlignmentType.CENTER, spacing: ds,
          children: [new TextRun({ text: resumeData.name || 'Full Name', bold: true, size: 36, color: '1F497D', font: 'Times New Roman' })],
        }),
        // Title / Requisition
        new Paragraph({
          tabStops: [{ type: TabStopType.RIGHT, position: 10800 }], spacing: ds,
          children: [
            new TextRun({ text: 'Title/Role:', bold: true, size: 28, color: '1F497D', font: 'Times New Roman' }),
            new TextRun({ text: '\t' }),
            new TextRun({ text: 'PeopleFluent Requisition Number:', bold: true, size: 28, color: '1F497D', font: 'Times New Roman' }),
          ],
        }),
        new Paragraph({
          tabStops: [{ type: TabStopType.RIGHT, position: 10800 }],
          alignment: AlignmentType.JUSTIFIED, spacing: ds,
          children: [
            new TextRun({ text: resumeData.title ?? '' }),
            new TextRun({ text: '\t' }),
            new TextRun({ text: resumeData.requisitionNumber ?? '' }),
          ],
        }),
        new Paragraph({ spacing: ds, children: [] }),

        // Education
        sectionHdr('Education:'),
        buildEducationTable(resumeData),
        new Paragraph({ spacing: { after: 200, line: 276, lineRule: LineRuleType.AUTO }, children: [] }),

        // Certifications
        sectionHdr('Certifications and Certificates:'),
        buildCertificationsTable(resumeData),
        new Paragraph({ spacing: { after: 200, line: 276, lineRule: LineRuleType.AUTO }, children: [] }),

        // Employment History
        sectionHdr('Employment History:'),
        ...buildEmploymentHistory(resumeData),

        // Professional Summary
        new Paragraph({ spacing: ds, children: [] }),
        tightHdr('Professional Summary'),
        ...(resumeData.professionalSummary ?? []).flatMap(point =>
          splitBulletItems(point).map(item => new Paragraph({
            numbering: { reference: 'resumeBullet', level: 0 },
            alignment: AlignmentType.JUSTIFIED, spacing: ds,
            children: [new TextRun({ text: stripBullet(item), font: 'Calibri', size: 22, boldComplexScript: true })],
          }))
        ),
        ...(resumeData.summarySections ?? resumeData.subsections ?? []).flatMap(sub => [
          ...(sub.title ? [new Paragraph({
            alignment: AlignmentType.JUSTIFIED, spacing: ds,
            children: [new TextRun({ text: sub.title, bold: true, font: 'Calibri', size: 22 })],
          })] : []),
          ...(sub.content?.map(item => new Paragraph({
            alignment: AlignmentType.JUSTIFIED, spacing: ds,
            children: [new TextRun({ text: item, font: 'Calibri', size: 22 })],
          })) ?? []),
        ]),

        // Technical Skills
        new Paragraph({ spacing: ds, children: [] }),
        tightHdr('Technical Skills'),
        ...buildTechnicalSkills(resumeData),
      ],
    }],
  });

  return Packer.toBlob(doc);
}

/** Convenience: generate and trigger browser download. */
export async function downloadOhioDocx(resumeData: ResumeData): Promise<void> {
  const blob = await generateOhioDocx(resumeData);
  saveAs(blob, `${resumeData.name || 'Resume'}_Ohio.docx`);
}
