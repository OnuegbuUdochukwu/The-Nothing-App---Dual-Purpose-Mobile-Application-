import * as React from 'react';
import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Trash2, RotateCcw } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import DrawingCanvas from '@/components/DrawingCanvas';
import { Colors } from '@/constants/Colors';
import { DoodleStroke } from '@/types';

export default function DoodleScreen() {
  const [strokes, setStrokes] = useState<DoodleStroke[]>([]);
  const [currentColor, setCurrentColor] = useState(Colors.personal.accent);
  const [strokeWidth, setStrokeWidth] = useState(3);

  const colors = [
    Colors.personal.accent,
    Colors.common.white,
    Colors.personal.textSecondary,
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1'
  ];

  const strokeWidths = [2, 4, 8];

  const handleStrokeComplete = (stroke: DoodleStroke) => {
    setStrokes(prev => [...prev, stroke]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const clearCanvas = () => {
    setStrokes([]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const undo = () => {
    setStrokes(prev => prev.slice(0, -1));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return React.createElement(
    SafeAreaView, 
    { style: styles.container },
    React.createElement(View, { style: styles.toolbar },
      React.createElement(Text, { style: styles.title }, "Adult Doodle"),
      
      React.createElement(View, { style: styles.controls },
        React.createElement(View, { style: styles.colorPalette },
          colors.map((color) => 
            React.createElement(TouchableOpacity, {
              key: color,
              style: [
                styles.colorButton,
                { backgroundColor: color },
                currentColor === color && styles.selectedColor
              ],
              onPress: () => {
                setCurrentColor(color);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
            })
          )
        ),

        React.createElement(View, { style: styles.widthControls },
          strokeWidths.map((width) => 
            React.createElement(TouchableOpacity, {
              key: width,
              style: [
                styles.widthButton,
                strokeWidth === width && styles.selectedWidth
              ],
              onPress: () => {
                setStrokeWidth(width);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
            }, 
              React.createElement(View, {
                style: [
                  styles.widthIndicator,
                  { width: width * 2, height: width * 2, backgroundColor: currentColor }
                ]
              })
            )
          )
        ),

        React.createElement(View, { style: styles.actions },
          React.createElement(TouchableOpacity, { style: styles.actionButton, onPress: undo },
            React.createElement(RotateCcw, { size: 20, color: Colors.personal.text })
          ),
          React.createElement(TouchableOpacity, { style: styles.actionButton, onPress: clearCanvas },
            React.createElement(Trash2, { size: 20, color: Colors.personal.text })
          )
        )
      ),

      React.createElement(DrawingCanvas, {
        strokes: strokes,
        currentColor: currentColor,
        strokeWidth: strokeWidth,
        onStrokeComplete: handleStrokeComplete,
        backgroundColor: Colors.personal.background
      })
    )
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