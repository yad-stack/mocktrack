import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, SafeAreaView, StatusBar,
} from 'react-native';
import { EXAM_DEFINITIONS, EXAM_CATEGORIES } from '../lib/exams';
import { colors, radius, spacing } from '../lib/theme';

interface Props {
  onComplete: (selectedExamIds: string[]) => Promise<void>;
}

export default function OnboardingScreen({ onComplete }: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState(EXAM_CATEGORIES[0]);
  const [loading, setLoading] = useState(false);

  const toggle = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleContinue = async () => {
    setLoading(true);
    await onComplete(selectedIds);
    setLoading(false);
  };

  const filtered = EXAM_DEFINITIONS.filter(e => e.category === activeCategory);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to MockTrack</Text>
        <Text style={styles.subtitle}>
          Select the exams you're preparing for.{'\n'}
          We'll set up the right subjects for you.
        </Text>
      </View>

      {/* Category tabs */}
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryRow}>
        {EXAM_CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.catChip, activeCategory === cat && styles.catChipActive]}
            onPress={() => setActiveCategory(cat)}>
            <Text style={[styles.catText, activeCategory === cat && styles.catTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Exam list */}
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {filtered.map(exam => {
          const selected = selectedIds.includes(exam.id);
          return (
            <TouchableOpacity
              key={exam.id}
              style={[styles.examCard, selected && styles.examCardSelected]}
              onPress={() => toggle(exam.id)}
              activeOpacity={0.75}>
              <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                {selected && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <View style={styles.examInfo}>
                <Text style={[styles.examName, selected && styles.examNameSelected]}>
                  {exam.name}
                </Text>
                <Text style={styles.examMeta}>
                  {exam.subjects.length} subjects · {exam.shortName}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        {selectedIds.length > 0 && (
          <Text style={styles.selectionCount}>
            {selectedIds.length} exam{selectedIds.length > 1 ? 's' : ''} selected
          </Text>
        )}
        <TouchableOpacity
          style={[styles.continueBtn, selectedIds.length === 0 && styles.continueBtnDisabled]}
          onPress={handleContinue}
          disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.continueBtnText}>
                {selectedIds.length === 0 ? 'Skip for now' : 'Continue →'}
              </Text>}
        </TouchableOpacity>
        {selectedIds.length === 0 && (
          <Text style={styles.skipNote}>
            You can add exams later in Settings
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },

  header: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24, fontWeight: '600', color: colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14, color: colors.textSecondary, lineHeight: 22,
  },

  categoryScroll: {
    flexGrow: 0, backgroundColor: colors.surface,
    borderBottomWidth: 0.5, borderBottomColor: colors.border,
  },
  categoryRow: {
    flexDirection: 'row', paddingHorizontal: spacing.lg,
    paddingVertical: 10, gap: 8,
  },
  catChip: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: radius.full,
    borderWidth: 0.5, borderColor: colors.borderMed, backgroundColor: colors.surface,
  },
  catChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  catText: { fontSize: 13, color: colors.textSecondary },
  catTextActive: { color: '#fff', fontWeight: '500' },

  list: { flex: 1 },
  listContent: { padding: spacing.lg, paddingBottom: 16, gap: 10 },

  examCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: colors.surface, borderRadius: radius.md,
    padding: 14, borderWidth: 0.5, borderColor: colors.border,
  },
  examCardSelected: {
    borderColor: colors.primary, borderWidth: 1.5,
    backgroundColor: colors.primaryLight,
  },
  checkbox: {
    width: 26, height: 26, borderRadius: 7, borderWidth: 1.5,
    borderColor: colors.borderMed, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.surface, flexShrink: 0,
  },
  checkboxSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkmark: { color: '#fff', fontSize: 15, fontWeight: '600' },
  examInfo: { flex: 1 },
  examName: { fontSize: 14, fontWeight: '500', color: colors.textPrimary, marginBottom: 3 },
  examNameSelected: { color: colors.primaryDark },
  examMeta: { fontSize: 12, color: colors.textSecondary },

  footer: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
    gap: 8,
  },
  selectionCount: {
    fontSize: 13, color: colors.primary, fontWeight: '500', textAlign: 'center',
  },
  continueBtn: {
    backgroundColor: colors.primary, borderRadius: radius.md,
    paddingVertical: 14, alignItems: 'center',
  },
  continueBtnDisabled: { backgroundColor: colors.textSecondary },
  continueBtnText: { color: '#fff', fontSize: 16, fontWeight: '500' },
  skipNote: {
    fontSize: 12, color: colors.textHint, textAlign: 'center',
  },
});
