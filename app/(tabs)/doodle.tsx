import * as React from 'react';
import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Trash2, RotateCcw } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Alert } from 'react-native';
import {
  strokesToSVG,
  saveSVGToFile,
  saveToGallery,
  shareFile,
} from '@/utils/doodleExport';
import DrawingCanvas from '@/components/DrawingCanvas';
import { Colors } from '@/constants/Colors';
import { useSubscription } from '@/hooks/useSubscription';
import { DoodleStroke } from '@/types';

export default function DoodleScreen() {
  const { isPremium } = useSubscription();
  const [strokes, setStrokes] = useState<DoodleStroke[]>([]);
  const [currentColor, setCurrentColor] = useState(Colors.personal.accent);
  const [strokeWidth, setStrokeWidth] = useState(3);

  // Premium gating: only premium users get full palette and brush styles
  const colors = isPremium
    ? [
        Colors.personal.accent,
        Colors.common.white,
        Colors.personal.textSecondary,
        '#FF6B6B',
        '#4ECDC4',
        '#45B7D1',
      ]
    : [Colors.personal.accent];

  const strokeWidths = isPremium ? [2, 4, 8] : [3];

  const handleStrokeComplete = (stroke: DoodleStroke) => {
    setStrokes((prev) => [...prev, stroke]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const clearCanvas = () => {
    setStrokes([]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const undo = () => {
    setStrokes((prev) => prev.slice(0, -1));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.toolbar}>
        <Text style={styles.title}>Adult Doodle</Text>
        <View style={styles.controls}>
          <View style={styles.colorPalette}>
            {colors.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorButton,
                  { backgroundColor: color },
                  currentColor === color && styles.selectedColor,
                ]}
                onPress={() => {
                  setCurrentColor(color);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                disabled={!isPremium && color !== Colors.personal.accent}
              />
            ))}
          </View>
          <View style={styles.widthControls}>
            {strokeWidths.map((width) => (
              <TouchableOpacity
                key={width}
                style={[
                  styles.widthButton,
                  strokeWidth === width && styles.selectedWidth,
                ]}
                onPress={() => {
                  setStrokeWidth(width);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                disabled={!isPremium && width !== 3}
              >
                <View
                  style={[
                    styles.widthIndicator,
                    {
                      width: width * 2,
                      height: width * 2,
                      backgroundColor: currentColor,
                    },
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton} onPress={undo}>
              <RotateCcw size={20} color={Colors.personal.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={clearCanvas}>
              <Trash2 size={20} color={Colors.personal.text} />
            </TouchableOpacity>
            {/* Premium-only: Save/Export button placeholder */}
            {isPremium && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={async () => {
                  try {
                    if (!strokes || strokes.length === 0) {
                      Alert.alert(
                        'Nothing to save',
                        'Please draw something before saving.'
                      );
                      return;
                    }

                    const svg = strokesToSVG(strokes, 1080, 1080);
                    const fileUri = await saveSVGToFile(svg);

                    // Try to save to gallery, fallback to share
                    try {
                      await saveToGallery(fileUri);
                      Alert.alert('Saved', 'Doodle saved to your gallery.');
                    } catch (e) {
                      // If gallery save fails, attempt share
                      await shareFile(fileUri);
                    }

                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  } catch (err: any) {
                    console.error('Save doodle error', err);
                    Alert.alert(
                      'Save failed',
                      err?.message ||
                        'An error occurred while saving the doodle.'
                    );
                  }
                }}
              >
                <Text style={{ color: Colors.personal.text, fontSize: 12 }}>
                  Save
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
      <DrawingCanvas
        strokes={strokes}
        currentColor={currentColor}
        strokeWidth={strokeWidth}
        onStrokeComplete={handleStrokeComplete}
        backgroundColor={Colors.personal.background}
      />
      {/* Premium upsell for free users */}
      {!isPremium && (
        <View style={{ padding: 16, alignItems: 'center' }}>
          <Text
            style={{ color: Colors.personal.textSecondary, marginBottom: 8 }}
          >
            Unlock more colors, brush styles, and save your doodles with
            Premium!
          </Text>
          {/* You can add a PremiumModal or upgrade button here */}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.personal.background,
  },
  toolbar: {
    backgroundColor: Colors.personal.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.personal.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.personal.text,
    marginBottom: 12,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  colorPalette: {
    flexDirection: 'row',
    gap: 8,
  },
  colorButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: Colors.personal.text,
  },
  widthControls: {
    flexDirection: 'row',
    gap: 8,
  },
  widthButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.personal.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.personal.border,
  },
  selectedWidth: {
    borderColor: Colors.personal.accent,
  },
  widthIndicator: {
    borderRadius: 10,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 'auto',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.personal.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.personal.border,
  },
});
