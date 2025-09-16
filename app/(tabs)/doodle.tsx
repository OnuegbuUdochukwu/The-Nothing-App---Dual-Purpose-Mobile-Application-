import * as React from 'react';
import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Trash2, RotateCcw } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
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
import { saveDoodle } from '@/utils/doodleGallery';
import PermissionsModal from '@/components/PermissionsModal';
import { isPermissionError } from '@/utils/doodleSaveUtils';
import { logEvent } from '@/utils/telemetry';
import DoodleGallery from '@/components/DoodleGallery';

export default function DoodleScreen() {
  const { isPremium } = useSubscription();
  const [strokes, setStrokes] = useState<DoodleStroke[]>([]);
  const [currentColor, setCurrentColor] = useState(Colors.personal.accent);
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [banner, setBanner] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const canvasRef = React.useRef<any>(null);
  const [permissionsModalVisible, setPermissionsModalVisible] = useState(false);
  const [galleryVisible, setGalleryVisible] = useState(false);

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
            {strokeWidths.map((w) => (
              <TouchableOpacity
                key={w}
                style={[
                  styles.widthButton,
                  strokeWidth === w && styles.selectedWidth,
                ]}
                onPress={() => setStrokeWidth(w)}
              >
                <View
                  style={[
                    styles.widthIndicator,
                    {
                      width: w * 2,
                      height: w * 2,
                      backgroundColor: currentColor,
                    },
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, { marginRight: 6 }]}
              onPress={() => setGalleryVisible(true)}
            >
              <Text style={{ color: Colors.personal.text, fontSize: 12 }}>
                Gallery
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={undo}>
              <RotateCcw size={20} color={Colors.personal.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={clearCanvas}>
              <Trash2 size={20} color={Colors.personal.text} />
            </TouchableOpacity>

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

                    // PNG-first capture
                    let pngUri: string | null = null;
                    try {
                      // eslint-disable-next-line @typescript-eslint/no-var-requires
                      const {
                        captureCanvasAsPNG,
                      } = require('@/utils/doodleRaster');
                      pngUri = await captureCanvasAsPNG(
                        canvasRef.current,
                        `doodle-${Date.now()}.png`,
                        { width: 1080, height: 1080 }
                      );
                    } catch (err) {
                      console.warn('PNG capture failed', err);
                      pngUri = null;
                    }

                    if (pngUri) {
                      try {
                        await saveToGallery(pngUri);
                        try {
                          const {
                            generateThumbnail,
                          } = require('@/utils/doodleThumbnail');
                          const thumb = await generateThumbnail(
                            pngUri,
                            200,
                            200
                          ).catch(() => pngUri);
                          await saveDoodle({
                            id: Date.now().toString(),
                            pngUri,
                            thumbnailUri: thumb,
                            createdAt: new Date().toISOString(),
                          });
                        } catch (err) {
                          console.warn(
                            'Thumbnail/galleries persist failed',
                            err
                          );
                          try {
                            await saveDoodle({
                              id: Date.now().toString(),
                              pngUri,
                              thumbnailUri: pngUri,
                              createdAt: new Date().toISOString(),
                            });
                          } catch (err2) {
                            console.warn('Persist gallery entry failed', err2);
                          }
                        }
                        setBanner({
                          type: 'success',
                          text: 'Doodle saved to your gallery.',
                        });
                        setTimeout(() => setBanner(null), 2500);
                      } catch (e: any) {
                        if (isPermissionError(e)) {
                          logEvent('doodle_save_permission_denied', {
                            message: e?.message,
                          });
                          setPermissionsModalVisible(true);
                        } else {
                          try {
                            await shareFile(pngUri);
                          } catch (shareErr) {
                            console.error('Share fallback failed', shareErr);
                          }
                        }
                        setBanner({
                          type: 'success',
                          text: 'Doodle ready to share.',
                        });
                        setTimeout(() => setBanner(null), 2500);
                      }
                    } else {
                      const svg = strokesToSVG(strokes, 1080, 1080);
                      const fileUri = await saveSVGToFile(svg);

                      try {
                        await saveToGallery(fileUri);
                        try {
                          await saveDoodle({
                            id: Date.now().toString(),
                            pngUri: fileUri,
                            thumbnailUri: fileUri,
                            createdAt: new Date().toISOString(),
                          });
                        } catch (err) {
                          console.warn(
                            'Failed to persist gallery entry for SVG',
                            err
                          );
                        }
                        setBanner({
                          type: 'success',
                          text: 'Doodle saved to your gallery.',
                        });
                        setTimeout(() => setBanner(null), 2500);
                      } catch (e: any) {
                        if (isPermissionError(e)) {
                          logEvent('doodle_save_permission_denied', {
                            message: e?.message,
                          });
                          setPermissionsModalVisible(true);
                        } else {
                          try {
                            await shareFile(fileUri);
                          } catch (shareErr) {
                            console.error('Share fallback failed', shareErr);
                          }
                        }
                        setBanner({
                          type: 'success',
                          text: 'Doodle ready to share.',
                        });
                        setTimeout(() => setBanner(null), 2500);
                      }
                    }

                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  } catch (err: any) {
                    console.error('Save doodle error', err);
                    Alert.alert(
                      'Save failed',
                      err?.message ||
                        'An error occurred while saving the doodle.'
                    );
                    setBanner({
                      type: 'error',
                      text: 'Save failed. Check permissions.',
                    });
                    setTimeout(() => setBanner(null), 2500);
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
        ref={canvasRef}
      />

      {!isPremium && (
        <View style={{ padding: 16, alignItems: 'center' }}>
          <Text
            style={{ color: Colors.personal.textSecondary, marginBottom: 8 }}
          >
            Unlock more colors, brush styles, and save your doodles with
            Premium!
          </Text>
        </View>
      )}

      {banner && (
        <View
          style={{
            position: 'absolute',
            bottom: 20,
            left: 20,
            right: 20,
            padding: 12,
            borderRadius: 10,
            backgroundColor:
              banner.type === 'success'
                ? Colors.personal.accent
                : Colors.common.error,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: Colors.common.white }}>{banner.text}</Text>
        </View>
      )}

      <PermissionsModal
        visible={permissionsModalVisible}
        title="Media permission required"
        message="To save doodles to your gallery we need access to your photos. Open Settings to allow access."
        onRequestClose={() => setPermissionsModalVisible(false)}
      />
      <DoodleGallery
        visible={galleryVisible}
        onRequestClose={() => setGalleryVisible(false)}
      />
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
  },
  colorPalette: {
    flexDirection: 'row',
  },
  colorButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
    marginRight: 8,
  },
  selectedColor: {
    borderColor: Colors.personal.text,
  },
  widthControls: {
    flexDirection: 'row',
    marginLeft: 8,
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
    marginRight: 8,
  },
  selectedWidth: {
    borderColor: Colors.personal.accent,
  },
  widthIndicator: {
    borderRadius: 10,
  },
  actions: {
    flexDirection: 'row',
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
    marginLeft: 8,
  },
});
