import AsyncStorage from '@react-native-async-storage/async-storage';

const GALLERY_KEY = 'doodleGallery_v1';

export interface DoodleEntry {
  id: string;
  pngUri: string;
  thumbnailUri?: string;
  createdAt: string;
}

export async function listDoodles(): Promise<DoodleEntry[]> {
  const raw = await AsyncStorage.getItem(GALLERY_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as DoodleEntry[];
  } catch (e) {
    console.warn('Failed to parse doodle gallery data', e);
    return [];
  }
}

export async function saveDoodle(entry: DoodleEntry) {
  const items = await listDoodles();
  const updated = [entry, ...items];
  await AsyncStorage.setItem(GALLERY_KEY, JSON.stringify(updated));
  return entry;
}

export async function deleteDoodle(id: string) {
  const items = await listDoodles();
  const updated = items.filter((i) => i.id !== id);
  await AsyncStorage.setItem(GALLERY_KEY, JSON.stringify(updated));
  return updated;
}

export async function clearGallery() {
  await AsyncStorage.removeItem(GALLERY_KEY);
}
