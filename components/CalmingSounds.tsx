import * as React from 'react';
import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Volume2, VolumeX, Music } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useSubscription } from '@/hooks/useSubscription';
import PremiumModal from './PremiumModal';

type Sound = {
  id: string;
  name: string;
  icon: React.ReactNode;
  isPremium: boolean;
};

export default function CalmingSounds() {
  const [activeSound, setActiveSound] = useState<string | null>(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const { isPremium } = useSubscription();

  // In a real app, these would be actual sound files
  const sounds: Sound[] = [
    {
      id: 'white-noise',
      name: 'White Noise',
      icon: <Volume2 size={20} color={Colors.baby.blue} />,
      isPremium: false,
    },
    {
      id: 'lullaby',
      name: 'Lullaby',
      icon: <Music size={20} color={Colors.baby.blue} />,
      isPremium: false,
    },
    {
      id: 'ocean-waves',
      name: 'Ocean Waves',
      icon: <Volume2 size={20} color={Colors.baby.blue} />,
      isPremium: true,
    },
    {
      id: 'heartbeat',
      name: 'Heartbeat',
      icon: <Volume2 size={20} color={Colors.baby.blue} />,
      isPremium: true,
    },
    {
      id: 'rain',
      name: 'Rain',
      icon: <Volume2 size={20} color={Colors.baby.blue} />,
      isPremium: true,
    },
  ];

  const toggleSound = (soundId: string) => {
    const sound = sounds.find((s) => s.id === soundId);

    if (sound?.isPremium && !isPremium) {
      setShowPremiumModal(true);
      return;
    }

    if (activeSound === soundId) {
      // Stop the sound
      setActiveSound(null);
    } else {
      // Play the sound
      setActiveSound(soundId);
    }
  };

  return React.createElement(
    View,
    { style: styles.container },
    React.createElement(Text, { style: styles.title }, 'Calming Sounds'),

    React.createElement(
      ScrollView,
      {
        horizontal: true,
        showsHorizontalScrollIndicator: false,
        style: styles.soundsScroll,
      },
      sounds.map((sound) =>
        React.createElement(
          TouchableOpacity,
          {
            key: sound.id,
            style: [
              styles.soundButton,
              activeSound === sound.id && styles.activeSound,
              sound.isPremium && !isPremium && styles.premiumSound,
            ],
            onPress: () => toggleSound(sound.id),
          },
          sound.icon,
          React.createElement(
            Text,
            {
              style: [
                styles.soundName,
                activeSound === sound.id && styles.activeSoundText,
                sound.isPremium && !isPremium && styles.premiumSoundText,
              ],
            },
            sound.name
          ),
          sound.isPremium &&
            !isPremium &&
            React.createElement(
              View,
              { style: styles.premiumBadge },
              React.createElement(
                Text,
                { style: styles.premiumBadgeText },
                'PRO'
              )
            )
        )
      )
    ),

    React.createElement(
      TouchableOpacity,
      {
        style: styles.stopButton,
        onPress: () => setActiveSound(null),
        disabled: !activeSound,
      },
      React.createElement(VolumeX, {
        size: 16,
        color: activeSound ? Colors.baby.blue : Colors.baby.textSecondary,
      }),
      React.createElement(
        Text,
        { style: [styles.stopText, !activeSound && styles.disabledText] },
        'Stop All'
      )
    ),

    React.createElement(PremiumModal, {
      visible: showPremiumModal,
      onClose: () => setShowPremiumModal(false),
      featureName: 'Premium Calming Sounds',
    })
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.baby.text,
    marginBottom: 12,
  },
  soundsScroll: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  soundButton: {
    backgroundColor: Colors.baby.surface,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 120,
  },
  activeSound: {
    backgroundColor: Colors.baby.blue,
  },
  premiumSound: {
    opacity: 0.7,
  },
  soundName: {
    marginLeft: 8,
    color: Colors.baby.text,
    fontWeight: '500',
  },
  activeSoundText: {
    color: Colors.common.white,
  },
  premiumSoundText: {
    color: Colors.baby.textSecondary,
  },
  premiumBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: Colors.common.gold,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  premiumBadgeText: {
    color: Colors.common.white,
    fontSize: 8,
    fontWeight: 'bold',
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  stopText: {
    marginLeft: 6,
    color: Colors.baby.blue,
    fontSize: 14,
  },
  disabledText: {
    color: Colors.baby.textSecondary,
  },
});
