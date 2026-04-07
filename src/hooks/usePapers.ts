import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Paper, PaperFormData } from '../lib/types';
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

    // Clean up previous channel before creating new one
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    channelRef.current = supabase
      .channel(`papers_${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'papers',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        // Optimistically add to state immediately
        setPapers(prev => [payload.new as Paper, ...prev]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'papers',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        setPapers(prev => prev.map(p => p.id === payload.new.id ? payload.new as Paper : p));
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'papers',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        setPapers(prev => prev.filter(p => p.id !== payload.old.id));
      })
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user, fetchPapers]);

  const addPaper = async (form: PaperFormData) => {
    if (!user) return { error: 'Not logged in' };
    const { error } = await supabase.from('papers').insert({
      user_id: user.id,
      name: form.name,
      type: form.type,
      exam_id: form.exam_id || null,
      subject: form.subject || null,
      score: parseFloat(form.score),
      max_score: parseFloat(form.max_score),
      attempted: form.attempted ? parseInt(form.attempted) : null,
      time_taken: form.time_taken ? parseInt(form.time_taken) : null,
      percentile: form.percentile ? parseFloat(form.percentile) : null,
      date: form.date,
      notes: form.notes || null,
    });
    return { error: error?.message };
  };

  const updatePaper = async (id: string, form: PaperFormData) => {
    const { error } = await supabase.from('papers').update({
      name: form.name,
      type: form.type,
      exam_id: form.exam_id || null,
      subject: form.subject || null,
      score: parseFloat(form.score),
      max_score: parseFloat(form.max_score),
      attempted: form.attempted ? parseInt(form.attempted) : null,
      time_taken: form.time_taken ? parseInt(form.time_taken) : null,
      percentile: form.percentile ? parseFloat(form.percentile) : null,
      date: form.date,
      notes: form.notes || null,
    }).eq('id', id);
    return { error: error?.message };
  };

  const deletePaper = async (id: string) => {
    // Optimistic delete
    setPapers(prev => prev.filter(p => p.id !== id));
    const { error } = await supabase.from('papers').delete().eq('id', id);
    if (error) {
      // Revert on failure
      fetchPapers();
      return { error: error.message };
    }
    return { error: undefined };
  };

  return { papers, loading, error, addPaper, updatePaper, deletePaper, refresh: fetchPapers };
}
