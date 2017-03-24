import {
  createActions,
  handleActions
} from 'redux-actions';
import { createTypes } from 'redux-create-types';

import secondPass from '../helpers/secondPass';

export const ns = 'subdivide';

export const cardinals = {
  ne: 'NE',
  sw: 'SW',
  se: 'SE',
  nw: 'NW'
};

export const directions = {
  row: 'ROW',
  col: 'COL'
};

export const splitTypes = createTypes([
  'above',
  'below',
  'left',
  'right',
  'none'
], 'split');


export const joinTypes = createTypes([
  'right',
  'up',
  'left',
  'down'
], 'join');

export const types = createTypes([
  'JOIN',
  'SPLIT',

  'SET_STATE',
  'CORNER_DOWN',
  'ADD_CHILD_PANE',
  'REMOVE_CHILD_PANE',
  'REMOVE_PARENT_PANE',

  'SET_SPLIT_RATIO',
  'SET_SIZE',
  'SET_BLOCK',
  'SET_DIVIDER_DOWN',
  'SET_CORNER_DOWN',
  'SET_PANE_PROPS',
  'SET_CORNER_HOVER'
], ns);

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

function getSplitDirection(splitType) {
  if (
    splitType === splitTypes.above ||
    splitType === splitTypes.below
  ) {
    return directions.col;
  }
  if (
    splitType === splitTypes.left ||
    splitType === splitTypes.right
  ) {
    return directions.row;
  }
  return null;
}

export const {
  join,
  split,

  setPaneProps,
  setSplitRatio,

  setSize,
  setState,
  setBlock,

  setCornerHover,
  setCornerDown,

  setDividerDown
} = createActions(
  {
    [types.JOIN]: (retainId, removeId) => ({ retainId, removeId }),
    [types.SPLIT]: (id, splitType, startX, startY) => ({
      id,
      splitType,
      startX,
      startY
    }),

    [types.SET_PANE_PROPS]: (id, props) => ({ id, props }),
    [types.SET_SPLIT_RATIO]: (id, splitRatio) => ({ id, splitRatio }),
    [types.SET_SIZE]: (width, height) => ({ width, height })
  },
  types.SET_STATE,
  types.SET_BLOCK,
  types.SET_CORNER_HOVER,
  types.SET_CORNER_DOWN,
  types.SET_DIVIDER_DOWN
);

function getOffset(splitType) {
  if (
    splitType === splitTypes.above ||
    splitType === splitTypes.left
  ) {
    return 0;
  }
  if (
    splitType === splitTypes.below ||
    splitType === splitTypes.right
  ) {
    return 1;
  }
  return null;
}

function areNotAdjacent({ childIds }, { id: removeId }, { id: retainId }) {
  const removePos = childIds.indexOf(removeId);
  const retainPos = childIds.indexOf(retainId);
  return (
    removePos === -1 ||
    retainPos === -1 ||
    !(
      removePos + 1 === retainPos ||
      removePos - 1 === retainPos
    )
  );
}

function getNextId({ panes = [ 0 ] }) {
  const id = panes[ panes.length - 1 ];
  return id + 1;
}

function getRatio(
  startX,
  startY,
  offset,
  direction,
  hasNewParent,
  { width, height, left, top, splitRatio }
) {
  let ratio = direction === directions.row ?
    (startX - left) / width :
    (startY - top) / height;

  let ratioA = ratio = offset ? ratio : 1 - ratio;
  let ratioB = 1 - ratioA;

  if (hasNewParent) {
    ratioA *= splitRatio;
    ratioB *= splitRatio;
  }
  return [ ratioA, ratioB ];
}

export function downDividerSelector(state) {
  const { dividerDown } = state;
  if (!dividerDown) {
    return null;
  }
  return {
    ...state.dividers[dividerDown.id],
    ...dividerDown
  };
}

const firstPass = handleActions({
  // creates a new pane group, puts the existing and the newly created pane
  // as children of that group pane
  // so if we start with a 0 root pane and split it, we create a group
  // pane (id 1) make this the root pane, create a new pane, and finally attach
  // those two panes as children of the new root group pane
  // Split(0) => Group(1) < Children(0, 2)
  [types.SPLIT]: (state, { id, splitType, startX, startY }) => {
    const panes = [ ...state.panes ];
    const panesById = { ...state.panesById };
    const currentPane = { ...panesById[id] };
    const { parentID: oldParentId, splitRatio } = currentPane;
    let rootId = state.rootId;
    const isRoot = id === rootId;
    const oldParent = isRoot ? false : { ...panesById[oldParentId] };
    const direction = getSplitDirection(splitType);
    const currentParent = oldParent;

    // if no parent or if parent direction is not the same
    // as the split a new group must be created
    if (!oldParent || oldParent.direction !== direction) {
      // current pane being split
      const newParentId = getNextId(state);
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
      if (oldParent) {
        const oldParentChildren = [ ...oldParent.childIds ];
        oldParentChildren[ oldParentChildren.indexOf(id) ] = newParentId;
        oldParent.childIds = oldParentChildren;
      }
    }

    // at this point currentParent should always point to a pane
    const childIds = [ ...currentParent.childIds ];
    const currentPaneIndex = childIds.indexOf(id);

    const [ ratioA, ratioB ] = getRatio(
      startX,
      startY,
      direction,
      currentParent.id === oldParentId,
      currentPane
    );
    currentPane.splitRatio = ratioA;
    const newPane = createPane({
      id: getNextId(state),
      parentId: currentParent.id,
      splitRatio: ratioB
    });
    panes.push(newPane.id);

    const offset = getOffset(splitType);
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
      startX,
      startY
    };
    return {
      ...state,
      panes,
      rootId,
      panesById,
      dividerDown,
      cornerDown: null
    };
  },

  // check if pane is a group
  // check to make sure panes are next to each other
  // remove from parent
  // if parent only has one child
  //  - if parent is root, remove and make remaining child root
  //  - otherwise remove parent and attach child to grandparent
  [types.JOIN]: (state, { retainId, removeId }) => {
    const { panesById } = state;
    const remove = panesById[removeId];
    const retain = panesById[retainId];
    const parent = panesById[retain.parentId];
    let rootId = state.rootId;
    if (remove.isGroup) {
      console.warn('cannot replace group');
      return state;
    }
    if (areNotAdjacent(parent, remove, retain)) {
      console.warn('pane must be adjacent to join');
      return state;
    }
    if (!parent) {
      console.warn('attempted to remove root pane!');
      return state;
    }
    // splice pane out of parents childIds
    const newPanesById = { ...panesById };

    // grab siblings
    const childIds = [ ...parent.childIds ];
    // where does remove pane exist
    const index = childIds.indexOf(removeId);
    // create child array with just removed pane
    childIds.splice(index, 1);
    // update panesById with new parent
    newPanesById[parent.id] = {
      ...parent,
      childIds
    };

    // if parent now only has one child (the retain pane)
    // it is no longer a group and can be removed
    // and this retaining child moved up to it's grandparent
    if (childIds.size === 1) {
      const newRetain = {
        ...retain,
        direction: null
      };
      // group is the root pane. It can be removed and the remaining made
      // the new root
      if (parent.id === state.rootId) {
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

        newPanesById[grandparentId] = grandparent;
      }
      delete newPanesById[parent.id];
      newPanesById[newRetain.id] = newRetain;
    }
    delete newPanesById[removeId];

    const newParentId = newPanesById[retainId].parentId;
    const splitRatio = parent.id === newParentId ?
      remove.splitRatio + retain.splitRatio :
      parent.splitRatio;

    newPanesById[retainId] = {
      ...retain,
      splitRatio
    };
    return {
      ...state,
      // possible new if parent was root and had one remaining child
      rootId,
      panesById: newPanesById
    };
  },

  [types.SET_SPLIT_RATIO]: (state, { id, splitRatio }) => {
    const { panesById } = state;
    return {
      ...state,
      panesById: {
        ...panesById,
        [id]: {
          ...panesById[id],
          splitRatio
        }
      }
    };
  },

  [types.SET_SIZE]: (state, { width, height }) => {
    return {
      ...state,
      width,
      height
    };
  },

  [types.SET_CORNER_DOWN]: (state, { cornerDown }) => {
    return {
      ...state,
      cornerDown
    };
  },

  [types.SET_CORNER_HOVER]: (state, { cornerHover }) => {
    return {
      ...state,
      cornerHover
    };
  },

  [types.SET_DIVIDER_DOWN]: (state, { divider }) => {
    return {
      ...state,
      dividerDown: divider
    };
  },

  [types.SET_STATE]: (state, action) => {
    return action.state;
  },

  [types.SET_PANE_PROPS]: (state, { id, props }) => {
    const { panesById } = state;
    return {
      ...state,
      panesById: {
        ...panesById,
        [id]: {
          ...panesById[id],
          props
        }
      }
    };
  }
});

export default function reducer(state = createLayout(), action) {
  const newState = firstPass(state, action);
  if (newState === state) {
    return state;
  }
  return secondPass(state);
}

reducer.toString = () => ns;
