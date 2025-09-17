import React from 'react';
import { render, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

const {
  SubscriptionProvider,
  useSubscription,
} = require('@/hooks/useSubscription');
const { useAppMode } = require('@/hooks/useAppMode');
const { useFrameworkReady } = require('@/hooks/useFrameworkReady');

describe('hooks', () => {
  beforeEach(() => jest.resetAllMocks());

  test('useSubscription throws if used outside provider', () => {
    const Comp = () => {
      const sub = useSubscription();
      return null;
    };
    // Rendering without provider should throw
    expect(() => render(React.createElement(Comp))).toThrow();
  });

  test('SubscriptionProvider provides default values and setPremiumStatus works', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
    let setter: any;
    const Consumer = () => {
      const { isPremium, setPremiumStatus } = useSubscription();
      setter = setPremiumStatus;
      return React.createElement('Text', null, String(isPremium));
    };

    const tree = render(
      React.createElement(
        SubscriptionProvider,
        null,
        React.createElement(Consumer)
      )
    );

    await act(async () => {
      await setter(true);
    });

    expect(AsyncStorage.setItem).toHaveBeenCalled();
    tree.unmount();
  });

  test('useAppMode loads and saves mode via AsyncStorage', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('personal');
    let saveFn: any;
    const Comp = () => {
      const { mode, saveMode, isLoading } = useAppMode();
      saveFn = saveMode;
      return React.createElement('Text', null, String(mode));
    };

    const tree = render(React.createElement(Comp));

    await act(async () => {
      await saveFn('baby');
    });

    expect(AsyncStorage.getItem).toHaveBeenCalled();
    expect(AsyncStorage.setItem).toHaveBeenCalled();
    tree.unmount();
  });

  test('useFrameworkReady calls window.frameworkReady if present', () => {
    const called = { v: false };
    (global as any).window = { frameworkReady: () => (called.v = true) };
    const Comp = () => {
      useFrameworkReady();
      return null;
    };
    render(React.createElement(Comp));
    expect(called.v).toBe(true);
  });
});
