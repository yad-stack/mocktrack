import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Alert,
} from 'react-native';
import { Paper } from '../lib/types';
import { colors, radius, spacing } from '../lib/theme';
import { getExamById } from '../lib/exams';

interface Props {
  paper: Paper;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

function pct(score: number, max: number) {
  return max > 0 ? Math.round((score / max) * 100) : 0;
}
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function PaperDetailScreen({ paper, onEdit, onDelete, onClose }: Props) {
  const percent = pct(paper.score, paper.max_score);
  const exam = paper.exam_id ? getExamById(paper.exam_id) : null;

  const scoreColor = percent >= 70 ? colors.success : percent >= 50 ? '#B36B00' : colors.danger;

  const handleDelete = () => {
    Alert.alert('Delete paper', 'Are you sure you want to delete this paper?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: onDelete },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{paper.name}</Text>
        <TouchableOpacity onPress={onEdit} style={styles.editBtn}>
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Score hero */}
        <View style={styles.scoreCard}>
          <View style={styles.scoreRow}>
            <Text style={[styles.scoreBig, { color: scoreColor }]}>{paper.score}</Text>
            <Text style={styles.scoreMax}>/{paper.max_score}</Text>
            <View style={styles.scorePctBadge}>
              <Text style={[styles.scorePct, { color: scoreColor }]}>{percent}%</Text>
            </View>
          </View>
          {paper.percentile !== undefined && paper.percentile !== null && (
            <View style={styles.percentileRow}>
              <Text style={styles.percentileLabel}>Percentile</Text>
              <Text style={styles.percentileValue}>{paper.percentile}</Text>
            </View>
          )}
          {/* Score bar */}
          <View style={styles.scoreBarTrack}>
            <View style={[styles.scoreBarFill, { width: `${percent}%` as any, backgroundColor: scoreColor }]} />
          </View>
        </View>

        {/* Tags row */}
        <View style={styles.tagsRow}>
          <View style={[styles.typeBadge, paper.type === 'mock' ? styles.typeMock : styles.typePyp]}>
            <Text style={[styles.typeText, paper.type === 'mock' ? styles.typeMockText : styles.typePypText]}>
              {paper.type === 'mock' ? 'Mock test' : 'Previous year paper'}
            </Text>
          </View>
          {exam && (
            <View style={styles.examBadge}>
              <Text style={styles.examBadgeText}>{exam.shortName}</Text>
            </View>
          )}
        </View>

        {/* Details grid */}
        <View style={styles.detailGrid}>
          <DetailItem icon="📅" label="Date" value={fmtDate(paper.date)} />
          {paper.subject && <DetailItem icon="📚" label="Subject" value={paper.subject} />}
          {paper.attempted !== undefined && paper.attempted !== null && (
            <DetailItem icon="✏️" label="Questions attempted" value={String(paper.attempted)} />
          )}
          {paper.time_taken !== undefined && paper.time_taken !== null && (
            <DetailItem icon="⏱" label="Time taken" value={`${paper.time_taken} minutes`} />
          )}
          {exam && <DetailItem icon="🎯" label="Exam" value={exam.name} fullWidth />}
        </View>

        {/* Notes */}
        {paper.notes ? (
          <View style={styles.notesSection}>
            <Text style={styles.notesSectionTitle}>Notes & mistakes</Text>
            <View style={styles.notesBox}>
              <Text style={styles.notesText}>{paper.notes}</Text>
            </View>
          </View>
        ) : null}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.editActionBtn} onPress={onEdit}>
            <Text style={styles.editActionText}>Edit paper</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteActionBtn} onPress={handleDelete}>
            <Text style={styles.deleteActionText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailItem({ icon, label, value, fullWidth }: {
  icon: string; label: string; value: string; fullWidth?: boolean;
}) {
  return (
    <View style={[styles.detailItem, fullWidth && styles.detailItemFull]}>
      <Text style={styles.detailIcon}>{icon}</Text>
      <View style={styles.detailText}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: 14,
    borderBottomWidth: 0.5, borderBottomColor: colors.border,
  },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: '500', color: colors.textPrimary, marginHorizontal: 12 },
  closeBtn: { padding: 4 },
  closeBtnText: { fontSize: 16, color: colors.textSecondary },
  editBtn: { padding: 4 },
  editBtnText: { fontSize: 15, color: colors.primary, fontWeight: '500' },

  content: { padding: spacing.lg, paddingBottom: 48 },

  scoreCard: {
    backgroundColor: colors.surfaceSecondary, borderRadius: radius.lg,
    padding: 20, marginBottom: 16,
  },
  scoreRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12 },
  scoreBig: { fontSize: 52, fontWeight: '600', lineHeight: 56 },
  scoreMax: { fontSize: 24, color: colors.textSecondary, marginBottom: 4, marginLeft: 2 },
  scorePctBadge: { marginLeft: 'auto' as any },
  scorePct: { fontSize: 32, fontWeight: '600' },
  percentileRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 12,
  },
  percentileLabel: { fontSize: 13, color: colors.textSecondary },
  percentileValue: { fontSize: 18, fontWeight: '500', color: colors.textPrimary },
  scoreBarTrack: { height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden' },
  scoreBarFill: { height: '100%', borderRadius: 3 },

  tagsRow: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  typeBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: radius.full },
  typeMock: { backgroundColor: colors.primaryLight },
  typePyp: { backgroundColor: colors.successLight },
  typeText: { fontSize: 12, fontWeight: '500' },
  typeMockText: { color: colors.primaryDark },
  typePypText: { color: colors.success },
  examBadge: { backgroundColor: '#F5EAF3', paddingHorizontal: 12, paddingVertical: 5, borderRadius: radius.full },
  examBadgeText: { fontSize: 12, fontWeight: '500', color: '#6B2F6B' },

  detailGrid: { gap: 10, marginBottom: 20 },
  detailItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.surfaceSecondary, borderRadius: radius.md, padding: 14,
  },
  detailItemFull: {},
  detailIcon: { fontSize: 20 },
  detailText: { flex: 1 },
  detailLabel: { fontSize: 11, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 2 },
  detailValue: { fontSize: 15, fontWeight: '500', color: colors.textPrimary },

  notesSection: { marginBottom: 24 },
  notesSectionTitle: { fontSize: 13, fontWeight: '500', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  notesBox: { backgroundColor: colors.surfaceSecondary, borderRadius: radius.md, padding: 14 },
  notesText: { fontSize: 14, color: colors.textPrimary, lineHeight: 22 },

  actions: { flexDirection: 'row', gap: 12 },
  editActionBtn: {
    flex: 1, padding: 14, borderRadius: radius.md, alignItems: 'center',
    backgroundColor: colors.primary,
  },
  editActionText: { color: '#fff', fontSize: 15, fontWeight: '500' },
  deleteActionBtn: {
    padding: 14, paddingHorizontal: 20, borderRadius: radius.md, alignItems: 'center',
    borderWidth: 0.5, borderColor: 'rgba(163,45,45,0.3)',
  },
  deleteActionText: { color: colors.danger, fontSize: 15 },
});
