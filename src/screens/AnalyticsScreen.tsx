import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Paper } from '../lib/types';
import { colors, radius, spacing } from '../lib/theme';

function pct(score: number, max: number) { return max > 0 ? Math.round((score / max) * 100) : 0; }

export default function AnalyticsScreen({ papers }: { papers: Paper[] }) {
  if (papers.length < 2) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>📊</Text>
        <Text style={styles.emptyText}>Add at least 2 papers{'\n'}to see analytics.</Text>
      </View>
    );
  }

  const sorted = [...papers].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const last6 = sorted.slice(-6);
  const maxPct = Math.max(...last6.map(p => pct(p.score, p.max_score)));

  // Subject averages
  const subMap: Record<string, { total: number; count: number }> = {};
  papers.forEach(p => {
    const s = p.subject || 'Untagged';
    if (!subMap[s]) subMap[s] = { total: 0, count: 0 };
    subMap[s].total += pct(p.score, p.max_score);
    subMap[s].count++;
  });
  const subEntries = Object.entries(subMap)
    .map(([name, d]) => ({ name, avg: Math.round(d.total / d.count), count: d.count }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 8);

  const mockPapers = papers.filter(p => p.type === 'mock');
  const pypPapers = papers.filter(p => p.type === 'pyp');
  const mockAvg = mockPapers.length ? Math.round(mockPapers.reduce((s, p) => s + pct(p.score, p.max_score), 0) / mockPapers.length) : null;
  const pypAvg = pypPapers.length ? Math.round(pypPapers.reduce((s, p) => s + pct(p.score, p.max_score), 0) / pypPapers.length) : null;

  const withPerc = papers.filter(p => p.percentile);
  const avgPerc = withPerc.length ? Math.round(withPerc.reduce((s, p) => s + (p.percentile || 0), 0) / withPerc.length) : null;
  const bestPerc = withPerc.length ? Math.max(...withPerc.map(p => p.percentile || 0)) : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Trend chart */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recent trend (last {last6.length} papers)</Text>
        <View style={styles.barChart}>
          {last6.map((p, i) => {
            const h = Math.max(4, Math.round((pct(p.score, p.max_score) / Math.max(maxPct, 1)) * 80));
            return (
              <View key={p.id} style={styles.barCol}>
                <Text style={styles.barPct}>{pct(p.score, p.max_score)}%</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { height: h, backgroundColor: p.type === 'mock' ? colors.primary : colors.success }]} />
                </View>
                <Text style={styles.barLabel} numberOfLines={1}>{p.name.slice(0, 8)}</Text>
              </View>
            );
          })}
        </View>
        <View style={styles.legend}>
          <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: colors.primary }]} /><Text style={styles.legendText}>Mock</Text></View>
          <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: colors.success }]} /><Text style={styles.legendText}>PYP</Text></View>
        </View>
      </View>

      {/* Subject averages */}
      {subEntries.length > 1 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Score by subject</Text>
          {subEntries.map(s => (
            <View key={s.name} style={styles.subRow}>
              <Text style={styles.subName} numberOfLines={1}>{s.name}</Text>
              <View style={styles.subTrack}>
                <View style={[styles.subFill, { width: `${s.avg}%` }]} />
              </View>
              <Text style={styles.subPct}>{s.avg}%</Text>
            </View>
          ))}
        </View>
      )}

      {/* Stats */}
      <View style={styles.statRow}>
        {mockAvg !== null && <StatCard label="Mock avg" value={`${mockAvg}%`} sub={`${mockPapers.length} papers`} />}
        {pypAvg !== null && <StatCard label="PYP avg" value={`${pypAvg}%`} sub={`${pypPapers.length} papers`} />}
      </View>
      {avgPerc !== null && (
        <View style={styles.statRow}>
          <StatCard label="Avg percentile" value={String(avgPerc)} sub={`${withPerc.length} entries`} />
          {bestPerc !== null && <StatCard label="Best percentile" value={String(bestPerc)} sub="highest" />}
        </View>
      )}
    </ScrollView>
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
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIcon: { fontSize: 40, marginBottom: 12, opacity: 0.5 },
  emptyText: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, padding: 16, marginBottom: 12, borderWidth: 0.5, borderColor: colors.border },
  cardTitle: { fontSize: 12, fontWeight: '500', color: colors.textSecondary, marginBottom: 14, textTransform: 'uppercase', letterSpacing: 0.5 },
  barChart: { flexDirection: 'row', alignItems: 'flex-end', height: 110, gap: 6 },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  barPct: { fontSize: 9, color: colors.textSecondary, marginBottom: 3 },
  barTrack: { width: '100%', height: 84, justifyContent: 'flex-end', backgroundColor: colors.surfaceSecondary, borderRadius: 4, overflow: 'hidden' },
  barFill: { width: '100%', borderRadius: 3 },
  barLabel: { fontSize: 9, color: colors.textSecondary, marginTop: 4, textAlign: 'center' },
  legend: { flexDirection: 'row', gap: 16, marginTop: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 10, height: 10, borderRadius: 2 },
  legendText: { fontSize: 12, color: colors.textSecondary },
  subRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  subName: { width: 90, fontSize: 12, color: colors.textSecondary },
  subTrack: { flex: 1, height: 8, backgroundColor: colors.surfaceSecondary, borderRadius: 4, overflow: 'hidden' },
  subFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 4 },
  subPct: { width: 36, fontSize: 12, fontWeight: '500', color: colors.textSecondary, textAlign: 'right' },
  statRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  statCard: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, padding: 14, borderWidth: 0.5, borderColor: colors.border },
  statLabel: { fontSize: 11, color: colors.textSecondary, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  statValue: { fontSize: 22, fontWeight: '500', color: colors.textPrimary },
  statSub: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
});
