import * as React from 'react';
import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Trash2, Palette } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import DrawingCanvas from '@/components/DrawingCanvas';
import { Colors } from '@/constants/Colors';
import { useSubscription } from '@/hooks/useSubscription';
import { DoodleStroke } from '@/types';

const { width } = Dimensions.get('window');

export default function BabyDoodleScreen() {
  const { isPremium } = useSubscription();
  const [strokes, setStrokes] = useState<DoodleStroke[]>([]);
  const [currentColor, setCurrentColor] = useState(Colors.baby.red);

  // Premium gating: only premium users get full palette
  const colors = isPremium
    ? [
        Colors.baby.red,
        Colors.baby.blue,
        Colors.baby.yellow,
        Colors.baby.green,
        '#FF69B4', // Hot pink
        '#8A2BE2', // Blue violet
      ]
    : [Colors.baby.red];

  const strokeWidth = 8; // Thick strokes for babies

  const handleStrokeComplete = (stroke: DoodleStroke) => {
    setStrokes((prev) => [...prev, stroke]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const clearCanvas = () => {
    setStrokes([]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.toolbar}>
        <Text style={styles.title}>Baby Doodle</Text>
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
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                }}
                disabled={!isPremium && color !== Colors.baby.red}
              />
            ))}
          </View>
          <TouchableOpacity style={styles.clearButton} onPress={clearCanvas}>
            <Trash2 size={24} color={Colors.common.white} />
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        </View>
      </View>
      <DrawingCanvas
        strokes={strokes}
        currentColor={currentColor}
        strokeWidth={strokeWidth}
        onStrokeComplete={handleStrokeComplete}
        backgroundColor={Colors.common.white}
      />
      {/* Premium upsell for free users */}
      {!isPremium && (
        <View style={{ padding: 16, alignItems: 'center' }}>
          <Text style={{ color: Colors.baby.blue, marginBottom: 8 }}>
            Unlock more colors and features with Premium!
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
    backgroundColor: Colors.common.white,
  },
  toolbar: {
    backgroundColor: Colors.baby.surface,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 3,
    borderBottomColor: Colors.baby.yellow,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.baby.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  colorPalette: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: 'transparent',
    shadowColor: Colors.common.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  selectedColor: {
    borderColor: Colors.baby.text,
    transform: [{ scale: 1.1 }],
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.baby.red,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
    shadowColor: Colors.common.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  clearText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.common.white,
  },
});
