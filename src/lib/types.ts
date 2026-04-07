export type PaperType = 'mock' | 'pyp';

export interface Paper {
  id: string;
  user_id: string;
  name: string;
  type: PaperType;
  exam_id?: string;
  subject?: string;
  score: number;
  max_score: number;
  attempted?: number;
  time_taken?: number;
  percentile?: number;
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
  attempted: string;
  time_taken: string;
  percentile: string;
  date: string;
  notes: string;
}
