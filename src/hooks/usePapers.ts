import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Paper, PaperFormData, formToSection } from '../lib/types';
import { useAuth } from './useAuth';

export function usePapers() {
  const { user } = useAuth();
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<any>(null);

  const fetchPapers = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('papers')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });
    if (error) setError(error.message);
    else setPapers(data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchPapers();
    if (channelRef.current) supabase.removeChannel(channelRef.current);
    channelRef.current = supabase
      .channel(`papers_${user.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'papers', filter: `user_id=eq.${user.id}` },
        (payload) => { setPapers(prev => { const exists = prev.find(p => p.id === payload.new.id); if (exists) return prev; return [payload.new as Paper, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); }); })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'papers', filter: `user_id=eq.${user.id}` },
        (payload) => { setPapers(prev => prev.map(p => p.id === payload.new.id ? payload.new as Paper : p)); })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'papers', filter: `user_id=eq.${user.id}` },
        (payload) => { setPapers(prev => prev.filter(p => p.id !== payload.old.id)); })
      .subscribe();
    return () => { if (channelRef.current) { supabase.removeChannel(channelRef.current); channelRef.current = null; } };
  }, [user, fetchPapers]);

  const num = (s: string) => s && !isNaN(parseFloat(s)) ? parseFloat(s) : null;
  const int = (s: string) => s && !isNaN(parseInt(s)) ? parseInt(s) : null;

  const buildPayload = (form: PaperFormData, userId: string) => ({
    user_id: userId,
    name: form.name,
    type: form.type,
    exam_id: form.exam_id || null,
    subject: form.subject || null,
    score: parseFloat(form.score),
    max_score: parseFloat(form.max_score),
    total_questions: int(form.total_questions),
    attempted: int(form.attempted),
    correct_answers: int(form.correct_answers),
    incorrect_answers: int(form.incorrect_answers),
    total_time: int(form.total_time),
    percentile: num(form.percentile),
    rank: int(form.rank),
    rank_out_of: int(form.rank_out_of),
    date: form.date,
    notes: form.notes || null,
    cutoff: num(form.cutoff),
    sections: form.sections.length > 0 ? form.sections.map(formToSection) : null,
  });

  const addPaper = async (form: PaperFormData) => {
    if (!user) return { error: 'Not logged in' };
    const { error } = await supabase.from('papers').insert(buildPayload(form, user.id));
    return { error: error?.message };
  };

  const updatePaper = async (id: string, form: PaperFormData) => {
    if (!user) return { error: 'Not logged in' };
    const payload = buildPayload(form, user.id);
    const { user_id, ...updateFields } = payload;
    const { error } = await supabase.from('papers').update(updateFields).eq('id', id);
    return { error: error?.message };
  };

  const deletePaper = async (id: string) => {
    setPapers(prev => prev.filter(p => p.id !== id));
    const { error } = await supabase.from('papers').delete().eq('id', id);
    if (error) { fetchPapers(); return { error: error.message }; }
    return { error: undefined };
  };

  return { papers, loading, error, addPaper, updatePaper, deletePaper, refresh: fetchPapers };
}
