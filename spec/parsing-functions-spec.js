import { nodesPreSortFxn } from '../src/components/parsing-functions';

describe('parsing-function.js', () => {
  describe('nodesPreSortFxn', () => {
    it('sets column to 0', () => {
      const nodes = [
        {
          nodeType: 'input',
          meta: {
            global: true
          },
          column: 1
        }
      ];
      const nodesAfter = nodesPreSortFxn(nodes);
      expect(nodesAfter[0].column).toEqual(0)
    });
  });
});
