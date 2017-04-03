import {
  createAction,
  combineActions,
  handleActions
} from 'redux-actions';
import { createTypes } from 'redux-create-types';

import createSelector from '../utils/create-selector.js';
import normalize, { shouldNormalize } from '../utils/normalize.js';
import {
  getSplitDirection,
  getOffset,
  areNotAdjacent,
  getNextId,
  getSplitRatios
} from '../utils/redux.js';

export const ns = 'subdivide';

export const corners = {
  ne: 'north-east',
  nw: 'north-west',
  se: 'south-east',
  sw: 'south-west'
};

export const splitTypes = {
  horizontal: 'horizontal',
  vertical: 'vertical'
};

export const directions = {
  down: 'down',
  left: 'left',
  right: 'right',
  up: 'up'
};

export const types = createTypes([
  'join',
  'split',

  'mouseUpOnPane',

  'dividerPressed',
  'dividerMoved',
  'dividerReleased',


  'cornerPressed',
  'cornerReleased',
  'hoverOverCorner',
  'blurCorner',

  'layoutMounted',

  'windowResize'
], ns);

export const join = createAction(
  types.join,
  (retainId, removeId) => ({ retainId, removeId })
);
export const split = createAction(
  types.split,
  (splitType, id, clientX, clientY) => ({
    id,
    splitType,
    clientX,
    clientY
  })
);

split.up = split.bind(null, directions.up);
split.down = split.bind(null, directions.down);
split.right = split.bind(null, directions.right);
split.left = split.bind(null, directions.left);

export const mouseUpOnPane = createAction(types.mouseUpOnPane);

export const dividerPressed = createAction(types.dividerPressed);
export const dividerReleased = createAction(types.dividerReleased);
export const dividerMoved = createAction(types.dividerMoved);

export const hoverOverCorner = createAction(types.hoverOverCorner);
export const blurCorner = createAction(types.blurCorner);
export const cornerPressed = createAction(types.cornerPressed);
export const cornerReleased = createAction(types.cornerReleased);

export const layoutMounted = createAction(types.layoutMounted);

export const windowResize = createAction(
  types.windowResize,
  (width, height) => ({ width, height })
);

export const createInitialState =
  (...args) => normalize(createLayout(...args));

export const createPane = (values = {}) => ({
  id: 0,
  childIds: [],
  isGroup: false,
  splitRatio: 1,
  props: {},
  ...values
});

export const createLayout = (values = {}) => ({
  rootId: 0,
  borderSize: 1,
  cellSpacing: 3,
  touchMargin: 2,
  width: 800,
  height: 600,
  panesById: {
    0: createPane()
  },
  panes: [ 0 ],
  dividers: {},
  ...values
});

export function getNSState(state) {
  return state[ns];
}

export const touchMarginSelector = state => getNSState(state).touchMargin;
export const borderSizeSelector = state => getNSState(state).borderSize;
export const layoutSizeSelector = createSelector(
  state => state.height,
  state => state.width,
  (layoutHeight, layoutWidth) => ({
    layoutHeight,
    layoutWidth
  })
);

export const panesByIdSelector = state => getNSState(state).panesById || {};
export function makePaneSelector(paneId) {
  return createSelector(
    state => state.panesById,
    panesById => panesById[paneId] || {}
  );
}

export const panesSelector = createSelector(
  state => state.panesById,
  panesById => Object.keys(panesById).map(id => panesById[id])
);

export const paneIdsSelector = createSelector(
  state => state.panesById,
  panesById => Object.keys(panesById).map(id => parseInt(id, 10))
);

export function makeDividerSelector(dividerId) {
  return createSelector(
    state => state.dividers,
    (dividers) => dividers[dividerId]
  );
}

export const dividersSelector = createSelector(
  state => state.dividers,
  dividers => Object.keys(dividers).map(id => dividers[id])
);

export const pressedDividerSelector = createSelector(
  state => state.dividerDown,
  state => state.dividers,
  (dividerDown, dividers) => {
    if (!dividerDown) {
      return {};
    }
    return {
      ...dividers[dividerDown.id],
      ...dividerDown
    };
  }
);

export function pressedCornerSelector(state) {
  return getNSState(state).cornerDown || {};
}

export function hoveredCornerSelector(state) {
  return getNSState(state).cornerHover || {};
}

const _reducer = handleActions({
  // creates a new pane group, puts the existing and the newly created pane
  // as children of that group pane
  // so if we start with a 0 root pane and split it, we create a group
  // pane (id 1) make this the root pane, create a new pane, and finally attach
  // those two panes as children of the new root group pane
  // Split(0) => Group(1) < Children(0, 2)
  [types.split]: (state, { payload: { id, splitType, clientX, clientY } }) => {
    const panes = [ ...state.panes ];
    const panesById = { ...state.panesById };
    const currentPane = { ...panesById[id] };
    const { parentId: oldParentId, splitRatio } = currentPane;
    let rootId = state.rootId;
    const isRoot = id === rootId;
    const oldParent = { ...panesById[oldParentId] };
    const offset = getOffset(splitType);
    const direction = getSplitDirection(splitType);
    let currentParent = { ...oldParent };

    // if no parent or if parent direction is not the same
    // as the split a new group must be created
    if (oldParent.direction !== direction) {
      // current pane being split
      const newParentId = getNextId(panes);
      panes.push(newParentId);

      if (isRoot) {
        rootId = newParentId;
      }
      // this pane becomes the current pane's parent
      // and a child of the old parent pane
      const newParent = currentParent = createPane({
        id: newParentId,
        isGroup: true,
        childIds: [ id ],
        parentId: oldParentId,
        splitRatio: splitRatio,
        direction
      });
      // set the new panes parent as the group pane above
      currentPane.parentId = newParentId;
      panesById[newParentId] = newParent;

      // update parent's child id's
      // to the new parent pane's id
      // we check for any property on
      // the parent because it can be an empty object
      if (oldParent.id) {
        const oldParentChildren = [ ...oldParent.childIds ];
        oldParentChildren[ oldParentChildren.indexOf(id) ] = newParentId;
        oldParent.childIds = oldParentChildren;
        panesById[oldParentId] = oldParent;
      }
    }

    // at this point current parent should always point to a pane
    const childIds = [ ...currentParent.childIds ];
    const currentPaneIndex = childIds.indexOf(id);

    const [ ratioA, ratioB ] = getSplitRatios(
      clientX,
      clientY,
      direction,
      offset,
      // has new parent ?
      currentParent.id === oldParentId,
      currentPane
    );
    currentPane.splitRatio = ratioA;
    const newPane = createPane({
      id: getNextId(panes),
      parentId: currentParent.id,
      splitRatio: ratioB
    });
    panes.push(newPane.id);

    //  insert new pane into children of current parent pane
    childIds.splice(currentPaneIndex + offset, 0, newPane.id);
    currentParent.childIds = childIds;

    const beforePaneId = offset ? currentPane.id : newPane.id;
    const afterPaneId = offset ? newPane.id : currentPane.id;
    const newDividerId = beforePaneId + 'n' + afterPaneId;
    panesById[currentParent.id] = currentParent;
    panesById[newPane.id] = newPane;
    panesById[currentPane.id] = currentPane;
    const dividerDown = {
      id: newDividerId,
      startX: clientX,
      startY: clientY
    };
    return {
      ...state,
      panes,
      rootId,
      panesById,
      dividerDown,
      cornerDown: undefined
    };
  },

  // check if pane is a group
  // check to make sure panes are next to each other
  // remove from parent
  // if parent only has one child
  //  - if parent is root, remove and make remaining child root
  //  - otherwise remove parent and attach child to grandparent
  [types.join]: (state, { payload: { retainId, removeId } }) => {
    const panesById = { ...state.panesById };
    const remove = panesById[removeId];
    const retain = { ...panesById[retainId] };
    const parent = panesById[retain.parentId];
    let rootId = state.rootId;
    if (remove.id === rootId) {
      // attempted to remove root pane
      return state;
    }
    if (remove.isGroup) {
      // cannot remove a parent
      return state;
    }
    if (areNotAdjacent(parent, remove, retain)) {
      // pane must be adjacent to join
      return state;
    }
    // splice pane out of parents childIds

    // grab siblings
    const childIds = [ ...parent.childIds ];
    // where does remove pane exist
    const index = childIds.indexOf(removeId);
    // create child array with just removed pane
    childIds.splice(index, 1);
    // update panesById with new parent
    panesById[parent.id] = {
      ...parent,
      childIds
    };

    // if parent now only has one child (the retain pane)
    // it is no longer a group and can be removed
    // and this retaining child moved up to it's grandparent
    if (childIds.length === 1) {
      const newRetain = {
        ...retain,
        direction: null
      };
      // group is the root pane. It can be removed and the remaining made
      // the new root
      if (parent.id === rootId) {
        rootId = retainId;
        newRetain.parentId = null;
      } else {
        // group is a child of a group
        // we can remove it and move the remaining to that super group
        const grandparentId = parent.parentId;
        const grandparent = { ...panesById[grandparentId] };
        const grandchildIds = [ ...grandparent.childIds ];
        const parentIndex = grandchildIds.indexOf(parent.id);

        grandchildIds[parentIndex] = newRetain.id;
        grandparent.childIds = grandchildIds;

        newRetain.parentId = grandparentId;
        panesById[grandparentId] = grandparent;
      }
      delete panesById[parent.id];
      panesById[newRetain.id] = newRetain;
    }
    delete panesById[removeId];

    const parentId = panesById[retainId].parentId;
    const splitRatio = parent.id === parentId ?
      remove.splitRatio + retain.splitRatio :
      parent.splitRatio;

    panesById[retainId].splitRatio = splitRatio;
    return {
      ...state,
      // possible new if parent was root and had one remaining child
      rootId,
      panesById
    };
  },

  [combineActions(types.dividerPressed, types.dividerReleased)]:
    (state, { payload }) => {
      return {
        ...state,
        dividerDown: payload
      };
    },

  [types.dividerMoved]: (state, { payload }) => {
    const { clientX, clientY } = payload;
    const minRatioChange = 20;
    const {
      panesById,
      dividers,
      dividerDown: {
        id: dividerId
      }
    } = state;
    const divider = dividers[dividerId];
    const { id: beforePaneId, parentId } = panesById[divider.beforePaneId];
    const { id: afterPaneId } = panesById[divider.afterPaneId];
    const {
      direction,
      height,
      top,
      left,
      width
    } = panesById[parentId];
    const right = left + width;
    const bottom = top + height;

    const parentSize = direction === splitTypes.horizontal ? height : width;
    const pos = direction === splitTypes.horizontal ? clientY : clientX;
    const max = direction === splitTypes.horizontal ? bottom : right;
    const min = direction === splitTypes.horizontal ? top : left;

    // if mouse pos is outside the parent then do nothing
    // we add a buffer here of minRatioChange
    if (
      max - pos < minRatioChange ||
      min + pos < minRatioChange
    ) {
      return state;
    }
    const splitRatio = (parentSize - pos) / parentSize;
    return {
      ...state,
      panesById: {
        ...panesById,
        [afterPaneId]: {
          ...panesById[afterPaneId],
          splitRatio
        },
        [beforePaneId]: {
          ...panesById[beforePaneId],
          splitRatio: 1 - splitRatio
        }
      }
    };
  },

  [types.windowResize]: (state, { payload: { width, height } }) => {
    return {
      ...state,
      width,
      height
    };
  },

  [combineActions(types.cornerPressed, types.cornerReleased)]:
    (state, { payload }) => {
      return {
        ...state,
        cornerDown: payload
      };
    },

  [combineActions(types.hoverOverCorner, types.blurCorner)]:
    (state, { payload }) => {
      return {
        ...state,
        cornerHover: payload
      };
    }

}, createInitialState());

export default function reducer(state, action) {
  const newState = _reducer(state, action);
  if (shouldNormalize(state, newState)) {
    return normalize(newState);
  }
  return newState;
}

reducer.toString = () => ns;
