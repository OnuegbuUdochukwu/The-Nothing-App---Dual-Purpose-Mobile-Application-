jest.resetModules();

jest.mock('react-native-view-shot', () => ({
  captureRef: jest.fn().mockResolvedValue('/tmp/captured.png'),
}));

jest.mock('expo-file-system', () => ({
  cacheDirectory: '/tmp/',
  documentDirectory: '/tmp/doc/',
  moveAsync: jest.fn().mockResolvedValue(null),
  copyAsync: jest.fn().mockResolvedValue(null),
  writeAsStringAsync: jest.fn().mockResolvedValue(null),
  EncodingType: { UTF8: 'utf8' },
}));

describe('doodleRaster', () => {
  test('captureCanvasAsPNG throws when no ref provided', async () => {
    const { captureCanvasAsPNG } = require('@/utils/doodleRaster');
    await expect(captureCanvasAsPNG(null as any)).rejects.toThrow(
      'No ref provided'
    );
  });

  test('captureCanvasAsPNG moves captured file into cache', async () => {
    const { captureCanvasAsPNG } = require('@/utils/doodleRaster');
    const fakeRef = {};
    const dest = await captureCanvasAsPNG(fakeRef, 'out.png');
    expect(dest).toContain('out.png');
    const FileSystem = require('expo-file-system');
    expect(FileSystem.moveAsync).toHaveBeenCalled();
  });

  test('rasterizeSVGToPNG instructs caller to use UI converter when WebView is present', async () => {
    // Mock react-native-webview so the function proceeds to final message
    jest.resetModules();
    jest.mock('react-native-webview', () => ({ WebView: {} }));
    const { rasterizeSVGToPNG } = require('@/utils/doodleRaster');
    await expect(rasterizeSVGToPNG('<svg></svg>')).rejects.toThrow(
      'rasterizeSVGToPNG is a UI-bound helper'
    );
  });
});
