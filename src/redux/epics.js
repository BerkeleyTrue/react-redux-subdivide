import { combineEpics } from 'redux-observable';
import { FromEventObservable } from 'rxjs/observable/FromEventObservable';
import { filter } from 'rxjs/operator/filter';
import { last } from 'rxjs/operator/last';
import { map } from 'rxjs/operator/map';
import { startWith } from 'rxjs/operator/startWith';
import { switchMap } from 'rxjs/operator/switchMap';
import { takeUntil } from 'rxjs/operator/takeUntil';
import { throttleTime } from 'rxjs/operator/throttleTime';
import { delay } from 'rxjs/operator/delay';
import { animationFrame } from 'rxjs/scheduler/animationFrame';
import { createSelector } from 'reselect';

import {
  types,
  corners,
  splitTypes,

  cornerReleased,
  dividerMoved,
  dividerReleased,
  join,
  split,
  windowResize,

  panesByIdSelector,
  pressedCornerSelector,
  pressedDividerSelector
} from './index.js';

const minRatioChange = 20;
function isWithinPane(x, y, { top, left, height, width }) {
  return (
    x > left &&
    x < left + width &&
    y > top &&
    y < top + height
  );
}

const mouseMoveMapStateToProps = createSelector(
  pressedDividerSelector,
  pressedCornerSelector,
  panesByIdSelector,
  (pressedDivider, { corner, paneId }, panesById) => {
    return {
      corner,
      isCornerPressed: !!corner,
      isDividerPressed: !!pressedDivider.id,
      pane: panesById[paneId] || {},
      pressedDivider
    };
  }
);

export function mouseMoveEpic(actions, { getState }, { document }) {
  return actions.ofType(types.layoutMounted)
    ::switchMap(() => {
      return FromEventObservable.create(document, 'mousemove')
        ::map(({ clientX, clientY }) => ({ clientX, clientY }))
        ::throttleTime(0, animationFrame)
        ::map(({ clientX, clientY }) => {
          const {
            corner,
            isDividerPressed,
            isCornerPressed,
            pressedDivider,
            pane
          } = mouseMoveMapStateToProps(getState());

          if (
            !isDividerPressed &&
            !(isCornerPressed && isWithinPane(clientX, clientY, pane))
          ) {
            return null;
          }
          if (isDividerPressed) {
            const {
              afterPaneId,
              beforePaneId,
              direction,
              parentSize,
              startX,
              startY
            } = pressedDivider;

            const delta = direction === splitTypes.horizontal ?
              clientX - startX :
              clientY - startY;
            const deltaRatio = delta / parentSize;
            const afterRatio = pressedDivider.afterRatio - deltaRatio;
            const beforeRatio = pressedDivider.beforeRatio + deltaRatio;

            if (
              beforeRatio * parentSize > minRatioChange &&
              afterRatio * parentSize > minRatioChange
            ) {
              return dividerMoved(
                beforePaneId,
                afterPaneId,
                beforeRatio,
                afterRatio
              );
            }
          }


          const { id, top, left, height, width } = pane;
          if (corner === corners.sw) {
            if (clientX - left > 25) {
              return split.left(id, clientX, clientY);
            } else if (top + height - clientY > 25) {
              return split.down(id, clientX, clientY);
            }
          }

          if (corner === corners.ne) {
            if (left + width - clientX > 25) {
              return split.right(id, clientX, clientY);
            } else if (clientY - top > 25) {
              return split.up(id, clientX, clientY);
            }
          }

          if (corner === corners.se) {
            if (left + width - clientX > 25) {
              return split.right(id, clientX, clientY);
            } else if (top + height - clientY > 25) {
              return split.down(id, clientX, clientY);
            }
          }

          if (corner === corners.nw) {
            if (clientX - left > 25) {
              return split.left(id, clientX, clientY);
            } else if (clientY - top > 25) {
              return split.up(id, clientX, clientY);
            }
          }

          return null;
        })
        ::filter(Boolean);
    });
}

export function windowResizeEpic(actions, { getState }, { window }) {
  return FromEventObservable.create(window, 'resize', () => windowResize(
    window.innerWidth,
    window.innerHeight
  ))
    ::startWith(windowResize(window.innerWidth, window.innerHeight))
    ::takeUntil(actions::last(null, null, null));
}

export function paneJoinEpic(actions, { getState }) {
  return actions.ofType(types.mouseUpOnPane)
    ::map(({ payload }) => payload)
    ::filter(paneId => pressedCornerSelector(getState()).id === paneId)
    ::map(paneId => {
      const { id: cornerDownId } = pressedCornerSelector(getState());
      return join(cornerDownId, paneId);
    });
}

export function releaseCornerEpic(actions, { getState }, { document }) {
  return actions.ofType(types.cornerPressed)
    ::switchMap(() => {
      return FromEventObservable.create(document, 'mouseup')
        // allow pane mouseup to complete first
        ::delay(0)
        ::map(() => cornerReleased())
        ::takeUntil(actions.ofType(types.join));
    });
}

export function dividerEpic(actions) {
  return actions.ofType(types.dividerPressed, types.split)
    ::switchMap(() => {
      return FromEventObservable.create(document, 'mouseup')
        ::map(() => dividerReleased());
    })
    ::takeUntil(actions::last(null, null, null));
}

export default combineEpics(
  dividerEpic,
  mouseMoveEpic,
  paneJoinEpic,
  releaseCornerEpic,
  windowResizeEpic
);
