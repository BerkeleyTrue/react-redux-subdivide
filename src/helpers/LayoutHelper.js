import {
  CHILD_ABOVE,
  CHILD_BELOW,
  CHILD_LEFT,
  CHILD_RIGHT,
  JOIN_RIGHT_ARROW,
  JOIN_UP_ARROW,
  JOIN_LEFT_ARROW,
  JOIN_DOWN_ARROW,
  ROW,
  COL,
  SW,
  NE
} from '../constants/BlenderLayoutConstants';

import {List} from 'immutable';
import {Pane} from '../reducers/LayoutReducer';

function getNextId(state) {
  return (
    state
      .get('panes')
      .map(pane => parseInt(pane.id))
      .max() + 1
  ) + '';
}

function wrapPane(state, id) {
  let pane = state.panes.get(id);
  let parent = state.panes.get(pane.parentId);
  let parentId = pane.parentId;
  let groupId = getNextId(state);
  let group = new Pane({
    id: groupId,
    isGroup: true,
    childIds: List([id]),
    parentId: pane.parentId,
    splitRatio: pane.splitRatio
  });
  pane = pane.set('parentId', groupId);
  state = state.setIn(['panes', id], pane);
  state = state.setIn(['panes', groupId], group);
  if (parent) {
    let childIds = parent.childIds;
    childIds = childIds.set(childIds.indexOf(id), groupId);
    state = state.setIn(['panes', parentId, 'childIds'], childIds);
  }
  return {state, group};
}

function getDirection(splitType) {
  if (splitType === CHILD_ABOVE || splitType === CHILD_BELOW) return COL;
  if (splitType === CHILD_LEFT || splitType === CHILD_RIGHT) return ROW;
}

function getOffset(splitType) {
  if (splitType === CHILD_ABOVE || splitType === CHILD_LEFT) return 0;
  if (splitType === CHILD_BELOW || splitType === CHILD_RIGHT) return 1;
}

export function split(state, {id, splitType, startX, startY}) {
  let pane = state.panes.get(id);
  let parent = state.panes.get(pane.parentId);
  let direction = getDirection(splitType);
  let isRoot = id === state.rootId;
  let flat1 = flatten(state, state.rootId,
     {width: state.width, height: state.height});
  let paneSize = flat1.paneMap[id];
  let oldParentId = pane.parentId;

  if (!parent || (parent.direction !== direction)) {
    let out = wrapPane(state, id);
    parent = out.group;
    parent = parent.set('direction', direction);
    state = out.state;
    if (isRoot) {
      state = state.set('rootId', parent.id);
    }
    pane = pane.set('splitRatio', 1);
  }
  let childIds = parent.childIds;
  let index = childIds.indexOf(id);
  let newPane = new Pane({
    id: getNextId(state),
    parentId: parent.get('id'),
    splitRatio: 0.2
  });
  let offset = getOffset(splitType);
  childIds = childIds.splice(index + offset, 0, newPane.id);
  let beforePaneId = offset ? pane.id : newPane.id;
  let afterPaneId = offset ? newPane.id : pane.id;
  let ratio = direction === ROW ?
    (startX - paneSize.left) / paneSize.width :
    (startY - paneSize.top) / paneSize.height;
  let ratioA = ratio = offset ? ratio : 1 - ratio;
  let ratioB = 1 - ratioA;
  if (newPane.parentId === oldParentId) {
    ratioA *= paneSize.splitRatio;
    ratioB *= paneSize.splitRatio;
  }
  parent = parent.set('childIds', childIds);
  state = state.setIn(['panes', parent.id], parent);
  state = state.setIn(['panes', newPane.id], newPane);
  state = state.setIn(['panes', pane.id, 'splitRatio'], ratioA);
  state = state.setIn(['panes', newPane.id, 'splitRatio'], ratioB);
  state = state.set('cornerDown', undefined);
  let newDividerId = beforePaneId + 'n' + afterPaneId;
  let flat = flatten(state, state.rootId,
     {width: state.width, height: state.height});
  let divider = flat = {...flat.dividerMap[newDividerId], startX, startY};
  state = state.set('dividerDown', divider);
  return state;
}

function removePane(state, id) {
  //splice pane out of parents childIds
  let pane = state.panes.get(id);
  let parent = state.panes.get(pane.parentId);
  if (!parent) return state;
  let childIds = parent.childIds;
  let index = childIds.indexOf(id);
  let panes = state.panes;
  childIds = childIds.splice(index, 1);
  parent = parent.set('childIds', childIds);
  panes = panes.set(parent.id, parent);
  if (childIds.size === 1) {
    let remainingPane = panes.get(childIds.get(0));
    if (parent.id === state.rootId) {
      state = state.set('rootId', remainingPane.id);
      remainingPane = remainingPane.set('parentId', undefined);
    } else {
      let grandparentId = parent.parentId;
      let grandparent = panes.get(grandparentId);
      let grandchildIds = grandparent.childIds;
      index = grandchildIds.indexOf(parent.id);
      grandchildIds = grandchildIds.set(index, remainingPane.id);
      grandparent = grandparent.set('childIds', grandchildIds);
      remainingPane = remainingPane.set('parentId', grandparentId);
      panes = panes.set(grandparent.id, grandparent);
    }
    panes = panes.delete(parent.id);
    remainingPane = remainingPane.set('direction', undefined);
    panes = panes.set(remainingPane.id, remainingPane);
  }
  panes = panes.delete(id);
  state = state.set('panes', panes);
  return state;
}

export function join(state, {retainId, removeId}) {
  let remove = state.panes.get(removeId);
  if (remove.isGroup) {
    console.warn('cannot replace group');
    return state;
  }
  let retain = state.panes.get(retainId);
  let parent = state.panes.get(retain.parentId);
  let siblings = parent.childIds;
  let pos = [retainId, removeId].map(id => siblings.indexOf(id));
  if (
    pos[1] === -1 ||
    pos[0] === -1 ||
    !(pos[0] + 1 === pos[1] || pos[0] - 1 === pos[1])
  ) {
    console.warn('pane must be adjacent to join');
    return state;
  }
  state = removePane(state, removeId);
  let nextParentId = state.getIn(['panes', retainId]).parentId;
  let splitRatio = parent.id === nextParentId ?
    remove.splitRatio + retain.splitRatio :
    parent.splitRatio;
  state = state.setIn(['panes', retain.id, 'splitRatio'], splitRatio);
  return state;
}

export function setSplitRatio(state, action) {
  const {splitRatio, id} = action;

  state = state.setIn(
    ['panes', id, 'splitRatio'],
    splitRatio
  );
  return state;
}

export function setSize(state, {width, height}) {
  return state.set('width', width).set('height', height);
}

export function setCornerDown(state, action) {
  return state
    .set('cornerDown', action.cornerDown);
}

export function setDividerDown(state, action) {
  return state
    .set('dividerDown', action.divider);
}

export function getJoinDirection({layout, pane}) {
  const {cornerDown} = layout;
  if (cornerDown === undefined) return false;
  const cornerDownId = layout.cornerDown.id;
  const cornerDownPane = layout.panes.get(cornerDownId);
  const parent = layout.panes.get(cornerDownPane.parentId);
  if (!parent) return false;
  const siblings = parent.childIds;
  const index = siblings.indexOf(cornerDownId);
  const beforeId = siblings.get(index - 1);
  const afterId = siblings.get(index + 1);
  const isBeforeGroup = beforeId !== undefined && layout.panes.get(beforeId).isGroup;
  const isAfterGroup = afterId !== undefined && layout.panes.get(afterId).isGroup;
  const canJoinBefore = beforeId === pane.id && !isBeforeGroup;
  const canJoinAfter = afterId === pane.id && !isAfterGroup;
  return (
    cornerDown.corner === NE && (
      (parent.direction === ROW && canJoinAfter && JOIN_RIGHT_ARROW) ||
      (parent.direction === COL && canJoinBefore && JOIN_UP_ARROW)
    )
  ) || (
    cornerDown.corner === SW && (
      (parent.direction === COL && canJoinAfter && JOIN_DOWN_ARROW) ||
      (parent.direction === ROW && canJoinBefore && JOIN_LEFT_ARROW)
    )
  );
}

export function flatten(state, rootId, {width, height, left = 0, top = 0}) {
  let rootPane = state.panes.get(rootId).toJS();
  let dividerMap = {};
  let paneMap = {};

  const {cellSpacing, touchMargin, borderSize} = state;
  const dividerSize = cellSpacing + (touchMargin * 2);

  rootPane.width = width;
  rootPane.height = height;
  rootPane.left = left;
  rootPane.top = top;
  rootPane.depth = 0;

  if (!rootPane.isGroup) {
    paneMap[rootId] = rootPane;
  }

  let flattenChildren = (parent) => {
    let x = parent.left;
    let y = parent.top;
    let child;
    let spacingOffset;
    let hasDivider = false;
    let beforePaneId;
    let divider;
    let beforeRatio;

    parent.childIds.forEach((childId, i) => {
      let pane = state.panes.get(childId);
      let {cornerDown} = state;
      child = pane.toJS();
      child.depth = parent.depth + 1;
      child.canSplit = cornerDown && cornerDown.id === childId;
      child.joinDirection = getJoinDirection({layout: state, pane});

      hasDivider = i !== 0;
      spacingOffset = 0;
      if (hasDivider) {
        spacingOffset = cellSpacing;
        divider = {
          depth: child.depth,
          borderSize: borderSize,
          touchMargin: touchMargin,
          left: x,
          top: y,
          beforePaneId: beforePaneId,
          afterPaneId: child.id,
          beforeRatio: beforeRatio,
          afterRatio: child.splitRatio,
          direction: parent.direction,
          parentSize: parent.direction === ROW ? parent.width : parent.height,
          id: beforePaneId + 'n' + child.id
        };
      }

      if (parent.direction === ROW) {
        if (hasDivider) {
          divider.left = x - touchMargin;
          divider.width = dividerSize;
          divider.height = parent.height;
          x += cellSpacing;
          dividerMap[beforePaneId + 'n' + child.id] = divider;
        }
        child.width = parent.width * child.splitRatio - spacingOffset;
        child.height = parent.height;
        child.left = x;
        child.top = y;
        x += child.width;
      } else if (parent.direction === COL) {
        if (hasDivider) {
          divider.top = y - touchMargin;
          divider.width = parent.width;
          divider.height = dividerSize;
          y += cellSpacing;
          dividerMap[beforePaneId + 'n' + child.id] = divider;
        }
        child.width = parent.width;
        child.height = parent.height * child.splitRatio - spacingOffset;
        child.left = x;
        child.top = y;
        y += child.height;
      }
      beforePaneId = child.id;
      beforeRatio = child.splitRatio;
      if (child.isGroup) {
        flattenChildren(child);
      } else {
        paneMap[childId] = child;
      }
    });
  };

  flattenChildren(rootPane);

  return {dividerMap, paneMap};
}




export function isJoinPossible({layout, pane}) {
  const {cornerDown} = layout;
  if (cornerDown === undefined) return false;
  const cornerDownId = layout.cornerDown.id;
  const cornerDownPane = layout.panes.get(cornerDownId);
  const parent = layout.panes.get(cornerDownPane.parentId);
  if (!parent) return false;
  const siblings = parent.childIds;
  const index = siblings.indexOf(cornerDownId);
  const beforeId = siblings.get(index - 1);
  const afterId = siblings.get(index + 1);
  const isBeforeGroup = beforeId !== undefined && layout.panes.get(beforeId).isGroup;
  const isAfterGroup = afterId !== undefined && layout.panes.get(afterId).isGroup;
  const canJoinBefore = beforeId === pane.id && !isBeforeGroup;
  const canJoinAfter = afterId === pane.id && !isAfterGroup;
  return (
    cornerDown.corner === NE && (
      (parent.direction === ROW && canJoinAfter) ||
      (parent.direction === COL && canJoinBefore)
    )
  ) || (
    cornerDown.corner === SW && (
      (parent.direction === COL && canJoinAfter) ||
      (parent.direction === ROW && canJoinBefore)
    )
  );
}