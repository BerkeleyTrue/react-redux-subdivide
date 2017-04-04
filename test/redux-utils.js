import test from 'ava';

import {
  directions,
  splitTypes
} from '../src/redux';

import {
  getSplitDirection,
  getOffset,
  areNotAdjacent,
  getNextId,
  getSplitRatios
} from '../src/utils/redux.js';

test('getSplitDirection(`up`) => `horizontal`', t => {
  t.is(
    getSplitDirection(directions.up),
    splitTypes.horizontal
  );
});

test('getSplitDirection(`down`) => `horizontal`', t => {
  t.is(
    getSplitDirection(directions.down),
    splitTypes.horizontal
  );
});

test('getSplitDirection(`left`) => `vertical`', t => {
  t.is(
    getSplitDirection(directions.left),
    splitTypes.vertical
  );
});

test('getSplitDirection(`right`) => `vertical`', t => {
  t.is(
    getSplitDirection(directions.right),
    splitTypes.vertical
  );
});

test('getSplitDirection(`foo`) => Void', t => {
  t.falsy(getSplitDirection('foo'));
});

test('getOffset(down|right) => 1', t => {
  t.is(
    getOffset(directions.down),
    1
  );
  t.is(
    getOffset(directions.right),
    1
  );
});

test('getOffset(up|left) => 0', t => {
  t.is(
    getOffset(directions.up),
    0
  );
  t.is(
    getOffset(directions.left),
    0
  );
});

test('areNotAdjacent', t => {
  t.truthy(
    areNotAdjacent(
      { childIds: [0, 1] },
      { id: 3 },
      { id: 1 }
    )
  );
  t.truthy(
    areNotAdjacent(
      { childIds: [0, 1] },
      { id: 0 },
      { id: 2 }
    )
  );
  t.falsy(
    areNotAdjacent(
      { childIds: [0, 1] },
      { id: 0 },
      { id: 1 }
    )
  );
  t.falsy(
    areNotAdjacent(
      { childIds: [0, 1] },
      { id: 1 },
      { id: 0 }
    )
  );
});

test('getNextId() => 1', t => {
  t.is(
    getNextId(),
    1
  );
});

test('getNextId([3]) => 4', t => {
  t.is(
    getNextId([3]),
    4
  );
});

test('getSplitRatios verticle offset 0', t => {
  const [ splitA, splitB ] = getSplitRatios(
    75,
    25,
    0,
    splitTypes.vertical,
    false,
    { width: 100, height: 100, left: 0, top: 0, splitRatio: 0.5 }
  );
  t.is(
    splitA,
    0.25
  );
  t.is(
    splitB,
    0.75
  );
});

test('getSplitRatios verticle offset 1', t => {
  const [ splitA, splitB ] = getSplitRatios(
    75,
    25,
    1,
    splitTypes.vertical,
    false,
    { width: 100, height: 100, left: 0, top: 0, splitRatio: 0.5 }
  );
  t.is(
    splitA,
    0.75
  );
  t.is(
    splitB,
    0.25
  );
});

test('getSplitRatios horizontal offset 0', t => {
  const [ splitA, splitB ] = getSplitRatios(
    75,
    25,
    0,
    splitTypes.horizontal,
    false,
    { width: 100, height: 100, left: 0, top: 0, splitRatio: 0.5 }
  );
  t.is(
    splitA,
    0.75
  );
  t.is(
    splitB,
    0.25
  );
});

test('getSplitRatios horizontal offset 1', t => {
  const [ splitA, splitB ] = getSplitRatios(
    75,
    25,
    1,
    splitTypes.horizontal,
    false,
    { width: 100, height: 100, left: 0, top: 0, splitRatio: 0.5 }
  );
  t.is(
    splitA,
    0.25
  );
  t.is(
    splitB,
    0.75
  );
});

test('getSplitRatios hasNewParent', t => {
  const [ splitA, splitB ] = getSplitRatios(
    75,
    25,
    1,
    splitTypes.horizontal,
    true,
    { width: 100, height: 100, left: 0, top: 0, splitRatio: 0.5 }
  );
  t.is(
    splitA,
    0.25 * 0.5
  );
  t.is(
    splitB,
    0.75 * 0.5
  );
});
