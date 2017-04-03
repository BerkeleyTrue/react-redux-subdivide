import { directions, splitTypes } from '../redux';

// getSplitDirection(direction: ...Directions) => ...SplitTypes|Void
export function getSplitDirection(direction) {
  if (
    direction === directions.up ||
    direction === directions.down
  ) {
    return splitTypes.horizontal;
  }
  if (
    direction === directions.left ||
    direction === directions.right
  ) {
    return splitTypes.vertical;
  }
  return null;
}

// getOffset(
//   direction: ...Directions
// ) => 0|1;
export function getOffset(direction) {
  if (
    direction === directions.down ||
    direction === directions.right
  ) {
    return 1;
  }
  return 0;
}


// areNotAdjacent(
//   parent: Pane,
//   remove: Pane,
//   retain: Pane
// ) => Boolean;
export function areNotAdjacent(
  { childIds },
  { id: removeId },
  { id: retainId }
) {
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

// getNextId(panes: [ ...Number]) => Number;
export function getNextId(panes = [ 0 ]) {
  const id = panes[ panes.length - 1 ];
  return id + 1;
}

// getSplitRatios(
//   startX: Number,
//   startY: Number,
//   offset: 0|1,
//   splitType: ...SplitTypes
//   hasNewParent: Boolean,
//   child: Pane
// ) => [ ratioA: Number, ratioB: Number ];
export function getSplitRatios(
  startX,
  startY,
  offset,
  splitType,
  hasNewParent,
  { width, height, left, top, splitRatio }
) {
  let ratio = splitType === splitTypes.horizontal ?
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

