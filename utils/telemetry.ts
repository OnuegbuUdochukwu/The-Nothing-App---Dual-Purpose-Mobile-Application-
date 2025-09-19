import AsyncStorage from '@react-native-async-storage/async-storage';

const TELEMETRY_KEY = 'appTelemetry';

export async function logEvent(name: string, props: Record<string, any> = {}) {
  try {
    const entry = {
      id: Date.now().toString(),
      name,
      props,
      ts: new Date().toISOString(),
    };
    // append to stored telemetry array (keep small)
    const raw = await AsyncStorage.getItem(TELEMETRY_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    arr.push(entry);
    // keep last 200
    const truncated = arr.slice(-200);
    await AsyncStorage.setItem(TELEMETRY_KEY, JSON.stringify(truncated));
    // also log to console for dev visibility
    // Avoid sending any PII — only store event name and non-identifying props
    // (caller must ensure props are non-PII)
    console.log('[telemetry]', entry.name, entry.props);
    return entry;
  } catch (e) {
    console.error('telemetry log failed', e);
    return null;
  }
}

export default { logEvent };
