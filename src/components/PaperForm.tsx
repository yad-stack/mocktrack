import React, { useState, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { Paper, PaperFormData, PaperType } from '../lib/types';
import { Subject } from '../lib/types';
import { colors, radius, spacing } from '../lib/theme';
import { EXAM_DEFINITIONS, getExamById } from '../lib/exams';

interface Props {
  initial?: Paper;
  subjects: Subject[];
  selectedExamIds: string[];
  onSave: (data: PaperFormData) => Promise<{ error?: string }>;
  onCancel: () => void;
}

const today = new Date().toISOString().split('T')[0];

export default function PaperForm({ initial, subjects, selectedExamIds, onSave, onCancel }: Props) {
  const [form, setForm] = useState<PaperFormData>({
    name: initial?.name || '',
    type: initial?.type || 'mock',
    exam_id: initial?.exam_id || (selectedExamIds[0] || ''),
    subject: initial?.subject || '',
    score: initial?.score?.toString() || '',
    max_score: initial?.max_score?.toString() || '',
    attempted: initial?.attempted?.toString() || '',
    time_taken: initial?.time_taken?.toString() || '',
    percentile: initial?.percentile?.toString() || '',
    date: initial?.date || today,
    notes: initial?.notes || '',
  });
  const [loading, setLoading] = useState(false);
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);
  const [showExamPicker, setShowExamPicker] = useState(false);

  const set = (key: keyof PaperFormData, val: string) => setForm(f => ({ ...f, [key]: val }));

  // Filter subjects by selected exam, or show all
  const filteredSubjects = useMemo(() => {
    if (!form.exam_id) return subjects;
    const examSubjects = subjects.filter(s => s.exam_id === form.exam_id || !s.exam_id);
    return examSubjects.length > 0 ? examSubjects : subjects;
  }, [subjects, form.exam_id]);

  const selectedExam = form.exam_id ? getExamById(form.exam_id) : null;

  const availableExams = selectedExamIds.length > 0
    ? EXAM_DEFINITIONS.filter(e => selectedExamIds.includes(e.id))
    : EXAM_DEFINITIONS;

  const handleSave = async () => {
    if (!form.name.trim()) { Alert.alert('Error', 'Please enter a paper name.'); return; }
    if (!form.score || !form.max_score) { Alert.alert('Error', 'Please enter score and maximum marks.'); return; }
    setLoading(true);
    const { error } = await onSave(form);
    setLoading(false);
    if (error) Alert.alert('Error', error);
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Field label="Paper name">
        <TextInput style={styles.input} value={form.name} onChangeText={v => set('name', v)}
          placeholder="e.g. UPSC Prelims 2023 GS1" placeholderTextColor={colors.textHint} />
      </Field>

      <Field label="Type">
        <View style={styles.toggle}>
          {(['mock', 'pyp'] as PaperType[]).map(t => (
            <TouchableOpacity key={t} style={[styles.toggleBtn, form.type === t && styles.toggleBtnActive]}
              onPress={() => set('type', t)}>
              <Text style={[styles.toggleText, form.type === t && styles.toggleTextActive]}>
                {t === 'mock' ? 'Mock test' : 'Previous year paper'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Field>

      {/* Exam selector */}
      <Field label="Exam">
        <TouchableOpacity style={styles.input} onPress={() => setShowExamPicker(v => !v)}>
          <Text style={form.exam_id ? styles.inputText : styles.inputPlaceholder}>
            {selectedExam ? selectedExam.shortName + ' — ' + selectedExam.name : 'Select exam...'}
          </Text>
        </TouchableOpacity>
        {showExamPicker && (
          <View style={styles.picker}>
            <TouchableOpacity style={styles.pickerItem} onPress={() => { set('exam_id', ''); set('subject', ''); setShowExamPicker(false); }}>
              <Text style={styles.pickerItemText}>None</Text>
            </TouchableOpacity>
            {availableExams.map(e => (
              <TouchableOpacity key={e.id}
                style={[styles.pickerItem, form.exam_id === e.id && styles.pickerItemActive]}
                onPress={() => { set('exam_id', e.id); set('subject', ''); setShowExamPicker(false); }}>
                <Text style={[styles.pickerItemText, form.exam_id === e.id && styles.pickerItemTextActive]}>
                  {e.shortName} — {e.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </Field>

      {/* Subject selector */}
      <Field label="Subject / Paper">
        <TouchableOpacity style={styles.input} onPress={() => setShowSubjectPicker(v => !v)}>
          <Text style={form.subject ? styles.inputText : styles.inputPlaceholder}>
            {form.subject || 'Select subject...'}
          </Text>
        </TouchableOpacity>
        {showSubjectPicker && (
          <View style={styles.picker}>
            <TouchableOpacity style={styles.pickerItem} onPress={() => { set('subject', ''); setShowSubjectPicker(false); }}>
              <Text style={styles.pickerItemText}>None</Text>
            </TouchableOpacity>
            {filteredSubjects.map(s => (
              <TouchableOpacity key={s.id} style={[styles.pickerItem, form.subject === s.name && styles.pickerItemActive]}
                onPress={() => { set('subject', s.name); setShowSubjectPicker(false); }}>
                <Text style={[styles.pickerItemText, form.subject === s.name && styles.pickerItemTextActive]}>{s.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </Field>

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Field label="Score obtained">
            <TextInput style={styles.input} value={form.score} onChangeText={v => set('score', v)}
              placeholder="e.g. 135" placeholderTextColor={colors.textHint} keyboardType="numeric" />
          </Field>
        </View>
        <View style={{ width: 12 }} />
        <View style={{ flex: 1 }}>
          <Field label="Maximum marks">
            <TextInput style={styles.input} value={form.max_score} onChangeText={v => set('max_score', v)}
              placeholder="e.g. 200" placeholderTextColor={colors.textHint} keyboardType="numeric" />
          </Field>
        </View>
      </View>

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Field label="Qs attempted">
            <TextInput style={styles.input} value={form.attempted} onChangeText={v => set('attempted', v)}
              placeholder="e.g. 90" placeholderTextColor={colors.textHint} keyboardType="numeric" />
          </Field>
        </View>
        <View style={{ width: 12 }} />
        <View style={{ flex: 1 }}>
          <Field label="Time (min)">
            <TextInput style={styles.input} value={form.time_taken} onChangeText={v => set('time_taken', v)}
              placeholder="e.g. 120" placeholderTextColor={colors.textHint} keyboardType="numeric" />
          </Field>
        </View>
      </View>

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Field label="Percentile">
            <TextInput style={styles.input} value={form.percentile} onChangeText={v => set('percentile', v)}
              placeholder="e.g. 87.5" placeholderTextColor={colors.textHint} keyboardType="numeric" />
          </Field>
        </View>
        <View style={{ width: 12 }} />
        <View style={{ flex: 1 }}>
          <Field label="Date (YYYY-MM-DD)">
            <TextInput style={styles.input} value={form.date} onChangeText={v => set('date', v)}
              placeholder={today} placeholderTextColor={colors.textHint} />
          </Field>
        </View>
      </View>

      <Field label="Notes / mistakes">
        <TextInput style={[styles.input, styles.textarea]} value={form.notes} onChangeText={v => set('notes', v)}
          placeholder="What went wrong? What to revise?" placeholderTextColor={colors.textHint}
          multiline numberOfLines={4} textAlignVertical="top" />
      </Field>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Save paper</Text>}
        </TouchableOpacity>
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={fieldStyles.label}>{label}</Text>
      {children}
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  label: { fontSize: 12, fontWeight: '500', color: colors.textSecondary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface, padding: spacing.xl },
  input: { borderWidth: 0.5, borderColor: colors.borderMed, borderRadius: radius.sm, padding: 12, fontSize: 15, color: colors.textPrimary, backgroundColor: colors.surface },
  inputText: { fontSize: 15, color: colors.textPrimary },
  inputPlaceholder: { fontSize: 15, color: colors.textHint },
  textarea: { minHeight: 90 },
  toggle: { flexDirection: 'row', borderWidth: 0.5, borderColor: colors.borderMed, borderRadius: radius.sm, overflow: 'hidden' },
  toggleBtn: { flex: 1, padding: 11, alignItems: 'center', backgroundColor: 'transparent' },
  toggleBtnActive: { backgroundColor: colors.primary },
  toggleText: { fontSize: 13, color: colors.textSecondary },
  toggleTextActive: { color: '#fff', fontWeight: '500' },
  row: { flexDirection: 'row' },
  picker: { borderWidth: 0.5, borderColor: colors.border, borderRadius: radius.sm, marginTop: 4, backgroundColor: colors.surface, maxHeight: 220 },
  pickerItem: { padding: 12, borderBottomWidth: 0.5, borderBottomColor: colors.border },
  pickerItemActive: { backgroundColor: colors.primaryLight },
  pickerItemText: { fontSize: 14, color: colors.textPrimary },
  pickerItemTextActive: { color: colors.primary, fontWeight: '500' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: radius.sm, alignItems: 'center', borderWidth: 0.5, borderColor: colors.borderMed },
  cancelText: { fontSize: 15, color: colors.textSecondary },
  saveBtn: { flex: 2, padding: 14, borderRadius: radius.sm, alignItems: 'center', backgroundColor: colors.primary },
  saveText: { fontSize: 15, fontWeight: '500', color: '#fff' },
});
