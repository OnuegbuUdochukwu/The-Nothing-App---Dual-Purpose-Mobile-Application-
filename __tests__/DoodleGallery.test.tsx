import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';

jest.mock('@/utils/doodleGallery', () => ({
  listDoodles: jest.fn(),
  deleteDoodle: jest.fn(),
}));

jest.mock('@/utils/doodleExport', () => ({
  shareFile: jest.fn(),
}));

import DoodleGallery from '@/components/DoodleGallery';
import { listDoodles } from '@/utils/doodleGallery';

describe('DoodleGallery', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('shows empty state when there are no doodles', async () => {
    (listDoodles as jest.Mock).mockResolvedValue([]);
    const onClose = jest.fn();
    const { getByText } = render(
      <DoodleGallery visible={true} onRequestClose={onClose} />
    );

    await waitFor(() =>
      expect(getByText('No saved doodles yet.')).toBeTruthy()
    );
  });

  it('renders items when listDoodles returns items', async () => {
    const fake = [
      {
        id: '1',
        pngUri: 'file://a.png',
        thumbnailUri: 'file://a-thumb.png',
        createdAt: new Date().toISOString(),
      },
    ];
    (listDoodles as jest.Mock).mockResolvedValue(fake);
    const onClose = jest.fn();
    const { getByText, getByRole } = render(
      <DoodleGallery visible={true} onRequestClose={onClose} />
    );

    await waitFor(() => expect(getByText(/Your Doodles/)).toBeTruthy());
    expect(getByText(/Share/)).toBeTruthy();
  });
});
