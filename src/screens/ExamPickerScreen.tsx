import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { EXAM_DEFINITIONS, EXAM_CATEGORIES } from '../lib/exams';
import { colors, radius, spacing } from '../lib/theme';

interface Props {
  selectedExamIds: string[];
  onToggleExam: (examId: string, selected: boolean) => Promise<void>;
}

export default function ExamPickerScreen({ selectedExamIds, onToggleExam }: Props) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState(EXAM_CATEGORIES[0]);

  const filtered = EXAM_DEFINITIONS.filter(e => e.category === activeCategory);

  const handleToggle = async (examId: string) => {
    const isSelected = selectedExamIds.includes(examId);
    setLoadingId(examId);
    await onToggleExam(examId, !isSelected);
    setLoadingId(null);
  };

  return (
    <View style={styles.container}>
      {/* Category tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}
        contentContainerStyle={styles.categoryRow}>
        {EXAM_CATEGORIES.map(cat => (
          <TouchableOpacity key={cat}
            style={[styles.catChip, activeCategory === cat && styles.catChipActive]}
            onPress={() => setActiveCategory(cat)}>
            <Text style={[styles.catText, activeCategory === cat && styles.catTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.list}>
        <Text style={styles.hint}>
          Select the exams you're preparing for. Subjects for each exam will be added to your subject list automatically.
        </Text>
        {filtered.map(exam => {
          const selected = selectedExamIds.includes(exam.id);
          const isLoading = loadingId === exam.id;
          return (
            <TouchableOpacity
              key={exam.id}
              style={[styles.examCard, selected && styles.examCardSelected]}
              onPress={() => handleToggle(exam.id)}
              activeOpacity={0.75}
            >
              <View style={styles.examLeft}>
                <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                  {isLoading
                    ? <ActivityIndicator size="small" color={selected ? '#fff' : colors.primary} />
                    : selected ? <Text style={styles.checkmark}>✓</Text> : null}
                </View>
                <View style={styles.examInfo}>
                  <Text style={[styles.examName, selected && styles.examNameSelected]}>{exam.name}</Text>
                  <Text style={styles.examSubjectCount}>{exam.subjects.length} subjects included</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  categoryScroll: { flexGrow: 0, backgroundColor: colors.surface, borderBottomWidth: 0.5, borderBottomColor: colors.border },
  categoryRow: { flexDirection: 'row', paddingHorizontal: spacing.lg, paddingVertical: 10, gap: 8 },
  catChip: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: radius.full,
    borderWidth: 0.5, borderColor: colors.borderMed, backgroundColor: colors.surface,
  },
  catChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  catText: { fontSize: 13, color: colors.textSecondary },
  catTextActive: { color: '#fff', fontWeight: '500' },
  list: { padding: spacing.lg, paddingBottom: 48 },
  hint: { fontSize: 13, color: colors.textSecondary, marginBottom: 14, lineHeight: 20 },
  examCard: {
    backgroundColor: colors.surface, borderRadius: radius.md, padding: 14,
    marginBottom: 10, borderWidth: 0.5, borderColor: colors.border,
  },
  examCardSelected: { borderColor: colors.primary, borderWidth: 1.5 },
  examLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  checkbox: {
    width: 24, height: 24, borderRadius: 6, borderWidth: 1.5,
    borderColor: colors.borderMed, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  checkboxSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkmark: { color: '#fff', fontSize: 14, fontWeight: '600' },
  examInfo: { flex: 1 },
  examName: { fontSize: 14, fontWeight: '500', color: colors.textPrimary, marginBottom: 2 },
  examNameSelected: { color: colors.primary },
  examSubjectCount: { fontSize: 12, color: colors.textSecondary },
});
