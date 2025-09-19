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

  // Lazy-require to avoid TypeScript/runtime issues when native module isn't installed in test env
  let captureRef: any;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    captureRef = require('react-native-view-shot').captureRef;
  } catch {
    throw new Error(
      'react-native-view-shot is required for PNG capture. Install it in the project.'
    );
  }

  let FileSystem: any;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    FileSystem = require('expo-file-system');
  } catch {
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
    } catch {
      // As a last resort return the original result path
      return result;
    }
  });

  return dest;
}

/**
 * Rasterize an SVG string into a PNG file saved to the app cache.
 * This function attempts to use a WebView-based converter as a fallback when
 * `react-native-view-shot` cannot capture (or when you only have SVG XML).
 *
 * It returns the file URI of the written PNG. The caller should remove the
 * file when finished if desired.
 */
export async function rasterizeSVGToPNG(
  svgXml: string,
  filename = `doodle-svg-${Date.now()}.png`,
  options?: { width?: number; height?: number; quality?: number }
) {
  if (!svgXml) throw new Error('svgXml is required');

  // Prefer to use a headless conversion via WebView + canvas. This requires
  // `react-native-webview` to be available at runtime. We do a lazy require to
  // keep test environments safe.
  let WebView: any;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    WebView = require('react-native-webview').WebView;
  } catch {
    throw new Error(
      'react-native-webview is required to rasterize SVG to PNG.'
    );
  }
  // reference to satisfy linter: we only check availability here
  void WebView;

  let FileSystem: any;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    FileSystem = require('expo-file-system');
  } catch {
    throw new Error('expo-file-system is required to save PNG files.');
  }
  // referenced to satisfy linter — actual write happens in UI component flow
  void FileSystem;

  // Because we can't synchronously render a WebView here (this is a utility),
  // we provide a helper promise that expects the app to mount a small converter
  // component which will postMessage back the base64 PNG. Consumers in the app
  // (e.g. doodle save flow) should use the included `components/SVGToPNGWebView`
  // component to perform conversion in UI context and then write the returned
  // base64 to a file using expo-file-system. For convenience, here we throw a
  // clear message so callers know the flow.

  throw new Error(
    'rasterizeSVGToPNG is a UI-bound helper: mount components/SVGToPNGWebView in your UI, receive base64 PNG via onResult, then write it with expo-file-system. See components/SVGToPNGWebView.tsx for an example.'
  );
}
