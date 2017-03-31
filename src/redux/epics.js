import { FromEventObservable } from 'rxjs/observable/FromEventObservable';
import { startWith } from 'rxjs/operator/startWith';
import { takeUntil } from 'rxjs/operator/takeUntil';
import { last } from 'rxjs/operator/last';

import { windowResize } from './index.js';

export function windowResizeEpic(actions, getState, { window }) {
  return FromEventObservable.create(window, 'resize', () => windowResize(
    window.innerWidth,
    window.innerHeight
  ))
    ::startWith(windowResize(window.innerWidth, window.innerHeight))
    ::takeUntil(actions::last(null, null, null));
}

export default windowResizeEpic;
