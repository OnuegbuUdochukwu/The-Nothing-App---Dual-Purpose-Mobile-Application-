import * as React from 'react';
import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import wellnessService from '@/utils/wellnessService';
import { Colors } from '@/constants/Colors';

export default function WellnessInsights() {
  const [streak, setStreak] = useState<number | null>(null);
  const [weekTotal, setWeekTotal] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const s = await wellnessService.getStreak(new Date());
      setStreak(s);

      // compute week starting this week's Sunday UTC
      const now = new Date();
      const weekStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - now.getUTCDay()));
      const wt = await wellnessService.getTotalForWeek(weekStart);
      setWeekTotal(wt);
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Wellness Insights</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Current Streak</Text>
        <Text style={styles.value}>{streak ?? '—'}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Minutes this week</Text>
        <Text style={styles.value}>{weekTotal ?? '—'}</Text>
      </View>
      <TouchableOpacity style={styles.closeBtn} onPress={() => {}}>
        <Text style={styles.closeText}>Close</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.personal.surface,
    padding: 16,
    borderRadius: 12,
    width: '100%',
  },
  header: { fontSize: 18, fontWeight: '700', color: Colors.personal.text, marginBottom: 12 },
  card: { marginBottom: 12 },
  label: { fontSize: 12, color: Colors.personal.textSecondary },
  value: { fontSize: 20, fontWeight: '700', color: Colors.personal.text },
  closeBtn: { marginTop: 8, alignSelf: 'flex-end' },
  closeText: { color: Colors.personal.accent },
});
