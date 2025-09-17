import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

jest.mock('@/hooks/useSubscription', () => ({
  useSubscription: () => ({ isPremium: false }),
}));

import CalmingSounds from '@/components/CalmingSounds';

describe('CalmingSounds', () => {
  test('shows PRO badge for premium sounds when not premium', () => {
    const { getAllByText } = render(React.createElement(CalmingSounds));
    const badges = getAllByText('PRO');
    expect(badges.length).toBeGreaterThanOrEqual(1);
  });

  test('pressing premium sound opens premium modal when not premium', () => {
    const { getByText, queryByText } = render(
      React.createElement(CalmingSounds)
    );
    const ocean = getByText('Ocean Waves');
    fireEvent.press(ocean);
    expect(queryByText('Premium Calming Sounds')).toBeTruthy();
  });
});
