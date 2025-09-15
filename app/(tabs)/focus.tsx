import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  Dimensions,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Play,
  Pause,
  Square,
  ChevronUp,
  BellOff,
  BarChart,
  Clock,
  Calendar,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { Colors } from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import {
  PanGestureHandlerGestureEvent,
  PanGestureHandlerStateChangeEvent,
} from 'react-native-gesture-handler';
import { useSubscription } from '@/hooks/useSubscription';
import PremiumModal from '@/components/PremiumModal';

const { height } = Dimensions.get('window');

// Set up notification handler for the app
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function FocusScreen() {
  // Animated timer opacity
  const timerOpacity = useRef(new Animated.Value(0.3)).current;
  const timerFadeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ...state declarations...

  // (move this useEffect after all state declarations)

  const showTimer = () => {
    Animated.timing(timerOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    if (timerFadeTimeout.current) clearTimeout(timerFadeTimeout.current);
    timerFadeTimeout.current = setTimeout(() => {
      Animated.timing(timerOpacity, {
        toValue: 0.3,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, 2500);
  };
  // PIN setting dialog state
  const [showSetPin, setShowSetPin] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinSetError, setPinSetError] = useState('');

  const handleSetPin = async () => {
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
    await AsyncStorage.setItem('parentalPin', newPin);
    setShowSetPin(false);
    setNewPin('');
    setConfirmPin('');
    setPinSetError('');
    Alert.alert('Success', 'Parental PIN has been set successfully.');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState(5); // minutes
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [pin, setPin] = useState('');
  const [swipePosition, setSwipePosition] = useState(0);
  const [isSwipeActive, setIsSwipeActive] = useState(false);
  const [notificationsSilenced, setNotificationsSilenced] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [sessionHistory, setSessionHistory] = useState<
    { date: string; duration: number; completed: boolean }[]
  >([]);

  const { isPremium } = useSubscription();

  const [parentalPin, setParentalPin] = useState('1234');
  // Reset timer opacity when session starts
  useEffect(() => {
    if (isActive) {
      timerOpacity.setValue(0.3);
    }
    return () => {
      if (timerFadeTimeout.current) clearTimeout(timerFadeTimeout.current);
    };
  }, [isActive]);
  useEffect(() => {
    (async () => {
      const storedPin = await AsyncStorage.getItem('parentalPin');
      if (storedPin) setParentalPin(storedPin);
    })();
  }, []);

  const durations = [5, 15, 30, 60];
  const [customDuration, setCustomDuration] = useState('');

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            setIsActive(false);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            restoreNotifications();
            saveSessionToHistory(true); // Session was completed successfully
            Alert.alert(
              'Session Complete',
              'Well done! You completed your focus session. Notifications have been restored.'
            );
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
      // Ensure notifications are restored when component unmounts if session is active
      if (isActive) {
        restoreNotifications();
      }
    };
  }, [isActive, timeLeft]);

  // Function to silence notifications
  const silenceNotifications = async () => {
    // Update notification handler to silence notifications
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: false,
        shouldShowBanner: false,
        shouldShowList: false,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
    setNotificationsSilenced(true);
  };

  // Function to restore notifications
  const restoreNotifications = async () => {
    // Restore default notification behavior
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
    setNotificationsSilenced(false);
  };

  const startSession = async () => {
    setTimeLeft(selectedDuration * 60);
    setIsActive(true);
    await silenceNotifications();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      'Focus Mode Activated',
      'Notifications have been silenced for this session.'
    );
  };

  const saveSessionToHistory = (completed: boolean) => {
    const newSession = {
      date: new Date().toISOString(),
      duration: selectedDuration,
      completed,
    };

    setSessionHistory((prev) => [newSession, ...prev].slice(0, 10)); // Keep last 10 sessions
  };

  const stopSession = async () => {
    setIsActive(false);
    saveSessionToHistory(false); // Session was stopped early
    setTimeLeft(0);
    setPin('');
    setShowPinDialog(false);
    setSwipePosition(0);
    setIsSwipeActive(false);
    await restoreNotifications();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handlePinSubmit = () => {
    if (pin === parentalPin) {
      stopSession();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      setPin('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Incorrect PIN', 'Please try again.');
    }
  };

  const handleGestureEvent = (event: PanGestureHandlerGestureEvent) => {
    if (!isSwipeActive) return;

    const { translationY } = event.nativeEvent;
    // Limit swipe to upward motion only and cap at -100
    const newPosition = Math.max(-100, Math.min(0, -translationY));
    setSwipePosition(newPosition);
  };

  const handleStateChange = (event: PanGestureHandlerStateChangeEvent) => {
    const { state } = event.nativeEvent;

    if (state === State.BEGAN) {
      setIsSwipeActive(true);
    } else if (state === State.END || state === State.CANCELLED) {
      setIsSwipeActive(false);

      // If swiped up enough, show PIN dialog
      if (swipePosition <= -80) {
        setShowPinDialog(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      // Reset swipe position
      setSwipePosition(0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  if (isActive) {
    return (
      <View style={styles.activeContainer}>
        {notificationsSilenced && (
          <View style={styles.notificationBadge}>
            <BellOff size={16} color={Colors.personal.background} />
            <Text style={styles.notificationText}>Notifications Silenced</Text>
          </View>
        )}
        {showPinDialog ? (
          <View style={styles.pinContainer}>
            <Text style={styles.pinTitle}>Enter PIN to Exit</Text>
            <TextInput
              style={styles.pinInput}
              value={pin}
              onChangeText={setPin}
              keyboardType="numeric"
              secureTextEntry
              maxLength={4}
              autoFocus
              placeholder="Enter 4-digit PIN"
              placeholderTextColor={Colors.personal.textSecondary}
            />
            <TouchableOpacity
              style={styles.pinButton}
              onPress={handlePinSubmit}
            >
              <Text style={styles.pinButtonText}>Submit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setShowPinDialog(false);
                setPin('');
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <PanGestureHandler
            onGestureEvent={handleGestureEvent}
            onHandlerStateChange={handleStateChange}
          >
            <View style={styles.timeDisplay}>
              <TouchableOpacity activeOpacity={1} onPress={showTimer}>
                <Animated.Text
                  style={[styles.timeText, { opacity: timerOpacity }]}
                >
                  {formatTime(timeLeft)}
                </Animated.Text>
              </TouchableOpacity>
              <View
                style={[
                  styles.swipeIndicator,
                  { transform: [{ translateY: swipePosition }] },
                ]}
              >
                <ChevronUp size={24} color={Colors.personal.accent} />
                <Text style={styles.escapeHint}>Swipe up to unlock</Text>
              </View>
            </View>
          </PanGestureHandler>
        )}
      </View>
    );
  }

  const handleInsightsPress = () => {
    if (isPremium) {
      setShowInsights(true);
    } else {
      setShowPremiumModal(true);
    }
  };

  const renderInsights = () => {
    if (!showInsights) return null;

    const completedSessions = sessionHistory.filter((s) => s.completed).length;
    const totalMinutes = sessionHistory.reduce((acc, session) => {
      return session.completed ? acc + session.duration : acc;
    }, 0);

    return (
      <View style={styles.insightsOverlay}>
        <ScrollView>
          <View style={styles.insightsContainer}>
            <Text style={styles.insightsHeader}>Focus Insights</Text>
            <View style={styles.insightCard}>
              <View style={styles.insightIconContainer}>
                <BarChart size={24} color={Colors.personal.accent} />
              </View>
              <View>
                <Text style={styles.insightLabel}>Sessions Completed</Text>
                <Text style={styles.insightValue}>
                  {completedSessions} of {sessionHistory.length}
                </Text>
              </View>
            </View>
            <View style={styles.insightCard}>
              <View style={styles.insightIconContainer}>
                <BarChart size={24} color={Colors.personal.accent} />
              </View>
              <View>
                <Text style={styles.insightLabel}>Completion Rate</Text>
                <Text style={styles.insightValue}>
                  {sessionHistory.length > 0
                    ? Math.round(
                        (completedSessions / sessionHistory.length) * 100
                      ) + '%'
                    : 'N/A'}
                </Text>
              </View>
            </View>
            <Text style={styles.sessionHistoryTitle}>Recent Sessions</Text>
            {sessionHistory.length > 0 ? (
              sessionHistory.map((session, index) => {
                const date = new Date(session.date);
                const formattedDate = `${date.toLocaleDateString()} at ${date.toLocaleTimeString(
                  [],
                  { hour: '2-digit', minute: '2-digit' }
                )}`;

                return (
                  <View key={index} style={styles.sessionItem}>
                    <View
                      style={[
                        styles.sessionStatus,
                        {
                          backgroundColor: session.completed
                            ? Colors.common.success
                            : Colors.common.error,
                        },
                      ]}
                    />
                    <View>
                      <Text style={styles.sessionDate}>{formattedDate}</Text>
                      <Text style={styles.sessionDuration}>
                        {session.duration} min{' '}
                        {session.completed ? 'completed' : 'interrupted'}
                      </Text>
                    </View>
                  </View>
                );
              })
            ) : (
              <Text style={styles.noSessionsText}>No session history yet</Text>
            )}
          </View>
        </ScrollView>
      </View>
    );
  };

  return (
    <LinearGradient
      colors={[Colors.personal.background, Colors.personal.surface]}
      style={styles.container}
    >
      {renderInsights()}
      <PremiumModal
        visible={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        featureName="Focus Insights & Analytics"
      />
      {/* Set PIN Dialog */}
      {showSetPin && (
        <View
          style={[
            styles.pinContainer,
            {
              position: 'absolute',
              top: '30%',
              alignSelf: 'center',
              zIndex: 10,
            },
          ]}
        >
          <Text style={styles.pinTitle}>Set Parental PIN</Text>
          <TextInput
            style={styles.pinInput}
            value={newPin}
            onChangeText={setNewPin}
            keyboardType="numeric"
            secureTextEntry
            maxLength={4}
            placeholder="Enter 4-digit PIN"
            placeholderTextColor={Colors.personal.textSecondary}
          />
          <TextInput
            style={styles.pinInput}
            value={confirmPin}
            onChangeText={setConfirmPin}
            keyboardType="numeric"
            secureTextEntry
            maxLength={4}
            placeholder="Confirm PIN"
            placeholderTextColor={Colors.personal.textSecondary}
          />
          {pinSetError ? (
            <Text style={{ color: 'red', marginBottom: 8 }}>{pinSetError}</Text>
          ) : null}
          <TouchableOpacity style={styles.pinButton} onPress={handleSetPin}>
            <Text style={styles.pinButtonText}>Set PIN</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              setShowSetPin(false);
              setPinSetError('');
            }}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.content}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Focus Mode</Text>
          <TouchableOpacity
            style={styles.insightsButton}
            onPress={handleInsightsPress}
          >
            <BarChart
              size={20}
              color={
                isPremium
                  ? Colors.personal.accent
                  : Colors.personal.textSecondary
              }
            />
            <Text
              style={[
                styles.insightsButtonText,
                {
                  color: isPremium
                    ? Colors.personal.accent
                    : Colors.personal.textSecondary,
                },
              ]}
            >
              Insights
            </Text>
          </TouchableOpacity>
        </View>
        {/* Set PIN Button (only show when not in session) */}
        {!isActive && (
          <TouchableOpacity
            style={[styles.pinButton, { marginBottom: 16 }]}
            onPress={() => setShowSetPin(true)}
          >
            <Text style={styles.pinButtonText}>Set Parental PIN</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.subtitle}>Choose your focus duration</Text>

        <View style={styles.durationContainer}>
          {durations.map((duration) => (
            <TouchableOpacity
              key={duration}
              style={[
                styles.durationButton,
                selectedDuration === duration && styles.selectedDuration,
              ]}
              onPress={() => {
                setSelectedDuration(duration);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text
                style={[
                  styles.durationText,
                  selectedDuration === duration && styles.selectedDurationText,
                ]}
              >
                {duration}m
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.startButton} onPress={startSession}>
          <Play size={24} color={Colors.personal.background} />
          <Text style={styles.startButtonText}>Start Session</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  customDurationInput: {
    borderWidth: 1,
    borderColor: Colors.personal.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: Colors.personal.text,
    marginLeft: 8,
    minWidth: 80,
    backgroundColor: Colors.personal.surface,
  },
  insightsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  insightsContainer: {
    backgroundColor: Colors.personal.surface,
    borderRadius: 16,
    width: '100%',
    maxHeight: '80%',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  insightsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.personal.border,
    paddingBottom: 12,
  },
  insightsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.personal.text,
  },
  closeButton: {
    fontSize: 28,
    color: Colors.personal.textSecondary,
    fontWeight: 'bold',
  },
  insightsContent: {
    flex: 1,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.personal.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  insightIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  insightLabel: {
    fontSize: 14,
    color: Colors.personal.textSecondary,
    marginBottom: 4,
  },
  insightValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.personal.text,
  },
  sessionHistoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.personal.text,
    marginTop: 16,
    marginBottom: 12,
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.personal.border,
  },
  sessionStatus: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  sessionDate: {
    fontSize: 14,
    color: Colors.personal.text,
  },
  sessionDuration: {
    fontSize: 12,
    color: Colors.personal.textSecondary,
    marginTop: 2,
  },
  noSessionsText: {
    fontSize: 16,
    color: Colors.personal.textSecondary,
    textAlign: 'center',
    marginTop: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  insightsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  insightsButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  notificationBadge: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: Colors.personal.accent,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    zIndex: 10,
  },
  notificationText: {
    color: Colors.personal.background,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  container: {
    flex: 1,
  },
  activeContainer: {
    flex: 1,
    backgroundColor: Colors.personal.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '300',
    color: Colors.personal.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.personal.textSecondary,
    marginBottom: 48,
  },
  durationContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 48,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  durationButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: Colors.personal.surface,
    borderWidth: 1,
    borderColor: Colors.personal.border,
  },
  selectedDuration: {
    backgroundColor: Colors.personal.accent,
    borderColor: Colors.personal.accent,
  },
  durationText: {
    fontSize: 18,
    color: Colors.personal.text,
    fontWeight: '500',
  },
  selectedDurationText: {
    color: Colors.personal.background,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.personal.accent,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 8,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.personal.background,
  },
  timeDisplay: {
    alignItems: 'center',
  },
  timeText: {
    fontSize: 72,
    fontWeight: '200',
    color: Colors.personal.text,
    marginBottom: 32,
  },
  escapeHint: {
    fontSize: 16,
    color: Colors.personal.textSecondary,
    opacity: 0.6,
    marginTop: 8,
  },
  swipeIndicator: {
    position: 'absolute',
    bottom: height * 0.1,
    alignItems: 'center',
    width: '100%',
  },
  pinContainer: {
    backgroundColor: Colors.personal.surface,
    padding: 24,
    borderRadius: 16,
    width: '80%',
    alignItems: 'center',
  },
  pinTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.personal.text,
    marginBottom: 24,
  },
  pinInput: {
    backgroundColor: Colors.personal.background,
    width: '100%',
    padding: 16,
    borderRadius: 8,
    fontSize: 18,
    color: Colors.personal.text,
    textAlign: 'center',
    letterSpacing: 8,
    marginBottom: 24,
  },
  pinButton: {
    backgroundColor: Colors.personal.accent,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  pinButtonText: {
    color: Colors.personal.background,
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: Colors.personal.accent,
    fontSize: 16,
    fontWeight: '600',
  },
});
