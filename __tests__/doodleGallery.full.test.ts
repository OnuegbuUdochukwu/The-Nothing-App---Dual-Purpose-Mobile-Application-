import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  listDoodles,
  saveDoodle,
  deleteDoodle,
  clearGallery,
  DoodleEntry,
} from '@/utils/doodleGallery';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

const sampleEntry: DoodleEntry = {
  id: '123',
  pngUri: 'file:///tmp/doodle.png',
  thumbnailUri: 'file:///tmp/thumb.png',
  createdAt: new Date().toISOString(),
};

describe('doodleGallery utils', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('listDoodles returns empty array when no data', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
    const list = await listDoodles();
    expect(list).toEqual([]);
    expect(AsyncStorage.getItem).toHaveBeenCalledWith('doodleGallery_v1');
  });

  test('listDoodles handles malformed data gracefully', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('not-json');
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const list = await listDoodles();
    expect(list).toEqual([]);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  test('saveDoodle appends and persists new entry', async () => {
    (AsyncStorage.getItem as jest.Mock)
      .mockResolvedValueOnce(null) // initial list
      .mockResolvedValueOnce(JSON.stringify([sampleEntry]));

    // save first entry when none existed
    (AsyncStorage.setItem as jest.Mock).mockResolvedValueOnce(null);
    const ret = await saveDoodle(sampleEntry);
    expect(ret).toEqual(sampleEntry);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'doodleGallery_v1',
      JSON.stringify([sampleEntry])
    );
  });

  test('deleteDoodle removes item by id', async () => {
    const a = {
      id: 'a',
      pngUri: 'file:///tmp/a.png',
      thumbnailUri: 'file:///tmp/ta.png',
      createdAt: new Date().toISOString(),
    };
    const b = {
      id: 'b',
      pngUri: 'file:///tmp/b.png',
      thumbnailUri: 'file:///tmp/tb.png',
      createdAt: new Date().toISOString(),
    };
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
      JSON.stringify([a, b])
    );
    (AsyncStorage.setItem as jest.Mock).mockResolvedValueOnce(null);

    const updated = await deleteDoodle('a');
    expect(updated).toEqual([b]);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'doodleGallery_v1',
      JSON.stringify([b])
    );
  });

  test('clearGallery removes storage key', async () => {
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValueOnce(null);
    await clearGallery();
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('doodleGallery_v1');
  });
});
