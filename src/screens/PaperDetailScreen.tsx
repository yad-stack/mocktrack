import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Alert, Modal,
} from 'react-native';
import { Paper, PaperSection } from '../lib/types';
import { colors, radius, spacing } from '../lib/theme';
import { getExamById } from '../lib/exams';

interface Props {
  paper: Paper;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

function pct(score: number, max: number) { return max > 0 ? Math.round((score / max) * 100) : 0; }
function fmtDate(d: string) { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }); }
function fmtTime(min?: number) { if (!min) return '—'; const h = Math.floor(min / 60); const m = min % 60; return h > 0 ? `${h}h ${m}m` : `${m} min`; }

export default function PaperDetailScreen({ paper, onEdit, onDelete, onClose }: Props) {
  const [selectedSection, setSelectedSection] = useState<PaperSection | null>(null);
  const percent = pct(paper.score, paper.max_score);
  const exam = paper.exam_id ? getExamById(paper.exam_id) : null;
  const scoreColor = percent >= 70 ? colors.success : percent >= 50 ? '#B36B00' : colors.danger;

  const unattempted = (paper.total_questions && paper.attempted)
    ? Math.max(0, paper.total_questions - paper.attempted) : null;
  const accuracy = (paper.correct_answers !== undefined && paper.correct_answers !== null && paper.attempted)
    ? Math.round((paper.correct_answers / paper.attempted) * 100) : null;

  const handleDelete = () => {
    Alert.alert('Delete paper', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: onDelete },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{paper.name}</Text>
        <TouchableOpacity onPress={onEdit}>
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {/* Score hero */}
        <View style={styles.scoreCard}>
          <View style={styles.scoreRow}>
            <Text style={[styles.scoreBig, { color: scoreColor }]}>{paper.score}</Text>
            <Text style={styles.scoreMax}>/{paper.max_score}</Text>
            <View style={{ marginLeft: 'auto' as any }}>
              <Text style={[styles.scorePct, { color: scoreColor }]}>{percent}%</Text>
            </View>
          </View>

          {/* Score bar with optional cutoff marker */}
          <View style={styles.scoreBarWrap}>
            <View style={styles.scoreBar}>
              <View style={[styles.scoreBarFill, { width: `${percent}%` as any, backgroundColor: scoreColor }]} />
            </View>
            {paper.cutoff !== undefined && paper.cutoff !== null && paper.max_score > 0 && (
              <View style={[styles.cutoffMarker, { left: `${Math.min((paper.cutoff / paper.max_score) * 100, 98)}%` as any }]}>
                <View style={styles.cutoffLine} />
                <View style={styles.cutoffLabel}>
                  <Text style={styles.cutoffLabelText}>
                    {paper.type === 'pyp' ? 'Cutoff' : 'Exp. cutoff'} {paper.cutoff}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {paper.cutoff !== undefined && paper.cutoff !== null && (
            <View style={[styles.infoRow, { marginTop: 24 }]}>
              <Text style={styles.infoLabel}>{paper.type === 'pyp' ? 'Cutoff marks' : 'Expected cutoff'}</Text>
              <Text style={[styles.infoVal, { color: paper.score >= paper.cutoff ? colors.success : colors.danger }]}>
                {paper.cutoff} — {paper.score >= paper.cutoff ? '✓ Cleared' : `✗ ${(paper.cutoff - paper.score).toFixed(1)} marks short`}
              </Text>
            </View>
          )}
          {paper.percentile !== undefined && paper.percentile !== null && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Percentile</Text>
              <Text style={styles.infoVal}>{paper.percentile}</Text>
            </View>
          )}
          {paper.rank !== undefined && paper.rank !== null && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Rank</Text>
              <Text style={styles.infoVal}>{paper.rank.toLocaleString('en-IN')}{paper.rank_out_of ? ` / ${paper.rank_out_of.toLocaleString('en-IN')}` : ''}</Text>
            </View>
          )}
        </View>

        {/* Badges */}
        <View style={styles.badgeRow}>
          <View style={[styles.badge, paper.type === 'mock' ? styles.badgeMock : styles.badgePyp]}>
            <Text style={[styles.badgeText, paper.type === 'mock' ? styles.badgeMockText : styles.badgePypText]}>
              {paper.type === 'mock' ? 'Mock test' : 'Previous year paper'}
            </Text>
          </View>
          {exam && <View style={styles.badge}><Text style={styles.badgeExamText}>{exam.shortName}</Text></View>}
        </View>

        {/* Key details */}
        <View style={styles.detailGrid}>
          <DetailItem icon="📅" label="Date" value={fmtDate(paper.date)} />
          {paper.subject && <DetailItem icon="📚" label="Subject" value={paper.subject} />}
          {paper.total_time && <DetailItem icon="⏱" label="Total time" value={fmtTime(paper.total_time)} />}
          {exam && <DetailItem icon="🎯" label="Exam" value={exam.name} />}
        </View>

        {/* Attempt stats */}
        {(paper.total_questions || paper.attempted || paper.correct_answers !== null) && (
          <>
            <SectionTitle title="Attempt analysis" />
            <View style={styles.statsGrid}>
              {paper.total_questions !== undefined && paper.total_questions !== null &&
                <StatBox label="Total Qs" value={String(paper.total_questions)} color={colors.primary} />}
              {paper.attempted !== undefined && paper.attempted !== null &&
                <StatBox label="Attempted" value={String(paper.attempted)} color="#1D9E75" />}
              {paper.correct_answers !== undefined && paper.correct_answers !== null &&
                <StatBox label="Correct" value={String(paper.correct_answers)} color="#3B6D11" />}
              {paper.incorrect_answers !== undefined && paper.incorrect_answers !== null &&
                <StatBox label="Incorrect" value={String(paper.incorrect_answers)} color={colors.danger} />}
              {unattempted !== null &&
                <StatBox label="Unattempted" value={String(unattempted)} color={colors.textSecondary} />}
              {accuracy !== null &&
                <StatBox label="Accuracy" value={`${accuracy}%`} color="#B36B00" />}
            </View>

            {/* Attempt breakdown bar */}
            {paper.total_questions && paper.attempted ? (
              <View style={styles.breakdownCard}>
                <Text style={styles.breakdownTitle}>Attempt breakdown</Text>
                <View style={styles.attemptBar}>
                  {paper.correct_answers !== undefined && paper.correct_answers !== null && (
                    <View style={[styles.attemptBarSeg, { flex: paper.correct_answers, backgroundColor: '#3B6D11' }]} />
                  )}
                  {paper.incorrect_answers !== undefined && paper.incorrect_answers !== null && (
                    <View style={[styles.attemptBarSeg, { flex: paper.incorrect_answers, backgroundColor: colors.danger }]} />
                  )}
                  {unattempted !== null && unattempted > 0 && (
                    <View style={[styles.attemptBarSeg, { flex: unattempted, backgroundColor: colors.border }]} />
                  )}
                </View>
                <View style={styles.barLegend}>
                  {paper.correct_answers !== undefined && paper.correct_answers !== null &&
                    <LegendItem color="#3B6D11" label={`Correct (${paper.correct_answers})`} />}
                  {paper.incorrect_answers !== undefined && paper.incorrect_answers !== null &&
                    <LegendItem color={colors.danger} label={`Incorrect (${paper.incorrect_answers})`} />}
                  {unattempted !== null && unattempted > 0 &&
                    <LegendItem color={colors.border} label={`Unattempted (${unattempted})`} />}
                </View>
              </View>
            ) : null}
          </>
        )}

        {/* Section-wise analysis */}
        {paper.sections && paper.sections.length > 0 && (
          <>
            <SectionTitle title="Section-wise analysis" subtitle="Tap a section for details" />
            <View style={styles.sectionTable}>
              {/* Header */}
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.tableCell, styles.tableHeaderText, { flex: 2 }]}>Section</Text>
                <Text style={[styles.tableCell, styles.tableHeaderText]}>Score</Text>
                <Text style={[styles.tableCell, styles.tableHeaderText]}>Att.</Text>
                <Text style={[styles.tableCell, styles.tableHeaderText]}>Acc.</Text>
                <Text style={[styles.tableCell, styles.tableHeaderText]}>Time</Text>
              </View>
              {paper.sections.map((sec, i) => {
                const sp = pct(sec.score, sec.max_score);
                const sacc = sec.attempted > 0 ? Math.round((sec.correct / sec.attempted) * 100) : 0;
                const spColor = sp >= 70 ? colors.success : sp >= 50 ? '#B36B00' : colors.danger;
                return (
                  <TouchableOpacity key={i} style={[styles.tableRow, i % 2 === 0 && styles.tableRowAlt]}
                    onPress={() => setSelectedSection(sec)} activeOpacity={0.7}>
                    <Text style={[styles.tableCell, styles.tableCellName, { flex: 2 }]} numberOfLines={2}>{sec.name || `Section ${i + 1}`}</Text>
                    <Text style={[styles.tableCell, { color: spColor, fontWeight: '500' }]}>{sec.score}/{sec.max_score}</Text>
                    <Text style={styles.tableCell}>{sec.attempted}/{sec.total_questions || '—'}</Text>
                    <Text style={[styles.tableCell, { color: sacc >= 70 ? colors.success : sacc >= 50 ? '#B36B00' : colors.danger }]}>{sacc}%</Text>
                    <Text style={styles.tableCell}>{sec.time_taken ? `${sec.time_taken}m` : '—'}</Text>
                  </TouchableOpacity>
                );
              })}
              {/* Overall row */}
              <View style={[styles.tableRow, styles.tableFooter]}>
                <Text style={[styles.tableCell, styles.tableFooterText, { flex: 2 }]}>Overall</Text>
                <Text style={[styles.tableCell, styles.tableFooterText, { color: scoreColor }]}>{paper.score}/{paper.max_score}</Text>
                <Text style={[styles.tableCell, styles.tableFooterText]}>{paper.attempted || '—'}/{paper.total_questions || '—'}</Text>
                <Text style={[styles.tableCell, styles.tableFooterText]}>{accuracy !== null ? `${accuracy}%` : '—'}</Text>
                <Text style={[styles.tableCell, styles.tableFooterText]}>{paper.total_time ? `${paper.total_time}m` : '—'}</Text>
              </View>
            </View>
          </>
        )}

        {/* Notes */}
        {paper.notes && (
          <>
            <SectionTitle title="Notes & mistakes" />
            <View style={styles.notesBox}>
              <Text style={styles.notesText}>{paper.notes}</Text>
            </View>
          </>
        )}

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

      {/* Section detail modal */}
      {selectedSection && (
        <SectionDetailModal section={selectedSection} onClose={() => setSelectedSection(null)} />
      )}
    </SafeAreaView>
  );
}

function SectionDetailModal({ section, onClose }: { section: PaperSection; onClose: () => void }) {
  const sp = pct(section.score, section.max_score);
  const sacc = section.attempted > 0 ? Math.round((section.correct / section.attempted) * 100) : 0;
  const unattempted = section.total_questions > 0 ? Math.max(0, section.total_questions - section.attempted) : null;
  const spColor = sp >= 70 ? colors.success : sp >= 50 ? '#B36B00' : colors.danger;

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <View style={{ width: 40 }} />
          <Text style={styles.headerTitle} numberOfLines={1}>{section.name || 'Section detail'}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.editBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          {/* Score */}
          <View style={styles.scoreCard}>
            <View style={styles.scoreRow}>
              <Text style={[styles.scoreBig, { color: spColor }]}>{section.score}</Text>
              <Text style={styles.scoreMax}>/{section.max_score}</Text>
              <Text style={[styles.scorePct, { color: spColor, marginLeft: 'auto' as any }]}>{sp}%</Text>
            </View>
            <View style={styles.scoreBar}>
              <View style={[styles.scoreBarFill, { width: `${sp}%` as any, backgroundColor: spColor }]} />
            </View>
          </View>

          {/* Stats grid */}
          <View style={styles.statsGrid}>
            <StatBox label="Total Qs" value={String(section.total_questions || '—')} color={colors.primary} />
            <StatBox label="Attempted" value={String(section.attempted)} color="#1D9E75" />
            <StatBox label="Correct" value={String(section.correct)} color="#3B6D11" />
            <StatBox label="Incorrect" value={String(section.incorrect)} color={colors.danger} />
            {unattempted !== null && <StatBox label="Unattempted" value={String(unattempted)} color={colors.textSecondary} />}
            <StatBox label="Accuracy" value={`${sacc}%`} color="#B36B00" />
            {section.time_taken ? <StatBox label="Time taken" value={`${section.time_taken} min`} color={colors.primary} /> : null}
          </View>

          {/* Attempt breakdown bar */}
          {section.total_questions > 0 && (
            <View style={styles.breakdownCard}>
              <Text style={styles.breakdownTitle}>Attempt breakdown</Text>
              <View style={styles.attemptBar}>
                <View style={[styles.attemptBarSeg, { flex: section.correct, backgroundColor: '#3B6D11' }]} />
                <View style={[styles.attemptBarSeg, { flex: section.incorrect, backgroundColor: colors.danger }]} />
                {unattempted !== null && unattempted > 0 &&
                  <View style={[styles.attemptBarSeg, { flex: unattempted, backgroundColor: colors.border }]} />}
              </View>
              <View style={styles.barLegend}>
                <LegendItem color="#3B6D11" label={`Correct (${section.correct})`} />
                <LegendItem color={colors.danger} label={`Incorrect (${section.incorrect})`} />
                {unattempted !== null && unattempted > 0 &&
                  <LegendItem color={colors.border} label={`Unattempted (${unattempted})`} />}
              </View>
            </View>
          )}

          {/* Marks calculation */}
          <View style={styles.breakdownCard}>
            <Text style={styles.breakdownTitle}>Marks analysis</Text>
            <View style={styles.calcRow}>
              <Text style={styles.calcLabel}>Score / Max marks</Text>
              <Text style={styles.calcVal}>{section.score} / {section.max_score}</Text>
            </View>
            <View style={styles.calcRow}>
              <Text style={styles.calcLabel}>Percentage</Text>
              <Text style={[styles.calcVal, { color: spColor }]}>{sp}%</Text>
            </View>
            <View style={styles.calcRow}>
              <Text style={styles.calcLabel}>Accuracy</Text>
              <Text style={[styles.calcVal, { color: sacc >= 70 ? colors.success : sacc >= 50 ? '#B36B00' : colors.danger }]}>{sacc}%</Text>
            </View>
            {section.time_taken ? (
              <View style={styles.calcRow}>
                <Text style={styles.calcLabel}>Time per question</Text>
                <Text style={styles.calcVal}>
                  {section.attempted > 0 ? `${Math.round((section.time_taken * 60) / section.attempted)}s` : '—'}
                </Text>
              </View>
            ) : null}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.secTitle}>
      <Text style={styles.secTitleText}>{title}</Text>
      {subtitle && <Text style={styles.secTitleSub}>{subtitle}</Text>}
    </View>
  );
}

function DetailItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.detailItem}>
      <Text style={styles.detailIcon}>{icon}</Text>
      <View style={styles.detailText}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statBoxLabel}>{label}</Text>
      <Text style={[styles.statBoxValue, { color }]}>{value}</Text>
    </View>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: colors.border },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: '500', color: colors.textPrimary, marginHorizontal: 12 },
  closeBtn: { padding: 4, minWidth: 40 },
  closeBtnText: { fontSize: 16, color: colors.textSecondary },
  editBtnText: { fontSize: 15, color: colors.primary, fontWeight: '500' },
  content: { padding: spacing.lg, paddingBottom: 48 },

  scoreCard: { backgroundColor: colors.surfaceSecondary, borderRadius: radius.lg, padding: 18, marginBottom: 14 },
  scoreRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12 },
  scoreBig: { fontSize: 48, fontWeight: '600', lineHeight: 52 },
  scoreMax: { fontSize: 22, color: colors.textSecondary, marginBottom: 4, marginLeft: 2 },
  scorePct: { fontSize: 28, fontWeight: '600' },
  scoreBar: { height: 7, backgroundColor: colors.border, borderRadius: 4, overflow: 'hidden', marginBottom: 10 },
  scoreBarFill: { height: '100%', borderRadius: 4 },
  scoreBarWrap: { position: 'relative', marginBottom: 10 },
  cutoffMarker: { position: 'absolute', top: -2, alignItems: 'center' },
  cutoffLine: { width: 2, height: 11, backgroundColor: '#B36B00', borderRadius: 1 },
  cutoffLabel: { backgroundColor: '#B36B00', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2, marginTop: 2 },
  cutoffLabelText: { fontSize: 9, color: '#fff', fontWeight: '500', whiteSpace: 'nowrap' } as any,
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8, borderTopWidth: 0.5, borderTopColor: colors.border, marginTop: 4 },
  infoLabel: { fontSize: 13, color: colors.textSecondary },
  infoVal: { fontSize: 13, fontWeight: '500', color: colors.textPrimary },

  badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 14, flexWrap: 'wrap' },
  badge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: radius.full, backgroundColor: colors.surfaceSecondary, borderWidth: 0.5, borderColor: colors.border },
  badgeMock: { backgroundColor: colors.primaryLight, borderColor: 'transparent' },
  badgePyp: { backgroundColor: colors.successLight, borderColor: 'transparent' },
  badgeText: { fontSize: 12, fontWeight: '500' },
  badgeMockText: { color: colors.primaryDark },
  badgePypText: { color: colors.success },
  badgeExamText: { fontSize: 12, fontWeight: '500', color: '#6B2F6B' },

  detailGrid: { gap: 8, marginBottom: 16 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surfaceSecondary, borderRadius: radius.md, padding: 12 },
  detailIcon: { fontSize: 18 },
  detailText: { flex: 1 },
  detailLabel: { fontSize: 11, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 2 },
  detailValue: { fontSize: 14, fontWeight: '500', color: colors.textPrimary },

  secTitle: { marginTop: 8, marginBottom: 12 },
  secTitleText: { fontSize: 14, fontWeight: '500', color: colors.textPrimary },
  secTitleSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  statBox: { minWidth: '30%', flex: 1, backgroundColor: colors.surfaceSecondary, borderRadius: radius.md, padding: 12, alignItems: 'center' },
  statBoxLabel: { fontSize: 10, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 4, textAlign: 'center' },
  statBoxValue: { fontSize: 20, fontWeight: '500' },

  breakdownCard: { backgroundColor: colors.surfaceSecondary, borderRadius: radius.md, padding: 14, marginBottom: 14 },
  breakdownTitle: { fontSize: 13, fontWeight: '500', color: colors.textSecondary, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.4 },
  attemptBar: { flexDirection: 'row', height: 10, borderRadius: 5, overflow: 'hidden', marginBottom: 10, backgroundColor: colors.border },
  attemptBarSeg: { height: '100%' },
  barLegend: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 2 },
  legendLabel: { fontSize: 12, color: colors.textSecondary },

  calcRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: colors.border },
  calcLabel: { fontSize: 13, color: colors.textSecondary },
  calcVal: { fontSize: 13, fontWeight: '500', color: colors.textPrimary },

  sectionTable: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 0.5, borderColor: colors.border, overflow: 'hidden', marginBottom: 16 },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12 },
  tableRowAlt: { backgroundColor: colors.surfaceSecondary },
  tableHeader: { backgroundColor: colors.primary },
  tableFooter: { backgroundColor: colors.surfaceSecondary, borderTopWidth: 1, borderTopColor: colors.border },
  tableCell: { flex: 1, fontSize: 11, color: colors.textPrimary, textAlign: 'center' },
  tableHeaderText: { color: '#fff', fontWeight: '500', fontSize: 11 },
  tableFooterText: { fontWeight: '500', fontSize: 11 },
  tableCellName: { textAlign: 'left', fontSize: 12 },

  notesBox: { backgroundColor: colors.surfaceSecondary, borderRadius: radius.md, padding: 14, marginBottom: 20 },
  notesText: { fontSize: 14, color: colors.textPrimary, lineHeight: 22 },

  actions: { flexDirection: 'row', gap: 12 },
  editActionBtn: { flex: 1, padding: 14, borderRadius: radius.md, alignItems: 'center', backgroundColor: colors.primary },
  editActionText: { color: '#fff', fontSize: 15, fontWeight: '500' },
  deleteActionBtn: { padding: 14, paddingHorizontal: 20, borderRadius: radius.md, alignItems: 'center', borderWidth: 0.5, borderColor: 'rgba(163,45,45,0.3)' },
  deleteActionText: { color: colors.danger, fontSize: 15 },
});
