import {
  strokesToSVG,
  saveSVGToFile,
  saveToGallery,
  shareFile,
} from '@/utils/doodleExport';

jest.mock('expo-file-system', () => ({
  cacheDirectory: '/tmp/',
  documentDirectory: '/tmp/doc/',
  writeAsStringAsync: jest.fn().mockResolvedValue(null),
  EncodingType: { UTF8: 'utf8' },
}));

jest.mock('expo-media-library', () => ({
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  createAssetAsync: jest.fn().mockResolvedValue({ id: 'asset1' }),
  createAlbumAsync: jest.fn().mockResolvedValue(true),
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(true),
  shareAsync: jest.fn().mockResolvedValue(null),
}));

describe('doodleExport', () => {
  test('strokesToSVG produces valid SVG with path data', () => {
    const strokes = [
      {
        id: 's1',
        points: [
          { x: 10.1, y: 20.7 },
          { x: 15.2, y: 25.9 },
        ],
        color: '#000',
        width: 2,
      },
    ];
    const svg = strokesToSVG(strokes, 200, 200);
    expect(svg).toContain('<svg');
    expect(svg).toContain('M 10 21 L 15 26');
    expect(svg).toContain('stroke="#000"');
  });

  test('saveSVGToFile writes to expo file system and returns uri', async () => {
    const uri = await saveSVGToFile('<svg></svg>', 'test.svg');
    expect(uri).toContain('test.svg');
  });

  test('saveToGallery requests permission and creates asset', async () => {
    const asset = await saveToGallery('/tmp/test.svg');
    expect((asset as any).id).toBe('asset1');
  });

  test('shareFile uses expo-sharing', async () => {
    await shareFile('/tmp/test.svg');
    const Sharing = require('expo-sharing');
    expect(Sharing.shareAsync).toHaveBeenCalledWith('/tmp/test.svg');
  });

  test('saveToGallery throws when permission denied', async () => {
    const MediaLibrary = require('expo-media-library');
    (MediaLibrary.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: 'denied',
    });
    await expect(saveToGallery('/tmp/x')).rejects.toThrow(
      'Media library permission not granted'
    );
  });

  test('shareFile throws when not available', async () => {
    const Sharing = require('expo-sharing');
    (Sharing.isAvailableAsync as jest.Mock).mockResolvedValueOnce(false);
    await expect(shareFile('/tmp/x')).rejects.toThrow(
      'Sharing is not available on this platform'
    );
  });
});
