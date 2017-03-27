import test from 'ava';
import secondPass from '../src/helpers/secondPass.js';

import reducer, {
  cardinals,
  createLayout,
  createPane,
  directions,
  splitTypes,
  joinTypes
} from '../src/reducers';

test('creates a divider for children', t => {
  const start = createLayout({
    rootId: 1,
    panes: [ 0, 1, 2 ],
    panesById: {
      0: createPane({
        id: 0,
        childIds: [],
        isGroup: false,
        direction: null,
        parentId: 1,
        splitRatio: 0.33
      }),
      1: createPane({
        id: 1,
        childIds: [ 0, 2 ],
        isGroup: true,
        direction: directions.row,
        parentId: null,
        splitRatio: 1
      }),
      2: createPane({
        id: 2,
        childIds: [],
        isGroup: false,
        direction: null,
        parentId: 1,
        splitRatio: 0.67
      })
    }
  });
  const end = secondPass(start);
  t.is(
    Object.keys(end.dividers).length,
    1,
    'second pass should add a divider between each child'
  );

  t.truthy(
    end.dividers['0n2'],
    'second pass should add divider id composed of the two panes it divides'
  );
});

test('sets correct join direction on pane', t => {
  const start = createLayout({
    rootId: 1,
    panes: [ 0, 1, 2 ],
    cornerDown: {
      paneId: 0,
      corner: cardinals.ne
    },
    panesById: {
      0: createPane({
        id: 0,
        childIds: [],
        isGroup: false,
        direction: null,
        parentId: 1,
        splitRatio: 0.55
      }),
      1: createPane({
        id: 1,
        childIds: [ 0, 2 ],
        isGroup: true,
        direction: directions.row,
        parentId: null,
        splitRatio: 1
      }),
      2: createPane({
        id: 2,
        childIds: [],
        isGroup: false,
        direction: null,
        parentId: 1,
        splitRatio: 0.45
      })
    }
  });
  const end = secondPass(start);
  t.truthy(
    end.panesById[0].canSplit,
    'second pass should add can split to panes with corners pressed'
  );
  t.is(
    end.panesById[2].joinDirection,
    joinTypes.right,
    'second pass should add a join direction to child next to corner down pane'
  );
});
