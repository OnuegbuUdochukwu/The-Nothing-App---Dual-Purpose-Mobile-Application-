import * as React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import * as MediaLibrary from 'expo-media-library';
import { Colors } from '@/constants/Colors';
import * as Haptics from 'expo-haptics';
import { logEvent } from '@/utils/telemetry';

export default function PermissionsSettings() {
  const [notifStatus, setNotifStatus] = React.useState<string>('unknown');
  const [mediaStatus, setMediaStatus] = React.useState<string>('unknown');

  React.useEffect(() => {
    (async () => {
      try {
        const n = await Notifications.getPermissionsAsync();
        setNotifStatus(n.status || 'unknown');
      } catch (e) {
        setNotifStatus('unknown');
      }

      try {
        const m = await MediaLibrary.getPermissionsAsync();
        setMediaStatus(m.status || 'unknown');
      } catch (e) {
        setMediaStatus('unknown');
      }
    })();
  }, []);

  const requestNotifications = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const r = await Notifications.requestPermissionsAsync();
    setNotifStatus(r.status || 'unknown');
    if (r.status !== 'granted') {
      logEvent('permission_denied', { permission: 'notifications' });
      Alert.alert(
        'Permission denied',
        'Open Settings to enable notifications.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]
      );
    }
  };

  const requestMedia = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const r = await MediaLibrary.requestPermissionsAsync();
    setMediaStatus(r.status || 'unknown');
    if (r.status !== 'granted') {
      logEvent('permission_denied', { permission: 'media-library' });
      Alert.alert(
        'Permission denied',
        'Open Settings to enable media access.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Permissions</Text>

      <View style={styles.row}>
        <View>
          <Text style={styles.label}>Notifications</Text>
          <Text style={styles.sub}>{notifStatus}</Text>
        </View>
        <TouchableOpacity style={styles.btn} onPress={requestNotifications}>
          <Text style={styles.btnText}>Request</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        <View>
          <Text style={styles.label}>Media Library</Text>
          <Text style={styles.sub}>{mediaStatus}</Text>
        </View>
        <TouchableOpacity style={styles.btn} onPress={requestMedia}>
          <Text style={styles.btnText}>Request</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: Colors.personal.background,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.personal.text,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: { color: Colors.personal.text, fontWeight: '600' },
  sub: { color: Colors.personal.textSecondary },
  btn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.personal.accent,
  },
  btnText: { color: Colors.common.white, fontWeight: '700' },
});
