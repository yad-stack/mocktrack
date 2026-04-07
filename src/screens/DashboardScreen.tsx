import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Paper } from '../lib/types';
import { colors, radius, spacing } from '../lib/theme';

interface Props {
  papers: Paper[];
  loading: boolean;
  onAddPaper: () => void;
  onPaperPress: (p: Paper) => void;
}

function pct(score: number, max: number) { return max > 0 ? Math.round((score / max) * 100) : 0; }
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function DashboardScreen({ papers, loading, onAddPaper, onPaperPress }: Props) {
  if (loading) return <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>;

  const total = papers.length;
  const mocks = papers.filter(p => p.type === 'mock').length;
  const pyps = papers.filter(p => p.type === 'pyp').length;
  const avgScore = total ? Math.round(papers.reduce((s, p) => s + pct(p.score, p.max_score), 0) / total) : 0;
  const withPerc = papers.filter(p => p.percentile);
  const avgPerc = withPerc.length ? Math.round(withPerc.reduce((s, p) => s + (p.percentile || 0), 0) / withPerc.length) : null;
  const best = total ? [...papers].sort((a, b) => pct(b.score, b.max_score) - pct(a.score, a.max_score))[0] : null;
  const recent = [...papers].slice(0, 3);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.statGrid}>
        <StatCard label="Total papers" value={String(total)} sub={`${mocks} mocks · ${pyps} PYPs`} />
        <StatCard label="Avg score" value={`${avgScore}%`} sub={avgPerc !== null ? `Percentile: ${avgPerc}` : 'No percentile data'} />
      </View>

      {best && (
        <View style={[styles.statGrid, { marginTop: 0 }]}>
          <View style={[styles.statCard, { flex: 1 }]}>
            <Text style={styles.statLabel}>Best performance</Text>
            <Text style={[styles.statValue, { fontSize: 16 }]} numberOfLines={1}>{best.name}</Text>
            <Text style={styles.statSub}>{pct(best.score, best.max_score)}% · {fmtDate(best.date)}</Text>
          </View>
        </View>
      )}

      <Text style={styles.sectionTitle}>Recent papers</Text>

      {recent.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyText}>No papers added yet.{'\n'}Tap + to add your first entry.</Text>
          <TouchableOpacity style={styles.addBtn} onPress={onAddPaper}>
            <Text style={styles.addBtnText}>Add first paper</Text>
          </TouchableOpacity>
        </View>
      ) : (
        recent.map(p => <PaperCard key={p.id} paper={p} onPress={() => onPaperPress(p)} />)
      )}
    </ScrollView>
  );
}

export function PaperCard({ paper: p, onPress, showActions, onEdit, onDelete }:
  { paper: Paper; onPress: () => void; showActions?: boolean; onEdit?: () => void; onDelete?: () => void; }) {
  const percent = pct(p.score, p.max_score);
  return (
    <TouchableOpacity style={styles.paperCard} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.paperTop}>
        <Text style={styles.paperName} numberOfLines={2}>{p.name}</Text>
        <View style={[styles.typeBadge, p.type === 'mock' ? styles.typeMock : styles.typePyp]}>
          <Text style={[styles.typeText, p.type === 'mock' ? styles.typeMockText : styles.typePypText]}>
            {p.type === 'mock' ? 'Mock' : 'PYP'}
          </Text>
        </View>
      </View>
      <View style={styles.paperMeta}>
        <View style={styles.paperTags}>
          <Text style={styles.tag}>📅 {fmtDate(p.date)}</Text>
          {p.subject ? <Text style={styles.tag}>📚 {p.subject}</Text> : null}
          {p.time_taken ? <Text style={styles.tag}>⏱ {p.time_taken} min</Text> : null}
          {p.attempted ? <Text style={styles.tag}>✏️ {p.attempted} qs</Text> : null}
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.paperScore}>{p.score}/{p.max_score}</Text>
          <Text style={styles.paperScoreLabel}>{percent}%{p.percentile ? ` · ${p.percentile} %ile` : ''}</Text>
        </View>
      </View>
      {p.notes ? <Text style={styles.notes} numberOfLines={2}>{p.notes}</Text> : null}
      {showActions && (
        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.cardActionBtn} onPress={onEdit}><Text style={styles.cardActionText}>Edit</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.cardActionBtn, styles.cardActionDanger]} onPress={onDelete}><Text style={styles.cardActionDangerText}>Delete</Text></TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statSub}>{sub}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: 100 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  statGrid: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  statCard: {
    flex: 1, backgroundColor: colors.surface, borderRadius: radius.md,
    padding: 14, borderWidth: 0.5, borderColor: colors.border,
  },
  statLabel: { fontSize: 11, color: colors.textSecondary, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  statValue: { fontSize: 22, fontWeight: '500', color: colors.textPrimary },
  statSub: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  sectionTitle: { fontSize: 13, fontWeight: '500', color: colors.textSecondary, marginBottom: 10, marginTop: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyIcon: { fontSize: 40, marginBottom: 12, opacity: 0.5 },
  emptyText: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  addBtn: { marginTop: 20, backgroundColor: colors.primary, borderRadius: radius.sm, paddingHorizontal: 24, paddingVertical: 12 },
  addBtnText: { color: '#fff', fontWeight: '500' },
  paperCard: {
    backgroundColor: colors.surface, borderRadius: radius.md, padding: 14,
    marginBottom: 10, borderWidth: 0.5, borderColor: colors.border,
  },
  paperTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 },
  paperName: { fontSize: 15, fontWeight: '500', color: colors.textPrimary, flex: 1, marginRight: 8 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full },
  typeMock: { backgroundColor: colors.primaryLight },
  typePyp: { backgroundColor: colors.successLight },
  typeText: { fontSize: 11, fontWeight: '500' },
  typeMockText: { color: colors.primaryDark },
  typePypText: { color: colors.success },
  paperMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  paperTags: { flex: 1, gap: 4 },
  tag: { fontSize: 12, color: colors.textSecondary },
  paperScore: { fontSize: 18, fontWeight: '500', color: colors.textPrimary },
  paperScoreLabel: { fontSize: 11, color: colors.textSecondary },
  notes: { fontSize: 13, color: colors.textSecondary, marginTop: 8, backgroundColor: colors.surfaceSecondary, borderRadius: 8, padding: 10, lineHeight: 18 },
  cardActions: { flexDirection: 'row', gap: 8, marginTop: 10, paddingTop: 10, borderTopWidth: 0.5, borderTopColor: colors.border },
  cardActionBtn: { flex: 1, padding: 7, borderRadius: 7, alignItems: 'center', borderWidth: 0.5, borderColor: colors.borderMed },
  cardActionDanger: { borderColor: 'rgba(163,45,45,0.2)' },
  cardActionText: { fontSize: 13, color: colors.textPrimary },
  cardActionDangerText: { fontSize: 13, color: colors.danger },
});
