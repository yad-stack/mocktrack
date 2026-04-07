import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Paper } from '../lib/types';
import { PaperCard } from './DashboardScreen';
import { colors, radius, spacing } from '../lib/theme';

interface Props {
  papers: Paper[];
  onEditPaper: (p: Paper) => void;
  onDeletePaper: (id: string) => void;
  onPaperPress: (p: Paper) => void;
}

type Filter = 'all' | 'mock' | 'pyp';

export default function PapersScreen({ papers, onEditPaper, onDeletePaper, onPaperPress }: Props) {
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = filter === 'all' ? papers : papers.filter(p => p.type === filter);

  const confirmDelete = (id: string) => {
    Alert.alert('Delete paper', 'Are you sure you want to delete this paper?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDeletePaper(id) },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.filterRow}>
        {(['all', 'mock', 'pyp'] as Filter[]).map(f => (
          <TouchableOpacity key={f} style={[styles.chip, filter === f && styles.chipActive]} onPress={() => setFilter(f)}>
            <Text style={[styles.chipText, filter === f && styles.chipTextActive]}>
              {f === 'all' ? 'All' : f === 'mock' ? 'Mocks' : 'PYPs'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyText}>No papers here yet.</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={p => p.id}
          contentContainerStyle={{ padding: spacing.lg, paddingBottom: 100 }}
          renderItem={({ item }) => (
            <PaperCard
              paper={item}
              onPress={() => onPaperPress(item)}
              showActions
              onEdit={() => onEditPaper(item)}
              onDelete={() => confirmDelete(item.id)}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  filterRow: { flexDirection: 'row', gap: 8, padding: spacing.lg, paddingBottom: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: radius.full,
    borderWidth: 0.5, borderColor: colors.borderMed, backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, color: colors.textSecondary },
  chipTextActive: { color: '#fff', fontWeight: '500' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyIcon: { fontSize: 40, marginBottom: 12, opacity: 0.5 },
  emptyText: { fontSize: 14, color: colors.textSecondary },
});
