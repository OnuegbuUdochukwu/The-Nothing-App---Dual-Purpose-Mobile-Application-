jest.mock('@react-native-async-storage/async-storage', () => {
  let store: Record<string, string> = {};
  return {
    __esModule: true,
    default: {
      getItem: async (key: string) => store[key] ?? null,
      setItem: async (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: async (key: string) => {
        delete store[key];
      },
      clear: async () => {
        store = {};
      },
    },
  };
});

import {
  saveDoodle,
  listDoodles,
  deleteDoodle,
  clearGallery,
} from '@/utils/doodleGallery';

beforeEach(async () => {
  await clearGallery();
});

test('saveDoodle and listDoodles', async () => {
  const entry = {
    id: 'a',
    pngUri: 'file:///tmp/a.png',
    thumbnailUri: 'file:///tmp/a-thumb.png',
    createdAt: new Date().toISOString(),
  };
  await saveDoodle(entry as any);
  const items = await listDoodles();
  expect(items.length).toBe(1);
  expect(items[0].id).toBe('a');
});

test('deleteDoodle removes an item', async () => {
  const e1 = {
    id: 'a',
    pngUri: 'file:///tmp/a.png',
    createdAt: new Date().toISOString(),
  };
  const e2 = {
    id: 'b',
    pngUri: 'file:///tmp/b.png',
    createdAt: new Date().toISOString(),
  };
  await saveDoodle(e1 as any);
  await saveDoodle(e2 as any);
  let items = await listDoodles();
  expect(items.length).toBe(2);
  await deleteDoodle('a');
  items = await listDoodles();
  expect(items.find((i) => i.id === 'a')).toBeUndefined();
  expect(items.length).toBe(1);
});

test('clearGallery removes all items', async () => {
  const e1 = {
    id: 'a',
    pngUri: 'file:///tmp/a.png',
    createdAt: new Date().toISOString(),
  };
  await saveDoodle(e1 as any);
  let items = await listDoodles();
  expect(items.length).toBe(1);
  await clearGallery();
  items = await listDoodles();
  expect(items.length).toBe(0);
});
