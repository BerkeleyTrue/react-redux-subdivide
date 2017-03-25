import expect from 'expect';
import reducer, {
  createLayout,
  createPane,
  directions,
  splitTypes,
  split,
  join
} from '../';

const test = it;
test('split right', () => {
  const endState = reducer(
    createLayout(),
    split(0, splitTypes.right)
  );

  const original = endState.panesById[0];
  const parent = endState.panesById[original.parentId];
  const added =
    endState.panesById[parent.childIds[parent.childIds.length - 1]];

  expect(parent).toExist();
  expect(added).toExist();
  expect(parent.childIds).toEqual([ original.id, added.id ]);
  expect(parent.direction).toEqual(directions.row);
  expect(original.parentId).toEqual(parent.id);
  expect(added.parentId).toEqual(parent.id);
});

test('split left', () => {
  const endState = reducer(createLayout(), split(0, splitTypes.left));
  const original = endState.panesById[0];
  const parent = endState.panesById[original.parentId];
  const added = endState.panesById[parent.childIds[0]];
  expect(parent.childIds).toEqual([ added.id, original.id ]);
  expect(parent.direction).toEqual(directions.row);
});

test('split above', () => {
  const endState = reducer(
    createLayout(),
    split(0, splitTypes.above)
  );
  const original = endState.panesById[0];
  const parent = endState.panesById[original.parentId];
  const added = endState.panesById[parent.childIds[0]];

  expect(parent.childIds).toEqual([ added.id, original.id ]);
  expect(parent.direction).toEqual(directions.col);
});

test('split below', () => {
  const endState = reducer(
    createLayout(),
    split(0, splitTypes.below)
  );
  const original = endState.panesById[0];
  const parent = endState.panesById[original.parentId];
  const added =
    endState.panesById[parent.childIds[parent.childIds.length - 1]];
  expect(parent.childIds).toEqual([ original.id, added.id ]);
  expect(parent.direction).toEqual(directions.col);
});

test('join one of two in row below root', () => {
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
  expect(endState.rootId).toEqual(2);
  expect(endState.panesById[1]).toNotExist();
  expect(endState.panesById[0]).toNotExist();
  expect(endState.panesById[2]).toExist();
  expect(endState.panesById[2].direction).toNotExist();
  expect(endState.panesById[2].parent).toNotExist();
});


test('join one of three in row below root', () => {
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
  expect(endState.rootId).toEqual(1);
  expect(endState.panesById[1]).toExist();
  expect(endState.panesById[1].childIds).toEqual([ 2, 3 ]);
  expect(endState.panesById[0]).toNotExist();
  expect(endState.panesById[2]).toExist();
  expect(endState.panesById[2].parentId).toBe(1);
});

test('join one of two in row below root', () => {
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
  expect(endState.panesById[2]).toNotExist();
  expect(endState.panesById[1].childIds).toEqual([ 0, 3 ]);
  expect(endState.panesById[3].parentId).toEqual(1);
  expect(endState.panesById[4]).toNotExist();
  expect(endState.panesById[3]).toExist();
  expect(endState.panesById[3].direction).toNotExist();
});
