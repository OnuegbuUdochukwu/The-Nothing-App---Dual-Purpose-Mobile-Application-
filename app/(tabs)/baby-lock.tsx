import { BackHandler } from 'react-native';
import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  Platform,
  TextInput,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Lock,
  Clock as Unlock,
  Timer,
  Music,
  BarChart2,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as NavigationBar from 'expo-navigation-bar';
import * as SystemUI from 'expo-system-ui';
import { Colors } from '@/constants/Colors';
import * as Notifications from 'expo-notifications';
import { useSubscription } from '@/hooks/useSubscription';
import CalmingSounds from '@/components/CalmingSounds';
import PremiumModal from '@/components/PremiumModal';
import ParentalDashboard from '@/components/ParentalDashboard';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

export default function BabyLockScreen() {
  // ...state declarations and other hooks...

  // ...state declarations and other hooks...

  // Place useEffect after state declarations
  const [isLocked, setIsLocked] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState(10); // minutes
  const [unlockAttempts, setUnlockAttempts] = useState(0);
  const [showPinInput, setShowPinInput] = useState(false);
  const [pin, setPin] = useState('');
  const [parentalPin, setParentalPin] = useState('');
  // Load parental PIN from AsyncStorage on mount
  useEffect(() => {
    (async () => {
      const storedPin = await AsyncStorage.getItem('parentalPin');
      setParentalPin(storedPin || '1234');
    })();
  }, []);
  const [pinError, setPinError] = useState('');
  const [showSounds, setShowSounds] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);

  const { isPremium } = useSubscription();

  const durations = [5, 10, 15, 20];

  // Notification silencing logic (must be after state declarations)
  const silenceNotifications = async () => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: false,
        shouldShowBanner: false,
        shouldShowList: false,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
  };

  const restoreNotifications = async () => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  };

  useEffect(() => {
    // Block hardware back button and enable immersive mode when locked (Android only)
    useEffect(() => {
      if (Platform.OS === 'android' && isLocked) {
        // Hide navigation bar and block hardware back button
        NavigationBar.setBehaviorAsync('inset-swipe');
        NavigationBar.setVisibilityAsync('hidden');
        const backHandler = BackHandler.addEventListener(
          'hardwareBackPress',
          () => true
        );
        return () => {
          NavigationBar.setBehaviorAsync('overlay-swipe');
          NavigationBar.setVisibilityAsync('visible');
          backHandler.remove();
        };
      } else if (Platform.OS === 'android') {
        NavigationBar.setBehaviorAsync('overlay-swipe');
        NavigationBar.setVisibilityAsync('visible');
      }
    }, [isLocked]);
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isLocked && timeLeft > 0) {
      if (Platform.OS === 'android') {
        NavigationBar.setVisibilityAsync('hidden');
      }
      silenceNotifications();
      interval = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            setIsLocked(false);
            saveSessionHistory();
            setSessionStartTime(null);
            if (Platform.OS === 'android') {
              NavigationBar.setVisibilityAsync('visible');
            }
            restoreNotifications();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            Alert.alert('Baby Time Complete', 'Baby mode session has ended.');
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
      if (Platform.OS === 'android') {
        NavigationBar.setVisibilityAsync('visible');
      }
      restoreNotifications();
    }
    return () => {
      if (interval) clearInterval(interval);
      if (Platform.OS === 'android') {
        NavigationBar.setVisibilityAsync('visible');
      }
      restoreNotifications();
    };
  }, [isLocked, timeLeft]);

  const startBabyMode = () => {
    setTimeLeft(selectedDuration * 60);
    setIsLocked(true);
    setUnlockAttempts(0);
    setSessionStartTime(new Date());
    // Disable navigation buttons when Baby Lock starts (Android only)
    if (Platform.OS === 'android') {
      NavigationBar.setVisibilityAsync('hidden');
    }
    // Silence notifications when Baby Lock starts
    silenceNotifications();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const saveSessionHistory = async () => {
    if (!sessionStartTime) return;

    try {
      // Calculate session duration in minutes
      const endTime = new Date();
      const durationMs = endTime.getTime() - sessionStartTime.getTime();
      const durationMinutes = Math.round(durationMs / (1000 * 60));

      // Create session record
      const sessionData = {
        date: sessionStartTime.toISOString(),
        duration: durationMinutes,
        mode: 'baby',
      };

      // Get existing history
      const existingData = await AsyncStorage.getItem('babySessionHistory');
      let history = existingData ? JSON.parse(existingData) : [];

      // Add new session to history
      history = [sessionData, ...history];

      // Save updated history
      await AsyncStorage.setItem('babySessionHistory', JSON.stringify(history));
    } catch (error) {
      console.error('Error saving session history:', error);
    }
  };

  const handleUnlockAttempt = () => {
    setUnlockAttempts((prev) => prev + 1);

    if (unlockAttempts >= 2) {
      // Three taps total
      setShowPinInput(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePinSubmit = async () => {
    if (pin === parentalPin) {
      // PIN is correct
      // Save session history before unlocking
      await saveSessionHistory();

      setIsLocked(false);
      setTimeLeft(0);
      setUnlockAttempts(0);
      setShowPinInput(false);
      setPin('');
      setPinError('');
      setSessionStartTime(null);

      // Restore navigation buttons when unlocked (Android only)
      if (Platform.OS === 'android') {
        NavigationBar.setVisibilityAsync('visible');
      }
      // Restore notifications when unlocked
      restoreNotifications();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } else {
      // PIN is incorrect
      setPinError('Incorrect PIN. Please try again.');
      setPin('');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  };

  const handleDashboardPress = () => {
    if (isPremium) {
      setShowDashboard(true);
    } else {
      setShowPremiumModal(true);
    }
  };

  const handlePinCancel = () => {
    setShowPinInput(false);
    setPin('');
    setPinError('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  if (isLocked) {
    return React.createElement(
      LinearGradient,
      {
        colors: [Colors.baby.yellow, Colors.baby.blue],
        style: styles.lockedContainer,
      },
      showPinInput
        ? React.createElement(
            View,
            { style: styles.pinContainer },
            React.createElement(
              Text,
              { style: styles.pinTitle },
              'Parent Unlock'
            ),
            React.createElement(
              Text,
              { style: styles.pinSubtitle },
              'Enter PIN to exit Baby Mode'
            ),
            React.createElement(TextInput, {
              style: styles.pinInput,
              value: pin,
              onChangeText: setPin,
              keyboardType: 'number-pad',
              secureTextEntry: true,
              maxLength: 4,
              placeholder: 'Enter 4-digit PIN',
              placeholderTextColor: Colors.common.white + '80',
              autoFocus: true,
            }),
            pinError
              ? React.createElement(Text, { style: styles.pinError }, pinError)
              : null,
            React.createElement(
              View,
              { style: styles.pinButtonsContainer },
              React.createElement(
                TouchableOpacity,
                {
                  style: [styles.pinButton, styles.pinCancelButton],
                  onPress: handlePinCancel,
                },
                React.createElement(
                  Text,
                  { style: styles.pinButtonText },
                  'Cancel'
                )
              ),
              React.createElement(
                TouchableOpacity,
                {
                  style: [styles.pinButton, styles.pinSubmitButton],
                  onPress: handlePinSubmit,
                  disabled: pin.length !== 4,
                },
                React.createElement(
                  Text,
                  { style: styles.pinButtonText },
                  'Unlock'
                )
              )
            )
          )
        : React.createElement(
            TouchableOpacity,
            {
              style: styles.lockedContent,
              onPress: handleUnlockAttempt,
              activeOpacity: 1,
            },
            React.createElement(
              View,
              { style: styles.lockIcon },
              React.createElement(Lock, {
                size: 48,
                color: Colors.common.white,
              })
            ),
            React.createElement(
              Text,
              { style: styles.lockedTitle },
              'Baby Mode Active'
            ),
            React.createElement(
              Text,
              { style: styles.timeDisplay },
              formatTime(timeLeft)
            ),
            React.createElement(
              Text,
              { style: styles.unlockHint },
              unlockAttempts === 0
                ? 'Tap 3 times in corner to unlock'
                : unlockAttempts === 1
                ? 'Tap 2 more times...'
                : unlockAttempts === 2
                ? 'Tap 1 more time...'
                : ''
            )
          )
    );
  }

  const [showSetPin, setShowSetPin] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinSetError, setPinSetError] = useState('');

  const handleSetPin = () => {
    if (newPin.length !== 4) {
      setPinSetError('PIN must be 4 digits');
      return;
    }
    if (newPin === '1234') {
      setPinSetError('Cannot use default PIN (1234).');
      return;
    }
    if (newPin !== confirmPin) {
      setPinSetError('PINs do not match');
      return;
    }
    setParentalPin(newPin);
    AsyncStorage.setItem('parentalPin', newPin);
    setShowSetPin(false);
    setNewPin('');
    setConfirmPin('');
    setPinSetError('');
    Alert.alert('Success', 'Parental PIN has been set successfully.');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleSoundsPress = () => {
    if (isPremium) {
      setShowSounds(!showSounds);
    } else {
      setShowPremiumModal(true);
    }
  };

  return React.createElement(
    LinearGradient,
    {
      colors: [Colors.common.white, Colors.baby.surface],
      style: styles.container,
    },
    React.createElement(PremiumModal, {
      visible: showPremiumModal,
      onClose: () => setShowPremiumModal(false),
      featureName: showDashboard
        ? 'Parental Dashboard'
        : 'Calming Sounds for Baby Mode',
    }),

    React.createElement(ParentalDashboard, {
      visible: showDashboard,
      onClose: () => setShowDashboard(false),
    }),
    React.createElement(
      View,
      { style: styles.content },
      React.createElement(
        View,
        { style: styles.header },
        React.createElement(
          View,
          { style: styles.headerLeft },
          React.createElement(Lock, { size: 48, color: Colors.baby.blue }),
          React.createElement(
            View,
            { style: styles.headerText },
            React.createElement(Text, { style: styles.title }, 'Baby Lock'),
            React.createElement(
              Text,
              { style: styles.subtitle },
              'Safe digital space for little ones'
            )
          )
        ),
        React.createElement(
          View,
          { style: styles.headerButtons },
          React.createElement(
            TouchableOpacity,
            {
              style: styles.headerButton,
              onPress: handleDashboardPress,
            },
            React.createElement(BarChart2, {
              size: 20,
              color: isPremium ? Colors.baby.blue : Colors.baby.textSecondary,
            }),
            React.createElement(
              Text,
              {
                style: [
                  styles.buttonText,
                  {
                    color: isPremium
                      ? Colors.baby.blue
                      : Colors.baby.textSecondary,
                  },
                ],
              },
              'Dashboard'
            )
          ),

          React.createElement(
            TouchableOpacity,
            {
              style: styles.headerButton,
              onPress: handleSoundsPress,
            },
            React.createElement(Music, {
              size: 20,
              color: isPremium ? Colors.baby.blue : Colors.baby.textSecondary,
            }),
            React.createElement(
              Text,
              {
                style: [
                  styles.buttonText,
                  {
                    color: isPremium
                      ? Colors.baby.blue
                      : Colors.baby.textSecondary,
                  },
                ],
              },
              'Sounds'
            )
          )
        )
      ),

      showSounds && isPremium ? React.createElement(CalmingSounds, null) : null,

      React.createElement(
        View,
        { style: styles.durationSection },
        React.createElement(
          Text,
          { style: styles.sectionTitle },
          'Session Duration'
        ),
        React.createElement(
          View,
          { style: styles.durationContainer },
          durations.map((duration) =>
            React.createElement(
              TouchableOpacity,
              {
                key: duration,
                style: [
                  styles.durationButton,
                  selectedDuration === duration && styles.selectedDuration,
                ],
                onPress: () => {
                  setSelectedDuration(duration);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                },
              },
              React.createElement(Timer, {
                size: 20,
                color:
                  selectedDuration === duration
                    ? Colors.common.white
                    : Colors.baby.blue,
              }),
              React.createElement(
                Text,
                {
                  style: [
                    styles.durationText,
                    selectedDuration === duration &&
                      styles.selectedDurationText,
                  ],
                },
                duration + 'm'
              )
            )
          )
        )
      ),

      React.createElement(
        View,
        { style: styles.warningSection },
        React.createElement(Text, { style: styles.warningTitle }, 'Important:'),
        React.createElement(
          Text,
          { style: styles.warningText },
          '• Baby Mode will lock your phone for the selected duration\n' +
            '• Tap the corner 3 times to unlock early\n' +
            '• Your phone will be safe from accidental calls or app switches'
        )
      ),

      React.createElement(
        TouchableOpacity,
        {
          style: styles.startButton,
          onPress: () => startBabyMode(),
        },
        React.createElement(Lock, { size: 24, color: Colors.common.white }),
        React.createElement(
          Text,
          { style: styles.startButtonText },
          'Start Baby Mode'
        )
      ),

      React.createElement(
        TouchableOpacity,
        {
          style: styles.setPinButton,
          onPress: () => setShowSetPin(true),
        },
        React.createElement(
          Text,
          { style: styles.setPinButtonText },
          'Set Parental PIN'
        )
      )
    )
  );
}

const styles = StyleSheet.create({
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
  },
  buttonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 12,
  },
  container: {
    flex: 1,
  },
  pinContainer: {
    width: '80%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  pinTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.common.white,
    marginBottom: 8,
  },
  pinSubtitle: {
    fontSize: 16,
    color: Colors.common.white,
    marginBottom: 24,
    textAlign: 'center',
  },
  pinInput: {
    width: '100%',
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    fontSize: 24,
    color: Colors.common.white,
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 8,
  },
  pinError: {
    color: '#FF6B6B',
    fontSize: 14,
    marginBottom: 16,
  },
  pinButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
  },
  pinButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  pinCancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  pinSubmitButton: {
    backgroundColor: Colors.baby.yellow,
  },
  pinButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.common.white,
  },
  pinSetContainer: {
    width: '100%',
    marginTop: 24,
  },
  pinSetInput: {
    width: '100%',
    height: 60,
    backgroundColor: Colors.common.white,
    borderRadius: 12,
    fontSize: 20,
    color: Colors.baby.text,
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 8,
    borderWidth: 1,
    borderColor: Colors.baby.blue,
  },
  pinSetError: {
    color: '#FF6B6B',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  lockedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockedContent: {
    alignItems: 'center',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  lockIcon: {
    marginBottom: 32,
  },
  lockedTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.common.white,
    marginBottom: 16,
    textAlign: 'center',
  },
  timeDisplay: {
    fontSize: 64,
    fontWeight: '300',
    color: Colors.common.white,
    marginBottom: 32,
  },
  unlockHint: {
    fontSize: 16,
    color: Colors.common.white,
    opacity: 0.8,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.baby.text,
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.baby.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  durationSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.baby.text,
    marginBottom: 16,
  },
  durationContainer: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  durationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: Colors.common.white,
    borderWidth: 2,
    borderColor: Colors.baby.blue,
    gap: 8,
    flex: 1,
    justifyContent: 'center',
  },
  selectedDuration: {
    backgroundColor: Colors.baby.blue,
  },
  durationText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.baby.blue,
  },
  selectedDurationText: {
    color: Colors.common.white,
  },
  warningSection: {
    backgroundColor: Colors.baby.surface,
    padding: 20,
    borderRadius: 12,
    marginBottom: 32,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.baby.text,
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: Colors.baby.textSecondary,
    lineHeight: 20,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.baby.blue,
    paddingVertical: 20,
    borderRadius: 16,
    gap: 12,
  },
  startButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.common.white,
  },
  setPinButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 12,
  },
  setPinButtonText: {
    fontSize: 16,
    color: Colors.baby.blue,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
