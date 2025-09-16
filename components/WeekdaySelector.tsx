import * as React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

interface Props {
  selected?: number[]; // 0=Sun..6=Sat
  onChange: (days: number[]) => void;
}

export default function WeekdaySelector({ selected = [], onChange }: Props) {
  const [sel, setSel] = React.useState<number[]>(selected.slice());

  const toggle = (idx: number) => {
    const next = sel.includes(idx)
      ? sel.filter((d) => d !== idx)
      : [...sel, idx];
    setSel(next);
    onChange(next.slice().sort());
  };

  return (
    <View style={styles.row}>
      {DAYS.map((lbl, i) => {
        const active = sel.includes(i);
        return (
          <TouchableOpacity
            key={i}
            onPress={() => toggle(i)}
            style={[styles.day, active ? styles.active : styles.inactive]}
          >
            <Text style={active ? styles.activeText : styles.inactiveText}>
              {lbl}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  day: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  active: {
    backgroundColor: Colors.personal.accent,
  },
  inactive: {
    backgroundColor: Colors.personal.surface,
    borderWidth: 1,
    borderColor: Colors.personal.border,
  },
  activeText: { color: Colors.common.white, fontWeight: '700' },
  inactiveText: { color: Colors.personal.textSecondary },
});
