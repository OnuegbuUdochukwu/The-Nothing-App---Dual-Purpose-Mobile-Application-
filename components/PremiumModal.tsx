import * as React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAppMode } from '@/hooks/useAppMode';
import { Colors } from '@/constants/Colors';
import { useSubscription } from '@/hooks/useSubscription';
import { Crown } from 'lucide-react-native';

type PremiumModalProps = {
  visible: boolean;
  onClose: () => void;
  featureName?: string;
};

export default function PremiumModal({ visible, onClose, featureName }: PremiumModalProps) {
  const { mode } = useAppMode();
  const { setPremiumStatus } = useSubscription();
  
  const themeColors = mode === 'personal' ? Colors.personal : Colors.baby;
  
  const handleUpgrade = async () => {
    // In a real app, this would trigger the payment flow
    // For demo purposes, we'll just set the premium status to true
    await setPremiumStatus(true);
    onClose();
  };

  return React.createElement(
    Modal,
    {
      visible: visible,
      transparent: true,
      animationType: "fade",
      onRequestClose: onClose
    },
    React.createElement(
      View, 
      { style: styles.overlay },
      React.createElement(
        View, 
        { style: [styles.container, { backgroundColor: themeColors.surface }] },
        React.createElement(
          View, 
          { style: styles.header },
          React.createElement(Crown, { size: 40, color: Colors.common.gold }),
          React.createElement(Text, { style: [styles.title, { color: themeColors.text }] }, "Premium Feature")
        ),
        
        featureName && React.createElement(
          Text, 
          { style: [styles.featureName, { color: themeColors.textSecondary }] },
          featureName
        ),
        
        React.createElement(
          ScrollView, 
          { style: styles.content },
          React.createElement(
            Text, 
            { style: [styles.description, { color: themeColors.text }] },
            "Unlock all premium features and enhance your experience with The Nothing App Premium:"
          ),
          
          React.createElement(
            View, 
            { style: styles.featureList },
            React.createElement(FeatureItem, { text: "Wellness Insights Dashboard", color: themeColors.text }),
            React.createElement(FeatureItem, { text: "Advanced Focus Analytics", color: themeColors.text }),
            React.createElement(FeatureItem, { text: "Calming Sounds for Baby Mode", color: themeColors.text }),
            React.createElement(FeatureItem, { text: "Parental Dashboard", color: themeColors.text }),
            React.createElement(FeatureItem, { text: "Ad-free Experience", color: themeColors.text })
          ),
          
          React.createElement(
            View, 
            { style: styles.buttonContainer },
            React.createElement(
              TouchableOpacity, 
              { 
                style: [styles.button, styles.upgradeButton, { backgroundColor: themeColors.accent }],
                onPress: handleUpgrade
              },
              React.createElement(Text, { style: styles.upgradeButtonText }, "Upgrade Now")
            ),
            
            React.createElement(
              TouchableOpacity, 
              { 
                style: [styles.button, styles.cancelButton],
                onPress: onClose
              },
              React.createElement(Text, { style: [styles.cancelButtonText, { color: themeColors.textSecondary }] }, "Maybe Later")
            )
          )
        )
      )
    )
  );
}

function FeatureItem({ text, color }: { text: string; color: string }) {
  return React.createElement(
    View, 
    { style: styles.featureItem },
    React.createElement(View, { style: styles.bullet }),
    React.createElement(Text, { style: [styles.featureText, { color }] }, text)
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  featureName: {
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
  },
  content: {
    width: '100%',
    maxHeight: 300,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  featureList: {
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.common.gold,
    marginRight: 8,
  },
  featureText: {
    fontSize: 16,
    flex: 1,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 16,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  upgradeButton: {
    width: '100%',
  },
  upgradeButtonText: {
    color: Colors.common.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: 'transparent',
  },
  cancelButtonText: {
    fontSize: 16,
  },
});