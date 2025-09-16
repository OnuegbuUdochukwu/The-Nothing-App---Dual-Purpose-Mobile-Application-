module.exports = {
  preset: 'jest-expo',
  testEnvironment: 'jsdom',
  testMatch: ['**/__tests__/**/*.test.(ts|tsx)'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^react-native/Libraries/BatchedBridge/NativeModules$':
      '<rootDir>/__mocks__/react-native/NativeModules.js',
    '^react-native/Libraries/Animated/NativeAnimatedHelper$':
      '<rootDir>/__mocks__/react-native/NativeAnimatedHelper.js',
    '^react-native$': '<rootDir>/__mocks__/react-native/index.js',
  },
  setupFilesAfterEnv: ['<rootDir>/jest-setup.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|@react-native-async-storage)/)',
  ],
};
