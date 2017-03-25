import test from 'ava';

import reducer, {
  createLayout,
  createPane,
  directions,
  splitTypes,
  split,
  join,
  dividerMoved
} from '../src/reducers';

test('split right', (t) => {
  const endState = reducer(
    createLayout(),
    split(0, splitTypes.right)
  );

  const original = endState.panesById[0];
  const parent = endState.panesById[original.parentId];
  const added =
    endState.panesById[parent.childIds[parent.childIds.length - 1]];

  t.truthy(parent);
  t.truthy(added);
  t.deepEqual(parent.childIds, [ original.id, added.id ]);
  t.is(parent.direction, directions.row);
  t.is(original.parentId, parent.id);
  t.is(added.parentId, parent.id);
});

test('split left', (t) => {
  const endState = reducer(createLayout(), split(0, splitTypes.left));
  const original = endState.panesById[0];
  const parent = endState.panesById[original.parentId];
  const added = endState.panesById[parent.childIds[0]];

  t.deepEqual(parent.childIds, [ added.id, original.id ]);
  t.is(parent.direction, directions.row);
});

test('split above', (t) => {
  const endState = reducer(
    createLayout(),
    split(0, splitTypes.above)
  );
  const original = endState.panesById[0];
  const parent = endState.panesById[original.parentId];
  const added = endState.panesById[parent.childIds[0]];

  t.deepEqual(parent.childIds, [ added.id, original.id ]);
  t.is(parent.direction, directions.col);
});

test('split below', (t) => {
  const endState = reducer(
    createLayout(),
    split(0, splitTypes.below)
  );
  const original = endState.panesById[0];
  const parent = endState.panesById[original.parentId];
  const added =
    endState.panesById[parent.childIds[parent.childIds.length - 1]];

  t.deepEqual(parent.childIds, [ original.id, added.id ]);
  t.is(parent.direction, directions.col);
});

test('split non-root into two', t => {
  const startState = createLayout({
    rootId: 1,
    panes: [ 0, 1, 2, 3 ],
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
        childIds: [ 0, 2, 3 ],
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
        splitRatio: 0.33
      }),
      3: createPane({
        id: 3,
        childIds: [],
        isGroup: false,
        direction: null,
        parentId: 1,
        splitRatio: 0.33
      })
    }
  });
  const endState = reducer(startState, split(3, splitTypes.above));
  t.truthy(
    endState.panesById[3],
    'split pane should still exist'
  );
  t.truthy(
    endState.panesById[4],
    'split did not create a new parent pane'
  );
  t.deepEqual(
    endState.panesById[4].childIds,
    [5, 3],
    'split new parent does not have correct children'
  );
  t.deepEqual(
    endState.panesById[1].childIds,
    [0, 2, 4]
  );
});

test('split pane in same direction', t => {
  const startState = createLayout({
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
        splitRatio: 0.33
      })
    }
  });
  const endState = reducer(startState, split(2, splitTypes.left));
  t.truthy(
    endState.panesById[2],
    'split pane was removed'
  );
  t.truthy(
    endState.panesById[3],
    'split should create new pane'
  );
  t.is(
    endState.panes.reduce((sum, paneId) => {
      return endState.panesById[paneId].isGroup ? sum + 1 : sum;
    }, 0),
    1,
    'split should not add a new parent'
  );
  t.deepEqual(
    endState.panesById[1].childIds,
    [ 0, 3, 2],
    'parent should have new child'
  );
});

test('join one of two in row below root', (t) => {
  const startState = createLayout({
    rootId: 1,
    panes: [ 0, 1, 2 ],
    panesById: {
      0: createPane({
        id: 0,
        childIds: [],
        isGroup: false,
        direction: null,
        parentId: 1,
        splitRatio: 0.25
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
        splitRatio: 0.75
      })
    }
  });
  const endState = reducer(startState, join(2, 0));

  t.is(endState.rootId, 2);
  t.falsy(endState.panesById[1]);
  t.falsy(endState.panesById[0]);
  t.truthy(endState.panesById[2]);
  t.falsy(endState.panesById[2].direction);
  t.falsy(endState.panesById[2].parent);
});


test('join one of three in row below root', (t) => {
  const startState = createLayout({
    rootId: 1,
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
        childIds: [ 0, 2, 3 ],
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
        splitRatio: 0.33
      }),
      3: createPane({
        id: 3,
        childIds: [],
        isGroup: false,
        direction: null,
        parentId: 1,
        splitRatio: 0.33
      })
    }
  });

  const action = join(2, 0);
  const endState = reducer(startState, action);

  t.is(endState.rootId, 1);
  t.truthy(endState.panesById[1]);
  t.deepEqual(endState.panesById[1].childIds, [ 2, 3 ]);
  t.falsy(endState.panesById[0]);
  t.truthy(endState.panesById[2]);
  t.is(endState.panesById[2].parentId, 1);
});

test('join one of two in row below root', (t) => {
  const startState = createLayout({
    rootId: 1,
    panesById: {
      0: createPane({
        id: 0,
        childIds: [],
        isGroup: false,
        direction: null,
        parentId: 1,
        splitRatio: 0.25
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
        childIds: [ 3, 4 ],
        isGroup: true,
        direction: null,
        parentId: 1,
        splitRatio: 0.75
      }),
      3: createPane({
        id: 3,
        childIds: [],
        isGroup: false,
        direction: null,
        parentId: 2,
        splitRatio: 0.75
      }),
      4: createPane({
        id: 4,
        childIds: [],
        isGroup: false,
        direction: null,
        parentId: 2,
        splitRatio: 0.75
      })
    }
  });

  const action = join(3, 4);
  const endState = reducer(startState, action);

  t.truthy(
    endState.panesById[3],
    'join was removed'
  );
  t.is(
    endState.panesById[3].parentId,
    1,
    'join does not have grandparent as new parent'
  );
  t.falsy(
    endState.panesById[3].direction,
    'join pane should not have a direction'
  );
  t.falsy(endState.panesById[2], 'old parent was not removed');
  t.deepEqual(
    endState.panesById[1].childIds,
    [ 0, 3 ],
    'new parent does not have the correct children'
  );
  t.falsy(
    endState.panesById[4],
    'joined into should was not removed'
  );
});

test('divider moved', t => {
  const endState = reducer(
    createLayout({
      panes: [ 0, 1, 3 ],
      panesById: {
        0: createPane({
          id: 0,
          splitRatio: 0.3,
          parentId: 1
        }),
        1: createPane({
          id: 1,
          isGroup: 1,
          childIds: [ 0, 1 ]
        }),
        2: createPane({
          id: 2,
          splitRatio: 0.7,
          parentId: 1
        })
      }
    }),
    dividerMoved(
      0,
      2,
      0.2,
      0.8
    )
  );

  t.is(
    endState.panesById[0].splitRatio,
    0.2,
    'after pane split ratio did not update'
  );
  t.is(
    endState.panesById[2].splitRatio,
    0.8,
    'before pane split ratio did not update'
  );
});
