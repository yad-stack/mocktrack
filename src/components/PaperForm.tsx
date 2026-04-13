import React, { useState, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, Alert, Modal, FlatList, SafeAreaView,
} from 'react-native';
import { Paper, PaperFormData, PaperType, SectionFormData, Subject, sectionToForm } from '../lib/types';
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
    total_questions: initial?.total_questions?.toString() || '',
    attempted: initial?.attempted?.toString() || '',
    correct_answers: initial?.correct_answers?.toString() || '',
    incorrect_answers: initial?.incorrect_answers?.toString() || '',
    total_time: initial?.total_time?.toString() || '',
    percentile: initial?.percentile?.toString() || '',
    rank: initial?.rank?.toString() || '',
    rank_out_of: initial?.rank_out_of?.toString() || '',
    date: initial?.date || today,
    cutoff: initial?.cutoff?.toString() || '',
    notes: initial?.notes || '',
    sections: initial?.sections ? initial.sections.map(sectionToForm) : [],
  });
  const [loading, setLoading] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showExamModal, setShowExamModal] = useState(false);

  const set = (key: keyof PaperFormData, val: any) => setForm(f => ({ ...f, [key]: val }));

  const unattempted = useMemo(() => {
    const total = parseInt(form.total_questions) || 0;
    const att = parseInt(form.attempted) || 0;
    if (total > 0 && att > 0) return Math.max(0, total - att);
    return null;
  }, [form.total_questions, form.attempted]);

  const accuracy = useMemo(() => {
    const correct = parseInt(form.correct_answers) || 0;
    const att = parseInt(form.attempted) || 0;
    if (att > 0 && correct >= 0) return Math.round((correct / att) * 100);
    return null;
  }, [form.correct_answers, form.attempted]);

  const filteredSubjects = useMemo(() => {
    if (!form.exam_id) return subjects;
    const ex = subjects.filter(s => s.exam_id === form.exam_id || !s.exam_id);
    return ex.length > 0 ? ex : subjects;
  }, [subjects, form.exam_id]);

  const selectedExam = form.exam_id ? getExamById(form.exam_id) : null;
  const availableExams = selectedExamIds.length > 0
    ? EXAM_DEFINITIONS.filter(e => selectedExamIds.includes(e.id))
    : EXAM_DEFINITIONS;

  const addSection = () => setForm(f => ({
    ...f,
    sections: [...f.sections, {
      name: '', score: '', max_score: '', attempted: '',
      total_questions: '', correct: '', incorrect: '', time_taken: '',
    } as SectionFormData]
  }));

  const removeSection = (i: number) => setForm(f => ({
    ...f, sections: f.sections.filter((_, idx) => idx !== i),
  }));

  const updateSection = (i: number, key: keyof SectionFormData, val: string) => {
    setForm(f => {
      const sections = [...f.sections];
      sections[i] = { ...sections[i], [key]: val };
      return { ...f, sections };
    });
  };

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

      <SecHeader title="Basic info" />

      <View style={styles.pad}>
        <Field label="Paper name">
          <TextInput style={styles.input} value={form.name} onChangeText={v => set('name', v)}
            placeholder="e.g. SSC CGL 2025 Tier I" placeholderTextColor={colors.textHint} />
        </Field>

        <Field label="Type">
          <View style={styles.toggle}>
            {(['mock', 'pyp'] as PaperType[]).map(t => (
              <TouchableOpacity key={t} style={[styles.toggleBtn, form.type === t && styles.toggleBtnActive]} onPress={() => set('type', t)}>
                <Text style={[styles.toggleText, form.type === t && styles.toggleTextActive]}>
                  {t === 'mock' ? 'Mock test' : 'Previous year'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Field>

        <View style={styles.row2}>
          <View style={{ flex: 1 }}>
            <Field label="Exam">
              <TouchableOpacity style={styles.pickerTrigger} onPress={() => setShowExamModal(true)}>
                <Text style={form.exam_id ? styles.ptText : styles.ptPlaceholder} numberOfLines={1}>
                  {selectedExam ? selectedExam.shortName : 'Select...'}
                </Text>
                <Text style={styles.ptArrow}>›</Text>
              </TouchableOpacity>
            </Field>
          </View>
          <View style={{ width: 10 }} />
          <View style={{ flex: 1 }}>
            <Field label="Subject / Paper">
              <TouchableOpacity style={styles.pickerTrigger} onPress={() => setShowSubjectModal(true)}>
                <Text style={form.subject ? styles.ptText : styles.ptPlaceholder} numberOfLines={1}>
                  {form.subject || 'Select...'}
                </Text>
                <Text style={styles.ptArrow}>›</Text>
              </TouchableOpacity>
            </Field>
          </View>
        </View>

        <Field label="Date (YYYY-MM-DD)">
          <TextInput style={styles.input} value={form.date} onChangeText={v => set('date', v)}
            placeholder={today} placeholderTextColor={colors.textHint} />
        </Field>
      </View>

      <SecHeader title="Score & time" />
      <View style={styles.pad}>
        <View style={styles.row2}>
          <View style={{ flex: 1 }}>
            <Field label="Score obtained">
              <TextInput style={styles.input} value={form.score} onChangeText={v => set('score', v)}
                placeholder="97.5" placeholderTextColor={colors.textHint} keyboardType="numeric" />
            </Field>
          </View>
          <View style={{ width: 10 }} />
          <View style={{ flex: 1 }}>
            <Field label="Maximum marks">
              <TextInput style={styles.input} value={form.max_score} onChangeText={v => set('max_score', v)}
                placeholder="200" placeholderTextColor={colors.textHint} keyboardType="numeric" />
            </Field>
          </View>
        </View>
        <View style={styles.row2}>
          <View style={{ flex: 1 }}>
            <Field label="Total time (min)">
              <TextInput style={styles.input} value={form.total_time} onChangeText={v => set('total_time', v)}
                placeholder="60" placeholderTextColor={colors.textHint} keyboardType="numeric" />
            </Field>
          </View>
          <View style={{ width: 10 }} />
          <View style={{ flex: 1 }}>
            <Field label="Percentile">
              <TextInput style={styles.input} value={form.percentile} onChangeText={v => set('percentile', v)}
                placeholder="87.5" placeholderTextColor={colors.textHint} keyboardType="numeric" />
            </Field>
          </View>
        </View>
        <View style={styles.row2}>
          <View style={{ flex: 1 }}>
            <Field label="Rank">
              <TextInput style={styles.input} value={form.rank} onChangeText={v => set('rank', v)}
                placeholder="1234" placeholderTextColor={colors.textHint} keyboardType="numeric" />
            </Field>
          </View>
          <View style={{ width: 10 }} />
          <View style={{ flex: 1 }}>
            <Field label="Rank out of">
              <TextInput style={styles.input} value={form.rank_out_of} onChangeText={v => set('rank_out_of', v)}
                placeholder="500000" placeholderTextColor={colors.textHint} keyboardType="numeric" />
            </Field>
          </View>
        </View>
        <Field label={form.type === 'pyp' ? 'Cutoff marks (actual)' : 'Expected cutoff marks'}>
          <TextInput style={styles.input} value={form.cutoff} onChangeText={v => set('cutoff', v)}
            placeholder={form.type === 'pyp' ? 'e.g. 140.5' : 'e.g. 130'}
            placeholderTextColor={colors.textHint} keyboardType="numeric" />
          <Text style={styles.cutoffHint}>
            {form.type === 'pyp' ? 'Shown as a marker on the score bar' : 'Estimated cutoff — shown on the score bar'}
          </Text>
        </Field>
      </View>

      <SecHeader title="Attempts & accuracy" />
      <View style={styles.pad}>
        <View style={styles.row2}>
          <View style={{ flex: 1 }}>
            <Field label="Total questions">
              <TextInput style={styles.input} value={form.total_questions} onChangeText={v => set('total_questions', v)}
                placeholder="100" placeholderTextColor={colors.textHint} keyboardType="numeric" />
            </Field>
          </View>
          <View style={{ width: 10 }} />
          <View style={{ flex: 1 }}>
            <Field label="Attempted">
              <TextInput style={styles.input} value={form.attempted} onChangeText={v => set('attempted', v)}
                placeholder="65" placeholderTextColor={colors.textHint} keyboardType="numeric" />
            </Field>
          </View>
        </View>
        <View style={styles.row2}>
          <View style={{ flex: 1 }}>
            <Field label="Correct answers">
              <TextInput style={styles.input} value={form.correct_answers} onChangeText={v => set('correct_answers', v)}
                placeholder="52" placeholderTextColor={colors.textHint} keyboardType="numeric" />
            </Field>
          </View>
          <View style={{ width: 10 }} />
          <View style={{ flex: 1 }}>
            <Field label="Incorrect answers">
              <TextInput style={styles.input} value={form.incorrect_answers} onChangeText={v => set('incorrect_answers', v)}
                placeholder="13" placeholderTextColor={colors.textHint} keyboardType="numeric" />
            </Field>
          </View>
        </View>
        {(unattempted !== null || accuracy !== null) && (
          <View style={styles.autoRow}>
            {unattempted !== null && (
              <View style={styles.autoItem}>
                <Text style={styles.autoLabel}>Unattempted</Text>
                <Text style={styles.autoValue}>{unattempted}</Text>
              </View>
            )}
            {accuracy !== null && (
              <View style={styles.autoItem}>
                <Text style={styles.autoLabel}>Accuracy</Text>
                <Text style={styles.autoValue}>{accuracy}%</Text>
              </View>
            )}
          </View>
        )}
      </View>

      <SecHeader title="Section-wise marks" subtitle="For full mocks — optional" />
      <View style={styles.pad}>
        {form.sections.map((sec, i) => (
          <View key={i} style={styles.secCard}>
            <View style={styles.secCardTop}>
              <Text style={styles.secCardTitle}>Section {i + 1}</Text>
              <TouchableOpacity onPress={() => removeSection(i)}>
                <Text style={styles.secRemove}>Remove</Text>
              </TouchableOpacity>
            </View>
            <Field label="Section name">
              <TextInput style={styles.input} value={sec.name} onChangeText={v => updateSection(i, 'name', v)}
                placeholder="e.g. General Intelligence" placeholderTextColor={colors.textHint} />
            </Field>
            <View style={styles.row2}>
              <View style={{ flex: 1 }}>
                <Field label="Score">
                  <TextInput style={styles.input} value={sec.score}
                    onChangeText={v => updateSection(i, 'score', v)} placeholder="0" placeholderTextColor={colors.textHint} keyboardType="decimal-pad" />
                </Field>
              </View>
              <View style={{ width: 10 }} />
              <View style={{ flex: 1 }}>
                <Field label="Max marks">
                  <TextInput style={styles.input} value={sec.max_score}
                    onChangeText={v => updateSection(i, 'max_score', v)} placeholder="0" placeholderTextColor={colors.textHint} keyboardType="decimal-pad" />
                </Field>
              </View>
            </View>
            <View style={styles.row2}>
              <View style={{ flex: 1 }}>
                <Field label="Total Qs">
                  <TextInput style={styles.input} value={sec.total_questions}
                    onChangeText={v => updateSection(i, 'total_questions', v)} placeholder="0" placeholderTextColor={colors.textHint} keyboardType="numeric" />
                </Field>
              </View>
              <View style={{ width: 10 }} />
              <View style={{ flex: 1 }}>
                <Field label="Attempted">
                  <TextInput style={styles.input} value={sec.attempted}
                    onChangeText={v => updateSection(i, 'attempted', v)} placeholder="0" placeholderTextColor={colors.textHint} keyboardType="numeric" />
                </Field>
              </View>
            </View>
            <View style={styles.row2}>
              <View style={{ flex: 1 }}>
                <Field label="Correct">
                  <TextInput style={styles.input} value={sec.correct}
                    onChangeText={v => updateSection(i, 'correct', v)} placeholder="0" placeholderTextColor={colors.textHint} keyboardType="decimal-pad" />
                </Field>
              </View>
              <View style={{ width: 10 }} />
              <View style={{ flex: 1 }}>
                <Field label="Incorrect">
                  <TextInput style={styles.input} value={sec.incorrect}
                    onChangeText={v => updateSection(i, 'incorrect', v)} placeholder="0" placeholderTextColor={colors.textHint} keyboardType="decimal-pad" />
                </Field>
              </View>
            </View>
            <Field label="Time taken (min)">
              <TextInput style={styles.input} value={sec.time_taken}
                onChangeText={v => updateSection(i, 'time_taken', v)} placeholder="0" placeholderTextColor={colors.textHint} keyboardType="numeric" />
            </Field>
          </View>
        ))}
        <TouchableOpacity style={styles.addSecBtn} onPress={addSection}>
          <Text style={styles.addSecText}>+ Add section</Text>
        </TouchableOpacity>
      </View>

      <SecHeader title="Notes" />
      <View style={styles.pad}>
        <Field label="Notes / mistakes">
          <TextInput style={[styles.input, styles.textarea]} value={form.notes} onChangeText={v => set('notes', v)}
            placeholder="What went wrong? What to revise?" placeholderTextColor={colors.textHint}
            multiline numberOfLines={4} textAlignVertical="top" />
        </Field>
      </View>

      <View style={[styles.row2, { paddingHorizontal: spacing.lg, marginBottom: 8 }]}>
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Save paper</Text>}
        </TouchableOpacity>
      </View>
      <View style={{ height: 40 }} />

      <PickerModal visible={showExamModal} title="Select exam" onClose={() => setShowExamModal(false)}
        items={[{ label: 'None', value: '' }, ...availableExams.map(e => ({ label: `${e.shortName} — ${e.name}`, value: e.id }))]}
        selectedValue={form.exam_id}
        onSelect={v => { set('exam_id', v); set('subject', ''); setShowExamModal(false); }} />

      <PickerModal visible={showSubjectModal} title="Select subject" onClose={() => setShowSubjectModal(false)}
        items={[{ label: 'None', value: '' }, ...filteredSubjects.map(s => ({ label: s.name, value: s.name }))]}
        selectedValue={form.subject}
        onSelect={v => { set('subject', v); setShowSubjectModal(false); }} />
    </ScrollView>
  );
}

function PickerModal({ visible, title, onClose, items, selectedValue, onSelect }: {
  visible: boolean; title: string; onClose: () => void;
  items: { label: string; value: string }[];
  selectedValue: string; onSelect: (v: string) => void;
}) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalSafe}>
        <View style={styles.modalHdr}>
          <Text style={styles.modalHdrTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose}><Text style={styles.modalHdrClose}>Cancel</Text></TouchableOpacity>
        </View>
        <FlatList
          data={items} keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={[styles.pItem, selectedValue === item.value && styles.pItemActive]} onPress={() => onSelect(item.value)}>
              <Text style={[styles.pItemText, selectedValue === item.value && styles.pItemTextActive]}>{item.label}</Text>
              {selectedValue === item.value && <Text style={styles.pCheck}>✓</Text>}
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 0.5, backgroundColor: colors.border, marginLeft: 16 }} />}
        />
      </SafeAreaView>
    </Modal>
  );
}

function SecHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.secHdr}>
      <Text style={styles.secHdrText}>{title}</Text>
      {subtitle && <Text style={styles.secHdrSub}>{subtitle}</Text>}
    </View>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 11 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  pad: { paddingHorizontal: spacing.lg, paddingTop: 14, paddingBottom: 4 },
  row2: { flexDirection: 'row' },
  fieldLabel: { fontSize: 11, fontWeight: '500', color: colors.textSecondary, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { borderWidth: 0.5, borderColor: colors.borderMed, borderRadius: radius.sm, padding: 10, fontSize: 14, color: colors.textPrimary, backgroundColor: colors.surface },
  textarea: { minHeight: 80 },
  toggle: { flexDirection: 'row', borderWidth: 0.5, borderColor: colors.borderMed, borderRadius: radius.sm, overflow: 'hidden' },
  toggleBtn: { flex: 1, padding: 10, alignItems: 'center' },
  toggleBtnActive: { backgroundColor: colors.primary },
  toggleText: { fontSize: 13, color: colors.textSecondary },
  toggleTextActive: { color: '#fff', fontWeight: '500' },
  pickerTrigger: { borderWidth: 0.5, borderColor: colors.borderMed, borderRadius: radius.sm, padding: 10, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center' },
  ptText: { flex: 1, fontSize: 14, color: colors.textPrimary },
  ptPlaceholder: { flex: 1, fontSize: 14, color: colors.textHint },
  ptArrow: { fontSize: 18, color: colors.textSecondary },
  autoRow: { flexDirection: 'row', gap: 10, marginBottom: 4 },
  autoItem: { flex: 1, backgroundColor: colors.primaryLight, borderRadius: radius.sm, padding: 10, alignItems: 'center' },
  autoLabel: { fontSize: 11, color: colors.primaryDark, textTransform: 'uppercase', letterSpacing: 0.4 },
  autoValue: { fontSize: 18, fontWeight: '500', color: colors.primaryDark, marginTop: 2 },
  secHdr: { paddingHorizontal: spacing.lg, paddingVertical: 10, backgroundColor: colors.surfaceSecondary, borderTopWidth: 0.5, borderBottomWidth: 0.5, borderColor: colors.border, marginTop: 8 },
  secHdrText: { fontSize: 11, fontWeight: '500', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.6 },
  secHdrSub: { fontSize: 11, color: colors.textHint, marginTop: 1 },
  secCard: { marginBottom: 12, backgroundColor: colors.surface, borderRadius: radius.md, padding: 14, borderWidth: 0.5, borderColor: colors.border },
  secCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  secCardTitle: { fontSize: 14, fontWeight: '500', color: colors.textPrimary },
  secRemove: { fontSize: 13, color: colors.danger },
  addSecBtn: { padding: 12, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.primary, borderStyle: 'dashed', alignItems: 'center', marginBottom: 8 },
  addSecText: { fontSize: 14, color: colors.primary, fontWeight: '500' },
  cutoffHint: { fontSize: 11, color: colors.textHint, marginTop: 4 },
  actions: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, padding: 13, borderRadius: radius.sm, alignItems: 'center', borderWidth: 0.5, borderColor: colors.borderMed },
  cancelText: { fontSize: 15, color: colors.textSecondary },
  saveBtn: { flex: 2, padding: 13, borderRadius: radius.sm, alignItems: 'center', backgroundColor: colors.primary },
  saveText: { fontSize: 15, fontWeight: '500', color: '#fff' },
  modalSafe: { flex: 1, backgroundColor: colors.surface },
  modalHdr: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 0.5, borderBottomColor: colors.border },
  modalHdrTitle: { fontSize: 17, fontWeight: '500', color: colors.textPrimary },
  modalHdrClose: { fontSize: 15, color: colors.textSecondary },
  pItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 },
  pItemActive: { backgroundColor: colors.primaryLight },
  pItemText: { flex: 1, fontSize: 15, color: colors.textPrimary },
  pItemTextActive: { color: colors.primary, fontWeight: '500' },
  pCheck: { fontSize: 16, color: colors.primary },
});
