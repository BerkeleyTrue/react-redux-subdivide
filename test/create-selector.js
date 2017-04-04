import test from 'ava';

import createSelector from '../src/utils/create-selector.js';
import { ns } from '../src/redux';

test('createSelector ', t => {
  const selector = createSelector(
    state => state.foo,
    foo => foo.bar
  );
  t.is(
    selector({ [ns]: { foo: { bar: 'baz' } } }),
    'baz'
  );
});
