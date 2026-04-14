import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
  Alert, Modal, SafeAreaView, Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';
import { colors, radius, spacing } from '../lib/theme';
import { PaperFormData, SectionFormData } from '../lib/types';

interface Props {
  onExtracted: (data: Partial<PaperFormData>) => void;
  onClose: () => void;
}

type ScanState = 'idle' | 'picking' | 'scanning' | 'preview' | 'error';

export default function ImageScanner({ onExtracted, onClose }: Props) {
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [extracted, setExtracted] = useState<Partial<PaperFormData> | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const pickImage = async (fromCamera: boolean) => {
    setScanState('picking');
    try {
      let result;
      if (fromCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Camera permission is required to scan results.');
          setScanState('idle');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.8,
          base64: true,
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Photo library permission is required.');
          setScanState('idle');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.8,
          base64: true,
        });
      }

      if (result.canceled || !result.assets?.[0]) {
        setScanState('idle');
        return;
      }

      const asset = result.assets[0];
      setPreviewUri(asset.uri);
      setScanState('scanning');
      await scanImage(asset.base64!, asset.mimeType || 'image/jpeg');

    } catch (e) {
      setErrorMsg('Failed to pick image. Please try again.');
      setScanState('error');
    }
  };

  const scanImage = async (base64: string, mimeType: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('extract-paper-data', {
        body: { imageBase64: base64, mediaType: mimeType },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      const raw = data?.data;
      if (!raw) throw new Error('No data extracted');

      // Convert extracted data to PaperFormData format
      const formData: Partial<PaperFormData> = {
        name: raw.name || '',
        type: raw.type === 'pyp' ? 'pyp' : 'mock',
        score: raw.score?.toString() || '',
        max_score: raw.max_score?.toString() || '',
        total_questions: raw.total_questions?.toString() || '',
        attempted: raw.attempted?.toString() || '',
        correct_answers: raw.correct_answers?.toString() || '',
        incorrect_answers: raw.incorrect_answers?.toString() || '',
        percentile: raw.percentile?.toString() || '',
        rank: raw.rank?.toString() || '',
        rank_out_of: raw.rank_out_of?.toString() || '',
        total_time: raw.total_time?.toString() || '',
        cutoff: raw.cutoff?.toString() || '',
        date: raw.date || new Date().toISOString().split('T')[0],
        sections: (raw.sections || []).map((s: any): SectionFormData => ({
          name: s.name || '',
          score: s.score?.toString() || '',
          max_score: s.max_score?.toString() || '',
          attempted: s.attempted?.toString() || '',
          total_questions: s.total_questions?.toString() || '',
          correct: s.correct?.toString() || '',
          incorrect: s.incorrect?.toString() || '',
          time_taken: s.time_taken?.toString() || '',
        })),
      };

      setExtracted(formData);
      setScanState('preview');

    } catch (e: any) {
      setErrorMsg(e?.message || 'Failed to extract data from image.');
      setScanState('error');
    }
  };

  const handleConfirm = () => {
    if (extracted) {
      onExtracted(extracted);
      onClose();
    }
  };

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Scan result</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* IDLE — choose source */}
        {scanState === 'idle' && (
          <View style={styles.content}>
            <View style={styles.iconBig}>
              <Text style={styles.iconBigText}>📷</Text>
            </View>
            <Text style={styles.heading}>Scan your test result</Text>
            <Text style={styles.subheading}>
              Take a photo or upload a screenshot of your result page.
              We'll automatically fill in all the scores and sections.
            </Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => pickImage(true)}>
              <Text style={styles.primaryBtnText}>📷  Take a photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => pickImage(false)}>
              <Text style={styles.secondaryBtnText}>🖼  Choose from gallery</Text>
            </TouchableOpacity>
            <Text style={styles.hint}>
              Works with Testbook, PracticeMock, Adda247, BYJU's and most test platforms
            </Text>
          </View>
        )}

        {/* SCANNING */}
        {scanState === 'scanning' && (
          <View style={styles.content}>
            {previewUri && (
              <Image source={{ uri: previewUri }} style={styles.previewImg} resizeMode="contain" />
            )}
            <View style={styles.scanningBox}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.scanningText}>Scanning your result...</Text>
              <Text style={styles.scanningSubtext}>Reading scores, sections and marks</Text>
            </View>
          </View>
        )}

        {/* PREVIEW — show what was extracted */}
        {scanState === 'preview' && extracted && (
          <View style={styles.previewContainer}>
            {previewUri && (
              <Image source={{ uri: previewUri }} style={styles.previewImgSmall} resizeMode="contain" />
            )}
            <View style={styles.extractedCard}>
              <Text style={styles.extractedTitle}>✓ Data extracted</Text>
              <Text style={styles.extractedSubtitle}>Review and confirm before filling the form</Text>

              {extracted.name ? <ExtractRow label="Paper" value={extracted.name} /> : null}
              {extracted.score ? <ExtractRow label="Score" value={`${extracted.score} / ${extracted.max_score || '?'}`} /> : null}
              {extracted.attempted ? <ExtractRow label="Attempted" value={`${extracted.attempted} / ${extracted.total_questions || '?'}`} /> : null}
              {extracted.correct_answers ? <ExtractRow label="Correct" value={extracted.correct_answers} /> : null}
              {extracted.incorrect_answers ? <ExtractRow label="Incorrect" value={extracted.incorrect_answers} /> : null}
              {extracted.percentile ? <ExtractRow label="Percentile" value={extracted.percentile} /> : null}
              {extracted.rank ? <ExtractRow label="Rank" value={`${extracted.rank}${extracted.rank_out_of ? ' / ' + extracted.rank_out_of : ''}`} /> : null}
              {extracted.cutoff ? <ExtractRow label="Cutoff" value={extracted.cutoff} /> : null}
              {(extracted.sections?.length ?? 0) > 0 && (
                <ExtractRow label="Sections" value={`${extracted.sections!.length} section${extracted.sections!.length > 1 ? 's' : ''} found`} highlight />
              )}
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={handleConfirm}>
              <Text style={styles.primaryBtnText}>Use this data →</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => setScanState('idle')}>
              <Text style={styles.secondaryBtnText}>Scan again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ERROR */}
        {scanState === 'error' && (
          <View style={styles.content}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.heading}>Couldn't extract data</Text>
            <Text style={styles.subheading}>{errorMsg}</Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => setScanState('idle')}>
              <Text style={styles.primaryBtnText}>Try again</Text>
            </TouchableOpacity>
            <Text style={styles.hint}>
              Tip: Make sure the scores and section names are clearly visible.
              Avoid blurry or dark photos.
            </Text>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

function ExtractRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={styles.extractRow}>
      <Text style={styles.extractLabel}>{label}</Text>
      <Text style={[styles.extractValue, highlight && { color: colors.primary, fontWeight: '500' }]}>{value}</Text>
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
  title: { fontSize: 17, fontWeight: '500', color: colors.textPrimary },
  cancelText: { fontSize: 15, color: colors.textSecondary, minWidth: 60 },

  content: { flex: 1, padding: spacing.xl, alignItems: 'center', justifyContent: 'center' },
  iconBig: { marginBottom: 20 },
  iconBigText: { fontSize: 64 },
  errorIcon: { fontSize: 48, marginBottom: 16 },
  heading: { fontSize: 20, fontWeight: '500', color: colors.textPrimary, textAlign: 'center', marginBottom: 10 },
  subheading: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 32 },

  primaryBtn: {
    width: '100%', padding: 14, backgroundColor: colors.primary,
    borderRadius: radius.md, alignItems: 'center', marginBottom: 12,
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '500' },
  secondaryBtn: {
    width: '100%', padding: 14, borderRadius: radius.md, alignItems: 'center',
    borderWidth: 0.5, borderColor: colors.borderMed, marginBottom: 12,
  },
  secondaryBtnText: { color: colors.textPrimary, fontSize: 15 },
  hint: { fontSize: 12, color: colors.textHint, textAlign: 'center', marginTop: 8, lineHeight: 18 },

  previewImg: { width: '100%', height: 200, borderRadius: radius.md, marginBottom: 20 },
  scanningBox: { alignItems: 'center', gap: 12 },
  scanningText: { fontSize: 16, fontWeight: '500', color: colors.textPrimary },
  scanningSubtext: { fontSize: 13, color: colors.textSecondary },

  previewContainer: { flex: 1, padding: spacing.lg },
  previewImgSmall: { width: '100%', height: 140, borderRadius: radius.md, marginBottom: 14 },
  extractedCard: {
    backgroundColor: colors.surfaceSecondary, borderRadius: radius.md,
    padding: 14, marginBottom: 16, borderWidth: 0.5, borderColor: colors.border,
  },
  extractedTitle: { fontSize: 15, fontWeight: '500', color: colors.success, marginBottom: 2 },
  extractedSubtitle: { fontSize: 12, color: colors.textSecondary, marginBottom: 12 },
  extractRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 0.5, borderBottomColor: colors.border },
  extractLabel: { fontSize: 13, color: colors.textSecondary },
  extractValue: { fontSize: 13, color: colors.textPrimary },
});
