import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Subject } from '../lib/types';
import { useAuth } from './useAuth';
import { EXAM_DEFINITIONS } from '../lib/exams';

export function useSubjects() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<any>(null);

  const fetchSubjects = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('subjects')
      .select('*')
      .eq('user_id', user.id)
      .order('sort_order');
    setSubjects(data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchSubjects();

    if (channelRef.current) supabase.removeChannel(channelRef.current);

    channelRef.current = supabase
      .channel(`subjects_${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'subjects',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        setSubjects(prev => {
          if (prev.find(s => s.id === payload.new.id)) return prev;
          return [...prev, payload.new as Subject].sort((a, b) => a.sort_order - b.sort_order);
        });
      })
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'subjects',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        setSubjects(prev => prev.map(s => s.id === payload.new.id ? payload.new as Subject : s));
      })
      .on('postgres_changes', {
        event: 'DELETE', schema: 'public', table: 'subjects',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        setSubjects(prev => prev.filter(s => s.id !== payload.old.id));
      })
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user, fetchSubjects]);

  const addSubject = async (name: string, examId?: string) => {
    if (!user) return;
    const tempId = 'temp_' + Date.now();
    const maxOrder = subjects.length ? Math.max(...subjects.map(s => s.sort_order)) : 0;
    const optimistic: Subject = { id: tempId, user_id: user.id, name, sort_order: maxOrder + 1, exam_id: examId };
    setSubjects(prev => [...prev, optimistic]);

    const { data, error } = await supabase.from('subjects').insert({
      user_id: user.id, name, sort_order: maxOrder + 1, exam_id: examId || null,
    }).select().single();

    if (error) setSubjects(prev => prev.filter(s => s.id !== tempId));
    else setSubjects(prev => prev.map(s => s.id === tempId ? data : s));
  };

  const renameSubject = async (id: string, name: string) => {
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, name } : s));
    const { error } = await supabase.from('subjects').update({ name }).eq('id', id);
    if (error) fetchSubjects();
  };

  const deleteSubject = async (id: string) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
    const { error } = await supabase.from('subjects').delete().eq('id', id);
    if (error) fetchSubjects();
  };

  // Add subjects for a newly selected exam — called during onboarding and from settings
  const addExamSubjects = async (examId: string) => {
    if (!user) return;
    const exam = EXAM_DEFINITIONS.find(e => e.id === examId);
    if (!exam) return;
    const existingNames = new Set(subjects.map(s => s.name));
    const toAdd = exam.subjects.filter(name => !existingNames.has(name));
    if (toAdd.length === 0) return;
    const maxOrder = subjects.length ? Math.max(...subjects.map(s => s.sort_order)) : 0;
    await supabase.from('subjects').insert(
      toAdd.map((name, i) => ({
        user_id: user.id, name, sort_order: maxOrder + i + 1, exam_id: examId,
      }))
    );
    fetchSubjects();
  };

  // Add subjects for multiple exams at once — used during onboarding
  const addExamsSubjects = async (examIds: string[]) => {
    if (!user || examIds.length === 0) return;
    const existingNames = new Set(subjects.map(s => s.name));
    let maxOrder = subjects.length ? Math.max(...subjects.map(s => s.sort_order)) : 0;
    const toInsert: any[] = [];

    for (const examId of examIds) {
      const exam = EXAM_DEFINITIONS.find(e => e.id === examId);
      if (!exam) continue;
      const newSubjects = exam.subjects.filter(name => !existingNames.has(name));
      newSubjects.forEach(name => {
        if (!existingNames.has(name)) {
          existingNames.add(name); // prevent cross-exam duplicates
          toInsert.push({
            user_id: user.id, name, sort_order: ++maxOrder, exam_id: examId,
          });
        }
      });
    }

    if (toInsert.length > 0) {
      await supabase.from('subjects').insert(toInsert);
      fetchSubjects();
    }
  };

  const removeExamSubjects = async (examId: string) => {
    if (!user) return;
    setSubjects(prev => prev.filter(s => s.exam_id !== examId));
    await supabase.from('subjects').delete()
      .eq('user_id', user.id)
      .eq('exam_id', examId);
  };

  // Reset clears everything and lets user re-pick from scratch
  const resetToDefaults = async () => {
    if (!user) return;
    await supabase.from('subjects').delete().eq('user_id', user.id);
    setSubjects([]);
  };

  return {
    subjects, loading,
    addSubject, renameSubject, deleteSubject,
    addExamSubjects, addExamsSubjects, removeExamSubjects,
    resetToDefaults, refresh: fetchSubjects,
  };
}
