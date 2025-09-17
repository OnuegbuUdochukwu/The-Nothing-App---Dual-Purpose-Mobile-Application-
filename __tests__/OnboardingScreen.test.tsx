import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import OnboardingScreen from '@/components/OnboardingScreen';

describe('OnboardingScreen', () => {
  test('calls onModeSelect with personal when personal card pressed', () => {
    const onModeSelect = jest.fn();
    const { getByText } = render(
      React.createElement(OnboardingScreen, { onModeSelect })
    );
    const personal = getByText('Personal Mode');
    fireEvent.press(personal);
    expect(onModeSelect).toHaveBeenCalledWith('personal');
  });

  test('calls onModeSelect with baby when baby card pressed', () => {
    const onModeSelect = jest.fn();
    const { getByText } = render(
      React.createElement(OnboardingScreen, { onModeSelect })
    );
    const baby = getByText('Baby Mode');
    fireEvent.press(baby);
    expect(onModeSelect).toHaveBeenCalledWith('baby');
  });
});
