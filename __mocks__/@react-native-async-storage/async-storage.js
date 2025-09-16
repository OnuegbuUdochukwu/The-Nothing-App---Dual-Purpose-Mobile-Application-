// Jest mock for @react-native-async-storage/async-storage
let storage = {};

module.exports = {
  setItem: jest.fn((key, value) => {
    storage[key] = value;
    return Promise.resolve(true);
  }),
  getItem: jest.fn((key) => Promise.resolve(storage[key] ?? null)),
  removeItem: jest.fn((key) => {
    delete storage[key];
    return Promise.resolve(true);
  }),
  clear: jest.fn(() => {
    storage = {};
    return Promise.resolve(true);
  }),
  getAllKeys: jest.fn(() => Promise.resolve(Object.keys(storage))),
};
