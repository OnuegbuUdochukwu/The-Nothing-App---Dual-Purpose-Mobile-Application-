import { isPermissionError } from '@/utils/doodleSaveUtils';

test('isPermissionError detects common permission messages', () => {
  expect(
    isPermissionError(new Error('Media library permission not granted'))
  ).toBe(true);
  expect(isPermissionError(new Error('Permission denied'))).toBe(true);
  expect(isPermissionError({ message: 'User denied permission' })).toBe(true);
  expect(isPermissionError(new Error('Some other error'))).toBe(false);
  expect(isPermissionError(null)).toBe(false);
});
