module.exports = {
  cacheDirectory: '/tmp/',
  documentDirectory: '/tmp/doc/',
  moveAsync: jest.fn().mockResolvedValue(null),
  copyAsync: jest.fn().mockResolvedValue(null),
  writeAsStringAsync: jest.fn().mockResolvedValue(null),
  EncodingType: { UTF8: 'utf8' },
};
