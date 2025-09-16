/**
 * Generate a thumbnail for a PNG file using expo-image-manipulator.
 * Returns the thumbnail URI. Uses lazy-requires to avoid hard failures in test env.
 */
export async function generateThumbnail(
  sourceUri: string,
  width = 200,
  height = 200
) {
  if (!sourceUri) throw new Error('sourceUri required for generateThumbnail');

  let ImageManipulator: any;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    ImageManipulator = require('expo-image-manipulator');
  } catch (e) {
    // If the native dependency isn't available (e.g., in tests), just return the source
    console.warn(
      'expo-image-manipulator not available; returning source as thumbnail',
      e
    );
    return sourceUri;
  }

  let FileSystem: any;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    FileSystem = require('expo-file-system');
  } catch (e) {
    console.warn(
      'expo-file-system not available; returning source as thumbnail',
      e
    );
    return sourceUri;
  }

  const manipResult = await ImageManipulator.manipulateAsync(
    sourceUri,
    [{ resize: { width, height } }],
    { compress: 0.8, format: ImageManipulator.SaveFormat.PNG }
  );

  // Move/copy thumbnail into cache with a predictable name
  const dest = `${FileSystem.cacheDirectory}thumb-${Date.now()}.png`;
  try {
    await FileSystem.moveAsync({ from: manipResult.uri, to: dest });
    return dest;
  } catch (err) {
    try {
      await FileSystem.copyAsync({ from: manipResult.uri, to: dest });
      return dest;
    } catch (err2) {
      console.warn(
        'Failed to move/copy thumbnail, returning manipulator uri',
        err2
      );
      return manipResult.uri;
    }
  }
}
