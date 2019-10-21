const parsingFunctions = require('../es/components/parsing-functions');
// TODO: Configure Babel for Jasmine (or another framework) so we can import the source code.

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
      nodesAfter = parsingFunctions.nodesPreSortFxn(nodes);
      expect(nodesAfter[0].column).toEqual(0)
    });
  });
});
