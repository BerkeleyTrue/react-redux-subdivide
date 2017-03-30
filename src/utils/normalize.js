import {
  corners,
  directions,
  splitTypes
} from '../redux';


export function shouldNormalize(state = {}, newState) {
  return newState !== state && (
    newState.panesById !== state.panesById ||
    newState.height !== state.height ||
    newState.width !== state.width
  );
}

function getJoinDirection(
  panesById,
 { paneId, corner } = {},
  child
) {
  if (!paneId && paneId !== 0) {
    return null;
  }
  const cornerDownPane = panesById[paneId];
  const parent = panesById[cornerDownPane.parentId];
  if (!parent) {
    return null;
  }
  const siblings = parent.childIds;
  const direction = parent.direction;
  const index = siblings.indexOf(paneId);

  const beforeId = index < 1 ? null : siblings[index - 1];
  const afterId = siblings[index + 1];

  const isBeforeGroup = panesById[beforeId] ?
    panesById[beforeId].isGroup :
    null;
  const isAfterGroup = panesById[afterId] ?
    panesById[afterId].isGroup :
    null;

  const canJoinBefore = beforeId === child.id && !isBeforeGroup;
  const canJoinAfter = afterId === child.id && !isAfterGroup;

  if (corner === corners.ne) {
    if (direction === splitTypes.vertical && canJoinBefore) {
      return directions.up;
    }
    if (direction === splitTypes.horizontal && canJoinAfter ) {
      return directions.right;
    }
  }

  if (corner === corners.sw) {
    if (direction === splitTypes.vertical && canJoinAfter) {
      return directions.down;
    }
    if (direction === splitTypes.horizontal && canJoinBefore) {
      return directions.left;
    }
  }

  if (corner === corners.nw) {
    if (direction === splitTypes.vertical && canJoinBefore) {
      return directions.up;
    }
    if (direction === splitTypes.horizontal && canJoinBefore) {
      return directions.left;
    }
  }
  if (corner === corners.se) {
    if (direction === splitTypes.vertical && canJoinAfter) {
      return directions.down;
    }
    if (direction === splitTypes.horizontal && canJoinAfter) {
      return directions.right;
    }
  }
  return null;
}

// will add appropriate dimensions to panes and add dividers when needed
export default function normalize(state) {
  const { rootId, width, height, cellSpacing, cornerDown } = state;
  const panesById = { ...state.panesById };
  let dividers = {};
  const left = 0;
  const top = 0;
  const rootPane = panesById[rootId] = {
    ...panesById[rootId],
    width,
    height,
    top,
    left,
    canSplit: cornerDown && cornerDown.id === rootId
  };


  function dimensionChildren(parent) {
    let x = parent.left;
    let y = parent.top;
    let spacingOffset;
    let hasDivider = false;
    let beforePaneId;
    let divider;
    let beforeRatio;

    parent.childIds.forEach((childId, i) => {
      const child = { ...panesById[childId] };
      let canSplit = cornerDown && cornerDown.paneId === childId;
      let joinDirection = getJoinDirection(panesById, cornerDown, child);

      child.canSplit = canSplit;
      child.joinDirection = joinDirection;

      hasDivider = i !== 0;
      spacingOffset = 0;
      if (hasDivider) {
        spacingOffset = cellSpacing;
        divider = {
          id: beforePaneId + 'n' + child.id,
          left: x,
          top: y,
          beforePaneId,
          afterPaneId: child.id,
          beforeRatio,
          afterRatio: child.splitRatio,
          direction: parent.direction,
          parentSize: parent.direction === splitTypes.horizontal ?
            parent.width :
            parent.height
        };
        dividers[divider.id] = divider;
      }
      let width, height, left, top;

      if (parent.direction === splitTypes.horizontal) {
        if (hasDivider) {
          divider.width = cellSpacing;
          divider.height = parent.height;
          x += cellSpacing;
        }
        width = parent.width * child.splitRatio - spacingOffset;
        height = parent.height;
        left = x;
        top = y;
        x += child.width;
      } else {
        if (hasDivider) {
          divider.width = parent.width;
          divider.height = cellSpacing;
          y += cellSpacing;
        }
        width = parent.width;
        height = parent.height * child.splitRatio - spacingOffset;
        left = x;
        top = y;
        y += child.height;
      }
      child.width = width;
      child.height = height;
      child.left = left;
      child.top = top;

      beforePaneId = child.id;
      beforeRatio = child.splitRatio;
      panesById[childId] = child;
      if (child.isGroup) {
        dimensionChildren(child);
      }
    });
  }
  dimensionChildren(rootPane);
  return {
    ...state,
    panesById,
    dividers
  };
}


