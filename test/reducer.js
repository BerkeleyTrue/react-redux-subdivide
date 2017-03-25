import test from 'ava';

import reducer, {
  createLayout,
  createPane,
  directions,
  splitTypes,
  split,
  join
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

  t.falsy(endState.panesById[2]);
  t.deepEqual(endState.panesById[1].childIds, [ 0, 3 ]);
  t.is(endState.panesById[3].parentId, 1);
  t.falsy(endState.panesById[4]);
  t.truthy(endState.panesById[3]);
  t.falsy(endState.panesById[3].direction);
});
