/**
 * Basic unit test for strokesToSVG and the doodleRaster helper stubs.
 * We cannot run React Native native capture in Jest environment, so we test
 * that the module exists and that strokesToSVG produces expected output.
 */
import { strokesToSVG } from '@/utils/doodleExport';

test('strokesToSVG generates a valid SVG string for simple strokes', () => {
  const strokes = [
    {
      id: '1',
      points: [
        { x: 10, y: 10 },
        { x: 20, y: 20 },
      ],
      color: '#000000',
      width: 2,
    },
  ];

  const svg = strokesToSVG(strokes, 100, 100);
  expect(svg).toMatch(/<svg[^>]*width="100"/);
  expect(svg).toContain('stroke="#000000"');
  expect(svg).toContain('stroke-width="2"');
});
