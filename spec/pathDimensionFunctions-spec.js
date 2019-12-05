import { pathDimensionFunctions } from '../src/components/Edge';

describe('pathDimensionFunctions', () => {
  describe('drawBezierEdge', () => {
    it('works', () => {
      const path = pathDimensionFunctions.drawBezierEdge(
        {x: 0, y: 0},
        {x: 100, y: 100},
        20, 20,
        [10, 10]);
      expect(path).toEqual('M0,0L10,0C50,0,50,100,90,100L100,100')
    });
  });
});
