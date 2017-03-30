import { createSelector as _createSelector } from 'reselect';

import { getNSState } from '../redux';

export default function createSelector(...funcs) {
  const resultSelector = funcs.pop();
  return _createSelector(
    ...funcs.map(func => (state, ...args) => func(getNSState(state), ...args)),
    resultSelector
  );
}
