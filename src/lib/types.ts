export type PaperType = 'mock' | 'pyp';

export interface PaperSection {
  name: string;
  score: number;
  max_score: number;
  attempted: number;
  total_questions: number;
  correct: number;
  incorrect: number;
  time_taken?: number;
}

// Used only inside PaperForm — keeps all values as strings so decimal input works
export interface SectionFormData {
  name: string;
  score: string;
  max_score: string;
  attempted: string;
  total_questions: string;
  correct: string;
  incorrect: string;
  time_taken: string;
}

export function sectionToForm(s: PaperSection): SectionFormData {
  return {
    name: s.name,
    score: s.score > 0 ? s.score.toString() : '',
    max_score: s.max_score > 0 ? s.max_score.toString() : '',
    attempted: s.attempted > 0 ? s.attempted.toString() : '',
    total_questions: s.total_questions > 0 ? s.total_questions.toString() : '',
    correct: s.correct > 0 ? s.correct.toString() : '',
    incorrect: s.incorrect > 0 ? s.incorrect.toString() : '',
    time_taken: s.time_taken && s.time_taken > 0 ? s.time_taken.toString() : '',
  };
}

export function formToSection(s: SectionFormData): PaperSection {
  return {
    name: s.name,
    score: parseFloat(s.score) || 0,
    max_score: parseFloat(s.max_score) || 0,
    attempted: parseInt(s.attempted) || 0,
    total_questions: parseInt(s.total_questions) || 0,
    correct: parseFloat(s.correct) || 0,
    incorrect: parseFloat(s.incorrect) || 0,
    time_taken: parseInt(s.time_taken) || 0,
  };
}

export interface Paper {
  id: string;
  user_id: string;
  name: string;
  type: PaperType;
  exam_id?: string;
  subject?: string;
  score: number;
  max_score: number;
  total_questions?: number;
  attempted?: number;
  correct_answers?: number;
  incorrect_answers?: number;
  total_time?: number;
  percentile?: number;
  rank?: number;
  rank_out_of?: number;
  cutoff?: number;
  sections?: PaperSection[];
  date: string;
  notes?: string;
  created_at?: string;
}

export interface Subject {
  id: string;
  user_id: string;
  name: string;
  sort_order: number;
  exam_id?: string;
  created_at?: string;
}

export interface UserExam {
  id: string;
  user_id: string;
  exam_id: string;
  created_at?: string;
}

export interface PaperFormData {
  name: string;
  type: PaperType;
  exam_id: string;
  subject: string;
  score: string;
  max_score: string;
  total_questions: string;
  attempted: string;
  correct_answers: string;
  incorrect_answers: string;
  total_time: string;
  percentile: string;
  rank: string;
  rank_out_of: string;
  date: string;
  cutoff: string;
  notes: string;
  sections: SectionFormData[];
}
