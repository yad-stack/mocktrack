import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal,
  SafeAreaView, StatusBar, Platform,
} from 'react-native';
import { AuthProvider, useAuth } from './src/hooks/useAuth';
import { usePapers } from './src/hooks/usePapers';
import { useSubjects } from './src/hooks/useSubjects';
import { supabase } from './src/lib/supabase';
import AuthScreen from './src/screens/AuthScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import PapersScreen from './src/screens/PapersScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import PaperDetailScreen from './src/screens/PaperDetailScreen';
import PaperForm from './src/components/PaperForm';
import { Paper } from './src/lib/types';
import { colors, radius } from './src/lib/theme';
import { EXAM_DEFINITIONS } from './src/lib/exams';
import { useEffect, useRef } from 'react';

type Tab = 'dashboard' | 'papers' | 'analytics' | 'settings';

function useSelectedExams(userId: string | undefined) {
  const [selectedExamIds, setSelectedExamIds] = useState<string[]>([]);

  const fetch = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('user_exams')
      .select('exam_id')
      .eq('user_id', userId);
    setSelectedExamIds((data || []).map((r: any) => r.exam_id));
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { selectedExamIds, refetch: fetch };
}

function AppInner() {
  const { session, loading, onboardingComplete, setOnboardingComplete } = useAuth();
  const { papers, addPaper, updatePaper, deletePaper } = usePapers();
  const {
    subjects, addSubject, renameSubject, deleteSubject,
    resetToDefaults, addExamSubjects, addExamsSubjects, removeExamSubjects,
  } = useSubjects();
  const { selectedExamIds, refetch: refetchExams } = useSelectedExams(session?.user?.id);

  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPaper, setEditingPaper] = useState<Paper | null>(null);
  const [detailPaper, setDetailPaper] = useState<Paper | null>(null);

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <Text style={styles.loadingText}>MockTrack</Text>
      </View>
    );
  }

  if (!session) return <AuthScreen />;

  // Show onboarding for first-time users
  if (!onboardingComplete) {
    return (
      <OnboardingScreen
        onComplete={async (examIds) => {
          const userId = session.user.id;
          // Save selected exams
          if (examIds.length > 0) {
            await supabase.from('user_exams').upsert(
              examIds.map(examId => ({ user_id: userId, exam_id: examId }))
            );
            await addExamsSubjects(examIds);
            await refetchExams();
          }
          // Mark onboarding done
          await setOnboardingComplete();
        }}
      />
    );
  }

  const handleToggleExam = async (examId: string, selected: boolean) => {
    const userId = session.user.id;
    if (selected) {
      await supabase.from('user_exams').upsert({ user_id: userId, exam_id: examId });
      await addExamSubjects(examId);
    } else {
      await supabase.from('user_exams').delete().eq('user_id', userId).eq('exam_id', examId);
      await removeExamSubjects(examId);
    }
    await refetchExams();
  };

  const handlePaperPress = (p: Paper) => setDetailPaper(p);

  const handleDetailEdit = () => {
    if (detailPaper) { setEditingPaper(detailPaper); setDetailPaper(null); }
  };

  const handleDetailDelete = async () => {
    if (detailPaper) { await deletePaper(detailPaper.id); setDetailPaper(null); }
  };

  const tabLabels: { key: Tab; icon: string; label: string }[] = [
    { key: 'dashboard', icon: '🏠', label: 'Home' },
    { key: 'papers', icon: '📋', label: 'Papers' },
    { key: 'analytics', icon: '📊', label: 'Analytics' },
    { key: 'settings', icon: '⚙️', label: 'Settings' },
  ];

  const renderScreen = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardScreen papers={papers} loading={false}
          onAddPaper={() => setShowAddModal(true)}
          onPaperPress={handlePaperPress} />;
      case 'papers':
        return <PapersScreen papers={papers}
          onEditPaper={p => setEditingPaper(p)}
          onDeletePaper={id => deletePaper(id)}
          onPaperPress={handlePaperPress} />;
      case 'analytics':
        return <AnalyticsScreen papers={papers} />;
      case 'settings':
        return <SettingsScreen
          subjects={subjects}
          selectedExamIds={selectedExamIds}
          papersCount={papers.length}
          onAddSubject={addSubject}
          onRenameSubject={renameSubject}
          onDeleteSubject={deleteSubject}
          onResetSubjects={resetToDefaults}
          onToggleExam={handleToggleExam}
          onDeleteAllPapers={async () => {
            for (const p of papers) await deletePaper(p.id);
          }}
        />;
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>MockTrack</Text>
        {activeTab !== 'settings' && (
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddModal(true)}>
            <Text style={styles.addBtnText}>+ Add paper</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.screen}>{renderScreen()}</View>

      <View style={styles.tabBar}>
        {tabLabels.map(t => (
          <TouchableOpacity key={t.key} style={styles.tabItem} onPress={() => setActiveTab(t.key)}>
            <Text style={styles.tabIcon}>{t.icon}</Text>
            <Text style={[styles.tabLabel, activeTab === t.key && styles.tabLabelActive]}>{t.label}</Text>
            {activeTab === t.key && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Paper detail modal */}
      <Modal visible={!!detailPaper} animationType="slide" presentationStyle="pageSheet">
        {detailPaper && (
          <PaperDetailScreen
            paper={detailPaper}
            onEdit={handleDetailEdit}
            onDelete={handleDetailDelete}
            onClose={() => setDetailPaper(null)}
          />
        )}
      </Modal>

      {/* Add paper modal */}
      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add paper</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.modalClose}>Cancel</Text>
            </TouchableOpacity>
          </View>
          <PaperForm
            subjects={subjects}
            selectedExamIds={selectedExamIds}
            onSave={async (data) => {
              const result = await addPaper(data);
              if (!result.error) setShowAddModal(false);
              return result;
            }}
            onCancel={() => setShowAddModal(false)}
          />
        </SafeAreaView>
      </Modal>

      {/* Edit paper modal */}
      <Modal visible={!!editingPaper} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit paper</Text>
            <TouchableOpacity onPress={() => setEditingPaper(null)}>
              <Text style={styles.modalClose}>Cancel</Text>
            </TouchableOpacity>
          </View>
          {editingPaper && (
            <PaperForm
              initial={editingPaper}
              subjects={subjects}
              selectedExamIds={selectedExamIds}
              onSave={async (data) => {
                const result = await updatePaper(editingPaper.id, data);
                if (!result.error) setEditingPaper(null);
                return result;
              }}
              onCancel={() => setEditingPaper(null)}
            />
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  loadingScreen: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  loadingText: { fontSize: 28, fontWeight: '600', color: colors.primary },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.surface, paddingHorizontal: 20, paddingVertical: 12,
    borderBottomWidth: 0.5, borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: 18, fontWeight: '600', color: colors.primary },
  addBtn: { backgroundColor: colors.primary, borderRadius: radius.full, paddingHorizontal: 14, paddingVertical: 7 },
  addBtnText: { color: '#fff', fontSize: 13, fontWeight: '500' },
  screen: { flex: 1 },
  tabBar: {
    flexDirection: 'row', backgroundColor: colors.surface,
    borderTopWidth: 0.5, borderTopColor: colors.border,
    paddingBottom: Platform.OS === 'ios' ? 16 : 8,
  },
  tabItem: { flex: 1, alignItems: 'center', paddingTop: 10, paddingBottom: 4, position: 'relative' },
  tabIcon: { fontSize: 20, marginBottom: 3 },
  tabLabel: { fontSize: 11, color: colors.textSecondary },
  tabLabelActive: { color: colors.primary, fontWeight: '500' },
  tabIndicator: { position: 'absolute', top: 0, width: 24, height: 2.5, backgroundColor: colors.primary, borderRadius: 2 },
  modalSafe: { flex: 1, backgroundColor: colors.surface },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 0.5, borderBottomColor: colors.border,
  },
  modalTitle: { fontSize: 17, fontWeight: '500', color: colors.textPrimary },
  modalClose: { fontSize: 15, color: colors.textSecondary },
});
