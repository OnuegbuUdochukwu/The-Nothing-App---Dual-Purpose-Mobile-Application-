// Minimal mock for NativeModules expected by jest-expo setup
const NativeModules = {
  NativeUnimoduleProxy: { viewManagersMetadata: {} },
  Linking: {
    addEventListener: () => {},
    removeEventListener: () => {},
  },
  UIManager: {},
};

module.exports = NativeModules;
