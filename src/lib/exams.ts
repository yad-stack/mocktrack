export interface ExamDefinition {
  id: string;
  name: string;
  shortName: string;
  category: string;
  subjects: string[];
}

export const EXAM_DEFINITIONS: ExamDefinition[] = [
  {
    id: 'upsc_cse',
    name: 'UPSC Civil Services (IAS/IPS/IFS)',
    shortName: 'UPSC CSE',
    category: 'UPSC',
    subjects: [
      'General Studies I', 'General Studies II', 'General Studies III',
      'General Studies IV', 'CSAT', 'Essay', 'Optional I', 'Optional II',
      'Current Affairs', 'Full Mock', 'Sectional Mock',
    ],
  },
  {
    id: 'upsc_cds',
    name: 'UPSC Combined Defence Services',
    shortName: 'UPSC CDS',
    category: 'UPSC',
    subjects: [
      'English', 'General Knowledge', 'Elementary Mathematics',
      'Full Mock', 'Sectional Mock', 'Current Affairs',
    ],
  },
  {
    id: 'upsc_nda',
    name: 'UPSC National Defence Academy',
    shortName: 'UPSC NDA',
    category: 'UPSC',
    subjects: [
      'Mathematics', 'General Ability Test', 'English',
      'General Science', 'History & Geography', 'Current Affairs',
      'Full Mock', 'Sectional Mock',
    ],
  },
  {
    id: 'upsc_capf',
    name: 'UPSC CAPF (AC)',
    shortName: 'UPSC CAPF',
    category: 'UPSC',
    subjects: [
      'General Ability & Intelligence', 'General Studies',
      'Essay & Comprehension', 'Full Mock', 'Sectional Mock',
    ],
  },
  {
    id: 'upsc_epfo',
    name: 'UPSC EPFO',
    shortName: 'UPSC EPFO',
    category: 'UPSC',
    subjects: [
      'General English', 'Indian Freedom Struggle', 'Current Events',
      'Indian Polity & Economy', 'General Accounting Principles',
      'Industrial Relations & Labour Laws', 'Full Mock',
    ],
  },
  {
    id: 'ssc_cgl',
    name: 'SSC Combined Graduate Level',
    shortName: 'SSC CGL',
    category: 'SSC',
    subjects: [
      'Quantitative Aptitude', 'English Language', 'General Intelligence & Reasoning',
      'General Awareness', 'Statistics', 'General Studies (Finance & Economics)',
      'Tier I Mock', 'Tier II Mock', 'Sectional Mock',
    ],
  },
  {
    id: 'ssc_chsl',
    name: 'SSC Combined Higher Secondary Level',
    shortName: 'SSC CHSL',
    category: 'SSC',
    subjects: [
      'Quantitative Aptitude', 'English Language', 'General Intelligence',
      'General Awareness', 'Full Mock', 'Sectional Mock',
    ],
  },
  {
    id: 'ssc_mts',
    name: 'SSC Multi Tasking Staff',
    shortName: 'SSC MTS',
    category: 'SSC',
    subjects: [
      'Numerical & Mathematical Ability', 'Reasoning & Problem Solving',
      'General Awareness', 'English Language & Comprehension',
      'Full Mock', 'Sectional Mock',
    ],
  },
  {
    id: 'ssc_gd',
    name: 'SSC GD Constable',
    shortName: 'SSC GD',
    category: 'SSC',
    subjects: [
      'General Intelligence & Reasoning', 'General Knowledge & General Awareness',
      'Elementary Mathematics', 'English / Hindi',
      'Full Mock', 'Sectional Mock',
    ],
  },
  {
    id: 'ibps_po',
    name: 'IBPS Probationary Officer',
    shortName: 'IBPS PO',
    category: 'Banking',
    subjects: [
      'Quantitative Aptitude', 'Reasoning Ability', 'English Language',
      'General Awareness (Banking)', 'Computer Knowledge',
      'Prelims Mock', 'Mains Mock', 'Sectional Mock',
    ],
  },
  {
    id: 'sbi_po',
    name: 'SBI Probationary Officer',
    shortName: 'SBI PO',
    category: 'Banking',
    subjects: [
      'Quantitative Aptitude', 'Reasoning & Computer Aptitude', 'English Language',
      'Data Analysis & Interpretation', 'General & Banking Awareness',
      'Prelims Mock', 'Mains Mock', 'Sectional Mock',
    ],
  },
  {
    id: 'ibps_clerk',
    name: 'IBPS Clerk',
    shortName: 'IBPS Clerk',
    category: 'Banking',
    subjects: [
      'Quantitative Aptitude', 'Reasoning Ability', 'English Language',
      'General & Financial Awareness', 'Computer Aptitude',
      'Prelims Mock', 'Mains Mock',
    ],
  },
  {
    id: 'rbi_grade_b',
    name: 'RBI Grade B Officer',
    shortName: 'RBI Grade B',
    category: 'Banking',
    subjects: [
      'General Awareness', 'English Language', 'Quantitative Aptitude',
      'Reasoning', 'Economic & Social Issues', 'Finance & Management',
      'Phase I Mock', 'Phase II Mock',
    ],
  },
  {
    id: 'rrb_ntpc',
    name: 'RRB Non-Technical Popular Categories',
    shortName: 'RRB NTPC',
    category: 'Railways',
    subjects: [
      'Mathematics', 'General Intelligence & Reasoning', 'General Awareness',
      'CBT 1 Mock', 'CBT 2 Mock', 'Sectional Mock',
    ],
  },
  {
    id: 'rrb_group_d',
    name: 'RRB Group D',
    shortName: 'RRB Group D',
    category: 'Railways',
    subjects: [
      'Mathematics', 'General Intelligence & Reasoning',
      'General Science', 'General Awareness & Current Affairs',
      'Full Mock', 'Sectional Mock',
    ],
  },
  {
    id: 'rrb_je',
    name: 'RRB Junior Engineer',
    shortName: 'RRB JE',
    category: 'Railways',
    subjects: [
      'Mathematics', 'General Intelligence & Reasoning', 'General Awareness',
      'Physics & Chemistry', 'Basics of Computers & Applications',
      'Technical Subjects', 'CBT 1 Mock', 'CBT 2 Mock',
    ],
  },
  {
    id: 'neet_ug',
    name: 'NEET Undergraduate',
    shortName: 'NEET UG',
    category: 'Medical',
    subjects: [
      'Physics', 'Chemistry', 'Biology (Botany)', 'Biology (Zoology)',
      'Full Mock', 'Sectional Mock', 'Previous Year Paper',
    ],
  },
  {
    id: 'jee_main',
    name: 'JEE Main',
    shortName: 'JEE Main',
    category: 'Engineering',
    subjects: [
      'Physics', 'Chemistry', 'Mathematics',
      'Full Mock', 'Sectional Mock', 'Previous Year Paper',
    ],
  },
  {
    id: 'jee_advanced',
    name: 'JEE Advanced',
    shortName: 'JEE Adv',
    category: 'Engineering',
    subjects: [
      'Physics', 'Chemistry', 'Mathematics',
      'Paper 1 Mock', 'Paper 2 Mock', 'Previous Year Paper',
    ],
  },
  {
    id: 'cat',
    name: 'Common Admission Test (IIM)',
    shortName: 'CAT',
    category: 'Management',
    subjects: [
      'Verbal Ability & Reading Comprehension', 'Data Interpretation & Logical Reasoning',
      'Quantitative Ability', 'Full Mock', 'Sectional Mock',
    ],
  },
  {
    id: 'clat',
    name: 'Common Law Admission Test',
    shortName: 'CLAT',
    category: 'Law',
    subjects: [
      'English Language', 'Current Affairs & GK', 'Legal Reasoning',
      'Logical Reasoning', 'Quantitative Techniques',
      'Full Mock', 'Sectional Mock',
    ],
  },
  {
    id: 'cuet',
    name: 'Common University Entrance Test',
    shortName: 'CUET',
    category: 'University',
    subjects: [
      'Language (Section IA)', 'Domain Subjects (Section II)',
      'General Test (Section III)', 'Full Mock', 'Sectional Mock',
    ],
  },
  {
    id: 'custom',
    name: 'Custom / Other exam',
    shortName: 'Custom',
    category: 'Other',
    subjects: ['General Studies', 'Aptitude', 'Reasoning', 'English', 'Full Mock'],
  },
];

export const EXAM_CATEGORIES = [...new Set(EXAM_DEFINITIONS.map(e => e.category))];

export function getExamById(id: string): ExamDefinition | undefined {
  return EXAM_DEFINITIONS.find(e => e.id === id);
}
