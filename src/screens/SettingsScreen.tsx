import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Modal, SafeAreaView,
} from 'react-native';
import { Subject } from '../lib/types';
import { colors, radius, spacing } from '../lib/theme';
import { useAuth } from '../hooks/useAuth';
import ExamPickerScreen from './ExamPickerScreen';

interface Props {
  subjects: Subject[];
  selectedExamIds: string[];
  papersCount: number;
  onAddSubject: (name: string) => void;
  onRenameSubject: (id: string, name: string) => void;
  onDeleteSubject: (id: string) => void;
  onResetSubjects: () => void;
  onDeleteAllPapers: () => void;
  onToggleExam: (examId: string, selected: boolean) => Promise<void>;
}

export default function SettingsScreen({
  subjects, selectedExamIds, papersCount,
  onAddSubject, onRenameSubject, onDeleteSubject, onResetSubjects,
  onDeleteAllPapers, onToggleExam,
}: Props) {
  const { user, signOut } = useAuth();
  const [newSubject, setNewSubject] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [showExamPicker, setShowExamPicker] = useState(false);

  const handleAdd = () => {
    const name = newSubject.trim();
    if (!name) return;
    if (subjects.find(s => s.name.toLowerCase() === name.toLowerCase())) {
      Alert.alert('Duplicate', 'This subject already exists.'); return;
    }
    onAddSubject(name);
    setNewSubject('');
  };

  const startEdit = (s: Subject) => { setEditingId(s.id); setEditingName(s.name); };

  const confirmEdit = () => {
    if (!editingId || !editingName.trim()) return;
    onRenameSubject(editingId, editingName.trim());
    setEditingId(null);
  };

  const handleDelete = (s: Subject) => {
    if (subjects.length <= 1) { Alert.alert('Cannot delete', 'You need at least one subject.'); return; }
    Alert.alert('Delete subject', `Remove "${s.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDeleteSubject(s.id) },
    ]);
  };

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Account */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowLabel}>Signed in as</Text>
              <Text style={styles.rowSub}>{user?.email}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.row} onPress={() => {
            Alert.alert('Sign out', 'Are you sure?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Sign out', style: 'destructive', onPress: signOut },
            ]);
          }}>
            <Text style={[styles.rowLabel, { color: colors.danger }]}>Sign out</Text>
          </TouchableOpacity>
        </View>

        {/* Exam selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My exams</Text>
            <Text style={styles.sectionDesc}>
              Select which exams you're preparing for. Subjects are added automatically.
            </Text>
          </View>
          <TouchableOpacity style={styles.row} onPress={() => setShowExamPicker(true)}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowLabel}>Manage exams</Text>
              <Text style={styles.rowSub}>
                {selectedExamIds.length === 0 ? 'No exams selected' : `${selectedExamIds.length} exam${selectedExamIds.length > 1 ? 's' : ''} selected`}
              </Text>
            </View>
            <Text style={styles.rowArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Subjects */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Subjects</Text>
            <Text style={styles.sectionDesc}>Shown in the subject dropdown when adding a paper. You can add custom ones below.</Text>
          </View>
          {subjects.map(s => (
            <View key={s.id}>
              <View style={styles.subjectRow}>
                {editingId === s.id ? (
                  <>
                    <TextInput style={styles.editInput} value={editingName}
                      onChangeText={setEditingName} onSubmitEditing={confirmEdit}
                      autoFocus returnKeyType="done" />
                    <TouchableOpacity style={styles.iconBtn} onPress={confirmEdit}>
                      <Text style={[styles.iconBtnText, { color: colors.success }]}>✓</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconBtn} onPress={() => setEditingId(null)}>
                      <Text style={styles.iconBtnText}>✕</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.subjectName}>{s.name}</Text>
                      {s.exam_id && (
                        <Text style={styles.subjectExamTag}>{s.exam_id.toUpperCase().replace('_', ' ')}</Text>
                      )}
                    </View>
                    <TouchableOpacity style={styles.iconBtn} onPress={() => startEdit(s)}>
                      <Text style={styles.iconBtnText}>✎</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconBtn} onPress={() => handleDelete(s)}>
                      <Text style={[styles.iconBtnText, { color: colors.danger }]}>✕</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
              <View style={styles.divider} />
            </View>
          ))}
          <View style={styles.addRow}>
            <TextInput style={styles.addInput} value={newSubject} onChangeText={setNewSubject}
              placeholder="Add custom subject..." placeholderTextColor={colors.textHint}
              onSubmitEditing={handleAdd} returnKeyType="done" />
            <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
              <Text style={styles.addBtnText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Data */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowLabel}>Total papers tracked</Text>
              <Text style={styles.rowSub}>{papersCount} entries</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.row} onPress={() => {
            Alert.alert('Reset subjects', 'This will restore default UPSC CSE subjects. Your custom subjects will be removed.', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Reset', onPress: onResetSubjects },
            ]);
          }}>
            <Text style={styles.rowLabel}>Reset subjects to default</Text>
            <Text style={styles.rowAction}>Reset</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.row} onPress={() => {
            Alert.alert('Delete all papers', 'This will permanently delete all your tracked data.', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete all', style: 'destructive', onPress: onDeleteAllPapers },
            ]);
          }}>
            <Text style={[styles.rowLabel, { color: colors.danger }]}>Delete all papers</Text>
            <Text style={[styles.rowAction, { color: colors.danger }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Exam Picker Modal */}
      <Modal visible={showExamPicker} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select your exams</Text>
            <TouchableOpacity onPress={() => setShowExamPicker(false)}>
              <Text style={styles.modalDone}>Done</Text>
            </TouchableOpacity>
          </View>
          <ExamPickerScreen
            selectedExamIds={selectedExamIds}
            onToggleExam={onToggleExam}
          />
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: 60 },
  section: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 0.5, borderColor: colors.border, marginBottom: 16, overflow: 'hidden' },
  sectionHeader: { padding: 14, paddingBottom: 10, borderBottomWidth: 0.5, borderBottomColor: colors.border },
  sectionTitle: { fontSize: 12, fontWeight: '500', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, padding: 14, paddingBottom: 4 },
  sectionDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
  rowLeft: { flex: 1 },
  rowLabel: { fontSize: 14, color: colors.textPrimary },
  rowSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  rowAction: { fontSize: 13, color: colors.primary },
  rowArrow: { fontSize: 20, color: colors.textSecondary },
  divider: { height: 0.5, backgroundColor: colors.border, marginHorizontal: 14 },
  subjectRow: { flexDirection: 'row', alignItems: 'center', paddingLeft: 14, paddingRight: 6, paddingVertical: 6, minHeight: 48 },
  subjectName: { fontSize: 14, color: colors.textPrimary },
  subjectExamTag: { fontSize: 10, color: colors.textHint, marginTop: 1 },
  editInput: { flex: 1, fontSize: 14, color: colors.textPrimary, borderWidth: 0.5, borderColor: colors.primary, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: colors.primaryLight },
  iconBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  iconBtnText: { fontSize: 15, color: colors.textSecondary },
  addRow: { flexDirection: 'row', padding: 12, gap: 8 },
  addInput: { flex: 1, padding: 9, borderWidth: 0.5, borderColor: colors.borderMed, borderRadius: radius.sm, fontSize: 14, color: colors.textPrimary, backgroundColor: colors.surface },
  addBtn: { backgroundColor: colors.primary, borderRadius: radius.sm, paddingHorizontal: 16, justifyContent: 'center' },
  addBtnText: { color: '#fff', fontSize: 14, fontWeight: '500' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: colors.border },
  modalTitle: { fontSize: 17, fontWeight: '500', color: colors.textPrimary },
  modalDone: { fontSize: 15, color: colors.primary, fontWeight: '500' },
});
