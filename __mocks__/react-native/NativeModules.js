// Minimal mock for NativeModules expected by jest-expo setup
const NativeModules = {
  NativeUnimoduleProxy: { viewManagersMetadata: {} },
  Linking: {
    addEventListener: () => {},
    removeEventListener: () => {},
  },
  UIManager: {},
};

// Export both CommonJS and a `.default` property because some consumers
// (e.g. jest-expo setup) require the module and access `.default`.
module.exports = NativeModules;
module.exports.default = NativeModules;
