import * as React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';

interface Props {
  visible: boolean;
  title?: string;
  message?: string;
  onRequestClose: () => void;
}

export default function PermissionsModal({
  visible,
  title = 'Permission required',
  message = 'This feature requires permission to proceed. Please grant the permission.',
  onRequestClose,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.btn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onRequestClose();
              }}
            >
              <Text style={styles.btnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.primary]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                // Open app settings as fallback
                Linking.openSettings();
              }}
            >
              <Text style={[styles.btnText, styles.primaryText]}>
                Open Settings
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: Colors.personal.surface,
    padding: 20,
    borderRadius: 12,
    width: '100%',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.personal.text,
    marginBottom: 8,
  },
  message: {
    color: Colors.personal.textSecondary,
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  btn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  primary: {
    backgroundColor: Colors.personal.accent,
  },
  btnText: {
    color: Colors.personal.text,
    fontWeight: '600',
  },
  primaryText: {
    color: Colors.common.white,
  },
});
