export interface ArticleItem {
  id: string;
  title: string;
  type: 'Build Log' | 'Engineering Journal' | 'JEE + Systems';
  date: string;
  summary: string;
  readMinutes: number;
}

export const contentData: ArticleItem[] = [
  {
    id: 'designing-high-signal-portfolio',
    title: 'Designing a High-Signal Portfolio System',
    type: 'Build Log',
    date: '2026-04-22',
    summary: 'How I restructured static pages into measurable case studies and proof layers.',
    readMinutes: 6,
  },
  {
    id: 'jee-discipline-as-engineering',
    title: 'JEE Discipline as an Engineering Framework',
    type: 'JEE + Systems',
    date: '2026-04-18',
    summary: 'Mapping consistency, constraints, and long-range planning from studies into software work.',
    readMinutes: 5,
  },
  {
    id: 'from-mailto-to-lead-pipeline',
    title: 'From mailto to Structured Lead Pipeline',
    type: 'Engineering Journal',
    date: '2026-04-15',
    summary: 'Why forms need validation, anti-spam, routing, and response SLAs for serious collaboration.',
    readMinutes: 7,
  },
];
