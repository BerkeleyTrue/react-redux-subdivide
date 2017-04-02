import { combineEpics } from 'redux-observable';
import { FromEventObservable } from 'rxjs/observable/FromEventObservable';
import { last } from 'rxjs/operator/last';
import { map } from 'rxjs/operator/map';
import { startWith } from 'rxjs/operator/startWith';
import { switchMap } from 'rxjs/operator/switchMap';
import { takeUntil } from 'rxjs/operator/takeUntil';
import { filter } from 'rxjs/operator/filter';

import {
  types,

  dividerReleased,
  join,
  pressedCornerSelector,
  windowResize
} from './index.js';

export function windowResizeEpic(actions, getState, { window }) {
  return FromEventObservable.create(window, 'resize', () => windowResize(
    window.innerWidth,
    window.innerHeight
  ))
    ::startWith(windowResize(window.innerWidth, window.innerHeight))
    ::takeUntil(actions::last(null, null, null));
}

export function paneJoinEpic(actions, getState) {
  return actions.ofType(types.mouseUpOnPane)
    ::map(({ payload }) => payload)
    ::filter(paneId => pressedCornerSelector(getState()).id === paneId)
    ::map(paneId => {
      const { id: cornerDownId } = pressedCornerSelector(getState());
      return join(cornerDownId, paneId);
    });
}

export function dividerEpic(actions) {
  return actions.ofType(types.dividerPressed)
    ::switchMap(() => {
      return FromEventObservable(document, 'mouseup')
        ::map(() => dividerReleased());
    })
    ::takeUntil(actions.last(null, null, null));
}

export default combineEpics(
  dividerEpic,
  windowResizeEpic
);
