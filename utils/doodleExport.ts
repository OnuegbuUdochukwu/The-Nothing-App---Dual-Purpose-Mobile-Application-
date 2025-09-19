import { DoodleStroke } from '@/types';

/**
 * Convert an array of strokes to an SVG string.
 * Simple polyline-based paths. This is deterministic and easy to test.
 */
export function strokesToSVG(
  strokes: DoodleStroke[],
  width = 1080,
  height = 1080
) {
  const header = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">\n`;

  const body = strokes
    .map((stroke) => {
      if (!stroke.points || stroke.points.length === 0) return '';
      const d = stroke.points
        .map(
          (p, i) =>
            `${i === 0 ? 'M' : 'L'} ${Math.round(p.x)} ${Math.round(p.y)}`
        )
        .join(' ');
      return `<path d="${d}" stroke="${stroke.color}" stroke-width="${stroke.width}" stroke-linecap="round" stroke-linejoin="round" fill="none" />\n`;
    })
    .join('');

  const footer = '</svg>\n';
  return header + body + footer;
}

export async function saveSVGToFile(
  svgString: string,
  filename = `doodle-${Date.now()}.svg`
) {
  // Lazy-require expo-file-system to avoid hard dependency during static analysis
  let FileSystem: any;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    FileSystem = require('expo-file-system');
  } catch {
    throw new Error(
      'expo-file-system is required to save files. Install it in the project.'
    );
  }

  const dir =
    FileSystem.cacheDirectory ||
    FileSystem.documentDirectory ||
    `${FileSystem.cacheDirectory}`;
  const fileUri = `${dir}${filename}`;
  await FileSystem.writeAsStringAsync(fileUri, svgString, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  return fileUri;
}

export async function saveToGallery(fileUri: string) {
  // Lazy-require expo-media-library to avoid hard dependency during static analysis
  let MediaLibrary: any;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    MediaLibrary = require('expo-media-library');
  } catch {
    throw new Error(
      'expo-media-library is required to save to gallery. Install it in the project.'
    );
  }

  // Request permission if needed
  const { status } = await MediaLibrary.requestPermissionsAsync();
  if (status !== 'granted')
    throw new Error('Media library permission not granted');

  const asset = await MediaLibrary.createAssetAsync(fileUri);
  await MediaLibrary.createAlbumAsync('TheNothingApp', asset, false).catch(
    () => null
  );
  return asset;
}

export async function shareFile(fileUri: string) {
  let Sharing: any;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    Sharing = require('expo-sharing');
  } catch {
    throw new Error(
      'expo-sharing is required to share files. Install it in the project.'
    );
  }

  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Sharing is not available on this platform');
  }
  await Sharing.shareAsync(fileUri);
}
