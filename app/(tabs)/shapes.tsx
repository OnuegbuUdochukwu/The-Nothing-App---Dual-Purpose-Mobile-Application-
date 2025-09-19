import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';

const { width, height } = Dimensions.get('window');

interface Shape {
  id: string;
  x: number;
  y: number;
  size: number;
  color: string;
  type: 'circle' | 'square' | 'triangle';
  animatedValue: Animated.Value;
  speedX: number;
  speedY: number;
}

const colors = [
  Colors.baby.red,
  Colors.baby.blue,
  Colors.baby.yellow,
  Colors.baby.green,
  '#FF69B4',
  '#8A2BE2',
];

export default function ShapesScreen() {
  const [shapes, setShapes] = useState<Shape[]>([]);
  const animationRef = useRef<number | null>(null);

  const createShape = React.useCallback(
    (): Shape => ({
      id: Date.now().toString() + Math.random(),
      x: Math.random() * (width - 100),
      y: Math.random() * (height - 200) + 100,
      size: 60 + Math.random() * 40,
      color: colors[Math.floor(Math.random() * colors.length)],
      type: ['circle', 'square', 'triangle'][Math.floor(Math.random() * 3)] as
        | 'circle'
        | 'square'
        | 'triangle',
      animatedValue: new Animated.Value(1),
      speedX: (Math.random() - 0.5) * 2,
      speedY: (Math.random() - 0.5) * 2,
    }),
    []
  );

  useEffect(() => {
    // Initialize with some shapes
    const initialShapes = Array.from({ length: 5 }, createShape);
    setShapes(initialShapes);

    // Start animation loop
    const animate = () => {
      setShapes((currentShapes) =>
        currentShapes.map((shape) => ({
          ...shape,
          x: (shape.x + shape.speedX + width) % width,
          y: ((shape.y + shape.speedY + height - 200) % (height - 200)) + 100,
        }))
      );
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [createShape]);

  const handleShapePress = (shape: Shape) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // Animate the shape
    Animated.sequence([
      Animated.timing(shape.animatedValue, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(shape.animatedValue, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    // Add a new shape occasionally
    if (Math.random() < 0.3 && shapes.length < 8) {
      setShapes((current) => [...current, createShape()]);
    }
  };

  const renderShape = (shape: Shape) => {
    const animatedStyle = {
      transform: [{ scale: shape.animatedValue }],
    };

    const shapeStyle = {
      position: 'absolute' as const,
      left: shape.x,
      top: shape.y,
      width: shape.size,
      height: shape.size,
      backgroundColor: shape.color,
    };

    let specificStyle = {};
    if (shape.type === 'circle') {
      specificStyle = { borderRadius: shape.size / 2 };
    } else if (shape.type === 'triangle') {
      specificStyle = {
        backgroundColor: 'transparent',
        borderLeftWidth: shape.size / 2,
        borderRightWidth: shape.size / 2,
        borderBottomWidth: shape.size,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: shape.color,
        width: 0,
        height: 0,
      };
    }

    return (
      <TouchableWithoutFeedback
        key={shape.id}
        onPress={() => handleShapePress(shape)}
      >
        <Animated.View style={[animatedStyle]}>
          <View style={[shapeStyle, specificStyle]} />
        </Animated.View>
      </TouchableWithoutFeedback>
    );
  };

  return (
    <LinearGradient
      colors={['#87CEEB', '#98FB98']} // Sky blue to light green
      style={styles.container}
    >
      <TouchableWithoutFeedback
        onPress={() => {
          if (shapes.length < 8) {
            setShapes((current) => [...current, createShape()]);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        }}
      >
        <View style={styles.playground}>{shapes.map(renderShape)}</View>
      </TouchableWithoutFeedback>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  playground: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
