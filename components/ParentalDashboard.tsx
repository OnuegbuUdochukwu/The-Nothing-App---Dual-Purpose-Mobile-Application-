import * as React from 'react';
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { BarChart2, Calendar, Clock, X } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useSubscription } from '@/hooks/useSubscription';
import PremiumModal from './PremiumModal';
import AsyncStorage from '@react-native-async-storage/async-storage';

type SessionData = {
  date: string;
  duration: number;
  mode: string;
};

type ParentalDashboardProps = {
  visible: boolean;
  onClose: () => void;
};

export default function ParentalDashboard({ visible, onClose }: ParentalDashboardProps) {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [totalTime, setTotalTime] = useState(0);
  const [averageTime, setAverageTime] = useState(0);
  const { isPremium } = useSubscription();

  useEffect(() => {
    if (visible) {
      loadSessions();
    }
  }, [visible]);

  const loadSessions = async () => {
    try {
      const sessionsData = await AsyncStorage.getItem('babySessionHistory');
      if (sessionsData) {
        const parsedSessions = JSON.parse(sessionsData) as SessionData[];
        setSessions(parsedSessions);
        
        // Calculate stats
        const total = parsedSessions.reduce((sum, session) => sum + session.duration, 0);
        setTotalTime(total);
        setAverageTime(parsedSessions.length > 0 ? total / parsedSessions.length : 0);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins}m`;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!visible) return null;

  if (!isPremium) {
    return (
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Parental Dashboard</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color={Colors.baby.blue} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.premiumPrompt}>
            <BarChart2 size={48} color={Colors.baby.blue} />
            <Text style={styles.premiumText}>Unlock the Parental Dashboard</Text>
            <Text style={styles.premiumSubtext}>
              Track your baby's screen time, view session history, and get insights with our premium features.
            </Text>
            <TouchableOpacity 
              style={styles.upgradeButton}
              onPress={() => setShowPremiumModal(true)}
            >
              <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
            </TouchableOpacity>
          </View>
          
          <PremiumModal 
            visible={showPremiumModal} 
            onClose={() => setShowPremiumModal(false)}
            featureName="Parental Dashboard"
          />
        </View>
      </View>
    );
  }

  return React.createElement(
    View, { style: styles.overlay },
    React.createElement(
      View, { style: styles.container },
      React.createElement(
        View, { style: styles.header },
        React.createElement(Text, { style: styles.title }, "Parental Dashboard"),
        React.createElement(
          TouchableOpacity, { style: styles.closeButton, onPress: onClose },
          React.createElement(X, { size: 24, color: Colors.baby.blue })
        )
      ),
      
      React.createElement(
        View, { style: styles.statsContainer },
        React.createElement(
          View, { style: styles.statCard },
          React.createElement(Clock, { size: 20, color: Colors.baby.blue }),
          React.createElement(Text, { style: styles.statValue }, formatTime(totalTime)),
          React.createElement(Text, { style: styles.statLabel }, "Total Screen Time")
        ),
        
        React.createElement(
          View, { style: styles.statCard },
          React.createElement(Calendar, { size: 20, color: Colors.baby.blue }),
          React.createElement(Text, { style: styles.statValue }, sessions.length),
          React.createElement(Text, { style: styles.statLabel }, "Total Sessions")
        ),
        
        React.createElement(
          View, { style: styles.statCard },
          React.createElement(BarChart2, { size: 20, color: Colors.baby.blue }),
          React.createElement(Text, { style: styles.statValue }, formatTime(averageTime)),
          React.createElement(Text, { style: styles.statLabel }, "Avg. Session")
        )
      ),
      
      React.createElement(Text, { style: styles.sectionTitle }, "Recent Sessions"),
      
      React.createElement(
        ScrollView, { style: styles.sessionsList },
        sessions.length > 0 ?
          sessions.map((session, index) => 
            React.createElement(
              View, { key: index, style: styles.sessionItem },
              React.createElement(
                View, { style: styles.sessionInfo },
                React.createElement(Text, { style: styles.sessionDate }, formatDate(session.date)),
                React.createElement(Text, { style: styles.sessionDuration }, formatTime(session.duration))
              )
            )
          ) :
          React.createElement(Text, { style: styles.emptyText }, "No sessions recorded yet")
      )
    )
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: Colors.common.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.baby.blue,
  },
  closeButton: {
    padding: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.baby.surface,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.baby.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.baby.textSecondary,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.baby.text,
    marginBottom: 12,
  },
  sessionsList: {
    maxHeight: 300,
  },
  sessionItem: {
    backgroundColor: Colors.baby.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  sessionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionDate: {
    fontSize: 14,
    color: Colors.baby.text,
  },
  sessionDuration: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.baby.blue,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.baby.textSecondary,
    padding: 20,
  },
  premiumPrompt: {
    alignItems: 'center',
    padding: 20,
  },
  premiumText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.baby.text,
    marginTop: 16,
    marginBottom: 8,
  },
  premiumSubtext: {
    fontSize: 14,
    color: Colors.baby.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  upgradeButton: {
    backgroundColor: Colors.baby.blue,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  upgradeButtonText: {
    color: Colors.common.white,
    fontWeight: '600',
    fontSize: 16,
  },
});