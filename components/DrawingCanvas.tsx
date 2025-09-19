import * as React from 'react';
import { useState } from 'react';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { Svg, Path } from 'react-native-svg';
import { Dimensions, StyleSheet, View } from 'react-native';
import { DoodleStroke } from '@/types';

const { width, height } = Dimensions.get('window');

interface DrawingCanvasProps {
  strokes: DoodleStroke[];
  currentColor: string;
  strokeWidth: number;
  onStrokeComplete: (stroke: DoodleStroke) => void;
  backgroundColor?: string;
}

// Forward ref so parent can capture the view (for PNG rasterization)
const DrawingCanvas = React.forwardRef(function DrawingCanvas(
  {
    strokes,
    currentColor,
    strokeWidth,
    onStrokeComplete,
    backgroundColor = '#ffffff',
  }: DrawingCanvasProps,
  ref: any
) {
  const [currentStroke, setCurrentStroke] = useState<
    { x: number; y: number }[]
  >([]);

  const onGestureEvent = (event: any) => {
    const { x, y } = event.nativeEvent;
    setCurrentStroke((prev) => [...prev, { x, y }]);
  };

  const onHandlerStateChange = (event: any) => {
    const { state } = event.nativeEvent;

    if (state === State.BEGAN) {
      const { x, y } = event.nativeEvent;
      setCurrentStroke([{ x, y }]);
    } else if (state === State.END) {
      if (currentStroke.length > 0) {
        const stroke: DoodleStroke = {
          id: Date.now().toString(),
          points: currentStroke,
          color: currentColor,
          width: strokeWidth,
        };
        onStrokeComplete(stroke);
        setCurrentStroke([]);
      }
    }
  };

  const createPath = (points: { x: number; y: number }[]) => {
    if (points.length < 2) return '';

    let path = `M${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L${points[i].x},${points[i].y}`;
    }
    return path;
  };

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
    >
      <View ref={ref} style={[styles.canvas, { backgroundColor }]}>
        <Svg width={width} height={height - 200}>
          {strokes.map((stroke) => (
            <Path
              key={stroke.id}
              d={createPath(stroke.points)}
              stroke={stroke.color}
              strokeWidth={stroke.width}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="transparent"
            />
          ))}
          {currentStroke.length > 0 && (
            <Path
              d={createPath(currentStroke)}
              stroke={currentColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="transparent"
            />
          )}
        </Svg>
      </View>
    </PanGestureHandler>
  );
});

export default DrawingCanvas;

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
  },
});
