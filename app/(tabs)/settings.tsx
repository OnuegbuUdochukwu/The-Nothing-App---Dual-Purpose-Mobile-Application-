import * as React from 'react';
import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Baby, Bell, Shield, Info, Crown } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useAppMode } from '@/hooks/useAppMode';
import { useSubscription } from '@/hooks/useSubscription';
import { Colors } from '@/constants/Colors';
import { AppMode } from '@/types';
import PremiumModal from '@/components/PremiumModal';

export default function SettingsScreen() {
  const { mode, saveMode } = useAppMode();
  const { isPremium } = useSubscription();
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const isPersonalMode = mode === 'personal';
  const currentColors = isPersonalMode ? Colors.personal : Colors.baby;

  const switchMode = () => {
    const newMode: AppMode = isPersonalMode ? 'baby' : 'personal';
    const modeNames = { personal: 'Personal Mode', baby: 'Baby Mode' };

    Alert.alert('Switch Mode', `Switch to ${modeNames[newMode]}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Switch',
        onPress: () => {
          saveMode(newMode);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        },
      },
    ]);
  };

  const showPremiumInfo = () => {
    setShowPremiumModal(true);
  };

  const showAbout = () => {
    Alert.alert(
      'About Nothing App',
      'The Nothing App v1.0\n\nA dual-purpose mobile application that helps users embrace calm, focus, and safe digital minimalism.\n\nFor adults: distraction-free focus and wellness tracking.\nFor parents: safe digital space for babies and toddlers.',
      [{ text: 'Close', style: 'default' }]
    );
  };

  const SettingItem = ({
    icon,
    title,
    subtitle,
    onPress,
    showArrow = true,
    danger = false,
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    onPress: () => void;
    showArrow?: boolean;
    danger?: boolean;
  }) => (
    <TouchableOpacity
      style={[
        styles.settingItem,
        {
          backgroundColor: isPersonalMode
            ? Colors.personal.surface
            : Colors.common.white,
        },
      ]}
      onPress={onPress}
    >
      <View style={styles.settingLeft}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: isPersonalMode
                ? Colors.personal.background
                : Colors.baby.surface,
            },
          ]}
        >
          {icon}
        </View>
        <View>
          <Text
            style={[
              styles.settingTitle,
              { color: danger ? Colors.common.error : currentColors.text },
            ]}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              style={[
                styles.settingSubtitle,
                { color: currentColors.textSecondary },
              ]}
            >
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {showArrow && (
        <Text style={[styles.arrow, { color: currentColors.textSecondary }]}>
          ›
        </Text>
      )}
    </TouchableOpacity>
  );

  return React.createElement(
    LinearGradient,
    {
      colors: isPersonalMode
        ? [Colors.personal.background, Colors.personal.surface]
        : [Colors.common.white, Colors.baby.surface],
      style: styles.container,
    },
    React.createElement(
      ScrollView,
      { style: styles.content },
      React.createElement(
        View,
        { style: styles.header },
        React.createElement(
          View,
          {
            style: [
              styles.modeIndicator,
              {
                backgroundColor: isPersonalMode
                  ? Colors.personal.accent
                  : Colors.baby.blue,
              },
            ],
          },
          isPersonalMode
            ? React.createElement(User, {
                size: 24,
                color: Colors.common.white,
              })
            : React.createElement(Baby, {
                size: 24,
                color: Colors.common.white,
              })
        ),
        React.createElement(
          Text,
          { style: [styles.title, { color: currentColors.text }] },
          'Settings'
        ),
        React.createElement(
          Text,
          { style: [styles.subtitle, { color: currentColors.textSecondary }] },
          `Currently in ${isPersonalMode ? 'Personal' : 'Baby'} Mode`
        )
      ),

      React.createElement(
        View,
        { style: styles.section },
        React.createElement(
          Text,
          {
            style: [
              styles.sectionTitle,
              { color: currentColors.textSecondary },
            ],
          },
          'App Mode'
        ),
        React.createElement(SettingItem, {
          icon: isPersonalMode
            ? React.createElement(Baby, { size: 20, color: Colors.baby.blue })
            : React.createElement(User, {
                size: 20,
                color: Colors.personal.accent,
              }),
          title: `Switch to ${isPersonalMode ? 'Baby' : 'Personal'} Mode`,
          subtitle: isPersonalMode
            ? 'Safe digital space for little ones'
            : 'Focus, wellness, and distraction-free time',
          onPress: switchMode,
        })
      ),

      React.createElement(
        View,
        { style: styles.section },
        React.createElement(
          Text,
          {
            style: [
              styles.sectionTitle,
              { color: currentColors.textSecondary },
            ],
          },
          'Features'
        ),
        React.createElement(SettingItem, {
          icon: React.createElement(Crown, {
            size: 20,
            color: Colors.common.gold,
          }),
          title: 'Premium Features',
          subtitle: isPremium
            ? 'Active - Enjoy all premium features'
            : 'Upgrade for advanced features',
          onPress: showPremiumInfo,
        }),
        isPersonalMode &&
          React.createElement(SettingItem, {
            icon: React.createElement(Bell, {
              size: 20,
              color: Colors.personal.accent,
            }),
            title: 'Notifications',
            subtitle: 'Focus session reminders',
            onPress: () =>
              Alert.alert(
                'Coming Soon',
                'Notification settings will be available in a future update.'
              ),
          })
      ),

      React.createElement(
        View,
        { style: styles.section },
        React.createElement(
          Text,
          {
            style: [
              styles.sectionTitle,
              { color: currentColors.textSecondary },
            ],
          },
          'Support'
        ),
        React.createElement(SettingItem, {
          icon: React.createElement(Info, {
            size: 20,
            color: Colors.personal.accent,
          }),
          title: 'About Nothing App',
          subtitle: 'Version 1.0',
          onPress: showAbout,
        }),
        React.createElement(SettingItem, {
          icon: React.createElement(Shield, {
            size: 20,
            color: Colors.common.success,
          }),
          title: 'Privacy & Safety',
          subtitle: 'Your data stays on your device',
          onPress: () =>
            Alert.alert(
              'Privacy & Safety',
              'The Nothing App is designed with privacy in mind:\n\n• All your data stays on your device\n• No personal information is collected\n• Baby Mode provides a safe, locked environment\n• No internet connection required for core features',
              [{ text: 'Got it', style: 'default' }]
            ),
        })
      )
    ),
    React.createElement(PremiumModal, {
      visible: showPremiumModal,
      onClose: () => setShowPremiumModal(false),
    })
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 20,
  },
  modeIndicator: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
  },
  arrow: {
    fontSize: 20,
    fontWeight: '300',
  },
});
