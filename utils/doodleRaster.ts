import { captureRef } from 'react-native-view-shot';

/**
 * Capture a view ref (the drawing canvas) and write a PNG to the cache directory.
 * Returns the file URI of the PNG.
 */
export async function captureCanvasAsPNG(
  ref: any,
  filename = `doodle-${Date.now()}.png`,
  options?: { width?: number; height?: number; quality?: number }
) {
  if (!ref) throw new Error('No ref provided to captureCanvasAsPNG');

  let FileSystem: any;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    FileSystem = require('expo-file-system');
  } catch (e) {
    throw new Error(
      'expo-file-system is required to save PNG files. Install it in the project.'
    );
  }

  const result = await captureRef(ref, {
    format: 'png',
    quality: (options && options.quality) || 1,
    result: 'tmpfile',
    width: options?.width,
    height: options?.height,
  });

  // captureRef returns a local file path; move it into a deterministic cache directory location
  const dir =
    FileSystem.cacheDirectory ||
    FileSystem.documentDirectory ||
    `${FileSystem.cacheDirectory}`;
  const dest = `${dir}${filename}`;
  await FileSystem.moveAsync({ from: result, to: dest }).catch(async () => {
    // If move fails (some platforms return content:// style URIs), try copy
    try {
      await FileSystem.copyAsync({ from: result, to: dest });
    } catch (err) {
      // As a last resort return the original result path
      return result;
    }
  });

  return dest;
}
