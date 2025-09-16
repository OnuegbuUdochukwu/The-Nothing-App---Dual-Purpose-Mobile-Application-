import React, { useRef, useEffect } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';

type Props = {
  visible: boolean;
  svgXml: string;
  width: number;
  height: number;
  /**
   * Called with a base64 PNG data string (no data: prefix). Example: 'iVBORw0KG...'
   */
  onResult: (base64Png: string) => void;
  onCancel?: () => void;
};

/**
 * A small, focused component that renders provided SVG XML inside
 * a hidden WebView and converts it to a PNG via an offscreen canvas.
 * This is useful on native when `react-native-view-shot` can't be used
 * or when you have an SVG string and need a raster PNG output.
 *
 * Usage: mount this component (Modal) while conversion is needed and
 * receive base64 PNG via `onResult`, then write it to a file via
 * `expo-file-system`.
 */
export default function SVGToPNGWebView({
  visible,
  svgXml,
  width,
  height,
  onResult,
  onCancel,
}: Props) {
  const webRef = useRef<any>(null);

  useEffect(() => {
    // no-op: side-effects handled via injected JS / onMessage
  }, [svgXml, visible]);

  // Injected HTML: draws the SVG into a canvas and sends back a base64 PNG
  const injected = `
    (function(){
      try {
        const svgString = decodeURIComponent(window.location.hash.slice(1));
        const svg = new Blob([svgString], {type: 'image/svg+xml;charset=utf-8'});
        const DOMURL = self.URL || self.webkitURL || self;
        const url = DOMURL.createObjectURL(svg);
        const img = new Image();
        img.onload = function() {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = ${width};
            canvas.height = ${height};
            const ctx = canvas.getContext('2d');
            // Optional: fill white background to avoid transparent PNGs when desired
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0,0,canvas.width,canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const data = canvas.toDataURL('image/png');
            const base64 = data.split(',')[1];
            window.ReactNativeWebView.postMessage(JSON.stringify({ success: true, base64 }));
          } catch (e) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ success: false, error: String(e) }));
          }
          DOMURL.revokeObjectURL(url);
        };
        img.onerror = function(e){
          window.ReactNativeWebView.postMessage(JSON.stringify({ success: false, error: 'Image load failed' }));
        };
        img.crossOrigin = 'anonymous';
        img.src = url;
      } catch (err) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ success: false, error: String(err) }));
      }
    })();
    true;
  `;

  // On Android, hidden WebViews can be problematic; the Modal ensures it's available.
  // We lazy-require WebView so tests and environments without react-native-webview
  // installed can still import this file without failing.
  let WebView: any;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    WebView = require('react-native-webview').WebView;
  } catch (e) {
    // Will render a cancel state below if WebView isn't available
    WebView = null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onCancel}
    >
      <View style={styles.container} pointerEvents="none">
        <View
          style={{ width, height, opacity: Platform.OS === 'android' ? 1 : 0 }}
        >
          {WebView ? (
            <WebView
              ref={webRef}
              source={{
                uri:
                  `data:text/html;charset=utf-8,<!doctype html><html><head><meta name="viewport" content="width=${width},height=${height}"></head><body style="margin:0;padding:0;">${svgXml}</body></html>#` +
                  encodeURIComponent(svgXml),
              }}
              onMessage={(e: { nativeEvent: { data: string } }) => {
                try {
                  const payload = JSON.parse(e.nativeEvent.data);
                  if (payload && payload.success && payload.base64) {
                    onResult(payload.base64);
                  } else {
                    onCancel && onCancel();
                  }
                } catch (err) {
                  onCancel && onCancel();
                }
              }}
              injectedJavaScript={injected}
              javaScriptEnabled
              allowFileAccess
              mixedContentMode="always"
              style={{ backgroundColor: 'transparent' }}
            />
          ) : null}
        </View>
        <View style={styles.loader} pointerEvents="none">
          <ActivityIndicator size="large" color="#888" />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
});
